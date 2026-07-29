/** Slot dimensions and type size. */
export type InputOTPSize = 'sm' | 'default' | 'lg';

// Extends the native input attributes so form plumbing (name, form, onBlur,
// data-*, aria-*) flows through to the single hidden <input> that owns the
// value. Omitted keys are the ones redefined below with narrowed types
// (`pattern` is a RegExp here, not the native string; `size` is the visual
// union, not the native width-in-chars number).
export type InputOTPProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'size' | 'value' | 'defaultValue' | 'onChange' | 'pattern' | 'inputMode' | 'type' | 'children'
> & {
  /** Required. Seeds `{id}-description` / `{id}-error` and ties the label. */
  id: string;
  /** Number of character slots. Default 6. */
  length?: number;
  /** Controlled value (pair with onChange). */
  value?: string;
  /** Uncontrolled initial value. Ignored when `value` is supplied. */
  defaultValue?: string;
  /** Receives the whole code as a string, not an event. */
  onChange?: (value: string) => void;
  /** Fires once when the final slot is filled. */
  onComplete?: (value: string) => void;
  disabled?: boolean;
  /** Paints the slot borders red and sets `aria-invalid`. */
  error?: boolean;
  /** Message text, announced via `role="alert"` when it appears. */
  errorMessage?: string;
  /** Default `default`. See {@link InputOTPSize}. */
  size?: InputOTPSize;
  /** Focus the field on mount — usual for a code screen the user just landed on. */
  autoFocus?: boolean;
  /** Regex matching a single allowed character. Default digits. */
  pattern?: RegExp;
  /** Which mobile keyboard to raise. Default `numeric`; set `text` for an
   *  alphanumeric code. */
  inputMode?: 'numeric' | 'text';
  /** Insert a separator every N slots (e.g. 3 → 3·3 for a 6-digit code). */
  groupSize?: number;
  /** Built-in label (composed via the shared <Label>). */
  label?: string;
  /** Helper text. Exposed via `aria-describedby`, not the accessible name. */
  description?: React.ReactNode;
  /** Adds `aria-required` and a `*` on the label. */
  required?: boolean;
  className?: string;
  /** Required when there's no visible `label` — the slots carry no text. */
  'aria-label'?: string;
};
