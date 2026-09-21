import { createElement, forwardRef } from 'react';
import Separator from '../Separator';
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
      meta,
      visual,
      description,
      actions,
      toolbar,
      showDivider = false,
      size = 'default',
      headingLevel = 'h1',
      className,
      ...rest
    },
    ref,
  ) => {
    // `default` emits no modifier — a class nothing selects is dead BEM. The type
    // ramp hangs off this one root class through descendant selectors, the way
    // Card's size and RadioGroup's do, so no region needs a prop of its own.
    const cls =
      'ui-page-header' +
      (size === 'default' ? '' : ` ui-page-header--sz-${size}`) +
      (className ? ' ' + className : '');

    return (
      <header {...rest} ref={ref} id={id} className={cls} data-size={size}>
        <div className="ui-page-header__row">
          {visual !== undefined && <div className="ui-page-header__visual">{visual}</div>}
          <div className="ui-page-header__text">
            {overline !== undefined && (
              // A div, not a p: an overline routinely carries a Badge, which is a div,
              // and a div inside a p is invalid markup the browser silently un-nests.
              <div className="ui-page-header__overline">{overline}</div>
            )}
            {/*
              With no `meta` the heading is emitted exactly as before — no wrapper,
              no extra div — so every header already in the wild renders byte for
              byte the same. The row only appears when something has to sit beside
              the title.
            */}
            {meta === undefined ? (
              createElement(headingLevel, { id: `${id}-title`, className: 'ui-page-header__title' }, title)
            ) : (
              <div className="ui-page-header__title-row">
                {createElement(headingLevel, { id: `${id}-title`, className: 'ui-page-header__title' }, title)}
                <div className="ui-page-header__meta">{meta}</div>
              </div>
            )}
            {description !== undefined && (
              <p id={`${id}-description`} className="ui-page-header__description">
                {description}
              </p>
            )}
          </div>
          {actions !== undefined && <div className="ui-page-header__actions">{actions}</div>}
        </div>
        {toolbar !== undefined && <div className="ui-page-header__toolbar">{toolbar}</div>}
        {/*
          Last, so it closes the whole header rather than sitting between the title row
          and a toolbar. `decorative` because the <header> element already draws the
          boundary — a role="separator" here would announce it twice.
        */}
        {showDivider && <Separator decorative className="ui-page-header__divider" />}
      </header>
    );
  },
);

PageHeader.displayName = 'PageHeader';

export default PageHeader;
