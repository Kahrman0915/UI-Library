/**
 * Chart geometry. Pixels, not tokens, because these are plot mechanics rather
 * than design values — an axis gutter is sized by the text it must hold, and
 * SVG has no access to the token scale from inside a `viewBox`.
 */

export const DEFAULT_WIDTH = 640;
/** OUTER height — plot + x-axis band + legend gutter. */
export const DEFAULT_HEIGHT = 260;

export const MARGIN = {
  top: 12,
  /** Room for the x-axis labels. Excluded from the plot, never from `height`. */
  bottom: 28,
  /** Room for y-axis values. Widened at runtime for long formatted numbers. */
  left: 44,
  right: 12,
} as const;

export const LEGEND_HEIGHT = 28;
export const Y_TICK_COUNT = 5;
/** Beyond this, x labels thin rather than rotate — rotated axis text reads slower. */
export const MAX_X_LABELS = 8;
/** Past this many categories, line markers become a caterpillar. */
export const MARKER_LIMIT = 24;

export const BAR_RADIUS = 3;
export const LINE_WIDTH = 2;
export const MARKER_RADIUS = 4;
/** WCAG 2.5.8 — the hit target is always bigger than the mark. */
export const MIN_HIT_TARGET = 24;
