export type InputSize = 'sm' | 'default' | 'lg';

export type InputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'size' | 'onChange'
> & {
  id: string;
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: boolean;
  errorMessage?: React.ReactNode;
  IconLeft?: React.FC;
  IconRight?: React.FC;
  size?: InputSize;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /**
   * Convenience callback receiving just the string value. Runs alongside
   * `onChange` — you can use either or both.
   */
  onValueChange?: (value: string) => void;
  className?: string;
};
