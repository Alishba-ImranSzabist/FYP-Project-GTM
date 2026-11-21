import { asyncHandler, sendSuccess } from "../../../utils/response.js";
import * as recommendationService from "../services/recommendation.service.js";

export const generate = asyncHandler(async (req, res) => {
  const recommendation = await recommendationService.generateCampaignRecommendation(
    req.user._id,
    req.body
  );
  sendSuccess(res, { recommendation }, "Recommendation generated.", 201);
});

export const list = asyncHandler(async (req, res) => {
  const result = await recommendationService.listUserRecommendations(
    req.user._id,
    req.query
  );
  sendSuccess(res, result);
});

export const getOne = asyncHandler(async (req, res) => {
  const recommendation = await recommendationService.getUserRecommendation(
    req.user._id,
    req.params.id
  );
  sendSuccess(res, { recommendation });
});

export const saveDraft = asyncHandler(async (req, res) => {
  const recommendation = await recommendationService.saveRecommendationDraft(
    req.user._id,
    req.params.id
  );
  sendSuccess(res, { recommendation }, "Recommendation saved as draft.");
});

export const approve = asyncHandler(async (req, res) => {
  const recommendation = await recommendationService.approveUserRecommendation(
    req.user._id,
    req.params.id,
    req.body.comment
  );
  sendSuccess(res, { recommendation }, "Recommendation approved and saved.");
});

export const reject = asyncHandler(async (req, res) => {
  const recommendation = await recommendationService.rejectUserRecommendation(
    req.user._id,
    req.params.id,
    req.body.comment
  );
  sendSuccess(res, { recommendation }, "Recommendation rejected.");
});
