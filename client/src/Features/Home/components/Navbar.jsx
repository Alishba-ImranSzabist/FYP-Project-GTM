import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import BrandMark from "../../../Shared_Components/BrandMark";
import Button from "../../../Shared_Components/Button";
import { ROUTES } from "../../../constants/routes";
import useScrolled from "../Hooks/useScrolled";
import { NAV_LINKS } from "../data/homeContent";

export default function Navbar() {
  const scrolled = useScrolled();
  const [open, setOpen] = useState(false);

  // lock body scroll while the mobile menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header className={`nav ${scrolled ? "nav--scrolled" : ""} ${open ? "nav--open" : ""}`}>
      <div className="container nav__inner">
        <BrandMark />

        <nav className="nav__links" aria-label="Primary">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} className="nav__link">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="nav__actions">
          <Button to={ROUTES.login} variant="ghost" size="sm">
            Log in
          </Button>
          <Button to={ROUTES.signup} size="sm" arrow>
            Get started
          </Button>
        </div>

        <button
          className="nav__toggle"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div className="nav__drawer" hidden={!open}>
        <nav aria-label="Mobile">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} className="nav__drawer-link" onClick={close}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="nav__drawer-actions">
          <Button to={ROUTES.login} variant="outline" fullWidth onClick={close}>
            Log in
          </Button>
          <Button to={ROUTES.signup} fullWidth arrow onClick={close}>
            Get started
          </Button>
        </div>
      </div>
    </header>
  );
}
