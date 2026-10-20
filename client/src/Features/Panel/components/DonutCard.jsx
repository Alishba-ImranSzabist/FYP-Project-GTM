const R = 70;
const C = 2 * Math.PI * R;

/** SVG donut (funnel / system health) with centre value and legend. */
export default function DonutCard({ title, subtitle, percent, caption, segments, legend }) {
  let offset = 0;

  return (
    <section className="pnl-card pnl-donut">
      <header className="pnl-card__head">
        <div className="pnl-card__titles">
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
        <span className="pnl-card__menu" aria-hidden="true">
          •••
        </span>
      </header>

      <div className="pnl-donut__wrap">
        <svg viewBox="0 0 160 160" role="img" aria-label={`${percent} ${caption}`}>
          <g transform="rotate(-90 80 80)">
            <circle className="pnl-donut__track" cx="80" cy="80" r={R} />
            {segments.map((s, i) => {
              const len = (s.value / 100) * C;
              const dash = Math.max(len - 4, 1);
              const node = (
                <circle
                  key={i}
                  className="pnl-donut__seg"
                  cx="80"
                  cy="80"
                  r={R}
                  stroke={s.color}
                  strokeDasharray={`${dash} ${C - dash}`}
                  strokeDashoffset={-offset}
                />
              );
              offset += len;
              return node;
            })}
          </g>
        </svg>
        <div className="pnl-donut__center">
          <strong>{percent}</strong>
          <span>{caption}</span>
        </div>
      </div>

      <ul className="pnl-donut__legend">
        {legend.map((l) => (
          <li key={l.label}>
            <span className="pnl-dot" style={{ background: l.color }} />
            <span className="pnl-donut__legend-label">{l.label}</span>
            <strong>{l.value}</strong>
          </li>
        ))}
      </ul>
    </section>
  );
}
