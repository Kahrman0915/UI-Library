import type { Side, Align } from '#/utils/computePosition';

export type SelectSize = 'sm' | 'default' | 'lg';
export type SelectSide = Side;
export type SelectAlign = Align;

/**
 * Styled floating listbox.
 *
 * **Picking between the three "select" components is a behaviour decision — they
 * look identical when closed:**
 * - `NativeSelect` — the default. Short lists (≤ ~7), best on mobile, cheapest.
 * - `Select` — this one. Use when you need rich items: icons, descriptions,
 *   groups, separators.
 * - `Combobox` — the only one with a search field. Use for long lists.
 *
 * Renders its own label, description and error message; a hidden input carries
 * `name`/`value` so it submits inside a plain form.
 */
export type SelectProps = {
  /** Required. Seeds `{id}-trigger`, `{id}-content`, `{id}-description`, `{id}-error`. */
  id: string;
  /** Controlled selection. Pair with `onValueChange`. */
  value?: string;
  /** Uncontrolled initial selection. Ignored when `value` is supplied. */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Controlled open state — independent of `value`. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Renders a hidden input under this name so the value posts with a form. */
  name?: string;
  disabled?: boolean;
  /** Adds `aria-required` and a `*` on the label. */
  required?: boolean;
  size?: SelectSize;
  label?: React.ReactNode;
  /** Helper text. Exposed via the trigger's `aria-describedby`, not its name. */
  description?: React.ReactNode;
  /** Paints the error border and sets `aria-invalid`. */
  error?: boolean;
  /** Message text. Only rendered when `error` is also true. */
  errorMessage?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
};

export type SelectTriggerProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'type'
> & {
  /** Shown when nothing is selected. */
  placeholder?: React.ReactNode;
  className?: string;
};

export type SelectContentProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Default `bottom`. No collision detection — it won't flip near an edge. */
  side?: SelectSide;
  /** Default `start`. */
  align?: SelectAlign;
  /** Gap between trigger and listbox, **in px**. Default `4`. */
  sideOffset?: number;
  /** Default `true` — the listbox takes the trigger's width as its minimum. */
  matchTriggerWidth?: boolean;
  className?: string;
  children?: React.ReactNode;
};

export type SelectItemProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'onSelect'
> & {
  /** The value reported by `onValueChange`. Must be unique in the Select. */
  value: string;
  disabled?: boolean;
  /**
   * Plain-text label used on the *trigger* when this item is selected. Supply
   * it when `children` is rich (an icon + two lines of text) and wouldn't read
   * well collapsed into the trigger. Falls back to `children`.
   */
  label?: React.ReactNode;
  className?: string;
  /** What the row renders. Falls back to `label` if omitted. */
  children?: React.ReactNode;
};

/** Groups related items under a heading. */
export type SelectGroupProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Heading text for the group. */
  label?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
};

/** Standalone heading row, for grouping without a `SelectGroup` wrapper. */
export type SelectLabelProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  children?: React.ReactNode;
};

/** Hairline between item groups. */
export type SelectSeparatorProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
};
