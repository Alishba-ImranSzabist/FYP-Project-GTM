import { useId } from "react";

/** Labelled dropdown that looks like FormField. `options` = [{ value, label }]. */
export default function SelectField({ label, name, value, onChange, options, placeholder = "Select…", error, hint, disabled }) {
  const id = useId();
  return (
    <div className={`field ${error ? "field--error" : ""}`}>
      <label htmlFor={id} className="field__label">
        {label}
      </label>
      <div className="field__control">
        <select
          id={id}
          name={name}
          className="field__input svc-select"
          value={value}
          onChange={onChange}
          disabled={disabled}
          aria-invalid={Boolean(error)}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {(error || hint) && <p className={error ? "field__error" : "field__hint"}>{error || hint}</p>}
    </div>
  );
}
