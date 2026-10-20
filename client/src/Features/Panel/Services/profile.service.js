/** HTTP calls for the logged-in user's profile (PATCH /users/me). */
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

export const profileService = {
  updateProfile: (payload) => request("/users/me", { method: "PATCH", body: payload }),
};