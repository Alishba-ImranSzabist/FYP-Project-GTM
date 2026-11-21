import { Router } from "express";
import { protect, authorize } from "../../../middleware/authMiddleware.js";
import { validate } from "../../../middleware/validate.js";
import { USER_ROLES } from "../../users/user.model.js";
import * as exampleController from "../controllers/admin/campaignExampleAdmin.controller.js";
import * as configController from "../controllers/admin/recommendationConfigAdmin.controller.js";
import {
  adminExampleIdParamsSchema,
  adminExampleListQuerySchema,
  reviewExampleSchema,
  updateRecommendationConfigSchema,
} from "../validators/admin.validation.js";

const router = Router();

router.use(protect, authorize(USER_ROLES.ADMIN));

router.get("/config", configController.getConfig);
router.put(
  "/config",
  validate(updateRecommendationConfigSchema),
  configController.updateConfig
);

router.get(
  "/examples",
  validate(adminExampleListQuerySchema, "query"),
  exampleController.list
);

router.patch(
  "/examples/:id/review",
  validate(adminExampleIdParamsSchema, "params"),
  validate(reviewExampleSchema),
  exampleController.review
);

export default router;
