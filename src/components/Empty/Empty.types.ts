export type EmptyMediaVariant = 'default' | 'icon';

export type EmptyProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
  className?: string;
};

export type EmptyHeaderProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
  className?: string;
};

export type EmptyMediaProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: EmptyMediaVariant;
  children: React.ReactNode;
  className?: string;
};

export type EmptyTitleProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
  className?: string;
};

export type EmptyDescriptionProps = React.HTMLAttributes<HTMLParagraphElement> & {
  children: React.ReactNode;
  className?: string;
};

export type EmptyContentProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
  className?: string;
};
