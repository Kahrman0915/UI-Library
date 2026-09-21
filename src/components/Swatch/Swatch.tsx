import { forwardRef } from 'react';
import type { SwatchProps } from './Swatch.types';
import './Swatch.scss';

const Swatch = forwardRef<HTMLSpanElement, SwatchProps>(
  (
    { color, size = 'default', shape = 'circle', label, className, ...rest },
    ref,
  ) => {
    const hasLabel = label !== undefined && label !== '';
    return (
      <span
        {...rest}
        ref={ref}
        role={hasLabel ? 'img' : undefined}
        aria-label={hasLabel ? label : undefined}
        aria-hidden={hasLabel ? undefined : true}
        data-color={color}
        className={`ui-swatch ui-swatch--${color} ui-swatch--sz-${size} ui-swatch--${shape}${className ? ' ' + className : ''}`}
      />
    );
  },
);

Swatch.displayName = 'Swatch';

export default Swatch;
