export type DropdownMenuSide = 'top' | 'right' | 'bottom' | 'left';
export type DropdownMenuAlign = 'start' | 'center' | 'end';

/**
 * Actions menu opened from a button (`role="menu"`).
 *
 * For *choosing a value* use `Select`; a menu is for *doing things*.
 * Keyboard: arrows wrap through items, Home/End jump to the ends, Escape closes
 * and returns focus to the trigger. Focus moves for real (no
 * `aria-activedescendant`). No typeahead, and Tab does not close the menu.
 *
 * `Menubar` reuses this whole family — its content parts are these components
 * re-exported, so positioning and item behaviour come along for free.
 */
export type DropdownMenuProps = {
  /** Required. Seeds `{id}-trigger` / `{id}-content` for the aria wiring. */
  id: string;
  children: React.ReactNode;
  /** Uncontrolled initial state. Ignored when `open` is supplied. */
  defaultOpen?: boolean;
  /** Controlled open state. Pair with `onOpenChange`. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

/**
 * Wraps the button that opens the menu.
 *
 * Takes exactly ONE element child and clones it — the child must forward `ref`
 * and spread its props, or the menu can't position against it.
 */
export type DropdownMenuTriggerProps = {
  children: React.ReactElement;
};

export type DropdownMenuContentProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children'
> & {
  children: React.ReactNode;
  /** Default `bottom`. No collision detection — it won't flip near an edge. */
  side?: DropdownMenuSide;
  /** Default `start`. */
  align?: DropdownMenuAlign;
  /** Gap between trigger and menu, **in px**. Default `4`. */
  sideOffset?: number;
  className?: string;
};

/** A menu action. Selecting it runs `onClick` and **closes the menu**. */
export type DropdownMenuItemProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children' | 'onClick'
> & {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  /** Skipped by arrow-key navigation and unclickable. */
  disabled?: boolean;
  className?: string;
};

/** Non-interactive heading for a group of items. */
export type DropdownMenuLabelProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children'
> & {
  children: React.ReactNode;
  className?: string;
};

/** Hairline between groups of items. */
export type DropdownMenuSeparatorProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children'
> & {
  className?: string;
};

/** Wraps related items in a `role="group"`. */
export type DropdownMenuGroupProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children'
> & {
  children: React.ReactNode;
  className?: string;
};

/**
 * Toggleable item. **Deliberately does NOT close the menu** when toggled, so a
 * user can flip several options in one pass — close via Escape or an outside
 * click. (`DropdownMenuRadioItem` is the opposite: it closes on select.)
 */
export type DropdownMenuCheckboxItemProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children' | 'onClick'
> & {
  children: React.ReactNode;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
};

/** Single-choice set. Owns the selected `value` for its `RadioItem` children. */
export type DropdownMenuRadioGroupProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children'
> & {
  children: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
};

/** One choice in a radio group. Selecting it **closes the menu** (unlike checkbox items). */
export type DropdownMenuRadioItemProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children' | 'onClick'
> & {
  children: React.ReactNode;
  value: string;
  disabled?: boolean;
  className?: string;
};

/**
 * Right-aligned shortcut hint inside an item (e.g. `⌘K`). Purely visual — it
 * displays the accelerator, it does not bind it.
 */
export type DropdownMenuShortcutProps = Omit<
  React.HTMLAttributes<HTMLSpanElement>,
  'children'
> & {
  children: React.ReactNode;
  className?: string;
};
