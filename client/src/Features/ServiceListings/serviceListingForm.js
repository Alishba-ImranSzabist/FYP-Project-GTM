import {
  AVAILABILITY_OPTIONS,
  CATEGORY_OPTIONS,
  EXPERIENCE_OPTIONS,
  SERVICE_LIMITS as L,
  STEPS,
} from "./serviceListingConfig";

/** Pure, dependency-free form rules. API validation is enforced separately on the server. */
export const EMPTY_VALUES = Object.freeze({
  name: "", category: "", customCategory: "", description: "", keywords: [],
  targetMarket: [], experience: "", portfolioLink: "", rate: "",
  availability: "", locations: [], languages: "",
});

export function fromService(service, { portfolioLink = "" } = {}) {
  if (!service) return { ...EMPTY_VALUES, portfolioLink };
  return {
    name: service.name || "", category: service.category || "",
    customCategory: service.customCategory || "", description: service.description || "",
    keywords: [...(service.keywords || [])], targetMarket: [...(service.targetMarket || [])],
    experience: service.experience || "", portfolioLink: service.portfolioLink || "",
    rate: service.rate || "", availability: service.availability || "",
    locations: [...(service.locations || [])], languages: service.languages || "",
  };
}

/** Existing API shape, plus wizardStep to restore the same step after login. */
export function toPayload(values, status, wizardStep = 0) {
  return {
    status,
    wizardStep,
    name: String(values.name || "").trim(),
    category: values.category || null,
    customCategory: values.category === "other" ? values.customCategory.trim() : "",
    description: values.description.trim(),
    keywords: values.keywords.map((v) => v.trim()),
    targetMarket: values.targetMarket.map((v) => v.trim()),
    experience: values.experience || "",
    portfolioLink: values.portfolioLink.trim(),
    rate: values.rate.trim(),
    availability: values.availability || "",
    locations: values.locations.map((v) => v.trim()),
    languages: values.languages.trim(),
  };
}

const enumValues = (options) => options.map((option) => option.value);
const isBlank = (v) => (Array.isArray(v) ? !v.length : !String(v ?? "").trim());

const validUrl = (input) => {
  try {
    const value = new URL(input);
    return ["https:", "http:"].includes(value.protocol) && Boolean(value.hostname) && !value.username && !value.password;
  } catch { return false; }
};

export function rateError(value) {
  const str = String(value || "").trim();
  if (!str) return undefined;
  if (/^(?:(?:PKR|RS\.?|USD|EUR|GBP)\s*)?(?:[$€£]\s*)?-\s*\d/i.test(str)) {
    return "Rate cannot be negative. Enter a positive amount or 'Negotiable'.";
  }
  if (/^(?:(?:PKR|RS\.?|USD|EUR|GBP)\s*)?(?:[$€£]\s*)?0+(?:\.0+)?(?:\s*(?:per\s+\w+|\/\s*\w+))?$/i.test(str)) {
    return "Rate must be greater than zero, or enter 'Negotiable'.";
  }
  return undefined;
}

function listError(list, maxItems, maxChars, label) {
  if (!Array.isArray(list)) return `${label} must be a list.`;
  if (list.length > maxItems) return `You can add up to ${maxItems} ${label.toLowerCase()}s.`;
  if (list.some((s) => !String(s || "").trim())) return `${label} cannot be empty.`;
  if (list.some((s) => String(s).length > maxChars)) return `${label} is too long — maximum ${maxChars} characters.`;
  if (new Set(list.map((s) => s.trim().toLocaleLowerCase("en"))).size !== list.length) {
    return `Remove duplicate ${label.toLowerCase()}s.`;
  }
  return undefined;
}

const fieldCheck = {
  name: (v, strict) =>
    (strict || !isBlank(v.name)) && v.name.trim().length < 2 ? "Enter a service name (2+ characters)." : undefined,
  category: (v, strict) =>
    strict && !v.category ? "Choose a category." : v.category && !enumValues(CATEGORY_OPTIONS).includes(v.category)
      ? "Choose a valid category." : undefined,
  customCategory: (v, strict) =>
    v.category === "other" && strict && !v.customCategory.trim()
      ? "Tell us what kind of service this is." : undefined,
  description: (v, strict) => strict && !v.description.trim() ? "Describe your service." : undefined,
  keywords: (v, strict) => strict && !v.keywords.length ? "Add at least one keyword." : undefined,
  experience: (v) => v.experience && !enumValues(EXPERIENCE_OPTIONS).includes(v.experience)
    ? "Choose a valid experience level." : undefined,
  availability: (v) => v.availability && !enumValues(AVAILABILITY_OPTIONS).includes(v.availability)
    ? "Choose a valid availability." : undefined,
  portfolioLink: (v) => v.portfolioLink.trim() && !validUrl(v.portfolioLink.trim())
    ? "Enter a valid URL starting with https:// or http://" : undefined,
  rate: (v) => rateError(v.rate),
};

const maxChars = {
  name: L.name, customCategory: L.customCategory, description: L.description,
  portfolioLink: L.portfolioLink, rate: L.rate, languages: L.languages,
};

/** Mode: draft permits an incomplete/invalid *in-progress* portfolio/rate; active requires correct values. */
function validateFields(fields, values, mode) {
  const errors = {};
  for (const field of fields) {
    let error;
    if (Object.hasOwn(maxChars, field) && String(values[field] || "").length > maxChars[field]) {
      error = `Maximum ${maxChars[field]} characters allowed.`;
    }
    if (!error && field === "keywords") error = listError(values.keywords, L.keywords, L.keyword, "Keyword");
    if (!error && field === "targetMarket") error = listError(values.targetMarket, L.targetMarkets, L.targetMarket, "Target market");
    if (!error && field === "locations") error = listError(values.locations, L.locations, L.location, "Location");
    if (!error && (mode !== "draft" || !["name", "portfolioLink", "rate"].includes(field))) {
      error = fieldCheck[field]?.(values, mode === "active");
    }
    if (!error && mode === "active" && !["category", "name", "description", "keywords", "customCategory"].includes(field)) {
      // All detail fields are optional; if filled, the validity checks above apply.
    }
    if (error) errors[field] = error;
  }
  return errors;
}

const ALL_FIELDS = STEPS.flatMap((step) => step.fields);

/** Input-time checks show feedback immediately, even when an incomplete draft is autosaved. */
export const validateChanged = (field, values) => validateFields([field], values, "live");
export const validateStep = (stepId, values) =>
  validateFields(STEPS.find((step) => step.id === stepId)?.fields || [], values, "active");
export const validateActivate = (values) => validateFields(ALL_FIELDS, values, "active");
export const validateDraft = (values) => validateFields(ALL_FIELDS, values, "draft");

export const normalizeErrors = (raw = {}) =>
  Object.fromEntries(Object.entries(raw).map(([key, message]) => [key.split(".")[0], message]));

export function firstStepWithError(errors) {
  const indexes = Object.keys(errors)
    .map((field) => STEPS.findIndex((step) => step.fields.includes(field)))
    .filter((index) => index >= 0);
  return indexes.length ? Math.min(...indexes) : null;
}
