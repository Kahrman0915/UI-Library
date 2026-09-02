import { forwardRef } from 'react';
import type { BadgeProps } from './Badge.types';
import './Badge.scss';

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  (
    {
      id,
      label,
      color = 'default',
      appearance = 'solid',
      IconLeft,
      IconRight,
      IconCenter,
      className,
      ...rest
    },
    ref,
  ) => {
    // Two independent axes: the colour class sets a local palette, the
    // appearance class consumes it. Every colour therefore works with every
    // appearance, which the old flat variant list could not express.
    return (
      <div
        {...rest}
        ref={ref}
        id={id}
        className={`ui-badge ui-badge--${color} ui-badge--${appearance}${className ? ' ' + className : ''}`}
      >
        {IconLeft && <IconLeft />}
        {IconCenter && <IconCenter />}
        {label}
        {IconRight && <IconRight />}
      </div>
    );
  },
);

Badge.displayName = 'Badge';

export default Badge;
