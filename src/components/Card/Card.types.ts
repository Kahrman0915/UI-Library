export type CardProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children'
> & {
  id: string;
  children: React.ReactNode;
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
