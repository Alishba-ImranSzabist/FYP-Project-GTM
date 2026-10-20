import nodemailer from "nodemailer";
import { env } from "./env.js";

/** One shared SMTP connection pool for the whole app (Brevo). */
let transporter;

function getTransporter() {
  if (!transporter) {
    const { host, port, secure, user, pass } = env.mail;
    transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });
  }
  return transporter;
}

/** Verifies the SMTP connection once at startup so misconfiguration is caught early. */
export async function verifyMailConnection() {
  if (!env.mail.host || !env.mail.user || !env.mail.pass || !env.mail.from) {
    throw new Error(
      "Mail is not configured. Set BREVO_SMTP_HOST, BREVO_SMTP_PORT, BREVO_SMTP_USER, BREVO_SMTP_KEY and MAIL_FROM in server/.env",
    );
  }
  await getTransporter().verify();
}

export async function sendMail({ to, subject, text, html }) {
  const info = await getTransporter().sendMail({
    from: env.mail.from,
    to,
    subject,
    text,
    html,
  });
  return info.messageId;
}