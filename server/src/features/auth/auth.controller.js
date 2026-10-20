import { asyncHandler, sendSuccess } from "../../utils/response.js";
import { clearAuthCookie, setAuthCookie } from "../../utils/generateToken.js";
import * as authService from "./auth.service.js";

export const register = asyncHandler(async (req, res) => {
  const { user, token } = await authService.register(req.body);
  setAuthCookie(res, token);
  sendSuccess(res, { user }, "Account created.", 201);
});

export const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  if (result.requiresVerification) {
    // Unknown device: no cookie yet — client must collect the emailed code first.
    return sendSuccess(res, { requiresVerification: true }, "We emailed you a security code.");
  }
  setAuthCookie(res, result.token);
  sendSuccess(res, { user: result.user }, "Logged in.");
});

export const verifyLogin = asyncHandler(async (req, res) => {
  const { user, token } = await authService.verifyLogin(req.body);
  setAuthCookie(res, token);
  sendSuccess(res, { user }, "Logged in.");
});

export const resendLoginCode = asyncHandler(async (req, res) => {
  await authService.resendLoginCode(req.body);
  sendSuccess(res, null, "If that email has an account, we've sent a 6-digit code.");
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const user = await authService.verifyEmail(req.body);
  sendSuccess(res, { user: user.toPublic() }, "Email verified.");
});

export const resendVerification = asyncHandler(async (req, res) => {
  await authService.resendVerification(req.body);
  // Always this message — even when no user matched (don't leak which emails exist).
  sendSuccess(res, null, "If that email needs a code, we've sent one.");
});

export const forgotPassword = asyncHandler(async (req, res) => {
  await authService.forgotPassword(req.body);
  // Generic message for the same anti-enumeration reason as above.
  sendSuccess(res, null, "If that email has an account, we've sent a 6-digit code.");
});

export const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.body);
  sendSuccess(res, null, "Password updated. You can log in with your new password.");
});

export const logout = asyncHandler(async (_req, res) => {
  clearAuthCookie(res);
  sendSuccess(res, null, "Logged out.");
});

export const me = asyncHandler(async (req, res) => {
  sendSuccess(res, { user: req.user.toPublic() });
});
