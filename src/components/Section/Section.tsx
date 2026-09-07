import { createElement, forwardRef } from 'react';
import type { SectionProps } from './Section.types';
import './Section.scss';

// A heading with its content under it, at the level the ladder gives that relationship:
// level 2 for a section of a page, level 4 for a labelled group inside one. The space
// BETWEEN sections is not this component's job — that is the level-2 Stack they sit in.
// Content is a plain region; what it holds decides its own rhythm (usually a Stack).
const Section = forwardRef<HTMLElement, SectionProps>(
  ({ id, heading, actions, variant = 'default', headingLevel = 'h2', className, children, ...rest }, ref) => {
    const cls = 'ui-section' + (variant !== 'default' ? ` ui-section--${variant}` : '') + (className ? ' ' + className : '');
    return (
      <section {...rest} ref={ref} id={id} className={cls} aria-labelledby={heading ? `${id}-heading` : undefined}>
        {(heading !== undefined || actions !== undefined) && (
          <div className="ui-section__header">
            {heading !== undefined && createElement(headingLevel, { id: `${id}-heading`, className: 'ui-section__heading' }, heading)}
            {actions !== undefined && <div className="ui-section__actions">{actions}</div>}
          </div>
        )}
        <div className="ui-section__content">{children}</div>
      </section>
    );
  },
);

Section.displayName = 'Section';

export default Section;
