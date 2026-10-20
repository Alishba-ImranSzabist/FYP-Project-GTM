import { useState } from "react";
import { Briefcase, Building2, KeyRound, Lock, Mail, Settings, Star, User } from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import FormAlert from "../components/FormAlert";
import RoleCard from "../components/RoleCard";
import Button from "../../../Shared_Components/Button";
import FormField from "../../../Shared_Components/FormField";
import { ROUTES, USER_ROLES } from "../../../constants/routes";
import useAuth from "../Hooks/useAuth";
import useAuthForm from "../Hooks/useAuthForm";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Admin sign-up stays hidden — only reveal the card via the secret link /signup?admin
const showAdmin = new URLSearchParams(window.location.search).has("admin");

const ROLES = [
  {
    value: USER_ROLES.business,
    icon: Briefcase,
    title: "Business",
    description: "Find customers and grow revenue",
    label: "Business account",
  },
  {
    value: USER_ROLES.serviceProvider,
    icon: Star,
    title: "Service Provider",
    description: "Discover and win opportunities",
    label: "Service provider account",
  },
        { value: USER_ROLES.admin, icon: Settings, title: "Admin", description: "Manage platform operations", label: "Admin account" },
      ].filter((r) => showAdmin || r.value !== USER_ROLES.admin); // Admin is hidden unless /signup?admin

export default function SignupPage() {
  const { register, user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  const selected = ROLES.find((r) => r.value === role);
  const isAdmin = role === USER_ROLES.admin;

  const form = useAuthForm({
    initialValues: { fullName: "", companyName: "", email: "", password: "", adminInviteCode: "" },
    validate: (v) => {
      const e = {};
      if (v.fullName.trim().length < 2) e.fullName = "Enter your full name.";
      if (!isAdmin && v.companyName.trim().length < 2) e.companyName = "Enter your company name.";
      if (!EMAIL_RE.test(v.email.trim())) e.email = "Enter a valid work email.";
      if (v.password.length < 8) e.password = "Use at least 8 characters.";
      else if (!/[A-Za-z]/.test(v.password) || !/\d/.test(v.password))
        e.password = "Include at least one letter and one number.";
      if (isAdmin && !v.adminInviteCode.trim()) e.adminInviteCode = "An admin invite code is required.";
      return e;
    },
    onSubmit: async (v) => {
      await register({
        role,
        fullName: v.fullName.trim(),
        companyName: isAdmin ? undefined : v.companyName.trim(),
        email: v.email.trim(),
        password: v.password,
        adminInviteCode: isAdmin ? v.adminInviteCode.trim() : undefined,
      });
      navigate(ROUTES.verifyEmail, { replace: true }); // next: enter the 6-digit code from the email
    },
  });

  // Race-free gate: register() sets the user mid-render, so decide by verification
  // state — new accounts always land on the code screen, never straight on the panel.
  if (!loading && isAuthenticated)
    return <Navigate to={user?.isEmailVerified ? ROUTES.dashboard : ROUTES.verifyEmail} replace />;

  return (
    <AuthLayout>
      {!selected ? (
        <div className="auth-form">
          <header className="auth-form__head">
            <span className="auth-form__eyebrow">Get started</span>
            <h1>Create your workspace</h1>
            <p>Choose the path that best describes you.</p>
          </header>

          <div className="role-list">
            {ROLES.map((r) => (
              <RoleCard key={r.value} {...r} onSelect={() => setRole(r.value)} />
            ))}
          </div>

          <p className="auth-form__switch">
            Already have an account? <Link to={ROUTES.login}>Log in</Link>
          </p>
        </div>
      ) : (
        <form className="auth-form" onSubmit={form.handleSubmit} noValidate>
          <header className="auth-form__head">
            <span className="auth-form__eyebrow">Get started</span>
            <h1>Create your workspace</h1>
            <p>Choose the path that best describes you.</p>
          </header>

          <div className="role-chip">
            <span className="role-chip__icon">
              <selected.icon size={18} />
            </span>
            <strong>{selected.label}</strong>
            <button type="button" onClick={() => setRole(null)}>
              Change
            </button>
          </div>

          <FormAlert message={form.formError} />

          <FormField
            label="Full name"
            name="fullName"
            icon={User}
            placeholder="Alex Morgan"
            autoComplete="name"
            value={form.values.fullName}
            onChange={form.handleChange}
            error={form.errors.fullName}
          />

          {!isAdmin && (
            <FormField
              label="Company name"
              name="companyName"
              icon={Building2}
              placeholder="Northstar Growth"
              autoComplete="organization"
              value={form.values.companyName}
              onChange={form.handleChange}
              error={form.errors.companyName}
            />
          )}

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
            placeholder="At least 8 characters"
            autoComplete="new-password"
            value={form.values.password}
            onChange={form.handleChange}
            error={form.errors.password}
            hint="Use 8+ characters with a letter and a number."
          />

          {isAdmin && (
            <FormField
              label="Admin invite code"
              name="adminInviteCode"
              icon={KeyRound}
              placeholder="Provided by the platform owner"
              value={form.values.adminInviteCode}
              onChange={form.handleChange}
              error={form.errors.adminInviteCode}
            />
          )}

          <Button type="submit" size="lg" fullWidth arrow loading={form.submitting}>
            Create workspace
          </Button>

          <p className="auth-form__switch">
            Already have an account? <Link to={ROUTES.login}>Log in</Link>
          </p>
        </form>
      )}
    </AuthLayout>
  );
}
