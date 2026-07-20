export type PaginationProps = React.HTMLAttributes<HTMLElement> & {
  className?: string;
  children?: React.ReactNode;
};

export type PaginationContentProps =
  React.HTMLAttributes<HTMLUListElement> & {
    className?: string;
    children?: React.ReactNode;
  };

export type PaginationItemProps = React.LiHTMLAttributes<HTMLLIElement> & {
  className?: string;
  children?: React.ReactNode;
};

export type PaginationLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  /** Marks the current page — sets `aria-current="page"` and the active style. */
  isActive?: boolean;
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
