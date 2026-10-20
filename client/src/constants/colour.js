/**
 * GTM colour system, the single source of truth for every colour on the site.
 *
 * - Edit values HERE only. They are injected into CSS as variables
 *   (e.g. COLORS.primaryHover -> var(--color-primary-hover)) by constants/theme.js
 * - In CSS use:      color: var(--color-primary);
 * - In JS/JSX use:   import { COLORS } from "../constants/colour";
 *
 * Palette: Teal (brand) · Sun yellow (accent) · Cream (backgrounds) · Charcoal (text)
 */

export const alpha = (hex, opacity) => {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgb(${r} ${g} ${b} / ${opacity})`;
};

/* ---------- Base scales ---------- */
const TEAL = {
  50: "#EDF7F5",
  100: "#D2ECE7",
  200: "#A5D9D0",
  300: "#6CBDB1",
  400: "#33998C",
  500: "#0F8479",
  600: "#0B756F",
  700: "#085F5A",
  800: "#064B47",
  900: "#04383A",
  950: "#022A2C",
};

const SUN = {
  50: "#FFF8E6",
  100: "#FFEFC4",
  200: "#FFE29B",
  300: "#FFD479",
  400: "#FDC64F",
  500: "#F2B027",
  600: "#D8921A",
};

const CREAM = {
  50: "#FDFBF6",
  100: "#F8F4EA",
  200: "#EFE9D8",
  300: "#E2DAC3",
};

const CHARCOAL = {
  50: "#F3F4F3",
  100: "#E4E6E4",
  200: "#C9CDC9",
  300: "#9EA49F",
  400: "#757C77",
  500: "#575D59",
  600: "#444946",
  700: "#363A38",
  800: "#272A29",
  900: "#1A1D1C",
};

const scale = (prefix, obj) =>
  Object.fromEntries(Object.entries(obj).map(([k, v]) => [`${prefix}${k}`, v]));

/* ---------- Semantic colours (use these in components) ---------- */
export const COLORS = Object.freeze({
  // raw scales: teal50 … teal950, sun50 … sun600, cream50 … cream300, charcoal50 … charcoal900
  ...scale("teal", TEAL),
  ...scale("sun", SUN),
  ...scale("cream", CREAM),
  ...scale("charcoal", CHARCOAL),

  white: "#FFFFFF",
  black: "#000000",
  transparent: "transparent",

  // Brand
  primary: TEAL[600],
  primaryHover: TEAL[700],
  primaryActive: TEAL[800],
  primaryDeep: TEAL[900],
  primaryDarkest: TEAL[950],
  primaryBright: TEAL[400],
  primarySoft: TEAL[50],
  primaryTint: TEAL[100],

  // Accent (sun yellow)
  accent: SUN[400],
  accentHover: SUN[500],
  accentDeep: SUN[600],
  accentSoft: SUN[100],
  accentTint: SUN[50],

  // Surfaces
  bg: CREAM[50],
  bgAlt: CREAM[100],
  bgWarm: CREAM[200],
  surface: "#FFFFFF",
  surfaceMuted: CREAM[100],
  border: alpha(CHARCOAL[900], 0.1),
  borderStrong: alpha(CHARCOAL[900], 0.18),

  // Text
  ink: CHARCOAL[900],
  heading: CHARCOAL[800],
  body: CHARCOAL[600],
  muted: CHARCOAL[500],
  subtle: CHARCOAL[400],
  textOnDark: "#FFFFFF",
  textOnDarkMuted: alpha("#FFFFFF", 0.78),
  textOnDarkSubtle: alpha("#FFFFFF", 0.6),

  // Feedback
  success: "#16845B",
  successSoft: "#E3F4EC",
  danger: "#C73E3E",
  dangerSoft: "#FCEAEA",
  warning: "#B7791F",
  warningSoft: "#FDF3DC",
  info: "#2C6CB0",
  infoSoft: "#E5EFFA",

  // Overlays
  whiteOverlay04: alpha("#FFFFFF", 0.04),
  whiteOverlay07: alpha("#FFFFFF", 0.07),
  whiteOverlay10: alpha("#FFFFFF", 0.1),
  whiteOverlay18: alpha("#FFFFFF", 0.18),
  whiteOverlay30: alpha("#FFFFFF", 0.3),
  glass: alpha(CREAM[50], 0.82),

  // Shadow tints
  shadowTeal: alpha(TEAL[800], 0.18),
  shadowTealSoft: alpha(TEAL[800], 0.08),
  shadowInk: alpha(CHARCOAL[900], 0.1),
  shadowInkSoft: alpha(CHARCOAL[900], 0.06),
  yellowGlow: alpha(SUN[400], 0.35),
  tealGlow: alpha(TEAL[500], 0.28),
});

/* ---------- Gradients (exposed as --gradient-*) ---------- */
export const GRADIENTS = Object.freeze({
  hero: `radial-gradient(900px 500px at 85% -10%, ${alpha(SUN[300], 0.45)}, transparent 60%),
         radial-gradient(800px 520px at -10% 10%, ${alpha(TEAL[200], 0.55)}, transparent 60%),
         linear-gradient(180deg, ${CREAM[50]} 0%, ${CREAM[100]} 100%)`,
  teal: `linear-gradient(135deg, ${TEAL[600]} 0%, ${TEAL[800]} 60%, ${TEAL[900]} 100%)`,
  tealDeep: `linear-gradient(160deg, ${TEAL[700]} 0%, ${TEAL[900]} 70%, ${TEAL[950]} 100%)`,
  sun: `linear-gradient(135deg, ${SUN[300]} 0%, ${SUN[400]} 55%, ${SUN[500]} 100%)`,
  cta: `linear-gradient(135deg, ${SUN[200]} 0%, ${SUN[300]} 50%, ${SUN[400]} 100%)`,
  chartFill: `linear-gradient(180deg, ${alpha(TEAL[500], 0.28)} 0%, ${alpha(TEAL[500], 0)} 100%)`,
  footer: `linear-gradient(135deg, ${TEAL[900]} 0%, ${CHARCOAL[800]} 100%)`,
});

// Handy aliases for old code that used COLORS.sage etc.
export const SOFT_TEAL = TEAL[100];
