import { useEffect, useState } from "react";
import { Briefcase, Building2, KeyRound, Lock, Mail, Settings, Star, User } from "lucide-react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import FormAlert from "../components/FormAlert";
import RoleCard from "../components/RoleCard";
import Button from "../../../Shared_Components/Button";
import FormField from "../../../Shared_Components/FormField";
import { ROUTES, USER_ROLES } from "../../../constants/routes";
import useAuth from "../Hooks/useAuth";
import useAuthForm from "../Hooks/useAuthForm";
import { authService } from "../Services/auth.service";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GMAIL_TYPOS_RE = /^(?:\d+gmail\.com|gmal\.com|gmial\.com|gamil\.com|gmai\.com|gmail\.co|gmail\.con)$/;

function emailValidationMessage(raw) {
  const value = raw.trim().toLowerCase();
  if (value.length > 254 || !EMAIL_RE.test(value)) return "Enter a valid email address.";
  if (GMAIL_TYPOS_RE.test(value.split("@")[1] || "")) {
    return "This looks like a Gmail typo. Did you mean @gmail.com?";
  }
  return "";
}

const ALL_ROLES = [
  { value: USER_ROLES.business, icon: Briefcase, title: "Business", description: "Find customers and grow revenue", label: "Business account" },
  { value: USER_ROLES.serviceProvider, icon: Star, title: "Service Provider", description: "Discover and win opportunities", label: "Service provider account" },
  { value: USER_ROLES.admin, icon: Settings, title: "Admin", description: "Manage platform operations", label: "Admin account" },
];

export default function SignupPage() {
  const { register, user, updateUser, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  // Unlike location.state, URL query parameters survive refresh and direct visits.
  const correctionRequested = params.get("correct-email") === "1";
  const showAdmin = params.has("admin");
  const roles = ALL_ROLES.filter((roleOption) => showAdmin || roleOption.value !== USER_ROLES.admin);

  const [role, setRole] = useState(null);
  const [correctedEmail, setCorrectedEmail] = useState("");
  const [correctionError, setCorrectionError] = useState("");
  const [correctionBusy, setCorrectionBusy] = useState(false);
  const selected = roles.find((item) => item.value === role);
  const isAdmin = role === USER_ROLES.admin;

  useEffect(() => {
    if (correctionRequested && user?.email) setCorrectedEmail(user.email);
  }, [correctionRequested, user?.email]);

  const form = useAuthForm({
    initialValues: { fullName: "", companyName: "", email: "", password: "", adminInviteCode: "" },
    validate: (v) => {
      const errors = {};
      if (v.fullName.trim().length < 2) errors.fullName = "Enter your full name.";
      if (v.fullName.trim().length > 80) errors.fullName = "Name is too long.";
      if (!isAdmin && v.companyName.trim().length < 2) errors.companyName = "Enter your company name.";
      if (v.companyName.trim().length > 120) errors.companyName = "Company name is too long.";
      const emailError = emailValidationMessage(v.email);
      if (emailError) errors.email = emailError;
      if (v.password.length < 8) errors.password = "Use at least 8 characters.";
      else if (v.password.length > 72) errors.password = "Password is too long.";
      else if (!/[A-Za-z]/.test(v.password) || !/\d/.test(v.password))
        errors.password = "Include at least one letter and one number.";
      if (isAdmin && !v.adminInviteCode.trim()) errors.adminInviteCode = "An admin invite code is required.";
      return errors;
    },
    onSubmit: async (v) => {
      if (!role) throw new Error("Choose an account type first.");
      const data = await register({
        role,
        fullName: v.fullName.trim(),
        companyName: isAdmin ? undefined : v.companyName.trim(),
        email: v.email.trim().toLowerCase(),
        password: v.password,
        adminInviteCode: isAdmin ? v.adminInviteCode.trim() : undefined,
      });
      navigate(ROUTES.verifyEmail, {
        replace: true,
        state: { deliveryFailed: data.verificationEmailSent === false },
      });
    },
  });

  async function submitCorrectedEmail(event) {
    event.preventDefault();
    if (correctionBusy) return;
    setCorrectionError("");
    const normalized = correctedEmail.trim().toLowerCase();
    const validation = emailValidationMessage(normalized);
    if (validation) { setCorrectionError(validation); return; }
    if (normalized === user?.email) {
      setCorrectionError("Enter a different address, or return to verification.");
      return;
    }

    setCorrectionBusy(true);
    try {
      const result = await authService.changeVerificationEmail(normalized);
      updateUser(result.user);
      navigate(ROUTES.verifyEmail, {
        replace: true,
        state: { deliveryFailed: result.emailSent === false, emailUpdated: true },
      });
    } catch (err) {
      setCorrectionError(err.fieldErrors?.email || err.message || "Could not update the address.");
    } finally {
      setCorrectionBusy(false);
    }
  }

  if (loading) return null;

  if (correctionRequested) {
    if (!user) return <Navigate to={ROUTES.login} replace />;
    if (user.isEmailVerified) return <Navigate to={ROUTES.dashboard} replace />;

    return (
      <AuthLayout>
        <form className="auth-form" onSubmit={submitCorrectedEmail} noValidate>
          <header className="auth-form__head">
            <span className="auth-form__eyebrow">Get started</span>
            <h1>Correct your signup email</h1>
            <p>Your account already exists. Change only the email below; you do not need to register again.</p>
          </header>
          <FormAlert message={correctionError} />
          <FormField
            label="Account name"
            name="fullName"
            icon={User}
            value={user.fullName || ""}
            readOnly
          />
          {user.companyName && (
            <FormField
              label="Company name"
              name="companyName"
              icon={Building2}
              value={user.companyName}
              readOnly
            />
          )}
          <FormField
            label="Correct email address"
            name="email"
            type="email"
            icon={Mail}
            placeholder="yourname@gmail.com or yourname@company.com"
            autoComplete="email"
            value={correctedEmail}
            onChange={(event) => { setCorrectedEmail(event.target.value); setCorrectionError(""); }}
            error={correctionError}
            required
          />
          <Button type="submit" size="lg" fullWidth arrow loading={correctionBusy}>
            Save email and send code
          </Button>
          <p className="auth-form__switch">
            <Link to={ROUTES.verifyEmail}>Back to verification</Link>
          </p>
        </form>
      </AuthLayout>
    );
  }

  // Do NOT apply this redirect inside correction mode: that caused the loop.
  if (isAuthenticated) {
    return <Navigate to={user?.isEmailVerified ? ROUTES.dashboard : ROUTES.verifyEmail} replace />;
  }

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
            {roles.map((item) => (
              <RoleCard key={item.value} {...item} onSelect={() => setRole(item.value)} />
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
            <span className="role-chip__icon"><selected.icon size={18} /></span>
            <strong>{selected.label}</strong>
            <button type="button" onClick={() => setRole(null)}>Change</button>
          </div>
          <FormAlert message={form.formError} />
          <FormField
            label="Full name" name="fullName" icon={User} placeholder="Alex Morgan"
            autoComplete="name" value={form.values.fullName}
            onChange={form.handleChange} error={form.errors.fullName}
          />
          {!isAdmin && (
            <FormField
              label="Company name" name="companyName" icon={Building2} placeholder="Northstar Growth"
              autoComplete="organization" value={form.values.companyName}
              onChange={form.handleChange} error={form.errors.companyName}
            />
          )}
          <FormField
            label="Work email" name="email" type="email" icon={Mail} placeholder="alex@company.com"
            autoComplete="email" value={form.values.email}
            onChange={form.handleChange} error={form.errors.email}
          />
          <FormField
            label="Password" name="password" type="password" icon={Lock} placeholder="At least 8 characters"
            autoComplete="new-password" value={form.values.password}
            onChange={form.handleChange} error={form.errors.password}
            hint="Use 8+ characters with a letter and a number."
          />
          {isAdmin && (
            <FormField
              label="Admin invite code" name="adminInviteCode" icon={KeyRound}
              placeholder="Provided by the platform owner" value={form.values.adminInviteCode}
              onChange={form.handleChange} error={form.errors.adminInviteCode}
            />
          )}
          <Button type="submit" size="lg" fullWidth arrow loading={form.submitting}>Create workspace</Button>
          <p className="auth-form__switch">
            Already have an account? <Link to={ROUTES.login}>Log in</Link>
          </p>
        </form>
      )}
    </AuthLayout>
  );
}