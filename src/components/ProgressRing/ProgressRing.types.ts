import type { ProgressVariant } from '../Progress/Progress.types';

/** Diameter. `sm` 32px (no value inside), `default` 48px, `lg` 64px. */
export type ProgressRingSize = 'sm' | 'default' | 'lg';

/** Ring color — the same set as `Progress`. `default` follows the active `data-theme`. */
export type ProgressRingVariant = ProgressVariant;

export type ProgressRingProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> & {
  /** Required. */
  id: string;
  /**
   * The accessible name — what the share IS ("Open items moving"). The ring has no visible
   * label of its own, so this is the only thing a screen reader hears besides the number.
   */
  label: string;
  /** Between 0 and `max`. */
  value: number;
  /** Default 100. */
  max?: number;
  size?: ProgressRingSize;
  variant?: ProgressRingVariant;
  /** Show the value in the middle. Default `true`, except at `sm`, where it does not fit. */
  showValue?: boolean;
  /** Formats the value in the middle. Receives the rounded percentage. Default `69%`. */
  valueFormatter?: (percent: number) => string;
  className?: string;
};
