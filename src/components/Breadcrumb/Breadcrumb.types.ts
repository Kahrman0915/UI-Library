export type BreadcrumbProps = React.HTMLAttributes<HTMLElement> & {
  className?: string;
  children?: React.ReactNode;
};

export type BreadcrumbListProps = React.OlHTMLAttributes<HTMLOListElement> & {
  className?: string;
  children?: React.ReactNode;
};

export type BreadcrumbItemProps = React.LiHTMLAttributes<HTMLLIElement> & {
  className?: string;
  children?: React.ReactNode;
};

export type BreadcrumbLinkProps =
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    className?: string;
    children?: React.ReactNode;
  };

export type BreadcrumbPageProps = React.HTMLAttributes<HTMLSpanElement> & {
  className?: string;
  children?: React.ReactNode;
};

export type BreadcrumbSeparatorProps = React.LiHTMLAttributes<HTMLLIElement> & {
  className?: string;
  children?: React.ReactNode;
};

export type BreadcrumbEllipsisProps = React.HTMLAttributes<HTMLSpanElement> & {
  className?: string;
  children?: React.ReactNode;
};
