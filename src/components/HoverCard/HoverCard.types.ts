import type { Side, Align } from '#/utils/computePosition';

/** Which edge of the trigger the card sits on. */
export type HoverCardSide = Side;
/** How the card lines up along that edge. */
export type HoverCardAlign = Align;

/**
 * Hover-intent preview card — the "peek at a link's destination" pattern.
 * Opens on hover *or* keyboard focus, after `openDelay`.
 *
 * Content is supplementary by design: it is portalled and NOT focus-trapped, so
 * keyboard users can't tab into it. Keep it read-only — anything the user must
 * click belongs in a `Popover`, not here.
 *
 * No collision detection (see `Popover`).
 */
export type HoverCardProps = {
  /** Required. Seeds `{id}-trigger` / `{id}-content` for the aria wiring. */
  id: string;
  children: React.ReactNode;
  /** Controlled open state. Pair with `onOpenChange`. */
  open?: boolean;
  /** Uncontrolled initial state. Ignored when `open` is supplied. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Hover dwell before opening, **in ms**. Default `700` — long enough that
   *  a pointer crossing the trigger doesn't flash the card. */
  openDelay?: number;
  /** Grace period after the pointer leaves, **in ms**. Default `300`, so the
   *  user can travel diagonally onto the card without it vanishing. */
  closeDelay?: number;
};

/**
 * Wraps the element the card previews.
 *
 * Takes exactly ONE element child and clones it — the child must forward `ref`
 * and spread its props (a DOM element or `forwardRef` component), or the ref is
 * silently lost and the card can't position.
 */
export type HoverCardTriggerProps = {
  children: React.ReactElement;
};

export type HoverCardContentProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Default `bottom`. */
  side?: HoverCardSide;
  /** Default `center`. */
  align?: HoverCardAlign;
  /** Gap between trigger and card, **in px**. Default `4`. */
  sideOffset?: number;
  className?: string;
  children?: React.ReactNode;
};
