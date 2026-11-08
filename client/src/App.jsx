import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import SignupSuccessPage from "./Features/Panel/Pages/SignupSuccessPage";
import ProfilePage from "./Features/Panel/Pages/ProfilePage";
import ProfileSetupPage from "./Features/Panel/Pages/ProfileSetupPage";
import ProtectedRoute from "./Features/Auth/components/ProtectedRoute";
import DashboardPage from "./Features/Dashboard/Pages/DashboardPage";
import CampaignsPage from "./Features/Campaigns/Pages/CampaignsPage";
import CampaignWizardPage from "./Features/Campaigns/Pages/CampaignWizardPage";
import ServicesPage from "./Features/ServiceListings/Pages/ServicesPage";
import ServiceWizardPage from "./Features/ServiceListings/Pages/ServiceWizardPage";
import { ROUTES, USER_ROLES } from "./constants/routes";
import HomePage from "./Features/Home/Pages/HomePage";
import LoginPage from "./Features/Auth/Pages/LoginPage";
import VerifyLoginPage from "./Features/Auth/Pages/VerifyLoginPage";
import SignupPage from "./Features/Auth/Pages/SignupPage";
import VerifyEmailPage from "./Features/Auth/Pages/VerifyEmailPage";
import ForgotPasswordPage from "./Features/Auth/Pages/ForgotPasswordPage";
import ResetPasswordPage from "./Features/Auth/Pages/ResetPasswordPage";

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname, hash]);
  return null;
}

/** Wraps a page so only logged-in users (optionally only the listed roles) can open it. */
const guard = (page, roles) => <ProtectedRoute roles={roles}>{page}</ProtectedRoute>;

const { business, serviceProvider } = USER_ROLES;

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public */}
        <Route path={ROUTES.home} element={<HomePage />} />
        <Route path={ROUTES.login} element={<LoginPage />} />
        <Route path={ROUTES.verifyLogin} element={<VerifyLoginPage />} />
        <Route path={ROUTES.signup} element={<SignupPage />} />
        <Route path={ROUTES.forgotPassword} element={<ForgotPasswordPage />} />
        <Route path={ROUTES.resetPassword} element={<ResetPasswordPage />} />
        <Route path={ROUTES.welcome} element={<SignupSuccessPage />} />

        {/* Logged in (any role) */}
        <Route
          path={ROUTES.verifyEmail}
          element={
            <ProtectedRoute allowUnverified>
              <VerifyEmailPage />
            </ProtectedRoute>
          }
        />
        <Route path={ROUTES.profile} element={guard(<ProfilePage />)} />
        <Route path={ROUTES.dashboard} element={guard(<DashboardPage />)} />
        <Route path={ROUTES.profileSetup} element={guard(<ProfileSetupPage />, [business, serviceProvider])} />

        {/* Business only: campaigns */}
        <Route path={ROUTES.campaigns} element={guard(<CampaignsPage />, [business])} />
        <Route path={ROUTES.campaignNew} element={guard(<CampaignWizardPage />, [business])} />
        <Route path={ROUTES.campaignEdit} element={guard(<CampaignWizardPage />, [business])} />

        {/* Service provider only: services */}
        <Route path={ROUTES.services} element={guard(<ServicesPage />, [serviceProvider])} />
        <Route path={ROUTES.serviceNew} element={guard(<ServiceWizardPage />, [serviceProvider])} />
        <Route path={ROUTES.serviceEdit} element={guard(<ServiceWizardPage />, [serviceProvider])} />

        <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
      </Routes>
    </>
  );
}
