/**
 * Temporary browser-session draft storage for the frontend-only admin screens.
 *
 * IMPORTANT:
 * - This service stores configuration drafts in sessionStorage only.
 * - API keys/secrets must never be passed to this service.
 * - Replace this adapter with authenticated admin API calls when the backend
 *   configuration endpoints are implemented.
 */
const STORAGE_PREFIX = "gtm.admin.aiModelManagement";

function getStorage() {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export const adminAIConfigDraftService = Object.freeze({
  read(sectionKey, fallbackValue) {
    const storage = getStorage();
    if (!storage) return fallbackValue;

    try {
      const raw = storage.getItem(`${STORAGE_PREFIX}.${sectionKey}`);
      if (!raw) return fallbackValue;
      const saved = JSON.parse(raw);
      if (!saved || typeof saved !== "object" || Array.isArray(saved)) return fallbackValue;

      const merged = { ...fallbackValue, ...saved };
      // Merge nested form maps (e.g. enabledSections and prompt text) so newly
      // added templates receive defaults without overwriting existing edits.
      Object.keys(fallbackValue || {}).forEach((key) => {
        const fallbackChild = fallbackValue[key];
        const savedChild = saved[key];
        const isPlainObject = (value) => value && typeof value === "object" && !Array.isArray(value);
        if (isPlainObject(fallbackChild) && isPlainObject(savedChild)) {
          merged[key] = { ...fallbackChild, ...savedChild };
        }
      });
      return merged;
    } catch {
      return fallbackValue;
    }
  },

  save(sectionKey, value) {
    const storage = getStorage();
    if (!storage) return false;

    try {
      storage.setItem(`${STORAGE_PREFIX}.${sectionKey}`, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },

  clear(sectionKey) {
    const storage = getStorage();
    if (!storage) return;
    try {
      storage.removeItem(`${STORAGE_PREFIX}.${sectionKey}`);
    } catch {
      // Storage may be unavailable in private browsing or restricted contexts.
    }
  },
});
