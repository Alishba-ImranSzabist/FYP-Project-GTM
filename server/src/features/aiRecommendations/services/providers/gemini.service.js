import { setTimeout as delay } from "node:timers/promises";
import { env } from "../../../../config/env.js";
import { ApiError } from "../../../../utils/ApiError.js";

function withRetryHint(error, response, details) {
  const header = response.headers.get("retry-after");
  const dateDelay = header ? Math.ceil((Date.parse(header) - Date.now()) / 1000) : 0;
  const googleDelay = details.find((detail) => detail?.["@type"] === "type.googleapis.com/google.rpc.RetryInfo")?.retryDelay;
  const seconds = header && /^\d+$/.test(header)
    ? Number(header)
    : dateDelay > 0 ? dateDelay : Math.ceil(Number.parseFloat(googleDelay));
  if (Number.isSafeInteger(seconds) && seconds > 0) error.retryAfter = String(seconds);
  return error;
}

function providerError(response, payload, model) {
  const { status } = response;
  const reason = payload?.error?.status;
  const details = Array.isArray(payload?.error?.details) ? payload.error.details : [];
  const quota = details.find((detail) => detail?.violations)?.violations;
  console.warn("[Gemini] Request rejected", { model, status, reason, quotaIds: quota?.map((item) => item.quotaId) });

  if (status === 429) {
    const error = ApiError.tooManyRequests("Gemini quota or rate limit reached. Check the Gemini project's quota and try again when it resets.");
    return withRetryHint(error, response, details);
  }
  if (status === 503) {
    return withRetryHint(new ApiError(503, "Gemini is temporarily overloaded. Try again shortly."), response, details);
  }
  if (status === 404) {
    return new ApiError(502, "Gemini could not find the configured model or reference file. Ask an administrator to check GEMINI_MODEL and the examples refresh.");
  }
  if (status === 401 || status === 403 || payload?.error?.details?.some?.((detail) => detail.reason === "API_KEY_INVALID")) {
    return new ApiError(502, "Gemini rejected the provider credentials. Ask an administrator to check the Gemini configuration.");
  }
  return new ApiError(502, "Gemini could not process the recommendation. Try again or contact an administrator.");
}

export async function generateWithGemini({ systemPrompt, userPrompt, exampleFile }) {
  const apiKey = env.ai.geminiApiKey;
  const model = env.ai.geminiModel.replace(/^models\//, "");

  if (!apiKey) {
    const error = new ApiError(503, "Gemini is not configured. Ask an administrator to check the Gemini configuration.");
    error.fallbackReason = "not_configured";
    throw error;
  }
  if (!systemPrompt?.trim() || !userPrompt?.trim()) {
    throw ApiError.badRequest("System prompt or campaign prompt is missing.");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
  const requestBody = {
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents: [{
      role: "user",
      parts: [
        { text: userPrompt },
        ...(exampleFile ? [{ fileData: { fileUri: exampleFile.uri, mimeType: exampleFile.mimeType } }] : []),
      ],
    }],
    generationConfig: {
      responseMimeType: "application/json",
      maxOutputTokens: env.ai.maxOutputTokens,
    },
  };

  let response;
  let payload;
  const signal = AbortSignal.timeout(env.ai.requestTimeoutMs);
  const deadline = Date.now() + env.ai.requestTimeoutMs;
  try {
    for (let attempt = 0; ; attempt += 1) {
      response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        signal,
        body: JSON.stringify(requestBody),
      });
      payload = await response.json().catch((error) => {
        if (error instanceof SyntaxError) return {};
        throw error;
      });
      if (response.status !== 503 || attempt >= 2) break;
      const unavailable = providerError(response, payload, model);
      const backoffMs = Math.max(Number(unavailable.retryAfter || 0) * 1000, 750 * 2 ** attempt + Math.random() * 250);
      if (backoffMs > 3000 || Date.now() + backoffMs + 1000 >= deadline) break;
      await delay(backoffMs, undefined, { signal });
    }
  } catch (error) {
    if (error?.name === "TimeoutError" || error?.name === "AbortError") {
      throw new ApiError(504, "Gemini took too long to respond. Please try again.");
    }
    console.warn("[Gemini] Connection failed", { model, code: error?.cause?.code });
    const connectionError = new ApiError(503, "Gemini is temporarily unreachable. Try again shortly.");
    connectionError.fallbackReason = "connection";
    throw connectionError;
  }

  if (!response.ok) {
    const error = providerError(response, payload, model);
    error.providerStatus = response.status;
    throw error;
  }

  const candidate = payload?.candidates?.[0];
  const usage = {
    inputTokens: payload?.usageMetadata?.promptTokenCount,
    outputTokens: payload?.usageMetadata?.candidatesTokenCount,
    thinkingTokens: payload?.usageMetadata?.thoughtsTokenCount,
    cachedInputTokens: payload?.usageMetadata?.cachedContentTokenCount,
    totalTokens: payload?.usageMetadata?.totalTokenCount,
  };
  console.info("[Gemini] Generation usage", { model, ...usage, finishReason: candidate?.finishReason, blockReason: payload?.promptFeedback?.blockReason });

  if (candidate?.finishReason === "MAX_TOKENS") {
    const error = new ApiError(502, "Gemini reached its output token limit before finishing the recommendation. Ask an administrator to review the output limit.");
    error.providerStatus = response.status;
    error.totalTokens = usage.totalTokens;
    throw error;
  }

  const text = candidate?.content?.parts
    ?.filter((part) => !part.thought)
    .map((part) => part.text || "")
    .join("")
    .trim();

  if (!text || (candidate.finishReason && candidate.finishReason !== "STOP")) {
    const error = new ApiError(502, "Gemini did not complete the recommendation. Review the campaign details and try again.");
    error.providerStatus = response.status;
    error.totalTokens = usage.totalTokens;
    throw error;
  }

  return { text, provider: "gemini", providerModel: payload.modelVersion || model, ...usage };
}
