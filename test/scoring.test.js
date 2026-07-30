import test from "node:test";
import assert from "node:assert/strict";
import { normalize, rankPosts, scorePost } from "../src/scoring.js";

const NOW = "2026-07-30T12:00:00.000Z";

test("normalizes casing, accents, and whitespace", () => {
  assert.equal(normalize("  TIRANË \n Travel  "), "tirane travel");
});

test("scores a near-term Albania travel question as hot intent", () => {
  const result = scorePost(
    {
      title: "Coming to Tirana next week. Which local guide should I book?",
      body: "This is my first time in Albania.",
      createdAt: "2026-07-29T12:00:00.000Z"
    },
    { now: NOW }
  );

  assert.equal(result.tier, "hot");
  assert.ok(result.score >= 70);
  assert.ok(result.matches.locations.includes("tirana"));
  assert.ok(result.matches.intents.includes("local guide"));
  assert.ok(result.reasons.includes("asks a question that locals can answer"));
});

test("down-ranks low-intent school research", () => {
  const result = scorePost(
    {
      title: "Historical question about Albania",
      body: "This is for a school project about politics.",
      createdAt: "2026-07-29T12:00:00.000Z"
    },
    { now: NOW }
  );

  assert.ok(result.score < 25);
  assert.equal(result.tier, "low");
  assert.ok(result.breakdown.negative < 0);
});

test("ranks high-intent posts first and applies the threshold", () => {
  const posts = [
    {
      title: "Photos from my old Albania trip",
      body: "Already returned.",
      createdAt: "2025-01-01T00:00:00.000Z"
    },
    {
      title: "Planning a trip to Berat next week, what should I do?",
      body: "First time visiting Albania.",
      createdAt: "2026-07-30T06:00:00.000Z"
    }
  ];

  const ranked = rankPosts(posts, { threshold: 35, now: NOW });
  assert.equal(ranked.length, 1);
  assert.match(ranked[0].title, /Berat/);
});

test("caps scores at 100", () => {
  const result = scorePost(
    {
      title: "Planning a trip to Albania, Tirana, Berat and Gjirokaster tomorrow?",
      body: "First time solo trip. Where to stay, what to do, and which local guide to book?",
      createdAt: NOW
    },
    { now: NOW }
  );

  assert.equal(result.score, 100);
});
