import type { CategoryColor } from '../../types/GlobalTypes';

/** Chip diameter. Matches `StatusDot`'s ramp one rung up — a swatch is an object you pick, not a state you read. */
export type SwatchSize = 'sm' | 'default' | 'lg';

/**
 * - `circle` — the default. Reads as a marker beside a name.
 * - `square` — a rounded square, for a palette grid where the chips are the
 *   subject rather than a marker on something else.
 */
export type SwatchShape = 'circle' | 'square';

/**
 * A small color chip in one of the 15 category hues — the marker that gives a
 * space, a tag or a board its identity color.
 *
 * **It is not `StatusDot`.** A status dot carries one of five *semantic* states
 * (online, busy, away…) and its color IS its meaning. A swatch carries an
 * arbitrary identity hue chosen by a user, where the color means nothing on its
 * own and only tells two things apart. Giving `StatusDot` the category hues was
 * the obvious move and the wrong one: it would let `status="busy"` and
 * `color="red"` both exist on one component, meaning different things.
 *
 * **Color is never the sole carrier.** A swatch is decoration beside a visible
 * name unless you give it a `label`, which is the only accessible route to what
 * the hue means. Pair it with text; do not ask a reader to distinguish violet
 * from purple.
 */
export type SwatchProps = Omit<
  React.HTMLAttributes<HTMLSpanElement>,
  'children' | 'color'
> & {
  /** Which of the 15 category hues to paint. Required — a swatch with no color has nothing to say. */
  color: CategoryColor;
  /** Chip size. */
  size?: SwatchSize;
  /** Chip shape. */
  shape?: SwatchShape;
  /**
   * Accessible name. When set, the swatch exposes `role="img"` + this name;
   * otherwise it is `aria-hidden` decoration beside a visible label.
   *
   * Name the MEANING, not the hue — `label="Weekly Ops Review"` beats
   * `label="violet"`, which tells a screen-reader user nothing they can act on.
   */
  label?: string;
  className?: string;
};
