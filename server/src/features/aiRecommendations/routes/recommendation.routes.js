import { Router } from "express";
import { protect, authorize } from "../../../middleware/authMiddleware.js";
import { validate } from "../../../middleware/validate.js";
import { USER_ROLES } from "../../users/user.model.js";
import * as controller from "../controllers/recommendation.controller.js";
import {
  generateRecommendationSchema,
  recommendationIdParamsSchema,
  recommendationListQuerySchema,
  reviewCommentSchema,
} from "../validators/recommendation.validation.js";

const router = Router();

const businessOnly = [protect, authorize(USER_ROLES.BUSINESS)];

router.get(
  "/",
  ...businessOnly,
  validate(recommendationListQuerySchema, "query"),
  controller.list
);

router.post(
  "/",
  ...businessOnly,
  validate(generateRecommendationSchema),
  controller.generate
);

router.get(
  "/:id",
  ...businessOnly,
  validate(recommendationIdParamsSchema, "params"),
  controller.getOne
);

router.patch(
  "/:id/draft",
  ...businessOnly,
  validate(recommendationIdParamsSchema, "params"),
  controller.saveDraft
);

router.patch(
  "/:id/approve",
  ...businessOnly,
  validate(recommendationIdParamsSchema, "params"),
  validate(reviewCommentSchema),
  controller.approve
);

router.patch(
  "/:id/reject",
  ...businessOnly,
  validate(recommendationIdParamsSchema, "params"),
  validate(reviewCommentSchema),
  controller.reject
);

export default router;
