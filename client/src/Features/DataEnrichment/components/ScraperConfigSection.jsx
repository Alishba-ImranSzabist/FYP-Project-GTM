import { useState } from "react";
import { AlertCircle, BookOpen, Braces, Check, ChevronDown, Code2, Plus, Save, Trash2 } from "lucide-react";
import useApifyScrapers from "../Hooks/useApifyScrapers";
import "../dataEnrichment.css";

function ScraperCard({ scraper, index, onChange, onRemove, canRemove }) {
  const [showInput, setShowInput] = useState(true);
  const [jsonError, setJsonError] = useState("");

  const update = (field, value) => onChange(scraper.id, { [field]: value });

  const validateJson = () => {
    try {
      const parsed = JSON.parse(scraper.inputJson);
      if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") {
        setJsonError("Actor input must be a JSON object, for example: { }.");
        return false;
      }
      setJsonError("");
      return true;
    } catch (error) {
      setJsonError(`Invalid JSON: ${error.message}`);
      return false;
    }
  };

  return (
    <article className="de-scraper-card">
      <div className="de-scraper-card__top">
        <div className="de-scraper-card__title">
          <span className="de-scraper-number">{index + 1}</span>
          <div>
            <strong>{scraper.name || `Scraper ${index + 1}`}</strong>
            <small>Apify source configuration</small>
          </div>
        </div>
        <div className="de-scraper-card__actions">
          <label className="de-scraper-enabled">
            <input
              type="checkbox"
              checked={scraper.enabled}
              onChange={(event) => update("enabled", event.target.checked)}
            />
            <span>Enabled</span>
          </label>
          {canRemove && (
            <button type="button" className="de-btn de-btn--text de-btn--danger de-btn--sm" onClick={() => onRemove(scraper.id)}>
              <Trash2 size={14}/> Remove
            </button>
          )}
        </div>
      </div>

      <div className="de-scraper-grid">
        <div className="de-scraper-field de-scraper-field--wide">
          <label htmlFor={`scraper-name-${scraper.id}`}>Scraper name</label>
          <input
            id={`scraper-name-${scraper.id}`}
            className="de-input"
            value={scraper.name}
            onChange={(event) => update("name", event.target.value)}
            placeholder="e.g. Instagram profile scraper"
          />
        </div>
        <div className="de-scraper-field de-scraper-field--wide">
          <label htmlFor={`actor-id-${scraper.id}`}>Apify Actor ID / username~actorName</label>
          <input
            id={`actor-id-${scraper.id}`}
            className="de-input"
            value={scraper.actorId}
            onChange={(event) => update("actorId", event.target.value)}
            placeholder="e.g. apify~web-scraper"
          />
          <small>Use the Actor ID or owner~actorName shown in Apify Console.</small>
        </div>
        <div className="de-scraper-field">
          <label htmlFor={`order-${scraper.id}`}>Execution order</label>
          <input
            id={`order-${scraper.id}`}
            className="de-input"
            type="number"
            min="1"
            value={scraper.executionOrder}
            onChange={(event) => update("executionOrder", event.target.value)}
          />
        </div>
        <div className="de-scraper-field">
          <label htmlFor={`max-${scraper.id}`}>Maximum leads</label>
          <input
            id={`max-${scraper.id}`}
            className="de-input"
            type="number"
            min="1"
            max="100000"
            value={scraper.maxLeads}
            onChange={(event) => update("maxLeads", event.target.value)}
          />
        </div>
      </div>

      <div className="de-scraper-input-heading">
        <div>
          <strong><Braces size={15}/> Actor input JSON</strong>
          <small>Paste the input object required by this specific Actor.</small>
        </div>
        <button type="button" className="de-btn de-btn--text de-btn--sm" onClick={() => setShowInput((value) => !value)}>
          {showInput ? "Hide JSON" : "Show JSON"} <ChevronDown size={14}/>
        </button>
      </div>

      {showInput && (
        <div className="de-scraper-json-wrap">
          <textarea
            id={`input-json-${scraper.id}`}
            className={`de-scraper-json ${jsonError ? "has-error" : ""}`}
            spellCheck="false"
            value={scraper.inputJson}
            onChange={(event) => {
              update("inputJson", event.target.value);
              setJsonError("");
            }}
            onBlur={validateJson}
            aria-label={`Actor input JSON for ${scraper.name || "scraper"}`}
          />
          {jsonError && <p className="de-scraper-error"><AlertCircle size={14}/>{jsonError}</p>}
        </div>
      )}
    </article>
  );
}

export default function ScraperConfigSection() {
  const {
    scrapers, updateScraper, addScraper, removeScraper, saveScrapers,
    saveMessage, saveError, isSaving,
  } = useApifyScrapers();

  return (
    <section className="de-card de-scrapers-section">
      <div className="de-card-heading">
        <div>
          <span className="de-section-label">APIFY CONFIGURATION</span>
          <h3>Lead Scrapers</h3>
          <p>Configure one or more Apify Actors. Each Actor can have its own input JSON, execution order and record limit.</p>
        </div>
        <span className="de-provider-mark">Apify</span>
      </div>

      <div className="de-scraper-doc-note">
        <BookOpen size={17}/>
        <span>
          Actor inputs are different for every scraper. Copy the input JSON from that Actor's Apify Console or input schema; there is no single universal scraper JSON.
        </span>
        <a href="https://docs.apify.com/platform/actors/development/actor-definition/input-schema" target="_blank" rel="noreferrer">
          Apify input docs <Code2 size={13}/>
        </a>
      </div>

      <div className="de-scraper-list">
        {scrapers.map((scraper, index) => (
          <ScraperCard
            key={scraper.id}
            scraper={scraper}
            index={index}
            onChange={updateScraper}
            onRemove={removeScraper}
            canRemove={scrapers.length > 1}
          />
        ))}
      </div>

      <div className="de-scraper-footer">
        <button type="button" className="de-btn de-btn--outline" onClick={addScraper}>
          <Plus size={15}/> Add Scraper
        </button>
        <div className="de-scraper-save-area">
          {saveError && <span className="de-scraper-error"><AlertCircle size={14}/>{saveError}</span>}
          {saveMessage && <span className="de-scraper-saved"><Check size={14}/>{saveMessage}</span>}
          <button type="button" className="de-btn de-btn--primary" onClick={saveScrapers} disabled={isSaving}>
            <Save size={15}/> {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
      <p className="de-scraper-security">
        Configuration only in this frontend demo. Apify API tokens must be stored on the server, never in browser code.
      </p>
    </section>
  );
}
