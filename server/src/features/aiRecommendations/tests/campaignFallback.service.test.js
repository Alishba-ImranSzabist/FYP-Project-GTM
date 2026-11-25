import assert from "node:assert/strict";
import { test } from "node:test";
import { buildCampaignFallback } from "../services/campaignFallback.service.js";

const campaign = {
  targetLocations: ["Gulberg, Lahore"],
  productName: "Takeaway packaging",
  audienceType: "b2b",
  objective: "generate_leads",
  channels: ["email", "instagram"],
  keywords: ["restaurant packaging"],
  currency: "PKR",
};
const budgetSection = [{ id: "budget", title: "Budget Allocation Recommendation" }];

test("fallback leaves the budget open when the campaign asks Gemini for an estimate", () => {
  const plan = buildCampaignFallback(
    { ...campaign, budget: 60000, budgetAiSuggested: true },
    budgetSection,
    "balanced",
  );

  assert.equal(plan.budgetMax, null);
  assert.deepEqual(plan.sections[0].range, { min: null, max: null });
  assert.equal(plan.sections[0].currency, "PKR");
});

test("fallback only displays the saved budget when the campaign sets one", () => {
  const plan = buildCampaignFallback({ ...campaign, budget: 60000 }, budgetSection, "balanced");

  assert.equal(plan.budgetMax, 60000);
  assert.deepEqual(plan.sections[0].range, { min: 60000, max: 60000 });
});
