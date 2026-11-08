import { Router } from "express";
import { protect, authorize } from "../../middleware/authMiddleware.js";
import { validate } from "../../middleware/validate.js";
import { USER_ROLES } from "../users/user.model.js";
import {
  createCampaignSchema,
  idParamsSchema,
  listQuerySchema,
  updateCampaignSchema,
} from "./campaign.validation.js";
import * as controller from "./campaign.controller.js";

const router = Router();

// Only logged-in business accounts can manage campaigns (SRS: "Business owners alone may create, update and manage their own campaigns").
router.use(protect, authorize(USER_ROLES.BUSINESS));

router.get("/", validate(listQuerySchema, "query"), controller.list);
router.post("/", validate(createCampaignSchema), controller.create);

router.get("/:id", validate(idParamsSchema, "params"), controller.getOne);
router.patch("/:id", validate(idParamsSchema, "params"), validate(updateCampaignSchema), controller.update);
router.delete("/:id", validate(idParamsSchema, "params"), controller.remove);

router.post("/:id/duplicate", validate(idParamsSchema, "params"), controller.duplicate);

export default router;
