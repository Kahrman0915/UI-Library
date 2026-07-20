import type { LucideIcon } from 'lucide-react';

export type BannerVariant =
  | 'default'
  | 'info'
  | 'success'
  | 'warning'
  | 'error';

export type BannerProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'title'
> & {
  id: string;
  variant?: BannerVariant;
  /** Leading message. Also accepts `children` for richer content. */
  title?: React.ReactNode;
  Icon?: LucideIcon;
  /** Trailing action(s), usually a small `<Button>` or a link. */
  action?: React.ReactNode;
  /** When set, renders a trailing dismiss `CloseButton`. */
  onClose?: () => void;
  /** Center the content and cap its width (for full-bleed marketing bars). */
  centered?: boolean;
  className?: string;
  children?: React.ReactNode;
};
