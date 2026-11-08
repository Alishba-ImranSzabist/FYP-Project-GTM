import { STEPS } from "./serviceListingConfig";

/**
 * Pure form logic (no React): empty values, API <-> form conversion and validation.
 *
 * The server is the source of truth (server/src/features/serviceListings/serviceListing.validation.js).
 * This file only repeats the quick checks that give instant feedback:
 *   - draft  (strict = false): blocks a bad name or link. A draft may be incomplete.
 *   - active (strict = true):  also requires the fields AI matching needs.
 * Text length is limited by `maxLength` on the inputs, so it is not re-checked here.
 */

export const EMPTY_VALUES = Object.freeze({
  name: "",
  category: "",
  customCategory: "",
  description: "",
  keywords: [],
  targetMarket: [],
  experience: "",
  portfolioLink: "",
  rate: "",
  availability: "",
  locations: [],
  languages: "",
});

/* ---------- API -> form ---------- */

/** Form values for a saved service (edit) or a brand-new one (service = null). */
export function fromService(service, { portfolioLink = "" } = {}) {
  // New service: pre-fill the portfolio link from the provider profile.
  if (!service) return { ...EMPTY_VALUES, portfolioLink };
  return {
    name: service.name || "",
    category: service.category || "",
    customCategory: service.customCategory || "",
    description: service.description || "",
    keywords: [...(service.keywords || [])],
    targetMarket: [...(service.targetMarket || [])],
    experience: service.experience || "",
    portfolioLink: service.portfolioLink || "",
    rate: service.rate || "",
    availability: service.availability || "",
    locations: [...(service.locations || [])],
    languages: service.languages || "",
  };
}

/* ---------- form -> API ---------- */

/** Body for POST / PATCH /api/service-listings. `status` is "draft" or "active". Always the whole form. */
export function toPayload(values, status) {
  const payload = {
    status,
    name: values.name.trim(),
    customCategory: values.category === "other" ? values.customCategory.trim() : "",
    description: values.description.trim(),
    keywords: values.keywords,
    targetMarket: values.targetMarket,
    experience: values.experience, // "" is allowed: it clears the choice
    portfolioLink: values.portfolioLink.trim(),
    rate: values.rate.trim(),
    availability: values.availability,
    locations: values.locations,
    languages: values.languages.trim(),
  };
  // The category is left out until the user picks one (the API rejects an empty string).
  if (values.category) payload.category = values.category;
  return payload;
}

/* ---------- Validation ---------- */

const isBlank = (value) => (Array.isArray(value) ? value.length === 0 : !String(value ?? "").trim());

/** Fields that must be filled in for AI matching. Same messages as the server. */
const REQUIRED_TO_ACTIVATE = {
  category: "Choose a category.",
  description: "Describe your service.",
  keywords: "Add at least one keyword.",
  customCategory: "Tell us what kind of service this is.",
};

/** Checks that apply to drafts too: (values) => error message or undefined. */
const VALUE_CHECKS = {
  name: (v) => (v.name.trim().length < 2 ? "Enter a service name (2+ characters)." : undefined),
  portfolioLink: (v) =>
    v.portfolioLink.trim() && !/^https?:\/\/\S+$/i.test(v.portfolioLink.trim())
      ? "Enter a full link starting with http:// or https://"
      : undefined,
};

function validateFields(fields, values, strict) {
  const errors = {};
  for (const field of fields) {
    // "customCategory" is only needed when the category is "Other".
    const needed = field !== "customCategory" || values.category === "other";
    const required = strict && needed && isBlank(values[field]) ? REQUIRED_TO_ACTIVATE[field] : undefined;
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

/** "Save & find AI matches": everything required. */
export const validateActivate = (values) => validateFields(ALL_FIELDS, values, true);

/* ---------- Error helpers ---------- */

/** Server keys like "keywords.0" -> "keywords". */
export const normalizeErrors = (raw = {}) =>
  Object.fromEntries(Object.entries(raw).map(([key, message]) => [key.split(".")[0], message]));

/** Index of the earliest wizard step that contains an error (null when none). */
export function firstStepWithError(errors) {
  const indexes = Object.keys(errors)
    .map((field) => STEPS.findIndex((step) => step.fields.includes(field)))
    .filter((index) => index >= 0);
  return indexes.length ? Math.min(...indexes) : null;
}
