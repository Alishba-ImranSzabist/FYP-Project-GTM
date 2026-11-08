/** All HTTP calls for the Service Setup feature live here. Components never call fetch directly. */

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

export const serviceListingService = {
  /** -> { services, total, page, pages } */
  list: ({ page = 1, limit = 20 } = {}) => request(`/service-listings?${new URLSearchParams({ page, limit })}`),
  get: (id) => request(`/service-listings/${id}`), // -> { service }
  create: (payload) => request("/service-listings", { method: "POST", body: payload }),
  update: (id, payload) => request(`/service-listings/${id}`, { method: "PATCH", body: payload }),
  setStatus: (id, status) => request(`/service-listings/${id}/status`, { method: "PATCH", body: { status } }),
  remove: (id) => request(`/service-listings/${id}`, { method: "DELETE" }),
  duplicate: (id) => request(`/service-listings/${id}/duplicate`, { method: "POST" }),
};
