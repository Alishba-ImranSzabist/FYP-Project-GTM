import { Router } from "express";
import rateLimit from "express-rate-limit";
import { protectPendingEmail } from "../../middleware/authMiddleware.js";
import { validate } from "../../middleware/validate.js";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resendLoginCodeSchema,
  resetPasswordSchema,
  verificationEmailSchema,
  verifyEmailSchema,
  verifyLoginSchema,
} from "./auth.validation.js";
import * as controller from "./auth.controller.js";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { success: false, message: "Too many attempts. Please try again in a few minutes." },
});

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { success: false, message: "Too many code requests. Please try again later." },
});

router.post("/register", authLimiter, validate(registerSchema), controller.register);
router.post("/login", authLimiter, validate(loginSchema), controller.login);
router.post("/verify-login", authLimiter, validate(verifyLoginSchema), controller.verifyLogin);
router.post("/resend-login-code", otpLimiter, validate(resendLoginCodeSchema), controller.resendLoginCode);
router.post("/logout", controller.logout);

// An unverified user needs these routes to recover a mistyped address.
router.get("/me", protectPendingEmail, controller.me);
router.get("/verification-status", protectPendingEmail, controller.verificationStatus);
router.patch(
  "/verification-email",
  protectPendingEmail,
  otpLimiter,
  validate(verificationEmailSchema),
  controller.changeVerificationEmail,
);
router.post("/verify-email", protectPendingEmail, authLimiter, validate(verifyEmailSchema), controller.verifyEmail);
router.post("/resend-verification", protectPendingEmail, otpLimiter, controller.resendVerification);

router.post("/forgot-password", otpLimiter, validate(forgotPasswordSchema), controller.forgotPassword);
router.post("/reset-password", authLimiter, validate(resetPasswordSchema), controller.resetPassword);

export default router;