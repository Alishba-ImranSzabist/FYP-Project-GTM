import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import "./Button.css";

/**
 * Reusable button.
 *  variant: "primary" | "accent" | "outline" | "ghost" | "light"
 *  size:    "sm" | "md" | "lg"
 *  to       -> renders a router <Link>;  href -> renders <a>;  otherwise <button>
 *  arrow    -> shows a trailing arrow icon;  icon -> custom leading icon
 *  loading  -> disables the button and shows a spinner
 */
export default function Button({
  children,
  variant = "primary",
  size = "md",
  to,
  href,
  arrow = false,
  icon: Icon,
  loading = false,
  fullWidth = false,
  className = "",
  ...rest
}) {
  const classes = [
    "btn",
    `btn--${variant}`,
    `btn--${size}`,
    fullWidth && "btn--full",
    loading && "is-loading",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      {loading && <span className="btn__spinner" aria-hidden="true" />}
      {Icon && !loading && <Icon size={18} aria-hidden="true" />}
      <span>{children}</span>
      {arrow && <ArrowRight className="btn__arrow" size={18} aria-hidden="true" />}
    </>
  );

  if (to) return <Link to={to} className={classes} {...rest}>{content}</Link>;
  if (href) return <a href={href} className={classes} {...rest}>{content}</a>;
  return (
    <button className={classes} disabled={loading || rest.disabled} {...rest}>
      {content}
    </button>
  );
}
