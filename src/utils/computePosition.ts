export type Side = 'top' | 'right' | 'bottom' | 'left';
export type Align = 'start' | 'center' | 'end';

export type Position = {
  top: number;
  left: number;
};

/**
 * Positions a floating element relative to a trigger.
 *
 * Coordinates are in viewport space and integer-rounded, so they're safe to
 * pass straight to `style={{ top, left }}` on a `position: fixed` element.
 *
 * No collision detection — if the resulting rect would render off-screen,
 * that's on the caller. Add flip / shift logic here later if we need it.
 *
 * Used by Tooltip and DropdownMenu today; Popover / Combobox / Sheet next.
 */
export const computePosition = (
  triggerRect: DOMRect,
  contentRect: DOMRect,
  side: Side,
  align: Align,
  sideOffset: number,
): Position => {
  let top = 0;
  let left = 0;
  const isVertical = side === 'top' || side === 'bottom';

  if (side === 'top') top = triggerRect.top - contentRect.height - sideOffset;
  if (side === 'bottom') top = triggerRect.bottom + sideOffset;
  if (side === 'left') left = triggerRect.left - contentRect.width - sideOffset;
  if (side === 'right') left = triggerRect.right + sideOffset;

  if (isVertical) {
    if (align === 'start') left = triggerRect.left;
    if (align === 'center')
      left = triggerRect.left + (triggerRect.width - contentRect.width) / 2;
    if (align === 'end') left = triggerRect.right - contentRect.width;
  } else {
    if (align === 'start') top = triggerRect.top;
    if (align === 'center')
      top = triggerRect.top + (triggerRect.height - contentRect.height) / 2;
    if (align === 'end') top = triggerRect.bottom - contentRect.height;
  }

  return { top: Math.round(top), left: Math.round(left) };
};
