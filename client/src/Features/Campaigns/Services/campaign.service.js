/** All HTTP calls for the Campaigns feature live here. Components never call fetch directly. */

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
  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      credentials: "include", // sends / receives the httpOnly auth cookie
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("Cannot reach the server. Please check your connection and try again.");
  }

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(json.message || "Something went wrong.", {
      status: res.status,
      fieldErrors: json.errors,
    });
  }
  return json.data;
}

export const campaignService = {
  /** -> { campaigns, counts: {all, draft, active, completed}, total, page, pages } */
  list: ({ status = "all", page = 1, limit = 20 } = {}) => {
    const query = new URLSearchParams({ page, limit });
    if (status !== "all") query.set("status", status);
    return request(`/campaigns?${query}`);
  },
  get: (id) => request(`/campaigns/${id}`), // -> { campaign }
  create: (payload) => request("/campaigns", { method: "POST", body: payload }),
  update: (id, payload) => request(`/campaigns/${id}`, { method: "PATCH", body: payload }),
  remove: (id) => request(`/campaigns/${id}`, { method: "DELETE" }),
  duplicate: (id) => request(`/campaigns/${id}/duplicate`, { method: "POST" }),
};
