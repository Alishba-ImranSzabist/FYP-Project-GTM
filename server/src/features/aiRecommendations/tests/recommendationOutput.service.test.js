import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeRecommendationOutput,
  parseJsonObject,
} from "../services/recommendationOutput.service.js";

test("parseJsonObject accepts plain and fenced JSON", () => {
  assert.deepEqual(parseJsonObject('{"ok":true}'), { ok: true });
  assert.deepEqual(parseJsonObject('```json\n{"ok":true}\n```'), { ok: true });
});

test("normalizer validates sections and only resolves evidence IDs from approved examples", () => {
  const campaign = {
    audienceType: "B2C",
    targetLocations: ["Karachi"],
    keywords: ["velvet", "winter fashion"],
    channels: ["Instagram", "Facebook"],
    budget: 200000,
    currency: "PKR",
  };

  const enabledSections = [
    { id: "audience", title: "Target Audience Recommendation" },
    { id: "channels", title: "Marketing Channel Recommendation" },
    { id: "budget", title: "Budget Allocation Recommendation" },
    { id: "content", title: "Content Strategy Recommendation" },
    { id: "leadSignals", title: "Lead Discovery Signals & Keywords" },
    { id: "schedule", title: "Posting Time & Campaign Duration" },
    { id: "customSection", title: "Custom Admin Section" },
  ];

  const approvedExamples = [
    {
      exampleId: "SYN-001",
      campaignName: "Winter Fashion Campaign",
      source: {
        publisher: "Example Publisher",
        sourceTitle: "Winter Fashion Case Study",
        sourceUrl: "https://example.org/case-study",
      },
      limitations: ["Small sample size"],
    },
  ];

  const raw = {
    overview: {
      audience: "Women aged 20–40 interested in winter fashion",
      audienceMatch: 72,
      budgetMin: 180000,
      budgetMax: 200000,
      currency: "PKR",
      topChannel: "Instagram + Facebook",
      targetLocations: "Karachi",
    },
    suggestedDate: "2026-12-01",
    strategy: "Test creative formats and refine using campaign results.",
    sections: [
      {
        id: "audience",
        summary: "Focus on relevant fashion shoppers.",
        items: [{
          title: "Women aged 20–40",
          label: "Primary audience",
          match: 72,
          description: "Interested in winter fashion.",
          reason: "Matches the product and campaign audience.",
        }],
        evidence: { exampleIds: ["SYN-001", "NOT-APPROVED-999"], note: "Context only." },
      },
      {
        id: "channels",
        summary: "Start with visual social channels.",
        items: [{
          title: "Instagram",
          priority: "High priority",
          purpose: "Product discovery",
          formats: "Reels and carousels",
          reason: "Visual product fit.",
        }],
        evidence: { exampleIds: ["SYN-001"], note: "Comparable apparel campaign." },
      },
      {
        id: "budget",
        summary: "Use a measured test allocation.",
        range: { min: 180000, max: 200000 },
        currency: "PKR",
        allocations: [{
          label: "Paid social testing",
          percentage: 100,
          amount: 190000,
          purpose: "Test and optimize creative.",
        }],
        note: "Planning estimate.",
        evidence: { exampleIds: [], note: "No directly comparable budget evidence." },
      },
      {
        id: "content",
        summary: "Use product-led content.",
        pillars: [{
          title: "Fabric and styling",
          format: "Short video",
          hook: "Show velvet texture and fit.",
          goal: "Consideration",
        }],
      },
      {
        id: "leadSignals",
        summary: "Use relevant public search intent.",
        keywords: ["velvet dresses", "winter fashion"],
        signals: [{ title: "Product enquiries", description: "Public comments asking about price or availability." }],
        guardrail: "Use public, relevant information only.",
      },
      {
        id: "schedule",
        summary: "Use a phased monthly test.",
        duration: "30 days",
        windows: ["Evening test window"],
        weeks: [{ week: "Week 1", title: "Test", detail: "Compare creative variations." }],
        note: "Confirm with account analytics.",
      },
      {
        id: "customSection",
        summary: "Admin-added recommendation.",
        content: {
          recommendation: "Run a small creative test.",
          keyPoints: ["Test two product videos"],
          rationale: "Compare engagement before scaling.",
        },
      },
    ],
  };

  const result = normalizeRecommendationOutput(raw, {
    campaign,
    enabledSections,
    approvedExamples,
  });

  assert.equal(result.sections.length, 7);
  assert.equal(result.overview.budgetMin, 180000);
  assert.equal(result.sections[0].evidence.examples.length, 1);
  assert.equal(result.sections[0].evidence.examples[0].exampleId, "SYN-001");
  assert.equal(result.sections[0].evidence.examples[0].sourceTitle, "Winter Fashion Case Study");
  assert.equal(result.sections[2].evidence.examples.length, 0);
  assert.equal(result.sections[6].content.recommendation, "Run a small creative test.");
});
