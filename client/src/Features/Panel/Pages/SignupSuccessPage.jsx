import { CheckCircle2, Home } from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import AuthLayout from "../../Auth/components/AuthLayout";
import Button from "../../../Shared_Components/Button";
import { ROUTES, USER_ROLES } from "../../../constants/routes";
import useAuth from "../../Auth/Hooks/useAuth";
import { PANEL_CONFIG } from "../panelConfig";
import { ROLE_PROFILE_CONFIG } from "../roleProfile";
import "../../Auth/Auth.css";
import "../Panel.css";

/**
 * Split-screen success page shown right after a successful signup
 * (route: /welcome). Summarises the new workspace and hands the user
 * their role-based panel.
 */
export default function SignupSuccessPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) return null;
  if (!user) return <Navigate to={ROUTES.signup} replace />;

  const config = PANEL_CONFIG[user.role] || PANEL_CONFIG[USER_ROLES.business];
  const firstName = (user.fullName || "there").split(" ")[0];
  const initials = (user.fullName || "U")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const enterPanel = () => navigate(ROUTES.dashboard, { replace: true });

  return (
    <AuthLayout>
      <div className="done">
        <span className="done__check">
          <CheckCircle2 size={30} aria-hidden="true" />
        </span>
        <span className="done__eyebrow">Account created</span>
        <h1 className="done__title">
          You&rsquo;re all set, {firstName}!
        </h1>
        <p className="done__sub">
          Your workspace is ready. Here is what to do next.
        </p>

        <div className="done__card">
          <span className="done__avatar">{initials}</span>
          <span className="done__card-text">
            <strong>{user.fullName}</strong>
            <small>{user.email}</small>
          </span>
        </div>

        <ul className="done__steps">
          {config.welcome.map((step) => (
            <li key={step.title} className="done__step">
              <span className="done__step-icon">
                <step.icon size={18} />
              </span>
              <span className="done__step-text">
                <strong>{step.title}</strong>
                <p>{step.text}</p>
              </span>
            </li>
          ))}
        </ul>

        <Button variant="primary" size="lg" fullWidth arrow onClick={enterPanel}>
          Enter my dashboard
        </Button>

        {ROLE_PROFILE_CONFIG[user.role] && (
          <Button variant="outline" size="lg" fullWidth to={ROUTES.profileSetup}>
            Set up my profile
          </Button>
        )}

        <p className="done__alt">
          <Link to={ROUTES.home}>
            <Home size={14} aria-hidden="true" /> Back to home
          </Link>
          <span className="done__hint">You can switch these steps any time from your panel.</span>
        </p>
      </div>
    </AuthLayout>
  );
}