
import { useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Clock3,
  Database,
  Download,
  Globe2,
  Info,
  Mail,
  MapPin,
  Megaphone,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Target,
  Users,
  X,
} from "lucide-react";

import useAuth from "../../Auth/Hooks/useAuth";
import PanelShell from "../../Panel/components/PanelShell";
import { PANEL_CONFIG } from "../../Panel/panelConfig";
import { ROUTES, USER_ROLES } from "../../../constants/routes";

import useDataEnrichment from "../Hooks/useDataEnrichment";
import StatCard from "../components/StatCard";
import ToggleSwitch from "../components/ToggleSwitch";
import StageHeader from "../components/StageHeader";

import "../dataEnrichment.css";

const cx = (...parts) => parts.filter(Boolean).join(" ");

export default function DataEnrichmentPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isProvider = user?.role === USER_ROLES.serviceProvider;

  const config =
    PANEL_CONFIG[user?.role] || PANEL_CONFIG[USER_ROLES.business];

  const {
    step,
    setStep,
    source,
    setSource,
    keywords,
    setKeywords,
    keywordInput,
    setKeywordInput,
    market,
    setMarket,
    audience,
    setAudience,
    maxRecords,
    setMaxRecords,
    options,
    toggleOption,
    collecting,
    query,
    setQuery,
    filter,
    setFilter,
    selected,
    setSelected,
    notice,
    setNotice,
    showFilters,
    setShowFilters,
    showRecovery,
    setShowRecovery,
    activeLead,
    setActiveLead,
    leads,
    filteredLeads,
    addKeyword,
    toggleLead,
    startCollection,
    finishDemo,
    enrichSelected,
    handleExport,
  } = useDataEnrichment({ isProvider });

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  // Navigate directly to AI Recommendations instead of browser history.
  const handleBackToRecommendations = () => {
    if (isProvider) {
      navigate(ROUTES.dashboard);
      return;
    }

    navigate(ROUTES.aiRecommendations);
  };

  return (
    <PanelShell
      config={config}
      user={user}
      onLogout={handleLogout}
    >
      <div className="de-page">

        {/* PAGE HEADER */}

        <div className="de-page-head">
          <div>
            <span className="de-eyebrow">DATA WORKSPACE</span>

            <h1>Data &amp; Enrichment</h1>

            <p>
              Discover relevant public data, enrich eligible contacts
              and prepare better leads.
            </p>
          </div>

          <div className="de-head-actions">
            <span className="de-run-pill">
              <Activity size={14} />
              {collecting ? "Collection running" : "Demo workspace"}
            </span>

            <button
              type="button"
              className="de-btn de-btn--outline"
              onClick={() => {
                setStep(0);
                setNotice("");
              }}
            >
              <RefreshCw size={15} />
              New run
            </button>
          </div>
        </div>

        <StageHeader
          step={step}
          onStep={(value) => {
            setStep(value);
            setNotice("");
          }}
        />

        {notice && (
          <div className="de-notice" role="status">
            <Info size={17} />
            <span>{notice}</span>

            <button
              type="button"
              onClick={() => setNotice("")}
              aria-label="Dismiss"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* STEP 1: DATA COLLECTION SETUP */}

        {step === 0 && (
          <>
            <section className="de-intro-card">
              <div className="de-intro-copy">
                <span className="de-kicker">
                  <Sparkles size={14} />
                  APIFY + APOLLO WORKFLOW
                </span>

                <h2>Build a focused data collection run</h2>

                <p>
                  Set your discovery criteria first. You can review
                  collected records before requesting contact enrichment.
                </p>
              </div>

              <div className="de-intro-art">
                <div className="de-orbit de-orbit--one" />
                <div className="de-orbit de-orbit--two" />

                <span>
                  <Database size={30} />
                </span>
              </div>
            </section>

            <div className="de-setup-grid">

              {/* DISCOVERY CRITERIA */}

              <section className="de-card de-criteria">
                <div className="de-card-heading">
                  <div>
                    <span className="de-section-label">
                      STEP 1 · DISCOVERY CRITERIA
                    </span>

                    <h3>What data are you looking for?</h3>

                    <p>
                      Choose the source and describe your ideal audience.
                    </p>
                  </div>

                  <span className="de-count-tag">
                    Apify collection
                  </span>
                </div>

                <span id="de-source-label" className="de-field-label">
                  Data source
                </span>

                <div className="de-source-options" role="group" aria-labelledby="de-source-label">
                  {(isProvider
                    ? ["Instagram", "Facebook", "Public web"]
                    : [
                        "Business discovery",
                        "LinkedIn",
                        "Instagram",
                        "Public web",
                      ]
                  ).map((item) => (
                    <button
                      type="button"
                      key={item}
                      className={cx(
                        "de-source-chip",
                        source === item && "is-selected"
                      )}
                      onClick={() => setSource(item)}
                    >
                      {item === "LinkedIn" || item === "Public web" ? (
                        <Globe2 size={15} />
                      ) : (
                        <Database size={15} />
                      )}

                      {item}
                    </button>
                  ))}
                </div>

                <label className="de-field-label" htmlFor="de-keyword">
                  Keywords and search terms
                </label>

                <div className="de-chip-input">
                  {keywords.map((word) => (
                    <span key={word}>
                      {word}

                      <button
                        type="button"
                        onClick={() =>
                          setKeywords((items) =>
                            items.filter((x) => x !== word)
                          )
                        }
                        aria-label={`Remove ${word}`}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}

                  <input
                    id="de-keyword"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addKeyword();
                      }
                    }}
                    placeholder="Add a keyword and press Enter"
                  />

                  <button
                    type="button"
                    className="de-add-keyword"
                    onClick={addKeyword}
                  >
                    <Plus size={14} />
                    Add
                  </button>
                </div>

                <div className="de-form-row">
                  <div>
                    <label className="de-field-label" htmlFor="de-market">
                      Target locations
                    </label>

                    <input
                      id="de-market"
                      className="de-input"
                      value={market.join(", ")}
                      onChange={(e) =>
                        setMarket(
                          e.target.value
                            .split(",")
                            .map((v) => v.trim())
                            .filter(Boolean)
                        )
                      }
                      placeholder="e.g. Lahore, Karachi"
                    />

                    <small>Separate locations with commas.</small>
                  </div>

                  <div>
                    <label className="de-field-label" htmlFor="de-limit">
                      Maximum records
                    </label>

                    <input
                      id="de-limit"
                      className="de-input"
                      type="number"
                      min="1"
                      max="10000"
                      value={maxRecords}
                      onChange={(e) => setMaxRecords(e.target.value)}
                    />

                    <small>Set a reasonable collection limit.</small>
                  </div>
                </div>

                <label className="de-field-label" htmlFor="de-audience">
                  Audience / opportunity description
                </label>

                <textarea
                  id="de-audience"
                  className="de-textarea"
                  rows="3"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder="Describe the people, companies or public opportunities you want to find."
                />

                <div className="de-card-divider" />

                <div className="de-card-heading de-card-heading--compact">
                  <div>
                    <h3>Apify collection scope</h3>
                    <p>
                      Choose the public record types relevant to this run.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="de-btn de-btn--outline de-btn--sm"
                    onClick={() => navigate(ROUTES.apifyScrapers)}
                  >
                    Configure scrapers
                    <ArrowRight size={14} />
                  </button>
                </div>

                <div className="de-option-list">
                  {[
                    {
                      key: "people",
                      title: "Potential people / profiles",
                      desc: "Public profile and identity signals",
                    },
                    {
                      key: "businesses",
                      title: "Business pages",
                      desc: "Company and competitor information",
                    },
                    {
                      key: "posts",
                      title: "Relevant posts and discussions",
                      desc: "Public content related to your keywords",
                    },
                  ].map((item) => (
                    <div className="de-option-row" key={item.key}>
                      <div>
                        <strong>{item.title}</strong>
                        <small>{item.desc}</small>
                      </div>

                      <ToggleSwitch
                        checked={options[item.key]}
                        onChange={() => toggleOption(item.key)}
                        label={item.title}
                      />
                    </div>
                  ))}
                </div>
              </section>

              {/* APOLLO ENRICHMENT */}

              <aside className="de-side-stack">
                <section className="de-card de-apollo-card">
                  <div className="de-integration-title">
                    <span className="de-integration-icon">
                      <Building2 size={18} />
                    </span>

                    <div>
                      <h3>Apollo enrichment</h3>
                      <p>Enrich eligible people and companies</p>
                    </div>

                    <span className="de-soft-tag">Optional</span>
                  </div>

                  <div className="de-option-list">
                    {[
                      {
                        key: "job",
                        title: "Job title and company",
                        desc: "Professional role and organization",
                      },
                      {
                        key: "workEmail",
                        title: "Work email",
                        desc: "Available business email information",
                      },
                      {
                        key: "phone",
                        title: "Work phone",
                        desc: "Available phone information",
                      },
                      {
                        key: "skip",
                        title: "Skip already enriched",
                        desc: "Avoid repeat enrichment requests",
                      },
                    ].map((item) => (
                      <div className="de-option-row" key={item.key}>
                        <div>
                          <strong>{item.title}</strong>
                          <small>{item.desc}</small>
                        </div>

                        <ToggleSwitch
                          checked={options[item.key]}
                          onChange={() => toggleOption(item.key)}
                          label={item.title}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="de-apollo-foot">
                    <ShieldCheck size={15} />
                    Apollo runs after you review the collected records.
                  </div>
                </section>

                {/* RUN ESTIMATE */}

                <section className="de-estimate-card">
                  <div className="de-estimate-top">
                    <span>RUN ESTIMATE</span>
                    <CircleHelp size={15} />
                  </div>

                  <div className="de-estimate-metrics">
                    <div>
                      <strong>
                        Up to {Number(maxRecords || 0).toLocaleString()}
                      </strong>
                      <small>Requested records</small>
                    </div>

                    <div>
                      <strong>2 stages</strong>
                      <small>Collect then enrich</small>
                    </div>
                  </div>

                  <div className="de-estimate-note">
                    <Clock3 size={14} />
                    Actual volume and timing depend on source availability
                    and API limits.
                  </div>
                </section>

                <div className="de-responsible-note">
                  <ShieldCheck size={16} />

                  <span>
                    Use only publicly accessible data and respect source
                    terms, privacy rules and service limits. Contact
                    details may not be available for every record.
                  </span>
                </div>
              </aside>
            </div>

            {/* FOOTER ACTIONS */}

            <div className="de-footer-actions">
              <button
                type="button"
                className="de-btn de-btn--text"
                onClick={handleBackToRecommendations}
              >
                <ArrowLeft size={16} />
                {isProvider ? "Back to Dashboard" : "Back to AI Recommendations"}
              </button>

              {!isProvider && (
                <button
                  type="button"
                  className="de-btn de-btn--outline"
                  onClick={() => navigate(ROUTES.campaigns)}
                >
                  <Megaphone size={16} />
                  Back to Campaigns
                </button>
              )}

              <button
                type="button"
                className="de-btn de-btn--outline"
                onClick={() =>
                  setNotice(
                    "Your configuration is kept in this page for now. Draft persistence will be added with the backend."
                  )
                }
              >
                Save draft
              </button>

              <button
                type="button"
                className="de-btn de-btn--primary"
                onClick={startCollection}
                disabled={
                  !keywords.length ||
                  !audience.trim() ||
                  Number(maxRecords) < 1
                }
              >
                <Play size={15} />
                Start collection
                <ArrowRight size={16} />
              </button>
            </div>
          </>
        )}

        {/* STEP 2: COLLECTION PROGRESS */}

        {step === 1 && (
          <>
            <div className="de-live-head">
              <div>
                <span className="de-section-label">
                  COLLECTION RUN · #03
                </span>

                <h2>Collecting public data</h2>

                <p>{source} · {keywords.join(", ")}</p>
              </div>

              <span className="de-live-status">
                <span />
                {collecting ? "Demo run active" : "Run paused"}
              </span>
            </div>

            <div className="de-progress-grid">
              <div className="de-progress-card">
                <div className="de-progress-brand">
                  <span className="de-integration-icon">
                    <Database size={18} />
                  </span>

                  <div>
                    <strong>Apify</strong>
                    <small>Public data collection</small>
                  </div>

                  <span className="de-progress-state">
                    {collecting ? "Collecting" : "Paused"}
                  </span>
                </div>

                <div className="de-progress-line">
                  <span style={{ width: "78%" }} />
                </div>

                <div className="de-progress-meta">
                  <span>78% complete</span>
                  <strong>6,842 records found</strong>
                </div>
              </div>

              <div className="de-progress-card">
                <div className="de-progress-brand">
                  <span className="de-integration-icon de-integration-icon--gold">
                    <Building2 size={18} />
                  </span>

                  <div>
                    <strong>Apollo</strong>
                    <small>Contact enrichment</small>
                  </div>

                  <span className="de-progress-state de-progress-state--gold">
                    Queued
                  </span>
                </div>

                <div className="de-progress-line de-progress-line--gold">
                  <span style={{ width: "0%" }} />
                </div>

                <div className="de-progress-meta">
                  <span>Waiting for review</span>
                  <strong>Not started</strong>
                </div>
              </div>
            </div>

            <section className="de-card de-live-table">
              <div className="de-card-heading">
                <div>
                  <h3>Collection progress</h3>
                  <p>Sample task breakdown for this demonstration.</p>
                </div>

                <span className="de-count-tag">Run #03</span>
              </div>

              {[
                {
                  name: "Potential people",
                  detail: "1,284 matched profiles",
                  count: "3,420",
                  pct: 88,
                },
                {
                  name: "Public business pages",
                  detail: "418 matched businesses",
                  count: "842",
                  pct: 64,
                },
                {
                  name: "Relevant posts and discussions",
                  detail: "Scanning public content",
                  count: "2,580",
                  pct: 76,
                },
                {
                  name: "Job title and company",
                  detail: "Waiting for Apollo",
                  count: "—",
                  pct: 0,
                },
                {
                  name: "Work email and phone",
                  detail: "Waiting for Apollo",
                  count: "—",
                  pct: 0,
                },
              ].map((item) => (
                <div className="de-task-row" key={item.name}>
                  <span className="de-task-icon">
                    <Database size={15} />
                  </span>

                  <div className="de-task-info">
                    <strong>{item.name}</strong>
                    <small>{item.detail}</small>

                    <div className="de-mini-progress">
                      <span style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>

                  <strong className="de-task-count">{item.count}</strong>

                  <span
                    className={cx(
                      "de-task-status",
                      item.pct === 0
                        ? "is-queued"
                        : item.pct === 100
                        ? "is-done"
                        : "is-running"
                    )}
                  >
                    {item.pct === 0
                      ? "Queued"
                      : item.pct === 100
                      ? "Complete"
                      : "Processing"}
                  </span>
                </div>
              ))}
            </section>

            <div className="de-stat-grid">
              <StatCard
                icon={Users}
                label="Duplicates detected"
                value="312"
                note="Merged during cleanup"
                tone="gold"
              />

              <StatCard
                icon={Clock3}
                label="Incomplete records"
                value="214"
                note="Retained for review"
                tone="blue"
              />

              <StatCard
                icon={X}
                label="Invalid / skipped"
                value="47"
                note="Not sent to enrichment"
                tone="rose"
              />
            </div>

            <div className="de-responsible-note">
              <Info size={16} />
              <span>
                This is a frontend demonstration. Progress figures are
                illustrative and are not returned by Apify.
              </span>
            </div>

            {/* RECOVERY STATES */}

            <section className="de-recovery-card">
              <div>
                <span className="de-section-label">RELIABILITY</span>

                <h3>Provider issues &amp; recovery</h3>

                <p>
                  Preview how the interface will explain failed runs,
                  API limits and incomplete results.
                </p>
              </div>

              <button
                type="button"
                className="de-btn de-btn--outline de-btn--sm"
                onClick={() =>
                  setShowRecovery((value) => !value)
                }
              >
                {showRecovery
                  ? "Hide recovery states"
                  : "View recovery states"}

                <ChevronDown size={14} />
              </button>

              {showRecovery && (
                <div className="de-recovery-grid">
                  <article className="de-recovery-item de-recovery-item--error">
                    <strong>
                      <X size={15} />
                      Apify unavailable
                    </strong>

                    <p>
                      We could not read the selected public data source.
                      Your existing records have not been deleted.
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        setNotice(
                          "Retry is a visual demo only. The backend will handle provider retries."
                        )
                      }
                    >
                      Retry collection
                    </button>
                  </article>

                  <article className="de-recovery-item de-recovery-item--warning">
                    <strong>
                      <Info size={15} />
                      Apollo limit reached
                    </strong>

                    <p>
                      Some records were collected but could not be enriched.
                      Keep them and enrich later.
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        setNotice(
                          "You can continue with the collected records in this frontend demo."
                        )
                      }
                    >
                      Continue without enrichment
                    </button>
                  </article>

                  <article className="de-recovery-item">
                    <strong>
                      <CheckCircle2 size={15} />
                      Duplicates merged
                    </strong>

                    <p>
                      Duplicate records are combined where a reliable
                      match is available.
                    </p>
                  </article>

                  <article className="de-recovery-item">
                    <strong>
                      <Search size={15} />
                      No matches found
                    </strong>

                    <p>
                      Try broader keywords, another supported source
                      or a different location.
                    </p>
                  </article>
                </div>
              )}
            </section>

            <div className="de-footer-actions">
              <button
                type="button"
                className="de-btn de-btn--text"
                onClick={() => setStep(0)}
              >
                <ArrowLeft size={16} />
                Edit setup
              </button>

              <span className="de-footer-spacer" />

              <button
                type="button"
                className="de-btn de-btn--outline"
                onClick={() => {
                  setCollecting(false);
                  setNotice(
                    "Demo run paused. Real run controls will be connected to the backend."
                  );
                }}
              >
                <Pause size={15} />
                Pause
              </button>

              <button
                type="button"
                className="de-btn de-btn--outline de-btn--danger"
                onClick={() => {
                  setCollecting(false);
                  setStep(0);
                  setNotice(
                    "Demo run cancelled. No API job was created."
                  );
                }}
              >
                Cancel run
              </button>

              <button
                type="button"
                className="de-btn de-btn--primary"
                onClick={finishDemo}
              >
                Review collected leads
                <ArrowRight size={16} />
              </button>
            </div>
          </>
        )}

        {/* STEP 3: ENRICHED LEADS */}

        {step === 2 && (
          <>
            <div className="de-live-head">
              <div>
                <span className="de-section-label">
                  RUN #03 · REVIEW RESULTS
                </span>

                <h2>Enriched leads</h2>

                <p>
                  Review records collected from public sources and
                  their available enrichment details.
                </p>
              </div>

              <span className="de-run-pill">
                <BadgeCheck size={15} />
                Sample results
              </span>
            </div>

            <div className="de-result-summary">
              <span>
                <strong>{leads.length}</strong> Total records
              </span>

              <span>
                <strong>
                  {leads.filter((l) => l.status === "Enriched").length}
                </strong>
                Enriched
              </span>

              <span>
                <strong>
                  {leads.filter((l) => l.status === "Partial").length}
                </strong>
                Partial
              </span>

              <span>
                <strong>
                  {leads.filter((l) => l.status === "Not found").length}
                </strong>
                Not found
              </span>
            </div>

            <section className="de-card de-leads-card">
              <div className="de-card-heading de-leads-heading">
                <div>
                  <h3>Lead records</h3>
                  <p>
                    Select records to enrich or inspect their available details.
                  </p>
                </div>

                <div className="de-table-actions">
                  <button
                    type="button"
                    className="de-btn de-btn--outline de-btn--sm"
                    onClick={handleExport}
                  >
                    <Download size={14} />
                    Export CSV
                  </button>

                  <button
                    type="button"
                    className="de-btn de-btn--primary de-btn--sm"
                    onClick={enrichSelected}
                    disabled={!selected.length}
                  >
                    <RefreshCw size={14} />
                    Enrich selected ({selected.length})
                  </button>
                </div>
              </div>

              <div className="de-table-toolbar">
                <label className="de-search">
                  <Search size={16} />

                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search name, company or email"
                  />
                </label>

                <button
                  type="button"
                  className="de-filter-btn"
                  onClick={() => setShowFilters((v) => !v)}
                >
                  <SlidersHorizontal size={15} />
                  Filter
                  <ChevronDown size={14} />
                </button>

                {showFilters && (
                  <select
                    className="de-filter-select"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  >
                    <option>All</option>
                    <option>Enriched</option>
                    <option>Partial</option>
                    <option>Not found</option>
                  </select>
                )}
              </div>

              <div className="de-table-wrap">
                <table className="de-table">
                  <thead>
                    <tr>
                      <th>
                        <input
                          type="checkbox"
                          aria-label="Select all visible"
                          checked={
                            filteredLeads.length > 0 &&
                            filteredLeads.every((l) =>
                              selected.includes(l.id)
                            )
                          }
                          onChange={(e) =>
                            setSelected(
                              e.target.checked
                                ? [
                                    ...new Set([
                                      ...selected,
                                      ...filteredLeads.map((l) => l.id),
                                    ]),
                                  ]
                                : selected.filter(
                                    (id) =>
                                      !filteredLeads.some(
                                        (l) => l.id === id
                                      )
                                  )
                            )
                          }
                        />
                      </th>

                      <th>Lead</th>
                      <th>Job title &amp; company</th>
                      <th>Work email</th>
                      <th>Phone</th>
                      <th>Source</th>
                      <th>Status</th>
                      <th>Fit</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredLeads.map((lead) => (
                      <tr
                        key={lead.id}
                        onClick={() => setActiveLead(lead)}
                      >
                        <td onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selected.includes(lead.id)}
                            onChange={() => toggleLead(lead.id)}
                            aria-label={`Select ${lead.name}`}
                          />
                        </td>

                        <td>
                          <div className="de-person">
                            <span>
                              {lead.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)}
                            </span>

                            <strong>{lead.name}</strong>
                          </div>
                        </td>

                        <td>
                          <strong>{lead.role}</strong>
                          <small>{lead.company}</small>
                        </td>

                        <td>{lead.email}</td>
                        <td>{lead.phone}</td>
                        <td>{lead.source}</td>

                        <td>
                          <span
                            className={cx(
                              "de-status",
                              lead.status === "Enriched"
                                ? "is-good"
                                : lead.status === "Partial"
                                ? "is-warn"
                                : "is-missing"
                            )}
                          >
                            {lead.status}
                          </span>
                        </td>

                        <td>
                          <strong className="de-fit">
                            {lead.score}%
                          </strong>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {!filteredLeads.length && (
                  <div className="de-empty">
                    <Search size={22} />
                    <strong>No matching records</strong>
                    <span>
                      Try another name or change the status filter.
                    </span>
                  </div>
                )}
              </div>

              <div className="de-table-foot">
                <span>
                  Showing {filteredLeads.length} of {leads.length} records
                </span>

                <span>
                  Demo data · No external contact lookup performed
                </span>
              </div>
            </section>

            <div className="de-bottom-note">
              <CheckCircle2 size={17} />

              <span>
                Review incomplete records before using them. Apollo may
                not return contact details for every person or organization.
              </span>
            </div>

            <div className="de-footer-actions">
              <button
                type="button"
                className="de-btn de-btn--text"
                onClick={() => setStep(1)}
              >
                <ArrowLeft size={16} />
                Back to progress
              </button>

              <span className="de-footer-spacer" />

              <button
                type="button"
                className="de-btn de-btn--outline"
                onClick={() => setStep(0)}
              >
                <RefreshCw size={14} />
                New collection
              </button>

              <button
                type="button"
                className="de-btn de-btn--primary"
                onClick={() =>
                  setNotice(
                    "Lead Qualification hand-off will be enabled when its backend workflow is implemented."
                  )
                }
              >
                <Target size={15} />
                Continue to Lead Qualification
                <ArrowRight size={16} />
              </button>
            </div>
          </>
        )}

        {/* LEAD DETAILS DRAWER */}

        {activeLead && (
          <div
            className="de-drawer-backdrop"
            onClick={() => setActiveLead(null)}
          >
            <aside
              className="de-drawer"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="de-drawer-head">
                <div>
                  <span className="de-section-label">LEAD DETAILS</span>
                  <h3>{activeLead.name}</h3>
                </div>

                <button
                  type="button"
                  className="de-icon-button"
                  onClick={() => setActiveLead(null)}
                  aria-label="Close details"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="de-drawer-person">
                <span>
                  {activeLead.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </span>

                <div>
                  <strong>{activeLead.role}</strong>
                  <small>{activeLead.company}</small>
                </div>
              </div>

              <div className="de-detail-list">
                {[
                  [Building2, "Company", activeLead.company],
                  [Mail, "Email", activeLead.email],
                  [Users, "Phone", activeLead.phone],
                  [MapPin, "Location", activeLead.location],
                  [Globe2, "Original source", activeLead.source],
                  [BadgeCheck, "Enrichment status", activeLead.status],
                ].map(([Icon, label, value]) => (
                  <div key={label}>
                    <span>
                      <Icon size={15} />
                      {label}
                    </span>

                    <strong>{value}</strong>
                  </div>
                ))}
              </div>

              <div className="de-drawer-tip">
                <Info size={16} />

                Only information available in the source or enrichment
                response should be displayed here. Missing fields must
                remain clearly marked.
              </div>

              <button
                type="button"
                className="de-btn de-btn--primary de-btn--full"
                onClick={() => {
                  setActiveLead(null);
                  setNotice(
                    "Lead detail reviewed. Approval and qualification actions will be wired in a later module."
                  );
                }}
              >
                Done
              </button>
            </aside>
          </div>
        )}

      </div>
    </PanelShell>
  );
}
