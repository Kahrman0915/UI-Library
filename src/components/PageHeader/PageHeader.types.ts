import type { Size } from '../../types/GlobalTypes';

/**
 * Two rungs, and only two, because that is what the file actually contains.
 *
 * A census of every page heading in the design file found two clusters and
 * nothing between them: **24px on every working screen** (My Requests, Approval
 * Queue, the dashboard greeting — 13 of them) and **36px on What's New**, the
 * one page that is a destination rather than a place you do work. No 20px panel
 * heading and no 30px anything appeared, so neither was invented here.
 *
 * Drawn from the shared {@link Size} vocabulary rather than a private list, so
 * an `sm` rung can be added later without renaming anything.
 */
export type PageHeaderSize = Extract<Size, 'default' | 'lg'>;

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
   * **An icon here is not the same as `visual`.** A glyph inside the overline
   * belongs to the eyebrow line, and the title stays flush with the page's left
   * edge: `overline={<><Megaphone />What's new</>}`. A {@link visual} sits
   * beside the whole text block, so the title indents past it. Pick by what the
   * icon introduces — the line, or the page.
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
  /**
   * The type ramp. `default` is the working-screen header; `lg` is the hero a
   * destination page wants — a 36px title over a 16px overline.
   *
   * **It moves type and nothing else.** Every gap stays on its level, because
   * the hierarchy of overline → title → description is identical at both rungs
   * and a level is a relationship, not a measurement. Same reasoning
   * `CardTitle.scale` records for moving type without moving padding.
   *
   * Independent of {@link headingLevel}, which is the document outline. A `lg`
   * header can still be an `h2`, and an `h1` can be `default`.
   */
  size?: PageHeaderSize;
  /** Default `h1`. `h2` when the page is a panel inside a page that already has an h1. */
  headingLevel?: 'h1' | 'h2';
  className?: string;
};
