import test from "node:test";
import assert from "node:assert/strict";
import { buildRecommendationPrompts } from "../services/context/promptBuilder.service.js";

test("prompt builder combines campaign context, approved examples and admin section prompts", () => {
  const campaignContext = {
    campaign: {
      name: "Velvet Winter Collection 2026",
      productName: "Premium Velvet Collection",
      objective: "Drive Sales",
      targetLocations: ["Karachi", "Lahore"],
      budget: 200000,
      currency: "PKR",
    },
    businessProfile: {
      businessName: "Sample Fashion House",
      industry: "Fashion",
    },
  };

  const approvedExamples = [
    {
      exampleId: "SYN-001",
      campaignName: "Winter Apparel Campaign",
      industry: "Fashion",
      source: { publisher: "Example Publisher", sourceTitle: "Winter Apparel Case Study" },
      relevanceScore: 18,
    },
  ];

  const sections = [
    {
      id: "audience",
      title: "Target Audience Recommendation",
      prompt: "Prioritize the audience segments most relevant to this campaign.",
      enabled: true,
      order: 0,
    },
  ];

  const result = buildRecommendationPrompts({
    campaignContext,
    approvedExamples,
    sections,
    recommendationStyle: "balanced",
  });

  const userPrompt = JSON.parse(result.userPrompt);

  assert.equal(userPrompt.campaign.name, "Velvet Winter Collection 2026");
  assert.equal(userPrompt.businessProfile.businessName, "Sample Fashion House");
  assert.equal(userPrompt.approvedCampaignExamples[0].exampleId, "SYN-001");
  assert.equal(
    userPrompt.requiredOutputContract.sections[0].evidence.exampleIds[0].includes("exact exampleId"),
    true
  );
  assert.match(result.systemPrompt, /Never invent an ID/);
  assert.match(result.systemPrompt, /approved campaign examples/);
});
