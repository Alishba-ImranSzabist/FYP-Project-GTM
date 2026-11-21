import { useEffect, useState } from "react";
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Lightbulb,
  Megaphone,
  RefreshCw,
  Search,
  Settings2,
  Users,
} from "lucide-react";
import Button from "../../../Shared_Components/Button";
import FormAlert from "../../Auth/components/FormAlert";
import { ROUTES } from "../../../constants/routes";
import { AI_RECOMMENDATION_MODELS, AI_RECOMMENDATION_SECTIONS } from "../recommendationSettings.js";
import RecommendationSection from "./RecommendationSection";
import RecommendationSummary from "./RecommendationSummary";

const SECTION_ICONS = {
  audience: Users,
  channels: Megaphone,
  budget: CircleDollarSign,
  content: Lightbulb,
  leadSignals: Search,
  schedule: CalendarClock,
};

const formatGeneratedAt = (value) => {
  if (!value) return "Just now";

  return new Date(value).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function RecommendationResults({
  campaign,
  recommendation,
  model,
  recommendationStyle,
  reviewStatus,
  generating,
  error,
  notice,
  onChangeModel,
  onRegenerate,
  onSaveDraft,
  onApprove,
}) {
  const selectedModel = AI_RECOMMENDATION_MODELS.find((item) => item.id === model);
  const selectedStyleLabel = recommendationStyle
    ? recommendationStyle.charAt(0).toUpperCase() + recommendationStyle.slice(1)
    : "Balanced";
  const editPath = ROUTES.campaignEdit.replace(":id", campaign.id);
  // The backend returns the currently enabled admin-configured sections in display order.
  const sections = Array.isArray(recommendation.sections) ? recommendation.sections : [];
  const [activeSectionId, setActiveSectionId] = useState(sections[0]?.id || "");

  useEffect(() => {
    setActiveSectionId(sections[0]?.id || "");
  }, [recommendation]);

  const activeSection = sections.find((section) => section.id === activeSectionId) || sections[0];

  return (
    <div className="air-results">
      <div className="air-results__header">
        <div>
          <span className="air-kicker">BUSINESS WORKSPACE · CAMPAIGN PLAN</span>
          <h1>AI Recommendations</h1>
          <p>{campaign.name} · {selectedModel?.name || "AI model"} model · {selectedStyleLabel} style · Generated {formatGeneratedAt(recommendation.generatedAt)}</p>
        </div>
        <div className="air-results__actions">
          <Button variant="outline" size="sm" to={editPath} icon={Settings2}>Edit campaign</Button>
          <Button variant="ghost" size="sm" onClick={onChangeModel}>Change model</Button>
          <Button variant="accent" size="sm" icon={RefreshCw} loading={generating} onClick={onRegenerate}>Regenerate</Button>
        </div>
      </div>

      <FormAlert message={error} />

      <div className="air-disclaimer">
        <CheckCircle2 size={16} />
        <p>Recommendations are estimates based on the campaign details provided. Review the suggestions and validate them with real market and account data before acting.</p>
        <span className={`air-review-status air-review-status--${reviewStatus}`}>
          {reviewStatus === "approved" ? "Approved" : reviewStatus === "draft" ? "Draft saved" : "Needs review"}
        </span>
      </div>

      <RecommendationSummary overview={recommendation.overview} />

      <div className="air-results__tabs" role="tablist" aria-label="Recommendation sections">
        {sections.map((section) => {
          const knownMeta = AI_RECOMMENDATION_SECTIONS.find((item) => item.id === section.id);
          const meta = knownMeta || { number: String(sections.indexOf(section) + 1).padStart(2, "0"), title: section.title || section.id };
          const isActive = activeSection?.id === section.id;
          const Icon = SECTION_ICONS[section.id] || Lightbulb;

          return (
            <button
              key={section.id}
              type="button"
              role="tab"
              id={`air-tab-${section.id}`}
              aria-controls={`air-tab-panel-${section.id}`}
              aria-selected={isActive}
              className={`air-results__tab ${isActive ? "is-active" : ""}`}
              onClick={() => setActiveSectionId(section.id)}
            >
              <span className="air-results__tab-top">
                <span className="air-results__tab-icon"><Icon size={19} aria-hidden="true" /></span>
                <span className="air-results__tab-number">{meta?.number}</span>
              </span>
              <span className="air-results__tab-label">{meta?.title || section.id}</span>
              <span className="air-results__tab-footer">
                <span>{isActive ? "Currently viewing" : "Open recommendation"}</span>
                <span className="air-results__tab-action">View <ArrowRight size={15} aria-hidden="true" /></span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="air-results__sections">
        {activeSection ? (
          <div
            role="tabpanel"
            id={`air-tab-panel-${activeSection.id}`}
            aria-labelledby={`air-tab-${activeSection.id}`}
          >
            <RecommendationSection section={activeSection} />
          </div>
        ) : null}
      </div>

      <section className="air-review-panel">
        <div className="air-review-panel__copy">
          <span className="air-review-panel__icon"><Clock3 size={18} /></span>
          <div>
            <h3>Review before you proceed</h3>
            <p>Check the suggested audience, budget and plan. Approval is saved to your account; it does not launch a campaign or contact leads.</p>
          </div>
        </div>
        <div className="air-review-panel__actions">
          <Button variant="light" size="sm" onClick={onSaveDraft} disabled={generating}>Save as draft</Button>
          <Button variant="accent" size="sm" onClick={onApprove} disabled={generating || reviewStatus === "approved"}>Mark as approved</Button>
        </div>
      </section>

      {notice && <div className="air-preview-notice" role="status">{notice}</div>}
    </div>
  );
}
