import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, BadgeCheck, Bookmark, Check, CheckCircle2,
  ChevronRight, Clock3, ExternalLink, Filter, Mail, MapPin, Pause,
  Play, Search, Send, SlidersHorizontal, Sparkles, Target, Users, Video, X,
} from "lucide-react";
import useAuth from "../../Auth/Hooks/useAuth";
import PanelShell from "../../Panel/components/PanelShell";
import { PANEL_CONFIG } from "../../Panel/panelConfig";
import { ROUTES, USER_ROLES } from "../../../constants/routes";
import useOpportunities from "../Hooks/useOpportunities";
import OpportunityStepNav from "../Components/OpportunityStepNav";
import OpportunityEmptyState from "../Components/OpportunityEmptyState";
import "../Opportunities.css";

const cx = (...values) => values.filter(Boolean).join(" ");

export default function OpportunitiesPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const data = useOpportunities();
  const config = PANEL_CONFIG[USER_ROLES.serviceProvider];

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.home, { replace: true });
  };

  const stepItems = [
    ["model", "AI setup"],
    ["scanning", "Discover"],
    ["results", "Opportunities"],
    ["contact", "Find contact"],
  ];
  const activeIndex = stepItems.findIndex(([key]) => key === data.stage);

  return (
    <PanelShell config={config} user={user} onLogout={handleLogout}>
      <div className="opp-page">
        <header className="opp-heading">
          <div>
            <span className="opp-eyebrow">SERVICE PROVIDER WORKSPACE</span>
            <h1>{data.stage === "model" ? "Discover opportunities" :
              data.stage === "scanning" ? "Finding opportunities" :
              data.stage === "contact" ? "Find contact" : "Opportunities"}</h1>
            <p>Find public requests that match your services, review the evidence and decide what to do next.</p>
          </div>
          <span className="opp-live-pill"><span /> {data.status === "complete" ? "Scan complete" : "Demo workspace"}</span>
        </header>

        <OpportunityStepNav stage={data.stage} />

        {data.notice && <div className="opp-notice" role="status"><CheckCircle2 size={17}/>{data.notice}<button onClick={() => data.setNotice("")} aria-label="Dismiss"><X size={15}/></button></div>}

        {data.stage === "model" && (
          <>
            <section className="opp-intro">
              <div><span className="opp-kicker"><Sparkles size={14}/> AI-POWERED DISCOVERY</span>
                <h2>AI opportunity matching</h2>
                <p>Gemini reviews public posts and stories for opportunities related to your service.</p>
              </div>
              <div className="opp-intro-icon"><Target size={34}/></div>
            </section>

            <section className="opp-card opp-service-summary">
              <div className="opp-card-head">
                <div><span className="opp-label">YOUR ACTIVE SERVICE</span><h3>{data.service}</h3></div>
                <div className="opp-service-actions">
                  <button className="opp-link-btn" onClick={() => navigate(ROUTES.services)}>Edit service <ExternalLink size={14}/></button>
                  <button className="opp-config-btn" onClick={() => navigate(ROUTES.opportunityApifyScrapers)}><SlidersHorizontal size={14}/> Configure Apify scrapers</button>
                </div>
              </div>
              <div className="opp-tags"><span>Video editing</span><span>Short films</span><span>Colour grading</span><span>Part-time</span><span>Urdu, English</span></div>
            </section>

            <section className="opp-model-card opp-model-card--single is-selected" aria-label="Selected AI model: Gemini">
              <div className="opp-model-top">
                <span className="opp-model-icon"><Sparkles size={19}/></span>
                <span className="opp-selected-label"><CheckCircle2 size={15}/> Selected model</span>
              </div>
              <span className="opp-recommend">GEMINI · POWERED DISCOVERY</span>
              <h3>Gemini</h3>
              <p>Google Gemini · Your platform AI model</p>
              <ul>
                <li>Reviews relevant public posts and stories</li>
                <li>Explains why each opportunity matches your service</li>
                <li>Helps prioritise promising leads for your review</li>
              </ul>
              <div className="opp-model-meta">
                <span><strong>Provider</strong> Google</span>
                <span><strong>Model choice</strong> Managed by platform</span>
              </div>
              <small>AI matching is a recommendation. Review each result before taking action.</small>
            </section>

            <div className="opp-privacy"><CheckCircle2 size={16}/> We scan publicly available posts. You approve every message before it is sent. Gemini is the only AI model configured for opportunity matching.</div>
            <div className="opp-actions"><button className="opp-btn opp-btn--ghost" onClick={() => navigate(ROUTES.services)}><ArrowLeft size={16}/> Back to My Services</button><button className="opp-btn opp-btn--primary" onClick={data.startScan}><Search size={16}/> Find opportunities <ArrowRight size={16}/></button></div>
          </>
        )}

        {data.stage === "scanning" && (
          <section className="opp-card opp-scan">
            <span className="opp-scan-icon"><Search size={25}/></span>
            <span className="opp-eyebrow">DISCOVERY RUN · DEMO</span>
            <h2>Finding opportunities</h2>
            <p>Scanning public posts and stories for requests related to <strong>{data.service}</strong>.</p>
            <div className="opp-scan-stats"><div><strong>12,480</strong><span>Public posts scanned</span></div><div><strong>86</strong><span>Possible opportunities</span></div><div><strong>24</strong><span>High matches (80+)</span></div></div>
            <div className="opp-provider-progress">
              <div><span className="opp-provider-logo"><Search size={17}/></span><div><strong>Apify</strong><small>Reading public posts and stories</small></div><em>Scanning</em></div>
              <div className="opp-progress"><span style={{width:"82%"}}/></div><small>82% complete · illustrative demo progress</small>
            </div>
            <div className="opp-provider-progress">
              <div><span className="opp-provider-logo opp-provider-logo--ai"><Sparkles size={17}/></span><div><strong>AI matching</strong><small>Scoring posts against your service</small></div><em>Scoring</em></div>
              <div className="opp-progress"><span style={{width:"75%"}}/></div>
              <small>75% complete · illustrative demo progress</small>
            </div>
            <div className="opp-actions"><button className="opp-btn opp-btn--ghost" onClick={() => data.setStage("model")}><ArrowLeft size={16}/> Back to model</button><button className="opp-btn opp-btn--outline" onClick={() => data.setNotice("Pause is a visual demo control; no live Apify task is running.")}><Pause size={15}/> Pause</button><button className="opp-btn opp-btn--primary" onClick={data.finishScan}>View opportunities <ArrowRight size={16}/></button></div>
          </section>
        )}

        {data.stage === "results" && (
          <>
            <div className="opp-results-top"><div><span className="opp-eyebrow">DISCOVERY RESULTS</span><h2>Opportunities</h2><p>Review public posts and stories that may need your service. AI scores are suggestions, not guarantees.</p></div><span className="opp-run-tag">Run #03 · Demo</span></div>
            <div className="opp-stats"><div><strong>12,480</strong><span>Public posts scanned</span></div><div><strong>86</strong><span>Possible opportunities</span></div><div><strong>24</strong><span>High matches (80+)</span></div></div>
            <div className="opp-results-layout">
              <section className="opp-results-list">
                <div className="opp-toolbar">
                  <div className="opp-tabs"><button className="is-active">All types</button><button onClick={() => data.setFilter("Collaboration")}>Collaboration</button><button onClick={() => data.setFilter("Public post")}>Public post</button></div>
                  <label className="opp-search"><Search size={15}/><input value={data.search} onChange={(e) => data.setSearch(e.target.value)} placeholder="Search opportunities"/></label>
                </div>
                {data.filtered.map((item) => (
                  <article className="opp-result-card" key={item.id}>
                    <div className="opp-avatar">{item.name.split(" ").map((x) => x[0]).slice(0,2).join("")}</div>
                    <div className="opp-result-main">
                      <div className="opp-result-title"><div><h3>{item.name}</h3><small>{item.handle} · {item.posted}</small></div><span className={cx("opp-score", item.match < 80 && "is-medium")}>{item.match}<small> match</small></span></div>
                      <p className="opp-result-category">{item.category} · <MapPin size={12}/> {item.location}</p>
                      <blockquote>“{item.quote}”</blockquote>
                      <div className="opp-tags">{item.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
                      <div className="opp-why"><strong>WHY IT MATCHES</strong><ul>{item.reason.slice(0,2).map((reason) => <li key={reason}>{reason}</li>)}</ul></div>
                      <div className="opp-result-actions"><button className="opp-btn opp-btn--primary opp-btn--small" onClick={() => data.openContact(item)}><Mail size={14}/> Find contact</button><button className="opp-btn opp-btn--outline opp-btn--small" onClick={() => data.saveOpportunity(item.id)}><Bookmark size={14}/> {item.saved ? "Saved" : "Save"}</button></div>
                    </div>
                  </article>
                ))}
                {!data.filtered.length && <OpportunityEmptyState />}
              </section>
              <aside className="opp-side-card"><span className="opp-label">YOUR SERVICE</span><h3><Video size={17}/> Video editing</h3><p>Reels, short films and colour grading</p><div className="opp-divider"/><span className="opp-label">MATCH SUMMARY</span><div className="opp-summary-row"><span>High match</span><strong>24</strong></div><div className="opp-summary-row"><span>Medium match</span><strong>38</strong></div><div className="opp-summary-row"><span>Needs review</span><strong>24</strong></div><button className="opp-btn opp-btn--outline opp-btn--full" onClick={() => data.setStage("model")}>Run another scan</button></aside>
            </div>
            <div className="opp-actions"><button className="opp-btn opp-btn--ghost" onClick={() => data.setStage("model")}><ArrowLeft size={16}/> Back to model</button><span/><button className="opp-btn opp-btn--primary" onClick={() => data.setNotice("Select an opportunity and choose Find contact to continue.")}>Review selected <ArrowRight size={16}/></button></div>
          </>
        )}

        {data.stage === "contact" && data.active && (
          <>
            <div className="opp-results-top"><div><span className="opp-eyebrow">APOLLO CONTACT ENRICHMENT</span><h2>Find contact</h2><p>Review available public and enriched contact details before deciding whether to reach out.</p></div><button className="opp-btn opp-btn--outline" onClick={data.backToResults}><ArrowLeft size={15}/> Back to opportunities</button></div>
            <div className="opp-contact-grid">
              <section className="opp-card opp-contact-card">
                <div className="opp-contact-provider"><span className="opp-provider-logo"><CheckCircle2 size={17}/></span><strong>Contact found</strong><span>Demo data</span></div>
                <div className="opp-contact-person"><div className="opp-avatar opp-avatar--large">{data.active.name.split(" ").map((x) => x[0]).slice(0,2).join("")}</div><div><h3>{data.active.name}</h3><p>{data.active.category}</p><small>{data.active.handle}</small></div></div>
                <div className="opp-contact-fields"><div><span>Organization / profile</span><strong>{data.active.name}</strong></div><div><span>Work email</span><strong>{data.active.email || "Not found"}</strong></div><div><span>Phone</span><strong>{data.active.phone || "Not available"}</strong></div><div><span>Location</span><strong>{data.active.location}</strong></div></div>
                <div className="opp-confidence"><span>Opportunity match confidence</span><strong>{data.active.match}%</strong><div className="opp-progress"><span style={{width:`${data.active.match}%`}}/></div></div>
                <div className="opp-actions"><button className="opp-btn opp-btn--outline" onClick={data.backToResults}>Save for later</button><button className="opp-btn opp-btn--primary" onClick={() => data.setNotice("Outreach drafting will be connected after contact review and backend integration.")}><Send size={15}/> Draft outreach</button></div>
              </section>
              <aside className="opp-card opp-contact-status"><span className="opp-label">APOLLO LOOKUP</span><h3>Contact enrichment</h3><div className="opp-status-line"><CheckCircle2 size={16}/><span>Opportunity selected</span><strong>Done</strong></div><div className="opp-status-line"><CheckCircle2 size={16}/><span>Profile reviewed</span><strong>Done</strong></div><div className="opp-status-line"><Clock3 size={16}/><span>Contact verification</span><strong>Pending</strong></div><div className="opp-privacy"><CheckCircle2 size={15}/> Only available contact fields are shown. Missing information is not fabricated.</div></aside>
            </div>
          </>
        )}
      </div>
    </PanelShell>
  );
}
