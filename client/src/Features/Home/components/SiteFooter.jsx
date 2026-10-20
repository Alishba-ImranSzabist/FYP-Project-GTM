import { Link } from "react-router-dom";
import BrandMark from "../../../Shared_Components/BrandMark";
import { FOOTER_COLUMNS } from "../data/homeContent";

export default function SiteFooter() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <BrandMark tone="light" />
          <p>AI-powered go-to-market growth, with humans always in control.</p>
        </div>

        {FOOTER_COLUMNS.map((col) => (
          <nav key={col.title} className="footer__col" aria-label={col.title}>
            <h4>{col.title}</h4>
            {col.links.map((l) =>
              l.to ? (
                <Link key={l.label} to={l.to}>
                  {l.label}
                </Link>
              ) : (
                <a key={l.label} href={l.href}>
                  {l.label}
                </a>
              )
            )}
          </nav>
        ))}
      </div>

      <div className="container footer__bottom">
        <span>© {new Date().getFullYear()} GTM. All rights reserved.</span>
        <span className="footer__legal">
          <a href="#top">Privacy</a>
          <a href="#top">Terms</a>
        </span>
      </div>
    </footer>
  );
}
