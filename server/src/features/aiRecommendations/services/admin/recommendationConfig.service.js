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

export async function updateRecommendationConfig(adminId, sections) {
  const config = await getOrCreateRecommendationConfig();
  config.sections = sections
    .map((section) => ({ ...section }))
    .sort((a, b) => a.order - b.order);
  config.version += 1;
  config.updatedBy = adminId;
  await config.save();
  return config;
}

export function serializeConfig(config) {
  if (!config) throw ApiError.notFound("Recommendation configuration not found.");
  const result = config.toObject();
  result.id = String(result._id);
  delete result._id;
  delete result.__v;
  return result;
}
