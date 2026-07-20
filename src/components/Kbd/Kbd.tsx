import { forwardRef } from 'react';
import type { KbdProps } from './Kbd.types';
import './Kbd.scss';

const Kbd = forwardRef<HTMLElement, KbdProps>(
  ({ size = 'default', className, children, ...rest }, ref) => {
    return (
      <kbd
        {...rest}
        ref={ref}
        className={`ui-kbd ui-kbd--sz-${size}${className ? ' ' + className : ''}`}
      >
        {children}
      </kbd>
    );
  },
);

Kbd.displayName = 'Kbd';

export default Kbd;
