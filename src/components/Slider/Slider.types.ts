/** Track and thumb dimensions. */
export type SliderSize = 'sm' | 'default' | 'lg';

type SliderCommonProps = {
  id: string;
  /** Lower bound. Default 0. */
  min?: number;
  /** Upper bound. Default 100. */
  max?: number;
  /** Granularity. Values snap to `min + n * step`. Default 1. */
  step?: number;
  disabled?: boolean;
  /** Renders a `<Label>` above the track, associated with the (first) thumb. */
  label?: React.ReactNode;
  /** Secondary line under the label — passed through to `<Label>`. */
  description?: React.ReactNode;
  /** Show the current value (or `min – max` when `range`) beside the label. */
  showValue?: boolean;
  /** Format the displayed value. Defaults to `String(value)`. */
  formatValue?: (value: number) => string;
  /** Default `default`. See {@link SliderSize}. */
  size?: SliderSize;
  className?: string;
};

type SliderSingleProps = SliderCommonProps & {
  /** One thumb. The default. */
  range?: false;
  /** Controlled value. Pair with `onValueChange`. */
  value?: number;
  /** Uncontrolled initial value. Ignored when `value` is supplied. */
  defaultValue?: number;
  onValueChange?: (value: number) => void;
};

type SliderRangeProps = SliderCommonProps & {
  /** Two thumbs. Values are `[lower, upper]` and can't cross. */
  range: true;
  /** Controlled `[lower, upper]`. Pair with `onValueChange`. */
  value?: [number, number];
  /** Uncontrolled initial `[lower, upper]`. Ignored when `value` is supplied. */
  defaultValue?: [number, number];
  onValueChange?: (value: [number, number]) => void;
};

export type SliderProps = (SliderSingleProps | SliderRangeProps) &
  Omit<
    React.HTMLAttributes<HTMLDivElement>,
    'defaultValue' | 'onChange' | 'children' | 'className' | 'id'
  >;

/**
 * The four mode-specific props, flattened into a non-union shape.
 *
 * **Internal only** — the public API is the discriminated `SliderProps` union
 * above. The root strips these from the DOM spread using this type, the same
 * way `Accordion` does: spreading `range` / `value` / `defaultValue` /
 * `onValueChange` onto a `<div>` leaks them as DOM attributes and makes React
 * warn on the boolean.
 */
export type SliderValueProps = {
  range?: boolean;
  value?: number | [number, number];
  defaultValue?: number | [number, number];
  onValueChange?: ((value: number) => void) | ((value: [number, number]) => void);
};
