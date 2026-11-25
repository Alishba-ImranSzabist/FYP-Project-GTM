export function buildCampaignFallback(campaign, enabledSections, style) {
  const locations = campaign.targetLocations.join(", ");
  const product = campaign.productName;
  const audience = campaign.audience || `${campaign.audienceType} audience in ${locations}`;
  const hasBudget = Number.isFinite(campaign.budget) && !campaign.budgetAiSuggested;
  const budget = hasBudget ? campaign.budget : null;
  const primaryMarket = campaign.targetLocations[0] || "the target market";
  const businessCampaign = campaign.audienceType === "b2b";
  const metric = {
    generate_leads: "qualified enquiries",
    drive_sales: "completed orders",
    brand_awareness: "relevant reach and engagement",
    launch_product: "enquiries or sign-ups for the launch",
  }[campaign.objective] || "responses tied to your campaign objective";
  const channelPlans = {
    email: {
      purpose: businessCampaign ? "Invite qualified businesses to request a sample or quote" : "Follow up with interested customers",
      formats: `Send a short email featuring ${product} and one clear next step. Use your opt-in list.`,
      reason: "Track replies and product link clicks.",
    },
    instagram: {
      purpose: "Show the product in use",
      formats: `Post a Reel or carousel showing ${product}. Invite people to visit the product page or send a message.`,
      reason: "Track product link clicks and relevant messages.",
    },
  };
  const sections = new Map(Object.entries({
    audience: {
      summary: `Start in ${primaryMarket} and verify that the saved audience is a good fit before expanding.`,
      items: [{ title: audience, label: "Initial test audience", match: null, description: businessCampaign ? "Start with decision-makers at businesses that already buy this product category." : `Start with shoppers actively comparing products like ${product}.`, reason: `Use ${metric} to check fit before widening the audience.` }],
    },
    channels: {
      summary: `Use each saved channel for a distinct purpose and compare ${metric} before committing more spend.`,
      items: campaign.channels.slice(0, 3).map((channel) => ({
        title: channel,
        ...channelPlans[channel],
      })),
    },
    budget: {
      summary: "A budget recommendation requires Gemini.",
      range: { min: budget, max: budget },
      currency: campaign.currency,
      allocations: [],
      note: hasBudget
        ? "The amount shown is your saved campaign budget. Regenerate for a Gemini budget recommendation."
        : "Regenerate when Gemini is available for a budget recommendation based on your campaign dates and goals.",
    },
    content: {
      summary: `Show customers how to evaluate ${product}.`,
      pillars: [
        { title: "Product demonstration", format: "Short video or image carousel", hook: `Show the main benefit of ${product} in use.`, goal: "Awareness" },
        { title: "Buying questions", format: "FAQ post", hook: "Answer a common customer question and give one clear next step.", goal: "Consideration" },
      ],
    },
    leadSignals: {
      summary: "Use campaign keywords to review relevant public buying signals.",
      keywords: campaign.keywords.slice(0, 12),
      signals: [{ title: businessCampaign ? "Public evidence of product fit" : "Public product questions", description: businessCampaign ? `Look for public business listings in ${primaryMarket} that already advertise a product or service related to ${product}, then verify relevance.` : `Look for public questions about availability or alternatives to ${product} in ${locations}.` }],
      guardrail: "Use public information and verify relevance before contacting anyone.",
    },
    schedule: {
      summary: "Plan a small test within the campaign dates.",
      duration: "Use the saved campaign dates.",
      windows: [],
      weeks: [
        { week: "Setup", title: "Prepare the test", detail: `Start with one segment in ${primaryMarket} and set up tracking for ${metric}.` },
        { week: "Review", title: "Check early results", detail: `Review ${metric} after the first week, or before the campaign ends if sooner. Adjust targeting before increasing spend.` },
      ],
      note: "Choose posting windows using account analytics.",
    },
  }));
  const strategy = {
    conservative: "Start with one audience and one channel. Expand after reviewing measured results.",
    balanced: "Test two creatives with one audience, then expand the better-performing option.",
    creative: "Compare two distinct creative approaches with a small audience and the same success metric.",
  }[style];

  return {
    overview: { audience, audienceMatch: null, budgetMin: budget, budgetMax: budget, currency: campaign.currency, topChannel: campaign.channels.slice(0, 3).join(" + ") || "Choose a channel", targetLocations: locations },
    targetAudience: audience,
    budgetMin: budget,
    budgetMax: budget,
    suggestedDate: null,
    strategy: `${strategy} Start in ${primaryMarket} and use ${metric} to decide whether to expand.`,
    sections: enabledSections.map(({ id, title }) => ({
      id,
      title,
      ...(sections.get(id) ?? {
        summary: "Review this section manually.",
        content: { recommendation: `Review ${title.toLowerCase()} against the campaign objective before launch.`, keyPoints: [], rationale: "" },
      }),
      evidence: { examples: [], note: "Based on saved campaign inputs and planning rules." },
    })),
  };
}
