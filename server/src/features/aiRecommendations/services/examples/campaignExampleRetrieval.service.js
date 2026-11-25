import { CampaignExample } from "../../models/campaignExample.model.js";
import { scoreCampaignExample } from "./exampleScoring.service.js";

const MAX_EXAMPLES = 5;

export const campaignEvidenceFilter = {
  exampleId: { $type: "string", $regex: /\S/ },
  recordType: "published_case_study",
  "dataQuality.verificationStatus": "publisher_or_case_author_reported",
  "usagePolicy.canInformStrategy": true,
  "source.publisher": { $type: "string", $regex: /\S/ },
  "source.sourceTitle": { $type: "string", $regex: /\S/ },
  "source.sourceUrl": { $type: "string", $regex: /^https?:\/\/[^\s/]+/i },
  "dataQuality.reviewStatus": { $ne: "rejected" },
};

export async function retrieveRelevantCampaignExamples(campaign) {
  const examples = await CampaignExample.find(campaignEvidenceFilter, null, { strictQuery: false })
    .sort({ exampleId: 1 })
    .lean();

  return examples
    .map((example) => ({ example, score: scoreCampaignExample(example, campaign) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_EXAMPLES)
    .map(({ example }) => ({
      ...example,
      limitations: example.dataQuality?.limitations || [],
    }));
}
