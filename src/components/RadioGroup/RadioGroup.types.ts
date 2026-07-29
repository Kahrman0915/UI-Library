/** `horizontal` lays the options in a row — best for two or three short ones. */
export type RadioGroupOrientation = 'vertical' | 'horizontal';
/** Scales the circle, the dot and the label text together. */
export type RadioGroupSize = 'sm' | 'default' | 'lg';

/**
 * One choice from a small set of mutually exclusive options, all visible at
 * once. Past roughly seven the list stops being scannable — use a `Select`.
 *
 * `onChange` and `defaultValue` are Omitted; the value-based versions below
 * replace them.
 */
export type RadioGroupProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'onChange' | 'defaultValue'
> & {
  /** Required. Seeds `{id}-label` / `{id}-description` for the group's aria wiring. */
  id: string;
  /** Shared `name` for the underlying inputs, so the group posts with a form.
   *  Defaults to `id` when omitted. */
  name?: string;
  /** Controlled selection — the selected item's `value`. Pair with `onValueChange`. */
  value?: string;
  /** Uncontrolled initial selection. Ignored when `value` is supplied. */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Disables every item in the group. */
  disabled?: boolean;
  /** Adds `aria-required` and a `*` on the group label. */
  required?: boolean;
  /** Default `vertical`. See {@link RadioGroupOrientation}. */
  orientation?: RadioGroupOrientation;
  /** Scales the radios + label text for every item in the group. */
  size?: RadioGroupSize;
  /** Group heading, wired via `aria-labelledby`. */
  label?: React.ReactNode;
  /** Helper text for the group, wired via `aria-describedby`. */
  description?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
};

/**
 * One option. Checked state, `name` and the change handler all come from the
 * enclosing group, which is why those props are Omitted here — set them on
 * `RadioGroup`. (`size` is Omitted too: the native attribute would collide, and
 * sizing is a group-level decision.)
 */
export type RadioGroupItemProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type' | 'onChange' | 'checked' | 'defaultChecked' | 'value' | 'size' | 'name'
> & {
  /** Required. Ties the input to its label via `htmlFor`. */
  id: string;
  /** Reported by the group's `onValueChange`. Must be unique in the group. */
  value: string;
  /** Rendered through the shared `<Label>`. */
  label?: React.ReactNode;
  /** Helper text under the label. Referenced by `aria-describedby`, not the name. */
  description?: React.ReactNode;
  /** Disables just this option. The group's `disabled` overrides all of them. */
  disabled?: boolean;
  className?: string;
};
