export type StatusDotStatus =
  | 'online'
  | 'offline'
  | 'busy'
  | 'away'
  | 'neutral';

export type StatusDotSize = 'sm' | 'default' | 'lg';

export type StatusDotProps = Omit<
  React.HTMLAttributes<HTMLSpanElement>,
  'children'
> & {
  status?: StatusDotStatus;
  size?: StatusDotSize;
  /** Emit a soft pulsing ring. Suppressed under `prefers-reduced-motion`. */
  pulse?: boolean;
  /**
   * Accessible label. When set, the dot exposes `role="status"` + this name;
   * otherwise it's `aria-hidden` decoration next to a visible label.
   */
  label?: string;
  className?: string;
};
