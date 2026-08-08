import type { LucideIcon } from 'lucide-react';

export type MarkSize = 'sm' | 'default' | 'lg' | 'xl';

/**
 * How much the tile moves.
 *
 * - `none` — a still tile. Same paint, nothing animates.
 * - `ambient` — the glass is alive: a slow bloom drift and a sheen tilt on
 *   long, coprime clocks, plus a lift and a light sweep on hover.
 * - `tilt` — everything `ambient` does, and the tile also turns to follow the
 *   pointer with its layers separating in depth.
 *
 * All three render the same colours. Motion is motion here, never a different
 * paint — a mark that changed its look when you turned animation off would be
 * two marks.
 */
export type MarkMotion = 'none' | 'ambient' | 'tilt';

export type MarkProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  /* The native `title` is a browser tooltip; ours is the application's name,
     rendered beside the tile. */
  'title'
> & {
  /**
   * Seeds the child ids — `${id}-title` and `${id}-description` — which the
   * lockup points its aria-labelledby at.
   */
  id: string;
  /** The glyph — any lucide icon component. Sized by the tile, not by itself. */
  Icon: LucideIcon;
  /**
   * The application's name, set beside the tile. Omit for the bare tile, which
   * is what a collapsed rail or an avatar-sized slot wants.
   */
  title?: string;
  /** A second line under the title — the suite name, an environment, a tenant. */
  description?: string;
  /** Tile dimensions. The glyph and the whole glass stack scale with it. */
  size?: MarkSize;
  /** Default `ambient`. See {@link MarkMotion}. */
  motion?: MarkMotion;
  /**
   * An accessible name for the tile when it stands ALONE. With a `title` the
   * tile is decorative — the text beside it already names the application, and
   * a label here would make a screen reader say it twice.
   */
  label?: string;
  className?: string;
};
