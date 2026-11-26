import { CheckCircle2, Info, Sparkles } from "lucide-react";
import AIModelManagementLayout from "../components/AIModelManagementLayout";
import ConfigurationCard from "../components/ConfigurationCard";
import { AI_MODEL_MANAGEMENT_OPTIONS } from "../aiModelManagementConfig";
import { ROUTES } from "../../../constants/routes";

export default function AIModelManagementPage() {
  return (
    <AIModelManagementLayout>
      <div className="pnl__head aimm-landing-heading">
        <div className="pnl__head-text">
          <span className="pnl__eyebrow">PLATFORM CONTROL CENTER</span>
          <h1>AI Model Management</h1>
          <p>Manage AI providers, model behaviour, recommendation rules, prompts and user-level AI usage.</p>
        </div>
        <span className="aimm-preview-label"><Sparkles size={15} /> Admin configuration</span>
      </div>

      <section className="aimm-routing-banner" aria-label="Current model assignments">
        <div className="aimm-routing-banner__icon"><Info size={19} /></div>
        <div className="aimm-routing-banner__copy">
          <strong>Model assignments for business recommendations</strong>
          <p>View the current model and runtime limits in AI Provider Configuration.</p>
        </div>
        <div className="aimm-routing-pills">
          <span><b>Fast</b> Gemini Flash</span>
        </div>
      </section>

      <div className="aimm-section-intro">
        <div>
          <span className="aimm-section-kicker">CONFIGURATION WORKSPACE</span>
          <h2>Choose what you want to manage</h2>
          <p>Each option opens its own settings page. Your existing Admin sidebar and account controls stay unchanged.</p>
        </div>
        <span className="aimm-section-count">{String(AI_MODEL_MANAGEMENT_OPTIONS.length).padStart(2, "0")} SETTINGS AREAS</span>
      </div>

      <div className="aimm-options-grid">
        {AI_MODEL_MANAGEMENT_OPTIONS.map((option) => (
          <ConfigurationCard
            key={option.id}
            option={option}
            to={ROUTES[option.routeKey]}
          />
        ))}
      </div>

      <section className="aimm-security-note">
        <CheckCircle2 size={18} />
        <div>
          <strong>Admin-only configuration</strong>
          <p>These pages are protected for Admin accounts. API keys must be stored and used by the backend, never exposed in browser code.</p>
        </div>
      </section>
    </AIModelManagementLayout>
  );
}
