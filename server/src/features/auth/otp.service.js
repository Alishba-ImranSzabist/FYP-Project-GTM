import crypto from "node:crypto";
import { env } from "../../config/env.js";
import { ApiError } from "../../utils/ApiError.js";
import { otpEmail } from "../../utils/emailTemplates.js";
import { sendMail } from "../../config/mailer.js";
import { Otp, OTP_PURPOSES } from "./otp.model.js";

/** 6-digit code from the OS CSPRNG — never Math.random (predictable). */
const generateCode = () => crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");

/**
 * Salted hash: purpose + email + server secret are mixed in, so a leaked DB dump
 * cannot be brute-forced offline (10^6 codes is tiny without the secret).
 */
const hashCode = (code, email, purpose) =>
  crypto.createHash("sha256").update(`${code}:${email}:${purpose}:${env.jwtSecret}`).digest("hex");

/** Constant-time compare — plain === leaks timing information. */
const safeEqual = (a, b) => {
  const ha = crypto.createHash("sha256").update(a).digest();
  const hb = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(ha, hb);
};

/**
 * Creates (or replaces) the OTP for email + purpose and sends it by email.
 * Enforces a resend cooldown so the endpoint can't be used to flood an inbox.
 */
export async function issueOtp(email, purpose) {
  const now = Date.now();
  const existing = await Otp.findOne({ email, purpose }).select("+codeHash");

  if (existing?.lastSentAt) {
    const waitMs = env.otp.cooldownSeconds * 1000 - (now - existing.lastSentAt.getTime());
    if (waitMs > 0) {
      throw ApiError.tooManyRequests(
        `Please wait ${Math.ceil(waitMs / 1000)} seconds before requesting a new code.`,
      );
    }
  }

  const code = generateCode();
  const otp = await Otp.findOneAndUpdate(
    { email, purpose },
    {
      codeHash: hashCode(code, email, purpose),
      attempts: 0,
      expiresAt: new Date(now + env.otp.ttlMinutes * 60 * 1000),
      lastSentAt: new Date(now),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  const { subject, text, html } = otpEmail({ code, ttlMinutes: env.otp.ttlMinutes, purpose });
  try {
    await sendMail({ to: email, subject, text, html });
  } catch (err) {
    // Email failed (SMTP down, bad key…): drop the code we just saved so the
    // cooldown doesn't block an immediate retry, then surface a clean error.
    await Otp.deleteOne({ _id: otp._id });
    console.error("OTP email failed:", err.message);
    throw ApiError.internal("We couldn't send the email right now. Please try again.");
  }

  return true;
}

/**
 * Verifies a submitted code for email + purpose.
 * Throws a generic "invalid or expired" error on any failure (never says which part was wrong).
 * After maxAttempts wrong guesses the code is destroyed and a new one must be requested.
 * On success the code is deleted so it can't be reused.
 */
export async function verifyOtp(email, purpose, code) {
  const otp = await Otp.findOne({ email, purpose }).select("+codeHash");
  if (!otp) throw ApiError.badRequest("Invalid or expired code.");

  if (otp.expiresAt.getTime() <= Date.now()) {
    await Otp.deleteOne({ _id: otp._id });
    throw ApiError.badRequest("Invalid or expired code.");
  }

  if (otp.attempts >= env.otp.maxAttempts) {
    await Otp.deleteOne({ _id: otp._id });
    throw ApiError.tooManyRequests("Too many incorrect attempts. Please request a new code.");
  }

  if (!safeEqual(otp.codeHash, hashCode(code, email, purpose))) {
    otp.attempts += 1;
    const locked = otp.attempts >= env.otp.maxAttempts;
    await otp.save({ validateBeforeSave: false });
    if (locked) throw ApiError.tooManyRequests("Too many incorrect attempts. Please request a new code.");
    throw ApiError.badRequest("Invalid or expired code.");
  }

  await Otp.deleteOne({ _id: otp._id }); // one-time use
  return true;
}

export { OTP_PURPOSES };