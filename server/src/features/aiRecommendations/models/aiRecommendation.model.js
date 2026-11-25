import mongoose from "mongoose";
import { RECOMMENDATION_STATUS } from "../constants/recommendation.constants.js";

const { Schema } = mongoose;

const reviewSchema = new Schema(
  {
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    reviewedAt: { type: Date, default: null },
    comment: { type: String, trim: true, maxlength: 1000, default: "" },
  },
  { _id: false }
);

/**
 * Extends the SRS AIRecommendation class attributes:
 * targetAudience, budgetMin, budgetMax, suggestedDate, strategy and status.
 *
 * The six UI sections are stored as one structured document so the response
 * can be rendered without creating one collection per recommendation section.
 */
const aiRecommendationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    campaignId: {
      type: Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
      index: true,
    },

    // SRS class-diagram fields
    targetAudience: { type: String, trim: true, default: "" },
    budgetMin: { type: Number, min: 0, default: null },
    budgetMax: { type: Number, min: 0, default: null },
    suggestedDate: { type: Date, default: null },
    strategy: { type: String, trim: true, default: "" },
    assessment: {
      recommendation: String,
      rationale: String,
      validation: String,
    },
    status: {
      type: String,
      enum: Object.values(RECOMMENDATION_STATUS),
      default: RECOMMENDATION_STATUS.PENDING,
      index: true,
    },

    // UI/API fields
    overview: { type: Schema.Types.Mixed, required: true },
    sections: { type: [Schema.Types.Mixed], default: [] },
    modelId: { type: String, enum: ["fast", "detailed"], required: true },
    provider: { type: String, enum: ["gemini", "rules"], required: true },
    providerModel: { type: String, required: true },
    fallbackReason: { type: String, enum: ["rate_limit", "overloaded", "timeout", "connection", "not_configured"] },
    recommendationStyle: {
      type: String,
      enum: ["conservative", "balanced", "creative"],
      default: "balanced",
    },

    examplesUsed: {
      type: [
        new Schema(
          {
            exampleId: { type: String, default: "" },
            campaignName: { type: String, default: "" },
            publisher: { type: String, default: "" },
            sourceTitle: { type: String, default: "" },
            sourceUrl: { type: String, default: "" },
            limitations: { type: [String], default: [] },
          },
          { _id: false }
        ),
      ],
      default: [],
    },

    contextMetadata: {
      retrievalCount: { type: Number, default: 0 },
      exampleIds: { type: [String], default: [] },
      configVersion: { type: Number, default: 1 },
      promptVersion: { type: String, default: "1.0.0" },
    },

    usage: {
      inputTokens: { type: Number, default: 0 },
      outputTokens: { type: Number, default: 0 },
      thinkingTokens: Number,
      cachedInputTokens: Number,
      totalTokens: Number,
      durationMs: { type: Number, default: 0 },
    },

    review: { type: reviewSchema, default: () => ({}) },
  },
  {
    timestamps: true,
    collection: "AIRecommendations",
    toJSON: {
      versionKey: false,
      transform: (_doc, ret) => {
        ret.id = String(ret._id);
        ret.campaignId = String(ret.campaignId);
        delete ret._id;
        delete ret.userId;
        return ret;
      },
    },
  }
);

aiRecommendationSchema.index({ userId: 1, createdAt: -1 });
aiRecommendationSchema.index({ userId: 1, campaignId: 1, createdAt: -1 });
aiRecommendationSchema.index({ campaignId: 1, status: 1 });

aiRecommendationSchema.methods.accept = function accept(userId, comment = "") {
  this.status = RECOMMENDATION_STATUS.APPROVED;
  this.review = {
    reviewedBy: userId,
    reviewedAt: new Date(),
    comment,
  };
  return this.save();
};

aiRecommendationSchema.methods.reject = function reject(userId, comment = "") {
  this.status = RECOMMENDATION_STATUS.REJECTED;
  this.review = {
    reviewedBy: userId,
    reviewedAt: new Date(),
    comment,
  };
  return this.save();
};

export const AIRecommendation = mongoose.model(
  "AIRecommendation",
  aiRecommendationSchema,
  "AIRecommendations"
);
