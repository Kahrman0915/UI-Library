import { forwardRef } from 'react';
import { X } from 'lucide-react';
import type { CloseButtonProps } from './CloseButton.types';
import './CloseButton.scss';

const CloseButton = forwardRef<HTMLButtonElement, CloseButtonProps>(
  (
    {
      id,
      variant = 'default',
      size = 'default',
      disabled = false,
      onClick,
      ariaLabel = 'Close',
      className,
      ...rest
    },
    ref,
  ) => {
    return (
      <button
        {...rest}
        ref={ref}
        id={id}
        type="button"
        className={`ui-close-button ui-close-button--${variant} ui-close-button--sz-${size}${className ? ' ' + className : ''}`}
        disabled={disabled}
        onClick={onClick}
        aria-label={ariaLabel}
      >
        <span data-testid="close-icon">
          <X />
        </span>
      </button>
    );
  },
);

CloseButton.displayName = 'CloseButton';

export default CloseButton;
