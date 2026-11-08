import { CAMPAIGN_LIMITS as L, STEPS } from "./campaignConfig";

/**
 * Pure form logic (no React): empty values, API <-> form conversion and validation.
 *
 * The server is the source of truth for validation (length limits, enum values, launch rules).
 * This file only repeats the quick checks that give instant feedback:
 *   - draft  (strict = false): blocks a bad name, budget or date order. A draft may be incomplete.
 *   - launch (strict = true):  also requires every field a campaign needs to run.
 * Text length is already limited by `maxLength` on the inputs, so it is not re-checked here.
 * Anything the server still rejects is shown through normalizeErrors / firstStepWithError below.
 */

export const EMPTY_VALUES = Object.freeze({
  name: "",
  objective: "",
  productName: "",
  industry: "",
  description: "",
  targetLocations: [],
  audienceType: "",
  keywords: [],
  audience: "",
  interests: "",
  extraNotes: "",
  budget: "", // kept as text while typing, converted to a number in toPayload
  budgetAiSuggested: false,
  startDate: "", // "YYYY-MM-DD"
  endDate: "",
  channels: [],
});

/* ---------- API -> form ---------- */

/** Form values for a saved campaign (edit) or a brand-new one (campaign = null). */
export function fromCampaign(campaign, businessProfile) {
  if (!campaign) {
    // New campaign: pre-fill the industry from the business profile.
    return { ...EMPTY_VALUES, industry: businessProfile?.industry || "" };
  }
  return {
    name: campaign.name || "",
    objective: campaign.objective || "",
    productName: campaign.productName || "",
    industry: campaign.industry || "",
    description: campaign.description || "",
    targetLocations: [...(campaign.targetLocations || [])],
    audienceType: campaign.audienceType || "",
    keywords: [...(campaign.keywords || [])],
    audience: campaign.audience || "",
    interests: campaign.interests || "",
    extraNotes: campaign.extraNotes || "",
    budget: campaign.budget == null ? "" : String(campaign.budget),
    budgetAiSuggested: Boolean(campaign.budgetAiSuggested),
    startDate: campaign.startDate ? campaign.startDate.slice(0, 10) : "",
    endDate: campaign.endDate ? campaign.endDate.slice(0, 10) : "",
    channels: [...(campaign.channels || [])],
  };
}

/* ---------- form -> API ---------- */

/** Body for POST / PATCH /api/campaigns. `status` is "draft" or "active". Always the whole form. */
export function toPayload(values, status) {
  const payload = {
    status,
    name: values.name.trim(),
    productName: values.productName.trim(),
    industry: values.industry.trim(),
    description: values.description.trim(),
    targetLocations: values.targetLocations,
    keywords: values.keywords,
    audience: values.audience.trim(),
    interests: values.interests.trim(),
    extraNotes: values.extraNotes.trim(),
    budget: values.budgetAiSuggested || values.budget === "" ? null : Number(values.budget),
    budgetAiSuggested: values.budgetAiSuggested,
    startDate: values.startDate || null,
    endDate: values.endDate || null,
    channels: values.channels,
  };
  // Choice fields are left out until the user picks one (the API rejects empty strings).
  if (values.objective) payload.objective = values.objective;
  if (values.audienceType) payload.audienceType = values.audienceType;
  return payload;
}

/* ---------- Validation ---------- */

const isBlank = (value) => (Array.isArray(value) ? value.length === 0 : !String(value ?? "").trim());

/** Fields that must be filled in to launch. Same messages as the server (campaign.validation.js). */
const REQUIRED_TO_LAUNCH = {
  objective: "Choose your main objective.",
  productName: "Tell us which product or offer this is for.",
  targetLocations: "Add at least one target location.",
  audienceType: "Choose who you sell to.",
  keywords: "Add at least one keyword.",
  startDate: "Choose a start date.",
  endDate: "Choose an end date.",
  channels: "Choose at least one channel.",
};

/** Checks that apply to drafts too: (values) => error message or undefined. */
const VALUE_CHECKS = {
  name: (v) => (v.name.trim().length < 2 ? "Enter a campaign name (2+ characters)." : undefined),

  budget: (v) => {
    if (v.budgetAiSuggested || v.budget === "") return undefined; // optional
    const amount = Number(v.budget);
    if (!Number.isFinite(amount) || amount <= 0) return "Enter a budget greater than 0.";
    if (amount > L.budgetMax) return "That budget is too large.";
    return undefined;
  },

  endDate: (v) =>
    v.startDate && v.endDate && v.endDate < v.startDate // "YYYY-MM-DD" strings compare correctly
      ? "End date must be on or after the start date."
      : undefined,
};

function validateFields(fields, values, strict) {
  const errors = {};
  for (const field of fields) {
    const required = strict && isBlank(values[field]) ? REQUIRED_TO_LAUNCH[field] : undefined;
    const message = required || VALUE_CHECKS[field]?.(values);
    if (message) errors[field] = message;
  }
  return errors;
}

const ALL_FIELDS = STEPS.flatMap((step) => step.fields);

/** "Next" button: the current step must be complete. */
export const validateStep = (stepId, values) =>
  validateFields(STEPS.find((s) => s.id === stepId).fields, values, true);

/** "Save as draft": only blocks invalid values. */
export const validateDraft = (values) => validateFields(ALL_FIELDS, values, false);

/** "Launch": everything is required. */
export const validateLaunch = (values) => validateFields(ALL_FIELDS, values, true);

/* ---------- Error helpers ---------- */

/** Server keys like "targetLocations.0" -> "targetLocations". */
export const normalizeErrors = (raw = {}) =>
  Object.fromEntries(Object.entries(raw).map(([key, message]) => [key.split(".")[0], message]));

/** Index of the earliest wizard step that contains an error (null when none). */
export function firstStepWithError(errors) {
  const indexes = Object.keys(errors)
    .map((field) => STEPS.findIndex((step) => step.fields.includes(field)))
    .filter((index) => index >= 0);
  return indexes.length ? Math.min(...indexes) : null;
}