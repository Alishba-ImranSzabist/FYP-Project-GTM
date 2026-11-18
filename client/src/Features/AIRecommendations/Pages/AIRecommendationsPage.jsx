import { AlertCircle, ArrowLeft, Info, Plus, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../../../Shared_Components/Button";
import { ROUTES, USER_ROLES } from "../../../constants/routes";
import FormAlert from "../../Auth/components/FormAlert";
import useAuth from "../../Auth/Hooks/useAuth";
import PanelShell from "../../Panel/components/PanelShell";
import { PANEL_CONFIG } from "../../Panel/panelConfig";
import CampaignSelector from "../components/CampaignSelector";
import ModelSelection from "../components/ModelSelection";
import RecommendationResults from "../components/RecommendationResults";
import useRecommendationWorkflow from "../Hooks/useRecommendationWorkflow";
import { getRecommendationReadinessMessage } from "../recommendationValidation.js";
import "../../Auth/Auth.css";
import "../../Panel/Panel.css";
import "../AIRecommendations.css";

/** /ai-recommendations — campaign recommendations for authenticated business users. */
export default function AIRecommendationsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const feature = useRecommendationWorkflow();
  const config = PANEL_CONFIG[USER_ROLES.business];

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.home, { replace: true });
  };

  const editCampaignPath = feature.selectedCampaign
    ? ROUTES.campaignEdit.replace(":id", feature.selectedCampaign.id)
    : ROUTES.campaignNew;

  return (
    <PanelShell config={config} user={user} onLogout={handleLogout}>
      <div className="air-page">
        {feature.recommendation ? (
          <RecommendationResults
            campaign={feature.selectedCampaign}
            recommendation={feature.recommendation}
            model={feature.model}
            recommendationStyle={feature.recommendationStyle}
            reviewStatus={feature.reviewStatus}
            generating={feature.generating}
            error={feature.error}
            notice={feature.notice}
            onChangeModel={feature.changeModel}
            onRegenerate={feature.generate}
            onSaveDraft={feature.saveDraft}
            onApprove={feature.approve}
          />
        ) : (
          <>
            <div className="pnl__head air-page__heading">
              <div className="pnl__head-text">
                <span className="pnl__eyebrow">BUSINESS WORKSPACE · AI PLANNING</span>
                <h1>AI Recommendations</h1>
                <p>Choose a campaign and an AI model to build a practical go-to-market plan.</p>
              </div>
              <span className="air-preview-badge"><Sparkles size={14} /> Frontend preview</span>
            </div>

            {feature.campaigns.length > 0 && <FormAlert message={feature.error} />}

            {feature.campaignsLoading ? (
              <div className="air-loading-list" aria-busy="true" aria-label="Loading campaigns">
                <div className="pnl-card"><span className="prof__skeleton prof__skeleton--title" /><span className="prof__skeleton" /><span className="prof__skeleton prof__skeleton--short" /></div>
                <div className="pnl-card"><span className="prof__skeleton prof__skeleton--title" /><span className="prof__skeleton prof__skeleton--short" /></div>
              </div>
            ) : feature.campaigns.length === 0 && feature.error ? (
              <section className="pnl-card air-empty-state">
                <span className="air-empty-state__icon"><AlertCircle size={23} /></span>
                <h2>Campaigns could not be loaded</h2>
                <p>Check your connection and try loading your campaigns again.</p>
                <Button variant="outline" size="md" onClick={feature.refreshCampaigns}>Try again</Button>
              </section>
            ) : feature.campaigns.length === 0 ? (
              <section className="pnl-card air-empty-state">
                <span className="air-empty-state__icon"><Sparkles size={23} /></span>
                <h2>Create a campaign first</h2>
                <p>AI Recommendations uses your saved campaign details to suggest an audience, channel mix, budget and campaign plan.</p>
                <Button variant="accent" size="md" icon={Plus} to={ROUTES.campaignNew}>Create campaign</Button>
              </section>
            ) : (
              <div className="air-builder">
                <CampaignSelector
                  campaigns={feature.campaigns}
                  campaign={feature.selectedCampaign}
                  onChange={feature.selectCampaign}
                />

                <ModelSelection
                  value={feature.model}
                  onChange={feature.selectModel}
                  styleValue={feature.recommendationStyle}
                  onStyleChange={feature.selectRecommendationStyle}
                />

                {feature.selectedCampaign && !feature.readiness.isReady && (
                  <div className="air-validation-note" role="alert">
                    <AlertCircle size={18} />
                    <div>
                      <strong>Campaign details need attention</strong>
                      <p>{getRecommendationReadinessMessage(feature.readiness)}</p>
                    </div>
                    <Button variant="outline" size="sm" to={editCampaignPath}>Complete campaign</Button>
                  </div>
                )}

                <div className="air-info-note">
                  <Info size={16} />
                  <p>Recommendations are estimates, not guarantees. Review the suggested plan before using it. This frontend preview uses sample data and does not consume real AI credits.</p>
                </div>

                <div className="air-builder__actions">
                  <Button variant="ghost" size="sm" icon={ArrowLeft} to={ROUTES.campaigns}>Back to campaigns</Button>
                  <Button
                    variant="accent"
                    size="md"
                    icon={Sparkles}
                    loading={feature.generating}
                    disabled={!feature.canGenerate}
                    onClick={feature.generate}
                  >
                    Generate recommendations
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </PanelShell>
  );
}
