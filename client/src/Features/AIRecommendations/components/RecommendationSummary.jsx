import { BadgeCheck, Coins, Users } from "lucide-react";
import { formatRecommendationChannel } from "../recommendationSettings.js";

const formatMoney = (value, currency = "PKR") =>
  `${currency} ${Number(value || 0).toLocaleString("en-US")}`;

export default function RecommendationSummary({ overview, fallback, savedBudget }) {
  if (!overview) return null;

  return (
    <div className="air-summary-grid">
      <article className="air-summary-card air-summary-card--dark">
        <span className="air-summary-card__label"><Users size={15} /> TOP AUDIENCE</span>
        <strong>{overview.audience}</strong>
        <div className="air-summary-card__foot">
          <span>{overview.targetLocations}</span>
          {overview.audienceMatch != null && <b>{overview.audienceMatch}% estimated fit</b>}
        </div>
      </article>

      <article className="air-summary-card">
        <span className="air-summary-card__label"><Coins size={15} /> {fallback ? "SAVED CAMPAIGN BUDGET" : "AI-ESTIMATED BUDGET"}</span>
        <strong>{overview.budgetMin == null ? "Awaiting Gemini estimate" : fallback ? formatMoney(overview.budgetMax, overview.currency) : `${formatMoney(overview.budgetMin, overview.currency)} \u2013 ${formatMoney(overview.budgetMax, overview.currency)}`}</strong>
        <div className="air-summary-card__foot">
          {!fallback && <span>Estimated planning range</span>}
          {!fallback && savedBudget != null && <b>Saved budget {formatMoney(savedBudget, overview.currency)}</b>}
        </div>
      </article>

      <article className="air-summary-card">
        <span className="air-summary-card__label"><BadgeCheck size={15} /> {fallback ? "CAMPAIGN CHANNELS" : "TOP CHANNELS"}</span>
        <strong>{overview.topChannel?.split(/\s*\+\s*/).map(formatRecommendationChannel).join(" + ")}</strong>
        <div className="air-summary-card__foot">
          <span>{fallback ? "From campaign settings" : "Suggested starting mix"}</span>
        </div>
      </article>
    </div>
  );
}
