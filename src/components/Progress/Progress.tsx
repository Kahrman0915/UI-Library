import { forwardRef, useContext, useId, useMemo } from 'react';
import type { CSSProperties } from 'react';
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

// Completion celebration — a fixed burst of particles that fly out from the
// finished (right) end of the bar. Shown only inside data-surface="aiden" (gated
// in CSS). Offsets are runtime geometry in px, like the ripple hook's coords.
const COMPLETE_PARTICLES = [
  { dx: 16, dy: -20, s: 5, d: 0 },
  { dx: 22, dy: -6, s: 4, d: 30 },
  { dx: 10, dy: -26, s: 6, d: 60 },
  { dx: -6, dy: -22, s: 4, d: 20 },
  { dx: 24, dy: 8, s: 5, d: 50 },
  { dx: 4, dy: 22, s: 4, d: 80 },
  { dx: 18, dy: 18, s: 5, d: 10 },
  { dx: -10, dy: 12, s: 3, d: 70 },
  { dx: 28, dy: -14, s: 4, d: 40 },
  { dx: 12, dy: 4, s: 6, d: 90 },
  { dx: -2, dy: -14, s: 3, d: 55 },
  { dx: 20, dy: 26, s: 4, d: 25 },
];

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
    const isComplete = !indeterminate && percent >= 100;

    const ctxValue = useMemo(
      () => ({ value, max, percent, indeterminate, valueFormatter }),
      [value, max, percent, indeterminate, valueFormatter],
    );

    const hasChildren = children !== undefined && children !== null;
    const hasHeader = !!label || !!showValue;

    // Name the progressbar via its rendered label (simple, non-children path).
    // Consumers using the children API, or with no label, can pass their own
    // aria-label / aria-labelledby through ...rest.
    const uid = useId();
    const labelId = `${uid}-label`;
    const nameProps =
      !hasChildren && label && !rest['aria-label'] && !rest['aria-labelledby']
        ? { 'aria-labelledby': labelId }
        : undefined;

    return (
      <ProgressContext.Provider value={ctxValue}>
        <div
          {...rest}
          {...nameProps}
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
                  {label && <ProgressLabel id={labelId}>{label}</ProgressLabel>}
                  {showValue && <ProgressValue />}
                </div>
              )}
              <div className="ui-progress__track-wrap">
                <ProgressTrack>
                  <ProgressIndicator />
                </ProgressTrack>
                {isComplete && (
                  <span className="ui-progress__particles" aria-hidden="true">
                    {COMPLETE_PARTICLES.map((p, i) => (
                      <span
                        key={i}
                        className="ui-progress__particle"
                        style={
                          {
                            '--particle-dx': `${p.dx}px`,
                            '--particle-dy': `${p.dy}px`,
                            '--particle-size': `${p.s}px`,
                            '--particle-delay': `${p.d}ms`,
                          } as CSSProperties
                        }
                      />
                    ))}
                  </span>
                )}
              </div>
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
