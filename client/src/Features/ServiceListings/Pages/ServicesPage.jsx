import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Briefcase, Plus } from "lucide-react";
import Button from "../../../Shared_Components/Button";
import { ROUTES, USER_ROLES } from "../../../constants/routes";
import FormAlert from "../../Auth/components/FormAlert";
import useAuth from "../../Auth/Hooks/useAuth";
import PanelShell from "../../Panel/components/PanelShell";
import { PANEL_CONFIG } from "../../Panel/panelConfig";
import ServiceCard from "../components/ServiceCard";
import useServiceListings from "../Hooks/useServiceListings";
import "../../Auth/Auth.css";
import "../../Panel/Panel.css";
import "../../Campaigns/Campaigns.css"; // shared cmp-* styles (cards, wizard, pills)
import "../ServiceListings.css";

/** /services — every service the provider offers. */
export default function ServicesPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // The wizard sends a success message here after saving. Read it once, then clear it
  // from the browser history so it does not reappear on refresh.
  const [flash] = useState(location.state?.notice || "");
  useEffect(() => {
    if (location.state?.notice) navigate(location.pathname, { replace: true, state: null });
  }, [location, navigate]);

  const list = useServiceListings({ initialNotice: flash });
  const config = PANEL_CONFIG[USER_ROLES.serviceProvider];

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.home, { replace: true });
  };

  return (
    <PanelShell config={config} user={user} onLogout={handleLogout}>
      <div className="pnl__head">
        <div className="pnl__head-text">
          <h1>My Services</h1>
          <p>Add every service you offer. The AI finds opportunities for each one.</p>
        </div>
        <Button variant="accent" size="md" icon={Plus} to={ROUTES.serviceNew}>
          Add service
        </Button>
      </div>

      <FormAlert tone="success" message={list.notice} />
      <FormAlert message={list.error} />

      {list.loading ? (
        <div className="cmp-list" aria-busy="true" aria-label="Loading services">
          {[1, 2, 3].map((n) => (
            <div key={n} className="pnl-card">
              <span className="prof__skeleton prof__skeleton--title" />
              <span className="prof__skeleton prof__skeleton--short" />
            </div>
          ))}
        </div>
      ) : list.services.length === 0 ? (
        <section className="pnl-card cmp-empty">
          <span className="cmp-empty__icon">
            <Briefcase size={22} aria-hidden="true" />
          </span>
          <h3>No services yet</h3>
          <p>Describe what you offer in a few quick steps and the AI will start looking for opportunities.</p>
          <Button variant="accent" size="md" icon={Plus} to={ROUTES.serviceNew}>
            Add service
          </Button>
        </section>
      ) : (
        <div className="cmp-list">
          {list.services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              busy={list.busyId === service.id}
              onToggleMatching={list.toggleMatching}
              onDuplicate={list.duplicate}
              onDelete={list.remove}
            />
          ))}
          {list.hasMore && (
            <Button variant="outline" size="sm" loading={list.loadingMore} onClick={list.loadMore}>
              Load more
            </Button>
          )}
        </div>
      )}
    </PanelShell>
  );
}
