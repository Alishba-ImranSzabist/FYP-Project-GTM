import { ApiError } from "../../../utils/ApiError.js";

const text = (value, fallback = "") =>
  typeof value === "string" && value.trim() ? value.trim() : fallback;

const finiteNumber = (value, fallback = null) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const clamp = (value, min, max) =>
  Math.min(max, Math.max(min, finiteNumber(value, min)));

const array = (value) => (Array.isArray(value) ? value : []);

const safeHttpUrl = (value) => {
  if (typeof value !== "string" || !value.trim()) return "";
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : "";
  } catch {
    return "";
  }
};

function normalizeEvidence(rawEvidence, approvedExamples = []) {
  const approvedById = new Map(
    approvedExamples.map((example) => [String(example.exampleId), example])
  );
  const requestedIds = array(rawEvidence?.exampleIds)
    .filter((id) => typeof id === "string" || typeof id === "number")
    .map(String);
  const uniqueIds = [...new Set(requestedIds)];

  const examples = uniqueIds
    .map((id) => approvedById.get(id))
    .filter(Boolean)
    .map((example) => ({
      exampleId: String(example.exampleId),
      campaignName: text(example.campaignName, "Campaign example"),
      publisher: text(example.source?.publisher, ""),
      sourceTitle: text(example.source?.sourceTitle, ""),
      sourceUrl: safeHttpUrl(example.source?.sourceUrl),
      limitations: array(example.limitations).filter((item) => typeof item === "string"),
    }));

  return {
    examples,
    note: text(
      rawEvidence?.note,
      examples.length
        ? "These publisher references provide strategy context."
        : "Treat this recommendation as a planning hypothesis."
    ),
  };
}

export function parseJsonObject(rawText) {
  const cleaned = String(rawText || "")
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "");

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace < 0 || lastBrace <= firstBrace) {
    throw new ApiError(502, "The AI provider returned an invalid response. Please regenerate.");
  }

  try {
    const parsed = JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("Expected a JSON object.");
    }
    return parsed;
  } catch {
    throw new ApiError(502, "The AI provider returned invalid JSON. Please regenerate.");
  }
}

function normalizeAudience(section, campaign) {
  const items = array(section.items).slice(0, 5).map((item) => ({
    title: text(item.title, "Relevant campaign audience"),
    label: text(item.label, "Recommended audience"),
    match: clamp(item.match, 0, 100),
    description: text(item.description, "Review this segment against real campaign results."),
    reason: text(item.reason, "This segment is related to the campaign information provided."),
  }));

  if (!items.length) {
    items.push({
      title: `${campaign.audienceType || "Relevant"} audience in ${(campaign.targetLocations || []).join(", ")}`,
      label: "Primary audience",
      match: 0,
      description: "The AI did not provide enough detail for this segment. Review and refine it.",
      reason: "This is a placeholder based on the campaign inputs, not a measured audience result.",
    });
  }
  return { items };
}

function normalizeChannels(section, campaign) {
  const items = array(section.items).slice(0, 8).map((item) => ({
    title: text(item.title, "Suggested channel"),
    priority: text(item.priority, "Test channel"),
    purpose: text(item.purpose, "Campaign discovery and engagement"),
    formats: text(item.formats, "Select formats suitable for the channel."),
    reason: text(item.reason, "Validate channel fit with campaign performance."),
  }));

  if (!items.length) {
    for (const channel of (campaign.channels || []).slice(0, 4)) {
      items.push({
        title: channel,
        priority: "Test channel",
        purpose: "Campaign reach and engagement",
        formats: "Test channel-appropriate creative formats.",
        reason: "This channel was selected in the campaign setup.",
      });
    }
  }
  return { items };
}

const budgetAmount = (value, fallback = null) => value == null || value === "" ? fallback : finiteNumber(value, fallback);

function normalizeBudget(section, raw, campaign) {
  const rawRange = section.range || {};
  const fallbackMin = budgetAmount(raw.overview?.budgetMin);
  const fallbackMax = budgetAmount(raw.overview?.budgetMax);
  const min = budgetAmount(rawRange.min, fallbackMin);
  const max = budgetAmount(rawRange.max, fallbackMax);

  if (min === null || max === null || min < 0 || max < min) {
    throw new ApiError(
      502,
      "The AI provider did not return a valid budget range. Please regenerate."
    );
  }

  const allocations = array(section.allocations).slice(0, 8).map((item) => ({
    label: text(item.label, "Campaign activity"),
    percentage: clamp(item.percentage, 0, 100),
    amount: Math.max(0, finiteNumber(item.amount, 0)),
    purpose: text(item.purpose, "Planned campaign activity."),
  }));

  if (!allocations.length) {
    allocations.push({
      label: "Initial campaign testing",
      percentage: 100,
      amount: Math.round(((min + max) / 2) * 100) / 100,
      purpose: "Use as an initial test allocation and revise using actual performance.",
    });
  }

  const pilotSpend = section.pilotSpend == null ? null : finiteNumber(section.pilotSpend);
  return {
    range: { min, max },
    ...(pilotSpend != null && pilotSpend >= 0 && pilotSpend <= max ? { pilotSpend } : {}),
    currency: text(section.currency, campaign.currency || "PKR"),
    allocations,
    note: text(
      section.note,
      "This is an AI-generated planning estimate, not a market quotation or guaranteed return."
    ),
  };
}

function normalizeContent(section) {
  return {
    pillars: array(section.pillars).slice(0, 8).map((item) => ({
      title: text(item.title, "Content idea"),
      format: text(item.format, "Suitable social content format"),
      hook: text(item.hook, "Explain the main product or service benefit."),
      goal: text(item.goal, "Awareness"),
    })),
  };
}

function normalizeLeadSignals(section, campaign) {
  const keywords = array(section.keywords)
    .filter((item) => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 30);

  return {
    keywords: keywords.length ? keywords : (campaign.keywords || []).slice(0, 12),
    signals: array(section.signals).slice(0, 10).map((item) => ({
      title: text(item.title, "Relevant public signal"),
      description: text(item.description, "Verify relevance before treating this as a lead."),
    })),
    guardrail: text(
      section.guardrail,
      "Use only relevant public information, respect platform terms and privacy rules, and verify lead fit before outreach."
    ),
  };
}

function normalizeSchedule(section) {
  return {
    duration: text(section.duration, "Review the campaign dates and select a test period."),
    windows: array(section.windows).filter((item) => typeof item === "string").slice(0, 8),
    weeks: array(section.weeks).slice(0, 8).map((week) => ({
      week: text(week.week, "Phase"),
      title: text(week.title, "Review"),
      detail: text(week.detail, "Monitor results and adjust the plan."),
    })),
    note: text(
      section.note,
      "Posting windows are hypotheses. Confirm them with the account's own analytics."
    ),
  };
}

function normalizeCustomSection(section) {
  const content =
    typeof section.content === "string"
      ? { recommendation: section.content, keyPoints: [], rationale: "" }
      : section.content && typeof section.content === "object"
        ? section.content
        : {};

  return {
    content: {
      recommendation: text(content.recommendation, text(section.recommendation, section.summary)),
      keyPoints: array(content.keyPoints || section.keyPoints)
        .filter((item) => typeof item === "string")
        .slice(0, 12),
      rationale: text(content.rationale, ""),
    },
  };
}

export function normalizeRecommendationOutput(
  raw,
  { campaign, enabledSections, approvedExamples = [] }
) {
  if (!raw || typeof raw !== "object" || !Array.isArray(raw.sections)) {
    throw new ApiError(502, "The AI provider returned an incomplete recommendation. Please regenerate.");
  }

  const rawSections = new Map(
    raw.sections
      .filter((section) => section && typeof section.id === "string")
      .map((section) => [section.id, section])
  );

  const sections = enabledSections.map((configSection) => {
    const source = rawSections.get(configSection.id) || {};
    const base = {
      id: configSection.id,
      title: configSection.title,
      summary: text(
        source.summary,
        `Recommendations for ${configSection.title.toLowerCase()}. Review and validate these suggestions before use.`
      ),
    };

    let details;
    switch (configSection.id) {
      case "audience":
        details = normalizeAudience(source, campaign);
        break;
      case "channels":
        details = normalizeChannels(source, campaign);
        break;
      case "budget":
        details = normalizeBudget(source, raw, campaign);
        break;
      case "content":
        details = normalizeContent(source);
        break;
      case "leadSignals":
        details = normalizeLeadSignals(source, campaign);
        break;
      case "schedule":
        details = normalizeSchedule(source);
        break;
      default:
        details = normalizeCustomSection(source);
        break;
    }

    return {
      ...base,
      ...details,
      evidence: normalizeEvidence(source.evidence, approvedExamples),
    };
  });

  const audience = sections.find((section) => section.id === "audience");
  const budget = sections.find((section) => section.id === "budget");
  const channels = sections.find((section) => section.id === "channels");

  const firstAudience = audience?.items?.[0];
  const budgetMin = budget?.range?.min ?? budgetAmount(raw.overview?.budgetMin);
  const budgetMax = budget?.range?.max ?? budgetAmount(raw.overview?.budgetMax);

  if (budgetMin === null || budgetMax === null || budgetMin < 0 || budgetMax < budgetMin) {
    throw new ApiError(
      502,
      "A budget range is required for this recommendation. Please regenerate."
    );
  }

  const overview = {
    audience: text(raw.overview?.audience, firstAudience?.title || "Relevant campaign audience"),
    audienceMatch: clamp(raw.overview?.audienceMatch ?? firstAudience?.match, 0, 100),
    budgetMin,
    budgetMax,
    currency: text(raw.overview?.currency, campaign.currency || "PKR"),
    topChannel: text(
      raw.overview?.topChannel,
      channels?.items?.slice(0, 2).map((item) => item.title).join(" + ") || "Review suggested channels"
    ),
    targetLocations: text(
      raw.overview?.targetLocations,
      (campaign.targetLocations || []).join(", ")
    ),
  };

  const suggestedDateValue = raw.suggestedDate;
  const suggestedDate =
    typeof suggestedDateValue === "string" && !Number.isNaN(Date.parse(suggestedDateValue))
      ? new Date(suggestedDateValue)
      : null;

  return {
    overview,
    sections,
    targetAudience: overview.audience,
    budgetMin,
    budgetMax,
    suggestedDate,
    ...(raw.assessment && { assessment: {
      recommendation: text(raw.assessment.recommendation),
      rationale: text(raw.assessment.rationale),
      validation: text(raw.assessment.validation),
    } }),
    strategy: text(
      raw.strategy,
      sections.map((section) => section.summary).filter(Boolean).join(" ")
    ),
  };
}
