/**
 * Value-to-colour scales — the ORDERED counterpart to `series.ts`.
 *
 * `series.ts` answers "which series is this", and hands every datum in a series
 * the same slot. That is correct for categorical data and wrong for ordered
 * data, where the colour is supposed to encode the VALUE rather than the
 * membership.
 *
 * Building an ordered encoding out of categorical series — one series per bin,
 * nulls elsewhere — looks like it works and does not. In a grouped layout each
 * series owns its own sub-band, so the bars drift horizontally by series index
 * and stop sitting under their own category label; and every value inside a bin
 * collapses to one colour, discarding the magnitude the scale existed to show.
 * Both were measured on a real chart before this module was written.
 */

export type ColorScaleKind = 'sequential' | 'diverging';

/** Inclusive value range the scale is stretched across. */
export type ScaleDomain = [min: number, max: number];

/**
 * Map one value to a 1-based colour step.
 *
 * SEQUENTIAL spreads the domain evenly across every step.
 *
 * DIVERGING pins `center` to the MIDDLE step and scales each arm independently
 * against the larger half-range, so the two sides stay comparable: an arm is
 * never stretched just because the data happens to be lopsided. With an even
 * step count there is no true middle, so the lower-middle step takes the
 * centre — stated here because a silent off-by-one in a diverging scale moves
 * the apparent zero, which is the one thing it must not do.
 */
export function scaleStep(
  value: number,
  domain: ScaleDomain,
  kind: ColorScaleKind,
  steps: number,
  center = 0,
): number {
  const clamp = (n: number) => Math.min(steps, Math.max(1, n));
  if (steps < 2) return 1;

  if (kind === 'sequential') {
    const [lo, hi] = domain;
    if (hi === lo) return clamp(Math.ceil(steps / 2));
    const t = (value - lo) / (hi - lo);
    return clamp(Math.floor(t * steps) + 1);
  }

  const mid = Math.ceil(steps / 2);
  const reach = Math.max(Math.abs(domain[0] - center), Math.abs(domain[1] - center));
  if (reach === 0) return mid;
  const arm = Math.floor((steps - 1) / 2);           // steps available each side
  const t = (value - center) / reach;                // -1 … 1
  return clamp(mid + Math.round(t * arm));
}

/** The domain actually spanned by every non-null datum across every series. */
export function dataDomain(series: { data: (number | null)[] }[]): ScaleDomain {
  let lo = Infinity;
  let hi = -Infinity;
  for (const s of series) {
    for (const v of s.data) {
      if (v === null || v === undefined || Number.isNaN(v)) continue;
      if (v < lo) lo = v;
      if (v > hi) hi = v;
    }
  }
  return Number.isFinite(lo) ? [lo, hi] : [0, 0];
}
