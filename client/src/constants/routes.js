export const ROUTES = Object.freeze({
  home: "/",
  login: "/login",
  verifyLogin: "/verify-login",
  signup: "/signup",
  welcome: "/welcome",
  verifyEmail: "/verify-email",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  profile: "/profile",
  profileSetup: "/profile/setup",
  dashboard: "/dashboard",
  campaigns: "/campaigns",
  campaignNew: "/campaigns/new",
  campaignEdit: "/campaigns/:id/edit",
  services: "/services",
  aiRecommendations: "/ai-recommendations",
  aiModelManagement: "/admin/ai-model-management",
  aiProviderConfiguration: "/admin/ai-model-management/providers",
  aiModelConfiguration: "/admin/ai-model-management/models",
  aiPromptConfiguration: "/admin/ai-model-management/prompts",
  aiRecommendationConfiguration: "/admin/ai-model-management/recommendations",
  aiUsageLogs: "/admin/ai-model-management/usage-logs",
  dataEnrichment: "/data-enrichment",
  apifyScrapers: "/data-enrichment/apify-scrapers",
  opportunities: "/opportunities",
  opportunityApifyScrapers: "/opportunities/apify-scrapers",
  serviceNew: "/services/new",
  serviceEdit: "/services/:id/edit",

});

export const USER_ROLES = Object.freeze({
  business: "business",
  serviceProvider: "service_provider",
  admin: "admin",
});

