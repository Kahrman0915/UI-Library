export type ButtonGroupOrientation = 'horizontal' | 'vertical';

export type ButtonGroupProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children'
> & {
  id: string;
  children: React.ReactNode;
  orientation?: ButtonGroupOrientation;
  className?: string;
};

export type ButtonGroupSeparatorProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children'
> & {
  id: string;
  orientation?: ButtonGroupOrientation;
  className?: string;
};

export type ButtonGroupTextProps = React.HTMLAttributes<HTMLDivElement> & {
  id: string;
  children: React.ReactNode;
  className?: string;
};
