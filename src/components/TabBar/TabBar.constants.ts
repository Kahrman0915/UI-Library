/**
 * The drag-and-drop data type a dragged tab carries. It is how a drop target
 * outside the bar — `SplitView`, or your own — recognizes a tab: check
 * `event.dataTransfer.types.includes(TAB_BAR_DRAG_TYPE)` on `dragover`, then read
 * the tab's `value` with `getData(TAB_BAR_DRAG_TYPE)` on `drop`.
 *
 * Lowercase on purpose: browsers lowercase the types list, so a mixed-case type
 * would never match on `dragover`.
 */
export const TAB_BAR_DRAG_TYPE = 'application/x-ui-tab-bar-tab';
