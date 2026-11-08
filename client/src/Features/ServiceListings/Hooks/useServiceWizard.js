import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../constants/routes";
import { profileService } from "../../Panel/Services/profile.service";
import { STEPS } from "../serviceListingConfig";
import {
  EMPTY_VALUES,
  firstStepWithError,
  fromService,
  normalizeErrors,
  toPayload,
  validateActivate,
  validateDraft,
  validateStep,
} from "../serviceListingForm";
import { serviceListingService } from "../Services/serviceListing.service";

const LAST_STEP = STEPS.length - 1;

/**
 * Everything the create / edit wizard needs: form values, errors, which step we are on,
 * loading an existing service, and saving (draft or "find AI matches").
 *
 * serviceId = undefined -> create a new service;  serviceId = "<id>" -> edit that service.
 */
export default function useServiceWizard(serviceId) {
  const navigate = useNavigate();
  const isEdit = Boolean(serviceId);

  const [stepIndex, setStepIndex] = useState(0);
  const [values, setValues] = useState(EMPTY_VALUES);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedStatus, setSavedStatus] = useState("draft"); // status the service had when we opened it

  /* ---------- load: existing service (edit) or provider profile (create) ---------- */
  useEffect(() => {
    let active = true;

    async function init() {
      try {
        if (isEdit) {
          const data = await serviceListingService.get(serviceId);
          if (!active) return;
          setValues(fromService(data.service));
          setSavedStatus(data.service.status);
        } else {
          // The profile is only used to pre-fill the portfolio link; the wizard works without it.
          const profileData = await profileService.getRoleProfile().catch(() => null);
          if (!active) return;
          setValues(fromService(null, { portfolioLink: profileData?.profile?.portfolio?.[0] || "" }));
        }
      } catch (err) {
        if (active) setLoadError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    init();
    return () => {
      active = false;
    };
  }, [serviceId, isEdit]);

  /* ---------- field changes ---------- */
  const setValue = (name, value) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => (current[name] ? { ...current, [name]: undefined } : current));
    setFormError("");
  };

  const handleChange = (event) => setValue(event.target.name, event.target.value);

  /* ---------- moving between steps ---------- */
  const goNext = () => {
    const found = validateStep(STEPS[stepIndex].id, values);
    if (Object.keys(found).length) {
      setErrors(found);
      return;
    }
    setErrors({});
    setStepIndex((index) => Math.min(index + 1, LAST_STEP));
  };

  const goBack = () => setStepIndex((index) => Math.max(index - 1, 0));
  const goTo = (index) => setStepIndex(index);

  /* ---------- saving ---------- */
  /** Show errors and jump to the earliest step that has one. */
  const showErrors = (found, message) => {
    setErrors(found);
    setFormError(message);
    const stepWithError = firstStepWithError(found);
    if (stepWithError !== null) setStepIndex(stepWithError);
  };

  /** status: "draft" (lenient) or "active" (everything required, AI matching starts). */
  const save = async (status) => {
    const found = status === "active" ? validateActivate(values) : validateDraft(values);
    if (Object.keys(found).length) {
      showErrors(found, "Please fix the highlighted fields.");
      return;
    }

    setSaving(true);
    setFormError("");
    try {
      const payload = toPayload(values, status);
      if (isEdit) await serviceListingService.update(serviceId, payload);
      else await serviceListingService.create(payload);

      const notice = status === "active" ? "Service saved. The AI is finding matches." : "Draft saved.";
      navigate(ROUTES.services, { state: { notice } });
    } catch (err) {
      const serverErrors = normalizeErrors(err.fieldErrors);
      if (Object.keys(serverErrors).length) showErrors(serverErrors, err.message);
      else setFormError(err.message || "Something went wrong.");
      setSaving(false);
    }
  };

  // A service that is already active / paused should not be turned back into a draft by accident.
  const editingMatched = isEdit && savedStatus !== "draft";

  return {
    step: STEPS[stepIndex],
    stepIndex,
    isLastStep: stepIndex === LAST_STEP,
    values,
    errors,
    formError,
    loading,
    loadError,
    saving,
    isEdit,
    canSaveDraft: !editingMatched,
    finishLabel: !editingMatched ? "Save" : savedStatus === "paused" ? "Save" : "Save changes",
    setValue,
    handleChange,
    goNext,
    goBack,
    goTo,
    save,
  };
}
