import type { LucideIcon } from 'lucide-react';

export type BannerVariant =
  | 'default'
  | 'brand'
  | 'info'
  | 'success'
  | 'warning'
  | 'error';

export type BannerProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'title'
> & {
  id: string;
  /** Default `default`. Also picks the `role`: `alert` for error/warning,
   *  `status` for the rest. `brand` follows the active `data-theme`. */
  variant?: BannerVariant;
  /** Leading message. Also accepts `children` for richer content. */
  title?: React.ReactNode;
  /** Overrides the variant's default glyph. A lucide icon component. */
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
