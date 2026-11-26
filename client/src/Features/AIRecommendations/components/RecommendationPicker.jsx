import { useId, useRef } from "react";
import { Check, ChevronDown } from "lucide-react";

export default function RecommendationPicker({ label, options, value, onChange, disabled }) {
  const labelId = useId();
  const detailsRef = useRef(null);
  const triggerRef = useRef(null);
  const selected = options.find((option) => option.value === value);

  function close(restoreFocus = false) {
    if (detailsRef.current) detailsRef.current.open = false;
    if (restoreFocus) triggerRef.current?.focus();
  }

  return (
    <div className="air-picker">
      <span id={labelId} className="air-picker__label">{label}</span>
      <details
        className="air-picker__control"
        ref={detailsRef}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) close();
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape" && detailsRef.current.open) {
            event.preventDefault();
            close(true);
          }
        }}
      >
        <summary
          ref={triggerRef}
          aria-describedby={labelId}
          aria-disabled={disabled || undefined}
          onClick={(event) => { if (disabled) event.preventDefault(); }}
        >
          <span>{selected?.label || "Choose an option"}</span>
          <ChevronDown size={16} aria-hidden="true" />
        </summary>
        <ul className="air-picker__options" aria-labelledby={labelId}>
          {options.map((option) => (
            <li key={option.value}>
              <button
                type="button"
                disabled={disabled}
                aria-current={value === option.value ? "true" : undefined}
                onClick={() => {
                  onChange(option.value);
                  close(true);
                }}
              >
                <span>{option.label}</span>
                {value === option.value && <Check size={16} aria-hidden="true" />}
              </button>
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
