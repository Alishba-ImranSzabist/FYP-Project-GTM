import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import BrandMark from "../../../Shared_Components/BrandMark";
import { ROUTES } from "../../../constants/routes";
import "../Auth.css";

/** Split-screen shell used by Login and Signup. */
export default function AuthLayout({ children }) {
  return (
    <div className="auth">
      <aside className="auth__panel">
        <div className="auth__rings" aria-hidden="true" />
        <div className="auth__panel-top">
          <BrandMark tone="light" size="lg" />
        </div>

        <div className="auth__panel-bottom">
          <span className="pill pill--on-dark">
            <ShieldCheck size={14} /> Human-first by design
          </span>
          <h2>
            AI handles the busywork. <em>You make the decisions.</em>
          </h2>
          <p>
            Join modern teams turning scattered market signals into focused, reviewable growth
            actions.
          </p>
        </div>
      </aside>

      <main className="auth__main">
        <Link to={ROUTES.home} className="auth__back">
          <ArrowLeft size={16} /> Back to home
        </Link>

        <div className="auth__brand-mobile">
          <BrandMark size="md" />
        </div>

        <div className="auth__content">{children}</div>
      </main>
    </div>
  );
}
