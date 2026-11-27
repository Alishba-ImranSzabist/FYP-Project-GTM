import { useNavigate } from "react-router-dom";
import { ArrowLeft, Database } from "lucide-react";
import useAuth from "../../Auth/Hooks/useAuth";
import PanelShell from "../../Panel/components/PanelShell";
import { PANEL_CONFIG } from "../../Panel/panelConfig";
import { ROUTES, USER_ROLES } from "../../../constants/routes";
import ScraperConfigSection from "../../DataEnrichment/components/ScraperConfigSection";
import "../../DataEnrichment/dataEnrichment.css";
import "../Opportunities.css";

/**
 * Service-provider Apify configuration.
 * Reuses the existing Apify configuration component, validation hook and
 * service adapter so Business and Service Provider manage Actors consistently.
 */
export default function OpportunityApifySettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.home, { replace: true });
  };

  return (
    <PanelShell
      config={PANEL_CONFIG[USER_ROLES.serviceProvider]}
      user={user}
      onLogout={handleLogout}
    >
      <main className="opp-page opp-apify-page">
        <header className="opp-heading">
          <div>
            <span className="opp-eyebrow">OPPORTUNITY DISCOVERY · APIFY</span>
            <h1>Apify scraper configuration</h1>
            <p>
              Configure the Actors used to discover public posts, profiles and
              service opportunities. Each Actor has its own input JSON schema.
            </p>
          </div>
          <span className="opp-run-tag"><Database size={14}/> Apify setup</span>
        </header>

        <div className="opp-apify-back">
          <button
            type="button"
            className="opp-btn opp-btn--ghost"
            onClick={() => navigate(ROUTES.opportunities)}
          >
            <ArrowLeft size={16}/> Back to Opportunity Discovery
          </button>
        </div>

        <ScraperConfigSection />
      </main>
    </PanelShell>
  );
}
