/**
 * Finding the focusable elements inside a container.
 *
 * Extracted at the third consumer (Dialog, Drawer, HoverCard) — the same point
 * `.ui-icon-button` was pulled out. Before that the selector lived twice, and
 * the two copies had already started to drift.
 *
 * The selector is deliberately DOM-order, not tab-order: it does not sort by
 * positive `tabindex`. Every consumer here traps or moves focus inside a
 * surface it owns, where positive tabindex values are an anti-pattern anyway.
 */
export const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/** Focusable descendants of `container`, in DOM order. */
export const getFocusable = (container: HTMLElement): HTMLElement[] =>
  Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
