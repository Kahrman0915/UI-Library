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

export type ToggleGroupItemProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'onClick' | 'type' | 'value'
> & {
  value: string;
  label?: React.ReactNode;
  IconLeft?: React.FC;
  IconCenter?: React.FC;
  disabled?: boolean;
  'aria-label'?: string;
  className?: string;
};
