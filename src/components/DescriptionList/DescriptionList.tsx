import { forwardRef } from 'react';
import type { DescriptionListItemProps, DescriptionListProps } from './DescriptionList.types';
import './DescriptionList.scss';

// Label/value pairs with real `<dl>` semantics — the request fields, dashboard info and
// record details every detail screen has, which each app was building as its own
// `dt`/`dd` grid.
//
// Each pair is a `div` holding one `dt` and one `dd`. HTML allows a `div` around a group
// inside a `dl`, and it gives each pair one node to key, hide or map — which is the reason
// a pair is a component rather than two loose elements. In the horizontal layout the div
// is `display: contents`, so the terms of every row still share one column and the values
// line up, however long any one term is.

const DescriptionList = forwardRef<HTMLDListElement, DescriptionListProps>(
  ({ orientation = 'horizontal', className, children, ...rest }, ref) => (
    <dl
      {...rest}
      ref={ref}
      className={`ui-description-list ui-description-list--${orientation}${className ? ' ' + className : ''}`}
    >
      {children}
    </dl>
  ),
);
DescriptionList.displayName = 'DescriptionList';

const DescriptionListItem = forwardRef<HTMLDivElement, DescriptionListItemProps>(
  ({ term, className, children, ...rest }, ref) => (
    <div {...rest} ref={ref} className={`ui-description-list__item${className ? ' ' + className : ''}`}>
      <dt className="ui-description-list__term">{term}</dt>
      <dd className="ui-description-list__details">{children}</dd>
    </div>
  ),
);
DescriptionListItem.displayName = 'DescriptionListItem';

export { DescriptionListItem };
export default DescriptionList;
