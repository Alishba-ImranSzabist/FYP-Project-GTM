/**
 * Everything that describes the Service Setup feature in ONE place: option lists, limits,
 * wizard steps and status look. Pages and components read from here, so adding a
 * category or renaming a step means editing this file only.
 *
 * Keep the values in sync with the server: server/src/features/serviceListings/serviceListing.constants.js
 */

export const SERVICE_LIMITS = Object.freeze({
  name: 120,
  customCategory: 60,
  description: 2000,
  keyword: 60,
  keywords: 20,
  targetMarket: 60, // length of ONE target-market entry
  targetMarkets: 10, // how many entries a service can list
  portfolioLink: 500,
  rate: 120,
  location: 60, // length of ONE location
  locations: 10, // how many locations a service can list
  languages: 150,
});

/* ---------- Choices (value is what the API stores, label is what people read) ---------- */
export const CATEGORY_OPTIONS = Object.freeze([
  { value: "video_editing", label: "Video editing" },
  { value: "acting", label: "Acting" },
  { value: "pr_publicity", label: "PR and publicity" },
  { value: "collaboration", label: "Collaboration" },
  { value: "photography", label: "Photography" },
  { value: "other", label: "+ Other" },
]);

export const EXPERIENCE_OPTIONS = Object.freeze([
  { value: "under_1", label: "Less than 1 year" },
  { value: "1_2", label: "1–2 years" },
  { value: "3_5", label: "3–5 years" },
  { value: "5_plus", label: "5+ years" },
]);

export const AVAILABILITY_OPTIONS = Object.freeze([
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part-time" },
  { value: "weekends", label: "Weekends only" },
  { value: "project_based", label: "Project-based" },
]);

/** "video_editing" -> "Video editing" (empty string when unknown). */
export const labelOf = (options, value) => options.find((o) => o.value === value)?.label ?? "";

/* ---------- Status badges ---------- */
export const STATUS_META = Object.freeze({
  draft: { label: "Draft", tone: "sun" }, // tone -> class pnl-tag--<tone>
  active: { label: "Active", tone: "green" },
  paused: { label: "Paused", tone: "grey" }, // pnl-tag--grey is defined in ServiceListings.css
});

/* ---------- Wizard steps ----------
 * `fields` = the form fields that belong to the step. They drive per-step validation
 * and "jump to the step that has the error". The Review step has no fields of its own.
 */
export const STEPS = Object.freeze([
  {
    id: "offer",
    label: "What you offer",
    title: "What do you offer?",
    intro: "Anyone who needs this service can reach you. No need to pick who you work with.",
    fields: ["name", "category", "customCategory", "description", "keywords", "targetMarket"],
  },
  {
    id: "details",
    label: "Details & terms",
    title: "Details & terms",
    intro: "All optional. Experience, rate and location help the AI suggest a better pitch.",
    fields: ["experience", "portfolioLink", "rate", "availability", "locations", "languages"],
  },
  {
    id: "review",
    label: "Review",
    title: "Review your service",
    intro: "Check everything. Use Edit to fix a section.",
    fields: [],
  },
]);
