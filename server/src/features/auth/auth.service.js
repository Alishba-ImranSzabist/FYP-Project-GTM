import crypto from "node:crypto";
import { env } from "../../config/env.js";
import { ApiError } from "../../utils/ApiError.js";
import { generateToken } from "../../utils/generateToken.js";
import { USER_ROLES } from "../users/user.model.js";
import * as userService from "../users/user.service.js";
import { issueOtp, verifyOtp, OTP_PURPOSES } from "./otp.service.js";

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

  // Send the 6-digit verification code. A failed email must not roll back the
  // signup — the user can hit "Resend code" from the verify screen later.
  try {
    await issueOtp(user.email, OTP_PURPOSES.VERIFY_EMAIL);
  } catch (err) {
    console.error("Signup OTP email failed:", err.message);
  }

  return { user: user.toPublic(), token: generateToken(user._id) };
}

export async function login({ email, password, deviceId }) {
  const user = await userService.findByEmail(email, { withPassword: true, withTrustedDevices: true });

  // same message for "no such user" and "wrong password" so attackers cannot probe for emails
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized("Incorrect email or password.");
  }
  if (!user.isActive) throw ApiError.forbidden("This account has been deactivated.");

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

/** POST /api/auth/verify-email — flip isEmailVerified once the code matches. */
export async function verifyEmail({ email, code, deviceId }) {
  const user = await userService.findByEmail(email);
  if (!user) throw ApiError.badRequest("Invalid or expired code.");
  if (user.isEmailVerified) return user; // already done — idempotent

  await verifyOtp(email, OTP_PURPOSES.VERIFY_EMAIL, code);

  user.isEmailVerified = true;
  await user.save({ validateBeforeSave: false });
  // The browser that just proved ownership of the email becomes a trusted device,
  // so the very next login there doesn't need another code.
  if (deviceId) await userService.trustDevice(user._id, deviceId);
  return user;
}

/** POST /api/auth/resend-verification — re-send the signup code (respects the cooldown). */
export async function resendVerification({ email }) {
  const user = await userService.findByEmail(email);
  // Same generic behaviour as forgot-password: don't reveal which emails exist.
  if (!user) return;
  if (user.isEmailVerified) throw ApiError.badRequest("This email is already verified.");

  await issueOtp(email, OTP_PURPOSES.VERIFY_EMAIL);
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
