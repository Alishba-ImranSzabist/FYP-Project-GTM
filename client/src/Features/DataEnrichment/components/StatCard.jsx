import { } from "react";

/** Compact KPI card used by the collection progress screen. */
export default function StatCard({ icon: Icon, label, value, note, tone = "teal" }) {
  return (
    <div className="de-stat">
      <span className={`de-stat__icon de-stat__icon--${tone}`}><Icon size={18} /></span>
      <div>
        <span className="de-stat__label">{label}</span>
        <strong>{value}</strong>
        <small>{note}</small>
      </div>
    </div>
  );
}
