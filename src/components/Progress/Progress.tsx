import { forwardRef, useContext, useMemo } from 'react';
import { ProgressContext } from './Progress.context';
import type {
  ProgressIndicatorProps,
  ProgressLabelProps,
  ProgressProps,
  ProgressTrackProps,
  ProgressValueProps,
} from './Progress.types';
import './Progress.scss';

const useProgress = () => {
  const ctx = useContext(ProgressContext);
  if (!ctx) {
    throw new Error(
      'Progress subcomponents must be used inside <Progress>.',
    );
  }
  return ctx;
};

const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));

const defaultFormatter = (percent: number): React.ReactNode => `${percent}%`;

// ═════════════════════════════════════════════════════════════════════════════
// Root — auto-renders header row (label + value) and track+indicator when the
// caller doesn't pass a compound children tree.
// ═════════════════════════════════════════════════════════════════════════════

const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      value: valueProp,
      max = 100,
      indeterminate = false,
      size = 'default',
      variant = 'default',
      label,
      showValue,
      valueFormatter = defaultFormatter,
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    const value = indeterminate ? 0 : clamp(valueProp ?? 0, 0, max);
    const percent = indeterminate ? 0 : Math.round((value / max) * 100);

    const ctxValue = useMemo(
      () => ({ value, max, percent, indeterminate, valueFormatter }),
      [value, max, percent, indeterminate, valueFormatter],
    );

    const hasChildren = children !== undefined && children !== null;
    const hasHeader = !!label || !!showValue;

    return (
      <ProgressContext.Provider value={ctxValue}>
        <div
          {...rest}
          ref={ref}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={max}
          aria-valuenow={indeterminate ? undefined : value}
          data-state={indeterminate ? 'indeterminate' : 'determinate'}
          data-variant={variant}
          data-size={size}
          className={`ui-progress ui-progress--sz-${size} ui-progress--${variant}${indeterminate ? ' ui-progress--indeterminate' : ''}${className ? ' ' + className : ''}`}
        >
          {hasChildren ? (
            children
          ) : (
            <>
              {hasHeader && (
                <div className="ui-progress__header">
                  {label && <ProgressLabel>{label}</ProgressLabel>}
                  {showValue && <ProgressValue />}
                </div>
              )}
              <ProgressTrack>
                <ProgressIndicator />
              </ProgressTrack>
            </>
          )}
        </div>
      </ProgressContext.Provider>
    );
  },
);

Progress.displayName = 'Progress';

// ═════════════════════════════════════════════════════════════════════════════
// Header slots
// ═════════════════════════════════════════════════════════════════════════════

const ProgressLabel = forwardRef<HTMLSpanElement, ProgressLabelProps>(
  ({ className, children, ...rest }, ref) => {
    useProgress();
    return (
      <span
        {...rest}
        ref={ref}
        className={`ui-progress__label${className ? ' ' + className : ''}`}
      >
        {children}
      </span>
    );
  },
);

ProgressLabel.displayName = 'ProgressLabel';

const ProgressValue = forwardRef<HTMLSpanElement, ProgressValueProps>(
  ({ className, children, ...rest }, ref) => {
    const ctx = useProgress();
    const displayed =
      children !== undefined
        ? children
        : ctx.indeterminate
          ? ''
          : ctx.valueFormatter(ctx.percent, ctx.value, ctx.max);
    return (
      <span
        {...rest}
        ref={ref}
        className={`ui-progress__value${className ? ' ' + className : ''}`}
      >
        {displayed}
      </span>
    );
  },
);

ProgressValue.displayName = 'ProgressValue';

// ═════════════════════════════════════════════════════════════════════════════
// Track + Indicator
// ═════════════════════════════════════════════════════════════════════════════

const ProgressTrack = forwardRef<HTMLDivElement, ProgressTrackProps>(
  ({ className, children, ...rest }, ref) => {
    useProgress();
    return (
      <div
        {...rest}
        ref={ref}
        className={`ui-progress__track${className ? ' ' + className : ''}`}
      >
        {children}
      </div>
    );
  },
);

ProgressTrack.displayName = 'ProgressTrack';

const ProgressIndicator = forwardRef<HTMLDivElement, ProgressIndicatorProps>(
  ({ className, style, ...rest }, ref) => {
    const ctx = useProgress();
    const width = ctx.indeterminate ? '100%' : `${ctx.percent}%`;
    return (
      <div
        {...rest}
        ref={ref}
        className={`ui-progress__indicator${className ? ' ' + className : ''}`}
        style={{ width, ...style }}
      />
    );
  },
);

ProgressIndicator.displayName = 'ProgressIndicator';

export default Progress;
export { ProgressLabel, ProgressValue, ProgressTrack, ProgressIndicator };
