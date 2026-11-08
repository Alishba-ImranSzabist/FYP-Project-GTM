import { ApiError } from "../../utils/ApiError.js";
import { CAMPAIGN_LIMITS, CAMPAIGN_STATUS } from "./campaign.constants.js";
import { Campaign } from "./campaign.model.js";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Fields copied when a campaign is duplicated (name, status and dates are set separately). */
const COPYABLE_FIELDS = [
  "objective",
  "productName",
  "industry",
  "description",
  "targetLocations",
  "audienceType",
  "keywords",
  "audience",
  "interests",
  "extraNotes",
  "budget",
  "budgetAiSuggested",
  "currency",
  "channels",
];

/** A campaign that belongs to someone else looks exactly like one that does not exist. */
async function findOwned(userId, id) {
  const campaign = await Campaign.findOne({ _id: id, userId });
  if (!campaign) throw ApiError.notFound("Campaign not found.");
  return campaign;
}

/** "AI suggests the budget" and "a fixed budget" can never both be true. */
function normalizeBudget(data) {
  if (data.budgetAiSuggested === true) data.budget = null;
  else if (typeof data.budget === "number") data.budgetAiSuggested = false;
}

/** Active campaigns whose end date has passed become "completed". Cheap: one indexed update. */
async function completeExpiredCampaigns(userId) {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  await Campaign.updateMany(
    { userId, status: CAMPAIGN_STATUS.ACTIVE, endDate: { $lt: today } },
    { $set: { status: CAMPAIGN_STATUS.COMPLETED } }
  );
}

/* ------------------------------------------------------------------ */
/*  Use cases (called by campaign.controller.js)                       */
/*                                                                     */
/*  The request body is already fully validated by campaign.validation.js */
/*  (shape, length AND "complete enough to launch"), so nothing is re-checked here. */
/* ------------------------------------------------------------------ */

/** One page of the user's campaigns + the numbers shown on the All / Draft / Active / Completed tabs. */
export async function listCampaigns(userId, { status, page, limit }) {
  await completeExpiredCampaigns(userId);

  const filter = { userId, ...(status ? { status } : {}) };
  const [campaigns, total, grouped] = await Promise.all([
    Campaign.find(filter)
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Campaign.countDocuments(filter),
    Campaign.aggregate([{ $match: { userId } }, { $group: { _id: "$status", count: { $sum: 1 } } }]),
  ]);

  const counts = { all: 0, draft: 0, active: 0, completed: 0 };
  for (const { _id, count } of grouped) {
    counts[_id] = count;
    counts.all += count;
  }

  return { campaigns, counts, total, page, pages: Math.ceil(total / limit) };
}

export async function getCampaign(userId, id) {
  return findOwned(userId, id);
}

export async function createCampaign(userId, data) {
  normalizeBudget(data);
  return Campaign.create({ ...data, userId });
}

export async function updateCampaign(userId, id, data) {
  const campaign = await findOwned(userId, id);
  if (campaign.status === CAMPAIGN_STATUS.COMPLETED) {
    throw ApiError.conflict("A completed campaign can no longer be edited. Duplicate it instead.");
  }

  normalizeBudget(data);
  campaign.set(data);
  return campaign.save();
}

export async function deleteCampaign(userId, id) {
  const { deletedCount } = await Campaign.deleteOne({ _id: id, userId });
  if (!deletedCount) throw ApiError.notFound("Campaign not found.");
}

/** Copy a campaign into a fresh draft (dates are cleared so the user picks new ones). */
export async function duplicateCampaign(userId, id) {
  const source = (await findOwned(userId, id)).toObject();
  const copy = Object.fromEntries(COPYABLE_FIELDS.map((field) => [field, source[field]]));

  return Campaign.create({
    ...copy,
    userId,
    name: `${source.name} (copy)`.slice(0, CAMPAIGN_LIMITS.name),
    status: CAMPAIGN_STATUS.DRAFT,
    startDate: null,
    endDate: null,
  });
}