import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const AUTH_COOKIE = "gtm_token";

export const generateToken = (userId) =>
  jwt.sign({ sub: String(userId) }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });

export const verifyToken = (token) => jwt.verify(token, env.jwtSecret);

/** httpOnly cookie: JavaScript in the browser cannot read it, which protects against XSS token theft. */
export const cookieOptions = () => ({
  httpOnly: true,
  secure: env.isProd,
  sameSite: env.isProd ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
});

export const setAuthCookie = (res, token) => res.cookie(AUTH_COOKIE, token, cookieOptions());
export const clearAuthCookie = (res) => res.clearCookie(AUTH_COOKIE, { ...cookieOptions(), maxAge: undefined });
