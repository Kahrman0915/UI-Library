/**
 * Page navigation for a long list or table. Renders a `<nav>` labelled
 * "pagination".
 *
 * Cells are anchors styled as buttons, so every page is a real, shareable link
 * rather than client state — which is why `Pagination.tsx` imports Button.scss
 * (no `<Button>` renders nearby to pull it in).
 */
export type PaginationProps = React.HTMLAttributes<HTMLElement> & {
  className?: string;
  children?: React.ReactNode;
};

/** The `<ul>` holding the page items. */
export type PaginationContentProps =
  React.HTMLAttributes<HTMLUListElement> & {
    className?: string;
    children?: React.ReactNode;
  };

/** One `<li>`. Wraps a link, a prev/next control or the ellipsis. */
export type PaginationItemProps = React.LiHTMLAttributes<HTMLLIElement> & {
  className?: string;
  children?: React.ReactNode;
};

export type PaginationLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  /** Marks the current page — sets `aria-current="page"` and the active style. */
  isActive?: boolean;
  /** Drops `href` and sets `aria-disabled` — an `<a>` has no native `disabled`,
   *  and spreading one emits an invalid attribute. */
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
};

export type PaginationPrevNextProps = Omit<PaginationLinkProps, 'isActive'> & {
  /** Show the text label beside the chevron. Default true. */
  showLabel?: boolean;
};

export type PaginationEllipsisProps = React.HTMLAttributes<HTMLSpanElement> & {
  className?: string;
};
