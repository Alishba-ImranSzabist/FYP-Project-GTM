/** All HTTP calls for AI Recommendations live here. Components never call fetch directly. */

import { AI_RECOMMENDATIONS_DEMO_MODE } from "../recommendationSettings.js";
import { createMockRecommendations } from "../data/recommendationPreviewData.js";

const API_URL = import.meta.env.VITE_API_URL || "/api";

export class ApiError extends Error {
  constructor(message, { status, fieldErrors } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors || {};
  }
}

async function request(path, { method = "GET", body } = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      credentials: "include", // uses the existing httpOnly login session cookie
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("Cannot reach the server. Please check your connection and try again.");
  }

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(json.message || "Something went wrong.", {
      status: response.status,
      fieldErrors: json.errors,
    });
  }
  return json.data;
}

export const recommendationApiService = {
  /**
   * Frontend preview now; real endpoint contract is POST /api/ai-recommendations
   * with { campaignId, model, recommendationStyle }. The server will return { recommendation }.
   */
  generate: async ({ campaign, model, recommendationStyle = "balanced" }) => {
    if (AI_RECOMMENDATIONS_DEMO_MODE) {
      await new Promise((resolve) => window.setTimeout(resolve, model === "detailed" ? 900 : 500));
      return { recommendation: createMockRecommendations(campaign, model, recommendationStyle) };
    }

    return request("/ai-recommendations", {
      method: "POST",
      body: { campaignId: campaign.id, model, recommendationStyle },
    });
  },

  // Ready for the backend phase; these methods remain unused in frontend preview mode.
  saveDraft: (recommendationId) =>
    request(`/ai-recommendations/${recommendationId}/draft`, { method: "PATCH" }),
  approve: (recommendationId) =>
    request(`/ai-recommendations/${recommendationId}/approve`, { method: "PATCH" }),
};
