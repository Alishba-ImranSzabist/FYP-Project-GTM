import { useCallback, useState } from "react";
import { apifyScraperService } from "../Services/apifyScraper.service";

const createScraper = (index) => ({
  id: `scraper-${Date.now()}-${index}`,
  name: `Scraper ${index + 1}`,
  actorId: "",
  enabled: true,
  executionOrder: index + 1,
  maxLeads: 500,
  inputJson: "{}",
});

export default function useApifyScrapers() {
  const [scrapers, setScrapers] = useState(() => [createScraper(0)]);
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const updateScraper = useCallback((id, changes) => {
    setScrapers((current) => current.map((item) => item.id === id ? { ...item, ...changes } : item));
    setSaveMessage("");
    setSaveError("");
  }, []);

  const addScraper = useCallback(() => {
    setScrapers((current) => [...current, createScraper(current.length)]);
    setSaveMessage("");
    setSaveError("");
  }, []);

  const removeScraper = useCallback((id) => {
    setScrapers((current) => current.filter((item) => item.id !== id));
    setSaveMessage("");
  }, []);

  const saveScrapers = useCallback(async () => {
    const validation = apifyScraperService.validate(scrapers);
    if (!validation.valid) {
      setSaveError(validation.message);
      setSaveMessage("");
      return;
    }

    setIsSaving(true);
    setSaveError("");
    setSaveMessage("");
    try {
      // Demo adapter only. Replace this call with the Express API when backend is ready.
      await apifyScraperService.saveDraft(scrapers);
      setSaveMessage("Configuration saved for this session.");
    } catch (error) {
      setSaveError(error.message || "Could not save scraper configuration.");
    } finally {
      setIsSaving(false);
    }
  }, [scrapers]);

  return { scrapers, updateScraper, addScraper, removeScraper, saveScrapers, saveMessage, saveError, isSaving };
}
