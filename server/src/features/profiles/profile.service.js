import { USER_ROLES } from "../users/user.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { BusinessProfile } from "./businessProfile.model.js";
import { ServiceProviderProfile } from "./serviceProviderProfile.model.js";

/**
 * Role → model mapping. A business account can only ever touch the business
 * profile and a service_provider only the provider profile; anything else
 * (admin, unknown role) is refused.
 */
const modelForRole = (role) => {
  if (role === USER_ROLES.BUSINESS) return { Model: BusinessProfile, label: "business" };
  if (role === USER_ROLES.SERVICE_PROVIDER)
    return { Model: ServiceProviderProfile, label: "service provider" };
  return null;
};

const requireModel = (role) => {
  const found = modelForRole(role);
  if (!found) throw ApiError.forbidden("This account type does not have a role profile.");
  return found;
};

/** The current user's role profile, or null when it has not been created yet. */
export async function getRoleProfile(userId, role) {
  const { Model } = requireModel(role);
  return Model.findOne({ userId });
}

/**
 * Idempotent save (create-or-update): one document per user thanks to the
 * unique userId, so saving twice never produces a duplicate profile.
 */
export async function saveRoleProfile(userId, role, data) {
  const { Model } = requireModel(role);
  const profile = await Model.findOneAndUpdate(
    { userId },
    { $set: { ...data, userId } },
    { returnDocument: "after", upsert: true, runValidators: true, setDefaultsOnInsert: true, strict: true }
  );
  return profile;
}

/** Partial update of an existing profile — 404 when it has not been created yet. */
export async function updateRoleProfile(userId, role, data) {
  const { Model, label } = requireModel(role);
  if (!data || !Object.keys(data).length) throw ApiError.badRequest("Nothing to update.");
  const profile = await Model.findOneAndUpdate(
    { userId },
    { $set: data },
    { returnDocument: "after", runValidators: true, strict: true }
  );
  if (!profile) throw ApiError.notFound(`Create your ${label} profile first.`);
  return profile;
}
