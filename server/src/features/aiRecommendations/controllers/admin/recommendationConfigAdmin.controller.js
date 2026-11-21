import { asyncHandler, sendSuccess } from "../../../../utils/response.js";
import {
  getOrCreateRecommendationConfig,
  serializeConfig,
  updateRecommendationConfig,
} from "../../services/admin/recommendationConfig.service.js";

export const getConfig = asyncHandler(async (_req, res) => {
  const config = await getOrCreateRecommendationConfig();
  sendSuccess(res, { config: serializeConfig(config) });
});

export const updateConfig = asyncHandler(async (req, res) => {
  const config = await updateRecommendationConfig(req.user._id, req.body.sections);
  sendSuccess(
    res,
    { config: serializeConfig(config) },
    "Recommendation configuration saved."
  );
});
