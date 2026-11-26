import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../Auth/Hooks/useAuth";
import PanelShell from "../../Panel/components/PanelShell";
import { PANEL_CONFIG } from "../../Panel/panelConfig";
import { ROUTES } from "../../../constants/routes";
import "../../Panel/Panel.css";
import "../AIModelManagement.css";

/** Reuses the exact existing Admin sidebar, top bar, profile and logout flow. */
export default function AIModelManagementLayout({ children, className = "" }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = useCallback(async () => {
    await logout();
    navigate(ROUTES.home, { replace: true });
  }, [logout, navigate]);

  return (
    <PanelShell
      config={PANEL_CONFIG.admin}
      user={user}
      onLogout={handleLogout}
    >
      <div className={`aimm-page ${className}`}>{children}</div>
    </PanelShell>
  );
}
