export type CheckboxSize = 'sm' | 'default' | 'lg';

/**
 * Checkbox built on a real `<input type="checkbox">` — visually hidden but kept
 * in the DOM, so form submission, validation and native AT semantics all work.
 */
export type CheckboxProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type' | 'onChange' | 'checked' | 'defaultChecked' | 'size'
> & {
  /** Required. Ties the `<label>` to the input and seeds `{id}-description`. */
  id: string;
  /** Controlled checked state. Pair with `onCheckedChange`. */
  checked?: boolean;
  /** Uncontrolled initial state. Ignored when `checked` is supplied. */
  defaultChecked?: boolean;
  /**
   * Renders the dash instead of the tick, for a "some children selected"
   * parent. It's a DOM *property*, not an attribute, so it's applied via an
   * effect — and it layers on top of `checked` rather than being a third state.
   */
  indeterminate?: boolean;
  /**
   * Change handler. Receives the boolean, not the event — the native
   * `onChange` is Omitted, so the event isn't reachable here.
   */
  onCheckedChange?: (checked: boolean) => void;
  /** Visible label beside the box, wired via `htmlFor`. */
  label?: React.ReactNode;
  /**
   * Helper text under the label. Rendered `aria-hidden` and exposed through the
   * input's `aria-describedby`, so it's announced as a *description* instead of
   * being glued onto the accessible name.
   */
  description?: React.ReactNode;
  disabled?: boolean;
  /** Adds the native `required` and a `*` on the label. Note there is no
   *  `error` prop — validation styling is the consumer's (or `Field`'s) job. */
  required?: boolean;
  /** Scales the box, the tick and the label type together. */
  size?: CheckboxSize;
  /** Form field name. */
  name?: string;
  /** Submitted value when checked. Defaults to `"on"`, like a native checkbox. */
  value?: string;
  className?: string;
};
