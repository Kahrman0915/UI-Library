export type SwitchSize = 'sm' | 'default' | 'lg';

export type SwitchProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type' | 'onChange' | 'checked' | 'defaultChecked' | 'size'
> & {
  id: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: React.ReactNode;
  description?: React.ReactNode;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  value?: string;
  size?: SwitchSize;
  className?: string;
};
