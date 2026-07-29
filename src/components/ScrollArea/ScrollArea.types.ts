/** Which axis gets a custom scrollbar. */
export type ScrollAreaOrientation = 'vertical' | 'horizontal' | 'both';

/**
 * When the scrollbar is visible. (Poorly named for historical reasons — it has
 * nothing to do with the DOM `type` attribute.)
 * - `auto` — visible whenever the content overflows.
 * - `hover` — hidden until the pointer is over the area, then fades in.
 */
export type ScrollAreaType = 'auto' | 'hover';

/**
 * Scroll container with a custom JS-driven thumb (no dependency).
 *
 * The viewport is a focusable tab stop so keyboard users can scroll it
 * (WCAG 2.1.1); the scrollbars themselves are `aria-hidden` because native
 * keyboard scrolling on the focused viewport does the work.
 */
export type ScrollAreaProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children'
> & {
  id: string;
  children: React.ReactNode;
  /** Default `vertical`. */
  orientation?: ScrollAreaOrientation;
  /** Default `auto`. See {@link ScrollAreaType} — visibility, not a DOM type. */
  type?: ScrollAreaType;
  className?: string;
};
