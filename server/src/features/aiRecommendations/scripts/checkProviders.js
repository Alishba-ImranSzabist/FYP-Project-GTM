import { env } from "../../../config/env.js";

const ANTHROPIC_API_VERSION = "2023-06-01";

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

async function checkClaude() {
  const { anthropicApiKey, claudeModel } = env.ai;
  if (!anthropicApiKey) {
    console.log("[Claude] SKIPPED: ANTHROPIC_API_KEY is not configured.");
    return false;
  }

  const response = await fetch("https://api.anthropic.com/v1/models?limit=100", {
    headers: {
      "x-api-key": anthropicApiKey,
      "anthropic-version": ANTHROPIC_API_VERSION,
    },
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error("[Claude] FAILED:", response.status, payload?.error?.message || "Could not list models.");
    return false;
  }

  const available = (payload.data || []).some((item) => item.id === claudeModel);
  if (!available) {
    console.error(`[Claude] FAILED: Model '${claudeModel}' is not listed for this API key.`);
    console.log("[Claude] Available model IDs (first 20):", (payload.data || []).slice(0, 20).map((item) => item.id).join(", "));
    return false;
  }

  console.log(`[Claude] OK: API key accepted; '${claudeModel}' is available.`);
  return true;
}

try {
  const [geminiOk, claudeOk] = await Promise.all([
    checkGemini().catch((error) => {
      console.error("[Gemini] FAILED:", error.message);
      return false;
    }),
    checkClaude().catch((error) => {
      console.error("[Claude] FAILED:", error.message);
      return false;
    }),
  ]);

  if (!geminiOk || !claudeOk) {
    process.exitCode = 1;
  } else {
    console.log("Both providers passed the key/model availability check. This check does not generate content or consume generation tokens.");
  }
} catch (error) {
  console.error("Provider check failed:", error.message);
  process.exitCode = 1;
}
