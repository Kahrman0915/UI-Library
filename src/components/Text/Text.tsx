import { createElement, forwardRef } from 'react';
import type { TextProps } from './Text.types';
import './Text.scss';

// Running text with no margin, on the library's type ramp: a size, a tone and a weight.
// It replaces the per-app `.text` / `.muted` / `.meta` classes every product was writing
// for itself. Headings are `Heading`, not a bold Text — the outline needs the element.

const Text = forwardRef<HTMLElement, TextProps>(
  (
    { size = 'sm', tone = 'default', weight = 'normal', as = 'p', lines, className, style, children, ...rest },
    ref,
  ) => {
    const cls =
      `ui-text ui-text--sz-${size}` +
      (tone !== 'default' ? ` ui-text--${tone}` : '') +
      (weight !== 'normal' ? ` ui-text--${weight}` : '') +
      (lines ? ' ui-text--clamp' : '') +
      (className ? ' ' + className : '');
    return createElement(
      as,
      {
        ...rest,
        ref,
        className: cls,
        style: lines ? ({ ...style, '--ui-text-lines': lines } as React.CSSProperties) : style,
      },
      children,
    );
  },
);

Text.displayName = 'Text';

export default Text;
