import { createElement, forwardRef } from 'react';
import type { PageHeaderProps } from './PageHeader.types';
import './PageHeader.scss';

// The top of a page: an optional visual and overline, the title, a description, actions,
// and optionally a search or toolbar underneath. It exists so the spacing INSIDE a page
// header is never decided by a screen: overline → title → description is level 5, the
// title row's parts are level 3 apart and its controls level 4, and the toolbar sits
// level 2 below the row. The header itself is the first child of a PageContainer, which
// puts level 1 between it and the content.
//
// `visual` is a sibling of the text block, not a child, so it sits on the title's own
// line with the overline and title to its right — the CardHeader `leading` shape, and
// what the hand-drawn page headings across the flows already draw.
//
// This is the component that fixes the flow screens' "one column gap does every job"
// problem: the search field belongs to the header, not to the page's section stack.
const PageHeader = forwardRef<HTMLElement, PageHeaderProps>(
  (
    {
      id,
      overline,
      title,
      visual,
      description,
      actions,
      toolbar,
      headingLevel = 'h1',
      className,
      ...rest
    },
    ref,
  ) => {
    return (
      <header {...rest} ref={ref} id={id} className={`ui-page-header${className ? ' ' + className : ''}`}>
        <div className="ui-page-header__row">
          {visual !== undefined && <div className="ui-page-header__visual">{visual}</div>}
          <div className="ui-page-header__text">
            {overline !== undefined && (
              // A div, not a p: an overline routinely carries a Badge, which is a div,
              // and a div inside a p is invalid markup the browser silently un-nests.
              <div className="ui-page-header__overline">{overline}</div>
            )}
            {createElement(headingLevel, { id: `${id}-title`, className: 'ui-page-header__title' }, title)}
            {description !== undefined && (
              <p id={`${id}-description`} className="ui-page-header__description">
                {description}
              </p>
            )}
          </div>
          {actions !== undefined && <div className="ui-page-header__actions">{actions}</div>}
        </div>
        {toolbar !== undefined && <div className="ui-page-header__toolbar">{toolbar}</div>}
      </header>
    );
  },
);

PageHeader.displayName = 'PageHeader';

export default PageHeader;
