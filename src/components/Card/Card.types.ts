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
  title: string;
  description?: string;
  action?: React.ReactNode;
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
