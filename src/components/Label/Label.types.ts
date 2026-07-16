export type LabelSize = 'sm' | 'default' | 'lg';

export type LabelProps = Omit<
  React.LabelHTMLAttributes<HTMLLabelElement>,
  'children'
> & {
  children: React.ReactNode;
  htmlFor?: string;
  size?: LabelSize;
  required?: boolean;
  disabled?: boolean;
  description?: React.ReactNode;
  className?: string;
};
