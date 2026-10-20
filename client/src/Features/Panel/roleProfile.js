import { Briefcase, Building2 } from "lucide-react";
import { USER_ROLES } from "../../constants/routes";

/**
 * Role-specific profile setup config (business → BusinessProfile,
 * service_provider → ServiceProviderProfile). Field metadata drives
 * Features/Panel/components/RoleProfileForm; validate / toPayload mirror the
 * server rules in server/src/features/profiles/profile.validation.js.
 */
export const PROFILE_LIMITS = Object.freeze({
  businessName: 120,
  industry: 120,
  productDescription: 2000,
  targetMarket: 500,
  experience: 500,
  skill: 50,
  skills: 30,
  portfolioLink: 500,
  portfolio: 10,
});

const URL_RE = /^https?:\/\/\S+$/i;

const len = (value) => (value ?? "").trim().length;

const dedupeSkills = (list) => {
  const seen = new Set();
  return list.filter((skill) => {
    const key = skill.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const business = {
  roleLabel: "Business",
  viewTitle: "About your business",
  editTitle: "Business profile",
  editIntro:
    "Tell the platform about your company so campaigns, lead matching and AI outreach sound exactly like your brand.",
  empty: {
    businessName: "",
    industry: "",
    productDescription: "",
    targetMarket: "",
    sellsProducts: false,
  },
  sections: [
    {
      id: "basics",
      title: "Business details",
      hint: "Shown across your workspace and used in AI recommendations.",
      fields: [
        {
          name: "businessName",
          label: "Business name",
          type: "text",
          icon: Building2,
          required: true,
          placeholder: "Northstar Growth",
          autoComplete: "organization",
          full: true,
        },
        {
          name: "industry",
          label: "Industry",
          type: "text",
          icon: Briefcase,
          placeholder: "e.g. E-commerce, SaaS, Retail",
          hint: "Optional — helps the AI pick the right tone.",
        },
      ],
    },
    {
      id: "market",
      title: "Products & market",
      hint: "Help the platform target the right audience with the right message.",
      fields: [
        {
          name: "productDescription",
          label: "What do you sell?",
          type: "textarea",
          rows: 4,
          placeholder:
            "Describe your products or services — what you offer, what makes it different, who it is for…",
          maxLength: PROFILE_LIMITS.productDescription,
          hint: `Optional · up to ${PROFILE_LIMITS.productDescription.toLocaleString()} characters.`,
          full: true,
        },
        {
          name: "targetMarket",
          label: "Target market",
          type: "textarea",
          rows: 3,
          placeholder: "e.g. Online skincare buyers in the UK, women 25–40",
          maxLength: PROFILE_LIMITS.targetMarket,
          hint: "Optional — who you sell to.",
        },
        {
          name: "sellsProducts",
          label: "Do you sell products?",
          type: "toggle",
          hint: "Turn on if you sell physical or digital products (not only services).",
        },
      ],
    },
  ],
  validate(values) {
    const e = {};
    const name = values.businessName.trim();
    if (name.length < 2) e.businessName = "Enter your business name (2+ characters).";
    else if (name.length > PROFILE_LIMITS.businessName)
      e.businessName = `Business name is too long — max ${PROFILE_LIMITS.businessName} characters.`;
    if (len(values.industry) > PROFILE_LIMITS.industry)
      e.industry = `Industry is too long — max ${PROFILE_LIMITS.industry} characters.`;
    if (len(values.productDescription) > PROFILE_LIMITS.productDescription)
      e.productDescription = `Keep this under ${PROFILE_LIMITS.productDescription.toLocaleString()} characters.`;
    if (len(values.targetMarket) > PROFILE_LIMITS.targetMarket)
      e.targetMarket = `Keep this under ${PROFILE_LIMITS.targetMarket} characters.`;
    return e;
  },
  toPayload(values) {
    return {
      businessName: values.businessName.trim(),
      industry: values.industry.trim(),
      productDescription: values.productDescription.trim(),
      targetMarket: values.targetMarket.trim(),
      sellsProducts: Boolean(values.sellsProducts),
    };
  },
  /** Saved profile → form values (companyName pre-fills a fresh business name). */
  fromProfile(profile, { user } = {}) {
    return {
      businessName: profile?.businessName || user?.companyName || "",
      industry: profile?.industry || "",
      productDescription: profile?.productDescription || "",
      targetMarket: profile?.targetMarket || "",
      sellsProducts: profile?.sellsProducts ?? false,
    };
  },
  /** Completion of the SAVED profile (used for the progress checklist). */
  profileCompletion(profile) {
    const checks = [
      len(profile?.businessName) >= 2,
      len(profile?.industry) > 0,
      len(profile?.productDescription) > 0,
      len(profile?.targetMarket) > 0,
    ];
    return { done: checks.filter(Boolean).length, total: checks.length };
  },
  summary(profile) {
    return [
      { label: "Business name", kind: "text", value: profile?.businessName },
      { label: "Industry", kind: "text", value: profile?.industry },
      { label: "Sells products", kind: "text", value: profile ? (profile.sellsProducts ? "Yes" : "No") : "" },
      { label: "Target market", kind: "text", value: profile?.targetMarket, wide: true },
      { label: "About your products", kind: "text", value: profile?.productDescription, wide: true },
    ];
  },
};

const provider = {
  roleLabel: "Service provider",
  viewTitle: "Your services",
  editTitle: "Service provider profile",
  editIntro:
    "Add your skills, experience and best work so the right businesses can find and trust you.",
  empty: { skills: [], experience: "", portfolio: [] },
  sections: [
    {
      id: "skills",
      title: "Skills & services",
      hint: "What you offer — these power matching with the right businesses.",
      fields: [
        {
          name: "skills",
          label: "Skills",
          type: "chips",
          placeholder: "e.g. Copywriting",
          hint: `Type a skill and press Enter · up to ${PROFILE_LIMITS.skills} skills.`,
        },
      ],
    },
    {
      id: "experience",
      title: "Experience",
      fields: [
        {
          name: "experience",
          label: "About your experience",
          type: "textarea",
          rows: 4,
          placeholder:
            "Years of experience, industries you've worked with, results you've delivered…",
          maxLength: PROFILE_LIMITS.experience,
          hint: `Optional · up to ${PROFILE_LIMITS.experience} characters.`,
          full: true,
        },
      ],
    },
    {
      id: "portfolio",
      title: "Portfolio",
      hint: "Links to your best work — site, case studies, social profiles.",
      fields: [
        {
          name: "portfolio",
          label: "Portfolio links",
          type: "urls",
          placeholder: "https://yoursite.com/work",
          hint: `Optional · up to ${PROFILE_LIMITS.portfolio} links, must start with https://.`,
        },
      ],
    },
  ],
  validate(values) {
    const e = {};
    if (values.skills.some((s) => !s.trim())) e.skills = "Skills cannot be empty.";
    else if (values.skills.some((s) => s.trim().length > PROFILE_LIMITS.skill))
      e.skills = `A skill cannot exceed ${PROFILE_LIMITS.skill} characters.`;
    else if (values.skills.length > PROFILE_LIMITS.skills)
      e.skills = `You can add up to ${PROFILE_LIMITS.skills} skills.`;

    if (len(values.experience) > PROFILE_LIMITS.experience)
      e.experience = `Keep this under ${PROFILE_LIMITS.experience} characters.`;

    const links = values.portfolio.map((l) => l.trim()).filter(Boolean);
    if (links.length > PROFILE_LIMITS.portfolio)
      e.portfolio = `You can add up to ${PROFILE_LIMITS.portfolio} links.`;
    else {
      const bad = links.find(
        (l) => !URL_RE.test(l) || l.length > PROFILE_LIMITS.portfolioLink
      );
      if (bad)
        e.portfolio = `“${bad.length > 40 ? `${bad.slice(0, 40)}…` : bad}” is not a valid link — must start with http:// or https://.`;
    }
    return e;
  },
  toPayload(values) {
    return {
      skills: dedupeSkills(values.skills.map((s) => s.trim()).filter(Boolean)),
      experience: values.experience.trim(),
      portfolio: values.portfolio.map((l) => l.trim()).filter(Boolean),
    };
  },
  fromProfile(profile) {
    return {
      skills: [...(profile?.skills || [])],
      experience: profile?.experience || "",
      portfolio: [...(profile?.portfolio || [])],
    };
  },
  profileCompletion(profile) {
    const checks = [
      (profile?.skills || []).length > 0,
      len(profile?.experience) > 0,
      (profile?.portfolio || []).length > 0,
    ];
    return { done: checks.filter(Boolean).length, total: checks.length };
  },
  summary(profile) {
    return [
      { label: "Skills", kind: "chips", value: profile?.skills || [] },
      { label: "Experience", kind: "text", value: profile?.experience, wide: true },
      { label: "Portfolio", kind: "links", value: profile?.portfolio || [], wide: true },
    ];
  },
};

export const ROLE_PROFILE_CONFIG = Object.freeze({
  [USER_ROLES.business]: business,
  [USER_ROLES.serviceProvider]: provider,
});

