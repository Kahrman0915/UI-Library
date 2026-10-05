/** The document-outline level — which `h1`…`h6` renders. */
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * The look, named after the font-size token it sets, so the value a designer reads in Figma
 * is the token a developer would type. Every rung is a heading size the library already
 * uses: `base` 16/24 (Section, card titles), `lg` 18/28, `xl` 20/28 (PageHeader `sm`),
 * `2xl` 24/32 (PageHeader default), `3xl` 30/36 (Card `2xl`), `4xl` 36/40 (PageHeader `lg`).
 */
export type HeadingSize = 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';

export type HeadingProps = React.HTMLAttributes<HTMLHeadingElement> & {
  /**
   * Which heading element renders — the document outline. Required, because a heading
   * with no level is a guess about the outline. Independent of `size`: a sidebar panel's
   * `h2` can be small, a hero `h1` large.
   */
  level: HeadingLevel;
  /**
   * The type size. Defaults by level — `h1` 2xl, `h2` xl, `h3` lg, `h4`–`h6` base — so the
   * common case needs no size at all; pass one only when the look and the outline differ.
   */
  size?: HeadingSize;
  className?: string;
  children?: React.ReactNode;
};
