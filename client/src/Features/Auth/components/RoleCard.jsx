import { ChevronRight } from "lucide-react";

export default function RoleCard({ icon: Icon, title, description, onSelect }) {
  return (
    <button type="button" className="role-card" onClick={onSelect}>
      <span className="role-card__icon">
        <Icon size={22} />
      </span>
      <span className="role-card__text">
        <strong>{title}</strong>
        <small>{description}</small>
      </span>
      <ChevronRight className="role-card__chevron" size={20} />
    </button>
  );
}
