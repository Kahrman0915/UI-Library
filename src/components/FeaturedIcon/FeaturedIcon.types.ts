import type { LucideIcon } from 'lucide-react';
import type { CategoryColor } from '../../types/GlobalTypes';

export type FeaturedIconSize = 'sm' | 'default' | 'lg';
export type FeaturedIconShape = 'square' | 'circle';

/**
 * The colour axis — the tile's tint, its border and the glyph's ink move
 * together as one palette.
 *
 * `default` **is the active theme's primary** — there is no separate `brand`,
 * the same model {@link BadgeColor} uses. On the main brand `--primary` is
 * neutral slate, so an unthemed tile reads as chrome; inside a `data-theme` it
 * takes the brand. The four semantic colours keep their own hue under every
 * theme. The 15 category hues are the tag palette, for tiles that need to be
 * told **apart** rather than **ranked** — a request-type chooser, a topic
 * grid, a category list.
 *
 * Reach for a semantic colour when the tile means something (a red tile on a
 * destructive confirm), and a category hue when it only has to be distinct.
 * Note the two do not mix well side by side: a `warning` tile beside an
 * `amber` one asks the reader to tell a meaning from a label.
 *
 * Crossed with {@link FeaturedIconAppearance}: the colour sets a palette, the
 * appearance picks which half of it renders, so every colour works with every
 * appearance.
 */
export type FeaturedIconColor =
  | 'default'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | CategoryColor;

/**
 * The fill axis, independent of colour.
 *
 * - `soft` (default) — the tint surface, its on-tint ink and a soft ring. The
 *   quiet tile that sits inside a card or an empty state without competing
 *   with the heading beside it.
 * - `solid` — the vivid fill with its inverted ink and no ring. Reach for it
 *   when the tile is the loudest thing in its own block, or when a row of
 *   tiles is the content rather than the decoration.
 *
 * Both measure the same box: `solid` keeps the border width and paints it
 * transparent, so swapping one in a row shifts nothing.
 */
export type FeaturedIconAppearance = 'soft' | 'solid';

export type FeaturedIconProps = Omit<
  React.HTMLAttributes<HTMLSpanElement>,
  'children'
> & {
  /** The glyph — any lucide icon component. Sized by the tile, not by the icon. */
  Icon: LucideIcon;
  /** Tile dimensions. The glyph scales with it. */
  size?: FeaturedIconSize;
  /** Default `square` (rounded). `circle` for an avatar-adjacent context. */
  shape?: FeaturedIconShape;
  /** Default `default`. See {@link FeaturedIconColor}. */
  color?: FeaturedIconColor;
  /** Default `soft`. See {@link FeaturedIconAppearance}. */
  appearance?: FeaturedIconAppearance;
  /**
   * By default the tile is decorative (`aria-hidden`) — the surrounding title
   * carries the meaning, as in an empty state. Pass `label` to give it an
   * accessible name when it stands alone.
   */
  label?: string;
  className?: string;
};
