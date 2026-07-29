/**
 * A single show/hide disclosure. Height animates with
 * `grid-template-rows: 0fr → 1fr` — no measurement, no JavaScript in the path.
 *
 * Reach for `Accordion` instead when you have a set of these that coordinate.
 */
export type CollapsibleProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Required. Seeds `{id}-trigger` / `{id}-content` for the aria wiring. */
  id: string;
  /** Controlled open state. Pair with `onOpenChange`. */
  open?: boolean;
  /** Uncontrolled initial state. Ignored when `open` is supplied. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** The trigger stops responding and the content stays as it is. */
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
};

/**
 * Wraps the element that toggles the disclosure. Takes exactly ONE element
 * child and clones it — the child must forward `ref` and spread its props.
 */
export type CollapsibleTriggerProps = {
  children: React.ReactElement;
};

/**
 * The revealed panel. Put padding on your own content, not on this element —
 * padding here leaks into the grid row's minimum size and the panel won't
 * collapse fully. (See the three-div clip in CLAUDE.md.)
 */
export type CollapsibleContentProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  children?: React.ReactNode;
};
