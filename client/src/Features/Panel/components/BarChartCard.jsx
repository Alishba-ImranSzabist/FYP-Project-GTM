import { TrendingUp } from "lucide-react";

/** Bar chart card (pure CSS bars — no chart library). */
export default function BarChartCard({ title, subtitle, action, total, delta, bars, highlight = -1 }) {
  return (
    <section className="pnl-card pnl-chart">
      <header className="pnl-card__head">
        <div className="pnl-card__titles">
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
        <span className="pnl-chip">{action}</span>
      </header>

      <div className="pnl-chart__figure">
        <strong>{total}</strong>
        <span className="pnl-delta">
          <TrendingUp size={13} aria-hidden="true" />
          {delta}
        </span>
      </div>

      <div className="pnl-chart__bars" aria-hidden="true">
        {bars.map((h, i) => (
          <span
            key={i}
            className={`pnl-chart__bar ${i === highlight ? "is-hi" : ""}`}
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      <div className="pnl-chart__labels" aria-hidden="true">
        {["Jun", "Jul", "Aug", "Sep"].map((m) => (
          <span key={m}>{m}</span>
        ))}
      </div>
    </section>
  );
}

