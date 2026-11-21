import { env } from "../../../../config/env.js";
import { ApiError } from "../../../../utils/ApiError.js";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const MAX_ATTEMPTS = 3;
const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 529]);
const ANTHROPIC_API_VERSION = "2023-06-01";

export async function generateWithClaude({ systemPrompt, userPrompt }) {
  const apiKey = env.ai.anthropicApiKey;
  const model = env.ai.claudeModel;

  if (!apiKey) {
    throw ApiError.badRequest(
      "Claude is not configured. Add ANTHROPIC_API_KEY to server/.env and restart the server."
    );
  }

  if (!systemPrompt?.trim() || !userPrompt?.trim()) {
    throw ApiError.badRequest("System prompt or campaign prompt is missing.");
  }

  let response;
  let payload = {};

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": ANTHROPIC_API_VERSION,
        },
        signal: AbortSignal.timeout(env.ai.requestTimeoutMs),
        body: JSON.stringify({
          model,
          max_tokens: env.ai.maxOutputTokens,
          system: systemPrompt,
          messages: [{ role: "user", content: userPrompt }],
        }),
      });

      payload = await response.json().catch(() => ({}));

      if (response.ok) break;

      const status = response.status;
      console.error("[Claude] Provider error:", {
        status,
        model,
        attempt,
        type: payload?.error?.type || "UNKNOWN",
        message: payload?.error?.message || "No provider message returned",
      });

      if (RETRYABLE_STATUSES.has(status) && attempt < MAX_ATTEMPTS) {
        const retryAfter = Number(response.headers.get("retry-after"));
        const delay = Number.isFinite(retryAfter) && retryAfter > 0
          ? Math.min(retryAfter * 1000, 10000)
          : 1000 * attempt;
        await sleep(delay);
        continue;
      }

      if (status === 401 || status === 403) {
        throw new ApiError(
          status,
          "Claude rejected the API key or workspace access. Check ANTHROPIC_API_KEY and the Console workspace."
        );
      }

      if (status === 404) {
        throw new ApiError(
          502,
          `Claude model '${model}' was not found or is not available to this API account. Check CLAUDE_MODEL.`
        );
      }

      if (status === 429 || status === 529) {
        throw new ApiError(
          503,
          "Claude is temporarily rate-limited or busy. Please wait and try again."
        );
      }

      if (status >= 500) {
        throw new ApiError(502, "Claude provider is temporarily unavailable.");
      }

      throw new ApiError(
        502,
        `Claude rejected the request (provider status ${status}). Check server logs for details.`
      );
    } catch (error) {
      if (error instanceof ApiError) throw error;

      if (error?.name === "TimeoutError" || error?.name === "AbortError") {
        if (attempt < MAX_ATTEMPTS) {
          const delay = 1000 * attempt;
          console.log(`[Claude] Request timed out. Retry ${attempt + 1}/${MAX_ATTEMPTS} in ${delay}ms.`);
          await sleep(delay);
          continue;
        }
        throw new ApiError(504, "Claude took too long to respond after multiple attempts. Please try again.");
      }

      console.error("[Claude] Connection error:", error.message);
      if (attempt < MAX_ATTEMPTS) {
        await sleep(1000 * attempt);
        continue;
      }

      throw new ApiError(
        503,
        "Claude is temporarily unavailable. Please try again shortly."
      );
    }
  }

  if (!response?.ok) {
    throw new ApiError(502, "Claude could not generate the recommendation.");
  }

  const text = (payload?.content || [])
    .filter((part) => part.type === "text")
    .map((part) => part.text || "")
    .join("")
    .trim();

  if (!text) {
    console.error("[Claude] Empty response:", {
      model,
      stopReason: payload?.stop_reason,
    });
    throw new ApiError(502, "Claude returned an empty recommendation. Please regenerate.");
  }

  return {
    text,
    provider: "claude",
    providerModel: payload.model || model,
    inputTokens: Number(payload.usage?.input_tokens || 0),
    outputTokens: Number(payload.usage?.output_tokens || 0),
  };
}
