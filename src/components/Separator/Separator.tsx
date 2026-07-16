import { forwardRef } from 'react';
import type { SeparatorProps } from './Separator.types';
import './Separator.scss';

const Separator = forwardRef<HTMLDivElement, SeparatorProps>(
  (
    {
      orientation = 'horizontal',
      decorative = false,
      label,
      className,
      ...rest
    },
    ref,
  ) => {
    const effectiveOrientation = label ? 'horizontal' : orientation;
    const hasLabel = label !== undefined && label !== null && label !== '';

    return (
      <div
        {...rest}
        ref={ref}
        role={decorative ? 'none' : 'separator'}
        aria-orientation={decorative ? undefined : effectiveOrientation}
        data-orientation={effectiveOrientation}
        className={`ui-separator ui-separator--${effectiveOrientation}${hasLabel ? ' ui-separator--labeled' : ''}${className ? ' ' + className : ''}`}
      >
        {hasLabel && <span className="ui-separator__label">{label}</span>}
      </div>
    );
  },
);

Separator.displayName = 'Separator';

export default Separator;
