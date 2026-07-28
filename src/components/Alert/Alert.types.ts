import type { LucideIcon } from 'lucide-react';

export type AlertVariant =
  | 'default'
  | 'brand'
  | 'info'
  | 'success'
  | 'warning'
  | 'error';

export type AlertStyle = 'default' | 'outline';

// `style` is redefined as the visual style (default | outline), so the native
// CSSProperties `style` must be Omitted — without it the two intersect and
// `<Alert style={{…}}>` fails to compile.
export type AlertProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'title' | 'style'
> & {
  id: string;
  variant?: AlertVariant;
  /** Visual style of the alert (not CSS — that was Omitted): filled tint or outline. */
  style?: AlertStyle;
  title?: React.ReactNode;
  description?: React.ReactNode;
  Icon?: LucideIcon;
  action?: React.ReactNode;
  onClose?: () => void;
  className?: string;
  children?: React.ReactNode;
};
