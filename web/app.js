import { parsePosts, toCsv } from "../src/parsers.js";
import { rankPosts } from "../src/scoring.js";

const input = document.querySelector("#json-input");
const fileInput = document.querySelector("#file-input");
const threshold = document.querySelector("#threshold");
const thresholdValue = document.querySelector("#threshold-value");
const status = document.querySelector("#status");
const resultsSection = document.querySelector("#results-section");
const results = document.querySelector("#results");
const summary = document.querySelector("#summary");
const scanButton = document.querySelector("#scan-button");
const sampleButton = document.querySelector("#load-sample");
const downloadButton = document.querySelector("#download-button");

let lastResults = [];

function escapeHtml(value) {
  const node = document.createElement("span");
  node.textContent = String(value ?? "");
  return node.innerHTML;
}

function renderSummary(posts) {
  const hot = posts.filter((post) => post.tier === "hot").length;
  const warm = posts.filter((post) => post.tier === "warm").length;

  summary.innerHTML = [
    ["Signals found", posts.length],
    ["Hot intent", hot],
    ["Warm intent", warm]
  ]
    .map(
      ([label, value]) =>
        `<div class="summary-card"><strong>${value}</strong><span>${label}</span></div>`
    )
    .join("");
}

function renderResults(posts) {
  if (!posts.length) {
    results.innerHTML = `
      <div class="empty-state">
        No conversations cleared this threshold. Lower the score or try another export.
      </div>
    `;
    return;
  }

  results.innerHTML = posts
    .map((post) => {
      const title = escapeHtml(post.title || "Untitled post");
      const url = escapeHtml(post.url || "#");
      const community = post.community ? `r/${escapeHtml(post.community)}` : "public post";
      const date = post.createdAt
        ? new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(post.createdAt))
        : "date unknown";
      const reasons = post.reasons
        .map((reason) => `<li>${escapeHtml(reason)}</li>`)
        .join("");

      return `
        <article class="result-card" data-tier="${post.tier}">
          <div class="score" aria-label="Intent score ${post.score}">${post.score}</div>
          <div>
            <div class="result-meta">
              <span>${escapeHtml(post.tier)} intent</span>
              <span>${community}</span>
              <span>${date}</span>
            </div>
            <h3>
              <a href="${url}" target="_blank" rel="noreferrer">${title}</a>
            </h3>
            <ul class="reason-list">${reasons}</ul>
          </div>
        </article>
      `;
    })
    .join("");
}

function scan() {
  try {
    status.textContent = "";
    const data = JSON.parse(input.value);
    const posts = parsePosts(data);
    lastResults = rankPosts(posts, { threshold: Number(threshold.value) });
    renderSummary(lastResults);
    renderResults(lastResults);
    resultsSection.hidden = false;
    resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    status.textContent = error instanceof SyntaxError
      ? "That does not look like valid JSON yet."
      : error.message;
  }
}

threshold.addEventListener("input", () => {
  thresholdValue.value = threshold.value;
});

scanButton.addEventListener("click", scan);

sampleButton.addEventListener("click", async () => {
  status.textContent = "Loading sample…";
  try {
    const response = await fetch("../examples/sample-posts.json");
    if (!response.ok) throw new Error("Sample data could not be loaded.");
    const data = await response.json();
    input.value = JSON.stringify(data, null, 2);
    status.textContent = "Sample ready.";
  } catch (error) {
    status.textContent = error.message;
  }
});

fileInput.addEventListener("change", async () => {
  const [file] = fileInput.files;
  if (!file) return;
  input.value = await file.text();
  status.textContent = `${file.name} loaded.`;
});

downloadButton.addEventListener("click", () => {
  if (!lastResults.length) return;
  const blob = new Blob([toCsv(lastResults)], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "albania-travel-radar-results.csv";
  link.click();
  URL.revokeObjectURL(link.href);
});
