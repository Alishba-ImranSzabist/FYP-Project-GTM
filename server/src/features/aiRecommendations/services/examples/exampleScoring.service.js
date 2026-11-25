const normalize = (value) =>
  String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9\s&-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const words = (value) =>
  new Set(
    normalize(value)
      .split(" ")
      .filter((word) => word.length > 2)
  );

function overlapCount(left, right) {
  const a = words(left);
  const b = words(right);
  let matches = 0;
  for (const word of a) {
    if (b.has(word)) matches += 1;
  }
  return matches;
}

function channelMatches(platform, channels = []) {
  const platformText = normalize(platform);
  const channelText = normalize(Array.isArray(channels) ? channels.join(" ") : channels);
  if (!platformText || !channelText) return false;

  if (platformText.includes("meta")) {
    return /facebook|instagram|meta/.test(channelText);
  }
  if (platformText.includes("google")) {
    return /google|youtube|display|search/.test(channelText);
  }
  if (platformText.includes("tiktok")) {
    return channelText.includes("tiktok");
  }
  return overlapCount(platformText, channelText) > 0;
}

/**
 * Heuristic relevance score for ranking only. It is not a probability,
 * confidence score, or evidence of campaign performance.
 */
export function scoreCampaignExample(example, campaign) {
  let score = 0;

  score += Math.min(overlapCount(example.industry, campaign.industry), 3) * 4;

  score +=
    Math.min(
      overlapCount(
        example.productCategory,
        `${campaign.productName || ""} ${campaign.description || ""} ${(Array.isArray(campaign.keywords) ? campaign.keywords : []).join(" ")}`
      ),
      4
    ) * 2;

  score += Math.min(overlapCount(example.objective, campaign.objective), 3) * 3;

  const exampleAudience = [
    ...(Array.isArray(example.targetAudience?.segments)
      ? example.targetAudience.segments
      : []),
    ...(Array.isArray(example.tags) ? example.tags : []),
  ].join(" ");

  const campaignAudience = [
    campaign.audience || "",
    campaign.interests || "",
    campaign.audienceType || "",
    ...(Array.isArray(campaign.keywords) ? campaign.keywords : []),
  ].join(" ");

  score += Math.min(overlapCount(exampleAudience, campaignAudience), 5);

  if (channelMatches(example.platform, campaign.channels)) score += 3;

  const exampleMarket = `${example.market?.country || ""} ${example.market?.city_or_region || ""}`;
  const campaignMarket = (Array.isArray(campaign.targetLocations) ? campaign.targetLocations : []).join(" ");
  if (overlapCount(exampleMarket, campaignMarket) > 0) score += 2;

  const campaignKeywords = Array.isArray(campaign.keywords) ? campaign.keywords : [];
  const exampleText = normalize(
    `${example.campaignName || ""} ${(Array.isArray(example.strategyPatterns) ? example.strategyPatterns : []).join(" ")} ${(Array.isArray(example.tags) ? example.tags : []).join(" ")}`
  );

  const keywordMatches = campaignKeywords.filter((keyword) =>
    normalize(keyword) && exampleText.includes(normalize(keyword))
  ).length;

  score += Math.min(keywordMatches, 4) * 2;

  return score;
}
