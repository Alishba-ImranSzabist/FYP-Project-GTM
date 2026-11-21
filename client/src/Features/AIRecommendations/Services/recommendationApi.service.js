/** All HTTP calls for AI Recommendations live here. */

const configuredApiUrl = import.meta.env?.VITE_API_URL || "/api";
const API_URL = configuredApiUrl.replace(/\/+$/, "");

export class ApiError extends Error {
  constructor(message, { status = null, fieldErrors = {} } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors || {};
  }
}

function readErrorMessage(json, status) {
  if (typeof json?.message === "string" && json.message.trim()) {
    return json.message.trim();
  }

  if (typeof json?.error?.message === "string" && json.error.message.trim()) {
    return json.error.message.trim();
  }

  if (typeof json?.error === "string" && json.error.trim()) {
    return json.error.trim();
  }

  if (typeof json?.data?.message === "string" && json.data.message.trim()) {
    return json.data.message.trim();
  }

  return `The request failed with status ${status}. Please try again.`;
}

function readFieldErrors(json) {
  return (
    json?.fieldErrors ||
    json?.errors ||
    json?.error?.fieldErrors ||
    json?.error?.errors ||
    {}
  );
}

/**
 * Shared request helper.
 * The backend's sendSuccess envelope is expected to return { data: ... }.
 * Error responses are read from the parsed `json` object.
 */
export async function request(path, { method = "GET", body, headers = {} } = {}) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const hasBody = body !== undefined;

  let response;
  try {
    response = await fetch(`${API_URL}${normalizedPath}`, {
      method,
      credentials: "include",
      headers: {
        ...(hasBody ? { "Content-Type": "application/json" } : {}),
        ...headers,
      },
      body: hasBody ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    throw new ApiError(
      error?.message
        ? "Cannot reach the server. Check that the backend is running and try again."
        : "Cannot reach the server. Please check your connection and try again.",
      { status: 0 }
    );
  }

  const rawText = await response.text();
  let json = {};

  if (rawText) {
    try {
      json = JSON.parse(rawText);
    } catch {
      json = { message: rawText.slice(0, 400) };
    }
  }

  if (!response.ok || json?.success === false) {
    const message = readErrorMessage(json, response.status);
    console.error("[AI Recommendations] API request failed:", {
      path: normalizedPath,
      status: response.status,
      message,
    });

    throw new ApiError(message, {
      status: response.status,
      fieldErrors: readFieldErrors(json),
    });
  }

  return json?.data ?? json?.result ?? json;
}

export const recommendationApiService = {
  generate: ({ campaign, model, recommendationStyle = "balanced" }) => {
    if (!campaign?.id) {
      return Promise.reject(new ApiError("Select a saved campaign first."));
    }

    return request("/ai-recommendations", {
      method: "POST",
      body: {
        campaignId: campaign.id,
        model,
        recommendationStyle,
      },
    });
  },

  saveDraft: (recommendationId) =>
    request(`/ai-recommendations/${recommendationId}/draft`, { method: "PATCH" }),

  approve: (recommendationId, comment = "") =>
    request(`/ai-recommendations/${recommendationId}/approve`, {
      method: "PATCH",
      body: { comment },
    }),

  reject: (recommendationId, comment = "") =>
    request(`/ai-recommendations/${recommendationId}/reject`, {
      method: "PATCH",
      body: { comment },
    }),
};
