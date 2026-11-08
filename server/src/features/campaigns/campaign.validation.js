import { z } from "zod";
import {
  AUDIENCE_TYPES,
  CAMPAIGN_CHANNELS,
  CAMPAIGN_LIMITS as LIMIT,
  CAMPAIGN_OBJECTIVES,
  CAMPAIGN_STATUS,
} from "./campaign.constants.js";

/**
 * ALL campaign validation lives in this file:
 *   1. shape + length checks  ("is this value allowed?")
 *   2. launch rules           ("is the campaign complete enough to be active?")
 *
 * The wizard always sends the whole form, so the request body is the final campaign
 * and can be checked on its own (no need to merge with the saved document first).
 * (The client repeats the launch rules in Features/Campaigns/campaignForm.js for instant feedback.)
 */

const text = (max, label) =>
  z.string().trim().max(max, `${label} is too long — max ${max} characters.`);

const textList = (maxItems, maxLength, label) =>
  z
    .array(
      z
        .string()
        .trim()
        .min(1, `${label} cannot be empty.`)
        .max(maxLength, `${label} is too long — max ${maxLength} characters.`)
    )
    .max(maxItems, `You can add up to ${maxItems} ${label.toLowerCase()}s.`);

// Dates travel as "YYYY-MM-DD" (what <input type="date"> gives us).
const dateOnly = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date.")
  .refine((value) => !Number.isNaN(Date.parse(value)), "Enter a valid date.");

/** Fields that must be filled in before a campaign can be ACTIVE. Drafts may leave them empty. */
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

const isBlank = (value) =>
  value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0);

/** Cross-field rules: run once the shape above is valid. */
function checkCampaignRules(campaign, ctx) {
  const fail = (field, message) => ctx.addIssue({ code: "custom", path: [field], message });

  // "YYYY-MM-DD" strings compare correctly as text.
  if (campaign.startDate && campaign.endDate && campaign.endDate < campaign.startDate) {
    fail("endDate", "End date must be on or after the start date.");
  }

  if (campaign.status !== CAMPAIGN_STATUS.ACTIVE) return;

  for (const [field, message] of Object.entries(REQUIRED_TO_LAUNCH)) {
    if (isBlank(campaign[field])) fail(field, message);
  }
}

const campaignFields = z
  .object({
    // The client may only ask for draft or active. "completed" is set by the server.
    status: z.enum([CAMPAIGN_STATUS.DRAFT, CAMPAIGN_STATUS.ACTIVE], {
      error: "Status must be draft or active.",
    }),

    // Step 1
    name: z
      .string({ error: "Enter a campaign name." })
      .trim()
      .min(2, "Enter a campaign name (2+ characters).")
      .max(LIMIT.name, `Campaign name is too long — max ${LIMIT.name} characters.`),
    objective: z.enum(CAMPAIGN_OBJECTIVES, { error: "Choose a valid objective." }),
    productName: text(LIMIT.productName, "Product or offer"),
    industry: text(LIMIT.industry, "Industry"),
    description: text(LIMIT.description, "Description"),

    // Step 2
    targetLocations: textList(LIMIT.locations, LIMIT.location, "Location"),
    audienceType: z.enum(AUDIENCE_TYPES, { error: "Choose who you sell to." }),
    keywords: textList(LIMIT.keywords, LIMIT.keyword, "Keyword"),
    audience: text(LIMIT.audience, "Audience"),
    interests: text(LIMIT.interests, "Interests"),
    extraNotes: text(LIMIT.extraNotes, "Notes"),

    // Step 3
    budget: z
      .number({ error: "Budget must be a number." })
      .positive("Budget must be greater than 0.")
      .max(LIMIT.budgetMax, "That budget is too large.")
      .nullable(),
    budgetAiSuggested: z.boolean({ error: "Invalid value." }),
    startDate: dateOnly.nullable(),
    endDate: dateOnly.nullable(),
    channels: z
      .array(z.enum(CAMPAIGN_CHANNELS, { error: "Unknown channel." }))
      .max(CAMPAIGN_CHANNELS.length, "Too many channels."),
  })
  .strict(); // unknown fields (e.g. userId) are rejected

/**
 * Body of POST /api/campaigns and PATCH /api/campaigns/:id.
 * `status` and `name` are always required; a draft needs nothing else, an active campaign needs everything.
 */
export const campaignSchema = campaignFields
  .partial()
  .extend({ status: campaignFields.shape.status, name: campaignFields.shape.name })
  .superRefine(checkCampaignRules);

export const createCampaignSchema = campaignSchema;
export const updateCampaignSchema = campaignSchema;

/** :id in the URL must look like a MongoDB ObjectId. */
export const idParamsSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, "Invalid campaign id."),
});

/** GET /api/campaigns?status=draft&page=1&limit=20 */
export const listQuerySchema = z.object({
  status: z.enum(Object.values(CAMPAIGN_STATUS)).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});