/** "1 Campaign details — 2 Audience & market — …" Finished steps can be clicked to go back. */
export default function WizardSteps({ steps, current, onSelect }) {
  return (
    <ol className="cmp-steps" aria-label="Campaign setup progress">
      {steps.map((step, index) => {
        const state = index === current ? "is-current" : index < current ? "is-done" : "";
        return (
          <li key={step.id} className={`cmp-steps__item ${state}`}>
            <button
              type="button"
              className="cmp-steps__btn"
              disabled={index >= current}
              aria-current={index === current ? "step" : undefined}
              onClick={() => onSelect(index)}
            >
              <span className="cmp-steps__num">{index + 1}</span>
              <span className="cmp-steps__label">{step.label}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
