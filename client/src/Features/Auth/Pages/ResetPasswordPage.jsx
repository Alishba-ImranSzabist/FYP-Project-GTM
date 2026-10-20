import { useState } from "react";
import { Lock } from "lucide-react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import FormAlert from "../components/FormAlert";
import Button from "../../../Shared_Components/Button";
import OtpInput from "../../../Shared_Components/OtpInput";
import FormField from "../../../Shared_Components/FormField";
import { ROUTES } from "../../../constants/routes";
import useAuthForm from "../Hooks/useAuthForm";
import { authService } from "../Services/auth.service";

/**
 * Step 2 of forgot-password: 6-digit code + new password.
 * Email arrives via router state from ForgotPasswordPage; if someone
 * opens this URL directly, we bounce them back to step 1.
 */
export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  const form = useAuthForm({
    initialValues: { code: "", newPassword: "", confirmPassword: "" },
    validate: ({ code, newPassword, confirmPassword }) => {
      const e = {};
      if (code.length !== 6) e.code = "Enter the 6-digit code from your email.";
      if (newPassword.length < 8) e.newPassword = "Use at least 8 characters.";
      else if (!/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword))
        e.newPassword = "Include at least one letter and one number.";
      if (confirmPassword !== newPassword) e.confirmPassword = "Passwords don't match.";
      return e;
    },
    onSubmit: async ({ code, newPassword }) => {
      await authService.resetPassword({ email, code, newPassword });
      // done — send the user to log in with the new password
      navigate(ROUTES.login, { replace: true });
    },
  });

  if (!email) return <Navigate to={ROUTES.forgotPassword} replace />;

  return (
    <AuthLayout>
      <form className="auth-form" onSubmit={form.handleSubmit} noValidate>
        <header className="auth-form__head">
          <span className="auth-form__eyebrow">Forgot password</span>
          <h1>Choose a new password</h1>
          <p>
            Enter the code we sent to <strong>{email}</strong> and pick a new password.
          </p>
        </header>

        <FormAlert message={form.formError} />

        <OtpInput
          value={form.values.code}
          onChange={(v) => form.setValue("code", v)}
          error={form.errors.code}
          autoFocus
        />

        <FormField
          label="New password"
          name="newPassword"
          type="password"
          icon={Lock}
          placeholder="At least 8 characters"
          autoComplete="new-password"
          value={form.values.newPassword}
          onChange={form.handleChange}
          error={form.errors.newPassword}
          hint="Use 8+ characters with a letter and a number."
        />

        <FormField
          label="Confirm new password"
          name="confirmPassword"
          type="password"
          icon={Lock}
          placeholder="Repeat the new password"
          autoComplete="new-password"
          value={form.values.confirmPassword}
          onChange={form.handleChange}
          error={form.errors.confirmPassword}
        />

        <Button type="submit" size="lg" fullWidth arrow loading={form.submitting}>
          Set new password
        </Button>

        <p className="auth-form__switch">
          Code expired? <Link to={ROUTES.forgotPassword}>Request a new one</Link>
        </p>
      </form>
    </AuthLayout>
  );
}