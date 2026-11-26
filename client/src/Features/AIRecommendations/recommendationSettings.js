/**
 * Shared configuration for the business user's AI Recommendations feature.
 * Keep model labels and recommendation section names in one place.
 */

export const AI_RECOMMENDATION_MODELS = Object.freeze([
  {
    id: "fast",
    name: "Gemini Flash",
    provider: "Google Gemini",
    label: "AI-powered recommendations",
    description: "Generate a practical go-to-market plan using your campaign details and relevant published case studies.",
    benefits: [
      "Uses your campaign information",
      "References relevant published case studies",
      "Returns structured recommendations for review",
    ],
    typicalTime: "Usually under 25 seconds",
    speedScore: 5,
    detailScore: 4,
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

export function formatRecommendationChannel(value) {
  const name = value?.trim();
  if (name?.toLowerCase() === "email") return "Email";
  if (name?.toLowerCase() === "instagram") return "Instagram";
  return name;
}
