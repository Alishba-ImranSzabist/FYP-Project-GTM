import crypto from "node:crypto";
import { env } from "../../config/env.js";
import { ApiError } from "../../utils/ApiError.js";
import { generateToken } from "../../utils/generateToken.js";
import { USER_ROLES } from "../users/user.model.js";
import * as userService from "../users/user.service.js";
import { issueOtp, verifyOtp, OTP_PURPOSES } from "./otp.service.js";
import { Otp } from "./otp.model.js";

const safeEqual = (a, b) => {
  const ha = crypto.createHash("sha256").update(a).digest();
  const hb = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(ha, hb);
};

export async function register(data) {
  if (data.role === USER_ROLES.ADMIN) {
    const ok = env.adminInviteCode && data.adminInviteCode && safeEqual(data.adminInviteCode, env.adminInviteCode);
    if (!ok) throw ApiError.forbidden("Invalid admin invite code.");
  }

  if (await userService.findByEmail(data.email)) {
    throw ApiError.conflict("An account with this email already exists.", {
      email: "This email is already registered.",
    });
  }

  const user = await userService.createUser({
    role: data.role,
    fullName: data.fullName,
    companyName: data.role === USER_ROLES.ADMIN ? undefined : data.companyName,
    email: data.email,
    password: data.password,
  });

  // An SMTP failure must not strand an already-created account. Tell the UI
  // that it must show a retry option instead of claiming email was delivered.
  let verificationEmailSent = false;
  try {
    await issueOtp(user.email, OTP_PURPOSES.VERIFY_EMAIL);
    verificationEmailSent = true;
  } catch (err) {
    console.error("Signup OTP email failed:", err.message);
  }

  return { user: user.toPublic(), token: generateToken(user._id), verificationEmailSent };
}

export async function login({ email, password, deviceId }) {
  const user = await userService.findByEmail(email, { withPassword: true, withTrustedDevices: true });

  // same message for "no such user" and "wrong password" so attackers cannot probe for emails
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized("Incorrect email or password.");
  }
  if (!user.isActive) throw ApiError.forbidden("This account has been deactivated.");

  // A user with an UNVERIFIED address must be able to log in using their
  // password to correct a typo. The normal API middleware still blocks access
  // to all workspace data until email verification is completed.
  if (!user.isEmailVerified) {
    return { user: user.toPublic(), token: generateToken(user._id) };
  }

  // Unknown browser/system → email a security code before opening the session.
  const trustedEntry = deviceId ? (user.trustedDevices || []).find((d) => d.id === deviceId) : null;
  if (!trustedEntry) {
    try {
      await issueOtp(user.email, OTP_PURPOSES.LOGIN_VERIFY);
    } catch (err) {
      // 429 = resend cooldown; a code was already sent moments ago, so continue.
      if (err.statusCode !== 429) throw err;
    }
    return { requiresVerification: true };
  }
  trustedEntry.lastSeenAt = new Date(); // refresh "last used" on the trusted device

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  return { user: user.toPublic(), token: generateToken(user._id) };
}

/** Second step of login from an unknown device: check the emailed code, trust the device. */
export async function verifyLogin({ email, code, deviceId }) {
  const user = await userService.findByEmail(email);
  if (!user || !user.isActive) throw ApiError.unauthorized("Incorrect email or password.");

  await verifyOtp(email, OTP_PURPOSES.LOGIN_VERIFY, code); // throws on wrong/expired/locked code

  if (deviceId) await userService.trustDevice(user._id, deviceId); // next login from here is seamless

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  return { user: user.toPublic(), token: generateToken(user._id) };
}

/** "Resend the login code" on the verify-login screen (respects the 60s cooldown). */
export async function resendLoginCode({ email }) {
  const user = await userService.findByEmail(email);
  if (!user) return; // don't reveal which emails exist
  try {
    await issueOtp(email, OTP_PURPOSES.LOGIN_VERIFY);
  } catch (err) {
    if (err.statusCode !== 429) throw err; // cooldown → a code is already on its way
  }
}

/** GET /api/auth/verification-status — source of truth for OTP cooldown. */
export async function getVerificationStatus(user) {
  if (user.isEmailVerified) {
    return { email: user.email, isEmailVerified: true, resendAvailableAt: null, resendAfterSeconds: 0, hasActiveCode: false };
  }
  const otp = await Otp.findOne({ email: user.email, purpose: OTP_PURPOSES.VERIFY_EMAIL })
    .select("lastSentAt expiresAt")
    .lean();
  const active = Boolean(otp && otp.expiresAt && otp.expiresAt.getTime() > Date.now());
  return {
    email: user.email,
    isEmailVerified: false,
    resendAvailableAt: active && otp.lastSentAt
      ? new Date(otp.lastSentAt.getTime() + env.otp.cooldownSeconds * 1000).toISOString()
      : null,
    resendAfterSeconds: active && otp.lastSentAt
      ? Math.max(0, Math.ceil((otp.lastSentAt.getTime() + env.otp.cooldownSeconds * 1000 - Date.now()) / 1000))
      : 0,
    hasActiveCode: active,
  };
}

/** OTP must belong to the currently authenticated account. */
export async function verifyEmail(user, { email, code, deviceId }) {
  if (user.email !== email) throw ApiError.badRequest("Your email changed. Reload the page and try again.");
  if (user.isEmailVerified) return user;

  await verifyOtp(user.email, OTP_PURPOSES.VERIFY_EMAIL, code);
  user.isEmailVerified = true;
  await user.save({ validateBeforeSave: false });
  if (deviceId) await userService.trustDevice(user._id, deviceId);
  return user;
}

/** Resend only for the authenticated user's own unverified address. */
export async function resendVerification(user) {
  if (user.isEmailVerified) throw ApiError.badRequest("This email is already verified.");
  await issueOtp(user.email, OTP_PURPOSES.VERIFY_EMAIL);
  return getVerificationStatus(user);
}

/**
 * POST /api/auth/forgot-password — always resolves quietly for unknown emails so
 * the endpoint cannot be used to probe which addresses have accounts.
 */
export async function forgotPassword({ email }) {
  const user = await userService.findByEmail(email);
  if (!user) return;

  await issueOtp(email, OTP_PURPOSES.RESET_PASSWORD);
}

/** POST /api/auth/reset-password — check the code, set the new password. */
export async function resetPassword({ email, code, newPassword }) {
  const user = await userService.findByEmail(email, { withPassword: true });
  if (!user) throw ApiError.badRequest("Invalid or expired code.");

  await verifyOtp(email, OTP_PURPOSES.RESET_PASSWORD, code);

  user.password = newPassword; // pre-save hook re-hashes it
  await user.save();
}

/** Edit only the unverified account. Saving an address is not a resend click. */
export async function changeVerificationEmail(user, rawEmail) {
  const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    throw ApiError.badRequest("Enter a valid email address.");
  }
  if (user.isEmailVerified) throw ApiError.badRequest("Email is already verified.");
  if (email === user.email) {
    return { user, emailSent: false, status: await getVerificationStatus(user) };
  }

  const existing = await userService.findByEmail(email);
  if (existing) throw ApiError.conflict("This email is already registered.", { email: "Email already registered." });

  const oldEmail = user.email;
  user.email = email;
  try {
    await user.save();
  } catch (err) {
    if (err.code === 11000) throw ApiError.conflict("This email is already registered.");
    throw err;
  }
  // Old address can no longer verify this account.
  await Otp.deleteMany({ email: oldEmail, purpose: OTP_PURPOSES.VERIFY_EMAIL });

  let emailSent = false;
  try {
    await issueOtp(email, OTP_PURPOSES.VERIFY_EMAIL);
    emailSent = true;
  } catch (err) {
    // Address remains updated. Return an honest emailSent flag; users can resend.
    console.error("Corrected-address OTP email failed:", err.message);
  }
  return { user, emailSent, status: await getVerificationStatus(user) };
}