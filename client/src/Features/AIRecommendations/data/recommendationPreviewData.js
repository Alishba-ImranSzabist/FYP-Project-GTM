/**
 * Sample recommendation payload for the frontend-only phase.
 * This is demonstration content, not a real AI response or market research.
 */

const number = (value) => Math.round(Number(value) || 0);
const money = (value) => `PKR ${number(value).toLocaleString("en-US")}`;

function getBudgetRange(campaign) {
  const enteredBudget = Number(campaign.budget);

  if (Number.isFinite(enteredBudget) && enteredBudget > 0 && !campaign.budgetAiSuggested) {
    return {
      min: number(enteredBudget * 0.85),
      max: number(enteredBudget * 1.15),
    };
  }

  return { min: 120000, max: 180000 };
}

function getAudienceLabel(audienceType) {
  if (audienceType === "b2b") return "Growth-focused business decision-makers";
  if (audienceType === "both") return "Interested consumers and relevant businesses";
  if (audienceType === "customers") return "Customers actively comparing similar products";
  return "Style-conscious and product-aware consumers";
}

export function createMockRecommendations(campaign, modelId, recommendationStyle = "balanced") {
  const product = campaign.productName || campaign.name || "your product";
  const locations = (campaign.targetLocations || []).join(", ") || "your selected market";
  const budget = getBudgetRange(campaign);
  const totalBudget = number((budget.min + budget.max) / 2);
  const currency = campaign.currency || "PKR";
  const keywords = (campaign.keywords || []).slice(0, 8);
  const audienceLabel = getAudienceLabel(campaign.audienceType);

  const allocations = [
    { label: "Social media promotion", percentage: 40, purpose: "Reach and engagement" },
    { label: "Creator collaborations", percentage: 30, purpose: "Trust and product discovery" },
    { label: "Content production", percentage: 20, purpose: "Reels, photography and copy" },
    { label: "Testing and contingency", percentage: 10, purpose: "Test creatives and optimize" },
  ].map((item) => ({
    ...item,
    amount: number((totalBudget * item.percentage) / 100),
  }));

  return {
    id: `preview-${campaign.id}-${Date.now()}`,
    campaignId: campaign.id,
    campaignName: campaign.name,
    modelId,
    recommendationStyle,
    generatedAt: new Date().toISOString(),
    mode: "preview",
    reviewStatus: "pending",
    overview: {
      audience: audienceLabel,
      audienceMatch: 92,
      budgetMin: budget.min,
      budgetMax: budget.max,
      currency,
      topChannel: "Instagram + Email",
      targetLocations: locations,
    },
    sections: [
      {
        id: "audience",
        summary: `Prioritize the audience most likely to respond to ${product} in ${locations}. These are illustrative segments and should be checked against campaign results.`,
        items: [
          {
            title: audienceLabel,
            label: "Primary audience",
            match: 92,
            description: `People in ${locations} who show interest in ${product}, related products and the campaign's stated objective.`,
            reason: "Strongest initial fit with the campaign information supplied.",
          },
          {
            title: "Seasonal and occasion-based shoppers",
            label: "Secondary segment",
            match: 76,
            description: "People planning purchases around seasonal events, gifting occasions or upcoming needs.",
            reason: "Useful for testing time-sensitive creative and promotional offers.",
          },
          {
            title: "Retailers and relevant resellers",
            label: "Growth opportunity",
            match: 64,
            description: "Relevant shops, distributors or resellers that may be interested in stocking or recommending the offer.",
            reason: "Use this segment only if the business supports wholesale or partnership sales.",
          },
        ],
      },
      {
        id: "channels",
        summary: "Start with a small channel mix, compare results and move more budget toward channels that produce qualified enquiries or sales.",
        items: [
          {
            title: "Instagram",
            priority: "High priority",
            purpose: "Product discovery and visual storytelling",
            formats: "Reels, Stories, carousels and creator content",
            reason: "A practical first test when the offer can be demonstrated visually.",
          },
          {
            title: "Facebook",
            priority: "High priority",
            purpose: "Local reach and retargeting",
            formats: "Short videos, community posts and lead forms",
            reason: "Useful for location-based reach and audiences that engage with local pages.",
          },
          {
            title: "TikTok",
            priority: "Test channel",
            purpose: "Short-form discovery",
            formats: "Demonstrations, creator clips and trend-adapted videos",
            reason: "Test organic and paid creative before increasing spend.",
          },
          {
            title: "Email",
            priority: "Support channel",
            purpose: "Follow-up and conversion",
            formats: "Offer announcements, product details and reminders",
            reason: "Best used with a permission-based contact list and clear opt-out.",
          },
        ],
      },
      {
        id: "budget",
        summary: `Illustrative allocation for a working budget near ${money(totalBudget)}. Adjust the amounts after checking actual channel costs and campaign performance.`,
        range: budget,
        currency,
        allocations,
        note: "The allocation is a planning estimate, not a guaranteed return or fixed media price.",
      },
      {
        id: "content",
        summary: `Use a consistent message around the main benefit of ${product}. Mix educational, proof-led and promotional content instead of publishing only sales posts.`,
        pillars: [
          {
            title: "Product benefits",
            format: "Short reels and carousels",
            hook: `Show the problem ${product} solves in the first few seconds.`,
            goal: "Awareness",
          },
          {
            title: "How it works",
            format: "Demonstration videos",
            hook: "Explain the product or service in a simple step-by-step format.",
            goal: "Consideration",
          },
          {
            title: "Customer questions",
            format: "FAQ posts and Stories",
            hook: "Answer common questions about price, quality, delivery or results.",
            goal: "Trust",
          },
          {
            title: "Offer and call to action",
            format: "Offer creatives and testimonials",
            hook: "Make the next step clear: enquire, visit, book or buy.",
            goal: "Conversion",
          },
        ],
      },
      {
        id: "leadSignals",
        summary: "Use these phrases as discovery starting points. Validate intent and relevance before treating any person or business as a lead.",
        keywords: [...new Set([
          ...keywords,
          `${product} in ${locations}`,
          `looking for ${product}`,
          `${product} price`,
          `${product} supplier`,
        ])].slice(0, 12),
        signals: [
          {
            title: "Explicit need",
            description: "Public posts asking for recommendations, prices, suppliers or help related to the offer.",
          },
          {
            title: "Relevant engagement",
            description: "Recent public engagement with comparable products, services or industry topics.",
          },
          {
            title: "Business fit",
            description: "Public business profiles whose category, location and offering match the campaign.",
          },
          {
            title: "Purchase readiness",
            description: "Publicly stated timelines, product comparisons or requests for quotations.",
          },
        ],
        guardrail: "Use only publicly available information, follow platform terms and privacy rules, and verify fit before outreach.",
      },
      {
        id: "schedule",
        summary: "Begin with a four-week test plan. Treat the suggested posting windows as hypotheses and refine them using the account's own analytics.",
        duration:
          campaign.startDate && campaign.endDate
            ? "Use the campaign dates already selected"
            : "Suggested test duration: 4 weeks",
        windows: ["12:00 PM – 2:00 PM", "6:00 PM – 9:00 PM"],
        weeks: [
          { week: "Week 1", title: "Test", detail: "Test different hooks, formats and audience groups." },
          { week: "Week 2", title: "Compare", detail: "Compare reach, saves, clicks and qualified enquiries." },
          { week: "Week 3", title: "Optimize", detail: "Focus on the strongest creative and audience combinations." },
          { week: "Week 4", title: "Review", detail: "Review results, budget use and next-step opportunities." },
        ],
        note: "Posting windows vary by audience. Confirm them with real account analytics before scheduling at scale.",
      },
    ],
  };
}

export { money as formatRecommendationMoney };
