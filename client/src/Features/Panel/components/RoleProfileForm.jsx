import { useId, useState } from "react";
import { Plus, X } from "lucide-react";
import FormField from "../../../Shared_Components/FormField";
import { PROFILE_LIMITS } from "../roleProfile";

/** Yes/No style switch backed by a checkbox (accessible + keyboard friendly). */
function ToggleField({ field, form }) {
  const id = useId();
  const error = form.errors[field.name];
  return (
    <div className={`rpf__cell ${field.full ? "rpf__cell--full" : ""}`}>
      <div className={`toggle ${error ? "field--error" : ""}`}>
        <label className="toggle__label" htmlFor={id}>
          <input
            id={id}
            className="toggle__input"
            type="checkbox"
            name={field.name}
            checked={Boolean(form.values[field.name])}
            onChange={form.handleChange}
            aria-describedby={field.hint || error ? `${id}-msg` : undefined}
          />
          <span className="toggle__track" aria-hidden="true">
            <span className="toggle__thumb" />
          </span>
          <span className="toggle__text">
            <strong>{field.label}</strong>
            {(field.hint || error) && (
              <small id={`${id}-msg`} className={error ? "field__error" : "field__hint"}>
                {error || field.hint}
              </small>
            )}
          </span>
        </label>
      </div>
    </div>
  );
}

/** Skills as removable chips: type + Enter (or Add) to include a skill. */
function ChipsField({ field, form }) {
  const inputId = useId();
  const [draft, setDraft] = useState("");
  const [draftError, setDraftError] = useState("");
  const skills = form.values[field.name] || [];
  const error = form.errors[field.name];

  const add = () => {
    const skill = draft.trim();
    if (!skill) return;
    if (skill.length > PROFILE_LIMITS.skill) {
      setDraftError(`A skill cannot exceed ${PROFILE_LIMITS.skill} characters.`);
      return;
    }
    if (skills.some((s) => s.toLowerCase() === skill.toLowerCase())) {
      setDraftError("That skill is already on your list.");
      return;
    }
    if (skills.length >= PROFILE_LIMITS.skills) {
      setDraftError(`You can add up to ${PROFILE_LIMITS.skills} skills.`);
      return;
    }
    setDraftError("");
    setDraft("");
    form.setValue(field.name, [...skills, skill]);
  };

  const message = draftError || error || field.hint;

  return (
    <div className={`rpf__cell rpf__cell--full ${error ? "field--error" : ""}`}>
      <div className="field">
        <label htmlFor={inputId} className="field__label">
          {field.label}
          {field.required && <span aria-hidden="true"> *</span>}
        </label>
        <div className="chips__entry">
          <input
            id={inputId}
            type="text"
            className="field__input"
            placeholder={field.placeholder}
            value={draft}
            maxLength={PROFILE_LIMITS.skill}
            onChange={(e) => {
              setDraft(e.target.value);
              setDraftError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add();
              }
            }}
            aria-invalid={Boolean(error || draftError)}
            aria-describedby={message ? `${inputId}-msg` : undefined}
          />
          <button
            type="button"
            className="btn btn--primary btn--sm chips__add"
            onClick={add}
            disabled={!draft.trim() || form.submitting}
          >
            <Plus size={16} aria-hidden="true" />
            <span>Add</span>
          </button>
        </div>
        {skills.length > 0 && (
          <ul className="chips" aria-label="Your skills">
            {skills.map((skill) => (
              <li key={skill} className="chip">
                <span>{skill}</span>
                <button
                  type="button"
                  className="chip__x"
                  onClick={() => form.setValue(field.name, skills.filter((s) => s !== skill))}
                  aria-label={`Remove ${skill}`}
                  disabled={form.submitting}
                >
                  <X size={13} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
        <p id={`${inputId}-msg`} className={error || draftError ? "field__error" : "field__hint"}>
          {message}
        </p>
      </div>
    </div>
  );
}

/** Portfolio URLs as a dynamic list with add / remove rows. */
function UrlsField({ field, form }) {
  const links = form.values[field.name] || [];
  const error = form.errors[field.name];
  const setLinks = (next) => form.setValue(field.name, next);

  return (
    <div className={`rpf__cell rpf__cell--full ${error ? "field--error" : ""}`}>
      <div className="field">
        <span className="field__label">{field.label}</span>
        {links.length > 0 && (
          <ul className="urls">
            {links.map((link, i) => (
              <li key={i} className="urls__row">
                <input
                  type="text"
                  inputMode="url"
                  className="field__input"
                  value={link}
                  placeholder={field.placeholder}
                  aria-label={`Portfolio link ${i + 1}`}
                  maxLength={PROFILE_LIMITS.portfolioLink}
                  disabled={form.submitting}
                  onChange={(e) => setLinks(links.map((l, j) => (j === i ? e.target.value : l)))}
                />
                <button
                  type="button"
                  className="urls__x"
                  onClick={() => setLinks(links.filter((_, j) => j !== i))}
                  aria-label={`Remove link ${i + 1}`}
                  disabled={form.submitting}
                >
                  <X size={16} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
        {links.length < PROFILE_LIMITS.portfolio && (
          <button
            type="button"
            className="prof__link chips__add-row"
            onClick={() => setLinks([...links, ""])}
            disabled={form.submitting}
          >
            <Plus size={14} aria-hidden="true" /> Add another link
          </button>
        )}
        <p className={error ? "field__error" : "field__hint"}>{error || field.hint}</p>
      </div>
    </div>
  );
}

/** Renders every section/field defined in Features/Panel/roleProfile.js. */
export default function RoleProfileForm({ config, form }) {
  const renderField = (field) => {
    if (field.type === "toggle") return <ToggleField key={field.name} field={field} form={form} />;
    if (field.type === "chips") return <ChipsField key={field.name} field={field} form={form} />;
    if (field.type === "urls") return <UrlsField key={field.name} field={field} form={form} />;

    return (
      <div key={field.name} className={`rpf__cell ${field.full ? "rpf__cell--full" : ""}`}>
        <FormField
          label={field.label}
          name={field.name}
          multiline={field.type === "textarea"}
          rows={field.rows}
          icon={field.icon}
          placeholder={field.placeholder}
          autoComplete={field.autoComplete}
          maxLength={field.maxLength}
          value={form.values[field.name]}
          onChange={form.handleChange}
          error={form.errors[field.name]}
          hint={field.hint}
          disabled={form.submitting}
        />
      </div>
    );
  };

  return (
    <div className="rpf">
      {config.sections.map((section) => (
        <fieldset className="rpf__section" key={section.id} disabled={form.submitting}>
          <legend className="rpf__legend">{section.title}</legend>
          {section.hint && <p className="rpf__hint">{section.hint}</p>}
          <div className="rpf__grid">{section.fields.map(renderField)}</div>
        </fieldset>
      ))}
    </div>
  );
}

