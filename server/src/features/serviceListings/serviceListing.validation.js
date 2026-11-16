import { z } from "zod";
import {
  AVAILABILITY_OPTIONS,
  EXPERIENCE_LEVELS,
  SERVICE_CATEGORIES,
  SERVICE_LIMITS as LIMIT,
  SERVICE_STATUS,
} from "./serviceListing.constants.js";

/**
 * Drafts preserve incomplete input (including a half-typed portfolio URL/rate).
 * Activating a service requires a complete and valid offer. The UI repeats these
 * business rules to give immediate feedback; the API is the authority.
 */
const text = (max, label) =>
  z.string().trim().max(max, `${label} is too long — maximum ${max} characters.`);

const textList = (maxItems, maxChars, label) =>
  z.array(z.string().trim().min(1, `${label} cannot be empty.`).max(maxChars, `${label} is too long.`))
    .max(maxItems, `You can add up to ${maxItems} ${label.toLowerCase()}s.`);

/** Compatible with "PKR 10,000 per video", "Negotiable" and ordinary HTTPS URLs. */
export function isValidPortfolioUrl(value) {
  try {
    const parsed = new URL(value);
    return ["http:", "https:"].includes(parsed.protocol) && Boolean(parsed.hostname) && !parsed.username && !parsed.password;
  } catch { return false; }
}

/** Only reject clearly non-positive *amounts*, not text like "Negotiable" or a price range. */
export function invalidRateMessage(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return null;
  // Negative amounts: -500 / PKR -500 / Rs. -500 / $-500.
  if (/^(?:(?:PKR|RS\.?|USD|EUR|GBP)\s*)?(?:[$€£]\s*)?-\s*\d/i.test(trimmed)) {
    return "Rate cannot be negative. Enter a positive amount or 'Negotiable'.";
  }
  // Zero-only amount, with optional currency (not "0 to 5000" or "0-5000").
  if (/^(?:(?:PKR|RS\.?|USD|EUR|GBP)\s*)?(?:[$€£]\s*)?0+(?:\.0+)?(?:\s*(?:per\s+\w+|\/\s*\w+))?$/i.test(trimmed)) {
    return "Rate must be greater than zero, or enter 'Negotiable'.";
  }
  return null;
}

const serviceFields = z.object({
  status: z.enum([SERVICE_STATUS.DRAFT, SERVICE_STATUS.ACTIVE]),
  wizardStep: z.number().int().min(0).max(2).optional(),
  name: text(LIMIT.name, "Service name"),
  category: z.enum(SERVICE_CATEGORIES, { error: "Choose a valid category." }).nullable(),
  customCategory: text(LIMIT.customCategory, "Category"),
  description: text(LIMIT.description, "Description"),
  keywords: textList(LIMIT.keywords, LIMIT.keyword, "Keyword"),
  targetMarket: textList(LIMIT.targetMarkets, LIMIT.targetMarket, "Target market"),
  experience: z.enum([...EXPERIENCE_LEVELS, ""], { error: "Choose a valid experience level." }),
  portfolioLink: text(LIMIT.portfolioLink, "Portfolio link"),
  rate: text(LIMIT.rate, "Rate"),
  availability: z.enum([...AVAILABILITY_OPTIONS, ""], { error: "Choose a valid availability." }),
  locations: textList(LIMIT.locations, LIMIT.location, "Location"),
  languages: text(LIMIT.languages, "Languages"),
}).strict();

function checkServiceRules(service, ctx) {
  const fail = (field, message) => ctx.addIssue({ code: "custom", path: [field], message });
  const isActive = service.status === SERVICE_STATUS.ACTIVE;

  for (const field of ["keywords", "targetMarket", "locations"]) {
    const items = service[field] || [];
    if (new Set(items.map((s) => s.trim().toLocaleLowerCase("en"))).size !== items.length) {
      fail(field, `Remove duplicate ${field === "targetMarket" ? "target markets" : field}.`);
    }
  }

  if (!isActive) return; // Incomplete values belong in an autosaved draft.

  if (!service.name || service.name.length < 2) fail("name", "Enter a service name (2+ characters).");
  if (!service.category) fail("category", "Choose a category.");
  if (!service.description) fail("description", "Describe your service.");
  if (!service.keywords?.length) fail("keywords", "Add at least one keyword.");
  if (service.category === "other" && !service.customCategory) {
    fail("customCategory", "Tell us what kind of service this is.");
  }
  if (service.portfolioLink && !isValidPortfolioUrl(service.portfolioLink)) {
    fail("portfolioLink", "Enter a valid URL starting with https:// or http://");
  }
  const rateError = invalidRateMessage(service.rate);
  if (rateError) fail("rate", rateError);
}

// The UI always sends the entire wizard; optional fields can be absent from older callers.
export const serviceListingSchema = serviceFields.partial()
  .extend({ status: serviceFields.shape.status, name: serviceFields.shape.name.optional() })
  .superRefine(checkServiceRules);

export const createServiceSchema = serviceListingSchema;
export const updateServiceSchema = serviceListingSchema;

export const statusBodySchema = z.object({
  status: z.enum([SERVICE_STATUS.ACTIVE, SERVICE_STATUS.PAUSED], { error: "Status must be active or paused." }),
}).strict();

export const idParamsSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, "Invalid service id."),
});

export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
