#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import process from "node:process";
import { parsePosts, toCsv } from "./parsers.js";
import { searchReddit } from "./reddit.js";
import { rankPosts } from "./scoring.js";

const HELP = `
Albania Travel Radar

Usage:
  travel-radar scan <file> [--threshold 35] [--format table|json|csv] [--output path]
  travel-radar fetch [--query text] [--limit 50] [--time month] [--threshold 35]

Examples:
  npm run scan
  node src/cli.js scan examples/sample-posts.json --format csv --output results/leads.csv
  node src/cli.js fetch --query "Albania travel" --limit 25
`.trim();

function parseArgs(argv) {
  const [command, input, ...rest] = argv;
  const options = {};

  for (let index = 0; index < rest.length; index += 1) {
    const token = rest[index];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const value = rest[index + 1]?.startsWith("--") ? true : rest[++index] ?? true;
    options[key] = value;
  }

  return { command, input, options };
}

function formatTable(posts) {
  if (!posts.length) return "No posts met the threshold.";

  return posts
    .map((post, index) => {
      const title = post.title.length > 78 ? `${post.title.slice(0, 75)}...` : post.title;
      return [
        `${index + 1}. [${String(post.score).padStart(3)}] ${post.tier.toUpperCase()} | ${title}`,
        `   ${post.community ? `r/${post.community} | ` : ""}${post.url || "No URL"}`,
        `   Why: ${post.reasons.join(", ")}`
      ].join("\n");
    })
    .join("\n\n");
}

function serialize(posts, format) {
  if (format === "json") return `${JSON.stringify(posts, null, 2)}\n`;
  if (format === "csv") return `${toCsv(posts)}\n`;
  return `${formatTable(posts)}\n`;
}

async function run() {
  const { command, input, options } = parseArgs(process.argv.slice(2));

  if (!command || command === "help" || command === "--help" || command === "-h") {
    console.log(HELP);
    return;
  }

  let raw;
  if (command === "scan") {
    if (!input) throw new Error("The scan command needs a JSON file path.");
    raw = JSON.parse(await readFile(input, "utf8"));
  } else if (command === "fetch") {
    const fetchOptions = { ...options };
    if (input && !options.query) fetchOptions.query = input;
    raw = await searchReddit(fetchOptions);
  } else {
    throw new Error(`Unknown command: ${command}\n\n${HELP}`);
  }

  const posts = parsePosts(raw);
  const ranked = rankPosts(posts, {
    threshold: Number(options.threshold ?? 35)
  });
  const output = serialize(ranked, options.format ?? "table");

  if (options.output) {
    await writeFile(options.output, output, "utf8");
    console.log(`Wrote ${ranked.length} ranked posts to ${options.output}`);
  } else {
    process.stdout.write(output);
  }
}

run().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
});
