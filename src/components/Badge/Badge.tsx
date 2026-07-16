import { forwardRef } from 'react';
import type { BadgeProps } from './Badge.types';
import './Badge.scss';

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  (
    {
      id,
      label,
      variant = 'default',
      IconLeft,
      IconRight,
      IconCenter,
      className,
      ...rest
    },
    ref,
  ) => {
    return (
      <div
        {...rest}
        ref={ref}
        id={id}
        className={`ui-badge ui-badge--${variant}${className ? ' ' + className : ''}`}
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
