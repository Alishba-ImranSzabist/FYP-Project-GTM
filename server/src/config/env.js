import "dotenv/config";

const required = ["MONGO_URI", "JWT_SECRET"];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(", ")}`);
  console.error("Copy server/.env.example to server/.env and fill in the values.");
  process.exit(1);
}

export const env = Object.freeze({
  nodeEnv: process.env.NODE_ENV || "development",
  isProd: process.env.NODE_ENV === "production",
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  // Only people who know this code can register an admin account. Leave empty to disable.
  adminInviteCode: process.env.ADMIN_INVITE_CODE || "",

  // Outgoing email (Brevo SMTP) — used for OTP verification & password reset
  mail: {
    host: process.env.BREVO_SMTP_HOST,
    port: Number(process.env.BREVO_SMTP_PORT) || 587,
    secure: Number(process.env.BREVO_SMTP_PORT) === 465, // 465 = implicit TLS, 587 = STARTTLS
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_KEY,
    from: process.env.MAIL_FROM,
  },

  // OTP rules: code stays valid 10 minutes; 5 wrong guesses lock the code
  otp: {
    ttlMinutes: Number(process.env.OTP_TTL_MINUTES) || 10,
    maxAttempts: Number(process.env.OTP_MAX_ATTEMPTS) || 5,
    cooldownSeconds: Number(process.env.OTP_COOLDOWN_SECONDS) || 60, // min gap between two sends to the same email
  },
});
