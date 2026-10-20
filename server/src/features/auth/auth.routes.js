import { Router } from "express";
import rateLimit from "express-rate-limit";
import { protect } from "../../middleware/authMiddleware.js";
import { validate } from "../../middleware/validate.js";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resendLoginCodeSchema,
  resendVerificationSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  verifyLoginSchema,
} from "./auth.validation.js";
import * as controller from "./auth.controller.js";

const router = Router();

// slows down password guessing: 20 attempts per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { success: false, message: "Too many attempts. Please try again in a few minutes." },
});

// stricter limit for endpoints that trigger emails — protects the inbox AND the Brevo quota
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
router.get("/me", protect, controller.me);

// OTP: email verification + password reset
router.post("/verify-email", authLimiter, validate(verifyEmailSchema), controller.verifyEmail);
router.post("/resend-verification", otpLimiter, validate(resendVerificationSchema), controller.resendVerification);
router.post("/forgot-password", otpLimiter, validate(forgotPasswordSchema), controller.forgotPassword);
router.post("/reset-password", authLimiter, validate(resetPasswordSchema), controller.resetPassword);

export default router;
