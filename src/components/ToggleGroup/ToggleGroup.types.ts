import type { ToggleVariant, ToggleSize } from '../Toggle/Toggle.types';

export type ToggleGroupOrientation = 'horizontal' | 'vertical';

type ToggleGroupCommonProps = {
  id: string;
  disabled?: boolean;
  variant?: ToggleVariant;
  size?: ToggleSize;
  orientation?: ToggleGroupOrientation;
  className?: string;
  children?: React.ReactNode;
};

type ToggleGroupSingleProps = ToggleGroupCommonProps & {
  type: 'single';
  value?: string;
  defaultValue?: string;
  /**
   * Fires with the newly selected value. Re-clicking the active item CLEARS
   * the selection and fires with `''` (empty string = nothing selected) — a
   * single toggle group has no required selection.
   */
  onValueChange?: (value: string) => void;
};

type ToggleGroupMultipleProps = ToggleGroupCommonProps & {
  type: 'multiple';
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
};

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
  value: string;
  IconLeft?: React.FC;
  /** Icon-only item — renders a single centred glyph. Requires an `aria-label`. */
  IconCenter?: React.FC;
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
    | { label: React.ReactNode; 'aria-label'?: string }
    | { label?: undefined; 'aria-label': string }
  );
