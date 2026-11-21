import { BusinessProfile } from "../../../profiles/businessProfile.model.js";
import { ApiError } from "../../../../utils/ApiError.js";

const REQUIRED_CAMPAIGN_FIELDS = [
  ["name", "Campaign name"],
  ["productName", "Product or offer name"],
  ["objective", "Campaign objective"],
  ["audienceType", "Audience type"],
];

export function assertCampaignReady(campaign) {
  if (campaign.status === "completed") {
    throw ApiError.badRequest(
      "This campaign is completed. Duplicate it before generating new recommendations."
    );
  }

  const missing = REQUIRED_CAMPAIGN_FIELDS
    .filter(([field]) => !String(campaign[field] ?? "").trim())
    .map(([, label]) => label);

  if (!Array.isArray(campaign.targetLocations) || campaign.targetLocations.length === 0) {
    missing.push("At least one target location");
  }
  if (!Array.isArray(campaign.keywords) || campaign.keywords.length === 0) {
    missing.push("At least one campaign keyword");
  }

  if (missing.length) {
    throw ApiError.badRequest(
      `Complete these campaign details first: ${missing.join(", ")}.`
    );
  }
}

export async function buildCampaignContext(campaign, userId) {
  const profile = await BusinessProfile.findOne({ userId }).lean();

  return {
    campaign: {
      name: campaign.name,
      productName: campaign.productName,
      objective: campaign.objective,
      industry: campaign.industry || profile?.industry || "",
      description: campaign.description || "",
      targetLocations: campaign.targetLocations || [],
      audienceType: campaign.audienceType,
      keywords: campaign.keywords || [],
      audience: campaign.audience || "",
      interests: campaign.interests || "",
      extraNotes: campaign.extraNotes || "",
      budget: campaign.budget ?? null,
      budgetAiSuggested: Boolean(campaign.budgetAiSuggested),
      currency: campaign.currency || "PKR",
      startDate: campaign.startDate || null,
      endDate: campaign.endDate || null,
      channels: campaign.channels || [],
    },
    businessProfile: profile
      ? {
          businessName: profile.businessName || "",
          industry: profile.industry || "",
          productDescription: profile.productDescription || "",
          targetMarket: profile.targetMarket || "",
          sellsProducts: profile.sellsProducts ?? null,
        }
      : null,
  };
}
