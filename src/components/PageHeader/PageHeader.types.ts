export type PageHeaderProps = Omit<React.HTMLAttributes<HTMLElement>, 'title' | 'children'> & {
  /** Seeds `${id}-title` and `${id}-description`, so a page can point `aria-labelledby` at its own heading. */
  id: string;
  /**
   * The short line ABOVE the title — a section the page belongs to, a status, a
   * date, a "WHAT'S NEW" eyebrow. Same role and treatment as `CardOverline`:
   * `--text-xs` in muted text, laid out as a flex row so it can carry a `Badge`
   * or an icon beside the words.
   *
   * It renders as a `div`, not a `p`, deliberately — a `Badge` renders a div,
   * and a div inside a `p` is invalid HTML that the browser silently un-nests.
   *
   * Deliberately NOT uppercased by the component. Pass the string you want.
   */
  overline?: React.ReactNode;
  /** The page's name. Rendered as the heading element chosen by `headingLevel`. */
  title: string;
  /**
   * The object that introduces the page — a `FeaturedIcon`, an `Avatar`, a
   * product mark. It sits at the START of the title row, beside the text, which
   * is the `CardHeader.media` `leading` shape and what the 33 hand-drawn page
   * headings across the flows already draw.
   *
   * It is a sibling of the text block, not a child, so `overline` and `title`
   * both sit to its right and the row's `align-items: flex-start` keeps it level
   * with the first line rather than centred against a wrapped one.
   *
   * This is NOT a cover image — a page header has no full-bleed media region.
   */
  visual?: React.ReactNode;
  /** One line under the title, in muted text. */
  description?: React.ReactNode;
  /** Trailing controls on the title row — the page's primary action, a menu. */
  actions?: React.ReactNode;
  /** A search field or a `Toolbar` under the title row, still part of the header: level 2 below the row. */
  toolbar?: React.ReactNode;
  /** Default `h1`. `h2` when the page is a panel inside a page that already has an h1. */
  headingLevel?: 'h1' | 'h2';
  className?: string;
};
