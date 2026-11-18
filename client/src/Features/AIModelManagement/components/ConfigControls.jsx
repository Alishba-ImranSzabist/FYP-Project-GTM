import { useId } from "react";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";

export function SelectField({ label, value, onChange, options, hint, error, disabled = false }) {
  const id = useId();

  return (
    <div className={`aimm-field ${error ? "aimm-field--error" : ""}`}>
      <label htmlFor={id}>{label}</label>
      <select
        id={id}
        className="aimm-select"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        disabled={disabled}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      {error ? <small className="aimm-field__error">{error}</small> : null}
      {!error && hint ? <small className="aimm-field__hint">{hint}</small> : null}
    </div>
  );
}

export function ToggleField({ label, description, checked, onChange, disabled = false }) {
  return (
    <label className={`aimm-toggle ${disabled ? "is-disabled" : ""}`}>
      <span className="aimm-toggle__copy">
        <strong>{label}</strong>
        {description ? <small>{description}</small> : null}
      </span>
      <input
        type="checkbox"
        checked={Boolean(checked)}
        onChange={(event) => onChange?.(event.target.checked)}
        disabled={disabled}
      />
      <span className="aimm-toggle__track" aria-hidden="true">
        <span />
      </span>
    </label>
  );
}

export function FeedbackMessage({ type = "info", children }) {
  const Icon = type === "success" ? CheckCircle2 : type === "error" ? AlertCircle : Info;

  return (
    <div className={`aimm-feedback aimm-feedback--${type}`} role={type === "error" ? "alert" : "status"}>
      <Icon size={17} aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}

export function ConfigPanel({ title, description, children, actions }) {
  return (
    <section className="pnl-card aimm-panel">
      {(title || description || actions) ? (
        <div className="aimm-panel__head">
          <div>
            {title ? <h2>{title}</h2> : null}
            {description ? <p>{description}</p> : null}
          </div>
          {actions ? <div className="aimm-panel__actions">{actions}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}
