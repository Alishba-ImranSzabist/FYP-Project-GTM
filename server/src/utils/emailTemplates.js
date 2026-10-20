/** Plain, dependency-free email bodies. Keep them simple — text is always sent alongside HTML. */

export function otpEmail({ code, ttlMinutes, purpose }) {
  const isReset = purpose === "reset_password";
  const heading = isReset ? "Reset your password" : "Verify your email address";
  const lead = isReset
    ? "We received a request to reset the password for your GTM account. Enter this code to continue:"
    : "Thanks for signing up for GTM! Enter this code to verify your email address:";
  const ignore = isReset
    ? "If you didn't request a password reset, you can safely ignore this email — your password stays unchanged."
    : "If you didn't create a GTM account, you can safely ignore this email.";

  const text = `${heading}\n\n${lead}\n\n${code}\n\nThis code expires in ${ttlMinutes} minutes.\n${ignore}`;

  const html = `
      <div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;padding:32px;border:1px solid #e5e7eb;border-radius:12px">
        <h2 style="margin:0 0 16px;color:#111827">${heading}</h2>
        <p style="color:#374151;line-height:1.6">${lead}</p>
        <p style="font-size:32px;font-weight:bold;letter-spacing:10px;text-align:center;color:#111827;margin:24px 0">${code}</p>
        <p style="color:#6b7280;font-size:14px">This code expires in ${ttlMinutes} minutes. Didn't request this? ${ignore}</p>
      </div>`;

  return { subject: `${code} is your GTM ${isReset ? "password reset" : "verification"} code`, text, html };
}