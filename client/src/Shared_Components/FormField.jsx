import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import "./FormField.css";

/** Labelled input with inline error + password show/hide. */
export default function FormField({ label, error, hint, type = "text", icon: Icon, ...inputProps }) {
  const id = useId();
  const [show, setShow] = useState(false);
  const isPassword = type === "password";

  return (
    <div className={`field ${error ? "field--error" : ""}`}>
      <label htmlFor={id} className="field__label">
        {label}
      </label>
      <div className="field__control">
        {Icon && <Icon className="field__icon" size={18} aria-hidden="true" />}
        <input
          id={id}
          type={isPassword && show ? "text" : type}
          className={`field__input ${Icon ? "has-icon" : ""}`}
          aria-invalid={Boolean(error)}
          aria-describedby={error || hint ? `${id}-msg` : undefined}
          {...inputProps}
        />
        {isPassword && (
          <button
            type="button"
            className="field__toggle"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {(error || hint) && (
        <p id={`${id}-msg`} className={error ? "field__error" : "field__hint"}>
          {error || hint}
        </p>
      )}
    </div>
  );
}
