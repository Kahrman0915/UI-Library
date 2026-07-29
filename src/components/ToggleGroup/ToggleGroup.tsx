import { forwardRef, useCallback, useContext, useMemo, useState } from 'react';
import { ToggleGroupContext } from './ToggleGroup.context';
import type {
  ToggleGroupProps,
  ToggleGroupItemProps,
  ToggleGroupValueProps,
} from './ToggleGroup.types';
import '../Toggle/Toggle.scss';
import './ToggleGroup.scss';

// ═════════════════════════════════════════════════════════════════════════════
// Root — single | multiple selection, controlled or uncontrolled.
// ═════════════════════════════════════════════════════════════════════════════

const ToggleGroup = forwardRef<HTMLDivElement, ToggleGroupProps>((props, ref) => {
  const {
    id,
    disabled = false,
    variant = 'default',
    size = 'default',
    orientation = 'horizontal',
    className,
    children,
    type,
    ...restProps
  } = props;

  // Keep these out of `...rest` so they don't leak to the DOM. Read below off
  // `props` so `type` stays an aliased discriminant (Accordion / Slider pattern).
  const {
    value: _value,
    defaultValue: _defaultValue,
    onValueChange: _onValueChange,
    ...rest
  } = restProps as typeof restProps & ToggleGroupValueProps;

  const [singleInternal, setSingleInternal] = useState<string | undefined>(
    type === 'single' ? props.defaultValue : undefined,
  );
  const [multipleInternal, setMultipleInternal] = useState<string[]>(
    type === 'multiple' ? (props.defaultValue ?? []) : [],
  );

  // Extracted so the useCallback deps track the VALUES, not the whole `props`
  // object — `props` is a fresh object every render, which made these callbacks
  // (and the context memo below) new on every render, re-rendering every item.
  const valueProp = props.value;
  const onValueChangeProp = props.onValueChange;

  const isPressed = useCallback(
    (itemValue: string): boolean => {
      if (type === 'single') {
        const current = valueProp !== undefined ? valueProp : singleInternal;
        return current === itemValue;
      }
      const current =
        valueProp !== undefined ? (valueProp as string[]) : multipleInternal;
      return current.includes(itemValue);
    },
    [type, valueProp, singleInternal, multipleInternal],
  );

  const toggle = useCallback(
    (itemValue: string) => {
      if (type === 'single') {
        const controlled = valueProp !== undefined;
        const current = controlled ? valueProp : singleInternal;
        // Re-selecting the active item clears it (a single toggle group has no
        // required selection).
        const next = current === itemValue ? undefined : itemValue;
        if (!controlled) setSingleInternal(next);
        (onValueChangeProp as ((v: string) => void) | undefined)?.(next ?? '');
      } else {
        const controlled = valueProp !== undefined;
        const current = controlled
          ? (valueProp as string[])
          : multipleInternal;
        const next = current.includes(itemValue)
          ? current.filter((v) => v !== itemValue)
          : [...current, itemValue];
        if (!controlled) setMultipleInternal(next);
        (onValueChangeProp as ((v: string[]) => void) | undefined)?.(next);
      }
    },
    [type, valueProp, onValueChangeProp, singleInternal, multipleInternal],
  );

  const ctx = useMemo(
    () => ({ isPressed, toggle, disabled, variant, size }),
    [isPressed, toggle, disabled, variant, size],
  );

  return (
    <ToggleGroupContext.Provider value={ctx}>
      <div
        {...rest}
        ref={ref}
        id={id}
        role="group"
        data-orientation={orientation}
        className={`ui-toggle-group ui-toggle-group--${orientation}${className ? ' ' + className : ''}`}
      >
        {children}
      </div>
    </ToggleGroupContext.Provider>
  );
});

ToggleGroup.displayName = 'ToggleGroup';

// ═════════════════════════════════════════════════════════════════════════════
// Item — a toggle wired to the group's context; reuses the .ui-toggle visual.
// ═════════════════════════════════════════════════════════════════════════════

const ToggleGroupItem = forwardRef<HTMLButtonElement, ToggleGroupItemProps>(
  (
    {
      value,
      label,
      IconLeft,
      IconCenter,
      disabled: itemDisabled,
      'aria-label': ariaLabel,
      className,
      ...rest
    },
    ref,
  ) => {
    const ctx = useContext(ToggleGroupContext);
    if (!ctx) {
      throw new Error('ToggleGroupItem must be used inside <ToggleGroup>.');
    }
    const pressed = ctx.isPressed(value);
    const disabled = ctx.disabled || itemDisabled || false;
    const iconOnly = !!IconCenter && label === undefined;

    return (
      <button
        {...rest}
        ref={ref}
        type="button"
        aria-pressed={pressed}
        disabled={disabled}
        aria-label={ariaLabel}
        className={`ui-toggle ui-toggle--${ctx.variant} ui-toggle--sz-${ctx.size}${pressed ? ' ui-toggle--pressed' : ''}${iconOnly ? ' ui-toggle--icon-only' : ''}${className ? ' ' + className : ''}`}
        onClick={() => ctx.toggle(value)}
      >
        {IconLeft && <IconLeft />}
        {IconCenter && <IconCenter />}
        {label}
      </button>
    );
  },
);

ToggleGroupItem.displayName = 'ToggleGroupItem';

export default ToggleGroup;
export { ToggleGroupItem };
