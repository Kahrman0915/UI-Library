import { forwardRef } from 'react';
import type { ButtonProps } from './Button.types';
import { spinnerSize, aidenStyles } from './Button.constants';
import Spinner from '#components/Spinner/Spinner';
import { useRipple } from '#/hooks/useRipple';
import './Button.scss';

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      id,
      label,
      variant = 'default',
      style: styleProp = 'default',
      size = 'default',
      type = 'button',
      disabled = false,
      isLoading = false,
      ripple = false,
      iconOnly = false,
      onClick,
      onPointerDown,
      IconLeft,
      IconRight,
      IconCenter,
      'aria-label': ariaLabel,
      className,
      ...rest
    },
    ref,
  ) => {
    const style =
      variant === 'aiden' && !aidenStyles.has(styleProp) ? 'default' : styleProp;

    // Ripple is opt-in and off the default path. The hook is a no-op unless
    // `ripple` is on and the button is interactive.
    const { onPointerDown: rippleDown } = useRipple(
      !ripple || disabled || isLoading,
    );

    const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
      onPointerDown?.(e);
      if (ripple) rippleDown(e);
    };

    return (
      <button
        {...rest}
        ref={ref}
        id={id}
        className={`ui-button ui-button--${variant} ui-button--${variant}-${style} ui-button--sz-${size}${isLoading ? ' ui-button--loading' : ''}${iconOnly ? ' ui-button--icon-only' : ''}${iconOnly && variant === 'aiden' ? ' ui-button--aiden-icon-only' : ''}${ripple ? ' ui-ripple' : ''}${className ? ' ' + className : ''}`}
        type={type}
        disabled={disabled || isLoading}
        onClick={onClick}
        onPointerDown={handlePointerDown}
        aria-label={ariaLabel}
      >
        {isLoading ? (
          <>
            <Spinner id={`${id}-spinner`} size={spinnerSize[size]} />
            {!iconOnly && label}
          </>
        ) : iconOnly ? (
          IconCenter && <IconCenter />
        ) : (
          <>
            {IconLeft && <IconLeft />}
            {label}
            {IconRight && <IconRight />}
          </>
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';

export default Button;
