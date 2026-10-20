import { z } from "zod";
import { USER_ROLES } from "../users/user.model.js";

const email = z.string().trim().toLowerCase().email("Enter a valid work email.");

const password = z
  .string()
  .min(8, "Use at least 8 characters.")
  .max(72, "Password is too long.") // bcrypt only uses the first 72 bytes
  .regex(/[A-Za-z]/, "Include at least one letter.")
  .regex(/\d/, "Include at least one number.");

export const registerSchema = z
  .object({
    role: z.enum(Object.values(USER_ROLES), { message: "Choose a valid account type." }),
    fullName: z.string().trim().min(2, "Enter your full name.").max(80),
    companyName: z.string().trim().min(2, "Enter your company name.").max(120).optional(),
    email,
    password,
    adminInviteCode: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role !== USER_ROLES.ADMIN && !data.companyName) {
      ctx.addIssue({ code: "custom", path: ["companyName"], message: "Enter your company name." });
    }
  });

const otpCode = z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit code from your email.");

// Random id the browser keeps in localStorage; lets the server remember
// "this system already proved itself" and skip the extra login code next time.
const deviceId = z.string().trim().min(8).max(100).optional();

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password."),
  deviceId,
});

export const verifyLoginSchema = z.object({
  email,
  code: otpCode,
  deviceId,
});

export const resendLoginCodeSchema = z.object({ email });

export const verifyEmailSchema = z.object({
  email,
  code: otpCode,
  deviceId,
});

export const resendVerificationSchema = z.object({ email });

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z.object({
  email,
  code: otpCode,
  newPassword: password,
});
