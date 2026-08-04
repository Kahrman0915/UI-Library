/**
 * Tick generation and axis-label thinning.
 *
 * Pure, dependency-free — see the note at the top of `scale.ts`.
 *
 * MILESTONE 1 HAS NO TIME SCALE, deliberately. X categories are strings the
 * caller supplies. A real time axis needs day/week/month/quarter/year tick
 * selection plus a timezone policy, and a half-good one is worse than none —
 * it silently mislabels. The API is shaped so adding `timeTicks()` later is
 * purely additive.
 */

/** Round to the precision implied by `step`, killing float litter. */
const roundTo = (value: number, step: number): number => {
  if (!Number.isFinite(step) || step === 0) return value;
  const decimals = Math.max(0, -Math.floor(Math.log10(Math.abs(step))));
  // Round the VALUE against the step's precision. Accumulating `t += step` and
  // rounding at the end is what produces 0.30000000000000004 on a 0–1.5 domain.
  return Number(value.toFixed(Math.min(20, decimals)));
};

/** The 1 / 2 / 2.5 / 5 / 10 × 10ⁿ ladder. */
const niceStep = (rough: number): number => {
  if (!Number.isFinite(rough) || rough <= 0) return 1;
  const mag = 10 ** Math.floor(Math.log10(rough));
  const norm = rough / mag;
  const snapped = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10;
  return snapped * mag;
};

/**
 * Ticks across [min, max] on nice round values.
 *
 * Always includes zero when the domain straddles it — a bar chart whose
 * baseline is not a gridline reads as a lie about where zero is.
 */
export function niceTicks(min: number, max: number, count = 5): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [];
  if (min === max) return [roundTo(min, niceStep(Math.abs(min) || 1))];

  const step = niceStep((max - min) / Math.max(1, count));
  const first = Math.ceil(min / step) * step;
  const out: number[] = [];
  for (let i = 0; ; i++) {
    const v = roundTo(first + i * step, step);
    if (v > max + step * 1e-6) break;
    out.push(v);
    if (out.length > 1000) break; // paranoia against a pathological step
  }
  if (min <= 0 && max >= 0 && !out.some((v) => v === 0)) out.push(0);
  return out.sort((a, b) => a - b);
}

/** Extend [min, max] out to the enclosing nice tick boundary. */
export function niceDomain(min: number, max: number, count = 5): [number, number] {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [0, 1];
  if (min === max) return min === 0 ? [0, 1] : min < 0 ? [min * 1.1, 0] : [0, max * 1.1];
  const step = niceStep((max - min) / Math.max(1, count));
  return [roundTo(Math.floor(min / step) * step, step), roundTo(Math.ceil(max / step) * step, step)];
}

/**
 * Thin `labels` down to at most `maxCount`, keeping the first and last.
 *
 * Returns an array the same length as the input with `null` where a label
 * should be dropped, so callers keep index alignment with the band scale.
 * Dropping labels beats rotating them: rotated axis text is slower to read and
 * costs vertical space the container has already committed to.
 */
export function thinLabels<T>(labels: readonly T[], maxCount: number): (T | null)[] {
  const n = labels.length;
  if (n === 0) return [];
  if (maxCount <= 0) return labels.map(() => null);
  if (n <= maxCount) return [...labels];

  const stride = Math.ceil(n / maxCount);
  return labels.map((l, i) => (i === 0 || i === n - 1 || i % stride === 0 ? l : null));
}

/**
 * Default axis-value formatting: compact above 10k, trimmed decimals below.
 * Consumers override wholesale via `valueFormatter`; this is only the default.
 */
export function formatTick(value: number, opts: { compact?: boolean } = {}): string {
  if (!Number.isFinite(value)) return '';
  const abs = Math.abs(value);
  const compact = opts.compact ?? true;

  if (compact && abs >= 1_000_000_000) return `${roundTo(value / 1_000_000_000, 0.1)}B`;
  if (compact && abs >= 1_000_000) return `${roundTo(value / 1_000_000, 0.1)}M`;
  if (compact && abs >= 10_000) return `${roundTo(value / 1_000, 0.1)}k`;
  if (abs >= 1000) return value.toLocaleString('en-US');
  if (Number.isInteger(value)) return String(value);
  return String(roundTo(value, abs < 1 ? 0.01 : 0.1));
}
