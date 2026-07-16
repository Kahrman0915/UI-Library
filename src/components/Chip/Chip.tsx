import { forwardRef } from 'react';
import type { ChipProps } from './Chip.types';
import './Chip.scss';

const Chip = forwardRef<HTMLButtonElement, ChipProps>(
  (
    {
      id,
      label,
      size = 'default',
      active = false,
      disabled = false,
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
    return (
      <button
        {...rest}
        ref={ref}
        id={id}
        type="button"
        className={`ui-chip ui-chip--sz-${size}${active ? ' ui-chip--active' : ''}${className ? ' ' + className : ''}`}
        disabled={disabled}
        onClick={onClick}
        aria-pressed={active}
        aria-label={ariaLabel}
      >
        {IconLeft && <IconLeft />}
        {IconCenter && <IconCenter />}
        {label}
        {IconRight && <IconRight />}
      </button>
    );
  },
);

Chip.displayName = 'Chip';

export default Chip;
