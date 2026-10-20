import { useState } from "react";
import { Link } from "react-router-dom";
import { LogOut, Menu, Settings, User, X } from "lucide-react";
import BrandMark from "../../../Shared_Components/BrandMark";
import { ROUTES } from "../../../constants/routes";

/**
 * App shell for every role panel: dark teal sidebar (brand, workspace, nav,
 * AI credits, account actions) + slim top bar (round avatar, profile & logout
 * icon buttons — no dropdown, no search/bell).
 */
export default function PanelShell({ config, user, onLogout, children }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(config.nav[0].items[0].label);

  const fullName = user?.fullName || "User";
  const initials = fullName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const wsName = user?.companyName || "GTM workspace";
  const wsInitials = wsName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="pnl">
      {open && <div className="pnl__overlay" onClick={() => setOpen(false)} />}

      <aside className={`pnl__side ${open ? "is-open" : ""}`}>
        <div className="pnl-side__top">
          <BrandMark tone="light" size="md" linked={false} />
          <div className="pnl-side__ws">
            <span className="pnl-side__ws-icon">{wsInitials}</span>
            <span className="pnl-side__ws-text">
              <strong>{wsName}</strong>
              <small>Workspace</small>
            </span>
          </div>
        </div>

        <nav className="pnl-side__nav" aria-label="Panel">
          {config.nav.map((sec) => (
            <div className="pnl-side__group" key={sec.section}>
              <span className="pnl-side__label">{sec.section}</span>
              <ul>
                {sec.items.map((it) => (
                  <li key={it.label}>
                    <button
                      type="button"
                      className={`pnl-side__item ${active === it.label ? "is-active" : ""}`}
                      onClick={() => {
                        setActive(it.label);
                        setOpen(false);
                      }}
                    >
                      <it.icon size={17} aria-hidden="true" />
                      <span>{it.label}</span>
                      {it.badge ? <em className="pnl-side__badge">{it.badge}</em> : null}
                      {it.dot ? <em className="pnl-side__dot" /> : null}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="pnl-side__foot">
          <div className="pnl-credits">
            <div className="pnl-credits__row">
              <span>AI credits</span>
              <strong>742 / 1,000</strong>
            </div>
            <div className="pnl-credits__bar">
              <span style={{ width: "74.2%" }} />
            </div>
            <button type="button" className="pnl-credits__link">
              View plan
            </button>
          </div>

          <Link to={ROUTES.profile} className="pnl-side__item" onClick={() => setOpen(false)}>
            <Settings size={17} aria-hidden="true" />
            <span>Account settings</span>
          </Link>
          <button type="button" className="pnl-side__item" onClick={onLogout}>
            <LogOut size={17} aria-hidden="true" />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      <div className="pnl__col">
        <header className="pnl__top">
          <button
            type="button"
            className="pnl__menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="pnl__top-right">
            <span className="pnl-user">
              <span className="pnl-user__avatar">
                {user?.avatar ? <img src={user.avatar} alt="" /> : initials}
              </span>
              <span className="pnl-user__meta">
                <strong>{fullName}</strong>
                <small>{config.roleLabel}</small>
              </span>
            </span>

            <Link
              to={ROUTES.profile}
              className="pnl-iconbtn pnl-iconbtn--teal"
              title="Profile"
              aria-label="Profile"
            >
              <User size={18} aria-hidden="true" />
            </Link>
            <button
              type="button"
              className="pnl-iconbtn pnl-iconbtn--danger"
              onClick={onLogout}
              title="Log out"
              aria-label="Log out"
            >
              <LogOut size={18} aria-hidden="true" />
            </button>
          </div>
        </header>

        <main className="pnl__main">{children}</main>
      </div>
    </div>
  );
}
