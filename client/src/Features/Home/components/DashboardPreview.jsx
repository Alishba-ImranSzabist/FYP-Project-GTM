import { Bell, CheckCircle2, Mail, Sparkles, TrendingUp, Users, LayoutGrid, Radar, Send, BarChart3 } from "lucide-react";

const STATS = [
  { icon: Users, label: "Qualified leads", value: "1,284", delta: "+18.2%" },
  { icon: Mail, label: "Reply rate", value: "18.7%", delta: "+3.2%" },
  { icon: TrendingUp, label: "Campaign ROI", value: "324%", delta: "+42.8%" },
];

const SIDE_ICONS = [LayoutGrid, Radar, Send, BarChart3];

/** Decorative product mock for the hero. All figures are sample data. */
export default function DashboardPreview() {
  return (
    <div className="preview" aria-hidden="true">
      <div className="preview__chip preview__chip--top">
        <span className="preview__chip-icon">
          <Sparkles size={16} />
        </span>
        <div>
          <strong>24 strong leads found</strong>
          <small>Ready for your review</small>
        </div>
        <CheckCircle2 size={18} className="preview__chip-check" />
      </div>

      <div className="preview__window">
        <aside className="preview__side">
          {SIDE_ICONS.map((Icon, i) => (
            <span key={i} className={`preview__side-dot ${i === 0 ? "is-active" : ""}`}>
              <Icon size={15} />
            </span>
          ))}
        </aside>

        <div className="preview__main">
          <div className="preview__topbar">
            <span className="preview__sample">Sample data</span>
            <Bell size={16} />
            <span className="preview__avatar">JL</span>
          </div>

          <p className="preview__kicker">Campaign overview</p>
          <h3 className="preview__greeting">Good morning, Jordan</h3>

          <div className="preview__stats">
            {STATS.map(({ icon: Icon, label, value, delta }) => (
              <div className="preview__stat" key={label}>
                <span className="preview__stat-icon">
                  <Icon size={15} />
                </span>
                <small>{label}</small>
                <strong>{value}</strong>
                <em>{delta}</em>
              </div>
            ))}
          </div>

          <div className="preview__chart">
            <div className="preview__chart-head">
              <strong>Pipeline performance</strong>
              <small>Last 30 days</small>
            </div>
            <svg viewBox="0 0 400 140" preserveAspectRatio="none" className="preview__svg">
              <defs>
                <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-teal-500)" stopOpacity="0.32" />
                  <stop offset="100%" stopColor="var(--color-teal-500)" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[35, 70, 105].map((y) => (
                <line key={y} x1="0" x2="400" y1={y} y2={y} className="preview__grid" />
              ))}
              <path
                d="M0 118 C40 112 60 98 95 100 S150 84 185 70 S240 92 270 78 S330 40 360 34 S390 22 400 16 V140 H0 Z"
                fill="url(#chartFill)"
              />
              <path
                className="preview__line"
                d="M0 118 C40 112 60 98 95 100 S150 84 185 70 S240 92 270 78 S330 40 360 34 S390 22 400 16"
                fill="none"
                stroke="var(--color-primary)"
                strokeWidth="3"
                strokeLinecap="round"
                pathLength="1"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="preview__chip preview__chip--bottom">
        <span className="preview__chip-icon preview__chip-icon--soft">
          <Users size={16} />
        </span>
        <div>
          <small>Human approval</small>
          <strong>Campaign ready to launch</strong>
        </div>
        <span className="preview__approve">
          <CheckCircle2 size={14} /> Approve
        </span>
      </div>
    </div>
  );
}
