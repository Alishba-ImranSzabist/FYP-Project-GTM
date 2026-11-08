import { useNavigate, useParams } from "react-router-dom";
import Button from "../../../Shared_Components/Button";
import { ROUTES, USER_ROLES } from "../../../constants/routes";
import FormAlert from "../../Auth/components/FormAlert";
import useAuth from "../../Auth/Hooks/useAuth";
import PanelShell from "../../Panel/components/PanelShell";
import { PANEL_CONFIG } from "../../Panel/panelConfig";
import { STEPS } from "../campaignConfig";
import StepAudience from "../components/StepAudience";
import StepBudget from "../components/StepBudget";
import StepDetails from "../components/StepDetails";
import StepReview from "../components/StepReview";
import WizardSteps from "../components/WizardSteps";
import useCampaignWizard from "../Hooks/useCampaignWizard";
import "../../Auth/Auth.css";
import "../../Panel/Panel.css";
import "../Campaigns.css";

/**
 * /campaigns/new and /campaigns/:id/edit — the 4-step setup wizard.
 * This page only lays things out; the logic is in useCampaignWizard and campaignForm.js.
 */
export default function CampaignWizardPage() {
  const { id } = useParams(); // undefined on /campaigns/new
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const wizard = useCampaignWizard(id);
  const config = PANEL_CONFIG[USER_ROLES.business];

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.home, { replace: true });
  };

  const { step, stepIndex, isLastStep, values, saving } = wizard;
  const nextStepLabel = STEPS[stepIndex + 1]?.label;

  // Enter key / primary button: next step, or finish on the Review step.
  const handleSubmit = (event) => {
    event.preventDefault();
    if (isLastStep) wizard.save("active");
    else wizard.goNext();
  };

  const renderStep = () => {
    switch (step.id) {
      case "details":
        return <StepDetails form={wizard} />;
      case "audience":
        return <StepAudience form={wizard} />;
      case "budget":
        return <StepBudget form={wizard} />;
      default:
        return <StepReview values={values} goTo={wizard.goTo} />;
    }
  };

  return (
    <PanelShell config={config} user={user} onLogout={handleLogout}>
      <div className="cmp-wizard">
        {wizard.loading ? (
          <section className="pnl-card" aria-busy="true" aria-label="Loading campaign">
            <span className="prof__skeleton prof__skeleton--title" />
            <span className="prof__skeleton" />
            <span className="prof__skeleton prof__skeleton--short" />
          </section>
        ) : wizard.loadError ? (
          <>
            <FormAlert message={wizard.loadError} />
            <div>
              <Button variant="outline" size="sm" to={ROUTES.campaigns}>
                Back to campaigns
              </Button>
            </div>
          </>
        ) : (
          <>
            <WizardSteps steps={STEPS} current={stepIndex} onSelect={wizard.goTo} />

            <div className="pnl__head-text">
              <h1 className="cmp-wizard__title">{step.title}</h1>
              <p className="cmp-wizard__intro">{step.intro}</p>
            </div>

            <form className="pnl-card cmp-form" onSubmit={handleSubmit} noValidate>
              <FormAlert message={wizard.formError} />

              {renderStep()}

              <div className="cmp-actions">
                {stepIndex === 0 ? (
                  <Button variant="ghost" size="sm" to={ROUTES.campaigns} disabled={saving}>
                    Cancel
                  </Button>
                ) : (
                  <Button type="button" variant="ghost" size="sm" onClick={wizard.goBack} disabled={saving}>
                    Back
                  </Button>
                )}

                <div className="cmp-actions__right">
                  {wizard.canSaveDraft && (
                    <Button
                      type="button"
                      variant="light"
                      size="sm"
                      onClick={() => wizard.save("draft")}
                      disabled={saving}
                    >
                      Save as draft
                    </Button>
                  )}
                  <Button type="submit" variant="accent" size="sm" loading={saving}>
                    {isLastStep ? wizard.finishLabel : `Next: ${nextStepLabel}`}
                  </Button>
                </div>
              </div>
            </form>
          </>
        )}
      </div>
    </PanelShell>
  );
}
