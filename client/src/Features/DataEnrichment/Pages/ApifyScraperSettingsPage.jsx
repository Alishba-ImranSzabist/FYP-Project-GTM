import { useNavigate } from "react-router-dom";
import { ArrowLeft, Database, ShieldCheck } from "lucide-react";

import useAuth from "../../Auth/Hooks/useAuth";
import PanelShell from "../../Panel/components/PanelShell";
import { PANEL_CONFIG } from "../../Panel/panelConfig";
import { ROUTES, USER_ROLES } from "../../../constants/routes";
import ScraperConfigSection from "../components/ScraperConfigSection";
import "../dataEnrichment.css";

export default function ApifyScraperSettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const config = PANEL_CONFIG[user?.role] || PANEL_CONFIG[USER_ROLES.business];

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <PanelShell config={config} user={user} onLogout={handleLogout}>
      <main className="de-page de-scraper-settings-page">
        <button
          type="button"
          className="de-btn de-btn--text de-back-to-data"
          onClick={() => navigate(ROUTES.dataEnrichment)}
        >
          <ArrowLeft size={16}/> Back to Data &amp; Enrichment
        </button>

        <header className="de-page-head">
          <div>
            <span className="de-eyebrow"><Database size={14}/> DATA SOURCE SETTINGS</span>
            <h1>Apify Scraper Configuration</h1>
            <p>Manage your Apify Actors separately from the collection workflow. Add multiple scrapers and provide the input JSON required by each Actor.</p>
          </div>
          <span className="de-run-pill">Apify settings</span>
        </header>

        <section className="de-scraper-page-intro">
          <div className="de-scraper-page-intro__icon"><Database size={23}/></div>
          <div>
            <strong>Configure once, reuse across collection runs</strong>
            <p>Each Actor keeps its own ID, input JSON, execution order and record limit. You can return here whenever you need to add or update a scraper.</p>
          </div>
        </section>

        <ScraperConfigSection />

        <div className="de-scraper-page-note">
          <ShieldCheck size={16}/>
          <span>API credentials must be stored securely on the backend. This page currently manages frontend configuration only; it does not start Apify runs.</span>
        </div>
      </main>
    </PanelShell>
  );
}
