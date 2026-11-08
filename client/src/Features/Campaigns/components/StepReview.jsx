import {
  AUDIENCE_OPTIONS,
  CHANNEL_OPTIONS,
  OBJECTIVE_OPTIONS,
  labelOf,
} from "../campaignConfig";
import { formatBudget, formatDateRange } from "../campaignFormat";

/** Step 4 — read-only summary. Each section has an Edit link that jumps back to its step. */
export default function StepReview({ values, goTo }) {
  // To show another row, add { label, value } to a section. Empty values show "Not set".
  const sections = [
    {
      title: "Basics",
      step: 0,
      rows: [
        { label: "Name", value: values.name },
        { label: "Objective", value: labelOf(OBJECTIVE_OPTIONS, values.objective) },
        { label: "Product", value: values.productName },
      ],
    },
    {
      title: "Audience & market",
      step: 1,
      rows: [
        { label: "Market", value: values.targetLocations.join(", ") },
        { label: "Sells to", value: labelOf(AUDIENCE_OPTIONS, values.audienceType) },
        { label: "Keywords", value: values.keywords.join(", ") },
      ],
    },
    {
      title: "Budget & timing",
      step: 2,
      rows: [
        { label: "Budget", value: formatBudget(values) },
        { label: "Dates", value: formatDateRange(values.startDate, values.endDate) },
        {
          label: "Channels",
          value: values.channels.map((c) => labelOf(CHANNEL_OPTIONS, c)).join(", "),
        },
      ],
    },
  ];

  return (
    <div className="cmp-review">
      {sections.map((section) => (
        <section key={section.title} className="cmp-review__section">
          <header className="cmp-review__head">
            <h3>{section.title}</h3>
            <button type="button" className="prof__link" onClick={() => goTo(section.step)}>
              Edit
            </button>
          </header>
          <dl>
            {section.rows.map((row) => (
              <div key={row.label} className="cmp-review__row">
                <dt>{row.label}</dt>
                <dd>{row.value || <span className="prof__empty-text">Not set</span>}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}
