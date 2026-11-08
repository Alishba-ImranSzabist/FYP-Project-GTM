import { z } from "zod";
import {
  AVAILABILITY_OPTIONS,
  EXPERIENCE_LEVELS,
  SERVICE_CATEGORIES,
  SERVICE_LIMITS as LIMIT,
  SERVICE_STATUS,
} from "./serviceListing.constants.js";

/**
 * ALL service validation lives in this file:
 *   1. shape + length checks  ("is this value allowed?")
 *   2. activation rules       ("is the service complete enough for AI matching?")
 *
 * The wizard always sends the whole form, so the request body is the final service.
 * (The client repeats the activation rules in Features/ServiceListings/serviceListingForm.js.)
 */

const text = (max, label) => z.string().trim().max(max, `${label} is too long — max ${max} characters.`);

const URL_RE = /^https?:\/\/\S+$/i;

/** Fields that must be filled in before a service can be ACTIVE. Drafts may leave them empty. */
const REQUIRED_TO_ACTIVATE = {
  category: "Choose a category.",
  description: "Describe your service.",
  keywords: "Add at least one keyword.",
};

const isBlank = (value) =>
  value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0);

/** Cross-field rules: run once the shape below is valid. */
function checkServiceRules(service, ctx) {
  const fail = (field, message) => ctx.addIssue({ code: "custom", path: [field], message });

  if (service.portfolioLink && !URL_RE.test(service.portfolioLink)) {
    fail("portfolioLink", "Enter a full link starting with http:// or https://");
  }

  if (service.status === SERVICE_STATUS.DRAFT) return;

  for (const [field, message] of Object.entries(REQUIRED_TO_ACTIVATE)) {
    if (isBlank(service[field])) fail(field, message);
  }
  if (service.category === "other" && isBlank(service.customCategory)) {
    fail("customCategory", "Tell us what kind of service this is.");
  }
}

const serviceFields = z
  .object({
    // The wizard may only ask for draft or active. "paused" has its own endpoint.
    status: z.enum([SERVICE_STATUS.DRAFT, SERVICE_STATUS.ACTIVE], { error: "Status must be draft or active." }),

    // Step 1
    name: z
      .string({ error: "Enter a service name." })
      .trim()
      .min(2, "Enter a service name (2+ characters).")
      .max(LIMIT.name, `Service name is too long — max ${LIMIT.name} characters.`),
    category: z.enum(SERVICE_CATEGORIES, { error: "Choose a valid category." }),
    customCategory: text(LIMIT.customCategory, "Category"),
    description: text(LIMIT.description, "Description"),
    keywords: z
      .array(
        z
          .string()
          .trim()
          .min(1, "Keyword cannot be empty.")
          .max(LIMIT.keyword, `Keyword is too long — max ${LIMIT.keyword} characters.`)
      )
      .max(LIMIT.keywords, `You can add up to ${LIMIT.keywords} keywords.`),
    targetMarket: z
      .array(
        z
          .string()
          .trim()
          .min(1, "Target market cannot be empty.")
          .max(LIMIT.targetMarket, `Target market is too long — max ${LIMIT.targetMarket} characters.`)
      )
      .max(LIMIT.targetMarkets, `You can add up to ${LIMIT.targetMarkets} target markets.`),

    // Step 2 ("" means "not chosen" and clears the value)
    experience: z.enum([...EXPERIENCE_LEVELS, ""], { error: "Choose a valid experience level." }),
    portfolioLink: text(LIMIT.portfolioLink, "Portfolio link"),
    rate: text(LIMIT.rate, "Rate"),
    availability: z.enum([...AVAILABILITY_OPTIONS, ""], { error: "Choose a valid availability." }),
    locations: z
      .array(
        z
          .string()
          .trim()
          .min(1, "Location cannot be empty.")
          .max(LIMIT.location, `Location is too long — max ${LIMIT.location} characters.`)
      )
      .max(LIMIT.locations, `You can add up to ${LIMIT.locations} locations.`),
    languages: text(LIMIT.languages, "Languages"),
  })
  .strict(); // unknown fields (e.g. userId, stats) are rejected

/**
 * Body of POST /api/service-listings and PATCH /api/service-listings/:id.
 * `status` and `name` are always required; a draft needs nothing else, an active service needs the rest.
 */
export const serviceListingSchema = serviceFields
  .partial()
  .extend({ status: serviceFields.shape.status, name: serviceFields.shape.name })
  .superRefine(checkServiceRules);

export const createServiceSchema = serviceListingSchema;
export const updateServiceSchema = serviceListingSchema;

/** Body of PATCH /api/service-listings/:id/status (pause / resume). */
export const statusBodySchema = z
  .object({
    status: z.enum([SERVICE_STATUS.ACTIVE, SERVICE_STATUS.PAUSED], { error: "Status must be active or paused." }),
  })
  .strict();

/** :id in the URL must look like a MongoDB ObjectId. */
export const idParamsSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, "Invalid service id."),
});

/** GET /api/service-listings?page=1&limit=20 */
export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
