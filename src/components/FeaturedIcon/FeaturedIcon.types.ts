import type { LucideIcon } from 'lucide-react';

export type FeaturedIconSize = 'sm' | 'default' | 'lg';
export type FeaturedIconShape = 'square' | 'circle';
export type FeaturedIconVariant =
  | 'default'
  | 'brand'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';

export type FeaturedIconProps = Omit<
  React.HTMLAttributes<HTMLSpanElement>,
  'children'
> & {
  /** The glyph — any lucide icon component. Sized by the tile, not by the icon. */
  Icon: LucideIcon;
  size?: FeaturedIconSize;
  shape?: FeaturedIconShape;
  variant?: FeaturedIconVariant;
  /**
   * By default the tile is decorative (`aria-hidden`) — the surrounding title
   * carries the meaning, as in an empty state. Pass `label` to give it an
   * accessible name when it stands alone.
   */
  label?: string;
  className?: string;
};
