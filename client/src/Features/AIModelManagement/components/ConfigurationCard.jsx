import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function ConfigurationCard({ option, to }) {
  const Icon = option.icon;

  return (
    <Link className="aimm-option-card" to={to}>
      <div className="aimm-option-card__top">
        <span className="aimm-option-card__icon">
          <Icon size={21} aria-hidden="true" />
        </span>
        <span className="aimm-option-card__number">{option.number}</span>
      </div>

      <div className="aimm-option-card__body">
        <h2>{option.title}</h2>
        <p>{option.description}</p>
      </div>

      <div className="aimm-option-card__footer">
        <span>{option.detail}</span>
        <span className="aimm-option-card__action">
          View <ArrowRight size={16} aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}
