import { forwardRef } from 'react';
import { X } from 'lucide-react';
import type { CloseButtonProps } from './CloseButton.types';
import '../../styles/icon-button.scss';
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
        className={`ui-icon-button${variant === 'background' ? ' ui-icon-button--fill' : ''} ui-close-button ui-close-button--${variant} ui-close-button--sz-${size}${className ? ' ' + className : ''}`}
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
