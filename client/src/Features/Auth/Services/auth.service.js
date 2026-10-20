/** All HTTP calls for the Auth feature live here. Components never call fetch directly. */

import { getDeviceId } from "./deviceId";

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

export const authService = {
  register: (payload) => request("/auth/register", { method: "POST", body: payload }),
  // deviceId travels with login so the server can recognize a known browser
  login: (payload) => request("/auth/login", { method: "POST", body: { ...payload, deviceId: getDeviceId() } }),
  verifyLogin: (payload) =>
    request("/auth/verify-login", { method: "POST", body: { ...payload, deviceId: getDeviceId() } }),
  resendLoginCode: (payload) => request("/auth/resend-login-code", { method: "POST", body: payload }),
  logout: () => request("/auth/logout", { method: "POST" }),
  me: () => request("/auth/me"),

  // OTP: email verification + password reset
  verifyEmail: (payload) =>
    request("/auth/verify-email", { method: "POST", body: { ...payload, deviceId: getDeviceId() } }),
  resendVerification: (payload) => request("/auth/resend-verification", { method: "POST", body: payload }),
  forgotPassword: (payload) => request("/auth/forgot-password", { method: "POST", body: payload }),
  resetPassword: (payload) => request("/auth/reset-password", { method: "POST", body: payload }),
};
