import type { ToggleVariant, ToggleSize } from '../Toggle/Toggle.types';

/** `vertical` stacks the segments; borders collapse along the other axis. */
export type ToggleGroupOrientation = 'horizontal' | 'vertical';

type ToggleGroupCommonProps = {
  /** Required. Seeds each item's id. */
  id: string;
  /** Disables every item in the group. */
  disabled?: boolean;
  /** Applied to every item. See `ToggleVariant`. */
  variant?: ToggleVariant;
  /** Applied to every item. See `ToggleSize`. */
  size?: ToggleSize;
  /** Default `horizontal`. See {@link ToggleGroupOrientation}. */
  orientation?: ToggleGroupOrientation;
  className?: string;
  children?: React.ReactNode;
};

type ToggleGroupSingleProps = ToggleGroupCommonProps & {
  /** One-of-N — a segmented control. The common case. */
  type: 'single';
  /** Controlled — the selected item's `value`, or `''` for none. */
  value?: string;
  /** Uncontrolled initial selection. Ignored when `value` is supplied. */
  defaultValue?: string;
  /**
   * Fires with the newly selected value. Re-clicking the active item CLEARS
   * the selection and fires with `''` (empty string = nothing selected) — a
   * single toggle group has no required selection.
   */
  onValueChange?: (value: string) => void;
};

type ToggleGroupMultipleProps = ToggleGroupCommonProps & {
  /** Any number of segments active at once. */
  type: 'multiple';
  /** Controlled — the active items' values. Pair with `onValueChange`. */
  value?: string[];
  /** Uncontrolled initial selection. Ignored when `value` is supplied. */
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
};

/**
 * A segmented control — one-of-N (`type="single"`) or explicit multi.
 *
 * Reach for this whenever exactly one option is selected at a time: a view
 * switcher, a status filter. Independent many-on pills are `Chip`; a single
 * standalone on/off is `Toggle`.
 *
 * Items reuse `.ui-toggle` and collapse their shared borders, ButtonGroup-style.
 * `defaultValue` / `onChange` are Omitted because their shape changes with `type`.
 */
export type ToggleGroupProps = (
  | ToggleGroupSingleProps
  | ToggleGroupMultipleProps
) &
  Omit<
    React.HTMLAttributes<HTMLDivElement>,
    'defaultValue' | 'onChange' | 'children' | 'className' | 'id'
  >;

/**
 * The mode-specific props flattened into a non-union shape. **Internal only** —
 * the root strips these from `...rest` before spreading onto the DOM (React
 * warns on the string ones), the same two-step destructure Accordion / Slider
 * use to keep `type` an aliased discriminant.
 */
export type ToggleGroupValueProps = {
  value?: string | string[];
  defaultValue?: string | string[];
  onValueChange?: ((value: string) => void) | ((value: string[]) => void);
};

type ToggleGroupItemBase = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'onClick' | 'type' | 'value' | 'aria-label'
> & {
  /** This segment's identity, reported by the group's `onValueChange`. Must be
   *  unique in the group. */
  value: string;
  /** Icon before the label. Must be a zero-prop component (`() => JSX`). */
  IconLeft?: React.FC;
  /** Icon-only item — renders a single centred glyph. Requires an `aria-label`. */
  IconCenter?: React.FC;
  /** Disables just this segment. The group's `disabled` overrides all of them. */
  disabled?: boolean;
  className?: string;
};

/**
 * Same rule as Toggle and Chip: a visible `label` supplies the accessible name,
 * and without one `aria-label` is required. Icon-only items are the common case
 * in a segmented control, so this is the shape most likely to need it.
 */
export type ToggleGroupItemProps = ToggleGroupItemBase &
  (
    | {
        /** Visible text. Supplying it makes `aria-label` optional. */
        label: React.ReactNode;
        /** Optional here — the visible `label` already names the segment. */
        'aria-label'?: string;
      }
    | {
        /** Omitted — this is the icon-only form, the common case in a
         *  segmented control. */
        label?: undefined;
        /** **Required** without a visible `label`. */
        'aria-label': string;
      }
  );
