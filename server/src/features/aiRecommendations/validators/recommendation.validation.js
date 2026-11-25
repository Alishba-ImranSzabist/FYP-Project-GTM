import { z } from "zod";

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid MongoDB id.");

export const generateRecommendationSchema = z
  .object({
    campaignId: objectId,
    previousRecommendationId: objectId.optional(),
    model: z.enum(["fast", "detailed"]).default("fast"),
    recommendationStyle: z
      .enum(["conservative", "balanced", "creative"])
      .default("balanced"),
  })
  .strict();

export const recommendationIdParamsSchema = z.object({
  id: objectId,
});

export const recommendationListQuerySchema = z.object({
  campaignId: objectId.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const reviewCommentSchema = z
  .object({
    comment: z.string().trim().max(1000).optional().default(""),
  })
  .strict();
