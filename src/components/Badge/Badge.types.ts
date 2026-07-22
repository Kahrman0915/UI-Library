import type { CategoryColor } from '../../types/GlobalTypes';

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
  label?: string;
  variant?: BadgeVariant;
  /**
   * Render as a category tag in one of the 17 palette hues. When set, takes
   * precedence over `variant`. Pair with `categoryStyle`.
   */
  category?: CategoryColor;
  /**
   * How a `category` tag is filled: `soft` (default) = tinted `-bg` + `-text`;
   * `solid` = the vivid `--category` fill + its AA-safe `-foreground`.
   */
  categoryStyle?: 'soft' | 'solid';
  IconLeft?: React.FC;
  IconRight?: React.FC;
  IconCenter?: React.FC;
  className?: string;
};
