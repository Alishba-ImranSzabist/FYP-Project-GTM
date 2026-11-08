import { useState } from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../../constants/routes";
import { timeAgo } from "../../Campaigns/campaignFormat";
import { STATUS_META } from "../serviceListingConfig";

/** "12 new matches · 3 saved" / "Matching is off" / "Not matching yet" for one service. */
function matchesText({ status, stats }) {
  if (status === "draft") return "Not matching yet. Finish the draft to start.";
  if (status === "paused") return "Matching is off";
  if (!stats.newMatches && !stats.savedMatches) return "Looking for matches…";
  const parts = [`${stats.newMatches} new match${stats.newMatches === 1 ? "" : "es"}`];
  if (stats.savedMatches) parts.push(`${stats.savedMatches} saved`);
  return parts.join(" · ");
}

/** One row of the services list: name, status, keywords, matches and Edit / Pause / Duplicate / Delete. */
export default function ServiceCard({ service, busy, onToggleMatching, onDuplicate, onDelete }) {
  const [confirming, setConfirming] = useState(false);
  const status = STATUS_META[service.status];
  const canToggle = service.status !== "draft"; // drafts have nothing to pause

  return (
    <article className="pnl-card cmp-card" aria-busy={busy}>
      <div className="cmp-card__main">
        <div className="cmp-card__title">
          <h3>{service.name}</h3>
          <span className={`pnl-tag pnl-tag--${status.tone}`}>{status.label}</span>
        </div>
        {service.keywords.length > 0 && <p className="cmp-card__meta">{service.keywords.join(" · ")}</p>}
        <small className="cmp-card__edited">
          {matchesText(service)} · Edited {timeAgo(service.updatedAt)}
        </small>
      </div>

      {confirming ? (
        <div className="cmp-card__actions" role="alert">
          <span className="cmp-card__confirm">Delete this service?</span>
          <button type="button" className="cmp-action cmp-action--danger" disabled={busy} onClick={() => onDelete(service.id)}>
            Yes, delete
          </button>
          <button type="button" className="cmp-action cmp-action--muted" onClick={() => setConfirming(false)}>
            Cancel
          </button>
        </div>
      ) : (
        <div className="cmp-card__actions">
          <Link to={ROUTES.serviceEdit.replace(":id", service.id)} className="cmp-action">
            Edit
          </Link>
          {canToggle && (
            <button type="button" className="cmp-action" disabled={busy} onClick={() => onToggleMatching(service)}>
              {service.status === "active" ? "Pause" : "Resume"}
            </button>
          )}
          <button type="button" className="cmp-action" disabled={busy} onClick={() => onDuplicate(service.id)}>
            Duplicate
          </button>
          <button type="button" className="cmp-action cmp-action--danger" disabled={busy} onClick={() => setConfirming(true)}>
            Delete
          </button>
        </div>
      )}
    </article>
  );
}
