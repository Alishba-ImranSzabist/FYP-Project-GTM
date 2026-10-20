import { User } from "./user.model.js";
import { ApiError } from "../../utils/ApiError.js";

export const findByEmail = (email, { withPassword = false, withTrustedDevices = false } = {}) => {
  let selection = "";
  if (withPassword) selection += " +password";
  if (withTrustedDevices) selection += " +trustedDevices";
  const query = User.findOne({ email: email.toLowerCase() });
  return selection ? query.select(selection.trim()) : query;
};

export const findById = (id) => User.findById(id);

export const createUser = (data) => User.create(data);

const MAX_TRUSTED_DEVICES = 10;

/** Remember a device (browser/system) so the next login from it skips the emailed code. */
export async function trustDevice(userId, deviceId) {
  if (!deviceId) return;
  const id = String(deviceId).slice(0, 100);
  const user = await User.findById(userId).select("+trustedDevices");
  if (!user) return;
  const previous = (user.trustedDevices || []).filter((d) => d.id !== id);
  user.trustedDevices = [{ id, lastSeenAt: new Date() }, ...previous].slice(0, MAX_TRUSTED_DEVICES);
  await user.save({ validateBeforeSave: false });
}

export async function updateProfile(userId, changes) {
  const user = await User.findByIdAndUpdate(userId, changes, { returnDocument: "after", runValidators: true });
  if (!user) throw ApiError.notFound("User not found.");
  return user;
}

export async function listUsers({ page = 1, limit = 20 }) {
  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    User.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(),
  ]);
  return { users: users.map((u) => u.toPublic()), total, page, pages: Math.ceil(total / limit) };
}
