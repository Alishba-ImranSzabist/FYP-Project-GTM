import { Router } from "express";
import { protect, authorize } from "../../middleware/authMiddleware.js";
import { validate } from "../../middleware/validate.js";
import { USER_ROLES } from "./user.model.js";
import { listUsersSchema, updateProfileSchema } from "./user.validation.js";
import * as controller from "./user.controller.js";

const router = Router();

router.use(protect);

router.get("/me", controller.getMe);
router.patch("/me", validate(updateProfileSchema), controller.updateMe);

// admin only
router.get("/", authorize(USER_ROLES.ADMIN), validate(listUsersSchema, "query"), controller.getUsers);

export default router;
