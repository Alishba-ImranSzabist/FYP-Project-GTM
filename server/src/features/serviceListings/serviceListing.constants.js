/**
 * Single source of truth for service-listing options and limits (server side).
 * The client keeps a matching copy in client/src/Features/ServiceListings/serviceListingConfig.js,
 * so when you change a value here, change it there too.
 */

export const SERVICE_STATUS = Object.freeze({
  DRAFT: "draft", // saved but incomplete — AI matching is off
  ACTIVE: "active", // complete — the AI finds opportunities for it
  PAUSED: "paused", // was active, matching switched off by the provider
});

// To add a category: add it here AND in the client serviceListingConfig.js.
export const SERVICE_CATEGORIES = Object.freeze([
  "video_editing",
  "acting",
  "pr_publicity",
  "collaboration",
  "photography",
  "other",
]);

export const EXPERIENCE_LEVELS = Object.freeze(["under_1", "1_2", "3_5", "5_plus"]);

export const AVAILABILITY_OPTIONS = Object.freeze(["full_time", "part_time", "weekends", "project_based"]);

export const SERVICE_LIMITS = Object.freeze({
  name: 120,
  customCategory: 60,
  description: 2000,
  keyword: 60,
  keywords: 20,
  targetMarket: 60, // length of ONE target-market entry (e.g. "Influencers")
  targetMarkets: 10, // how many entries a service can list
  portfolioLink: 500,
  rate: 120,
  location: 60, // length of ONE location (a city, or "Remote")
  locations: 10, // how many locations a service can list
  languages: 150,
});
