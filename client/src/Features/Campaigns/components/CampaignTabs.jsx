import { FILTER_TABS } from "../campaignConfig";

/** All / Draft / Active / Completed filter pills with their counts. */
export default function CampaignTabs({ active, counts, onChange }) {
  return (
    <div className="cmp-tabs" role="tablist" aria-label="Filter campaigns">
      {FILTER_TABS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          role="tab"
          aria-selected={active === tab.key}
          className={`cmp-tab ${active === tab.key ? "is-active" : ""}`}
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
          <em>{counts[tab.key] ?? 0}</em>
        </button>
      ))}
    </div>
  );
}
