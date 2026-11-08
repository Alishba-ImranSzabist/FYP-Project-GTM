import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Megaphone, Plus } from "lucide-react";
import Button from "../../../Shared_Components/Button";
import { ROUTES, USER_ROLES } from "../../../constants/routes";
import FormAlert from "../../Auth/components/FormAlert";
import useAuth from "../../Auth/Hooks/useAuth";
import PanelShell from "../../Panel/components/PanelShell";
import { PANEL_CONFIG } from "../../Panel/panelConfig";
import CampaignCard from "../components/CampaignCard";
import CampaignTabs from "../components/CampaignTabs";
import useCampaigns from "../Hooks/useCampaigns";
import "../../Auth/Auth.css";
import "../../Panel/Panel.css";
import "../Campaigns.css";

/** /campaigns — every campaign the business has, with filter tabs. */
export default function CampaignsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // The wizard sends a success message here after saving ("Draft saved."). Read it once, then clear it
  // from the browser history so it does not reappear on refresh.
  const [flash] = useState(location.state?.notice || "");
  useEffect(() => {
    if (location.state?.notice) navigate(location.pathname, { replace: true, state: null });
  }, [location, navigate]);

  const list = useCampaigns({ initialNotice: flash });
  const config = PANEL_CONFIG[USER_ROLES.business];

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.home, { replace: true });
  };

  return (
    <PanelShell config={config} user={user} onLogout={handleLogout}>
      <div className="pnl__head">
        <div className="pnl__head-text">
          <h1>Campaigns</h1>
          <p>All your campaigns in one place. Open one to see AI recommendations, leads and results.</p>
        </div>
        <Button variant="accent" size="md" icon={Plus} to={ROUTES.campaignNew}>
          New campaign
        </Button>
      </div>

      <FormAlert tone="success" message={list.notice} />
      <FormAlert message={list.error} />

      <CampaignTabs active={list.filter} counts={list.counts} onChange={list.changeFilter} />

      {list.loading ? (
        <div className="cmp-list" aria-busy="true" aria-label="Loading campaigns">
          {[1, 2, 3].map((n) => (
            <div key={n} className="pnl-card">
              <span className="prof__skeleton prof__skeleton--title" />
              <span className="prof__skeleton prof__skeleton--short" />
            </div>
          ))}
        </div>
      ) : list.campaigns.length === 0 ? (
        <section className="pnl-card cmp-empty">
          <span className="cmp-empty__icon">
            <Megaphone size={22} aria-hidden="true" />
          </span>
          <h3>{list.filter === "all" ? "No campaigns yet" : `No ${list.filter} campaigns`}</h3>
          <p>
            {list.filter === "all"
              ? "Set up your first campaign in a few quick steps."
              : "Campaigns with this status will show up here."}
          </p>
          {list.filter === "all" && (
            <Button variant="accent" size="md" icon={Plus} to={ROUTES.campaignNew}>
              New campaign
            </Button>
          )}
        </section>
      ) : (
        <div className="cmp-list">
          {list.campaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              busy={list.busyId === campaign.id}
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
