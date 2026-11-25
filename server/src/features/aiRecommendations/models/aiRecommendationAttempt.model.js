import mongoose from "mongoose";

const { Schema } = mongoose;

const schema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true },
  campaignId: { type: Schema.Types.ObjectId, required: true },
  campaignName: String,
  model: String,
  providerStatus: Number,
  errorStatus: Number,
  outcome: { type: String, enum: ["gemini", "fallback", "reused", "failed"], required: true },
  recommendationId: Schema.Types.ObjectId,
  totalTokens: Number,
  durationMs: Number,
  createdAt: { type: Date, default: Date.now, index: true },
});

export const AIRecommendationAttempt = mongoose.model("AIRecommendationAttempt", schema);
