import { asyncHandler, sendSuccess } from "../../utils/response.js";
import * as userService from "./user.service.js";

export const getMe = asyncHandler(async (req, res) => {
  sendSuccess(res, { user: req.user.toPublic() });
});

export const updateMe = asyncHandler(async (req, res) => {
  const user = await userService.updateProfile(req.user._id, req.body);
  sendSuccess(res, { user: user.toPublic() }, "Profile updated.");
});

export const getUsers = asyncHandler(async (req, res) => {
  const result = await userService.listUsers(req.query);
  sendSuccess(res, result);
});
