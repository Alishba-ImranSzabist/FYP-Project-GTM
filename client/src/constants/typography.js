/**
 * GTM typography tokens. Injected into CSS by constants/theme.js
 * (FONT_FAMILY.display -> var(--font-display), FONT_SIZE.lg -> var(--text-lg), ...)
 *
 * Fonts are loaded in client/index.html (Google Fonts).
 */

export const FONT_FAMILY = Object.freeze({
  display: "'Bricolage Grotesque', 'Plus Jakarta Sans', system-ui, sans-serif",
  body: "'Plus Jakarta Sans', system-ui, -apple-system, 'Segoe UI', sans-serif",
  mono: "ui-monospace, 'SF Mono', Menlo, Consolas, monospace",
});

export const FONT_SIZE = Object.freeze({
  xs: "0.75rem",
  sm: "0.875rem",
  base: "1rem",
  md: "1.0625rem",
  lg: "1.1875rem",
  xl: "1.375rem",
  "2xl": "clamp(1.5rem, 1.1rem + 1.2vw, 1.875rem)",
  "3xl": "clamp(1.875rem, 1.3rem + 1.9vw, 2.75rem)",
  "4xl": "clamp(2.25rem, 1.4rem + 3vw, 3.5rem)",
  display: "clamp(2.5rem, 1.2rem + 3.8vw, 4.25rem)",
});

export const FONT_WEIGHT = Object.freeze({
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
});

export const LINE_HEIGHT = Object.freeze({
  tight: 1.08,
  snug: 1.25,
  normal: 1.55,
  relaxed: 1.72,
});

export const LETTER_SPACING = Object.freeze({
  tight: "-0.03em",
  snug: "-0.015em",
  normal: "0",
  wide: "0.08em",
  wider: "0.14em",
});
