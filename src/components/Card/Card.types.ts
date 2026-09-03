/**
 * Scales the whole card from one class on the root — every region's padding and
 * its type ramp move together. That is the point: a large header above a
 * default-padded body misaligns their left edges, so size cannot live on a
 * single part.
 *
 * | size | padding | title | description |
 * | --- | --- | --- | --- |
 * | `sm` | 12 | 14 | 12 |
 * | `default` | 16 | 16 | 14 |
 * | `lg` | 20 | 18 | 14 |
 * | `xl` | 24 | 20 | 16 |
 * | `2xl` | 32 | 30 | 16 |
 *
 * **Deliberately NOT the library-wide `Size` union.** That is `xs | sm | default
 * | lg`, and `xl` / `2xl` exist here only because a featured card is a real tier
 * — a full-bleed hero heading a page. Keeping them in a Card-local union is what
 * stops them leaking into every other component's control list.
 */
export type CardSize = 'sm' | 'default' | 'lg' | 'xl' | '2xl';

/**
 * Where {@link CardHeaderProps.media} sits relative to the title.
 *
 * - `leading` (default) — beside the title, on its first line. The list-row
 *   shape: an avatar, a status dot, a small mark introducing a heading.
 * - `above` — on its own line over the title. The option / chooser-card shape:
 *   a `FeaturedIcon` tile, then the name of the thing, then what it does.
 *
 * A header `action` stays pinned top-right in both, so the two compose.
 */
export type CardHeaderMediaPlacement = 'leading' | 'above';

export type CardProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children'
> & {
  id: string;
  children: React.ReactNode;
  /** Default `default`. See {@link CardSize}. */
  size?: CardSize;
  /**
   * Opt-in hover affordance for a card that leads somewhere: strengthens the
   * border to `var(--border-hover)`, lifts it, and sets `cursor: pointer`.
   *
   * **Visual only — this does not make the card operable.** Card stays a plain
   * `<div>` with no role and no tab stop, so put the real click target *inside*
   * it as a link or button. A card that carries its own actions cannot itself
   * be a button without nesting interactive elements. If you do make the card
   * focusable yourself, it already carries a matching `:focus-visible` ring.
   */
  interactive?: boolean;
  className?: string;
};

export type CardHeaderProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children' | 'title'
> & {
  id: string;
  /**
   * Short line above the title — a date, a category, a version, or several of
   * those together.
   *
   * A node rather than a `string`, unlike {@link CardHeaderProps.title} and
   * `description`: those become an `<h3>` and a `<p>` and want text, whereas an
   * overline routinely carries a `Code` chip or a `Badge` beside its words. It
   * renders as a flex row with a gap, so `July 7, 2026 · Dartboards <Code />`
   * lays out without a wrapper.
   *
   * Styled as metadata — `--text-xs` on `--muted-foreground`, sentence case. It
   * does not uppercase; a kicker that wants that sets it through `className`.
   */
  overline?: React.ReactNode;
  /** Heading text. A `string`, not a node — put rich headings in `CardBody`. */
  title: string;
  /** Supporting line under the title. Also a `string`. */
  description?: string;
  /**
   * Leading visual, rendered before the title — a featured icon, an avatar, a
   * status dot. Same role `ItemMedia` / `EmptyMedia` / `AttachmentMedia` play
   * in their families; Card was the only one of the four without it.
   */
  media?: React.ReactNode;
  /**
   * Default `leading`. See {@link CardHeaderMediaPlacement}.
   *
   * `above` is the only thing that changes the header's own DOM: the media and
   * the content are wrapped in a column so the tile can sit over the title.
   * `leading` emits no wrapper and no modifier, so existing markup is untouched.
   */
  mediaPlacement?: CardHeaderMediaPlacement;
  /** Trailing slot in the header — a menu, a badge, a small button. */
  action?: React.ReactNode;
  /**
   * The hairline under the header. Default `true`.
   *
   * Set `false` for a card whose header and body read as one block rather than
   * two regions — a content card where the heading simply introduces the copy
   * beneath it. A header that is the card's LAST child never draws the rule
   * regardless, since there is nothing under it to divide.
   *
   * **It collapses the spacing too, not just the line.** Header padding-bottom
   * plus body padding-top is `2 × P`, which reads correctly as two regions when
   * a rule sits between them and as a hole when it doesn't. Turning the divider
   * off drops the gap to a **constant 16px** (12 at `sm`, clamped to its own
   * padding) — deliberately NOT proportional to {@link CardSize}, because what
   * this gap has to out-rank is the header's internal overline → title →
   * description rhythm, and that is a fixed `--p-1-5` at every size.
   *
   * A trailing header keeps its own bottom padding.
   */
  showDivider?: boolean;
  className?: string;
};

export type CardMediaProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children'
> & {
  /**
   * Width-to-height ratio, as a division expression — `16 / 9`, `4 / 3`, `1`
   * for a square. Default `16 / 9`.
   *
   * It exists so a row of cards keeps a level top edge and does not jump as
   * images load: the box reserves its height before the image arrives. Composes
   * {@link AspectRatio} rather than re-deriving it.
   */
  ratio?: number;
  /** The cover itself — an `<img>`, a `<video>`, an illustration, a chart. */
  children: React.ReactNode;
  className?: string;
};

export type CardBodyProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children'
> & {
  children: React.ReactNode;
  className?: string;
};

export type CardFooterProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children'
> & {
  children: React.ReactNode;
  className?: string;
};

/**
 * The five parts {@link CardHeaderProps} composes internally, exported so a
 * card whose shape the prop-driven header cannot express is still built from
 * the system rather than hand-rolled.
 *
 * Reach for `CardHeader` first — it is the common row and it wires the parts
 * for you. Reach for the parts when the arrangement differs: a stat card (a
 * small label over a big value, which inverts the header's ranking), a pricing
 * card (a `Badge` beside the title rather than pinned to the trailing edge), a
 * two-column interior. They carry the same classes the header does, so the
 * card's `size` ramp reaches them wherever they sit — body slot included.
 */

/**
 * Element the title renders as. Default `h3`.
 *
 * Two reasons it is configurable. A card's heading rank has to match its
 * position in the document, not the component's guess — the same argument
 * `AccordionTrigger`'s `headingLevel` makes. And a stat card's largest text is
 * a **value**, not a heading; marking `1,284` as an `<h3>` puts a number in the
 * document outline and announces it as a section title.
 */
export type CardTitleAs = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'div' | 'span';

export type CardTitleProps = Omit<
  React.HTMLAttributes<HTMLHeadingElement>,
  'children'
> & {
  children: React.ReactNode;
  /** Default `h3`. See {@link CardTitleAs}. */
  as?: CardTitleAs;
  /**
   * Renders the title at the type another {@link CardSize} would give it,
   * **without touching padding**.
   *
   * This does not contradict "size lives on `Card`, not on a part". That rule
   * exists because *padding* has to move together — a large header over a
   * default-padded body misaligns their left edges. Type has no such
   * dependency, and two real shapes need it: a stat value wants `2xl`'s 30px
   * inside a `default`-padded card, and a pricing title wants one rung up.
   *
   * Named `scale`, never `size`, so it can never be read as `Card`'s prop.
   */
  scale?: CardSize;
  className?: string;
};

export type CardDescriptionProps = Omit<
  React.HTMLAttributes<HTMLParagraphElement>,
  'children'
> & {
  children: React.ReactNode;
  className?: string;
};

export type CardOverlineProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children'
> & {
  /**
   * A `div` rather than a `p`, and that is load-bearing: the overline routinely
   * carries a `Code` chip or a `Badge`, and `Badge` renders a `div`, which is
   * invalid inside a `p` and gets silently un-nested by the browser.
   */
  children: React.ReactNode;
  className?: string;
};

export type CardVisualProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children'
> & {
  /**
   * The small visual — a `FeaturedIcon`, an `Avatar`, a `StatusDot`, a `Mark`.
   *
   * **Not {@link CardMediaProps}.** That is the full-bleed COVER: an image,
   * video or chart that spans the card's width and takes its rounding from the
   * card's own `overflow: hidden`. This is the object that introduces a title —
   * beside it, or stacked over it. A bare `svg` child is sized to 20px here so
   * consumers don't each pick their own; anything that brings its own
   * dimensions is left alone.
   */
  children: React.ReactNode;
  className?: string;
};

export type CardActionsProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children'
> & {
  /**
   * A row of controls that hugs its content and aligns to the leading edge.
   *
   * It exists because neither of the other two homes works for one:
   * `.ui-card__body` is a flex column with the default `align-items: stretch`,
   * so a `Button` dropped in fills the card and centres its label; and
   * `CardFooter` is the dialog-shaped action BAR — right-aligned, with its own
   * rule above it. Use this for an action that belongs to the content, and
   * `CardFooter` for one that closes the card.
   */
  children: React.ReactNode;
  className?: string;
};
