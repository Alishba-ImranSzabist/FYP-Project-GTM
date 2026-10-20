/** Spacing, radius, shadow, motion and breakpoint tokens (exposed as CSS variables). */

export const RADIUS = Object.freeze({
  xs: "6px",
  sm: "10px",
  md: "14px",
  lg: "20px",
  xl: "28px",
  pill: "999px",
});

export const SHADOWS = Object.freeze({
  xs: "0 1px 2px rgb(26 29 28 / 0.06)",
  sm: "0 2px 8px rgb(26 29 28 / 0.07)",
  md: "0 10px 30px -8px rgb(6 75 71 / 0.16)",
  lg: "0 24px 60px -16px rgb(6 75 71 / 0.28)",
  glow: "0 14px 34px -10px rgb(253 198 79 / 0.65)",
  tealGlow: "0 14px 30px -10px rgb(11 117 111 / 0.55)",
});

export const MOTION = Object.freeze({
  fast: "160ms",
  base: "260ms",
  slow: "600ms",
  ease: "cubic-bezier(0.22, 1, 0.36, 1)",
});

export const LAYOUT = Object.freeze({
  container: "1200px",
  containerNarrow: "880px",
  gutter: "clamp(1.25rem, 4vw, 2.5rem)",
  sectionY: "clamp(4rem, 8vw, 7rem)",
  navHeight: "76px",
});

export const BREAKPOINTS = Object.freeze({
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1280,
});
