import { env } from "./src/config/env.js";

async function listGeminiModels() {
  console.log("=== LISTING GEMINI MODELS ===");
  console.log(`API Key configured: ${Boolean(env.ai.geminiApiKey)}`);

  if (!env.ai.geminiApiKey) {
    console.log("SKIPPED: No GEMINI_API_KEY");
    return;
  }

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1/models?pageSize=100",
      {
        headers: {
          "x-goog-api-key": env.ai.geminiApiKey,
        },
      }
    );

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.log(`Status: ${response.status}`);
      console.log(`Error:`, JSON.stringify(payload, null, 2));
      return;
    }

    const models = payload.models || [];
    console.log(`Status: ${response.status}`);
    console.log(`Found ${models.length} models:`);
    for (const m of models) {
      const methods = m.supportedGenerationMethods || [];
      console.log(`  - ${m.name} (methods: ${methods.join(", ")})`);
    }

    // Check for generateContent support
    const generateContentModels = models.filter((m) =>
      (m.supportedGenerationMethods || []).includes("generateContent")
    );
    console.log(`\nModels with generateContent support: ${generateContentModels.length}`);
    for (const m of generateContentModels) {
      console.log(`  - ${m.name}`);
    }
  } catch (error) {
    console.log(`EXCEPTION: ${error.name} - ${error.message}`);
  }
}

listGeminiModels();