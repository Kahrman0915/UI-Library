export type CardProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children'
> & {
  id: string;
  children: React.ReactNode;
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
  /** Trailing slot in the header — a menu, a badge, a small button. */
  action?: React.ReactNode;
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
