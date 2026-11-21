/**
 * Shared configuration for the business user's AI Recommendations feature.
 * Keep model labels and recommendation section names in one place.
 */

export const AI_RECOMMENDATION_MODELS = Object.freeze([
  {
    id: "fast",
    name: "Fast",
    provider: "Google · Gemini 3.8 Flash",
    label: "Good for a first look",
    description: "A quick overview of the audience, budget and channel opportunities.",
    benefits: [
      "Ready in a few seconds",
      "Good for a first look at audience and budget",
      "Shorter reasoning on strategy",
    ],
    typicalTime: "~ 5 seconds",
    speedScore: 5,
    detailScore: 2,
  },
  {
    id: "detailed",
    name: "Detailed",
    provider: "Anthropic · Claude Sonnet 5",
    label: "More thorough",
    description: "Deeper reasoning across the audience, budget, channels and campaign plan.",
    benefits: [
      "Takes a little longer",
      "Deeper reasoning on audience, budget and channels",
      "Best when the decision matters",
    ],
    typicalTime: "~ 25 seconds",
    speedScore: 3,
    detailScore: 5,
  },
]);


export const AI_RECOMMENDATION_STYLES = Object.freeze([
  {
    id: "conservative",
    label: "Conservative",
    description: "Practical, cautious and evidence-focused strategies.",
  },
  {
    id: "balanced",
    label: "Balanced",
    description: "Practical strategies with creative marketing ideas.",
  },
  {
    id: "creative",
    label: "Creative",
    description: "Innovative campaigns and fresh marketing approaches.",
  },
]);

export const DEFAULT_RECOMMENDATION_STYLE = "balanced";

export const AI_RECOMMENDATION_SECTIONS = Object.freeze([
  { id: "audience", number: "01", title: "Target Audience Recommendation" },
  { id: "channels", number: "02", title: "Marketing Channel Recommendation" },
  { id: "budget", number: "03", title: "Budget Allocation Recommendation" },
  { id: "content", number: "04", title: "Content Strategy Recommendation" },
  { id: "leadSignals", number: "05", title: "Lead Discovery Signals & Keywords" },
  { id: "schedule", number: "06", title: "Posting Time & Campaign Duration" },
]);

export const AI_RECOMMENDATION_LIMITS = Object.freeze({
  campaignsPerRequest: 50,
  maxKeywordLength: 80,
  maxKeywords: 30,
});

/**
 * Frontend-only phase: true uses clearly labelled sample data so the UI can be
 * tested before the AI backend endpoint and MongoDB model are implemented.
 * Set to false when POST /api/ai-recommendations is available.
 */
export const AI_RECOMMENDATIONS_DEMO_MODE = false;
