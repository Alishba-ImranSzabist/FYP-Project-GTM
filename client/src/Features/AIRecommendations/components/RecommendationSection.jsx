import {
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  Filter,
  Hash,
  Lightbulb,
  Megaphone,
  Search,
  Users,
} from "lucide-react";
import { AI_RECOMMENDATION_SECTIONS } from "../recommendationSettings.js";

const SECTION_ICONS = {
  audience: Users,
  channels: Megaphone,
  budget: CircleDollarSign,
  content: Lightbulb,
  leadSignals: Search,
  schedule: CalendarClock,
};

const money = (value, currency = "PKR") =>
  `${currency} ${Number(value || 0).toLocaleString("en-US")}`;

function AudienceSection({ section }) {
  return (
    <div className="air-audience-grid">
      {section.items.map((item) => (
        <article className="air-audience-item" key={item.title}>
          <div className="air-audience-item__top">
            <span className="air-item-label">{item.label}</span>
            <strong>{item.match}%</strong>
          </div>
          <h4>{item.title}</h4>
          <p>{item.description}</p>
          <div className="air-progress"><span style={{ width: `${item.match}%` }} /></div>
          <small>{item.reason}</small>
        </article>
      ))}
    </div>
  );
}

function ChannelsSection({ section }) {
  return (
    <div className="air-channel-grid">
      {section.items.map((item) => (
        <article className="air-channel-item" key={item.title}>
          <div className="air-channel-item__top">
            <h4>{item.title}</h4>
            <span className={`air-priority air-priority--${item.priority === "High priority" ? "high" : "normal"}`}>
              {item.priority}
            </span>
          </div>
          <strong>{item.purpose}</strong>
          <p>{item.formats}</p>
          <small>{item.reason}</small>
        </article>
      ))}
    </div>
  );
}

function BudgetSection({ section }) {
  const total = section.allocations.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="air-budget-layout">
      <div className="air-budget-range">
        <span>Suggested total budget range</span>
        <strong>{money(section.range.min, section.currency)} – {money(section.range.max, section.currency)}</strong>
        <div className="air-budget-track" aria-hidden="true"><span /></div>
        <small>Illustrative midpoint: {money(total, section.currency)}</small>
      </div>
      <div className="air-allocation-list">
        {section.allocations.map((item) => (
          <div className="air-allocation" key={item.label}>
            <div className="air-allocation__heading">
              <span>{item.label}</span>
              <strong>{item.percentage}% · {money(item.amount, section.currency)}</strong>
            </div>
            <div className="air-progress"><span style={{ width: `${item.percentage}%` }} /></div>
            <small>{item.purpose}</small>
          </div>
        ))}
      </div>
      <p className="air-inline-note">{section.note}</p>
    </div>
  );
}

function ContentSection({ section }) {
  return (
    <div className="air-content-grid">
      {section.pillars.map((item, index) => (
        <article className="air-content-item" key={item.title}>
          <span className="air-content-item__number">0{index + 1}</span>
          <span className="air-item-label">{item.goal}</span>
          <h4>{item.title}</h4>
          <p>{item.format}</p>
          <strong>Hook</strong>
          <small>{item.hook}</small>
        </article>
      ))}
    </div>
  );
}

function LeadSignalsSection({ section }) {
  return (
    <div className="air-lead-layout">
      <div>
        <h4 className="air-subheading"><Hash size={15} /> Suggested search keywords</h4>
        <div className="air-keyword-list">
          {section.keywords.map((keyword) => <span key={keyword}>{keyword}</span>)}
        </div>
      </div>
      <div>
        <h4 className="air-subheading"><Filter size={15} /> Lead discovery signals</h4>
        <div className="air-signal-list">
          {section.signals.map((signal) => (
            <article key={signal.title}>
              <CheckCircle2 size={16} />
              <div><strong>{signal.title}</strong><p>{signal.description}</p></div>
            </article>
          ))}
        </div>
      </div>
      <p className="air-inline-note">{section.guardrail}</p>
    </div>
  );
}

function ScheduleSection({ section }) {
  return (
    <div className="air-schedule-layout">
      <div className="air-schedule-meta">
        <div><span>Campaign duration</span><strong>{section.duration}</strong></div>
        <div><span>Suggested posting windows</span><strong>{section.windows.join(" · ")}</strong></div>
      </div>
      <div className="air-week-grid">
        {section.weeks.map((week) => (
          <article key={week.week}>
            <span>{week.week}</span>
            <strong>{week.title}</strong>
            <p>{week.detail}</p>
          </article>
        ))}
      </div>
      <p className="air-inline-note">{section.note}</p>
    </div>
  );
}

export default function RecommendationSection({ section }) {
  const meta = AI_RECOMMENDATION_SECTIONS.find((item) => item.id === section.id);
  const Icon = SECTION_ICONS[section.id] || Lightbulb;

  return (
    <section className="pnl-card air-recommendation-section" aria-labelledby={`air-section-${section.id}`}>
      <div className="air-recommendation-section__head">
        <span className="air-section-icon"><Icon size={18} /></span>
        <div>
          <span className="air-kicker">RECOMMENDATION {meta?.number || ""}</span>
          <h3 id={`air-section-${section.id}`}>{meta?.title || section.id}</h3>
          <p>{section.summary}</p>
        </div>
      </div>

      {section.id === "audience" && <AudienceSection section={section} />}
      {section.id === "channels" && <ChannelsSection section={section} />}
      {section.id === "budget" && <BudgetSection section={section} />}
      {section.id === "content" && <ContentSection section={section} />}
      {section.id === "leadSignals" && <LeadSignalsSection section={section} />}
      {section.id === "schedule" && <ScheduleSection section={section} />}
    </section>
  );
}
