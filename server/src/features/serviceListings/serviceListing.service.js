import { ApiError } from "../../utils/ApiError.js";
import { SERVICE_LIMITS, SERVICE_STATUS } from "./serviceListing.constants.js";
import { ServiceListing } from "./serviceListing.model.js";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Fields copied when a service is duplicated (name, status and stats are set separately). */
const COPYABLE_FIELDS = [
  "category",
  "customCategory",
  "description",
  "keywords",
  "targetMarket",
  "experience",
  "portfolioLink",
  "rate",
  "availability",
  "locations",
  "languages",
];

/** A service that belongs to someone else looks exactly like one that does not exist. */
async function findOwned(userId, id) {
  const service = await ServiceListing.findOne({ _id: id, userId });
  if (!service) throw ApiError.notFound("Service not found.");
  return service;
}

/** Empty strings from the form clear the optional choice fields. */
function cleanChoices(data) {
  for (const field of ["experience", "availability"]) {
    if (data[field] === "") data[field] = undefined;
  }
  if (data.category && data.category !== "other") data.customCategory = "";
}

/* ------------------------------------------------------------------ */
/*  Use cases (called by serviceListing.controller.js)                 */
/*                                                                     */
/*  The request body is already fully validated by                     */
/*  serviceListing.validation.js, so nothing is re-checked here.       */
/* ------------------------------------------------------------------ */

/** One page of the provider's services, most recently edited first. */
export async function listServices(userId, { page, limit }) {
  const filter = { userId };
  const [services, total] = await Promise.all([
    ServiceListing.find(filter)
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    ServiceListing.countDocuments(filter),
  ]);
  return { services, total, page, pages: Math.ceil(total / limit) };
}

export async function getService(userId, id) {
  const service = await findOwned(userId, id);
  return { service };
}

export async function createService(userId, data) {
  cleanChoices(data);
  return ServiceListing.create({ ...data, userId });
}

export async function updateService(userId, id, data) {
  const service = await findOwned(userId, id);
  cleanChoices(data);
  service.set(data);
  return service.save();
}

/** Pause or resume AI matching for an already-complete service. */
export async function setServiceStatus(userId, id, status) {
  const service = await findOwned(userId, id);
  if (service.status === SERVICE_STATUS.DRAFT) {
    throw ApiError.conflict("Finish this draft and use “Save & find AI matches” first.");
  }
  service.status = status;
  return service.save();
}

export async function deleteService(userId, id) {
  const { deletedCount } = await ServiceListing.deleteOne({ _id: id, userId });
  if (!deletedCount) throw ApiError.notFound("Service not found.");
}

/** Copy a service into a fresh draft (matching is off until the provider reviews it). */
export async function duplicateService(userId, id) {
  const source = (await findOwned(userId, id)).toObject();
  const copy = Object.fromEntries(COPYABLE_FIELDS.map((field) => [field, source[field]]));

  return ServiceListing.create({
    ...copy,
    userId,
    name: `${source.name} (copy)`.slice(0, SERVICE_LIMITS.name),
    status: SERVICE_STATUS.DRAFT,
  });
}
