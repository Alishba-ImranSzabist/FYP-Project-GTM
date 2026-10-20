import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import FormAlert from "../components/FormAlert";
import Button from "../../../Shared_Components/Button";
import FormField from "../../../Shared_Components/FormField";
import { ROUTES } from "../../../constants/routes";
import useAuthForm from "../Hooks/useAuthForm";
import { authService } from "../Services/auth.service";
import { Mail } from "lucide-react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Step 1 of forgot-password: ask for the email, fire the OTP (server always
 * answers the same way so this page never reveals which emails exist).
 */
export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  const form = useAuthForm({
    initialValues: { email: "" },
    validate: ({ email }) => {
      const e = {};
      if (!EMAIL_RE.test(email.trim())) e.email = "Enter a valid work email.";
      return e;
    },
    onSubmit: async ({ email }) => {
      await authService.forgotPassword({ email: email.trim() });
      // remember which email we sent to, then move to the code + new-password step
      navigate(ROUTES.resetPassword, { state: { email: email.trim() } });
    },
  });

  return (
    <AuthLayout>
      <form className="auth-form" onSubmit={form.handleSubmit} noValidate>
        <header className="auth-form__head">
          <span className="auth-form__eyebrow">Forgot password</span>
          <h1>Reset your password</h1>
          <p>Enter the email you signed up with and we&rsquo;ll send a 6-digit code.</p>
        </header>

        <FormAlert message={form.formError} />

        <FormField
          label="Work email"
          name="email"
          type="email"
          icon={Mail}
          placeholder="alex@company.com"
          autoComplete="email"
          value={form.values.email}
          onChange={form.handleChange}
          error={form.errors.email}
        />

        <Button type="submit" size="lg" fullWidth arrow loading={form.submitting}>
          Send me a code
        </Button>

        <p className="auth-form__switch">
          Remembered it? <Link to={ROUTES.login}>Back to log in</Link>
        </p>
      </form>
    </AuthLayout>
  );
}