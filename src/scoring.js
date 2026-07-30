import {
  DEFAULT_THRESHOLD,
  EXPLANATIONS,
  INTENT_TERMS,
  LOCATION_TERMS,
  NEGATIVE_TERMS,
  URGENCY_TERMS
} from "./config.js";

const DAY_MS = 24 * 60 * 60 * 1000;

function normalize(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function findMatches(text, terms) {
  return Object.entries(terms)
    .filter(([term]) => text.includes(normalize(term)))
    .map(([term, points]) => ({ term, points }));
}

function capCategory(matches, cap) {
  return Math.min(
    cap,
    matches.reduce((sum, match) => sum + match.points, 0)
  );
}

function freshnessPoints(createdAt, now) {
  if (!createdAt) return 0;
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return 0;

  const ageInDays = Math.max(0, (now.getTime() - date.getTime()) / DAY_MS);
  if (ageInDays <= 1) return 10;
  if (ageInDays <= 3) return 7;
  if (ageInDays <= 7) return 4;
  if (ageInDays <= 30) return 1;
  return 0;
}

export function scorePost(post, options = {}) {
  const now = options.now ? new Date(options.now) : new Date();
  const text = normalize([post.title, post.body, post.selftext].filter(Boolean).join(" "));

  const locations = findMatches(text, LOCATION_TERMS);
  const intents = findMatches(text, INTENT_TERMS);
  const urgency = findMatches(text, URGENCY_TERMS);
  const negatives = findMatches(text, NEGATIVE_TERMS);
  const isQuestion = text.includes("?") || /^(where|what|how|which|can|is|are|do)\b/.test(text);
  const freshness = freshnessPoints(post.createdAt, now);

  const breakdown = {
    location: capCategory(locations, 28),
    intent: capCategory(intents, 40),
    urgency: capCategory(urgency, 15),
    question: isQuestion ? 7 : 0,
    freshness,
    negative: Math.max(
      -35,
      negatives.reduce((sum, match) => sum + match.points, 0)
    )
  };

  const rawScore = Object.values(breakdown).reduce((sum, points) => sum + points, 0);
  const score = Math.max(0, Math.min(100, rawScore));
  const reasons = [];

  if (breakdown.location) reasons.push(EXPLANATIONS.location);
  if (breakdown.intent) reasons.push(EXPLANATIONS.intent);
  if (breakdown.urgency) reasons.push(EXPLANATIONS.urgency);
  if (breakdown.question) reasons.push(EXPLANATIONS.question);
  if (breakdown.freshness) reasons.push(EXPLANATIONS.freshness);
  if (breakdown.negative) reasons.push(EXPLANATIONS.negative);

  return {
    ...post,
    score,
    tier: score >= 70 ? "hot" : score >= 45 ? "warm" : score >= 25 ? "watch" : "low",
    reasons,
    matches: {
      locations: locations.map(({ term }) => term),
      intents: intents.map(({ term }) => term),
      urgency: urgency.map(({ term }) => term),
      negatives: negatives.map(({ term }) => term)
    },
    breakdown
  };
}

export function rankPosts(posts, options = {}) {
  const threshold = Number(options.threshold ?? DEFAULT_THRESHOLD);
  return posts
    .map((post) => scorePost(post, options))
    .filter((post) => post.score >= threshold)
    .sort((a, b) => b.score - a.score || new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0));
}

export { normalize };
