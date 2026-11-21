import mongoose from "mongoose";

const { Schema } = mongoose;

const dataQualitySchema = new Schema(
  {
    verificationStatus: { type: String, default: null },
    reviewStatus: {
      type: String,
      enum: ["pending_admin_review", "approved", "rejected"],
      default: "pending_admin_review",
      index: true,
    },
    isActive: { type: Boolean, default: false, index: true },
    limitations: { type: [String], default: [] },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    reviewedAt: { type: Date, default: null },
    reviewComment: { type: String, default: "" },
  },
  { _id: false, strict: false }
);

/**
 * Reuses the already-imported MongoDB collection `CampaignExamples`.
 * strict:false is intentional: the seed JSON has nested source, market,
 * targetAudience, usagePolicy and other fields that must remain untouched.
 */
const campaignExampleSchema = new Schema(
  {
    exampleId: { type: String, index: true },
    campaignName: { type: String, trim: true },
    platform: { type: String, trim: true },
    industry: { type: String, trim: true },
    productCategory: { type: String, trim: true },
    objective: { type: String, trim: true },
    dataQuality: { type: dataQualitySchema, default: () => ({}) },
  },
  {
    strict: false,
    versionKey: false,
    collection: "CampaignExamples",
  }
);

campaignExampleSchema.index({
  "dataQuality.reviewStatus": 1,
  "dataQuality.isActive": 1,
});

export const CampaignExample = mongoose.model(
  "CampaignExample",
  campaignExampleSchema,
  "CampaignExamples"
);
