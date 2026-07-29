import { forwardRef } from 'react';
import type { FabProps } from './Fab.types';
import './Fab.scss';

// A floating action button — fixed to a corner of the viewport. Token-driven:
// it fills with `--primary`, so under `data-surface='aiden'` it becomes the
// Aiden gradient (its signature "Ask Aiden" launcher), and picks up any host
// brand's colour elsewhere. `pulse` adds expanding sonar rings; `badge` shows
// a corner count.
const Fab = forwardRef<HTMLButtonElement, FabProps>(
  (
    {
      id,
      children,
      position = 'bottom-right',
      size = 'lg',
      pulse = false,
      badge,
      className,
      ...rest
    },
    ref,
  ) => (
    <button
      {...rest}
      ref={ref}
      id={id}
      type="button"
      className={`ui-fab ui-fab--pos-${position} ui-fab--sz-${size}${className ? ' ' + className : ''}`}
    >
      {pulse && (
        <span className="ui-fab__rings" aria-hidden="true">
          <span className="ui-fab__ring" />
          <span className="ui-fab__ring" />
          <span className="ui-fab__ring" />
        </span>
      )}
      <span className="ui-fab__icon">{children}</span>
      {badge != null && badge !== false && (
        <span className="ui-fab__badge" aria-hidden="true">
          {badge}
        </span>
      )}
    </button>
  ),
);

Fab.displayName = 'Fab';

export default Fab;
