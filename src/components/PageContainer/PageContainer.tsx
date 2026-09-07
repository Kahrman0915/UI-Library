import { createElement, forwardRef } from 'react';
import type { PageContainerProps } from './PageContainer.types';
import './PageContainer.scss';

// The outer wrapper of a page's content, carrying LEVEL 1 of the spacing ladder: its
// padding is the page margin and its gap is the space between the page header and the
// content. Both read --space-1, so they slide with viewport width and reshape per
// data-density without the page knowing. A page is then:
//
//   <PageContainer>
//     <PageHeader … />
//     <Stack level={2}> …sections… </Stack>
//   </PageContainer>
//
// and the only spacing decision on it is the level of that Stack.
const PageContainer = forwardRef<HTMLElement, PageContainerProps>(
  ({ width = 'default', as = 'div', className, children, ...rest }, ref) => {
    const cls =
      'ui-page-container' +
      (width !== 'default' ? ` ui-page-container--${width}` : '') +
      (className ? ' ' + className : '');
    return createElement(as, { ...rest, ref, className: cls }, children);
  },
);

PageContainer.displayName = 'PageContainer';

export default PageContainer;
