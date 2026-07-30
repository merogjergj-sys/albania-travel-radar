export const DEFAULT_THRESHOLD = 35;

export const LOCATION_TERMS = {
  albania: 18,
  tirana: 18,
  berat: 16,
  gjirokaster: 16,
  shkoder: 16,
  shkodra: 16,
  saranda: 16,
  sarande: 16,
  ksamil: 16,
  himara: 16,
  himare: 16,
  theth: 16,
  valbona: 16,
  vlore: 16,
  vlora: 16,
  durres: 16,
  dhermi: 16,
  korca: 16,
  korce: 16,
  riviera: 8
};

export const INTENT_TERMS = {
  "planning a trip": 24,
  "planning to visit": 24,
  "coming to": 20,
  "traveling to": 20,
  "travelling to": 20,
  "visiting": 16,
  "itinerary": 18,
  "where should i": 17,
  "where to stay": 17,
  "what to do": 15,
  "recommend": 12,
  "tour guide": 24,
  "local guide": 24,
  "walking tour": 20,
  "book a tour": 24,
  "things to do": 15,
  "first time": 12,
  "solo trip": 14,
  "road trip": 12
};

export const URGENCY_TERMS = {
  today: 13,
  tomorrow: 15,
  "this week": 13,
  "next week": 11,
  "this weekend": 13,
  "next month": 8,
  august: 5,
  september: 5,
  october: 5,
  november: 5,
  december: 5
};

export const NEGATIVE_TERMS = {
  "school project": -24,
  homework: -24,
  "moving permanently": -12,
  "news article": -14,
  politics: -10,
  "historical question": -8,
  "already returned": -20,
  "trip report": -16
};

export const EXPLANATIONS = {
  location: "mentions an Albania destination",
  intent: "shows active travel-planning intent",
  urgency: "contains a near-term timing signal",
  question: "asks a question that locals can answer",
  negative: "contains a lower-intent signal",
  freshness: "was posted recently"
};
