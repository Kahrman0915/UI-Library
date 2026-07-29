import type { Side, Align } from '#/utils/computePosition';

/** Which edge of the trigger the surface sits on. */
export type PopoverSide = Side;
/** How the surface lines up along that edge. */
export type PopoverAlign = Align;

/**
 * Click-triggered floating surface (`role="dialog"`), portalled to `<body>`.
 * Escape closes and returns focus to the trigger; an outside click closes
 * without moving focus.
 *
 * No collision detection — a surface near a viewport edge renders off-screen
 * rather than flipping. Choose `side`/`align` for the space you have.
 */
export type PopoverProps = {
  /** Required. Seeds `{id}-trigger` / `{id}-content` for the aria wiring. */
  id: string;
  children: React.ReactNode;
  /** Controlled open state. Pair with `onOpenChange`. */
  open?: boolean;
  /** Uncontrolled initial state. Ignored when `open` is supplied. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

/**
 * Wraps the element that opens the popover.
 *
 * Takes exactly ONE element child and clones it, so the child must forward
 * `ref` and spread the props it receives — a DOM element or a `forwardRef`
 * component. A plain function component silently drops the ref and the surface
 * won't position.
 */
export type PopoverTriggerProps = {
  children: React.ReactElement;
};

export type PopoverContentProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Default `bottom`. */
  side?: PopoverSide;
  /** Default `center`. */
  align?: PopoverAlign;
  /** Gap between trigger and surface, **in px**. Default `4`. */
  sideOffset?: number;
  className?: string;
  children?: React.ReactNode;
};

/**
 * Closes the popover when its child is activated — clones the child and
 * composes an `onClick` onto it, so the same single-element rule applies.
 */
export type PopoverCloseProps = {
  children: React.ReactElement;
};
