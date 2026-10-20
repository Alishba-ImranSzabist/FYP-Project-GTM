import mongoose from "mongoose";

export const OTP_PURPOSES = Object.freeze({
  VERIFY_EMAIL: "verify_email",
  RESET_PASSWORD: "reset_password",
  LOGIN_VERIFY: "login_verify", // extra code when logging in from an unknown device
});

/**
 * One document per (email, purpose). Only the SHA-256 HASH of the code is stored —
 * the plaintext exists solely in the email we send. Mongo's TTL index deletes the
 * document automatically once expiresAt passes (usually within a minute).
 */
const otpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    purpose: { type: String, enum: Object.values(OTP_PURPOSES), required: true },
    codeHash: { type: String, required: true, select: false },
    attempts: { type: Number, default: 0, min: 0 }, // wrong guesses; reaching max locks the code
    expiresAt: { type: Date, required: true },
    lastSentAt: { type: Date, required: true }, // enforces the resend cooldown
  },
  { timestamps: true }
);

// A new code simply replaces the old one — no duplicates per email + purpose
otpSchema.index({ email: 1, purpose: 1 }, { unique: true });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // auto-purge expired codes

export const Otp = mongoose.model("Otp", otpSchema);