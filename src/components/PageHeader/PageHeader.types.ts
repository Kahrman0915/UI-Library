import type { Size } from '../../types/GlobalTypes';

/**
 * Four rungs, each with a measured case in the design file — none invented to
 * round out the ramp.
 *
 * | rung | title | where it was measured |
 * | --- | --- | --- |
 * | `xs` | 16px | a side panel — the builder's "Add components" drawer |
 * | `sm` | 20px | viewer chrome — the dashboard title bar, 56px tall |
 * | `default` | 24px | every working screen (13 of them) |
 * | `lg` | 36px | What's New, a destination rather than a place you work |
 *
 * The original census found only the middle two, because it looked at page
 * headings and the outer two are not at the top of a page at all: one is chrome
 * around an embed, the other is a drawer. Both were added 2026-09-16 once real
 * screens needed them.
 *
 * Every rung moves TYPE only, and the supporting text bottoms out at 12px: at
 * `xs` and `sm` the overline, description and meta are all 12, because that is
 * the ramp's floor for those roles and there is nothing below it to step to.
 */
export type PageHeaderSize = Extract<Size, 'xs' | 'sm' | 'default' | 'lg'>;

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
   * The trailing lockup that belongs to the title — a `Badge` naming the source
   * or status, a last-updated date, a count. It sits on the title's own line,
   * immediately after it.
   *
   * **It is not {@link actions}.** Nothing here is a control. Actions are pushed
   * to the end of the row because the eye should find them in a predictable
   * place; meta travels with the title because it qualifies the title, and
   * putting a source badge at the far right reads as a button that does nothing.
   *
   * **It is not {@link overline} either.** An overline is the line ABOVE and is
   * read first — a section the page belongs to. Meta is read after the title.
   * The same Badge means different things in the two places.
   *
   * The title yields to it: a long title truncates rather than pushing the meta
   * off the row.
   */
  meta?: React.ReactNode;
  /**
   * The object that introduces the page — a `FeaturedIcon`, an `Avatar`, a
   * product mark. It sits at the START of the title row, beside the text, which
   * is the `CardHeader.media` `leading` shape and what the 33 hand-drawn page
   * headings across the flows already draw.
   *
   * It is a sibling of the text block, not a child, so `overline` and `title`
   * both sit to its right and the row's `align-items: flex-start` keeps it level
   * with the first line rather than centered against a wrapped one.
   *
   * This is NOT a cover image — a page header has no full-bleed media region.
   */
  visual?: React.ReactNode;
  /** One line under the title, in muted text. */
  description?: React.ReactNode;
  /**
   * Trailing controls on the title row — the page's primary action, a menu, or
   * a browse page's search and filters.
   *
   * They align to the BOTTOM of the text block, not the top. The header reads as
   * one block sitting on a baseline, and these belong to the page rather than to
   * the title; top-aligning them against a title + description left them
   * floating high. {@link visual} still aligns to the first line — the row is
   * `flex-start` and only the actions take `align-self: flex-end`.
   *
   * The trade-off: a {@link description} long enough to wrap carries the controls
   * down with it, away from the title. Keep it to a line or two.
   */
  actions?: React.ReactNode;
  /** A search field or a `Toolbar` under the title row, still part of the header: level 2 below the row. */
  toolbar?: React.ReactNode;
  /**
   * A hairline closing the header, level 2 below it. Default `false` — every header
   * already in the wild renders unchanged.
   *
   * **It bleeds past the page margin.** A rule that stops at the text column reads as
   * belonging to the content rather than closing the header, so inside a
   * `PageContainer` it runs the full width of the content window. The container
   * publishes its own padding as `--ui-page-header-bleed` and the rule takes that much
   * negative inline margin; with no container the variable is unset, the bleed is `0`,
   * and the rule is inset — so this can never pull a header out of an arbitrary parent.
   * Override `--ui-page-header-bleed` to bleed past a different container.
   *
   * Composes {@link Separator} as `decorative`: the `<header>` element already carries
   * the semantics, so announcing a second boundary would be noise.
   */
  showDivider?: boolean;
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
