import { ApiError } from "../utils/ApiError.js";
import { AUTH_COOKIE, verifyToken } from "../utils/generateToken.js";
import { asyncHandler } from "../utils/response.js";
import { findById } from "../features/users/user.service.js";

async function authenticateRequest(req) {
  const bearer = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.slice(7)
    : null;
  const token = req.cookies?.[AUTH_COOKIE] || bearer;
  if (!token) throw ApiError.unauthorized();

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    throw ApiError.unauthorized("Your session has expired. Please log in again.");
  }

  const user = await findById(payload.sub);
  if (!user || !user.isActive) throw ApiError.unauthorized("Account not found or deactivated.");
  req.user = user;
}

/** Normal protected routes require both a session AND verified email. */
export const protect = asyncHandler(async (req, _res, next) => {
  await authenticateRequest(req);
  if (!req.user.isEmailVerified) {
    throw ApiError.forbidden("Please verify your email before accessing your workspace.");
  }
  next();
});

/** Only use this for /auth/me, email correction, OTP status, resend and verify. */
export const protectPendingEmail = asyncHandler(async (req, _res, next) => {
  await authenticateRequest(req);
  next();
});

export const authorize = (...roles) => (req, _res, next) =>
  roles.includes(req.user?.role) ? next() : next(ApiError.forbidden());