export type ItemVariant = 'default' | 'outline' | 'muted';

export type ItemSize = 'xs' | 'sm' | 'default';

export type ItemMediaVariant = 'default' | 'icon' | 'image';

export type ItemProps = Omit<
  React.HTMLAttributes<HTMLElement>,
  'onClick'
> & {
  variant?: ItemVariant;
  size?: ItemSize;
  /** If given, renders as `<a href=...>`. */
  href?: string;
  /** Rel + target passthrough when `href` is set. */
  target?: string;
  rel?: string;
  /** If given without href, renders as `<button>`. */
  onClick?: (e: React.MouseEvent) => void;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
};

export type ItemGroupProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  children?: React.ReactNode;
};

export type ItemSeparatorProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
};

export type ItemMediaProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: ItemMediaVariant;
  className?: string;
  children?: React.ReactNode;
};

export type ItemContentProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  children?: React.ReactNode;
};

export type ItemTitleProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  children?: React.ReactNode;
};

export type ItemDescriptionProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  children?: React.ReactNode;
};

export type ItemActionsProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  children?: React.ReactNode;
};

export type ItemHeaderProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  children?: React.ReactNode;
};

export type ItemFooterProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  children?: React.ReactNode;
};
