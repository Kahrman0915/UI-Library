import { forwardRef } from 'react';
import { ArrowDownRight, ArrowRight, ArrowUpRight } from 'lucide-react';
import type { StatProps } from './Stat.types';
import './Stat.scss';

/**
 * One number and what it means: a label, the value, an optional change against
 * the last period, and an optional trend. Content only — it paints no surface,
 * so it sits in a `Card`, a bento tile, a table cell or a toolbar alike.
 *
 * The change's color says whether it is GOOD, not which way it went: the arrow
 * shows the direction, `goodDirection` decides green or red. A change of zero
 * is neutral and says so.
 */
const Stat = forwardRef<HTMLDivElement, StatProps>(
  (
    {
      id,
      label,
      value,
      description,
      tone = 'default',
      size = 'default',
      change,
      changeFormat = (n) => `${n}%`,
      changeLabel,
      goodDirection = 'up',
      trend,
      className,
      ...rest
    },
    ref,
  ) => {
    const dir = change === undefined ? null : change > 0 ? 'up' : change < 0 ? 'down' : 'flat';
    const verdict = dir === null || dir === 'flat' ? 'neutral' : dir === goodDirection ? 'good' : 'bad';
    const Arrow = dir === 'up' ? ArrowUpRight : dir === 'down' ? ArrowDownRight : ArrowRight;
    const spoken =
      dir === null ? '' : dir === 'flat' ? 'No change' : `${dir === 'up' ? 'Up' : 'Down'} ${changeFormat(Math.abs(change as number))}`;
    return (
      <div
        {...rest}
        ref={ref}
        id={id}
        role="group"
        aria-labelledby={`${id}-label`}
        className={[
          'ui-stat',
          size !== 'default' && `ui-stat--sz-${size}`,
          tone !== 'default' && `ui-stat--${tone}`,
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div className="ui-stat__label" id={`${id}-label`}>
          {label}
        </div>
        <div className="ui-stat__row">
          <div className="ui-stat__value">{value}</div>
          {dir !== null && (
            <div className={`ui-stat__change ui-stat__change--${verdict}`} id={`${id}-change`}>
              <Arrow aria-hidden="true" className="ui-stat__arrow" />
              {/* Seen: the arrow and the number. Heard: one sentence with the direction in words. */}
              <span aria-hidden="true">{dir === 'flat' ? 'No change' : changeFormat(Math.abs(change as number))}</span>
              <span className="ui-stat__sr">{`${spoken}${changeLabel ? ` ${changeLabel}` : ''}`}</span>
              {changeLabel && (
                <span className="ui-stat__change-label" aria-hidden="true">
                  {changeLabel}
                </span>
              )}
            </div>
          )}
        </div>
        {description && <div className="ui-stat__description">{description}</div>}
        {trend && <div className="ui-stat__trend">{trend}</div>}
      </div>
    );
  },
);

Stat.displayName = 'Stat';

export default Stat;
