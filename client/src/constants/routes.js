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
  serviceNew: "/services/new",
  serviceEdit: "/services/:id/edit",

});

export const USER_ROLES = Object.freeze({
  business: "business",
  serviceProvider: "service_provider",
  admin: "admin",
});
