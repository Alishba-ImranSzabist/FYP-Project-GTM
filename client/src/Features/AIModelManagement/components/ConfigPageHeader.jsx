import { ArrowLeft } from "lucide-react";
import Button from "../../../Shared_Components/Button";
import { ROUTES } from "../../../constants/routes";

export default function ConfigPageHeader({ title, description, eyebrow = "AI MODEL MANAGEMENT" }) {
  return (
    <div className="aimm-page-heading">
      <Button
        variant="ghost"
        size="sm"
        icon={ArrowLeft}
        to={ROUTES.aiModelManagement}
        className="aimm-back-link"
      >
        AI Model Management
      </Button>

      <div className="pnl__head aimm-heading">
        <div className="pnl__head-text">
          <span className="pnl__eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
      </div>
    </div>
  );
}
