import type { CategoryColor } from '../../types/GlobalTypes';

/**
 * The colour axis. Each value sets a local palette — solid pair, tint pair and
 * outline pair — which the `appearance` axis then consumes, so **every colour
 * works with every appearance**.
 *
 * `default` follows the active `data-theme` (and adopts Aiden's palette under
 * `data-surface="aiden"`); the semantic colours keep their own hue under every
 * theme. The 15 category hues are the tag palette, for topics that need to be
 * told apart rather than ranked.
 */
export type BadgeColor =
  | 'default'
  | 'error'
  | 'success'
  | 'warning'
  | 'info'
  | 'aiden'
  | CategoryColor;

/**
 * The fill axis, independent of colour.
 *
 * - `solid` — the vivid fill with its on-fill ink.
 * - `soft` — the tint surface with on-tint ink. Reach for this beside another
 *   soft badge: both are a tint plus ink and no border, so they read as siblings.
 * - `outline` — transparent with a coloured border and text.
 */
export type BadgeAppearance = 'solid' | 'soft' | 'outline';

export type BadgeProps = React.HTMLAttributes<HTMLDivElement> & {
  id: string;
  /** The badge text. Alternatively pass children. */
  label?: string;
  /** Default `default`. See {@link BadgeColor}. */
  color?: BadgeColor;
  /** Default `solid`. See {@link BadgeAppearance}. */
  appearance?: BadgeAppearance;
  /** Icon before the label. Must be a zero-prop component (`() => JSX`). */
  IconLeft?: React.FC;
  /** Icon after the label. Must be a zero-prop component. */
  IconRight?: React.FC;
  /** Renders alone and centred, for a badge with no text. */
  IconCenter?: React.FC;
  className?: string;
};
