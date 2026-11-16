import { z } from "zod";
import {
  AUDIENCE_TYPES,
  CAMPAIGN_CHANNELS,
  CAMPAIGN_LIMITS as LIMIT,
  CAMPAIGN_TIME_ZONE,
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
const isRealDate = (value) => {
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
};

const dateOnly = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date.")
  .refine(isRealDate, "Enter a valid date.");

function campaignToday(now = new Date()) {
  const pieces = new Intl.DateTimeFormat("en-GB", {
    timeZone: CAMPAIGN_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const parts = Object.fromEntries(pieces.map(({ type, value }) => [type, value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}

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

  const today = campaignToday();
  if (campaign.startDate && campaign.startDate < today) {
    fail("startDate", "Start date cannot be in the past. Choose today or a future date.");
  }
  if (campaign.endDate && campaign.endDate < today) {
    fail("endDate", "End date cannot be in the past. Choose a future date.");
  } else if (campaign.startDate && campaign.endDate && campaign.endDate <= campaign.startDate) {
    fail("endDate", campaign.endDate === campaign.startDate
      ? "Start date and end date cannot be the same. Choose a later end date."
      : "End date must be after the start date.");
  }

  if (campaign.status !== CAMPAIGN_STATUS.ACTIVE) return;

  if (!campaign.name || campaign.name.trim().length < 2) {
    fail("name", "Enter a campaign name (2+ characters).");
  }

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

    // The in-progress draft can have an empty or one-letter title.
    wizardStep: z.number().int().min(0).max(3).optional(),
    // Step 1
    name: text(LIMIT.name, "Campaign name"),
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
      .nonnegative("Budget cannot be negative. Enter an amount greater than 0.")
      .refine((value) => value > 0, "Budget must be greater than 0.")
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
 * Status is required; drafts may have no name, active campaigns must have a valid name.
 */
export const campaignSchema = campaignFields
  .partial()
  .extend({ status: campaignFields.shape.status, name: campaignFields.shape.name.optional() })
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