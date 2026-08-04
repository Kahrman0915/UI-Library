/**
 * Stacking and domain derivation for multi-series charts.
 *
 * Pure, dependency-free — see the note at the top of `scale.ts`.
 */

export type StackedPoint = {
  /** Lower edge in DATA units. */
  y0: number;
  /** Upper edge in DATA units. */
  y1: number;
  /** The original value, or null for a gap. */
  value: number | null;
};

export type StackOffset = 'zero' | 'expand';

/**
 * Stack series into [y0, y1] bands, one array per series.
 *
 * MIXED SIGNS ARE HANDLED, and they are the whole reason this isn't a running
 * sum: positives stack upward from zero and negatives stack downward from zero,
 * independently, in the same category. A naive accumulator puts a -5 on top of
 * a +10 and reports 5, which draws a bar that means nothing.
 *
 * `expand` normalises each category to ±1 (100% stacked) using the sum of
 * ABSOLUTE values, so a category mixing +8 and -2 splits 80/20 rather than
 * dividing by 6 and overflowing the axis.
 *
 * A null stays null and contributes nothing, but does NOT break the stack — the
 * series above it simply sits lower for that category.
 */
export function stackSeries(
  series: readonly (readonly (number | null)[])[],
  opts: { offset?: StackOffset } = {},
): StackedPoint[][] {
  const offset = opts.offset ?? 'zero';
  const seriesCount = series.length;
  if (seriesCount === 0) return [];
  const categoryCount = series.reduce((max, s) => Math.max(max, s.length), 0);

  const out: StackedPoint[][] = series.map(() => []);

  for (let c = 0; c < categoryCount; c++) {
    let totalAbs = 0;
    if (offset === 'expand') {
      for (let s = 0; s < seriesCount; s++) {
        const v = series[s][c];
        if (v !== null && v !== undefined && Number.isFinite(v)) totalAbs += Math.abs(v);
      }
    }

    let up = 0;
    let down = 0;
    for (let s = 0; s < seriesCount; s++) {
      const raw = series[s][c];
      const missing = raw === null || raw === undefined || !Number.isFinite(raw);
      if (missing) {
        out[s].push({ y0: up, y1: up, value: null });
        continue;
      }
      // Guard the zero-sum category, or expand emits NaN and the band vanishes.
      const v = offset === 'expand' ? (totalAbs === 0 ? 0 : (raw as number) / totalAbs) : (raw as number);
      if (v < 0) {
        out[s].push({ y0: down + v, y1: down, value: raw as number });
        down += v;
      } else {
        out[s].push({ y0: up, y1: up + v, value: raw as number });
        up += v;
      }
    }
  }

  return out;
}

/**
 * The y domain a set of series needs.
 *
 * `grouped` is the plain min/max across all values; `stacked` measures the
 * stacked bands, which is a different and usually larger number.
 *
 * Zero is ALWAYS included. A bar chart whose axis starts at 40 exaggerates
 * every difference on it — the single most common way a chart misleads. Line
 * charts may legitimately want a zoomed axis, which is what the explicit
 * `yDomain` prop is for; this default stays honest.
 */
export function seriesExtent(
  series: readonly (readonly (number | null)[])[],
  mode: 'grouped' | 'stacked' = 'grouped',
  offset: StackOffset = 'zero',
): [number, number] {
  let min = 0;
  let max = 0;

  if (mode === 'stacked') {
    for (const s of stackSeries(series, { offset })) {
      for (const p of s) {
        if (p.value === null) continue;
        if (p.y0 < min) min = p.y0;
        if (p.y1 < min) min = p.y1;
        if (p.y0 > max) max = p.y0;
        if (p.y1 > max) max = p.y1;
      }
    }
  } else {
    for (const s of series) {
      for (const v of s) {
        if (v === null || v === undefined || !Number.isFinite(v)) continue;
        if (v < min) min = v;
        if (v > max) max = v;
      }
    }
  }

  // An all-zero (or empty) dataset would give a zero-width domain; linearScale
  // survives that, but the axis would have no ticks. Give it a unit range.
  return min === 0 && max === 0 ? [0, 1] : [min, max];
}
