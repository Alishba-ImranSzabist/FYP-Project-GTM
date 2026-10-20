import { ChevronRight } from "lucide-react";

/** Recent-activity list: tinted icon, title, meta line and a right-aligned time. */
export default function ActivityCard({ title, subtitle, items }) {
  return (
    <section className="pnl-card pnl-activity">
      <header className="pnl-card__head">
        <div className="pnl-card__titles">
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
        <button type="button" className="pnl-link">
          View all
        </button>
      </header>

      <ul className="pnl-activity__list">
        {items.map((it) => (
          <li key={it.title} className="pnl-activity__item">
            <span className="pnl-activity__icon">
              <it.icon size={17} />
            </span>
            <div className="pnl-activity__text">
              <strong>{it.title}</strong>
              <p>{it.meta}</p>
            </div>
            <span className="pnl-activity__time">{it.time}</span>
            <ChevronRight className="pnl-activity__chev" size={16} aria-hidden="true" />
          </li>
        ))}
      </ul>
    </section>
  );
}
