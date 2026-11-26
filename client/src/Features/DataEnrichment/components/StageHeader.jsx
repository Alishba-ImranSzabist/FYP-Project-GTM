import { Check } from "lucide-react";

const STAGES = ["Set up", "Live progress", "Enriched leads"];

/** Three-step navigation for the data collection workflow. */
export default function StageHeader({ step, onStep }) {
  return (
    <div className="de-steps">
      {STAGES.map((name, index) => (
        <button
          key={name}
          type="button"
          className={`de-step ${step === index ? "is-active" : ""} ${step > index ? "is-done" : ""}`}
          onClick={() => onStep(index)}
        >
          <span>{step > index ? <Check size={13} /> : index + 1}</span>
          {name}
        </button>
      ))}
    </div>
  );
}
