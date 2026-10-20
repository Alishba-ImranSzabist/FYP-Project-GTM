import { useId } from "react";

/**
 * Single-box 6-digit code input (auto-strips non-digits, pastes safely).
 * Same .field markup as FormField so it inherits the existing styles.
 */
export default function OtpInput({ label = "Verification code", value, onChange, error, hint, autoFocus = false }) {
  const id = useId();

  return (
    <div className={`field ${error ? "field--error" : ""}`}>
      <label htmlFor={id} className="field__label">
        {label}
      </label>
      <div className="field__control">
        <input
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="000000"
          autoFocus={autoFocus}
          className="field__input field__input--otp"
          aria-invalid={Boolean(error)}
          aria-describedby={error || hint ? `${id}-msg` : undefined}
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
        />
      </div>
      {(error || hint) && (
        <p id={`${id}-msg`} className={error ? "field__error" : "field__hint"}>
          {error || hint}
        </p>
      )}
    </div>
  );
}