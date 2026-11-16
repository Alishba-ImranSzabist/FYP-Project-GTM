import { ApiError } from "../../utils/ApiError.js";
import { SERVICE_LIMITS, SERVICE_STATUS } from "./serviceListing.constants.js";
import { ServiceListing } from "./serviceListing.model.js";

const COPYABLE_FIELDS = [
  "category", "customCategory", "description", "keywords", "targetMarket", "experience",
  "portfolioLink", "rate", "availability", "locations", "languages",
];

async function findOwned(userId, id) {
  const service = await ServiceListing.findOne({ _id: id, userId });
  if (!service) throw ApiError.notFound("Service not found.");
  return service;
}

/** Convert unselected optional choices to MongoDB's absent values. */
function cleanChoices(data) {
  const clean = { ...data };
  for (const field of ["experience", "availability"]) {
    if (clean[field] === "") clean[field] = undefined;
  }
  if (clean.category !== undefined && clean.category !== "other") clean.customCategory = "";
  return clean;
}

export async function listServices(userId, { page, limit }) {
  const filter = { userId };
  const [services, total] = await Promise.all([
    ServiceListing.find(filter).sort({ updatedAt: -1 }).skip((page - 1) * limit).limit(limit),
    ServiceListing.countDocuments(filter),
  ]);
  return { services, total, page, pages: Math.ceil(total / limit) };
}

/** Most recently edited draft, belonging to this user only. */
export async function getRecentDraft(userId) {
  const service = await ServiceListing.findOne({ userId, status: SERVICE_STATUS.DRAFT })
    .sort({ updatedAt: -1 });
  return { service: service || null };
}

export async function getService(userId, id) {
  return { service: await findOwned(userId, id) };
}

export async function createService(userId, data) {
  return ServiceListing.create({ ...cleanChoices(data), userId });
}

export async function updateService(userId, id, data) {
  const service = await findOwned(userId, id);
  if (service.status !== SERVICE_STATUS.DRAFT && data.status === SERVICE_STATUS.DRAFT) {
    throw ApiError.conflict("An active or paused service cannot be changed back into a draft.");
  }
  // Saving edits to a paused service must NOT implicitly turn matching back on.
  const prepared = cleanChoices(data);
  if (service.status === SERVICE_STATUS.PAUSED && prepared.status === SERVICE_STATUS.ACTIVE) {
    prepared.status = SERVICE_STATUS.PAUSED;
  }
  service.set(prepared);
  return service.save();
}

export async function setServiceStatus(userId, id, status) {
  const service = await findOwned(userId, id);
  if (service.status === SERVICE_STATUS.DRAFT) {
    throw ApiError.conflict("Finish this draft and use 'Save & find AI matches' first.");
  }
  service.status = status;
  return service.save();
}

export async function deleteService(userId, id) {
  const { deletedCount } = await ServiceListing.deleteOne({ _id: id, userId });
  if (!deletedCount) throw ApiError.notFound("Service not found.");
}

export async function duplicateService(userId, id) {
  const source = (await findOwned(userId, id)).toObject();
  const copy = Object.fromEntries(COPYABLE_FIELDS.map((field) => [field, source[field]]));
  return ServiceListing.create({
    ...copy,
    userId,
    name: `${source.name || "Untitled service"} (copy)`.slice(0, SERVICE_LIMITS.name),
    status: SERVICE_STATUS.DRAFT,
    wizardStep: 0,
  });
}
