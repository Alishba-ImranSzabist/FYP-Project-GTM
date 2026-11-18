import {
  Plug,
  Cpu,
  FileText,
  SlidersHorizontal,
  Activity,
} from "lucide-react";

/**
 * One source of truth for the Admin AI Model Management feature.
 * Keep labels, routes and model defaults here instead of scattering them
 * across page components.
 */
export const AI_MODEL_MANAGEMENT_OPTIONS = Object.freeze([
  {
    id: "providers",
    title: "AI Provider Configuration",
    description: "Connect Google Gemini and Anthropic, manage API credentials, endpoints and request quotas.",
    detail: "Provider credentials and connection settings",
    icon: Plug,
    routeKey: "aiProviderConfiguration",
    number: "01",
  },
  {
    id: "models",
    title: "AI Model Configuration",
    description: "Assign Gemini Flash to Fast and Claude Sonnet to Detailed, then tune model behaviour.",
    detail: "Fast and Detailed model profiles",
    icon: Cpu,
    routeKey: "aiModelConfiguration",
    number: "02",
  },
  {
    id: "recommendations",
    title: "AI Recommendation Configuration",
    description: "Add, remove and enable recommendation sections, and manage output quality rules.",
    detail: "Recommendation sections and output rules",
    icon: SlidersHorizontal,
    routeKey: "aiRecommendationConfiguration",
    number: "03",
  },
  {
    id: "prompts",
    title: "AI Prompt Configuration",
    description: "Maintain the global system prompt and a matching prompt template for every recommendation section.",
    detail: "System instructions and recommendation prompts",
    icon: FileText,
    routeKey: "aiPromptConfiguration",
    number: "04",
  },
  {
    id: "usage",
    title: "AI Usage & Logs",
    description: "See which users use AI, which model they use and how many requests and tokens they consume.",
    detail: "User-level AI usage summary",
    icon: Activity,
    routeKey: "aiUsageLogs",
    number: "05",
  },
]);

export const AI_PROVIDER_OPTIONS = Object.freeze([
  { value: "google", label: "Google Gemini" },
  { value: "anthropic", label: "Anthropic Claude" },
]);

export const AI_PROVIDER_PRESETS = Object.freeze({
  google: {
    label: "Google Gemini",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/models",
    modelId: "gemini-2.5-flash",
  },
  anthropic: {
    label: "Anthropic Claude",
    baseUrl: "https://api.anthropic.com/v1",
    modelId: "claude-3-5-sonnet",
  },
});

export const DEFAULT_MODEL_SETTINGS = Object.freeze({
  fast: {
    provider: "google",
    modelId: "gemini-2.5-flash",
    temperature: "0.3",
    maxTokens: "1000",
    timeoutSeconds: "60",
    enabled: true,
  },
  detailed: {
    provider: "anthropic",
    modelId: "claude-3-5-sonnet",
    temperature: "0.3",
    maxTokens: "4000",
    timeoutSeconds: "120",
    enabled: true,
  },
  retryAttempts: "3",
  fallbackModel: "fast",
});

export const RECOMMENDATION_OUTPUTS = Object.freeze([
  {
    id: "targetAudience",
    title: "Target Audience Recommendation",
    description: "Audience segments, location, demographics, interests and relevant needs.",
  },
  {
    id: "marketingChannels",
    title: "Marketing Channel Recommendation",
    description: "Suitable platforms, channel priorities and reasons for each channel.",
  },
  {
    id: "budgetAllocation",
    title: "Budget Allocation Recommendation",
    description: "Suggested budget range and channel-wise/activity-wise allocation.",
  },
  {
    id: "contentStrategy",
    title: "Content Strategy Recommendation",
    description: "Content pillars, formats, hooks, messaging and calls to action.",
  },
  {
    id: "leadDiscovery",
    title: "Lead Discovery Signals & Keywords",
    description: "Search phrases, intent signals, keywords and discovery criteria for Apify.",
  },
  {
    id: "postingSchedule",
    title: "Posting Time & Campaign Duration",
    description: "Suggested posting windows, campaign length and weekly activity plan.",
  },
]);

export const MAX_RECOMMENDATION_SECTIONS = 12;

export const DEFAULT_RECOMMENDATION_SETTINGS = Object.freeze({
  sections: RECOMMENDATION_OUTPUTS.map((section) => ({ ...section })),
  enabledSections: {
    targetAudience: true,
    marketingChannels: true,
    budgetAllocation: true,
    contentStrategy: true,
    leadDiscovery: true,
    postingSchedule: true,
  },
  minimumConfidence: "70",
  maxAudienceSegments: "5",
  maxChannels: "4",
  maxKeywords: "20",
  includeReasoning: true,
  includeAssumptions: true,
  requireEvidenceNotes: true,
});
