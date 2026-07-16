export type NativeSelectSize = 'sm' | 'default' | 'lg';

export type NativeSelectProps = Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  'size' | 'onChange'
> & {
  id: string;
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: boolean;
  errorMessage?: React.ReactNode;
  size?: NativeSelectSize;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  /**
   * Convenience callback receiving just the selected value. Runs alongside
   * `onChange` — use either or both.
   */
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
};

export type NativeSelectOptionProps =
  React.OptionHTMLAttributes<HTMLOptionElement> & {
    children: React.ReactNode;
  };

export type NativeSelectOptGroupProps =
  React.OptgroupHTMLAttributes<HTMLOptGroupElement> & {
    children: React.ReactNode;
  };
