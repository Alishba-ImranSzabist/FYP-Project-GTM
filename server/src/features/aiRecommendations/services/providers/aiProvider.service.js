import { RECOMMENDATION_MODELS } from "../../constants/recommendation.constants.js";
import { ApiError } from "../../../../utils/ApiError.js";
import { generateWithGemini } from "./gemini.service.js";
import { generateWithClaude } from "./claude.service.js";

export async function generateWithSelectedProvider({
  modelKey,
  systemPrompt,
  userPrompt,
}) {
  const modelConfig = RECOMMENDATION_MODELS[modelKey];
  if (!modelConfig) {
    throw ApiError.badRequest("Choose a supported AI model.");
  }

  if (modelConfig.provider === "gemini") {
    return generateWithGemini({ systemPrompt, userPrompt });
  }

  if (modelConfig.provider === "claude") {
    return generateWithClaude({ systemPrompt, userPrompt });
  }

  throw ApiError.badRequest("The selected AI provider is not supported.");
}
