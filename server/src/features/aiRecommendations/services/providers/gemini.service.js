import { env } from "../../../../config/env.js";
import { ApiError } from "../../../../utils/ApiError.js";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const MAX_ATTEMPTS = 3;
const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504]);

function retryDelay(response, attempt) {
  const retryAfter = Number(response?.headers?.get("retry-after"));
  if (Number.isFinite(retryAfter) && retryAfter > 0) {
    return Math.min(retryAfter * 1000, 15000);
  }
  return 1500 * (2 ** (attempt - 1));
}

export async function generateWithGemini({ systemPrompt, userPrompt }) {
  const apiKey = env.ai.geminiApiKey;
  const model = env.ai.geminiModel;

  if (!apiKey) {
    throw ApiError.badRequest(
      "Gemini is not configured. Add GEMINI_API_KEY to server/.env and restart the server."
    );
  }

  if (!systemPrompt?.trim() || !userPrompt?.trim()) {
    throw ApiError.badRequest("System prompt or campaign prompt is missing.");
  }

  const url = `https://generativelanguage.googleapis.com/v1/models/${encodeURIComponent(model)}:generateContent`;
  const requestBody = {
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    generationConfig: {
      responseMimeType: "application/json",
      maxOutputTokens: env.ai.maxOutputTokens,
    },
  };

  console.log("[Gemini] Using model:", model);

  let response;
  let payload = {};

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        signal: AbortSignal.timeout(env.ai.requestTimeoutMs),
        body: JSON.stringify(requestBody),
      });

      payload = await response.json().catch(() => ({}));
      if (response.ok) break;

      const status = response.status;
      const providerMessage = payload?.error?.message || "No provider message returned";
      const providerReason = payload?.error?.status || "UNKNOWN";

      console.error("[Gemini] Provider error:", {
        status,
        model,
        attempt,
        reason: providerReason,
        message: providerMessage,
      });

      const isInvalidKey =
        providerReason === "UNAUTHENTICATED" ||
        (Array.isArray(payload?.error?.details) &&
          payload.error.details.some((detail) => detail?.reason === "API_KEY_INVALID"));

      if (isInvalidKey || status === 401 || status === 403) {
        throw new ApiError(
          401,
          "Gemini rejected the API key. Create or verify GEMINI_API_KEY in server/.env."
        );
      }

      if (RETRYABLE_STATUSES.has(status) && attempt < MAX_ATTEMPTS) {
        const delay = retryDelay(response, attempt);
        console.log(`[Gemini] Temporary provider error. Retry ${attempt + 1}/${MAX_ATTEMPTS} in ${delay}ms.`);
        await sleep(delay);
        continue;
      }

      if (status === 429 || status === 503) {
        throw new ApiError(
          503,
          "Gemini is temporarily busy or rate-limited. Please wait and try again."
        );
      }

      if (status === 404) {
        throw new ApiError(
          502,
          `Gemini model '${model}' was not found or is not available to this API key. Check GEMINI_MODEL.`
        );
      }

      if (status >= 500) {
        throw new ApiError(502, "Gemini provider is temporarily unavailable.");
      }

      throw new ApiError(
        502,
        `Gemini rejected the request (provider status ${status}). Check server logs for the provider message.`
      );
    } catch (error) {
      if (error instanceof ApiError) throw error;

      if (error?.name === "TimeoutError" || error?.name === "AbortError") {
        if (attempt < MAX_ATTEMPTS) {
          const delay = 1500 * (2 ** (attempt - 1));
          console.log(`[Gemini] Request timed out. Retry ${attempt + 1}/${MAX_ATTEMPTS} in ${delay}ms.`);
          await sleep(delay);
          continue;
        }
        throw new ApiError(504, "Gemini took too long to respond after multiple attempts. Please try again.");
      }

      console.error("[Gemini] Connection error:", error.message);
      if (attempt < MAX_ATTEMPTS) {
        await sleep(1500 * (2 ** (attempt - 1)));
        continue;
      }

      throw new ApiError(
        503,
        "Gemini is temporarily unavailable. Please try again shortly."
      );
    }
  }

  if (!response?.ok) {
    throw new ApiError(502, "Gemini could not generate the recommendation.");
  }

  const candidate = payload?.candidates?.[0];
  const text = candidate?.content?.parts
    ?.map((part) => part.text || "")
    .join("")
    .trim();

  if (!text) {
    console.error("[Gemini] Empty response:", {
      model,
      finishReason: candidate?.finishReason,
      promptFeedback: payload?.promptFeedback,
    });
    throw new ApiError(502, "Gemini returned an empty recommendation. Please regenerate.");
  }

  return {
    text,
    provider: "gemini",
    providerModel: payload.modelVersion || model,
    inputTokens: Number(payload.usageMetadata?.promptTokenCount || 0),
    outputTokens: Number(payload.usageMetadata?.candidatesTokenCount || 0),
  };
}
