import { ApiError } from "../utils/ApiError.js";
import { AUTH_COOKIE, verifyToken } from "../utils/generateToken.js";
import { asyncHandler } from "../utils/response.js";
import { findById } from "../features/users/user.service.js";

/** Requires a valid login (cookie, or `Authorization: Bearer <token>` for API tools). Sets req.user. */
export const protect = asyncHandler(async (req, _res, next) => {
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
  next();
});

/** Allow only the listed roles: router.get("/", protect, authorize("admin"), handler) */
export const authorize =
  (...roles) =>
  (req, _res, next) =>
    roles.includes(req.user?.role) ? next() : next(ApiError.forbidden());
