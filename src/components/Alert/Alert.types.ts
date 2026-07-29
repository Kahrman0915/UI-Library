import type { LucideIcon } from 'lucide-react';

/** Semantic colour family. `brand` follows the active `data-theme`. */
export type AlertVariant =
  | 'default'
  | 'brand'
  | 'info'
  | 'success'
  | 'warning'
  | 'error';

/** `default` is a filled tint; `outline` is transparent with a coloured border. */
export type AlertStyle = 'default' | 'outline';

// `style` is redefined as the visual style (default | outline), so the native
// CSSProperties `style` must be Omitted — without it the two intersect and
// `<Alert style={{…}}>` fails to compile.
export type AlertProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'title' | 'style'
> & {
  /** Required. Seeds `{id}-title` / `{id}-description` for the aria wiring. */
  id: string;
  /** Default `default`. See {@link AlertVariant}. Also picks the `role`:
   *  `alert` for error/warning, `status` for the rest. */
  variant?: AlertVariant;
  /** Visual style of the alert (not CSS — that was Omitted): filled tint or outline. */
  style?: AlertStyle;
  /** The headline. Rendered into `{id}-title`, which names the alert. */
  title?: React.ReactNode;
  /** Supporting copy. Full opacity by design — a dimmed description fell below AA. */
  description?: React.ReactNode;
  /** Overrides the variant's default glyph. A lucide icon component. */
  Icon?: LucideIcon;
  /** Trailing slot for a `Button` or link. */
  action?: React.ReactNode;
  /** Supplying it renders the dismissal X (a `CloseButton`). */
  onClose?: () => void;
  className?: string;
  children?: React.ReactNode;
};
