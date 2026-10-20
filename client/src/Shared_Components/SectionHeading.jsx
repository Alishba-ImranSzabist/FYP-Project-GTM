import "./SectionHeading.css";

/**
 * Eyebrow + title + description block used at the top of every section.
 *  align: "center" | "left"      tone: "light" (on cream) | "dark" (on teal)
 */
export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  tone = "light",
  as: Tag = "h2",
}) {
  return (
    <header className={`section-heading section-heading--${align} section-heading--${tone}`}>
      {eyebrow && <span className="section-heading__eyebrow">{eyebrow}</span>}
      <Tag className="section-heading__title">{title}</Tag>
      {description && <p className="section-heading__desc">{description}</p>}
    </header>
  );
}
