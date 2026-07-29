/** Field height. The shared scale for every form control in the library. */
export type InputSize = 'sm' | 'default' | 'lg';

export type InputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'size' | 'onChange'
> & {
  /** Required. Seeds `{id}-description` / `{id}-error` and ties the label. */
  id: string;
  /** Rendered through the shared `<Label>`, tied via `htmlFor`. */
  label?: React.ReactNode;
  /** Helper text. Exposed via `aria-describedby`, not the accessible name. */
  description?: React.ReactNode;
  /** Paints the error border and sets `aria-invalid`. */
  error?: boolean;
  /** Message text, announced via `role="alert"` when it appears. Only rendered
   *  when `error` is also true. */
  errorMessage?: React.ReactNode;
  /** Leading icon inside the field. Must be a zero-prop component. */
  IconLeft?: React.FC;
  /** Trailing icon inside the field. Must be a zero-prop component. */
  IconRight?: React.FC;
  /** Default `default`. See {@link InputSize}. */
  size?: InputSize;
  /** The native event handler. Runs alongside `onValueChange`. */
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /**
   * Convenience callback receiving just the string value. Runs alongside
   * `onChange` — you can use either or both.
   */
  onValueChange?: (value: string) => void;
  className?: string;
};
