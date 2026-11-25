import { ApiError } from "../../../../utils/ApiError.js";
import {
  DEFAULT_CONFIG_KEY,
  DEFAULT_RECOMMENDATION_SECTIONS,
} from "../../constants/recommendation.constants.js";
import { AIRecommendationConfig } from "../../models/aiRecommendationConfig.model.js";

export async function getOrCreateRecommendationConfig() {
  return AIRecommendationConfig.findOneAndUpdate(
    { key: DEFAULT_CONFIG_KEY },
    {
      $setOnInsert: {
        key: DEFAULT_CONFIG_KEY,
        version: 1,
        sections: DEFAULT_RECOMMENDATION_SECTIONS.map((section) => ({ ...section })),
      },
    },
    {
      returnDocument: "after",
      upsert: true,
      setDefaultsOnInsert: true,
    }
  );
}

export async function updateRecommendationConfig(adminId, { sections, adminInstructions, expectedVersion }) {
  const config = await getOrCreateRecommendationConfig();
  const updated = await AIRecommendationConfig.findOneAndUpdate(
    { _id: config._id, version: expectedVersion ?? config.version },
    {
      $set: {
        sections: [...sections].sort((a, b) => a.order - b.order),
        updatedBy: adminId,
        ...(adminInstructions !== undefined && { adminInstructions }),
      },
      $inc: { version: 1 },
    },
    { returnDocument: "after", runValidators: true }
  );
  if (!updated) throw ApiError.conflict("Configuration changed. Reload it before saving again.");
  return updated;
}

export function serializeConfig(config) {
  if (!config) throw ApiError.notFound("Recommendation configuration not found.");
  const result = config.toObject();
  result.id = String(result._id);
  delete result._id;
  delete result.__v;
  delete result.exampleFile;
  return result;
}
