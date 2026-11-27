import { useEffect, useMemo, useState } from "react";
import { dataEnrichmentService } from "../Services/dataEnrichment.service";

/**
 * Owns Data & Enrichment page state and user actions.
 * UI components stay presentational; provider/API calls stay in Services.
 */
export default function useDataEnrichment({ isProvider = false } = {}) {
  const [step, setStep] = useState(0);
  const [source, setSource] = useState(isProvider ? "Instagram" : "Business discovery");
  const [keywords, setKeywords] = useState(["women fashion", "ready to wear", "lawn sale"]);
  const [keywordInput, setKeywordInput] = useState("");
  const [market, setMarket] = useState(["Lahore", "Karachi", "Islamabad"]);
  const [audience, setAudience] = useState(
    isProvider
      ? "Celebrities and influencers seeking PR, collaboration or talent services"
      : "Style-conscious young women · Fashion-season shoppers"
  );
  const [maxRecords, setMaxRecords] = useState("7000");
  const [options, setOptions] = useState({
    people: true, businesses: true, posts: true,
    job: true, workEmail: true, phone: true, skip: true,
  });
  const [collecting, setCollecting] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState([1, 2, 3, 4, 5]);
  const [notice, setNotice] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [activeLead, setActiveLead] = useState(null);
  const [leads, setLeads] = useState(() => []);

  useEffect(() => {
    let active = true;
    dataEnrichmentService.getLeads()
      .then((loadedLeads) => {
        if (active) setLeads(loadedLeads);
      })
      .catch((error) => {
        if (active) setNotice(error instanceof Error ? error.message : "Could not load leads.");
      });

    return () => {
      active = false;
    };
  }, []);

  const filteredLeads = useMemo(() => leads.filter((lead) => {
    const matchesQuery = `${lead.name} ${lead.company} ${lead.role} ${lead.email}`
      .toLowerCase().includes(query.toLowerCase());
    const matchesFilter = filter === "All" || lead.status === filter;
    return matchesQuery && matchesFilter;
  }), [leads, query, filter]);

  const addKeyword = () => {
    const value = keywordInput.trim();
    if (value && !keywords.some((item) => item.toLowerCase() === value.toLowerCase())) {
      setKeywords((items) => [...items, value]);
    }
    setKeywordInput("");
  };

  const toggleOption = (key) => setOptions((current) => ({ ...current, [key]: !current[key] }));
  const toggleLead = (id) =>
    setSelected((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);

  const startCollection = () => {
    setCollecting(true);
    setNotice("Collection started in demo mode. Live Apify integration will be connected in the backend phase.");
    setStep(1);
  };

  const finishDemo = () => {
    setCollecting(false);
    setStep(2);
    setNotice("Demo results are ready. No external API request was made.");
  };

  const enrichSelected = async () => {
    setLeads((current) => current.map((lead) =>
      selected.includes(lead.id) && lead.status !== "Enriched"
        ? { ...lead, status: "Enriched" }
        : lead
    ));
    setNotice(`${selected.length} selected record(s) marked as enriched in demo mode. Apollo is not connected yet.`);
  };

  const handleExport = () => dataEnrichmentService.exportLeadsCsv(filteredLeads);

  return {
    step, setStep, source, setSource, keywords, setKeywords, keywordInput,
    setKeywordInput, market, setMarket, audience, setAudience, maxRecords,
    setMaxRecords, options, toggleOption, collecting, query, setQuery, filter,
    setFilter, selected, setSelected, notice, setNotice, showFilters,
    setShowFilters, showRecovery, setShowRecovery, activeLead, setActiveLead,
    leads, filteredLeads, addKeyword, toggleLead, startCollection, finishDemo,
    enrichSelected, handleExport,
  };
}
