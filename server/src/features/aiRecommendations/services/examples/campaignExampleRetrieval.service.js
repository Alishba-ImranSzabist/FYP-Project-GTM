import { MAX_RETRIEVED_EXAMPLES } from "../../constants/recommendation.constants.js";
import { CampaignExample } from "../../models/campaignExample.model.js";
import { scoreCampaignExample } from "./exampleScoring.service.js";

/**
 * Retrieves only admin-approved, active campaign examples.
 * The current dataset is small (approximately 100 records), so a transparent
 * weighted keyword/metadata ranker is sufficient; no vector DB is required.
 */
export async function retrieveRelevantCampaignExamples(
  campaign,
  limit = MAX_RETRIEVED_EXAMPLES
) {
  const safeLimit = Math.max(1, Math.min(Number(limit) || MAX_RETRIEVED_EXAMPLES, MAX_RETRIEVED_EXAMPLES));

  const approvedExamples = await CampaignExample.find({
    "dataQuality.reviewStatus": "approved",
    "dataQuality.isActive": true,
  })
    .limit(500)
    .lean();

  return approvedExamples
    .map((example) => ({
      example,
      relevanceScore: scoreCampaignExample(example, campaign),
    }))
    .filter((item) => item.relevanceScore > 0)
    .sort((a, b) => {
      if (b.relevanceScore !== a.relevanceScore) {
        return b.relevanceScore - a.relevanceScore;
      }
      return String(a.example.exampleId || a.example._id).localeCompare(
        String(b.example.exampleId || b.example._id)
      );
    })
    .slice(0, safeLimit)
    .map(({ example, relevanceScore }) => ({
      exampleId: example.exampleId || String(example._id),
      campaignName: example.campaignName || "",
      platform: example.platform || "",
      industry: example.industry || "",
      productCategory: example.productCategory || "",
      objective: example.objective || "",
      market: example.market || {},
      targetAudience: example.targetAudience || {},
      channels: example.channels || [],
      adFormats: example.adFormats || [],
      strategyPatterns: example.strategyPatterns || [],
      contentPatterns: example.contentPatterns || [],
      reportedResults: example.reportedResults || [],
      source: example.source || {},
      limitations: example.dataQuality?.limitations || [],
      verificationStatus: example.dataQuality?.verificationStatus || "",
      relevanceScore,
    }));
}
