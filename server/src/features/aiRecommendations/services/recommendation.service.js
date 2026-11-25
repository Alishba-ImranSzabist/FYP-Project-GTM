import { ApiError } from "../../../utils/ApiError.js";
import { Campaign } from "../../campaigns/campaign.model.js";
import { env } from "../../../config/env.js";
import { AIRecommendationAttempt } from "../models/aiRecommendationAttempt.model.js";
import { AIRecommendation } from "../models/aiRecommendation.model.js";
import { RECOMMENDATION_MODELS, RECOMMENDATION_STATUS } from "../constants/recommendation.constants.js";
import { buildCampaignContext, assertCampaignReady } from "./context/campaignContext.service.js";
import { buildRecommendationPrompts } from "./context/promptBuilder.service.js";
import { generateWithSelectedProvider } from "./providers/aiProvider.service.js";
import { normalizeRecommendationOutput, parseJsonObject } from "./recommendationOutput.service.js";
import { getOrCreateRecommendationConfig } from "./admin/recommendationConfig.service.js";

export function serializeRecommendation(document) {
  const result = document.toObject({ versionKey: false });
  result.id = String(result._id);
  result.campaignId = String(result.campaignId);
  result.reviewStatus = result.status;
  result.generatedAt = result.createdAt;
  result.mode = result.provider === "rules" ? "fallback" : "live";
  if (result.mode === "fallback") {
    delete result.overview.pilotEstimate;
    result.sections = result.sections.map((section) => section.id === "budget" && section.pilotBudget !== undefined ? {
      ...section,
      summary: "A budget recommendation requires Gemini.",
      range: { min: result.budgetMin, max: result.budgetMax },
      pilotBudget: false,
      note: result.budgetMax == null
        ? "Regenerate when Gemini is available for a budget recommendation based on your campaign dates and goals."
        : "The amount shown is your saved campaign budget. Regenerate for a Gemini budget recommendation.",
    } : section);
  }
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

const pendingGenerations = new Map();
let geminiCooldown = null;

export async function generateCampaignRecommendation(userId, input) {
  const key = JSON.stringify([String(userId), input.campaignId, input.model, input.recommendationStyle, input.previousRecommendationId]);
  const pending = pendingGenerations.get(key);
  if (pending) return pending;

  const generation = trackCampaignRecommendation(userId, input);
  pendingGenerations.set(key, generation);
  try {
    return await generation;
  } finally {
    pendingGenerations.delete(key);
  }
}

async function trackCampaignRecommendation(userId, input) {
  const startedAt = Date.now();
  const attempt = {
    userId,
    campaignId: input.campaignId,
    model: env.ai.geminiModel.replace(/^models\//, ""),
    outcome: "failed",
  };

  try {
    const result = await createCampaignRecommendation(userId, input, attempt);
    attempt.outcome = "gemini";
    attempt.recommendationId = result.id;
    return result;
  } catch (error) {
    attempt.errorStatus = error.statusCode || 500;
    throw error;
  } finally {
    if (attempt.campaignName !== undefined) {
      attempt.durationMs = Date.now() - startedAt;
      try {
        await AIRecommendationAttempt.create(attempt);
      } catch (error) {
        console.warn("[Recommendations] Attempt log write failed", { code: error.code, name: error.name });
      }
    }
  }
}

async function createCampaignRecommendation(userId, input, attempt) {
  const campaign = await Campaign.findOne({
    _id: input.campaignId,
    userId,
  });

  if (!campaign) throw ApiError.notFound("Campaign not found.");
  attempt.campaignName = campaign.name;
  assertCampaignReady(campaign);

  const modelConfig = RECOMMENDATION_MODELS[input.model];
  if (!modelConfig) throw ApiError.badRequest("Choose a supported AI model.");

  const [campaignContext, config] = await Promise.all([
    buildCampaignContext(campaign, userId),
    getOrCreateRecommendationConfig(),
  ]);

  const enabledSections = config.sections
    .filter((section) => section.enabled)
    .sort((a, b) => a.order - b.order)
    .map(({ id, title, prompt }) => ({
      id: id === "leadsignals" ? "leadSignals" : id,
      title,
      prompt,
    }));

  if (!enabledSections.length) {
    throw ApiError.conflict("No recommendation sections are enabled. Ask an administrator to configure them.");
  }

  const startedAt = Date.now();
  if (geminiCooldown && startedAt < geminiCooldown.retryAt) {
    const error = new ApiError(geminiCooldown.status, geminiCooldown.message);
    error.retryAfter = String(Math.ceil((geminiCooldown.retryAt - startedAt) / 1000));
    throw error;
  }

  const exampleFile = config.exampleFile;
  if (!exampleFile?.uri || !(exampleFile.expiresAt > new Date(startedAt + env.ai.requestTimeoutMs))) {
    throw new ApiError(503, "The Gemini campaign examples file is unavailable. Ask an administrator to run the examples refresh.");
  }
  const prompts = buildRecommendationPrompts({
    campaignContext,
    useExampleFile: true,
    sections: enabledSections,
    adminInstructions: config.adminInstructions,
    recommendationStyle: input.recommendationStyle,
  });

  let providerResult;
  try {
    providerResult = await generateWithSelectedProvider({ modelKey: input.model, ...prompts, exampleFile });
    geminiCooldown = null;
    attempt.providerStatus = 200;
    attempt.model = providerResult.providerModel;
    attempt.totalTokens = providerResult.totalTokens;
  } catch (error) {
    attempt.providerStatus = error.providerStatus;
    attempt.totalTokens = error.totalTokens;
    if ([429, 503, 504].includes(error.statusCode) && error.fallbackReason !== "not_configured") {
      error.retryAfter ??= "30";
      geminiCooldown = {
        status: error.statusCode,
        message: error.message,
        retryAt: Date.now() + Number(error.retryAfter) * 1000,
      };
    }
    throw error;
  }

  const parsed = parseJsonObject(providerResult.text);
  const returnedSections = new Set(parsed.sections?.map?.((section) => section?.id));
  if (!enabledSections.every(({ id }) => returnedSections.has(id))) {
    throw new ApiError(502, "Gemini omitted an enabled recommendation section. Please regenerate.");
  }
  const assessment = parsed.assessment;
  if (!["recommendation", "rationale", "validation"].every((field) =>
    typeof assessment?.[field] === "string" && assessment[field].trim()
  )) {
    throw new ApiError(502, "Gemini did not provide a complete campaign assessment. Please regenerate.");
  }
  const normalized = normalizeRecommendationOutput(parsed, {
    campaign: campaignContext.campaign,
    enabledSections,
  });
  const durationMs = Date.now() - startedAt;

  const recommendation = await AIRecommendation.create({
    userId,
    campaignId: campaign._id,
    ...normalized,
    status: RECOMMENDATION_STATUS.PENDING,
    modelId: input.model,
    provider: providerResult.provider,
    providerModel: providerResult.providerModel,
    recommendationStyle: input.recommendationStyle,
    contextMetadata: {
      configVersion: config.version,
      promptVersion: "1.7.0",
    },
    usage: {
      inputTokens: providerResult.inputTokens,
      outputTokens: providerResult.outputTokens,
      thinkingTokens: providerResult.thinkingTokens,
      cachedInputTokens: providerResult.cachedInputTokens,
      totalTokens: providerResult.totalTokens,
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
