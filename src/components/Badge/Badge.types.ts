import type { CategoryColor } from '../../types/GlobalTypes';

/**
 * Every colour comes as a `{solid, transparent outline}` pair. `default` and
 * `outline` follow the active `data-theme`; the semantic ones keep their own
 * colour under every theme.
 */
export type BadgeVariant =
  | 'default'
  | 'outline'
  | 'error'
  | 'error-outline'
  | 'success'
  | 'success-outline'
  | 'warning'
  | 'warning-outline'
  | 'info'
  | 'info-outline'
  | 'aiden'
  | 'aiden-outline';

export type BadgeProps = React.HTMLAttributes<HTMLDivElement> & {
  id: string;
  /** The badge text. Alternatively pass children. */
  label?: string;
  /** Default `default`. See {@link BadgeVariant}. Ignored when `category` is set. */
  variant?: BadgeVariant;
  /**
   * Render as a category tag in one of the 15 palette hues. When set, takes
   * precedence over `variant`. Pair with `categoryStyle`.
   */
  category?: CategoryColor;
  /**
   * How a `category` tag is filled: `soft` (default) = tinted `-bg` + `-text`;
   * `solid` = the vivid `--category` fill + its AA-safe `-foreground`.
   */
  categoryStyle?: 'soft' | 'solid';
  /** Icon before the label. Must be a zero-prop component (`() => JSX`). */
  IconLeft?: React.FC;
  /** Icon after the label. Must be a zero-prop component. */
  IconRight?: React.FC;
  /** Renders alone and centred, for a badge with no text. */
  IconCenter?: React.FC;
  className?: string;
};
