import { Lock, Mail } from "lucide-react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import FormAlert from "../components/FormAlert";
import Button from "../../../Shared_Components/Button";
import FormField from "../../../Shared_Components/FormField";
import { ROUTES } from "../../../constants/routes";
import useAuth from "../Hooks/useAuth";
import useAuthForm from "../Hooks/useAuthForm";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || ROUTES.dashboard;

  const form = useAuthForm({
    initialValues: { email: "", password: "", remember: false },
    validate: ({ email, password }) => {
      const e = {};
      if (!EMAIL_RE.test(email.trim())) e.email = "Enter a valid work email.";
      if (!password) e.password = "Enter your password.";
      return e;
    },
    onSubmit: async ({ email, password }) => {
      const result = await login({ email: email.trim(), password });
      if (result.requiresVerification) {
        // Unknown device: password OK, but the server wants an emailed code first.
        navigate(ROUTES.verifyLogin, { state: { email: email.trim() } });
        return;
      }
      // Unverified accounts must enter the signup code before the dashboard.
      navigate(result.user.isEmailVerified ? redirectTo : ROUTES.verifyEmail, { replace: true });
    },
  });

  if (!loading && isAuthenticated) return <Navigate to={ROUTES.dashboard} replace />;

  return (
    <AuthLayout>
      <form className="auth-form" onSubmit={form.handleSubmit} noValidate>
        <header className="auth-form__head">
          <span className="auth-form__eyebrow">Secure access</span>
          <h1>Welcome back</h1>
          <p>Continue to your GTM command center.</p>
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

        <FormField
          label="Password"
          name="password"
          type="password"
          icon={Lock}
          placeholder="Enter your password"
          autoComplete="current-password"
          value={form.values.password}
          onChange={form.handleChange}
          error={form.errors.password}
        />

        <div className="auth-form__row">
          <label className="check">
            <input
              type="checkbox"
              name="remember"
              checked={form.values.remember}
              onChange={form.handleChange}
            />
            <span>Remember me</span>
          </label>
          <Link to={ROUTES.forgotPassword} className="link">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" size="lg" fullWidth arrow loading={form.submitting}>
          Log in to workspace
        </Button>

        <p className="auth-form__switch">
          New to GTM? <Link to={ROUTES.signup}>Create an account</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
