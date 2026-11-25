import { env } from "../../../config/env.js";

async function checkGemini() {
  const { geminiApiKey, geminiModel } = env.ai;
  if (!geminiApiKey) {
    console.log("[Gemini] SKIPPED: GEMINI_API_KEY is not configured.");
    return false;
  }

  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models?pageSize=1000",
    { headers: { "x-goog-api-key": geminiApiKey } }
  );
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error("[Gemini] FAILED:", response.status, payload?.error?.message || "Could not list models.");
    return false;
  }

  const wantedName = `models/${geminiModel}`;
  const model = (payload.models || []).find(
    (item) => item.name === wantedName || item.name === geminiModel
  );

  if (!model) {
    console.error(`[Gemini] FAILED: Model '${geminiModel}' is not listed for this API key.`);
    return false;
  }

  const methods = model.supportedGenerationMethods || [];
  if (!methods.includes("generateContent")) {
    console.error(`[Gemini] FAILED: Model '${geminiModel}' does not list generateContent support.`);
    return false;
  }

  console.log(`[Gemini] OK: API key accepted; '${geminiModel}' is listed with generateContent support.`);
  return true;
}

try {
  const geminiOk = await checkGemini().catch((error) => {
    console.error("[Gemini] FAILED:", error.message);
    return false;
  });

  if (!geminiOk) {
    process.exitCode = 1;
  } else {
    console.log("Gemini provider passed the key/model availability check. This check does not generate content or consume generation tokens.");
  }
} catch (error) {
  console.error("Provider check failed:", error.message);
  process.exitCode = 1;
}
