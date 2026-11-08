import { useId } from "react";

/**
 * Pick from a fixed list of options shown as pills.
 *  multiple=false -> choose one (value is a string);  multiple=true -> choose many (value is an array).
 */
export default function ChipSelect({ label, options, value, onChange, multiple = false, error, hint, disabled }) {
  const labelId = useId();
  const isSelected = (optionValue) => (multiple ? value.includes(optionValue) : value === optionValue);

  const toggle = (optionValue) => {
    if (!multiple) return onChange(optionValue);
    return onChange(
      value.includes(optionValue) ? value.filter((v) => v !== optionValue) : [...value, optionValue]
    );
  };

  return (
    <div className={`field ${error ? "field--error" : ""}`} role="group" aria-labelledby={labelId}>
      <span id={labelId} className="field__label">
        {label}
      </span>
      <div className="cmp-pills">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`cmp-pill ${isSelected(option.value) ? "is-selected" : ""}`}
            aria-pressed={isSelected(option.value)}
            disabled={disabled}
            onClick={() => toggle(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
      {(error || hint) && <p className={error ? "field__error" : "field__hint"}>{error || hint}</p>}
    </div>
  );
}
