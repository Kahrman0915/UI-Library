import { forwardRef } from 'react';
import type { BlockquoteProps } from './Blockquote.types';
import './Blockquote.scss';

const Blockquote = forwardRef<HTMLQuoteElement, BlockquoteProps>(
  ({ cite, className, children, ...rest }, ref) => {
    const hasCite = cite !== undefined && cite !== null && cite !== '';
    return (
      <blockquote
        {...rest}
        ref={ref}
        className={`ui-blockquote${className ? ' ' + className : ''}`}
      >
        <div className="ui-blockquote__content">{children}</div>
        {hasCite && <footer className="ui-blockquote__cite">{cite}</footer>}
      </blockquote>
    );
  },
);

Blockquote.displayName = 'Blockquote';

export default Blockquote;
