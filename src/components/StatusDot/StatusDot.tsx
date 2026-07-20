import { forwardRef } from 'react';
import type { StatusDotProps } from './StatusDot.types';
import './StatusDot.scss';

const StatusDot = forwardRef<HTMLSpanElement, StatusDotProps>(
  (
    { status = 'neutral', size = 'default', pulse = false, label, className, ...rest },
    ref,
  ) => {
    const hasLabel = label !== undefined && label !== '';
    return (
      <span
        {...rest}
        ref={ref}
        role={hasLabel ? 'status' : undefined}
        aria-label={hasLabel ? label : undefined}
        aria-hidden={hasLabel ? undefined : true}
        data-status={status}
        className={`ui-status-dot ui-status-dot--${status} ui-status-dot--sz-${size}${pulse ? ' ui-status-dot--pulse' : ''}${className ? ' ' + className : ''}`}
      />
    );
  },
);

StatusDot.displayName = 'StatusDot';

export default StatusDot;
