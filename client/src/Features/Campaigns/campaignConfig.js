/**
 * Everything that describes the campaign feature in ONE place: option lists, limits,
 * wizard steps and status look. Pages and components read from here, so adding an
 * objective / channel or renaming a step means editing this file only.
 *
 * Keep the values in sync with the server: server/src/features/campaigns/campaign.constants.js
 */

export const CURRENCY = "PKR";

export const CAMPAIGN_LIMITS = Object.freeze({
  name: 120,
  productName: 200,
  industry: 120,
  description: 2000,
  location: 60,
  locations: 10,
  keyword: 60,
  keywords: 20,
  audience: 150,
  interests: 300,
  extraNotes: 1000,
  budgetMax: 1_000_000_000,
});

/* ---------- Choices (value is what the API stores, label is what people read) ---------- */
export const OBJECTIVE_OPTIONS = Object.freeze([
  { value: "brand_awareness", label: "Brand awareness" },
  { value: "generate_leads", label: "Generate leads" },
  { value: "drive_sales", label: "Drive sales" },
  { value: "launch_product", label: "Launch a product" },
]);

export const AUDIENCE_OPTIONS = Object.freeze([
  { value: "b2c", label: "Consumers (B2C)" },
  { value: "b2b", label: "Businesses (B2B)" },
  { value: "both", label: "Both" },
  { value: "customers", label: "Customers" },
]);

export const CHANNEL_OPTIONS = Object.freeze([
  { value: "email", label: "Email outreach" },
  { value: "instagram", label: "Instagram posts" },
]);

/** "generate_leads" -> "Generate leads" (empty string when unknown). */
export const labelOf = (options, value) => options.find((o) => o.value === value)?.label ?? "";

/* ---------- Status badges + list tabs ---------- */
export const STATUS_META = Object.freeze({
  draft: { label: "Draft", tone: "sun" }, // tone -> class pnl-tag--<tone>
  active: { label: "Active", tone: "green" },
  completed: { label: "Completed", tone: "blue" },
});

export const FILTER_TABS = Object.freeze([
  { key: "all", label: "All" },
  { key: "draft", label: "Draft" },
  { key: "active", label: "Active" },
  { key: "completed", label: "Completed" },
]);

/* ---------- Wizard steps ----------
 * `fields` = the form fields that belong to the step. They drive per-step validation
 * and "jump to the step that has the error". The Review step has no fields of its own.
 */
export const STEPS = Object.freeze([
  {
    id: "details",
    label: "Campaign details",
    title: "Campaign basics",
    intro: "Start with the basics. You can review everything before anything is sent.",
    fields: ["name", "objective", "productName", "industry", "description"],
  },
  {
    id: "audience",
    label: "Audience & market",
    title: "Audience & market",
    intro: "Who should this campaign reach? Only the essentials, the AI can work out the rest.",
    fields: ["targetLocations", "audienceType", "keywords", "audience", "interests", "extraNotes"],
  },
  {
    id: "budget",
    label: "Budget & timing",
    title: "Budget & timing",
    intro: "Not sure about budget? Let the AI suggest a range.",
    fields: ["budget", "budgetAiSuggested", "startDate", "endDate", "channels"],
  },
  {
    id: "review",
    label: "Review",
    title: "Review your campaign",
    intro: "Check everything. Use Edit to fix a section.",
    fields: [],
  },
]);
