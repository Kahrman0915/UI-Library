import type { InputSize } from '../Input/Input.types';

export type TextareaSize = InputSize;

export type TextareaProps = Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  'onChange'
> & {
  id: string;
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: boolean;
  errorMessage?: React.ReactNode;
  size?: TextareaSize;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  /**
   * Convenience callback receiving just the string value. Runs alongside
   * `onChange` — you can use either or both.
   */
  onValueChange?: (value: string) => void;
  className?: string;
};
