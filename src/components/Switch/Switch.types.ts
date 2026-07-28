export type SwitchSize = 'sm' | 'default' | 'lg';

/**
 * On/off toggle — a real `<input type="checkbox">` with `role="switch"`, kept
 * in the DOM (visually hidden) so forms and AT behave natively.
 *
 * Reach for a Switch when the change takes effect **immediately** (a setting).
 * If the value is only committed on submit, use a `Checkbox`.
 */
export type SwitchProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type' | 'onChange' | 'checked' | 'defaultChecked' | 'size'
> & {
  /** Required. Ties the `<label>` to the input and seeds `{id}-description`. */
  id: string;
  /** Controlled state. Pair with `onCheckedChange`. */
  checked?: boolean;
  /** Uncontrolled initial state. Ignored when `checked` is supplied. */
  defaultChecked?: boolean;
  /**
   * Change handler. Receives the boolean, not the event — the native
   * `onChange` is Omitted, so the event isn't reachable here.
   */
  onCheckedChange?: (checked: boolean) => void;
  /** Visible label beside the track, wired via `htmlFor`. */
  label?: React.ReactNode;
  /**
   * Helper text under the label. Rendered `aria-hidden` and exposed through the
   * input's `aria-describedby`, so it's announced as a *description* instead of
   * being glued onto the accessible name.
   */
  description?: React.ReactNode;
  disabled?: boolean;
  required?: boolean;
  /** Form field name. */
  name?: string;
  /** Submitted value when on. Defaults to `"on"`. */
  value?: string;
  /** Scales the track, the thumb and the label type together. */
  size?: SwitchSize;
  className?: string;
};
