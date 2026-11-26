import { useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CalendarClock,
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
import { AI_RECOMMENDATION_MODELS, AI_RECOMMENDATION_STYLES } from "../recommendationSettings.js";
import RecommendationSection from "./RecommendationSection";
import RecommendationPicker from "./RecommendationPicker";
import RecommendationSummary from "./RecommendationSummary";

const SECTION_ICONS = {
  audience: Users,
  channels: Megaphone,
  budget: CircleDollarSign,
  content: Lightbulb,
  leadSignals: Search,
  schedule: CalendarClock,
};

const FALLBACK_MESSAGES = {
  rate_limit: "Gemini reached the shared project’s rate limit or quota.",
  overloaded: "Gemini reported a temporary service issue.",
  timeout: "Gemini took too long to respond.",
  connection: "The server could not reach Gemini.",
  not_configured: "Gemini needs to be configured by an administrator.",
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
  onChangeStyle,
  onRegenerate,
  onSaveDraft,
  onApprove,
}) {
  const selectedModel = AI_RECOMMENDATION_MODELS.find((item) => item.id === model);
  const generatedStyle = recommendation.recommendationStyle || recommendationStyle;
  const generatedStyleLabel = AI_RECOMMENDATION_STYLES.find(({ id }) => id === generatedStyle)?.label || "Balanced";
  const editPath = ROUTES.campaignEdit.replace(":id", campaign.id);
  // The backend returns the currently enabled admin-configured sections in display order.
  const sections = Array.isArray(recommendation.sections) ? recommendation.sections : [];
  const [searchParams] = useSearchParams();
  const activeIndex = sections.findIndex((section) => section.id === searchParams.get("section"));
  const activeSection = sections[activeIndex];
  const viewStart = useRef(null);
  const lastSection = useRef(null);

  useEffect(() => {
    const sectionId = activeSection?.id ?? null;
    if (sectionId === lastSection.current) return;
    lastSection.current = sectionId;
    viewStart.current?.focus({ preventScroll: true });
    viewStart.current?.scrollIntoView({ block: "start" });
  }, [activeSection?.id]);

  function sectionPath(sectionId) {
    const params = new URLSearchParams(searchParams);
    if (sectionId) params.set("section", sectionId);
    else params.delete("section");
    return { search: params.toString() };
  }

  if (activeSection) {
    const previous = sections[activeIndex - 1];
    const next = sections[activeIndex + 1];

    return (
      <div className="air-detail" tabIndex={-1} ref={viewStart} aria-label={activeSection.title}>
        <div className="air-detail__bar">
          <Button to={sectionPath()} variant="outline" size="sm" icon={ArrowLeft}>Back to recommendations</Button>
          <span>{campaign.name}{recommendation.mode === "fallback" && " \u00b7 Rules-based plan"}</span>
        </div>

        <RecommendationSection section={activeSection} />

        {(previous || next) && (
          <nav className="air-detail__navigation" aria-label="Browse recommendation sections">
            {previous && (
              <Link to={sectionPath(previous.id)} className="air-detail__step">
                <ArrowLeft size={18} aria-hidden="true" />
                <span><small>Previous</small><strong>{previous.title}</strong></span>
              </Link>
            )}
            {next && (
              <Link to={sectionPath(next.id)} className="air-detail__step air-detail__step--next">
                <span><small>Next</small><strong>{next.title}</strong></span>
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            )}
          </nav>
        )}
      </div>
    );
  }

  return (
    <div className="air-results" tabIndex={-1} ref={viewStart}>
      <div className="air-results__header">
        <div>
          <span className="air-kicker">BUSINESS WORKSPACE · CAMPAIGN PLAN</span>
          <h1>AI Recommendations</h1>
          <p>{campaign.name} · {recommendation.mode === "fallback" ? "Rules-based plan" : recommendation.model?.providerModel || selectedModel?.name || "AI model"} · {generatedStyleLabel} style · Generated {formatGeneratedAt(recommendation.generatedAt)}</p>
        </div>
        <div className="air-results__actions">
          <Button variant="outline" size="sm" to={editPath} icon={Settings2}>Edit campaign</Button>
          <div className="air-results__style">
            <RecommendationPicker
              label="Change style"
              value={recommendationStyle}
              onChange={onChangeStyle}
              options={AI_RECOMMENDATION_STYLES.map(({ id, label }) => ({ value: id, label }))}
              disabled={generating}
            />
          </div>
          <Button variant="accent" size="sm" icon={RefreshCw} loading={generating} onClick={onRegenerate}>Regenerate</Button>
        </div>
      </div>

      <FormAlert message={error} />

      {recommendation.mode === "fallback" && (
        <div className="air-preview-notice" role="status">
          <strong>{FALLBACK_MESSAGES[recommendation.fallbackReason] || "Gemini was unavailable when this plan was generated."}</strong>{" "}
          This plan uses your saved campaign details and planning rules. {recommendation.fallbackReason === "not_configured" ? "Regenerate after configuration is updated." : "Regenerate later for a Gemini recommendation."}
        </div>
      )}

      {(recommendation.assessment?.recommendation || recommendation.strategy) && (
        <section className="pnl-card air-strategy">
          <div className="air-section-icon"><Lightbulb size={18} aria-hidden="true" /></div>
          <div>
            <h2>{recommendation.assessment?.recommendation ? "Gemini recommendation" : "Recommended approach"}</h2>
            <p>{recommendation.assessment?.recommendation || recommendation.strategy}</p>
            {recommendation.assessment?.rationale && <p><strong>Why this fits</strong> {recommendation.assessment.rationale}</p>}
            {recommendation.assessment?.validation && <p><strong>How to test it</strong> {recommendation.assessment.validation}</p>}
          </div>
        </section>
      )}

      <RecommendationSummary overview={recommendation.overview} fallback={recommendation.mode === "fallback"} savedBudget={campaign.budgetAiSuggested ? null : campaign.budget} />

      <nav className="air-results__tabs" aria-label="Recommendation sections">
        {sections.map((section) => {
          const Icon = SECTION_ICONS[section.id] || Lightbulb;

          return (
            <Link key={section.id} className="air-results__tab" to={sectionPath(section.id)}>
              <span className="air-results__tab-icon"><Icon size={19} aria-hidden="true" /></span>
              <span className="air-results__tab-label">{section.title || section.id}</span>
              <span className="air-results__tab-action">View <ArrowRight size={15} aria-hidden="true" /></span>
            </Link>
          );
        })}
      </nav>

      <section className="air-review-panel">
        <div className="air-review-panel__copy">
          <span className="air-review-panel__icon"><Clock3 size={18} /></span>
          <div>
            <h3>{reviewStatus === "approved" ? "Plan approved" : reviewStatus === "draft" ? "Draft saved" : "Review before you proceed"}</h3>
            <p>{reviewStatus === "approved" ? "Regenerate to request an updated recommendation." : "Check the suggested audience, budget and plan before approving."}</p>
          </div>
        </div>
        <div className="air-review-panel__actions">
          {reviewStatus !== "approved" && reviewStatus !== "draft" && (
            <Button variant="light" size="sm" onClick={onSaveDraft} disabled={generating}>Save as draft</Button>
          )}
          {reviewStatus !== "approved" && (
            <Button variant="accent" size="sm" onClick={onApprove} disabled={generating}>Mark as approved</Button>
          )}
        </div>
      </section>

      {notice && <div className="air-preview-notice" role="status">{notice}</div>}
    </div>
  );
}
