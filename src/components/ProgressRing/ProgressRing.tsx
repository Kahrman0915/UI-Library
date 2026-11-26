import { forwardRef } from 'react';
import type { ProgressRingProps } from './ProgressRing.types';
import './ProgressRing.scss';

// The circle's circumference is 100 user units (r = 100 / 2π), so a percentage IS its dash
// length — `stroke-dasharray: 69 100` draws 69%. Component-internal geometry, like Switch's
// thumb travel: the viewBox is 36 so the 3.5-unit stroke clears the edge at every size.
const R = 15.9155;
const STROKE = 3.5;

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

/**
 * A share of a whole as a small ring — "69% of open items are moving". The circular sibling
 * of `Progress`, for a stat tile where a bar would not fit beside the number.
 */
const ProgressRing = forwardRef<HTMLDivElement, ProgressRingProps>(
  (
    {
      id,
      label,
      value,
      max = 100,
      size = 'default',
      variant = 'default',
      showValue,
      valueFormatter = (p) => `${p}%`,
      className,
      ...rest
    },
    ref,
  ) => {
    const percent = Math.round((clamp(value, 0, max) / (max || 1)) * 100);
    const withValue = showValue ?? size !== 'sm';
    return (
      <div
        aria-label={label}
        {...rest}
        ref={ref}
        id={id}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={clamp(value, 0, max)}
        aria-valuetext={valueFormatter(percent)}
        className={`ui-progress-ring ui-progress-ring--sz-${size} ui-progress-ring--${variant}${className ? ' ' + className : ''}`}
      >
        <svg className="ui-progress-ring__svg" viewBox="0 0 36 36" aria-hidden="true" focusable="false">
          <circle className="ui-progress-ring__track" cx="18" cy="18" r={R} strokeWidth={STROKE} />
          <circle
            className="ui-progress-ring__indicator"
            cx="18"
            cy="18"
            r={R}
            strokeWidth={STROKE}
            strokeDasharray={`${percent} 100`}
          />
        </svg>
        {withValue && (
          <span className="ui-progress-ring__value" aria-hidden="true">
            {valueFormatter(percent)}
          </span>
        )}
      </div>
    );
  },
);

ProgressRing.displayName = 'ProgressRing';

export default ProgressRing;
