import { useState } from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../../constants/routes";
import { OBJECTIVE_OPTIONS, STATUS_META, labelOf } from "../campaignConfig";
import { formatDateRange, timeAgo } from "../campaignFormat";

/** One row of the campaigns list: name, status, summary line and Edit / Duplicate / Delete. */
export default function CampaignCard({ campaign, busy, onDuplicate, onDelete }) {
  const [confirming, setConfirming] = useState(false);
  const status = STATUS_META[campaign.status];
  const canEdit = campaign.status !== "completed"; // the server refuses edits to completed campaigns

  // "Generate leads · Lahore, Karachi · 10 Nov – 10 Dec" (parts that are empty are skipped)
  const summary = [
    labelOf(OBJECTIVE_OPTIONS, campaign.objective),
    campaign.targetLocations.join(", "),
    formatDateRange(campaign.startDate, campaign.endDate),
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <article className="pnl-card cmp-card" aria-busy={busy}>
      <div className="cmp-card__main">
        <div className="cmp-card__title">
          <h3>{campaign.name}</h3>
          <span className={`pnl-tag pnl-tag--${status.tone}`}>{status.label}</span>
        </div>
        {summary && <p className="cmp-card__meta">{summary}</p>}
        <small className="cmp-card__edited">Last edited {timeAgo(campaign.updatedAt)}</small>
      </div>

      {confirming ? (
        <div className="cmp-card__actions" role="alert">
          <span className="cmp-card__confirm">Delete this campaign?</span>
          <button
            type="button"
            className="cmp-action cmp-action--danger"
            disabled={busy}
            onClick={() => onDelete(campaign.id)}
          >
            Yes, delete
          </button>
          <button type="button" className="cmp-action cmp-action--muted" onClick={() => setConfirming(false)}>
            Cancel
          </button>
        </div>
      ) : (
        <div className="cmp-card__actions">
          {canEdit && (
            <Link to={ROUTES.campaignEdit.replace(":id", campaign.id)} className="cmp-action">
              Edit
            </Link>
          )}
          <button type="button" className="cmp-action" disabled={busy} onClick={() => onDuplicate(campaign.id)}>
            Duplicate
          </button>
          <button
            type="button"
            className="cmp-action cmp-action--danger"
            disabled={busy}
            onClick={() => setConfirming(true)}
          >
            Delete
          </button>
        </div>
      )}
    </article>
  );
}
