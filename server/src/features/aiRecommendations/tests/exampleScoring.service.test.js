import test from "node:test";
import assert from "node:assert/strict";
import { scoreCampaignExample } from "../services/examples/exampleScoring.service.js";

const campaign = {
  industry: "Fashion and Apparel",
  productName: "Premium Velvet Dresses",
  description: "Women's winter velvet collection",
  objective: "Drive Sales",
  audienceType: "B2C",
  audience: "Women aged 20 to 40",
  interests: "Fashion, winter clothing, ethnic wear",
  keywords: ["velvet dresses", "winter fashion"],
  targetLocations: ["Karachi", "Lahore"],
  channels: ["Instagram", "Facebook"],
};

test("matching industry, product, objective, audience, channel and market score higher", () => {
  const relevant = {
    exampleId: "SYN-001",
    campaignName: "Winter Velvet Fashion Sales",
    industry: "Fashion Apparel",
    productCategory: "Women's velvet clothing",
    objective: "Drive Sales",
    platform: "Meta",
    targetAudience: { segments: ["Women 20-40", "fashion shoppers"] },
    tags: ["velvet dresses", "winter fashion"],
    market: { country: "Pakistan", city_or_region: "Karachi" },
    strategyPatterns: ["winter fashion product videos"],
  };

  const irrelevant = {
    exampleId: "SYN-099",
    campaignName: "Cloud Accounting Lead Generation",
    industry: "Software",
    productCategory: "B2B accounting SaaS",
    objective: "Generate Leads",
    platform: "LinkedIn",
    targetAudience: { segments: ["Finance directors"] },
    tags: ["accounting", "enterprise software"],
    market: { country: "United States", city_or_region: "Austin" },
    strategyPatterns: ["whitepaper downloads"],
  };

  assert.ok(scoreCampaignExample(relevant, campaign) > scoreCampaignExample(irrelevant, campaign));
});

test("unmatched example receives a zero score", () => {
  const unrelated = {
    industry: "Agriculture",
    productCategory: "Industrial fertilizer",
    objective: "Awareness",
    platform: "YouTube",
    targetAudience: { segments: ["Farm operators"] },
    tags: ["fertilizer", "crops"],
    market: { country: "Brazil", city_or_region: "Sao Paulo" },
    strategyPatterns: ["farm equipment"],
  };

  assert.equal(scoreCampaignExample(unrelated, campaign), 0);
});
