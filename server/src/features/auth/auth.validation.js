import { z } from "zod";
import { USER_ROLES } from "../users/user.model.js";

// Work addresses are supported; we only flag a few especially common Gmail typos.
// This cannot prove that a mailbox exists — ownership is verified using OTP.
const email = z.string().trim().toLowerCase().email("Enter a valid email address.").max(254);

const looksLikeGmailTypo = (address) => {
  const domain = address.split("@")[1] || "";
  return /^(?:\d+gmail\.com|gmal\.com|gmial\.com|gamil\.com|gmai\.com|gmail\.co|gmail\.con)$/.test(domain);
};

const newEmail = email.refine(
  (address) => !looksLikeGmailTypo(address),
  "This looks like a Gmail typo. Did you mean @gmail.com?",
);

const password = z
  .string()
  .min(8, "Use at least 8 characters.")
  .max(72, "Password is too long.")
  .regex(/[A-Za-z]/, "Include at least one letter.")
  .regex(/\d/, "Include at least one number.");

export const registerSchema = z
  .object({
    role: z.enum(Object.values(USER_ROLES), { message: "Choose a valid account type." }),
    fullName: z.string().trim().min(2, "Enter your full name.").max(80),
    companyName: z.string().trim().min(2, "Enter your company name.").max(120).optional(),
    email: newEmail,
    password,
    adminInviteCode: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role !== USER_ROLES.ADMIN && !data.companyName) {
      ctx.addIssue({ code: "custom", path: ["companyName"], message: "Enter your company name." });
    }
  });

// Used only when correcting an already-created, unverified account.
export const verificationEmailSchema = z.object({ email: newEmail });

const otpCode = z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit code from your email.");
const deviceId = z.string().trim().min(8).max(100).optional();

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password."),
  deviceId,
});

export const verifyLoginSchema = z.object({ email, code: otpCode, deviceId });
export const resendLoginCodeSchema = z.object({ email });
export const verifyEmailSchema = z.object({ email, code: otpCode, deviceId });
export const resendVerificationSchema = z.object({ email });
export const forgotPasswordSchema = z.object({ email });
export const resetPasswordSchema = z.object({ email, code: otpCode, newPassword: password });