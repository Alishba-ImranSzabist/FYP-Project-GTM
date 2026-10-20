import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../Hooks/useAuth";
import { ROUTES } from "../../../constants/routes";

/** Wrap any page that needs a logged-in user. Optional `roles` restricts by role.
 *  `allowUnverified` lets the verify-email screen itself render for pending accounts. */
export default function ProtectedRoute({ children, roles, allowUnverified = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="auth-loading" role="status" aria-live="polite">
        <span className="auth-loading__spinner" />
        <span className="sr-only">Loading…</span>
      </div>
    );
  }

  if (!user) return <Navigate to={ROUTES.login} state={{ from: location }} replace />;
  // Panel stays locked until the email code has been entered at least once.
  if (!allowUnverified && !user.isEmailVerified) return <Navigate to={ROUTES.verifyEmail} replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={ROUTES.dashboard} replace />;

  return children;
}
