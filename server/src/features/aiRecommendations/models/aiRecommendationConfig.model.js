import mongoose from "mongoose";
import {
  DEFAULT_CONFIG_KEY,
  DEFAULT_RECOMMENDATION_SECTIONS,
  MAX_RECOMMENDATION_SECTIONS,
} from "../constants/recommendation.constants.js";

const { Schema } = mongoose;

const sectionSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: /^[a-z][a-z0-9_-]{1,49}$/,
    },
    title: { type: String, required: true, trim: true, maxlength: 100 },
    prompt: { type: String, required: true, trim: true, maxlength: 3000 },
    enabled: { type: Boolean, default: true },
    order: { type: Number, min: 0, max: MAX_RECOMMENDATION_SECTIONS, default: 0 },
  },
  { _id: false }
);

const configSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, default: DEFAULT_CONFIG_KEY },
    version: { type: Number, min: 1, default: 1 },
    exampleFile: {
      uri: String,
      mimeType: String,
      expiresAt: Date,
    },
    adminInstructions: { type: String, trim: true, maxlength: 3000, default: "" },
    sections: {
      type: [sectionSchema],
      default: () => DEFAULT_RECOMMENDATION_SECTIONS.map((section) => ({ ...section })),
    },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  {
    timestamps: true,
    collection: "AIRecommendationConfigs",
  }
);

export const AIRecommendationConfig = mongoose.model(
  "AIRecommendationConfig",
  configSchema,
  "AIRecommendationConfigs"
);
