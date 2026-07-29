import type { InputSize } from '../Input/Input.types';

/** Shares Input's height scale so the two line up in a form. */
export type TextareaSize = InputSize;

export type TextareaProps = Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  'onChange'
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
  /** Default `default`. See {@link TextareaSize}. */
  size?: TextareaSize;
  /** The native event handler. Runs alongside `onValueChange`. */
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  /**
   * Convenience callback receiving just the string value. Runs alongside
   * `onChange` — you can use either or both.
   */
  onValueChange?: (value: string) => void;
  className?: string;
};
