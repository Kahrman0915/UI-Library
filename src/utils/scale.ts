/**
 * Scales — the data→pixel mapping every chart is built on.
 *
 * Pure functions, no React, no DOM, no dependencies. This module plus
 * `path.ts` is the whole "we don't need d3" bet: d3-scale + d3-shape is ~40 kB
 * and the great majority of it is time scales and interpolators we deliberately
 * defer. Keep this file free of any React or SCSS import — pure modules split
 * cleanly if charts ever move to their own bundle entry; one that reaches into
 * a stylesheet never will.
 */

/** A continuous value → pixel mapping. */
export type LinearScale = {
  (value: number): number;
  readonly domain: readonly [number, number];
  readonly range: readonly [number, number];
  /** Pixel → value. Powers the crosshair and brush. */
  invert: (px: number) => number;
};

/**
 * Map a numeric domain onto a pixel range.
 *
 * `range` is usually inverted for the y axis (`[height, 0]`), because SVG's y
 * grows downward while data grows up. That is the caller's business, not ours.
 */
export function linearScale(
  domain: readonly [number, number],
  range: readonly [number, number],
  opts: { clamp?: boolean } = {},
): LinearScale {
  const [d0, d1] = domain;
  const [r0, r1] = range;

  // A ZERO-WIDTH DOMAIN IS NOT AN EDGE CASE, IT IS TUESDAY: every value in a
  // series identical, a single data point, or a flat line at zero. Dividing by
  // it yields NaN, NaN lands in the `d` attribute, and SVG renders *nothing at
  // all* — no error, no warning, just an empty chart. Collapse to the middle of
  // the range instead so a flat series draws a flat line.
  const span = d1 - d0;
  const degenerate = span === 0 || !Number.isFinite(span);
  const mid = (r0 + r1) / 2;

  const scale = ((value: number) => {
    if (degenerate) return mid;
    let t = (value - d0) / span;
    if (opts.clamp) t = t < 0 ? 0 : t > 1 ? 1 : t;
    return r0 + t * (r1 - r0);
  }) as LinearScale;

  Object.defineProperties(scale, {
    domain: { value: domain, enumerable: true },
    range: { value: range, enumerable: true },
    invert: {
      value: (px: number) => {
        if (degenerate) return d0;
        const rSpan = r1 - r0;
        if (rSpan === 0) return d0;
        return d0 + ((px - r0) / rSpan) * span;
      },
      enumerable: true,
    },
  });

  return scale;
}

/** A discrete category → pixel band mapping. */
export type BandScale = {
  /** Left edge of band `index`. */
  (index: number): number;
  readonly bandwidth: number;
  readonly step: number;
  readonly count: number;
  readonly range: readonly [number, number];
  /** Centre of band `index` — where a line vertex or tick belongs. */
  center: (index: number) => number;
  /** Pixel → band index, or -1 outside. The hit-test for pointer + keyboard. */
  invert: (px: number) => number;
};

/**
 * Evenly divide a pixel range into `count` padded bands.
 *
 * Padding is expressed as a fraction of the step, matching the usual convention:
 * `paddingInner` is the gap *between* bands, `paddingOuter` the half-gap at each
 * end. Defaults give bars a visible gap without floating them off the axis.
 */
export function bandScale(
  count: number,
  range: readonly [number, number],
  opts: { paddingInner?: number; paddingOuter?: number } = {},
): BandScale {
  const paddingInner = opts.paddingInner ?? 0.2;
  const paddingOuter = opts.paddingOuter ?? paddingInner / 2;
  const [r0, r1] = range;
  const width = r1 - r0;

  // Same guard as linearScale: a chart can render at 0px for one frame before
  // ResizeObserver reports, and an empty category list is a legitimate state.
  const n = Math.max(0, Math.floor(count));
  const usable = n > 0 && width > 0;

  const step = usable ? width / (n - paddingInner + paddingOuter * 2) : 0;
  const bandwidth = step * (1 - paddingInner);
  const start = r0 + step * paddingOuter;

  const scale = ((index: number) => start + index * step) as BandScale;

  Object.defineProperties(scale, {
    bandwidth: { value: bandwidth, enumerable: true },
    step: { value: step, enumerable: true },
    count: { value: n, enumerable: true },
    range: { value: range, enumerable: true },
    center: { value: (index: number) => start + index * step + bandwidth / 2, enumerable: true },
    invert: {
      value: (px: number) => {
        if (!usable) return -1;
        // Nearest band by CENTRE, not "inside the painted band". A pointer in
        // the gap between two bars must still resolve to one of them, or the
        // crosshair flickers off every time it crosses a gutter.
        const i = Math.round((px - start - bandwidth / 2) / step);
        return i < 0 ? (px < r0 ? -1 : 0) : i > n - 1 ? (px > r1 ? -1 : n - 1) : i;
      },
      enumerable: true,
    },
  });

  return scale;
}

/** Min/max of a series list, ignoring nulls. Returns [0, 0] when empty. */
export function extent(values: readonly (number | null | undefined)[]): [number, number] {
  let min = Infinity;
  let max = -Infinity;
  for (const v of values) {
    if (v === null || v === undefined || !Number.isFinite(v)) continue;
    if (v < min) min = v;
    if (v > max) max = v;
  }
  return Number.isFinite(min) ? [min, max] : [0, 0];
}
