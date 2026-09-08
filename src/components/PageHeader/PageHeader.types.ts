export type PageHeaderProps = Omit<React.HTMLAttributes<HTMLElement>, 'title' | 'children'> & {
  /** Seeds `${id}-title` and `${id}-description`, so a page can point `aria-labelledby` at its own heading. */
  id: string;
  /** The page's name. Rendered as the heading element chosen by `headingLevel`. */
  title: string;
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
