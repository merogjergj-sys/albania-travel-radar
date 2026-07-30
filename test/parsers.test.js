import test from "node:test";
import assert from "node:assert/strict";
import { parsePosts, toCsv } from "../src/parsers.js";

test("parses a Reddit listing response", () => {
  const posts = parsePosts({
    data: {
      children: [
        {
          data: {
            id: "abc123",
            title: "Albania itinerary",
            selftext: "Where should I go?",
            author: "traveller",
            subreddit: "travel",
            permalink: "/r/travel/comments/abc123/example/",
            created_utc: 1785369600
          }
        }
      ]
    }
  });

  assert.equal(posts.length, 1);
  assert.equal(posts[0].id, "abc123");
  assert.equal(posts[0].community, "travel");
  assert.equal(
    posts[0].url,
    "https://www.reddit.com/r/travel/comments/abc123/example/"
  );
});

test("accepts a posts wrapper", () => {
  const posts = parsePosts({ posts: [{ title: "Hello" }] });
  assert.deepEqual(posts[0].title, "Hello");
});

test("rejects unsupported input", () => {
  assert.throws(() => parsePosts({ hello: "world" }), /Unsupported input/);
});

test("escapes commas and quotes in CSV output", () => {
  const csv = toCsv([
    {
      score: 50,
      tier: "warm",
      title: 'Tirana, "yes or no?"',
      reasons: ["travel intent"]
    }
  ]);

  assert.match(csv, /"Tirana, ""yes or no\?"""/);
});
