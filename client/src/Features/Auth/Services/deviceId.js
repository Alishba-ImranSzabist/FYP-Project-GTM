const KEY = "gtm_device_id";

/**
 * Random id for this browser/system, kept in localStorage.
 * The server uses it to remember "this device already proved its email"
 * so the next login from here doesn't need another emailed code.
 * Returns undefined when storage is unavailable (e.g. strict private mode).
 */
export function getDeviceId() {
  try {
    let id = localStorage.getItem(KEY);
    if (!id) {
      id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `dev-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return undefined;
  }
}