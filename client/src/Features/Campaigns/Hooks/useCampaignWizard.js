import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../constants/routes";
import { profileService } from "../../Panel/Services/profile.service";
import { STEPS } from "../campaignConfig";
import { EMPTY_VALUES,firstStepWithError,fromCampaign,normalizeErrors,toPayload,validateDraft,validateLaunch,validateStep,} from "../campaignForm";
import { campaignService } from "../Services/campaign.service";

const LAST_STEP = STEPS.length - 1;

/**
 * Everything the create / edit wizard needs: form values, errors, which step we are on,
 * loading an existing campaign, and saving (draft or launch).
 *
 * campaignId = undefined -> create a new campaign;  campaignId = "<id>" -> edit that campaign.
 */
export default function useCampaignWizard(campaignId) {
  const navigate = useNavigate();
  const isEdit = Boolean(campaignId);

  const [stepIndex, setStepIndex] = useState(0);
  const [values, setValues] = useState(EMPTY_VALUES);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedStatus, setSavedStatus] = useState("draft"); // status the campaign had when we opened it

  /* ---------- load: existing campaign (edit) or business profile (create) ---------- */
  useEffect(() => {
    let active = true;

    async function init() {
      try {
        if (isEdit) {
          const { campaign } = await campaignService.get(campaignId);
          if (!active) return;
          if (campaign.status === "completed") {
            setLoadError("A completed campaign can no longer be edited. Duplicate it from the list instead.");
          } else {
            setValues(fromCampaign(campaign));
            setSavedStatus(campaign.status);
          }
        } else {
          // Only used to pre-fill "Industry"; the wizard works fine without it.
          const data = await profileService.getRoleProfile().catch(() => null);
          if (active) setValues(fromCampaign(null, data?.profile));
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
  }, [campaignId, isEdit]);

  /* ---------- field changes ---------- */
  const setValue = (name, value) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => (current[name] ? { ...current, [name]: undefined } : current));
    setFormError("");
  };

  const handleChange = (event) => {
    const { name, type, checked, value } = event.target;
    setValue(name, type === "checkbox" ? checked : value);
  };

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

  /** status: "draft" (lenient) or "active" (everything required). */
  const save = async (status) => {
    const found = status === "active" ? validateLaunch(values) : validateDraft(values);
    if (Object.keys(found).length) {
      showErrors(found, "Please fix the highlighted fields.");
      return;
    }

    setSaving(true);
    setFormError("");
    try {
      const payload = toPayload(values, status);
      if (isEdit) await campaignService.update(campaignId, payload);
      else await campaignService.create(payload);

      const notice = status === "active" ? "Campaign saved and ready." : "Draft saved.";
      navigate(ROUTES.campaigns, { state: { notice } });
    } catch (err) {
      const serverErrors = normalizeErrors(err.fieldErrors);
      if (Object.keys(serverErrors).length) showErrors(serverErrors, err.message);
      else setFormError(err.message || "Something went wrong.");
      setSaving(false);
    }
  };

  /* A campaign that is already active should not be turned back into a draft by accident. */
  const editingActive = isEdit && savedStatus === "active";

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
    canSaveDraft: !editingActive,
    finishLabel: editingActive ? "Save changes" : "Launch campaign",
    setValue,
    handleChange,
    goNext,
    goBack,
    goTo,
    save,
  };
}
