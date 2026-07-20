import { forwardRef, useState } from 'react';
import type { ToggleProps } from './Toggle.types';
import './Toggle.scss';

const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(
  (
    {
      id,
      pressed,
      defaultPressed = false,
      onPressedChange,
      variant = 'default',
      size = 'default',
      disabled = false,
      label,
      IconLeft,
      IconCenter,
      'aria-label': ariaLabel,
      className,
      ...rest
    },
    ref,
  ) => {
    const isControlled = pressed !== undefined;
    const [internal, setInternal] = useState(defaultPressed);
    const isPressed = isControlled ? pressed : internal;

    const toggle = () => {
      const next = !isPressed;
      if (!isControlled) setInternal(next);
      onPressedChange?.(next);
    };

    const iconOnly = !!IconCenter && label === undefined;

    return (
      <button
        {...rest}
        ref={ref}
        id={id}
        type="button"
        aria-pressed={isPressed}
        disabled={disabled}
        aria-label={ariaLabel}
        className={`ui-toggle ui-toggle--${variant} ui-toggle--sz-${size}${isPressed ? ' ui-toggle--pressed' : ''}${iconOnly ? ' ui-toggle--icon-only' : ''}${className ? ' ' + className : ''}`}
        onClick={toggle}
      >
        {IconLeft && <IconLeft />}
        {IconCenter && <IconCenter />}
        {label}
      </button>
    );
  },
);

Toggle.displayName = 'Toggle';

export default Toggle;
