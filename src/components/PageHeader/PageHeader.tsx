import { createElement, forwardRef } from 'react';
import type { PageHeaderProps } from './PageHeader.types';
import './PageHeader.scss';

// The top of a page: title, description, actions, and optionally a search or toolbar
// underneath. It exists so the spacing INSIDE a page header is never decided by a screen:
// title → description is level 5, the title row's controls are level 4 apart, and the
// toolbar sits level 2 below the row. The header itself is the first child of a
// PageContainer, which puts level 1 between it and the content.
//
// This is the component that fixes the flow screens' "one column gap does every job"
// problem: the search field belongs to the header, not to the page's section stack.
const PageHeader = forwardRef<HTMLElement, PageHeaderProps>(
  ({ id, title, description, actions, toolbar, headingLevel = 'h1', className, ...rest }, ref) => {
    return (
      <header {...rest} ref={ref} id={id} className={`ui-page-header${className ? ' ' + className : ''}`}>
        <div className="ui-page-header__row">
          <div className="ui-page-header__text">
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
