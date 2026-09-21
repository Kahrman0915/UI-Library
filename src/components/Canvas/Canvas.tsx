import { forwardRef } from 'react';
import { GripVertical } from 'lucide-react';
import type { CanvasItemProps, CanvasProps } from './Canvas.types';
import './Canvas.scss';

const Canvas = forwardRef<HTMLDivElement, CanvasProps>(
  ({ grid = true, className, children, ...rest }, ref) => (
    <div
      {...rest}
      ref={ref}
      data-grid={grid || undefined}
      className={`ui-canvas${grid ? ' ui-canvas--grid' : ''}${className ? ' ' + className : ''}`}
    >
      {children}
    </div>
  ),
);
Canvas.displayName = 'Canvas';

const CanvasItem = forwardRef<HTMLDivElement, CanvasItemProps>(
  (
    { grip, menu, gripLabel = 'Drag to move', selected, className, children, ...rest },
    ref,
  ) => (
    <div
      {...rest}
      ref={ref}
      data-selected={selected || undefined}
      className={`ui-canvas-item${selected ? ' ui-canvas-item--selected' : ''}${
        className ? ' ' + className : ''
      }`}
    >
      {grip && (
        <button
          type="button"
          className="ui-canvas-item__grip"
          aria-label={gripLabel}
        >
          <GripVertical aria-hidden="true" />
        </button>
      )}
      {menu && <div className="ui-canvas-item__menu">{menu}</div>}
      <div className="ui-canvas-item__content">{children}</div>
    </div>
  ),
);
CanvasItem.displayName = 'CanvasItem';

export default Canvas;
export { CanvasItem };
