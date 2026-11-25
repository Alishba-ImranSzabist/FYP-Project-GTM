import { env } from "../../../../config/env.js";
import { ApiError } from "../../../../utils/ApiError.js";
import { AIRecommendationConfig } from "../../models/aiRecommendationConfig.model.js";
import { getOrCreateRecommendationConfig } from "../admin/recommendationConfig.service.js";

const mimeType = "text/plain";
const filesHost = "https://generativelanguage.googleapis.com";
let refreshInProgress;

export async function refreshCampaignExampleFile() {
  refreshInProgress ??= uploadCampaignExampleFile();
  try {
    return await refreshInProgress;
  } finally {
    refreshInProgress = undefined;
  }
}

async function uploadCampaignExampleFile() {
  const config = await getOrCreateRecommendationConfig();
  const refreshBefore = new Date(Date.now() + 26 * 60 * 60 * 1000);
  if (config.exampleFile?.uri && config.exampleFile.expiresAt > refreshBefore) {
    return { refreshed: false, expiresAt: config.exampleFile.expiresAt };
  }

  const source = process.env.CAMPAIGN_EXAMPLES_SOURCE_URL;
  const apiKey = env.ai.geminiApiKey;
  if (!source?.startsWith("https://") || !apiKey) {
    throw new ApiError(503, "Configure CAMPAIGN_EXAMPLES_SOURCE_URL and GEMINI_API_KEY for the examples cron.");
  }

  const signal = AbortSignal.timeout(20000);
  try {
    const response = await fetch(source, { signal });
    if (!response.ok) throw new Error(`Dataset download returned HTTP ${response.status}`);
    const examples = await response.json();
    if (!Array.isArray(examples) || examples.length !== 100 ||
        examples.some((record) => !record || typeof record !== "object" || Array.isArray(record))) {
      throw new ApiError(502, "The campaign examples source must contain a JSON array of 100 records.");
    }

    const body = Buffer.from(JSON.stringify(examples));
    const start = await fetch(`${filesHost}/upload/v1beta/files`, {
      method: "POST",
      signal,
      headers: {
        "x-goog-api-key": apiKey,
        "Content-Type": "application/json",
        "X-Goog-Upload-Protocol": "resumable",
        "X-Goog-Upload-Command": "start",
        "X-Goog-Upload-Header-Content-Length": String(body.length),
        "X-Goog-Upload-Header-Content-Type": mimeType,
      },
      body: JSON.stringify({ file: { displayName: "Campaign examples" } }),
    });
    const uploadUrl = start.headers.get("x-goog-upload-url");
    if (!start.ok || !uploadUrl) throw new Error(`Upload start returned HTTP ${start.status}`);

    const upload = await fetch(uploadUrl, {
      method: "POST",
      signal,
      headers: {
        "Content-Length": String(body.length),
        "X-Goog-Upload-Offset": "0",
        "X-Goog-Upload-Command": "upload, finalize",
      },
      body,
    });
    if (!upload.ok) throw new Error(`Upload finalize returned HTTP ${upload.status}`);
    const { file } = await upload.json();
    const expiresAt = new Date(file?.expirationTime);
    if (file?.state !== "ACTIVE" || !file.uri?.startsWith(`${filesHost}/v1beta/files/`) || !(expiresAt > refreshBefore)) {
      throw new Error("Gemini did not return an active file with a valid expiry");
    }

    await AIRecommendationConfig.updateOne(
      { _id: config._id, $or: [{ "exampleFile.expiresAt": { $exists: false } }, { "exampleFile.expiresAt": { $lt: expiresAt } }] },
      { $set: { exampleFile: { uri: file.uri, mimeType, expiresAt } } },
      { timestamps: false }
    );
    return { refreshed: true, expiresAt };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    console.warn("[Campaign examples cron] Refresh failed", { name: error.name, code: error.cause?.code });
    throw new ApiError(503, "Campaign examples could not be refreshed. Check the dataset source and Gemini Files API.");
  }
}
