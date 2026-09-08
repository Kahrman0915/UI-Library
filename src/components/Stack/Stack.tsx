import { createElement, forwardRef } from 'react';
import type { StackProps } from './Stack.types';
import './Stack.scss';

// A flex run whose gap is a LEVEL on the spacing ladder, never a number. This is the
// layout primitive that makes the ladder hold across a team: the only spacing decision
// a screen makes is which level each Stack is, and the numbers follow from the ladder,
// the viewport width and data-density without the screen knowing about any of them.
//
// Deliberately minimal — no padding, no background, no border. Space between things
// is a Stack's job; the inside edge of a surface belongs to the surface (Card, Dialog,
// PageContainer), so a Stack never carries an inset.
const Stack = forwardRef<HTMLElement, StackProps>(
  (
    {
      level,
      direction = 'vertical',
      wrap = false,
      align = 'stretch',
      justify = 'start',
      as = 'div',
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    const cls =
      `ui-stack ui-stack--level-${level} ui-stack--${direction}` +
      (wrap ? ' ui-stack--wrap' : '') +
      (align !== 'stretch' ? ` ui-stack--align-${align}` : '') +
      (justify !== 'start' ? ` ui-stack--justify-${justify}` : '') +
      (className ? ' ' + className : '');
    return createElement(as, { ...rest, ref, className: cls }, children);
  },
);

Stack.displayName = 'Stack';

export default Stack;
