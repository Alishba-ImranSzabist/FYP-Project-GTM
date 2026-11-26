import { CalendarDays, Edit3, MapPin, Wallet } from "lucide-react";
import RecommendationPicker from "./RecommendationPicker";
import Button from "../../../Shared_Components/Button";
import { ROUTES } from "../../../constants/routes";
import { labelOf, OBJECTIVE_OPTIONS } from "../../Campaigns/campaignConfig";
import { formatBudget, formatDateRange } from "../../Campaigns/campaignFormat";

const statusLabel = (status) => {
  if (status === "active") return "Active";
  if (status === "completed") return "Completed";
  return "Draft";
};

export default function CampaignSelector({ campaigns, campaign, onChange }) {
  if (!campaign) return null;

  const locationText = campaign.targetLocations?.length
    ? campaign.targetLocations.join(" · ")
    : "No target location added";
  const budgetText = formatBudget(campaign) || "No budget set — AI can suggest a range";
  const dateText = formatDateRange(campaign.startDate, campaign.endDate) || "Dates not selected";
  const editPath = ROUTES.campaignEdit.replace(":id", campaign.id);

  return (
    <section className="pnl-card air-campaign-card" aria-labelledby="air-campaign-title">
      <div className="air-campaign-card__top">
        <div>
          <span className="air-kicker">CAMPAIGN TO ANALYZE</span>
          <h2 id="air-campaign-title">Choose a campaign</h2>
        </div>
        {campaign.status === "completed" ? (
          <Button variant="ghost" size="sm" to={ROUTES.campaigns}>
            Manage campaigns
          </Button>
        ) : (
          <Button variant="ghost" size="sm" icon={Edit3} to={editPath}>
            Edit campaign
          </Button>
        )}
      </div>

      <RecommendationPicker
        label="Your campaigns"
        value={campaign.id}
        onChange={onChange}
        options={campaigns.map((item) => ({
          value: item.id,
          label: `${item.name} \u00b7 ${statusLabel(item.status)}`,
        }))}
      />

      <div className="air-campaign-summary">
        <div className="air-campaign-summary__main">
          <div className="air-campaign-summary__title-row">
            <h3>{campaign.name}</h3>
            <span className={`air-status air-status--${campaign.status || "draft"}`}>
              {statusLabel(campaign.status)}
            </span>
          </div>
          <p>{campaign.productName || "Product or offer not added"}</p>
          <div className="air-campaign-tags">
            {labelOf(OBJECTIVE_OPTIONS, campaign.objective) && (
              <span>{labelOf(OBJECTIVE_OPTIONS, campaign.objective)}</span>
            )}
            {campaign.audienceType && <span>{campaign.audienceType.toUpperCase()}</span>}
          </div>
        </div>

        <div className="air-campaign-meta">
          <span><MapPin size={14} /> {locationText}</span>
          <span><Wallet size={14} /> {budgetText}</span>
          <span><CalendarDays size={14} /> {dateText}</span>
        </div>
      </div>
    </section>
  );
}
