import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../constants/routes";
import { profileService } from "../../Panel/Services/profile.service";
import useAuth from "../../Auth/Hooks/useAuth";
import { STEPS } from "../campaignConfig";
import {
  EMPTY_VALUES,
  firstStepWithError,
  fromCampaign,
  normalizeErrors,
  toPayload,
  validateBudgetAndDates,
  validateDraft,
  validateLaunch,
  validateStep,
} from "../campaignForm";
import { campaignService } from "../Services/campaign.service";

const LAST_STEP = STEPS.length - 1;
const AUTOSAVE_DELAY_MS = 1000;
const snapshotOf = (values, stepIndex) => JSON.stringify({ values, stepIndex });

// Local copy is a safety net if the internet fails before MongoDB can save.
function readCache(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "null");
    if (!value?.values) return null;
    // Previous campaign patch cached values without savedAt. Recover those too.
    return Number.isFinite(value.savedAt)
      ? value
      : { ...value, savedAt: 0, legacy: true };
  } catch { return null; }
}
function writeCache(key, data) {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch { /* private browsing / storage disabled */ }
}
function clearCache(key) {
  try { localStorage.removeItem(key); } catch { /* storage disabled */ }
}
function clampStep(step) {
  return Math.min(LAST_STEP, Math.max(0, Number.isInteger(step) ? step : 0));
}

/**
 * Campaign wizard: incomplete draft autosave + restore, without an extra banner.
 * The server is the durable copy; newer unsynced edits remain in localStorage.
 * Requests are serialized to prevent duplicate POSTs or out-of-order PATCHes.
 */
export default function useCampaignWizard(campaignId) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const ownerId = user?.id || user?._id || user?.email || "anonymous";
  const key = `gtm:campaign:unfinished:${ownerId}:${campaignId || "new"}`;
  const newKey = `gtm:campaign:unfinished:${ownerId}:new`;
  const isEdit = Boolean(campaignId);

  const [stepIndex, setStepIndex] = useState(0);
  const [values, setValues] = useState(EMPTY_VALUES);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedStatus, setSavedStatus] = useState("draft");

  const initialized = useRef(false);
  const dirty = useRef(false);
  const serverId = useRef(campaignId || null);
  const saveQueue = useRef(Promise.resolve());
  const lastSynced = useRef("");
  const autosaveTimer = useRef(null);
  const finalizing = useRef(false);
  const valuesRef = useRef(values);
  const stepRef = useRef(stepIndex);
  const statusRef = useRef(savedStatus);
  const liveSnapshot = useRef(snapshotOf(values, stepIndex));
  valuesRef.current = values;
  stepRef.current = stepIndex;
  statusRef.current = savedStatus;

  useEffect(() => {
    let alive = true;
    initialized.current = false;
    dirty.current = false;
    finalizing.current = false;
    serverId.current = campaignId || null;
    lastSynced.current = "";
    clearTimeout(autosaveTimer.current);
    setLoading(true);
    setLoadError("");

    async function load() {
      try {
        const cached = readCache(key);
        if (isEdit) {
          const { campaign } = await campaignService.get(campaignId);
          if (!alive) return;
          if (campaign.status === "completed") {
            setLoadError("A completed campaign cannot be edited. Duplicate it instead.");
            return;
          }
          const serverValues = fromCampaign(campaign);
          const serverStep = clampStep(campaign.wizardStep ?? 0);
          lastSynced.current = snapshotOf(serverValues, serverStep);
          // An autosaved /new form may still have unsynced browser changes.
          const newCache = campaign.status === "draft" ? readCache(newKey) : null;
          const relevant = [cached, newCache?.serverId === campaignId ? newCache : null]
            .filter(Boolean).sort((a, b) => b.savedAt - a.savedAt)[0];
          const newer = relevant && (relevant.legacy || relevant.savedAt > new Date(campaign.updatedAt || 0).getTime());
          const chosenValues = newer ? relevant.values : serverValues;
          const chosenStep = clampStep(newer ? relevant.stepIndex : serverStep);
          setValues(chosenValues);
          setStepIndex(chosenStep);
          setSavedStatus(campaign.status);
          statusRef.current = campaign.status;
          dirty.current = Boolean(newer && snapshotOf(chosenValues, chosenStep) !== lastSynced.current);
        } else {
          // Refresh / return to the unfinished /new wizard: keep the latest work.
          if (cached) {
            if (cached.serverId) {
              try {
                const { campaign } = await campaignService.get(cached.serverId);
                if (!alive) return;
                if (campaign.status === "draft") {
                  serverId.current = cached.serverId;
                  const serverValues = fromCampaign(campaign);
                  const serverStep = clampStep(campaign.wizardStep ?? 0);
                  lastSynced.current = snapshotOf(serverValues, serverStep);
                  const newer = cached.legacy || cached.savedAt > new Date(campaign.updatedAt || 0).getTime();
                  const chosenValues = newer ? cached.values : serverValues;
                  const chosenStep = clampStep(newer ? cached.stepIndex : serverStep);
                  setValues(chosenValues);
                  setStepIndex(chosenStep);
                  dirty.current = snapshotOf(chosenValues, chosenStep) !== lastSynced.current;
                  return;
                }
                // Draft became active or was deleted. Don't resurrect it.
                clearCache(key);
              } catch (error) {
                if (error.status === 404) clearCache(key);
                else {
                  // Temporary network problem: the browser copy is still usable.
                  setValues(cached.values);
                  setStepIndex(clampStep(cached.stepIndex));
                  serverId.current = cached.serverId;
                  dirty.current = true;
                  return;
                }
              }
            } else {
              setValues(cached.values);
              setStepIndex(clampStep(cached.stepIndex));
              dirty.current = true;
              return;
            }
          }
          const profile = await profileService.getRoleProfile().catch(() => null);
          if (!alive) return;
          setValues(fromCampaign(null, profile?.profile));
          setStepIndex(0);
        }
      } catch (error) {
        if (alive) setLoadError(error.message || "Could not load your campaign.");
      } finally {
        if (alive) { initialized.current = true; setLoading(false); }
      }
    }
    load();
    return () => { alive = false; clearTimeout(autosaveTimer.current); };
  }, [campaignId, isEdit, key, newKey]);

  // Keep an up-to-date browser copy; never overwrite newer typing with an old server response.
  const cacheNow = (nextValues, nextStep) => {
    liveSnapshot.current = snapshotOf(nextValues, nextStep);
    writeCache(key, {
      values: nextValues, stepIndex: nextStep,
      serverId: serverId.current, savedAt: Date.now(),
    });
  };

  const enqueueDraft = useCallback((draftValues, draftStep) => {
    if (finalizing.current || statusRef.current !== "draft") return Promise.resolve(false);
    const fingerprint = snapshotOf(draftValues, draftStep);
    if (fingerprint === lastSynced.current && serverId.current) return Promise.resolve(true);

    const operation = saveQueue.current.catch(() => {}).then(async () => {
      const payload = toPayload(draftValues, "draft", draftStep);
      const result = serverId.current
        ? await campaignService.update(serverId.current, payload)
        : await campaignService.create(payload);
      serverId.current = result.campaign?.id || result.campaign?._id || serverId.current;
      lastSynced.current = fingerprint;
      // Preserve current input and only attach the returned MongoDB document ID.
      const current = readCache(key);
      if (current) {
        // Do not rewrite savedAt or the values: a newer keystroke may be pending.
        const { legacy: _oldFormat, ...data } = current;
        writeCache(key, { ...data, serverId: serverId.current });
      }
      // Old /new cache must not outrank newer edits made from the Edit URL.
      if (key !== newKey && readCache(newKey)?.serverId === serverId.current) {
        clearCache(newKey);
      }
      return true;
    }).catch((error) => {
      console.warn("Campaign draft autosave failed:", error.message);
      return false;
    });
    saveQueue.current = operation;
    return operation;
  }, [key, newKey]);

  // Sidebar/browser navigation may unmount the wizard without using its Back button.
  // Best-effort cloud flush; the synchronous browser backup above remains the fallback.
  useEffect(() => () => {
    clearTimeout(autosaveTimer.current);
    if (!initialized.current || !dirty.current || finalizing.current || statusRef.current !== "draft") return;
    const latest = valuesRef.current;
    if (Object.keys(validateDraft(latest)).length === 0) {
      void enqueueDraft(latest, stepRef.current);
    }
  }, [enqueueDraft]);

  useEffect(() => {
    if (!initialized.current || loading || !dirty.current || finalizing.current || savedStatus !== "draft") return;
    if (Object.keys(validateDraft(values)).length) return; // invalid input stays in browser until corrected
    if (snapshotOf(values, stepIndex) === lastSynced.current && serverId.current) return;
    clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => enqueueDraft(values, stepIndex), AUTOSAVE_DELAY_MS);
    return () => clearTimeout(autosaveTimer.current);
  }, [values, stepIndex, savedStatus, loading, enqueueDraft]);

  const setValue = (name, value) => {
    dirty.current = true;
    const updated = { ...valuesRef.current, [name]: value };
    valuesRef.current = updated;
    cacheNow(updated, stepRef.current);
    setValues(updated);
    setErrors((current) => {
      const next = { ...current };
      delete next[name];
      if (name === "startDate" || name === "endDate") { delete next.startDate; delete next.endDate; }
      if (name === "budgetAiSuggested") delete next.budget;
      return next;
    });
    setFormError("");
  };
  const handleChange = (event) => {
    const { name, type, checked, value } = event.target;
    setValue(name, type === "checkbox" ? checked : value);
  };

  const changeStep = (nextIndex) => {
    const next = clampStep(nextIndex);
    dirty.current = true;
    stepRef.current = next;
    cacheNow(valuesRef.current, next);
    setStepIndex(next);
    setFormError("");
  };
  const goNext = () => {
    const found = validateStep(STEPS[stepRef.current].id, valuesRef.current);
    if (Object.keys(found).length) {
      setErrors(found);
      setFormError("Please fix the highlighted fields.");
      return;
    }
    setErrors({});
    changeStep(stepRef.current + 1);
  };
  const goBack = () => changeStep(stepRef.current - 1);
  const goTo = (index) => changeStep(index);

  const showErrors = (found, message) => {
    setErrors(found);
    setFormError(message);
    const target = firstStepWithError(found);
    if (target !== null) changeStep(target);
  };

  // Called before explicit Back-to-campaigns and logout. Also retains the browser backup on failure.
  const flushDraft = async () => {
    if (!dirty.current || statusRef.current !== "draft") return true;
    clearTimeout(autosaveTimer.current);
    await saveQueue.current.catch(() => {});
    const current = valuesRef.current;
    const step = stepRef.current;
    if (Object.keys(validateDraft(current)).length) return false;
    return enqueueDraft(current, step);
  };

  const leave = async () => {
    setSaving(true);
    const synced = await flushDraft();
    if (synced) {
      // /new should create a *new* campaign next time; the saved draft is under Edit.
      clearCache(key);
    }
    navigate(ROUTES.campaigns, {
      state: { syncWarning: !synced
        ? "Some changes have not reached the server yet. They remain saved in this browser; reconnect and reopen New campaign to recover them."
        : "" },
    });
  };

  const save = async (status) => {
    const found = status === "active" ? validateLaunch(valuesRef.current) : validateDraft(valuesRef.current);
    if (Object.keys(found).length) {
      showErrors(found, "Please fix the highlighted fields.");
      return;
    }
    clearTimeout(autosaveTimer.current);
    finalizing.current = true;
    setSaving(true);
    setFormError("");
    try {
      await saveQueue.current.catch(() => {});
      const payload = toPayload(valuesRef.current, status, stepRef.current);
      const result = serverId.current
        ? await campaignService.update(serverId.current, payload)
        : await campaignService.create(payload);
      serverId.current = result.campaign?.id || result.campaign?._id || serverId.current;
      clearCache(key);
      if (readCache(newKey)?.serverId === serverId.current) clearCache(newKey);
      navigate(ROUTES.campaigns, {
        state: { notice: status === "active" ? "Campaign saved and ready." : "Draft saved." },
      });
    } catch (error) {
      const serverErrors = normalizeErrors(error.fieldErrors);
      if (Object.keys(serverErrors).length) showErrors(serverErrors, error.message);
      else setFormError(error.message || "Could not save. Your changes remain in this browser.");
      finalizing.current = false;
      setSaving(false);
    }
  };

  const editingActive = isEdit && savedStatus === "active";
  return {
    step: STEPS[stepIndex], stepIndex, isLastStep: stepIndex === LAST_STEP,
    values,
    errors: { ...errors, ...validateBudgetAndDates(values) },
    formError, loading, loadError, saving, isEdit,
    canSaveDraft: !editingActive,
    finishLabel: editingActive ? "Save changes" : "Launch campaign",
    setValue, handleChange, goNext, goBack, goTo, save, flushDraft, leave,
  };
}
