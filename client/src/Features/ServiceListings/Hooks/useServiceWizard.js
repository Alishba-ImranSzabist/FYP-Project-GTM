import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ROUTES } from "../../../constants/routes";
import useAuth from "../../Auth/Hooks/useAuth";
import { profileService } from "../../Panel/Services/profile.service";
import { AUTOSAVE_DELAY_MS, STEPS } from "../serviceListingConfig";
import {
  EMPTY_VALUES, firstStepWithError, fromService, normalizeErrors, toPayload,
  validateActivate, validateChanged, validateDraft, validateStep,
} from "../serviceListingForm";
import { serviceListingService } from "../Services/serviceListing.service";

const LAST_STEP = STEPS.length - 1;

// This is a same-browser backup. MongoDB autosave is the cross-login/device copy.
function readCache(key) {
  try {
    const saved = JSON.parse(localStorage.getItem(key) || "null");
    return saved?.values && Number.isFinite(saved?.savedAt) ? saved : null;
  } catch { return null; }
}
function writeCache(key, data) {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch { /* storage may be disabled */ }
}
function clearCache(key) {
  try { localStorage.removeItem(key); } catch { /* storage may be disabled */ }
}

const snapshotOf = (values, stepIndex) => JSON.stringify({ values, stepIndex });

/**
 * Three-step service wizard, no new dependency. Incomplete drafts are allowed in MongoDB.
 * A serialized save queue prevents duplicate POSTs and preserves the latest edit order.
 */
export default function useServiceWizard(serviceId) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const isEdit = Boolean(serviceId);
  const forceFresh = new URLSearchParams(location.search).get("fresh") === "1";
  const ownerId = user?.id || user?._id || user?.email || "anonymous";
  const key = `gtm:service:unfinished:${ownerId}:${serviceId || "new"}`;

  const [stepIndex, setStepIndex] = useState(0);
  const [values, setValues] = useState(EMPTY_VALUES);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedStatus, setSavedStatus] = useState("draft");
  const [saveStatus, setSaveStatus] = useState("");

  const initialized = useRef(false);
  const dirty = useRef(false);
  const serverId = useRef(serviceId || null);
  const lastSynced = useRef("");
  const saveQueue = useRef(Promise.resolve());
  const autosaveTimer = useRef(null);
  const finalizing = useRef(false);
  const liveSnapshot = useRef(null);
  const valuesRef = useRef(values);
  const stepRef = useRef(stepIndex);
  valuesRef.current = values;
  stepRef.current = stepIndex;

  // Restore a server draft, followed by any *newer* unsynced local edits.
  useEffect(() => {
    let alive = true;
    initialized.current = false;
    dirty.current = false;
    finalizing.current = false;
    serverId.current = serviceId || null;
    lastSynced.current = "";
    clearTimeout(autosaveTimer.current);
    setLoading(true);
    setLoadError("");
    setSaveStatus("");

    async function init() {
      try {
        const cached = readCache(key);
        if (isEdit) {
          const { service } = await serviceListingService.get(serviceId);
          if (!alive) return;
          const serverValues = fromService(service);
          const serverStep = service.wizardStep ?? 0;
          const serverSnapshot = snapshotOf(serverValues, serverStep);
          lastSynced.current = serverSnapshot;
          const newCache = service.status === "draft"
            ? readCache(`gtm:service:unfinished:${ownerId}:new`) : null;
          const relevantCache = [cached, newCache?.serverId === serviceId ? newCache : null]
            .filter(Boolean).sort((a, b) => b.savedAt - a.savedAt)[0];
          const localIsNewer = relevantCache && relevantCache.savedAt > new Date(service.updatedAt || 0).getTime();
          const restored = localIsNewer ? relevantCache.values : serverValues;
          const restoredStep = localIsNewer ? relevantCache.stepIndex : serverStep;
          setValues(restored);
          setStepIndex(Math.max(0, Math.min(LAST_STEP, restoredStep || 0)));
          setSavedStatus(service.status);
          dirty.current = Boolean(localIsNewer && snapshotOf(restored, restoredStep) !== serverSnapshot);
        } else {
          // If this browser has an unfinished unsynced draft, recover it first.
          if (!forceFresh && cached) {
            if (cached.serverId) {
              const result = await serviceListingService.get(cached.serverId).catch(() => null);
              if (!alive) return;
              if (result?.service?.status === "draft") {
                // Keep unsynced browser changes rather than redirect to the older server copy.
                serverId.current = cached.serverId;
                const serverValues = fromService(result.service);
                const serverStep = result.service.wizardStep ?? 0;
                lastSynced.current = snapshotOf(serverValues, serverStep);
                const cacheIsNewer = cached.savedAt > new Date(result.service.updatedAt || 0).getTime();
                const chosenValues = cacheIsNewer ? cached.values : serverValues;
                const chosenStep = cacheIsNewer ? cached.stepIndex : serverStep;
                setValues(chosenValues);
                setStepIndex(Math.max(0, Math.min(LAST_STEP, chosenStep || 0)));
                dirty.current = snapshotOf(chosenValues, chosenStep) !== lastSynced.current;
                return;
              }
              // The cached service was activated/deleted; don't overwrite it with a draft.
              clearCache(key);
            }
            if (!cached.serverId) {
              setValues(cached.values);
              setStepIndex(Math.max(0, Math.min(LAST_STEP, cached.stepIndex || 0)));
              dirty.current = true;
            }
          } else {
            if (!forceFresh) {
              const recent = await serviceListingService.recentDraft().catch(() => ({ service: null }));
              if (!alive) return;
              if (recent.service?.id) {
                navigate(ROUTES.serviceEdit.replace(":id", recent.service.id), { replace: true });
                return;
              }
            }
            const profileData = await profileService.getRoleProfile().catch(() => null);
            if (!alive) return;
            setValues(fromService(null, { portfolioLink: profileData?.profile?.portfolio?.[0] || "" }));
            setStepIndex(0);
          }
        }
      } catch (error) {
        if (alive) setLoadError(error.message || "Could not load your service.");
      } finally {
        if (alive) { initialized.current = true; setLoading(false); }
      }
    }
    init();
    return () => { alive = false; clearTimeout(autosaveTimer.current); };
  }, [serviceId, isEdit, forceFresh, key, ownerId, navigate]);

  // Keep latest browser copy as soon as fields change, even if offline.
  useEffect(() => {
    if (!initialized.current || loading || !dirty.current) return;
    liveSnapshot.current = snapshotOf(values, stepIndex);
    writeCache(key, { values, stepIndex, serverId: serverId.current, savedAt: Date.now() });
  }, [values, stepIndex, loading, key]);

  const enqueueDraft = useCallback((draftValues, draftStep) => {
    const fingerprint = snapshotOf(draftValues, draftStep);
    if (finalizing.current || savedStatus !== "draft") return Promise.resolve(false);
    if (fingerprint === lastSynced.current && serverId.current) return Promise.resolve(true);
    setSaveStatus("saving");

    // Resolve the previous request even if it failed, then send the latest snapshot.
    const operation = saveQueue.current.catch(() => {}).then(async () => {
      const payload = toPayload(draftValues, "draft", draftStep);
      const result = serverId.current
        ? await serviceListingService.update(serverId.current, payload)
        : await serviceListingService.create(payload);
      serverId.current = result.service?.id || serverId.current;
      lastSynced.current = fingerprint;
      // Update only the ID, never overwrite newer browser edits with an older network response.
      const current = readCache(key);
      if (current) writeCache(key, { ...current, serverId: serverId.current });
      if (liveSnapshot.current === fingerprint) setSaveStatus("saved");
      return true;
    }).catch((error) => {
      if (liveSnapshot.current === fingerprint) setSaveStatus("offline");
      console.warn("Service draft autosave failed:", error.message);
      return false;
    });
    saveQueue.current = operation;
    return operation;
  }, [key, savedStatus]);

  useEffect(() => {
    if (!initialized.current || loading || !dirty.current || savedStatus !== "draft" || finalizing.current) return;
    if (Object.keys(validateDraft(values)).length) {
      setSaveStatus("offline");
      return;
    }
    if (snapshotOf(values, stepIndex) === lastSynced.current && serverId.current) {
      setSaveStatus("saved");
      return;
    }
    setSaveStatus("pending");
    clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => enqueueDraft(values, stepIndex), AUTOSAVE_DELAY_MS);
    return () => clearTimeout(autosaveTimer.current);
  }, [values, stepIndex, loading, savedStatus, enqueueDraft]);

  const setValue = (name, value) => {
    dirty.current = true;
    const updated = { ...valuesRef.current, [name]: value };
    valuesRef.current = updated;
    liveSnapshot.current = snapshotOf(updated, stepRef.current);
    writeCache(key, { values: updated, stepIndex: stepRef.current, serverId: serverId.current, savedAt: Date.now() });
    setValues(updated);
    setErrors((old) => {
      const next = { ...old, [name]: validateChanged(name, updated)[name] };
      if (name === "category") next.customCategory = validateChanged("customCategory", updated).customCategory;
      return next;
    });
    setFormError("");
  };
  const handleChange = (event) => setValue(event.target.name, event.target.value);

  const changeStep = (next) => {
    dirty.current = true;
    stepRef.current = next;
    liveSnapshot.current = snapshotOf(valuesRef.current, next);
    writeCache(key, { values: valuesRef.current, stepIndex: next, serverId: serverId.current, savedAt: Date.now() });
    setStepIndex(next);
    setFormError("");
  };

  const goNext = () => {
    const found = validateStep(STEPS[stepIndex].id, values);
    if (Object.keys(found).length) { setErrors(found); setFormError("Please fix the highlighted fields."); return; }
    setErrors({});
    changeStep(Math.min(stepIndex + 1, LAST_STEP));
  };
  const goBack = () => changeStep(Math.max(stepIndex - 1, 0));
  const goTo = (index) => changeStep(Math.min(LAST_STEP, Math.max(0, index)));

  const showErrors = (found, message) => {
    setErrors(found);
    setFormError(message);
    const targetStep = firstStepWithError(found);
    if (targetStep !== null) changeStep(targetStep);
  };

  // Back-to-services and Logout flush the pending draft first. Browser copy survives failures.
  const flushDraft = async () => {
    if (!dirty.current || savedStatus !== "draft") return true;
    clearTimeout(autosaveTimer.current);
    const currentValues = valuesRef.current;
    const currentStep = stepRef.current;
    const errorsFound = validateDraft(currentValues);
    if (Object.keys(errorsFound).length) {
      setErrors(errorsFound);
      setSaveStatus("offline");
      return false;
    }
    return enqueueDraft(currentValues, currentStep);
  };

  const leave = async () => {
    setSaving(true);
    const persisted = await flushDraft();
    navigate(ROUTES.services, {
      state: {
        notice: dirty.current && savedStatus === "draft" && persisted
          ? "Your unfinished service was saved as a draft." : "",
        syncWarning: dirty.current && savedStatus === "draft" && !persisted
          ? "Cloud save is pending. Your changes remain stored in this browser; reconnect and open the service again."
          : "",
      },
    });
  };

  const save = async (status) => {
    const found = status === "active" ? validateActivate(values) : validateDraft(values);
    if (Object.keys(found).length) {
      showErrors(found, "Please fix the highlighted fields.");
      return;
    }
    clearTimeout(autosaveTimer.current);
    finalizing.current = true;
    setSaving(true);
    setFormError("");
    try {
      await saveQueue.current; // don't race an earlier autosave create/update
      const payload = toPayload(valuesRef.current, status, stepRef.current);
      const result = serverId.current
        ? await serviceListingService.update(serverId.current, payload)
        : await serviceListingService.create(payload);
      serverId.current = result.service?.id || serverId.current;
      clearCache(key);
      const newKey = `gtm:service:unfinished:${ownerId}:new`;
      if (readCache(newKey)?.serverId === serverId.current) clearCache(newKey);
      navigate(ROUTES.services, {
        state: { notice: status === "draft" ? "Draft saved."
          : savedStatus === "paused" ? "Changes saved. Matching remains paused."
          : "Service saved. The AI is finding matches." },
      });
    } catch (err) {
      const serverErrors = normalizeErrors(err.fieldErrors);
      if (Object.keys(serverErrors).length) showErrors(serverErrors, err.message);
      else setFormError(err.message || "Could not save. Your changes are still in this browser.");
      finalizing.current = false;
      setSaving(false);
    }
  };

  const editingMatched = isEdit && savedStatus !== "draft";
  const saveLabel = {
    pending: "Unsaved changes (auto-save pending)",
    saving: "Saving draft to cloud…",
    saved: "Draft saved to cloud",
    offline: "Cloud save pending; browser backup available",
  }[saveStatus] || "Changes are saved automatically as a draft";

  return {
    step: STEPS[stepIndex], stepIndex, isLastStep: stepIndex === LAST_STEP,
    values, errors, formError, loading, loadError, saving, saveLabel,
    isEdit, canSaveDraft: !editingMatched,
    finishLabel: editingMatched ? "Save changes" : "Save & find AI matches",
    setValue, handleChange, goNext, goBack, goTo, save, flushDraft, leave,
  };
}
