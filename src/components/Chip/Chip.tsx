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
    // Same rule as Toggle and ToggleGroup: an IconCenter with no label is an
    // icon-only chip. Without this, IconCenter rendered in the same slot as
    // IconLeft and was indistinguishable from it.
    const iconOnly = !!IconCenter && label === undefined;

    return (
      <button
        {...rest}
        ref={ref}
        id={id}
        type="button"
        className={`ui-chip ui-chip--sz-${size}${active ? ' ui-chip--active' : ''}${iconOnly ? ' ui-chip--icon-only' : ''}${className ? ' ' + className : ''}`}
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
