export type InputOTPSize = 'sm' | 'default' | 'lg';

export type InputOTPProps = {
  id: string;
  /** Number of character slots. Default 6. */
  length?: number;
  /** Controlled value (pair with onChange). */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Fires once when the final slot is filled. */
  onComplete?: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
  errorMessage?: string;
  size?: InputOTPSize;
  autoFocus?: boolean;
  /** Regex matching a single allowed character. Default digits. */
  pattern?: RegExp;
  inputMode?: 'numeric' | 'text';
  /** Insert a separator every N slots (e.g. 3 → 3·3 for a 6-digit code). */
  groupSize?: number;
  /** Built-in label (composed via the shared <Label>). */
  label?: string;
  description?: React.ReactNode;
  required?: boolean;
  className?: string;
  'aria-label'?: string;
};
