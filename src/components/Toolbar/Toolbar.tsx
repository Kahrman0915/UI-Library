import { forwardRef } from 'react';
import type { ToolbarProps, ToolbarGroupProps } from './Toolbar.types';
import './Toolbar.scss';

// A row of controls with two rungs of the ladder baked in: level 3 between GROUPS (the
// filter axes, the search) and level 4 between the CONTROLS inside a group. The screens'
// filter bars had been choosing both by hand.
const Toolbar = forwardRef<HTMLDivElement, ToolbarProps>(
  ({ id, label, justify = 'between', className, children, ...rest }, ref) => {
    const cls = 'ui-toolbar' + (justify !== 'start' ? ` ui-toolbar--justify-${justify}` : '') + (className ? ' ' + className : '');
    return (
      <div {...rest} ref={ref} id={id} role="toolbar" aria-label={label} className={cls}>
        {children}
      </div>
    );
  },
);
Toolbar.displayName = 'Toolbar';

export const ToolbarGroup = forwardRef<HTMLDivElement, ToolbarGroupProps>(({ className, children, ...rest }, ref) => (
  <div {...rest} ref={ref} className={`ui-toolbar__group${className ? ' ' + className : ''}`}>
    {children}
  </div>
));
ToolbarGroup.displayName = 'ToolbarGroup';

export default Toolbar;
