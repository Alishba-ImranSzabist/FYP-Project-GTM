import { RECOMMENDATION_MODELS } from "../../constants/recommendation.constants.js";
import { ApiError } from "../../../../utils/ApiError.js";
import { generateWithGemini } from "./gemini.service.js";

export async function generateWithSelectedProvider({
  modelKey,
  systemPrompt,
  userPrompt,
  exampleFile,
}) {
  const modelConfig = RECOMMENDATION_MODELS[modelKey];
  if (!modelConfig) {
    throw ApiError.badRequest("Choose a supported AI model.");
  }

  // Only Google Gemini is supported for AI recommendations.
  if (modelConfig.provider !== "gemini") {
    throw ApiError.badRequest("Only Google Gemini is supported for recommendations.");
  }

  return generateWithGemini({ systemPrompt, userPrompt, exampleFile });
}
