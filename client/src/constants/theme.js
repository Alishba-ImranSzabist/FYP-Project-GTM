import { COLORS, GRADIENTS } from "./colour";
import { FONT_FAMILY, FONT_SIZE, FONT_WEIGHT, LINE_HEIGHT, LETTER_SPACING } from "./typography";
import { RADIUS, SHADOWS, MOTION, LAYOUT } from "./layout";

const kebab = (str) =>
  str
    .replace(/([a-z])([A-Z0-9])/g, "$1-$2")
    .replace(/([0-9])([A-Z])/g, "$1-$2")
    .toLowerCase();

const toVars = (prefix, obj) =>
  Object.entries(obj).map(([key, value]) => `--${prefix}-${kebab(key)}: ${value};`);

/** Builds the :root CSS variables from the JS constants and injects them. Call once in main.jsx. */
export function applyTheme() {
  const css = [
    ...toVars("color", COLORS),
    ...toVars("gradient", GRADIENTS),
    ...toVars("font", FONT_FAMILY),
    ...toVars("text", FONT_SIZE),
    ...toVars("weight", FONT_WEIGHT),
    ...toVars("leading", LINE_HEIGHT),
    ...toVars("tracking", LETTER_SPACING),
    ...toVars("radius", RADIUS),
    ...toVars("shadow", SHADOWS),
    ...toVars("motion", MOTION),
    ...toVars("layout", LAYOUT),
  ].join("\n  ");

  const tag = document.createElement("style");
  tag.id = "gtm-theme";
  tag.textContent = `:root {\n  ${css}\n}`;
  document.head.prepend(tag);
}
