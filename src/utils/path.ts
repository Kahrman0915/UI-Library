/**
 * SVG path builders for chart marks.
 *
 * Pure, dependency-free — see the note at the top of `scale.ts`.
 */

export type Point = { x: number; y: number };
/** `null` marks a GAP in the data — see the note on `segments()`. */
export type MaybePoint = Point | null;
export type Curve = 'linear' | 'monotone' | 'step';

/**
 * Split a point list on nulls.
 *
 * A missing value is a HOLE, not a zero. Drawing straight through it invents
 * data — a sensor that was offline for a week becomes a confident diagonal.
 * Every builder here breaks into a fresh `M` subpath at each gap, and
 * `areaPath` breaks its fill at exactly the same indices so the two stay
 * registered.
 */
function segments(points: readonly MaybePoint[]): Point[][] {
  const out: Point[][] = [];
  let run: Point[] = [];
  for (const p of points) {
    if (p && Number.isFinite(p.x) && Number.isFinite(p.y)) run.push(p);
    else if (run.length) { out.push(run); run = []; }
  }
  if (run.length) out.push(run);
  return out;
}

const n = (v: number) => (Number.isFinite(v) ? Math.round(v * 100) / 100 : 0);

/**
 * Fritsch–Carlson monotone cubic Hermite tangents.
 *
 * This is the reason a "smooth" line here does not lie. The obvious choice —
 * Catmull–Rom — OVERSHOOTS: a series that dips to zero gets a curve that swings
 * below zero, drawing values the data never contained, and a series that plateaus
 * gets a bulge. Fritsch–Carlson clamps each tangent to 3x the smaller adjacent
 * secant, which is exactly the condition for the interpolant to stay monotone
 * between points. Verified by the `[0, 5, 0, 5, 0]` and `[10, 0, 0, 0, 10]`
 * stories — if either ever renders outside its own value range, this is broken.
 */
function monotoneTangents(pts: readonly Point[]): number[] {
  const len = pts.length;
  if (len < 2) return new Array(len).fill(0);

  const dx: number[] = [];
  const delta: number[] = [];
  for (let i = 0; i < len - 1; i++) {
    const h = pts[i + 1].x - pts[i].x;
    dx.push(h);
    delta.push(h === 0 ? 0 : (pts[i + 1].y - pts[i].y) / h);
  }

  const m: number[] = new Array(len);
  m[0] = delta[0];
  m[len - 1] = delta[len - 2];
  for (let i = 1; i < len - 1; i++) {
    // A sign change means a local extremum: pin the tangent flat so the curve
    // turns AT the data point rather than sailing past it.
    m[i] = delta[i - 1] * delta[i] <= 0 ? 0 : (delta[i - 1] + delta[i]) / 2;
  }

  for (let i = 0; i < len - 1; i++) {
    if (delta[i] === 0) { m[i] = 0; m[i + 1] = 0; continue; }
    const a = m[i] / delta[i];
    const b = m[i + 1] / delta[i];
    const s = a * a + b * b;
    if (s > 9) {
      const t = 3 / Math.sqrt(s);
      m[i] = t * a * delta[i];
      m[i + 1] = t * b * delta[i];
    }
  }
  return m;
}

function segmentPath(pts: readonly Point[], curve: Curve): string {
  if (!pts.length) return '';
  if (pts.length === 1) {
    // A single point has no line. Emit a zero-length subpath so `stroke-linecap:
    // round` still paints a dot — otherwise a one-point series renders nothing.
    return `M${n(pts[0].x)},${n(pts[0].y)}L${n(pts[0].x)},${n(pts[0].y)}`;
  }

  let d = `M${n(pts[0].x)},${n(pts[0].y)}`;

  if (curve === 'linear') {
    for (let i = 1; i < pts.length; i++) d += `L${n(pts[i].x)},${n(pts[i].y)}`;
    return d;
  }

  if (curve === 'step') {
    for (let i = 1; i < pts.length; i++) {
      const mid = (pts[i - 1].x + pts[i].x) / 2;
      d += `H${n(mid)}V${n(pts[i].y)}H${n(pts[i].x)}`;
    }
    return d;
  }

  const m = monotoneTangents(pts);
  for (let i = 0; i < pts.length - 1; i++) {
    const h = (pts[i + 1].x - pts[i].x) / 3;
    d +=
      `C${n(pts[i].x + h)},${n(pts[i].y + m[i] * h)}` +
      ` ${n(pts[i + 1].x - h)},${n(pts[i + 1].y - m[i + 1] * h)}` +
      ` ${n(pts[i + 1].x)},${n(pts[i + 1].y)}`;
  }
  return d;
}

/** A stroked line through `points`, broken at every null. */
export function linePath(points: readonly MaybePoint[], curve: Curve = 'linear'): string {
  return segments(points).map((s) => segmentPath(s, curve)).join('');
}

/**
 * A filled area under `points`, broken at the same nulls as `linePath`.
 *
 * `baseline` is a pixel y (the zero line) for a simple area, or a matching
 * point list for a stacked band — in which case its own nulls are ignored and
 * only the top edge decides where the fill breaks, so the two edges stay paired.
 */
export function areaPath(
  points: readonly MaybePoint[],
  baseline: number | readonly MaybePoint[],
  curve: Curve = 'linear',
): string {
  const runs = segments(points);
  if (!runs.length) return '';

  // Index each top-edge point so the matching baseline point can be found even
  // after gaps have split the run.
  const indexOf = new Map<Point, number>();
  {
    let i = 0;
    for (const p of points) { if (p) indexOf.set(p, i); i++; }
  }

  return runs
    .map((run) => {
      const top = segmentPath(run, curve);
      if (!top) return '';

      const bottom: Point[] = run
        .map((p) => {
          const i = indexOf.get(p) ?? 0;
          if (typeof baseline === 'number') return { x: p.x, y: baseline };
          const b = baseline[i];
          return b ? { x: p.x, y: b.y } : { x: p.x, y: p.y };
        })
        .reverse();

      // The return edge is drawn with the same curve so a monotone area's two
      // edges are parallel; `.slice(1)` drops its leading `M` so it joins on.
      const back = segmentPath(bottom, curve).replace(/^M/, 'L');
      return `${top}${back}Z`;
    })
    .join('');
}

/**
 * A bar with rounding on the VALUE end only.
 *
 * `<rect rx>` rounds all four corners, which detaches a bar from its baseline
 * and reads as a floating pill. A hand-written arc path is the only way to round
 * just the end that carries meaning. Negative values round downward, so the
 * rounding always marks the tip rather than the origin.
 */
export function barPath(x: number, y: number, width: number, height: number, radius = 0): string {
  const w = Math.max(0, width);
  const h = Math.abs(height);
  if (w === 0) return '';
  // Never round more than half the bar's short side, or the arcs cross over and
  // the path folds in on itself at small values.
  const r = Math.max(0, Math.min(radius, w / 2, h));
  const down = height < 0;
  const top = down ? y : y - h; // `y` is always the baseline
  const bottom = top + h;

  if (r === 0) return `M${n(x)},${n(top)}H${n(x + w)}V${n(bottom)}H${n(x)}Z`;

  return down
    ? `M${n(x)},${n(top)}` +
      `H${n(x + w)}V${n(bottom - r)}` +
      `A${n(r)},${n(r)} 0 0 1 ${n(x + w - r)},${n(bottom)}` +
      `H${n(x + r)}` +
      `A${n(r)},${n(r)} 0 0 1 ${n(x)},${n(bottom - r)}Z`
    : `M${n(x)},${n(bottom)}` +
      `V${n(top + r)}` +
      `A${n(r)},${n(r)} 0 0 1 ${n(x + r)},${n(top)}` +
      `H${n(x + w - r)}` +
      `A${n(r)},${n(r)} 0 0 1 ${n(x + w)},${n(top + r)}` +
      `V${n(bottom)}Z`;
}
