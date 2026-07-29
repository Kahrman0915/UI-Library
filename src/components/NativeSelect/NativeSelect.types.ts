/** Field height. Matches Input's scale so the two line up in a form. */
export type NativeSelectSize = 'sm' | 'default' | 'lg';

/**
 * The OS-native `<select>`, restyled to match our fields — native chrome
 * stripped, our own chevron overlaid.
 *
 * **The default choice** for short option lists (≤ ~7) and the best one on
 * mobile, where it gets the platform picker. Reach for `Select` when items need
 * icons or descriptions, and `Combobox` when the list needs searching.
 *
 * `size` is Omitted because the native attribute means "visible rows", not our
 * height scale; `onChange` is Omitted and redefined alongside `onValueChange`.
 */
export type NativeSelectProps = Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
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
  /** Default `default`. See {@link NativeSelectSize}. */
  size?: NativeSelectSize;
  /** The native event handler. Runs alongside `onValueChange`. */
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  /**
   * Convenience callback receiving just the selected value. Runs alongside
   * `onChange` — use either or both.
   */
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
};

/** A plain `<option>`. Text only — the native control can't render markup. */
export type NativeSelectOptionProps =
  React.OptionHTMLAttributes<HTMLOptionElement> & {
    children: React.ReactNode;
  };

/** A native `<optgroup>`. Set `label` for the group heading. */
export type NativeSelectOptGroupProps =
  React.OptgroupHTMLAttributes<HTMLOptGroupElement> & {
    children: React.ReactNode;
  };
