import {
  LayoutDashboard, Megaphone, Database, UserCheck, Sparkles, GitBranch,
  FileText, Send, CalendarClock, Inbox, Eye, LineChart, Package, Bell,
  Settings, LogOut, Target, Users, CreditCard, ThumbsUp, BarChart3,
  Briefcase, Mail, MessageSquare, MessageCircle, DollarSign, TrendingUp,
  Filter, Cpu, ShieldCheck, Rocket, Handshake, Activity,
} from "lucide-react";

/**
 * Per-role panel configuration. Everything the panel renders for a role comes
 * from here — nav, header, stats, charts and activity. Add a role by adding a
 * key that matches USER_ROLES (constants/routes.js).
 */

const business = {
  roleLabel: "Business",
  workspace: { label: "Business workspace" },
  eyebrow: null, // null -> today's date, e.g. "MONDAY, 18 SEPTEMBER"
  title: null, // null -> "Good morning, <firstName>"
  subtitle: "Your pipeline is moving. Here's what needs your attention.",
  cta: { label: "New campaign", icon: Rocket },
  nav: [
    {
      section: "Workspace",
      items: [
        { label: "Dashboard", icon: LayoutDashboard },
        { label: "Campaign Setup", icon: Megaphone },
        { label: "Data & Enrichment", icon: Database },
        { label: "Lead Qualification", icon: UserCheck },
        { label: "AI Recommendations", icon: Sparkles },
        { label: "Lead Pipeline", icon: GitBranch },
      ],
    },
    {
      section: "Create & Send",
      items: [
        { label: "Promotional Post", icon: FileText },
        { label: "Outreach Review", icon: Send },
        { label: "Scheduling", icon: CalendarClock },
        { label: "Reply Inbox", icon: Inbox, badge: 4 },
      ],
    },
    {
      section: "Insights",
      items: [
        { label: "Competitor Insights", icon: Eye },
        { label: "ROI & Conversion", icon: LineChart },
        { label: "Inventory & Sales", icon: Package },
        { label: "Inventory Alerts", icon: Bell, dot: true },
      ],
    },
  ],
  stats: [
    { label: "Total leads", value: "1,284", delta: "+12.8% vs last month", icon: Users, tint: "teal" },
    { label: "Qualified leads", value: "386", delta: "+18.7% vs last month", icon: Target, tint: "sun" },
    { label: "Active campaigns", value: "8", delta: "+2 this month", icon: Megaphone, tint: "green" },
    { label: "Replies", value: "127", delta: "+9.6% vs last month", icon: MessageSquare, tint: "blue" },
    { label: "Email sent", value: "3,842", delta: "+16.3% vs last month", icon: Mail, tint: "teal" },
    { label: "WhatsApp sent", value: "1,209", delta: "+8.4% vs last month", icon: MessageCircle, tint: "green" },
    { label: "Conversions", value: "64", delta: "+11.2% vs last month", icon: TrendingUp, tint: "sun" },
    { label: "Campaign ROI", value: "3.4x", delta: "+0.6x vs last month", icon: BarChart3, tint: "blue" },
  ],
  chart: {
    title: "Pipeline performance",
    subtitle: "Last 12 weeks",
    action: "All campaigns",
    total: "$128,460",
    delta: "+18.4%",
    highlight: 9,
    bars: [42, 55, 38, 64, 52, 70, 60, 78, 56, 100, 72, 86],
  },
  donut: {
    title: "Funnel overview",
    subtitle: "Live conversion",
    percent: "30%",
    caption: "qualified",
    segments: [
      { value: 40, color: "var(--color-primary)" },
      { value: 30, color: "var(--color-accent)" },
      { value: 30, color: "var(--color-charcoal-200)" },
    ],
    legend: [
      { label: "New leads", value: "1,284", color: "var(--color-primary)" },
      { label: "Qualified", value: "386", color: "var(--color-accent)" },
      { label: "Converted", value: "64", color: "var(--color-success)" },
    ],
  },
  activity: {
    title: "Recent activity",
    subtitle: "Latest changes across your workspace",
    items: [
      { icon: Sparkles, title: "AI recommendation ready", meta: "Spring Launch · Based on 48 qualified leads", time: "2 min ago" },
      { icon: MessageSquare, title: "New reply from Olivia Chen", meta: "Interested in a 20-minute product walkthrough", time: "18 min ago" },
      { icon: Target, title: "16 leads qualified", meta: "Scoring model v2.4 completed analysis", time: "1 hr ago" },
      { icon: TrendingUp, title: "Campaign reached 3.8x ROI", meta: "Enterprise Q3 nurture crossed your goal", time: "3 hrs ago" },
    ],
  },
  table: {
    title: "Active campaigns",
    subtitle: "Your best performing campaigns right now",
    action: "View all campaigns",
    rows: [
      { name: "Spring Product Launch", meta: "Email · Social", status: "Active", tone: "green", leads: "428", sent: "2,840", replies: "21.4%", roi: "382%" },
      { name: "SaaS Decision Makers", meta: "Email", status: "Active", tone: "green", leads: "312", sent: "1,920", replies: "18.9%", roi: "296%" },
      { name: "Retail Growth Series", meta: "Multi-channel", status: "Scheduled", tone: "blue", leads: "194", sent: "—", replies: "—", roi: "—" },
    ],
  },
  welcome: [
    { icon: Database, title: "Connect your data", text: "Import leads from a CSV or sync your CRM in one click." },
    { icon: Megaphone, title: "Launch your first campaign", text: "Pick a template, choose an audience and hit send." },
    { icon: LineChart, title: "Track your pipeline", text: "Watch replies, conversions and ROI land in this panel." },
  ],
};

const provider = {
  roleLabel: "Service Provider",
  workspace: { label: "Service Provider workspace" },
  eyebrow: "Your opportunity desk",
  title: null,
  subtitle: "Three high-fit opportunities need your attention today.",
  cta: { label: "Explore opportunities", icon: Target },
  nav: [
    {
      section: "Workspace",
      items: [
        { label: "Provider Dashboard", icon: LayoutDashboard },
        { label: "Service Setup", icon: Settings },
        { label: "Opportunity Discovery", icon: Target },
        { label: "Matched Leads", icon: Users },
        { label: "Outreach Review", icon: Send },
        { label: "Reply Inbox", icon: Inbox, badge: 4 },
      ],
    },
    {
      section: "Performance",
      items: [
        { label: "ROI & Conversion", icon: LineChart },
        { label: "Subscription & Billing", icon: CreditCard },
        { label: "Feedback", icon: ThumbsUp },
      ],
    },
  ],
  stats: [
    { label: "Matches found", value: "128", delta: "+15.2% vs last month", icon: Users, tint: "teal" },
    { label: "Qualified", value: "46", delta: "+10% vs last month", icon: BarChart3, tint: "sun" },
    { label: "Replies", value: "19", delta: "+7.8% vs last month", icon: MessageCircle, tint: "green" },
    { label: "Won value", value: "$14.8k", delta: "+22.5% vs last month", icon: DollarSign, tint: "blue" },
  ],
  chart: {
    title: "Opportunity momentum",
    subtitle: "Last 12 weeks",
    action: "All campaigns",
    total: "$14,840",
    delta: "+18.4%",
    highlight: 9,
    bars: [36, 48, 42, 58, 50, 66, 60, 74, 55, 100, 70, 82],
  },
  donut: {
    title: "Funnel overview",
    subtitle: "Live conversion",
    percent: "30%",
    caption: "qualified",
    segments: [
      { value: 40, color: "var(--color-primary)" },
      { value: 30, color: "var(--color-accent)" },
      { value: 30, color: "var(--color-charcoal-200)" },
    ],
    legend: [
      { label: "New leads", value: "1,284", color: "var(--color-primary)" },
      { label: "Qualified", value: "386", color: "var(--color-accent)" },
      { label: "Converted", value: "64", color: "var(--color-success)" },
    ],
  },
  activity: {
    title: "Recent activity",
    subtitle: "Updates across your workspace",
    items: [
      { icon: Sparkles, title: "AI recommendation ready", meta: "Spring Launch · Based on 48 qualified leads", time: "2 min ago" },
      { icon: MessageSquare, title: "New reply from Olivia Chen", meta: "Interested in a 20-minute product walkthrough", time: "18 min ago" },
      { icon: Filter, title: "16 leads qualified", meta: "Scoring model v2.4 completed analysis", time: "1 hr ago" },
      { icon: DollarSign, title: "Campaign reached 3.8x ROI", meta: "Enterprise Q3 nurture crossed your goal", time: "3 hrs ago" },
    ],
  },
  table: null,
  welcome: [
    { icon: Briefcase, title: "Add your services", text: "Describe what you offer so AI can match you to the right work." },
    { icon: Handshake, title: "Review matched leads", text: "High-fit opportunities land here every morning." },
    { icon: Send, title: "Send your first outreach", text: "Approve a draft, send it and track replies in one place." },
  ],
};

const admin = {
  roleLabel: "Admin",
  workspace: { label: "Admin workspace" },
  eyebrow: "Platform control center",
  title: "Admin overview",
  subtitle: "Monitor users, AI quality and commercial performance.",
  cta: { label: "Manage AI models", icon: Cpu },
  nav: [
    {
      section: "Platform",
      items: [
        { label: "Admin Dashboard", icon: LayoutDashboard },
        { label: "User Management", icon: Users },
        { label: "Subscription & Billing", icon: CreditCard },
        { label: "Feedback", icon: ThumbsUp },
        { label: "Usage Analytics", icon: BarChart3 },
        { label: "AI Model Management", icon: Sparkles },
      ],
    },
  ],
  stats: [
    { label: "Active users", value: "2,847", delta: "+12.4% vs last month", icon: Users, tint: "teal" },
    { label: "Campaigns", value: "1,284", delta: "+6.2% vs last month", icon: Megaphone, tint: "sun" },
    { label: "AI drafts", value: "48.2k", delta: "+21.7% vs last month", icon: Sparkles, tint: "green" },
    { label: "MRR", value: "$84.6k", delta: "+9.3% vs last month", icon: DollarSign, tint: "blue" },
  ],
  chart: {
    title: "Platform activity",
    subtitle: "Last 12 weeks",
    action: "All campaigns",
    total: "68,492",
    delta: "+18.4%",
    highlight: 9,
    bars: [40, 52, 46, 60, 54, 70, 62, 76, 58, 100, 72, 84],
  },
  donut: {
    title: "System health",
    subtitle: "Live status",
    percent: "99.9%",
    caption: "uptime",
    segments: [
      { value: 55, color: "var(--color-primary)" },
      { value: 30, color: "var(--color-accent)" },
      { value: 15, color: "var(--color-charcoal-200)" },
    ],
    legend: [
      { label: "Healthy services", value: "1,284", color: "var(--color-primary)" },
      { label: "Degraded", value: "386", color: "var(--color-accent)" },
      { label: "Incidents", value: "64", color: "var(--color-success)" },
    ],
  },
  activity: {
    title: "Recent platform events",
    subtitle: "Latest changes across the platform",
    items: [
      { icon: Users, title: "42 new signups", meta: "Business and provider accounts created today", time: "2 min ago" },
      { icon: Sparkles, title: "AI recommendation ready", meta: "Spring Launch · Based on 48 qualified leads", time: "18 min ago" },
      { icon: ShieldCheck, title: "Moderation queue cleared", meta: "16 flagged items reviewed by your team", time: "1 hr ago" },
      { icon: CreditCard, title: "New Scale subscription", meta: "Northstar Growth upgraded · $249/mo", time: "3 hrs ago" },
    ],
  },
  table: null,
  welcome: [
    { icon: Users, title: "Invite your team", text: "Add operators and reviewers with role-based access." },
    { icon: Cpu, title: "Configure AI models", text: "Pick default models, limits and safety thresholds." },
    { icon: Activity, title: "Watch platform health", text: "Uptime, usage and revenue live in this panel." },
  ],
};


export const PANEL_CONFIG = Object.freeze({ business, service_provider: provider, admin });
