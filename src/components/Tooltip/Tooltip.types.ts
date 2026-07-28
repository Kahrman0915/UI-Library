/** Which edge of the trigger the tooltip sits on. */
export type TooltipSide = 'top' | 'right' | 'bottom' | 'left';
/** How the tooltip lines up along that edge. */
export type TooltipAlign = 'start' | 'center' | 'end';

/**
 * Short text label for a control, shown on hover or keyboard focus and wired
 * to the trigger via `aria-describedby`. Escape dismisses it.
 *
 * Constraints worth knowing before reaching for it:
 * - **Label only.** The surface is `pointer-events: none`, so the user cannot
 *   move onto it — no links, no buttons, no selectable text. Use `HoverCard`
 *   for rich content, `Popover` for anything interactive.
 * - **No touch path.** Touch users get nothing; never hide essential
 *   information here.
 * - **Uncontrolled only** — there is no `open` / `onOpenChange`.
 * - Tooltip is the one carve-out from theming: it always uses the neutral
 *   `--tooltip-*` inverse, never the active `data-theme` colour.
 */
export type TooltipProps = {
  /** Required. Seeds the content id used by the trigger's `aria-describedby`. */
  id: string;
  children: React.ReactNode;
  /** Default `top`. */
  side?: TooltipSide;
  /** Default `center`. */
  align?: TooltipAlign;
  /** Gap between trigger and tooltip, **in px**. Default `4`. */
  sideOffset?: number;
  /** Hover dwell before showing, **in ms**. Default `200`. (The hide grace
   *  period is a fixed ~100ms and isn't configurable.) */
  delayDuration?: number;
  /** Suppresses showing while still rendering the trigger — for a tooltip
   *  that's only relevant in some states (e.g. Sidebar's icon mode). */
  disabled?: boolean;
};

/**
 * Wraps the control being described.
 *
 * Takes exactly ONE element child and clones it, so the child must forward
 * `ref` and spread its props. It must also be **focusable** — wrap a `<button>`
 * or an anchor, not a bare `<span>`, or keyboard users never see the tooltip.
 */
export type TooltipTriggerProps = {
  children: React.ReactElement;
};

export type TooltipContentProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children'
> & {
  children: React.ReactNode;
  className?: string;
};
