import { Radar, Sparkles, ShieldCheck, BarChart3, Plug, FileCheck2, Rocket } from "lucide-react";

export const NAV_LINKS = [
  { label: "Platform", href: "#platform" },
  { label: "Solutions", href: "#solutions" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Why GTM", href: "#why-gtm" },
];

export const HERO_TRUST = ["Free to get started", "No automatic sending", "You stay in control"];

export const PLATFORM_FEATURES = [
  {
    icon: Radar,
    title: "Discover real demand",
    text: "Collect and enrich meaningful market signals so you know exactly where to focus.",
    metric: "2,847",
    metricLabel: "signals tracked",
  },
  {
    icon: Sparkles,
    title: "Create with context",
    text: "Generate strategies, campaigns and outreach grounded in your goals and market.",
    metric: "6 hrs",
    metricLabel: "saved per campaign",
  },
  {
    icon: ShieldCheck,
    title: "Review every action",
    text: "Edit and approve every AI recommendation before anything goes out into the world.",
    metric: "100%",
    metricLabel: "human-approved",
  },
  {
    icon: BarChart3,
    title: "Measure what matters",
    text: "Connect campaigns, conversations and conversions to see your true return.",
    metric: "324%",
    metricLabel: "average ROI",
  },
];

export const SOLUTIONS = {
  business: {
    label: "For Businesses",
    eyebrow: "Built for growth teams",
    title: "Find the customers that fit you best.",
    text: "Detect real demand from public market signals, understand why an opportunity matches and reach the right contact with confidence.",
    points: [
      "AI-powered opportunity matching",
      "Verified decision-maker contacts",
      "Personalized outreach drafts",
    ],
    listTitle: "Top opportunities",
    list: [
      { initials: "AC", name: "Atlas Coffee", match: 92 },
      { initials: "JS", name: "Jordan Stone", match: 89 },
      { initials: "NW", name: "Northwind Foods", match: 85 },
    ],
    badge: { value: "94%", label: "top opportunity match" },
  },
  provider: {
    label: "For Service Providers",
    eyebrow: "Built for specialists",
    title: "Discover and win the work meant for you.",
    text: "See which businesses need your service right now, why they are a good fit and how to approach them, all in one place.",
    points: [
      "Live demand alerts in your niche",
      "Fit scores with clear reasoning",
      "Proposal drafts you can edit and send",
    ],
    listTitle: "Open requests",
    list: [
      { initials: "BL", name: "Bluebird Logistics", match: 91 },
      { initials: "HR", name: "Harbor & Rye", match: 87 },
      { initials: "KP", name: "Kite Pharmacy", match: 83 },
    ],
    badge: { value: "3 new", label: "matched this week" },
  },
};

export const STEPS = [
  {
    icon: Plug,
    title: "Tell GTM your goals",
    text: "Share what you sell or offer, who you want to reach and what success looks like.",
  },
  {
    icon: Sparkles,
    title: "AI does the heavy lifting",
    text: "GTM finds opportunities, scores them and drafts campaigns in minutes, not days.",
  },
  {
    icon: FileCheck2,
    title: "You review and approve",
    text: "Edit anything. Nothing is sent until you say so. You are always the decision maker.",
  },
  {
    icon: Rocket,
    title: "Launch and learn",
    text: "Track replies and revenue, and let every result sharpen your next move.",
  },
];

export const WHY_BEFORE = [
  "Five tools, five logins, zero shared context",
  "Hours lost researching and copying data",
  "Generic outreach that gets ignored",
  "Guesswork about what actually works",
];

export const WHY_AFTER = [
  "One connected platform from signal to sale",
  "Research and drafting done in minutes",
  "Outreach grounded in real market signals",
  "Clear reporting on return, per campaign",
];

export const FOOTER_COLUMNS = [
  {
    title: "Platform",
    links: [
      { label: "Features", href: "#platform" },
      { label: "How it works", href: "#how-it-works" },
      { label: "Responsible AI", href: "#why-gtm" },
    ],
  },
  {
    title: "Solutions",
    links: [
      { label: "For Businesses", href: "#solutions" },
      { label: "For Service Providers", href: "#solutions" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#why-gtm" },
      { label: "Security", href: "#why-gtm" },
      { label: "Log in", to: "/login" },
    ],
  },
];
