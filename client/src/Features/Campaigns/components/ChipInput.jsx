import { useId, useState } from "react";
import { X } from "lucide-react";

/**
 * Free-text list shown as removable chips (locations, keywords).
 * Type and press Enter or comma (or click away) to add. `values` is an array of strings.
 */
export default function ChipInput({
  label,
  values,
  onChange,
  placeholder,
  max,
  maxLength,
  error,
  hint,
  disabled,
}) {
  const inputId = useId();
  const [draft, setDraft] = useState("");
  const [draftError, setDraftError] = useState("");

  const add = () => {
    const item = draft.trim().replace(/,+$/, "").trim();
    if (!item) {
      setDraft("");
      return;
    }
    if (item.length > maxLength) return setDraftError(`Keep it under ${maxLength} characters.`);
    if (values.some((v) => v.toLowerCase() === item.toLowerCase())) return setDraftError("Already added.");
    if (values.length >= max) return setDraftError(`You can add up to ${max}.`);

    setDraftError("");
    setDraft("");
    return onChange([...values, item]);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault(); // Enter must not submit the wizard form
      add();
    }
  };

  const message = draftError || error || hint;
  const hasError = Boolean(draftError || error);

  return (
    <div className={`field ${hasError ? "field--error" : ""}`}>
      <label htmlFor={inputId} className="field__label">
        {label}
      </label>
      <div className="cmp-chipbox">
        {values.map((item) => (
          <span key={item} className="chip">
            <span>{item}</span>
            <button
              type="button"
              className="chip__x"
              aria-label={`Remove ${item}`}
              disabled={disabled}
              onClick={() => onChange(values.filter((v) => v !== item))}
            >
              <X size={13} aria-hidden="true" />
            </button>
          </span>
        ))}
        <input
          id={inputId}
          type="text"
          className="cmp-chipbox__input"
          placeholder={placeholder}
          value={draft}
          maxLength={maxLength + 1} // lets us show the "too long" message instead of silently cutting
          disabled={disabled}
          aria-invalid={hasError}
          aria-describedby={message ? `${inputId}-msg` : undefined}
          onChange={(event) => {
            setDraft(event.target.value);
            setDraftError("");
          }}
          onKeyDown={handleKeyDown}
          onBlur={add}
        />
      </div>
      {message && (
        <p id={`${inputId}-msg`} className={hasError ? "field__error" : "field__hint"}>
          {message}
        </p>
      )}
    </div>
  );
}
