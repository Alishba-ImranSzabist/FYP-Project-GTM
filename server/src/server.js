import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { verifyMailConnection } from "./config/mailer.js";
import app from "./app.js";

async function start() {
  try {
    await connectDB();
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  }

  // Best-effort SMTP check so wrong Brevo credentials surface at boot, not on the first signup.
  // Non-fatal: the server still runs if Brevo is temporarily unreachable.
  try {
    await Promise.race([
      verifyMailConnection(),
      new Promise((_, reject) => setTimeout(() => reject(new Error("timed out")), 8000)),
    ]);
    console.log("SMTP (Brevo) verified");
  } catch (err) {
    console.warn(`SMTP not verified — OTP emails will fail until this is fixed: ${err.message}`);
  }

  app.listen(env.port, () => console.log(`Server running on port ${env.port}`));
}

start();
