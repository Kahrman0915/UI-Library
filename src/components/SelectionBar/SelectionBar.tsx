import { forwardRef } from 'react';
import Button from '../Button/Button';
import Toolbar, { ToolbarGroup } from '../Toolbar';
import type { SelectionBarProps } from './SelectionBar.types';
import './SelectionBar.scss';

/**
 * The contextual bar that takes over while items are selected — the count, a way
 * to clear it, and the actions that apply to every selected item.
 *
 * Composes `Toolbar`, so it is a `role="toolbar"` with the toolbar's two spacing
 * rungs, and adds the one thing Toolbar deliberately lacks: a surface, so the bar
 * reads as a mode the page is in rather than more controls. Render it in place of
 * the filter row while `count > 0`, and back when the selection clears.
 */
const SelectionBar = forwardRef<HTMLDivElement, SelectionBarProps>(
  (
    { id, label, count, summary, onClear, clearLabel = 'Clear selection', actions, className, ...rest },
    ref,
  ) => {
    return (
      <Toolbar
        {...rest}
        ref={ref}
        id={id}
        label={label}
        justify="between"
        className={`ui-selection-bar${className ? ' ' + className : ''}`}
      >
        <ToolbarGroup>
          <span id={`${id}-count`} className="ui-selection-bar__count" aria-live="polite" aria-atomic="true">
            {summary ?? `${count} selected`}
          </span>
          {onClear && (
            <Button id={`${id}-clear`} style="link" size="sm" label={clearLabel} onClick={onClear} />
          )}
        </ToolbarGroup>
        {actions && <ToolbarGroup>{actions}</ToolbarGroup>}
      </Toolbar>
    );
  },
);

SelectionBar.displayName = 'SelectionBar';

export default SelectionBar;
