import { asyncHandler, sendSuccess } from "../../utils/response.js";
import * as profileService from "./profile.service.js";

/** GET /api/profiles/me — the logged-in user's role profile (null until created). */
export const getMe = asyncHandler(async (req, res) => {
  const profile = await profileService.getRoleProfile(req.user._id, req.user.role);
  sendSuccess(res, { role: req.user.role, profile });
});

/** POST /api/profiles/me — idempotent create/update (upsert on userId). */
export const saveMe = asyncHandler(async (req, res) => {
  const profile = await profileService.saveRoleProfile(req.user._id, req.user.role, req.body);
  sendSuccess(res, { profile }, "Profile saved.");
});

/** PATCH /api/profiles/me — update an existing role profile. */
export const updateMe = asyncHandler(async (req, res) => {
  const profile = await profileService.updateRoleProfile(req.user._id, req.user.role, req.body);
  sendSuccess(res, { profile }, "Profile updated.");
});
