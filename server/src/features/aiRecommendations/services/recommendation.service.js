import { ApiError } from "../../../utils/ApiError.js";
import { Campaign } from "../../campaigns/campaign.model.js";
import { AIRecommendation } from "../models/aiRecommendation.model.js";
import { RECOMMENDATION_MODELS, RECOMMENDATION_STATUS } from "../constants/recommendation.constants.js";
import { buildCampaignContext, assertCampaignReady } from "./context/campaignContext.service.js";
import { buildRecommendationPrompts } from "./context/promptBuilder.service.js";
import { retrieveRelevantCampaignExamples } from "./examples/campaignExampleRetrieval.service.js";
import { generateWithSelectedProvider } from "./providers/aiProvider.service.js";
import { normalizeRecommendationOutput, parseJsonObject } from "./recommendationOutput.service.js";
import { getOrCreateRecommendationConfig } from "./admin/recommendationConfig.service.js";

export function serializeRecommendation(document) {
  const result = document.toObject({ versionKey: false });
  result.id = String(result._id);
  result.campaignId = String(result.campaignId);
  result.reviewStatus = result.status;
  result.generatedAt = result.createdAt;
  result.mode = "live";
  result.model = {
    id: result.modelId,
    provider: result.provider,
    providerModel: result.providerModel,
  };

  delete result._id;
  delete result.__v;
  delete result.userId;
  return result;
}

export async function generateCampaignRecommendation(userId, input) {
  const campaign = await Campaign.findOne({
    _id: input.campaignId,
    userId,
  });

  if (!campaign) throw ApiError.notFound("Campaign not found.");
  assertCampaignReady(campaign);

  const modelConfig = RECOMMENDATION_MODELS[input.model];
  if (!modelConfig) throw ApiError.badRequest("Choose a supported AI model.");

  const [campaignContext, approvedExamples, config] = await Promise.all([
    buildCampaignContext(campaign, userId),
    retrieveRelevantCampaignExamples(campaign),
    getOrCreateRecommendationConfig(),
  ]);

  const enabledSections = config.sections
    .filter((section) => section.enabled)
    .sort((a, b) => a.order - b.order);

  if (!enabledSections.length) {
    throw ApiError.conflict("No recommendation sections are enabled. Ask an administrator to configure them.");
  }

  const prompts = buildRecommendationPrompts({
    campaignContext,
    approvedExamples,
    sections: enabledSections,
    recommendationStyle: input.recommendationStyle,
  });

  const startedAt = Date.now();
  const providerResult = await generateWithSelectedProvider({
    modelKey: input.model,
    ...prompts,
  });
  const durationMs = Date.now() - startedAt;

  const parsed = parseJsonObject(providerResult.text);
  const normalized = normalizeRecommendationOutput(parsed, {
    campaign: campaignContext.campaign,
    enabledSections,
    approvedExamples,
  });

  const examplesUsed = approvedExamples.map((example) => ({
    exampleId: example.exampleId,
    campaignName: example.campaignName,
    publisher: example.source?.publisher || "",
    sourceTitle: example.source?.sourceTitle || "",
    sourceUrl: example.source?.sourceUrl || "",
    limitations: example.limitations || [],
  }));

  const recommendation = await AIRecommendation.create({
    userId,
    campaignId: campaign._id,
    ...normalized,
    status: RECOMMENDATION_STATUS.PENDING,
    modelId: input.model,
    provider: providerResult.provider,
    providerModel: providerResult.providerModel,
    recommendationStyle: input.recommendationStyle,
    examplesUsed,
    contextMetadata: {
      retrievalCount: approvedExamples.length,
      exampleIds: approvedExamples.map((example) => example.exampleId),
      configVersion: config.version,
      promptVersion: "1.0.0",
    },
    usage: {
      inputTokens: providerResult.inputTokens,
      outputTokens: providerResult.outputTokens,
      durationMs,
    },
  });

  return serializeRecommendation(recommendation);
}

export async function listUserRecommendations(userId, { campaignId, page, limit }) {
  const filter = {
    userId,
    ...(campaignId ? { campaignId } : {}),
  };

  const [documents, total] = await Promise.all([
    AIRecommendation.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    AIRecommendation.countDocuments(filter),
  ]);

  return {
    recommendations: documents.map(serializeRecommendation),
    total,
    page,
    pages: Math.ceil(total / limit),
  };
}

export async function getUserRecommendation(userId, id) {
  const document = await AIRecommendation.findOne({ _id: id, userId });
  if (!document) throw ApiError.notFound("Recommendation not found.");
  return serializeRecommendation(document);
}

async function findOwnedRecommendation(userId, id) {
  const document = await AIRecommendation.findOne({ _id: id, userId });
  if (!document) throw ApiError.notFound("Recommendation not found.");
  return document;
}

export async function saveRecommendationDraft(userId, id) {
  const document = await findOwnedRecommendation(userId, id);
  if (document.status === RECOMMENDATION_STATUS.APPROVED) {
    throw ApiError.conflict("An approved recommendation cannot be changed back to draft.");
  }
  document.status = RECOMMENDATION_STATUS.DRAFT;
  document.review = {
    reviewedBy: null,
    reviewedAt: null,
    comment: "",
  };
  await document.save();
  return serializeRecommendation(document);
}

export async function approveUserRecommendation(userId, id, comment = "") {
  const document = await findOwnedRecommendation(userId, id);
  if (document.status === RECOMMENDATION_STATUS.REJECTED) {
    throw ApiError.conflict("A rejected recommendation cannot be approved. Generate a new recommendation.");
  }
  await document.accept(userId, comment);
  return serializeRecommendation(document);
}

export async function rejectUserRecommendation(userId, id, comment = "") {
  const document = await findOwnedRecommendation(userId, id);
  await document.reject(userId, comment);
  return serializeRecommendation(document);
}
