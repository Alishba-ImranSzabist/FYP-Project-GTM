import { useState } from "react";
import { Link } from "react-router-dom";
import { Bell, ChevronDown, LogOut, Menu, Search, Settings, User, X } from "lucide-react";
import BrandMark from "../../../Shared_Components/BrandMark";
import { ROUTES } from "../../../constants/routes";

/**
 * App shell for every role panel: dark teal sidebar (brand, workspace, nav,
 * AI credits, account actions) + top bar (search, role chip, bell, avatar).
 * Nav items are visual for now — clicking one only highlights it.
 */
export default function PanelShell({ config, user, onLogout, children }) {
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false); // avatar dropdown
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
            <ChevronDown size={16} aria-hidden="true" />
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

          <button type="button" className="pnl-side__item" onClick={() => setOpen(false)}>
            <Settings size={17} aria-hidden="true" />
            <span>Account settings</span>
          </button>
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

          <label className="pnl-search">
            <Search size={16} aria-hidden="true" />
            <input type="search" placeholder="Search leads, campaigns, messages…" aria-label="Search" />
          </label>

          <div className="pnl__top-right">
            <button type="button" className="pnl-bell" aria-label="Notifications">
              <Bell size={18} />
              <em />
            </button>

            <div className="pnl-userbox">
              <button
                type="button"
                className="pnl-user"
                aria-haspopup="menu"
                aria-expanded={menu}
                onClick={() => setMenu((m) => !m)}
              >
                <span className="pnl-user__avatar">
                  {user?.avatar ? <img src={user.avatar} alt="" /> : initials}
                </span>
                <span className="pnl-user__meta">
                  <strong>{fullName}</strong>
                </span>
                <ChevronDown size={15} aria-hidden="true" />
              </button>

              {menu && (
                <>
                  <div className="pnl-usermenu__backdrop" onClick={() => setMenu(false)} />
                  <div className="pnl-usermenu" role="menu">
                    <div className="pnl-usermenu__head">
                      <strong>{fullName}</strong>
                      <small>{user?.email}</small>
                    </div>
                    <Link
                      to={ROUTES.profile}
                      className="pnl-usermenu__item"
                      role="menuitem"
                      onClick={() => setMenu(false)}
                    >
                      <User size={16} aria-hidden="true" />
                      Profile
                    </Link>
                    <button
                      type="button"
                      className="pnl-usermenu__item pnl-usermenu__item--danger"
                      role="menuitem"
                      onClick={onLogout}
                    >
                      <LogOut size={16} aria-hidden="true" />
                      Log out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="pnl__main">{children}</main>
      </div>
    </div>
  );
}
