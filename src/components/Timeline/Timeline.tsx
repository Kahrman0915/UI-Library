import { forwardRef } from 'react';
import type { TimelineItemProps, TimelineProps } from './Timeline.types';
import './Timeline.scss';

// An ordered run of events, each led by a marker: a request's activity thread, an audit
// log, a status history. Each entry is a marker, a meta line (who · when), the body and an
// optional actions row — the shape every app's thread was being built in by hand.
//
// It is an `<ol>` because the order is the point. The connector line is drawn from the
// marker column of each item down into the next, so it needs no knowledge of how tall an
// entry is; the last item draws none.

const Timeline = forwardRef<HTMLOListElement, TimelineProps>(
  ({ connector = false, className, children, ...rest }, ref) => (
    <ol
      {...rest}
      ref={ref}
      className={`ui-timeline${connector ? ' ui-timeline--connector' : ''}${className ? ' ' + className : ''}`}
    >
      {children}
    </ol>
  ),
);
Timeline.displayName = 'Timeline';

const TimelineItem = forwardRef<HTMLLIElement, TimelineItemProps>(
  ({ marker, author, time, dateTime, actions, className, children, ...rest }, ref) => {
    const when = time != null && (dateTime ? <time dateTime={dateTime}>{time}</time> : time);
    const hasMeta = author != null || time != null;
    return (
      <li {...rest} ref={ref} className={`ui-timeline__item${className ? ' ' + className : ''}`}>
        <div className="ui-timeline__marker">
          {marker ?? <span className="ui-timeline__dot" aria-hidden="true" />}
        </div>
        <div className="ui-timeline__content">
          {hasMeta && (
            <p className="ui-timeline__meta">
              {author}
              {author != null && time != null && <span aria-hidden="true"> · </span>}
              {when}
            </p>
          )}
          {children != null && <div className="ui-timeline__body">{children}</div>}
          {actions && <div className="ui-timeline__actions">{actions}</div>}
        </div>
      </li>
    );
  },
);
TimelineItem.displayName = 'TimelineItem';

export { TimelineItem };
export default Timeline;
