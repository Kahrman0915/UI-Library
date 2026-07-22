import { forwardRef } from 'react';
import type { BadgeProps } from './Badge.types';
import './Badge.scss';

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  (
    {
      id,
      label,
      variant = 'default',
      category,
      categoryStyle = 'soft',
      IconLeft,
      IconRight,
      IconCenter,
      className,
      ...rest
    },
    ref,
  ) => {
    // A category hue renders the tag (soft tint or solid fill) and overrides the
    // variant styling.
    const styleClass = category
      ? `ui-badge--cat-${category}${categoryStyle === 'solid' ? '-solid' : ''}`
      : `ui-badge--${variant}`;
    return (
      <div
        {...rest}
        ref={ref}
        id={id}
        className={`ui-badge ${styleClass}${className ? ' ' + className : ''}`}
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
