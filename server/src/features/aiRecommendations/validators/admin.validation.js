import { z } from "zod";
import { MAX_RECOMMENDATION_SECTIONS } from "../constants/recommendation.constants.js";


const sectionSchema = z
  .object({
    id: z.string().trim().toLowerCase().regex(/^[a-z][a-z0-9_-]{1,49}$/),
    title: z.string().trim().min(2).max(100),
    prompt: z.string().trim().min(10).max(3000),
    enabled: z.boolean().default(true),
    order: z.number().int().min(0).max(MAX_RECOMMENDATION_SECTIONS).default(0),
  })
  .strict();

export const updateRecommendationConfigSchema = z
  .object({
    adminInstructions: z.string().trim().max(3000).optional(),
    expectedVersion: z.number().int().positive().optional(),
    sections: z
      .array(sectionSchema)
      .min(1, "At least one recommendation section is required.")
      .max(MAX_RECOMMENDATION_SECTIONS),
  })
  .strict()
  .superRefine((value, ctx) => {
    const ids = value.sections.map((section) => section.id);
    if (new Set(ids).size !== ids.length) {
      ctx.addIssue({
        code: "custom",
        path: ["sections"],
        message: "Section IDs must be unique.",
      });
    }
    if (!value.sections.some((section) => section.enabled)) {
      ctx.addIssue({
        code: "custom",
        path: ["sections"],
        message: "At least one recommendation section must be enabled.",
      });
    }
  });
