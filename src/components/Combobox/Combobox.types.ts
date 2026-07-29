import type { Side, Align } from '#/utils/computePosition';

/** Trigger height. Matches Input's scale so the two line up in a form. */
export type ComboboxSize = 'sm' | 'default' | 'lg';
export type ComboboxSide = Side;
export type ComboboxAlign = Align;

/** One row in the list. Options are data here, not children — see `ComboboxProps.options`. */
export type ComboboxOption = {
  /** Reported by `onValueChange`. Must be unique in the list. */
  value: string;
  /** What the row renders, and what the trigger shows when selected. */
  label: React.ReactNode;
  /** Optional plain-text search key. Falls back to `label` when it's a string. */
  searchText?: string;
  /** Second line under the label. Not searched unless you set `searchText`. */
  description?: React.ReactNode;
  /** Rendered greyed and skipped by keyboard navigation. */
  disabled?: boolean;
};

/**
 * A filterable listbox — **the only one of the three select components with a
 * search field**. Use it when the list is long enough that scanning is work:
 * timezones, countries, a directory of users. For short lists prefer
 * `NativeSelect`; for rich-but-short ones, `Select`.
 *
 * Unlike `Select`, options are passed as **data** rather than children, because
 * the component has to filter them.
 *
 * `defaultValue` and `onChange` are Omitted — the native DOM versions collide
 * with the ones redefined below.
 */
export type ComboboxProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'defaultValue' | 'onChange'
> & {
  /** Required. Seeds `{id}-trigger`, `{id}-content`, `{id}-description`, `{id}-error`. */
  id: string;
  /** The full list. Filtering happens here, not in your render. */
  options: ComboboxOption[];
  /** Controlled selection. Pair with `onValueChange`. */
  value?: string;
  /** Uncontrolled initial selection. Ignored when `value` is supplied. */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Controlled open state — independent of `value`. */
  open?: boolean;
  /** Uncontrolled initial open state. Ignored when `open` is supplied. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Renders a hidden input under this name so the value posts with a form. */
  name?: string;
  /** Default `default`. See {@link ComboboxSize}. */
  size?: ComboboxSize;
  /** Rendered through the shared `<Label>`, wired to the trigger. */
  label?: React.ReactNode;
  /** Helper text. Exposed via the trigger's `aria-describedby`, not its name. */
  description?: React.ReactNode;
  /** Paints the error border and sets `aria-invalid`. */
  error?: boolean;
  /** Message text, announced via `role="alert"` when it appears. */
  errorMessage?: React.ReactNode;
  /** Shown on the trigger when nothing is selected. */
  placeholder?: React.ReactNode;
  /** Placeholder inside the search field, once open. */
  searchPlaceholder?: string;
  /** Shown when the filter matches nothing. */
  emptyMessage?: React.ReactNode;
  disabled?: boolean;
  /** Adds `aria-required` and a `*` on the label. */
  required?: boolean;
  /** Show an X on the trigger that resets the selection. */
  clearable?: boolean;
  /**
   * Accessible name for the clear button. Default `'Clear selection'`. A prop
   * because the button is an internal element `...rest` can't reach.
   */
  clearLabel?: string;
  /** Optional custom filter. Default: case-insensitive substring on option label/searchText. */
  filter?: (option: ComboboxOption, search: string) => boolean;
  /** Default `bottom`. No collision detection — it won't flip near an edge. */
  side?: ComboboxSide;
  /** Default `start`. */
  align?: ComboboxAlign;
  /** Gap between trigger and listbox, **in px**. Default `4`. */
  sideOffset?: number;
  /** Default `true` — the listbox takes the trigger's width as its minimum. */
  matchTriggerWidth?: boolean;
  className?: string;
};
