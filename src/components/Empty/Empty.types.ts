export type EmptyMediaVariant = 'default' | 'icon';

export type EmptyProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
  className?: string;
};

export type EmptyHeaderProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
  className?: string;
};

export type EmptyMediaProps = React.HTMLAttributes<HTMLDivElement> & {
  /**
   * `default` is an unboxed slot for an illustration, avatar or large glyph.
   * `icon` draws a boxed muted tile around a single icon.
   *
   * For the boxed-icon case, prefer composing a `<FeaturedIcon>` inside the
   * `default` slot — it carries the same tile with sizes, a circle shape and
   * semantic/brand tones, and is the shared version of this pattern. The `icon`
   * variant here is the original inline tile, kept for back-compat.
   */
  variant?: EmptyMediaVariant;
  children: React.ReactNode;
  className?: string;
};

/** The heading level an empty state's title renders at. */
export type EmptyTitleAs = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p';

export type EmptyTitleProps = React.HTMLAttributes<HTMLHeadingElement> & {
  children: React.ReactNode;
  /**
   * The element the title renders as. Default `h3` — a heading, so screen-reader
   * heading navigation finds the empty state (it was a `div` and was skipped).
   * Pick the level that fits the page outline; `p` opts out.
   */
  as?: EmptyTitleAs;
  className?: string;
};

export type EmptyDescriptionProps = React.HTMLAttributes<HTMLParagraphElement> & {
  children: React.ReactNode;
  className?: string;
};

export type EmptyContentProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
  className?: string;
};
