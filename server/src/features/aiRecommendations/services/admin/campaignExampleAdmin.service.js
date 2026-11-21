import { ApiError } from "../../../../utils/ApiError.js";
import { CampaignExample } from "../../models/campaignExample.model.js";
import { EXAMPLE_REVIEW_STATUS } from "../../constants/recommendation.constants.js";

export async function listCampaignExamples({ reviewStatus, page, limit }) {
  const filter =
    reviewStatus === "all"
      ? {}
      : { "dataQuality.reviewStatus": reviewStatus };

  const [examples, total] = await Promise.all([
    CampaignExample.find(filter)
      .sort({ exampleId: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    CampaignExample.countDocuments(filter),
  ]);

  return {
    examples: examples.map((example) => ({
      ...example,
      id: String(example._id),
      _id: undefined,
    })),
    total,
    page,
    pages: Math.ceil(total / limit),
  };
}

export async function reviewCampaignExample(adminId, exampleId, { action, comment }) {
  const example = await CampaignExample.findById(exampleId);
  if (!example) throw ApiError.notFound("Campaign example not found.");

  const approved = action === "approve";
  example.set(
    "dataQuality.reviewStatus",
    approved ? EXAMPLE_REVIEW_STATUS.APPROVED : EXAMPLE_REVIEW_STATUS.REJECTED
  );
  example.set("dataQuality.isActive", approved);
  example.set("dataQuality.reviewedBy", adminId);
  example.set("dataQuality.reviewedAt", new Date());
  example.set("dataQuality.reviewComment", comment || "");

  await example.save();

  return {
    id: String(example._id),
    exampleId: example.exampleId,
    campaignName: example.campaignName,
    reviewStatus: example.dataQuality?.reviewStatus,
    isActive: example.dataQuality?.isActive,
    reviewedAt: example.dataQuality?.reviewedAt,
  };
}
