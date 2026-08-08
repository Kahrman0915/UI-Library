/**
 * Chart geometry.
 *
 * Two different kinds of number live here, and the distinction matters:
 *
 * PLOT MECHANICS — margins, tick counts, label limits, the legend gutter. Sized
 * by the text they must hold or by legibility limits, not by the design scale.
 * These have no token and should not have one.
 *
 * DESIGN VALUES that SVG cannot read — a corner radius or a stroke width IS a
 * design-scale value, but path geometry is computed in JS inside a `viewBox`,
 * where `var()` is unavailable. These MIRROR a token and must be kept in step
 * with it; each one names the token it mirrors. If you change one here, change
 * it in `tokens.scss` too, or the chart quietly drifts from the system.
 *
 * Anything genuinely stylable stays in `Chart.scss` and reads `var()` directly
 * (see `.ui-chart__line`, which takes `stroke-width` from `--border-w-300`).
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

/** Mirrors `--rounded-sm` (2px). Was an untokenized 3px. */
export const BAR_RADIUS = 2;
/** Mirrors `--border-w-300` (2px) — the value `.ui-chart__line` reads directly. */
export const LINE_WIDTH = 2;
/** Plot mechanic: sized so a marker clears its own stroke, not from the scale. */
export const MARKER_RADIUS = 4;
/** Gap between a line's end marker and its label. Mirrors `--p-1-5` (6px). */
export const END_LABEL_GAP = 6;
/**
 * Minimum vertical separation between two end labels before the declutter pass
 * pushes one down. Plot mechanic: it is a function of the label's line-height,
 * not of the spacing scale — a label a few px off its own line still points at
 * it unambiguously, but two overlapping labels are unreadable.
 */
export const END_LABEL_MIN_GAP = 13;
/** WCAG 2.5.8 — the hit target is always bigger than the mark. */
export const MIN_HIT_TARGET = 24;
