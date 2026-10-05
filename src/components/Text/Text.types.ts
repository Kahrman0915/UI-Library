/** The type size, named after the font-size token it sets. `sm` (14/20) is body copy in the app. */
export type TextSize = 'xs' | 'sm' | 'base' | 'lg';

/**
 * `default` is --foreground; `muted` is --muted-foreground, for meta lines and supporting
 * copy. Only those two: colour that means something (an error, a success) belongs to the
 * component that knows the meaning, not to running text.
 */
export type TextTone = 'default' | 'muted';

export type TextWeight = 'normal' | 'medium' | 'semibold';

export type TextProps = React.HTMLAttributes<HTMLElement> & {
  /** Default `sm` — 14/20, the app's body size. `xs` 12/16 for meta lines, `base` 16/24 and `lg` 18/28 for reading copy. */
  size?: TextSize;
  /** Default `default`. `muted` for meta lines ("Lena Ortiz · 08/30/2026") and supporting copy. */
  tone?: TextTone;
  /** Default `normal`. `medium` for a label-like line; `semibold` sparingly, never as a substitute for a Heading. */
  weight?: TextWeight;
  /** The element. Default `p` for a paragraph; `span` inside a line of other content; `div` when it holds blocks. */
  as?: 'p' | 'span' | 'div';
  /**
   * Clamp to this many lines with an ellipsis. Leave it off and the text wraps in full.
   * Pair it with a `title` or a disclosure when the hidden part matters.
   */
  lines?: number;
  className?: string;
  children?: React.ReactNode;
};
