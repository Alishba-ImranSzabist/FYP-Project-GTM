import { config } from "dotenv";
import path from "path";

// Load environment variables from server/.env (gitignored — kabhi commit na karein)
config({ path: path.resolve(process.cwd(), ".env") });

const required = ["MONGO_URI", "JWT_SECRET"];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(", ")}`);
  console.error("Check server/.env and fill in the values.");
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
  adminInviteCode: process.env.ADMIN_INVITE_CODE || "",

  mail: {
    host: process.env.BREVO_SMTP_HOST,
    port: Number(process.env.BREVO_SMTP_PORT) || 587,
    secure: Number(process.env.BREVO_SMTP_PORT) === 465,
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_KEY,
    from: process.env.MAIL_FROM,
  },

  otp: {
    ttlMinutes: Number(process.env.OTP_TTL_MINUTES) || 10,
    maxAttempts: Number(process.env.OTP_MAX_ATTEMPTS) || 5,
    cooldownSeconds: Number(process.env.OTP_COOLDOWN_SECONDS) || 60,
  },

  // AI keys stay on the server. Never expose these through VITE_ variables.
  // Only Google Gemini is used for AI recommendations. Anthropic/Claude has been removed.
  ai: {
    geminiApiKey: process.env.GEMINI_API_KEY || "",
    geminiModel: process.env.GEMINI_MODEL || "gemini-3.5-flash-lite",
    requestTimeoutMs: Number(process.env.AI_REQUEST_TIMEOUT_MS) || 25000,
    maxOutputTokens: Number(process.env.AI_MAX_OUTPUT_TOKENS) || 4096,
  },
});
