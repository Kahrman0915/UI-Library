import { forwardRef } from 'react';
import { DirectionContext } from './Direction.context';
import type { DirectionProviderProps } from './Direction.types';
import './Direction.scss';

// ═════════════════════════════════════════════════════════════════════════════
// DirectionProvider — sets the `dir` attribute on a layout-neutral wrapper
// (display: contents) and shares the direction via context. Components styled
// with CSS logical properties mirror automatically under `dir="rtl"`; those
// that position in JS can read it with `useDirection`.
// ═════════════════════════════════════════════════════════════════════════════

const DirectionProvider = forwardRef<HTMLDivElement, DirectionProviderProps>(
  ({ dir, className, children, ...rest }, ref) => (
    <DirectionContext.Provider value={dir}>
      <div
        {...rest}
        ref={ref}
        dir={dir}
        className={`ui-direction${className ? ' ' + className : ''}`}
      >
        {children}
      </div>
    </DirectionContext.Provider>
  ),
);

DirectionProvider.displayName = 'DirectionProvider';

export default DirectionProvider;
export { useDirection } from './Direction.context';
