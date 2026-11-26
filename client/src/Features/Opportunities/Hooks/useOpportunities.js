import { useCallback, useEffect, useMemo, useState } from "react";
import { opportunitiesService } from "../Services/opportunities.service";

export default function useOpportunities() {
  const [stage, setStage] = useState("model");
  const model = "gemini";
  const [service, setService] = useState("Video editing for reels and short films");
  const [status, setStatus] = useState("idle");
  const [opportunities, setOpportunities] = useState([]);
  const [active, setActive] = useState(null);
  const [filter, setFilter] = useState("All types");
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [contactLoading, setContactLoading] = useState(false);

  useEffect(() => {
    opportunitiesService.list().then(setOpportunities).catch(() => {
      setNotice("Could not load demo opportunities.");
    });
  }, []);

  const filtered = useMemo(() => opportunities.filter((item) => {
    const matchesFilter = filter === "All types" || item.tags.some((tag) =>
      tag.toLowerCase().includes(filter.toLowerCase())
    );
    const matchesSearch = `${item.name} ${item.handle} ${item.category} ${item.quote}`
      .toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  }), [opportunities, filter, search]);

  const startScan = useCallback(() => {
    setStage("scanning");
    setStatus("scanning");
    setNotice("Demo scan started. No Apify or AI API request has been made.");
  }, []);

  const finishScan = useCallback(() => {
    setStatus("complete");
    setStage("results");
    setNotice("Demo opportunities are ready for review.");
  }, []);

  const openContact = useCallback(async (item) => {
    setContactLoading(true);
    setNotice("");
    try {
      const result = await opportunitiesService.findContact(item.id);
      setActive(result);
      setStage("contact");
    } catch (error) {
      setNotice(error.message || "Unable to open contact details.");
    } finally {
      setContactLoading(false);
    }
  }, []);

  const backToResults = () => {
    setActive(null);
    setStage("results");
  };

  const saveOpportunity = (id) => {
    setOpportunities((items) => items.map((item) =>
      item.id === id ? { ...item, saved: !item.saved } : item
    ));
  };

  return {
    stage, setStage, model, service, setService, status,
    opportunities, filtered, active, filter, setFilter, search, setSearch,
    notice, setNotice, contactLoading, startScan, finishScan, openContact,
    backToResults, saveOpportunity,
  };
}
