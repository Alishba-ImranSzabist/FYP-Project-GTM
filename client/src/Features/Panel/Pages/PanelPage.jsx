import { useNavigate } from "react-router-dom";
import Button from "../../../Shared_Components/Button";
import { ROUTES, USER_ROLES } from "../../../constants/routes";
import useAuth from "../../Auth/Hooks/useAuth";
import PanelShell from "../components/PanelShell";
import { PANEL_CONFIG } from "../panelConfig";
import "../Panel.css";

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

const dateEyebrow = () =>
  new Date()
    .toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })
    .toUpperCase();

/**
 * Role-based panel shown after login. Reads user.role and renders the matching
 * config from panelConfig.js (business / service_provider / admin).
 */
export default function PanelPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const config = PANEL_CONFIG[user?.role] || PANEL_CONFIG[USER_ROLES.business];
  const firstName = (user?.fullName || "there").split(" ")[0];
  const title = config.title || `${greeting()}, ${firstName}`;

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.home, { replace: true });
  };

  return (
    <PanelShell config={config} user={user} onLogout={handleLogout}>
      <div className="pnl__head">
        <div className="pnl__head-text">
          <span className="pnl__eyebrow">{config.eyebrow || dateEyebrow()}</span>
          <h1>{title}</h1>
          <p>{config.subtitle}</p>
        </div>
        <Button variant="primary" size="md" arrow icon={config.cta.icon} to={config.cta.to}>
          {config.cta.label}
        </Button>
      </div>
    </PanelShell>
  );
}
