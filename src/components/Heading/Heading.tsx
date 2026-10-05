import { createElement, forwardRef } from 'react';
import type { HeadingProps, HeadingSize } from './Heading.types';
import './Heading.scss';

// A heading with no margin, on the library's type ramp. It exists because every heading in
// an app was being written as `<h2 style={{ margin: 0, fontSize: 'var(--text-2xl)' }}>` —
// the browser's own heading margins and sizes are wrong for a component layout, and the
// fix was being repeated at every call site.
//
// `level` and `size` are separate on purpose, like PageHeader's `headingLevel` and `size`:
// the outline is a document decision and the size is a visual one, and bundling them is
// what makes people pick the wrong element to get the right look.

const DEFAULT_SIZE: Record<HeadingProps['level'], HeadingSize> = {
  1: '2xl',
  2: 'xl',
  3: 'lg',
  4: 'base',
  5: 'base',
  6: 'base',
};

const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ level, size, className, children, ...rest }, ref) => {
    const sz = size ?? DEFAULT_SIZE[level];
    return createElement(
      `h${level}`,
      {
        ...rest,
        ref,
        className: `ui-heading ui-heading--sz-${sz}${className ? ' ' + className : ''}`,
      },
      children,
    );
  },
);

Heading.displayName = 'Heading';

export default Heading;
