import { useCallback, useEffect, useState } from "react";
import { adminAIConfigDraftService } from "../Services/adminAIConfigDraft.service";

/**
 * Keeps non-secret form drafts available while the browser tab session remains
 * open. Never use this hook for API keys, passwords or other credentials.
 */
export default function useSessionDraft(sectionKey, initialValue) {
  const [values, setValues] = useState(() =>
    adminAIConfigDraftService.read(sectionKey, initialValue)
  );
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    adminAIConfigDraftService.save(sectionKey, values);
  }, [sectionKey, values]);

  const update = useCallback((field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
    setSaved(false);
  }, []);

  const saveDraft = useCallback((nextValues = values) => {
    const success = adminAIConfigDraftService.save(sectionKey, nextValues);
    setSaved(success);
    return success;
  }, [sectionKey, values]);

  const resetDraft = useCallback(() => {
    adminAIConfigDraftService.clear(sectionKey);
    setValues(initialValue);
    setSaved(false);
  }, [sectionKey, initialValue]);

  return { values, setValues, update, saveDraft, resetDraft, saved };
}
