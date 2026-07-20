import { forwardRef } from 'react';
import type { AspectRatioProps } from './AspectRatio.types';
import './AspectRatio.scss';

const AspectRatio = forwardRef<HTMLDivElement, AspectRatioProps>(
  ({ ratio = 16 / 9, style, className, children, ...rest }, ref) => {
    return (
      <div
        {...rest}
        ref={ref}
        // The ratio is a per-instance value, not a design token — set inline,
        // the same way Slider positions its thumb. Consumer `style` wins.
        style={{ aspectRatio: String(ratio), ...style }}
        className={`ui-aspect-ratio${className ? ' ' + className : ''}`}
      >
        {children}
      </div>
    );
  },
);

AspectRatio.displayName = 'AspectRatio';

export default AspectRatio;
