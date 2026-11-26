import { Router } from "express";
import { env } from "../../../config/env.js";
import { protect, authorize } from "../../../middleware/authMiddleware.js";
import { validate } from "../../../middleware/validate.js";
import { sendSuccess } from "../../../utils/response.js";
import { AIRecommendationAttempt } from "../models/aiRecommendationAttempt.model.js";
import { AIRecommendation } from "../models/aiRecommendation.model.js";
import { User, USER_ROLES } from "../../users/user.model.js";
import * as configController from "../controllers/admin/recommendationConfigAdmin.controller.js";
import { updateRecommendationConfigSchema } from "../validators/admin.validation.js";

const router = Router();

router.use(protect, authorize(USER_ROLES.ADMIN));

router.get("/model", (_req, res) => {
  sendSuccess(res, {
    model: env.ai.geminiModel.replace(/^models\//, ""),
    credentialsConfigured: Boolean(env.ai.geminiApiKey),
    maxOutputTokens: env.ai.maxOutputTokens,
    requestTimeoutMs: env.ai.requestTimeoutMs,
  });
});

router.get("/usage", async (_req, res) => {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const records = await AIRecommendation.aggregate([
    { $match: { createdAt: { $gte: since } } },
    { $group: {
      _id: { userId: "$userId", provider: "$provider", modelName: { $ifNull: ["$providerModel", "$modelId"] } },
      requestCount: { $sum: 1 },
      totalTokens: { $sum: { $ifNull: ["$usage.totalTokens", { $add: [
        { $ifNull: ["$usage.inputTokens", 0] },
        { $ifNull: ["$usage.outputTokens", 0] },
        { $ifNull: ["$usage.thinkingTokens", 0] },
      ] }] } },
      lastUsedAt: { $max: "$createdAt" },
    } },
    { $sort: { lastUsedAt: -1 } },
    { $lookup: { from: User.collection.name, localField: "_id.userId", foreignField: "_id", as: "user" } },
    { $project: {
      _id: 0, userId: "$_id.userId", modelName: "$_id.modelName", provider: "$_id.provider",
      userName: { $arrayElemAt: ["$user.fullName", 0] },
      requestCount: 1, totalTokens: 1, lastUsedAt: 1,
    } },
  ]);
  const attempts = await AIRecommendationAttempt.find({ createdAt: { $gte: since } })
    .sort({ createdAt: -1, _id: -1 })
    .limit(50)
    .select("userId campaignName model providerStatus errorStatus outcome recommendationId totalTokens durationMs createdAt")
    .lean();
  sendSuccess(res, { records, attempts });
});

router.get("/config", configController.getConfig);
router.put(
  "/config",
  validate(updateRecommendationConfigSchema),
  configController.updateConfig
);

export default router;
