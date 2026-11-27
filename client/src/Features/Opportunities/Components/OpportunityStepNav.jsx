import { Check } from "lucide-react";

const STEPS = [
  ["model", "AI setup"],
  ["scanning", "Discover"],
  ["results", "Opportunities"],
  ["contact", "Find contact"],
];

export default function OpportunityStepNav({ stage }) {
  const activeIndex = STEPS.findIndex(([key]) => key === stage);
  return (
    <nav className="opp-steps" aria-label="Discovery steps">
      {STEPS.map(([key, label], index) => (
        <div key={key} className={`opp-step ${index <= activeIndex ? "is-active" : ""} ${key === stage ? "is-current" : ""}`}>
          <span>{index < activeIndex ? <Check size={14} /> : index + 1}</span>
          <strong>{label}</strong>
          {index < STEPS.length - 1 && <i />}
        </div>
      ))}
    </nav>
  );
}
