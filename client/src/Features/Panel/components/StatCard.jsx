import { TrendingUp } from "lucide-react";

/** One KPI card: tinted icon, label, big value and a green delta line. */
export default function StatCard({ label, value, delta, icon: Icon, tint = "teal" }) {
  return (
    <article className="pnl-stat">
      <span className={`pnl-stat__icon pnl-stat__icon--${tint}`}>
        <Icon size={20} />
      </span>
      <p className="pnl-stat__label">{label}</p>
      <strong className="pnl-stat__value">{value}</strong>
      <span className="pnl-stat__delta">
        <TrendingUp size={13} aria-hidden="true" />
        {delta}
      </span>
    </article>
  );
}
