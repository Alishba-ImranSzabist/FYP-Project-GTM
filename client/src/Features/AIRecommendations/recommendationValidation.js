/**
 * Pure validation helpers for AI Recommendations.
 * These checks run before a generation request so incomplete campaigns are
 * explained to the user instead of sending unusable input to the AI service.
 */

const hasText = (value) => typeof value === "string" && value.trim().length > 0;
const hasItems = (value) => Array.isArray(value) && value.some((item) => hasText(item));

export function getRecommendationReadiness(campaign) {
  if (!campaign) {
    return {
      isReady: false,
      missingFields: ["Select a campaign first."],
    };
  }

  if (campaign.status === "completed") {
    return {
      isReady: false,
      missingFields: ["This campaign is completed. Duplicate it to create new recommendations."],
    };
  }

  const missingFields = [];

  if (!hasText(campaign.name)) missingFields.push("Campaign name");
  if (!hasText(campaign.productName)) missingFields.push("Product or offer name");
  if (!hasText(campaign.objective)) missingFields.push("Campaign objective");
  if (!hasText(campaign.audienceType)) missingFields.push("Audience type");
  if (!hasItems(campaign.targetLocations)) missingFields.push("At least one target location");
  if (!hasItems(campaign.keywords)) missingFields.push("At least one campaign keyword");

  return {
    isReady: missingFields.length === 0,
    missingFields,
  };
}

export function getRecommendationReadinessMessage(readiness) {
  if (readiness.isReady) return "This campaign has the minimum details needed for recommendations.";
  if (readiness.missingFields.length === 1 && readiness.missingFields[0].startsWith("This campaign")) {
    return readiness.missingFields[0];
  }
  return `Complete these campaign details first: ${readiness.missingFields.join(", ")}.`;
}
