import { Router } from "express";
import { protect, authorize } from "../../middleware/authMiddleware.js";
import { validate } from "../../middleware/validate.js";
import { USER_ROLES } from "../users/user.model.js";
import {
  createServiceSchema,
  idParamsSchema,
  listQuerySchema,
  statusBodySchema,
  updateServiceSchema,
} from "./serviceListing.validation.js";
import * as controller from "./serviceListing.controller.js";

const router = Router();

// Only logged-in service providers can manage services (SRS: "Service providers alone may manage their own service profiles, offered services…").
router.use(protect, authorize(USER_ROLES.SERVICE_PROVIDER));

router.get("/", validate(listQuerySchema, "query"), controller.list);
router.post("/", validate(createServiceSchema), controller.create);

router.get("/:id", validate(idParamsSchema, "params"), controller.getOne);
router.patch("/:id", validate(idParamsSchema, "params"), validate(updateServiceSchema), controller.update);
router.delete("/:id", validate(idParamsSchema, "params"), controller.remove);

router.patch("/:id/status", validate(idParamsSchema, "params"), validate(statusBodySchema), controller.changeStatus);
router.post("/:id/duplicate", validate(idParamsSchema, "params"), controller.duplicate);

export default router;
