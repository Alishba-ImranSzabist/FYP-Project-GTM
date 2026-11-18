/**
 * Editable starter prompts for the six business campaign recommendations.
 * These are frontend defaults only; the backend prompt store will become the
 * source of truth when its API is implemented.
 */
export const PROMPT_TEMPLATES = Object.freeze([
  {
    id: "global",
    label: "Global System Prompt",
    description: "Shared role, behaviour, accuracy and safety rules for all recommendation prompts.",
    defaultText: `You are a careful go-to-market strategy assistant for the GTM platform.
Use the campaign or service details supplied by the user. Do not invent market facts,
customer data, performance figures or platform analytics. Separate evidence from
assumptions, explain uncertainty, and make recommendations practical for the stated
location, objective, audience and budget. If required information is missing, state
what is missing instead of guessing. Return valid structured JSON that follows the
requested output schema. Recommendations are advisory and must be reviewed by a human.`,
  },
  {
    id: "targetAudience",
    label: "Target Audience",
    description: "Defines the audience segments and fit rationale.",
    defaultText: `Recommend primary and secondary audience segments for {{campaign_name}}.
Use the product, objective, target locations, budget and user-provided audience details.
For each segment include: segment name, location, relevant demographics or business
attributes, interests/needs, fit rationale, estimated match score and assumptions. Do not
claim a segment is verified unless evidence is supplied.`,
  },
  {
    id: "marketingChannels",
    label: "Marketing Channels",
    description: "Chooses suitable channels and explains why they fit.",
    defaultText: `Recommend the most suitable marketing channels for {{campaign_name}}.
Rank channels by fit with the target audience, objective, offer, budget and content
resources. For each channel explain its role, recommended format, priority, expected
strength and limitations. Do not recommend every channel by default.`,
  },
  {
    id: "budgetAllocation",
    label: "Budget Allocation",
    description: "Produces a realistic budget range and allocation.",
    defaultText: `Create a practical budget allocation for {{campaign_name}} using the
provided total budget and campaign duration. Show each proposed activity, amount,
percentage and reason. Ensure allocations add up to the proposed total. If the budget
or currency is missing, ask for it or clearly mark the estimate as unavailable.`,
  },
  {
    id: "contentStrategy",
    label: "Content Strategy",
    description: "Suggests content pillars, formats, hooks and calls to action.",
    defaultText: `Create a content strategy for {{campaign_name}}. Recommend content
pillars, formats, example hooks, key messages and calls to action that fit the product,
audience and selected channels. Avoid unsupported claims and do not invent product
features that were not provided by the user.`,
  },
  {
    id: "leadDiscovery",
    label: "Lead Discovery Signals & Keywords",
    description: "Creates search terms and signals for later lead discovery.",
    defaultText: `Generate relevant lead-discovery keywords and observable intent signals
for {{campaign_name}}. Group search phrases by intent and explain why each is relevant.
Distinguish discovery signals from verified purchase intent. The output will guide
Apify searches only after the business user approves the recommendations.`,
  },
  {
    id: "postingSchedule",
    label: "Posting Time & Campaign Duration",
    description: "Suggests a schedule without pretending to know unprovided analytics.",
    defaultText: `Recommend a campaign duration and posting schedule for {{campaign_name}}.
Use the campaign dates, audience location, channel mix and objective. If account-level
engagement analytics are not available, label posting windows as test hypotheses,
not proven best times. Include a simple weekly testing and review plan.`,
  },

]);


/**
 * Creates a safe starter prompt for a recommendation section added by an Admin.
 * The prompt is a draft template; it is not sent to an AI provider from this UI.
 */
export function createDefaultPromptForSection(section) {
  const title = String(section?.title || "custom recommendation").trim();
  const description = String(section?.description || "Use the business details supplied by the user.").trim();

  return `Create the ${title} for {{campaign_name}} using the campaign or service details supplied by the business user.

Focus: ${description}

Explain why the recommendation fits the stated objective, audience, location, budget and available resources. Separate facts from assumptions, do not invent market data or business claims, and clearly identify any missing information. Return a concise, structured recommendation that can be reviewed by a human before action.`;
}

/**
 * Keeps Prompt Configuration in sync with the current recommendation sections.
 * Removing a recommendation section also removes its prompt from this list.
 */
export function buildPromptTemplates(sections = []) {
  const globalTemplate = PROMPT_TEMPLATES.find((template) => template.id === "global");
  const defaultsById = new Map(PROMPT_TEMPLATES.map((template) => [template.id, template]));

  return [
    globalTemplate,
    ...sections.map((section) => {
      const existing = defaultsById.get(section.id);
      return {
        id: section.id,
        label: section.title,
        description: section.description,
        defaultText: section.defaultPrompt || existing?.defaultText || createDefaultPromptForSection(section),
      };
    }),
  ].filter(Boolean);
}
