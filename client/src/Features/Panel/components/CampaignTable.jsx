import { Megaphone } from "lucide-react";

/** Active-campaigns table (business panel). */
export default function CampaignTable({ title, subtitle, action, rows }) {
  return (
    <section className="pnl-card">
      <header className="pnl-card__head">
        <div className="pnl-card__titles">
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
        <button type="button" className="pnl-link">
          {action}
        </button>
      </header>

      <div className="pnl-table__scroll">
        <table className="pnl-table">
          <thead>
            <tr>
              <th>Campaign</th>
              <th>Status</th>
              <th>Leads</th>
              <th>Sent</th>
              <th>Replies</th>
              <th>ROI</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name}>
                <td>
                  <span className="pnl-table__icon">
                    <Megaphone size={16} />
                  </span>
                  <span className="pnl-table__name">
                    <strong>{r.name}</strong>
                    <small>{r.meta}</small>
                  </span>
                </td>
                <td>
                  <span className={`pnl-tag pnl-tag--${r.tone}`}>{r.status}</span>
                </td>
                <td>{r.leads}</td>
                <td>{r.sent}</td>
                <td>{r.replies}</td>
                <td className="pnl-table__roi">{r.roi}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
