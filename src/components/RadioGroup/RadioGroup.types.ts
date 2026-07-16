export type RadioGroupOrientation = 'vertical' | 'horizontal';

export type RadioGroupProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'onChange' | 'defaultValue'
> & {
  id: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  orientation?: RadioGroupOrientation;
  label?: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
};

export type RadioGroupItemProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type' | 'onChange' | 'checked' | 'defaultChecked' | 'value' | 'size' | 'name'
> & {
  id: string;
  value: string;
  label?: React.ReactNode;
  description?: React.ReactNode;
  disabled?: boolean;
  className?: string;
};
