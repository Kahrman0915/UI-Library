import { forwardRef } from 'react';
import type { ButtonProps } from './Button.types';
import { spinnerSize, aidenStyles } from './Button.constants';
import Spinner from '#components/Spinner/Spinner';
import './Button.scss';
import { normalizeSize } from '#/utils/size';

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
      iconOnly = false,
      onClick,
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

    // Accept either size vocabulary; the SCSS is written against the
    // canonical spelling, so normalize once here. See utils/size.ts.
    const sz = normalizeSize(size);

    return (
      <button
        {...rest}
        ref={ref}
        id={id}
        className={`ui-button ui-button--${variant} ui-button--${variant}-${style} ui-button--sz-${sz}${isLoading ? ' ui-button--loading' : ''}${iconOnly ? ' ui-button--icon-only' : ''}${iconOnly && variant === 'aiden' ? ' ui-button--aiden-icon-only' : ''}${className ? ' ' + className : ''}`}
        type={type}
        disabled={disabled || isLoading}
        onClick={onClick}
        aria-label={ariaLabel}
      >
        {isLoading ? (
          <>
            <Spinner id={`${id}-spinner`} size={spinnerSize[sz]} />
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
