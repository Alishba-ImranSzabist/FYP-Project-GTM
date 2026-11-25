export const RECOMMENDATION_MODELS = Object.freeze({
  fast: {
    key: "fast",
    provider: "gemini",
    label: "Gemini Flash",
  },
});

export const RECOMMENDATION_STYLES = Object.freeze([
  "conservative",
  "balanced",
  "creative",
]);

export const RECOMMENDATION_STATUS = Object.freeze({
  PENDING: "pending",
  DRAFT: "draft",
  APPROVED: "approved",
  REJECTED: "rejected",
});

export const EXAMPLE_REVIEW_STATUS = Object.freeze({
  PENDING: "pending_admin_review",
  APPROVED: "approved",
  REJECTED: "rejected",
});

export const MAX_RECOMMENDATION_SECTIONS = 12;

export const DEFAULT_RECOMMENDATION_SECTIONS = Object.freeze([
  {
    id: "audience",
    title: "Target Audience Recommendation",
    prompt: "Identify the most relevant primary, secondary and optional growth audiences. Explain their needs, fit with the campaign, and why each segment is relevant. Treat any fit score as a relative planning indicator, not a predicted conversion probability.",
    enabled: true,
    order: 0,
  },
  {
    id: "channels",
    title: "Marketing Channel Recommendation",
    prompt: "Recommend suitable marketing channels and explain each channel's purpose, formats, priority and reason for selection. Consider the campaign's objective, target market, audience and available channels.",
    enabled: true,
    order: 1,
  },
  {
    id: "budget",
    title: "Budget Allocation Recommendation",
    prompt: "Recommend a cautious total budget range in the campaign currency and allocate the midpoint across relevant activities. Percentages should total 100. Clearly state assumptions and do not present estimates as market quotations or guaranteed returns.",
    enabled: true,
    order: 2,
  },
  {
    id: "content",
    title: "Content Strategy Recommendation",
    prompt: "Recommend practical content pillars, formats, hooks and goals aligned with the product, audience and campaign objective.",
    enabled: true,
    order: 3,
  },
  {
    id: "leadSignals",
    title: "Lead Discovery Signals & Keywords",
    prompt: "Suggest relevant search keywords and observable public signals that may indicate need or buying intent. Include privacy, relevance and verification guardrails.",
    enabled: true,
    order: 4,
  },
  {
    id: "schedule",
    title: "Posting Time & Campaign Duration",
    prompt: "Suggest a test duration, posting windows and a phased weekly plan. Clearly label timing as a hypothesis unless supported by account analytics or approved evidence.",
    enabled: true,
    order: 5,
  },
]);

export const DEFAULT_CONFIG_KEY = "default";

