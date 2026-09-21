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
/**
 * The floating element's LAYOUT size, for `computePosition`.
 *
 * Never measure it with `getBoundingClientRect()`: that includes transforms, and
 * every floating surface opens on a `--motion-scale-in` (0.97) keyframe, so a
 * rect read in the positioning layout effect is ~3% too small. With `align`
 * `end` or `center` the surface then lands that far past its anchor — a 320px
 * menu pinned to the right edge of the window overhung it by ~10px — and it is
 * never re-measured after the animation settles. `offsetWidth`/`offsetHeight`
 * are the untransformed box.
 */
export const measureFloating = (el: HTMLElement): { width: number; height: number } => ({
  width: el.offsetWidth,
  height: el.offsetHeight,
});

export const computePosition = (
  triggerRect: DOMRect,
  contentRect: { width: number; height: number },
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
