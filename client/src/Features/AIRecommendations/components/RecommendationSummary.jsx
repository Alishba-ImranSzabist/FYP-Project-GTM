import { BadgeCheck, Coins, Users } from "lucide-react";

const formatMoney = (value, currency = "PKR") =>
  `${currency} ${Number(value || 0).toLocaleString("en-US")}`;

export default function RecommendationSummary({ overview }) {
  if (!overview) return null;

  return (
    <div className="air-summary-grid">
      <article className="air-summary-card air-summary-card--dark">
        <span className="air-summary-card__label"><Users size={15} /> TOP AUDIENCE</span>
        <strong>{overview.audience}</strong>
        <div className="air-summary-card__foot">
          <span>{overview.targetLocations}</span>
          <b>{overview.audienceMatch}% match</b>
        </div>
      </article>

      <article className="air-summary-card">
        <span className="air-summary-card__label"><Coins size={15} /> SUGGESTED BUDGET</span>
        <strong>{formatMoney(overview.budgetMin, overview.currency)} – {formatMoney(overview.budgetMax, overview.currency)}</strong>
        <div className="air-summary-card__foot">
          <span>Estimated planning range</span>
          <b>Review before use</b>
        </div>
      </article>

      <article className="air-summary-card">
        <span className="air-summary-card__label"><BadgeCheck size={15} /> TOP CHANNELS</span>
        <strong>{overview.topChannel}</strong>
        <div className="air-summary-card__foot">
          <span>Suggested starting mix</span>
          <b>Test and compare</b>
        </div>
      </article>
    </div>
  );
}
