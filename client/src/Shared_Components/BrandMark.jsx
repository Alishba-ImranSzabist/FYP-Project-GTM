import { Link } from "react-router-dom";
import { ROUTES } from "../constants/routes";
import "./BrandMark.css";

/**
 * GTM logo. `tone="dark"` for light backgrounds, `tone="light"` for teal / dark backgrounds.
 * `size`: "sm" | "md" | "lg"
 */
export default function BrandMark({ tone = "dark", size = "md", linked = true }) {
  const mark = (
    <span className={`brand brand--${tone} brand--${size}`} aria-label="GTM">
      <span className="brand__gt">GT</span>
      <span className="brand__m">M</span>
    </span>
  );

  return linked ? (
    <Link to={ROUTES.home} className="brand-link" aria-label="GTM home">
      {mark}
    </Link>
  ) : (
    mark
  );
}
