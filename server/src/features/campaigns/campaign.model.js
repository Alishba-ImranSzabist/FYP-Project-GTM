import mongoose from "mongoose";
import {
  AUDIENCE_TYPES,
  CAMPAIGN_CHANNELS,
  CAMPAIGN_LIMITS as LIMIT,
  CAMPAIGN_OBJECTIVES,
  CAMPAIGN_STATUS,
  DEFAULT_CURRENCY,
} from "./campaign.constants.js";

/**
 * One document per campaign. A business user owns many campaigns (User 1 : N Campaign).
 * Fields are grouped by the wizard step that fills them in.
 *
 * Drafts may be incomplete, so only `userId` and `name` are required here.
 * The "ready to launch" rules live in campaign.service.js (findRuleErrors).
 */
const campaignSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: Object.values(CAMPAIGN_STATUS),
      default: CAMPAIGN_STATUS.DRAFT,
    },

    // Step 1 — Campaign details
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: LIMIT.name },
    objective: { type: String, enum: CAMPAIGN_OBJECTIVES },
    productName: { type: String, trim: true, maxlength: LIMIT.productName },
    industry: { type: String, trim: true, maxlength: LIMIT.industry },
    description: { type: String, trim: true, maxlength: LIMIT.description },

    // Step 2 — Audience & market
    targetLocations: { type: [{ type: String, trim: true, maxlength: LIMIT.location }], default: [] },
    audienceType: { type: String, enum: AUDIENCE_TYPES },
    keywords: { type: [{ type: String, trim: true, maxlength: LIMIT.keyword }], default: [] },
    audience: { type: String, trim: true, maxlength: LIMIT.audience },
    interests: { type: String, trim: true, maxlength: LIMIT.interests },
    extraNotes: { type: String, trim: true, maxlength: LIMIT.extraNotes },

    // Step 3 — Budget & timing
    budget: { type: Number, min: 0, default: null }, // null = no budget set
    budgetAiSuggested: { type: Boolean, default: false }, // "let the AI suggest a range"
    currency: { type: String, default: DEFAULT_CURRENCY },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    channels: { type: [{ type: String, enum: CAMPAIGN_CHANNELS }], default: [] },
  },
  {
    timestamps: true, // createdAt / updatedAt
    toJSON: {
      versionKey: false,
      // API responses use `id` instead of `_id`
      transform: (_doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        return ret;
      },
    },
  }
);

// "My campaigns, newest first" and "My drafts / active / completed, newest first".
campaignSchema.index({ userId: 1, updatedAt: -1 });
campaignSchema.index({ userId: 1, status: 1, updatedAt: -1 });

export const Campaign = mongoose.model("Campaign", campaignSchema);
