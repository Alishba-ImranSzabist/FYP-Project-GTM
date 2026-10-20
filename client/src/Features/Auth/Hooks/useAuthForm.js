import { useState } from "react";

/**
 * Tiny form helper: values, per-field errors, a server error and a submitting flag.
 * `validate(values)` must return an object of { field: "message" } (empty = valid).
 * `onSubmit(values)` may throw an ApiError, its message / fieldErrors are shown in the form.
 */
export default function useAuthForm({ initialValues, validate, onSubmit }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const setValue = (name, value) => {
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((e) => (e[name] ? { ...e, [name]: undefined } : e));
    setFormError("");
  };

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setValue(name, type === "checkbox" ? checked : value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validate ? validate(values) : {};
    if (Object.keys(found).length) {
      setErrors(found);
      return;
    }
    setSubmitting(true);
    setFormError("");
    try {
      await onSubmit(values);
    } catch (err) {
      if (err.fieldErrors && Object.keys(err.fieldErrors).length) setErrors(err.fieldErrors);
      setFormError(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return { values, errors, formError, submitting, setValue, handleChange, handleSubmit };
}
