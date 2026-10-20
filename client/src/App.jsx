import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import { ROUTES } from "./constants/routes";
import HomePage from "./Features/Home/Pages/HomePage";
import LoginPage from "./Features/Auth/Pages/LoginPage";
import VerifyLoginPage from "./Features/Auth/Pages/VerifyLoginPage";
import SignupPage from "./Features/Auth/Pages/SignupPage";
import VerifyEmailPage from "./Features/Auth/Pages/VerifyEmailPage";
import ForgotPasswordPage from "./Features/Auth/Pages/ForgotPasswordPage";
import ResetPasswordPage from "./Features/Auth/Pages/ResetPasswordPage";
import SignupSuccessPage from "./Features/Panel/Pages/SignupSuccessPage";
import ProfilePage from "./Features/Panel/Pages/ProfilePage";
import ProtectedRoute from "./Features/Auth/components/ProtectedRoute";
import DashboardPage from "./Features/Dashboard/Pages/DashboardPage";

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname, hash]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path={ROUTES.home} element={<HomePage />} />
        <Route path={ROUTES.login} element={<LoginPage />} />
        <Route path={ROUTES.verifyLogin} element={<VerifyLoginPage />} />
        <Route path={ROUTES.signup} element={<SignupPage />} />
        <Route
          path={ROUTES.verifyEmail}
          element={
            <ProtectedRoute allowUnverified>
              <VerifyEmailPage />
            </ProtectedRoute>
          }
        />
        <Route path={ROUTES.forgotPassword} element={<ForgotPasswordPage />} />
        <Route path={ROUTES.resetPassword} element={<ResetPasswordPage />} />
        <Route path={ROUTES.welcome} element={<SignupSuccessPage />} />
        <Route
          path={ROUTES.profile}
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.dashboard}
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
      </Routes>
    </>
  );
}
