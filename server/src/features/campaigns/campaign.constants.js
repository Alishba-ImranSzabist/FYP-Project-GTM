/**
 * Single source of truth for campaign options and limits (server side).
 * The client keeps a matching copy in client/src/Features/Campaigns/campaignConfig.js,
 * so when you change a value here, change it there too.
 */

export const CAMPAIGN_STATUS = Object.freeze({
  DRAFT: "draft", // saved but incomplete — can be edited freely
  ACTIVE: "active", // launched — every required field is filled in
  COMPLETED: "completed", // set automatically once the end date has passed
});

export const CAMPAIGN_OBJECTIVES = Object.freeze([
  "brand_awareness",
  "generate_leads",
  "drive_sales",
  "launch_product",
]);

export const AUDIENCE_TYPES = Object.freeze(["b2c", "b2b", "both", "customers"]);

// To add a channel (e.g. "whatsapp"): add it here AND in the client campaignConfig.js.
export const CAMPAIGN_CHANNELS = Object.freeze(["email", "instagram"]);

export const DEFAULT_CURRENCY = "PKR";

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
