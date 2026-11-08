import {
  AVAILABILITY_OPTIONS,
  CATEGORY_OPTIONS,
  EXPERIENCE_OPTIONS,
  labelOf,
} from "../serviceListingConfig";

/** Step 3 — read-only summary. Each section has an Edit link that jumps back to its step. */
export default function StepReview({ form }) {
  const { values, goTo } = form;

  const category =
    values.category === "other" ? values.customCategory : labelOf(CATEGORY_OPTIONS, values.category);

  // To show another row, add { label, value } to a section. Empty values show "Not set".
  const sections = [
    {
      title: "What you offer",
      step: 0,
      rows: [
        { label: "Service", value: values.name },
        { label: "Category", value: category },
        { label: "Keywords", value: values.keywords.join(", ") },
        { label: "Target market", value: values.targetMarket.join(", ") },
      ],
    },
    {
      title: "Details & terms",
      step: 1,
      rows: [
        { label: "Experience", value: labelOf(EXPERIENCE_OPTIONS, values.experience) },
        { label: "Availability", value: labelOf(AVAILABILITY_OPTIONS, values.availability) },
        { label: "Location", value: values.locations.join(", ") },
        { label: "Languages", value: values.languages },
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
