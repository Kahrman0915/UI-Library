/** Default `default` — 30px value. `sm` 24px for a dense row of stats, `lg` 36px for the one number a page leads with. */
export type StatSize = 'sm' | 'default' | 'lg';

/**
 * The value's color. `default` is --foreground — a count that asks nothing of anyone. Give a
 * value a tone only when it NEEDS something (`warning` / `error`), so the numbers that do
 * stand out from the ones that do not.
 */
export type StatTone = 'default' | 'info' | 'success' | 'warning' | 'error';

export type StatProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> & {
  /** Required. Seeds `-label` (which names the stat) and `-change`. */
  id: string;
  /** What the number is ("Open requests"). Names the stat. */
  label: string;
  /** The number, already formatted ("1,284", "92%", "3.4 days"). */
  value: React.ReactNode;
  /** One supporting line under the label ("approved and being worked"). */
  description?: React.ReactNode;
  tone?: StatTone;
  size?: StatSize;
  /**
   * Change against the comparison period, as a signed number in the unit of `changeFormat`
   * (a percentage by default: `12` → "▲ 12%"). Omit when there is nothing to compare with.
   */
  change?: number;
  /** How the change reads. Default `(n) => \`${n}%\``. Receives the absolute value. */
  changeFormat?: (abs: number) => string;
  /** What the change is against ("vs last month"). */
  changeLabel?: string;
  /**
   * Which way is good. Default `up`. Requests closed going up is good; days past SLA going
   * up is not — set `down`, and a rise turns red. The arrow always shows the real direction.
   */
  goodDirection?: 'up' | 'down';
  /** A trend under the number — a `Sparkline`. */
  trend?: React.ReactNode;
  className?: string;
};
