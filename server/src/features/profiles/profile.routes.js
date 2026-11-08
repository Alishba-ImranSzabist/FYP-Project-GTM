import { Router } from "express";
import { protect, authorize } from "../../middleware/authMiddleware.js";
import { USER_ROLES } from "../users/user.model.js";
import { validateRoleProfile } from "./profile.validation.js";
import * as controller from "./profile.controller.js";

const router = Router();

router.use(protect);

// Role-specific profiles: business → BusinessProfile, service_provider → ServiceProviderProfile.
// Admin keeps its existing behaviour and cannot create either profile (403).
router.use(authorize(USER_ROLES.BUSINESS, USER_ROLES.SERVICE_PROVIDER));

router.get("/me", controller.getMe);
router.post("/me", validateRoleProfile(), controller.saveMe);
router.patch("/me", validateRoleProfile(), controller.updateMe);

export default router;
