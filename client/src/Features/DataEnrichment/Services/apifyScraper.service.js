/**
 * Frontend adapter for Apify scraper configuration.
 * This validates configuration only; it does not start an Apify Actor.
 * The real API token and Actor execution must be handled by the Express backend.
 */
export const apifyScraperService = {
  validate(scrapers) {
    const enabled = scrapers.filter((scraper) => scraper.enabled);
    if (!enabled.length) return { valid: false, message: "Enable at least one scraper before saving." };

    for (const scraper of enabled) {
      if (!scraper.name.trim()) return { valid: false, message: "Every enabled scraper needs a name." };
      if (!scraper.actorId.trim()) return { valid: false, message: `Enter the Apify Actor ID for ${scraper.name}.` };
      if (!Number.isInteger(Number(scraper.executionOrder)) || Number(scraper.executionOrder) < 1) {
        return { valid: false, message: `Execution order for ${scraper.name} must be 1 or greater.` };
      }
      if (!Number.isInteger(Number(scraper.maxLeads)) || Number(scraper.maxLeads) < 1) {
        return { valid: false, message: `Maximum leads for ${scraper.name} must be 1 or greater.` };
      }
      try {
        const input = JSON.parse(scraper.inputJson);
        if (!input || Array.isArray(input) || typeof input !== "object") throw new Error();
      } catch {
        return { valid: false, message: `Input JSON for ${scraper.name} must be a valid JSON object.` };
      }
    }
    return { valid: true };
  },

  async saveDraft(scrapers) {
    // Deliberately no localStorage/API persistence in the frontend-only phase.
    // Backend phase will persist this through an authenticated Express endpoint.
    return scrapers.map(({ id, ...config }) => ({ ...config }));
  },
};
