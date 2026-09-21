/**
 * `default` tints only the glyph on hover. `background` also fills with
 * `--accent` on hover. `chip` is filled AT REST — a `--popover` disc with a
 * `--border` hairline and `--shadow-xs` — for a close button laid over media
 * or imagery, where a transparent X disappears.
 */
export type CloseButtonVariant = 'default' | 'background' | 'chip';
/** Box size. All three keep a ≥24×24 pointer target — see {@link CloseButtonProps.size}. */
export type CloseButtonSize = 'sm' | 'default' | 'lg';

export type CloseButtonProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'type' | 'aria-label'
> & {
  id: string;
  /** Default `default`. See {@link CloseButtonVariant}. */
  variant?: CloseButtonVariant;
  /**
   * `sm` (20px) for dense surfaces like a Toast, `default` (24px) for dialog and
   * banner headers, `lg` (32px) for touch-first layouts. Every size keeps a
   * pointer target of at least 24×24 — see CloseButton.scss.
   */
  size?: CloseButtonSize;
  disabled?: boolean;
  /** What dismissal does. The button has no behavior of its own. */
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  /** Accessible name. Default `'Close'` — override to localize, or to say what
   *  is being closed when several are on screen. Named `ariaLabel` rather than
   *  `aria-label` because the native attribute is Omitted above. */
  ariaLabel?: string;
  className?: string;
};
