import { env } from "./src/config/env.js";

async function testGeminiMinimal() {
  console.log("\n=== GEMINI MINIMAL TEST ===");
  console.log(`Model: ${env.ai.geminiModel}`);
  console.log(`API Key configured: ${Boolean(env.ai.geminiApiKey)}`);
  console.log(`Timeout: ${env.ai.requestTimeoutMs}ms`);

  if (!env.ai.geminiApiKey) {
    console.log("SKIPPED: No GEMINI_API_KEY");
    return { ok: false, reason: "no_api_key" };
  }

  const url = `https://generativelanguage.googleapis.com/v1/models/${encodeURIComponent(env.ai.geminiModel)}:generateContent`;
  const requestBody = {
    systemInstruction: { parts: [{ text: "You are a helpful assistant." }] },
    contents: [{ role: "user", parts: [{ text: "Reply with exactly OK." }] }],
    generationConfig: {
      responseMimeType: "application/json",
      maxOutputTokens: env.ai.maxOutputTokens,
    },
  };

  const startedAt = Date.now();
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": env.ai.geminiApiKey,
      },
      signal: AbortSignal.timeout(env.ai.requestTimeoutMs),
      body: JSON.stringify(requestBody),
    });

    const durationMs = Date.now() - startedAt;
    const payload = await response.json().catch(() => ({}));

    console.log(`Status: ${response.status}`);
    console.log(`Duration: ${durationMs}ms`);
    console.log(`Payload:`, JSON.stringify(payload, null, 2));

    if (response.ok) {
      const text = payload?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "";
      console.log(`Response text: "${text}"`);
      return { ok: true, durationMs, text, status: response.status };
    } else {
      console.log(`ERROR: ${payload?.error?.message || "Unknown error"}`);
      return { ok: false, status: response.status, error: payload?.error?.message, durationMs };
    }
  } catch (error) {
    const durationMs = Date.now() - startedAt;
    console.log(`EXCEPTION: ${error.name} - ${error.message}`);
    console.log(`Duration: ${durationMs}ms`);
    return { ok: false, exception: error.message, durationMs };
  }
}

async function testClaudeMinimal() {
  console.log("\n=== CLAUDE MINIMAL TEST ===");
  console.log(`Model: ${env.ai.claudeModel}`);
  console.log(`API Key configured: ${Boolean(env.ai.anthropicApiKey)}`);
  console.log(`Timeout: ${env.ai.requestTimeoutMs}ms`);

  if (!env.ai.anthropicApiKey) {
    console.log("SKIPPED: No ANTHROPIC_API_KEY");
    return { ok: false, reason: "no_api_key" };
  }

  const startedAt = Date.now();
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": env.ai.anthropicApiKey,
        "anthropic-version": "2023-06-01",
      },
      signal: AbortSignal.timeout(env.ai.requestTimeoutMs),
      body: JSON.stringify({
        model: env.ai.claudeModel,
        max_tokens: env.ai.maxOutputTokens,
        system: "You are a helpful assistant.",
        messages: [{ role: "user", content: "Reply with exactly OK." }],
      }),
    });

    const durationMs = Date.now() - startedAt;
    const payload = await response.json().catch(() => ({}));

    console.log(`Status: ${response.status}`);
    console.log(`Duration: ${durationMs}ms`);
    console.log(`Payload:`, JSON.stringify(payload, null, 2));

    if (response.ok) {
      const text = (payload?.content || [])
        .filter((part) => part.type === "text")
        .map((part) => part.text || "")
        .join("")
        .trim();
      console.log(`Response text: "${text}"`);
      return { ok: true, durationMs, text, status: response.status };
    } else {
      console.log(`ERROR: ${payload?.error?.message || "Unknown error"}`);
      return { ok: false, status: response.status, error: payload?.error?.message, durationMs };
    }
  } catch (error) {
    const durationMs = Date.now() - startedAt;
    console.log(`EXCEPTION: ${error.name} - ${error.message}`);
    console.log(`Duration: ${durationMs}ms`);
    return { ok: false, exception: error.message, durationMs };
  }
}

async function main() {
  const [geminiResult, claudeResult] = await Promise.all([
    testGeminiMinimal(),
    testClaudeMinimal(),
  ]);

  console.log("\n=== SUMMARY ===");
  console.log(`Gemini: ${geminiResult.ok ? "PASS" : "FAIL"} ${geminiResult.durationMs ? `(${geminiResult.durationMs}ms)` : ""}`);
  console.log(`Claude: ${claudeResult.ok ? "PASS" : "FAIL"} ${claudeResult.durationMs ? `(${claudeResult.durationMs}ms)` : ""}`);

  process.exitCode = (geminiResult.ok && claudeResult.ok) ? 0 : 1;
}

main().catch((err) => {
  console.error("Smoke test failed:", err);
  process.exitCode = 1;
});