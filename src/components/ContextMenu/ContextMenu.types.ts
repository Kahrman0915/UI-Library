import type { Side, Align } from '#/utils/computePosition';

export type ContextMenuSide = Side;
export type ContextMenuAlign = Align;

/** `destructive` tints the row red — for delete and other unrecoverable actions. */
export type ContextMenuItemVariant = 'default' | 'destructive';

// ═════════════════════════════════════════════════════════════════════════════
// Root
// ═════════════════════════════════════════════════════════════════════════════

/**
 * The right-click menu. Unlike `DropdownMenu` it anchors to the **pointer
 * position**, not to a trigger element — which is why it is the one floating
 * surface that doesn't re-measure on resize (there is no trigger rect to track).
 *
 * The only menu family in the library with submenus.
 */
export type ContextMenuProps = {
  /** Required. Seeds `{id}-content` and the submenu ids for the aria wiring. */
  id: string;
  children: React.ReactNode;
  /** Controlled open state. Pair with `onOpenChange`. */
  open?: boolean;
  /** Uncontrolled initial state. Ignored when `open` is supplied. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Milliseconds a touch must be held before opening. */
  longPressDelay?: number;
};

// ═════════════════════════════════════════════════════════════════════════════
// Trigger — wraps its children in a div that captures the contextmenu event
// ═════════════════════════════════════════════════════════════════════════════

/**
 * The region that responds to right-click. Wraps its children in a `<div>` that
 * captures `contextmenu`, so it needs a real area — an inline element with no
 * box has nothing to right-click.
 *
 * Keyboard users open it with Shift+F10 or the Menu key; `onContextMenu` is
 * Omitted because the trigger owns that handler.
 */
export type ContextMenuTriggerProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'onContextMenu'
> & {
  /** Right-click does nothing and the native browser menu is left alone. */
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
};

// ═════════════════════════════════════════════════════════════════════════════
// Content — portalled menu at pointer position
// ═════════════════════════════════════════════════════════════════════════════

/**
 * The menu surface, portalled to the pointer. Takes no `side` / `align` — a
 * pointer-anchored menu has no trigger edge to align against. (Submenus do:
 * see `ContextMenuSubContent`.)
 */
export type ContextMenuContentProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  children?: React.ReactNode;
};

// ═════════════════════════════════════════════════════════════════════════════
// Item + related
// ═════════════════════════════════════════════════════════════════════════════

/** A menu action. Selecting it runs `onClick` and closes the menu by default. */
export type ContextMenuItemProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Skipped by arrow-key navigation and unclickable. */
  disabled?: boolean;
  /** Default `default`. See {@link ContextMenuItemVariant}. */
  variant?: ContextMenuItemVariant;
  /** Set to false to keep the menu open after activation. */
  closeOnSelect?: boolean;
  className?: string;
  children?: React.ReactNode;
};

/**
 * Toggleable row. **Deliberately does not close the menu** when toggled, so a
 * user can flip several options in one pass — close with Escape or an outside
 * click. (`ContextMenuRadioItem` is the opposite.)
 */
export type ContextMenuCheckboxItemProps =
  React.HTMLAttributes<HTMLDivElement> & {
    /** Controlled checked state. Pair with `onCheckedChange`. */
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    /** Skipped by arrow-key navigation and unclickable. */
    disabled?: boolean;
    className?: string;
    children?: React.ReactNode;
  };

/** Single-choice set. Owns the selected `value` for its `RadioItem` children. */
export type ContextMenuRadioGroupProps = React.HTMLAttributes<HTMLDivElement> & {
  /** The selected item's `value`. Controlled — pair with `onValueChange`. */
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children?: React.ReactNode;
};

/** One choice in a radio group. Selecting it **closes** the menu. */
export type ContextMenuRadioItemProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Reported by the group's `onValueChange`. Must be unique in the group. */
  value: string;
  /** Skipped by arrow-key navigation and unclickable. */
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
};

/** Non-interactive heading for a group of items. */
export type ContextMenuLabelProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  children?: React.ReactNode;
};

/** Hairline between groups of items. */
export type ContextMenuSeparatorProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
};

/** Wraps related items in a `role="group"`. */
export type ContextMenuGroupProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  children?: React.ReactNode;
};

/**
 * Right-aligned accelerator hint inside an item (e.g. `⌘C`). Purely visual — it
 * displays the shortcut, it does not bind it.
 */
export type ContextMenuShortcutProps = React.HTMLAttributes<HTMLSpanElement> & {
  className?: string;
  children?: React.ReactNode;
};

// ═════════════════════════════════════════════════════════════════════════════
// Submenu
// ═════════════════════════════════════════════════════════════════════════════

/**
 * A nested menu. Wrap a `ContextMenuSubTrigger` and a `ContextMenuSubContent`.
 * ContextMenu is the only family here that has these.
 */
export type ContextMenuSubProps = {
  children: React.ReactNode;
  /** Controlled open state. Pair with `onOpenChange`. */
  open?: boolean;
  /** Uncontrolled initial state. Ignored when `open` is supplied. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Hover grace period before the submenu opens, in ms. Guards against a
   *  pointer crossing the row on its way elsewhere. */
  openDelay?: number;
};

/** The parent row that opens a submenu. Renders its own trailing chevron. */
export type ContextMenuSubTriggerProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Skipped by arrow-key navigation; the submenu can't be opened. */
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
};

/**
 * The submenu surface. Unlike the root content this *does* anchor to an
 * element — its parent row — so it takes the usual placement props.
 */
export type ContextMenuSubContentProps =
  React.HTMLAttributes<HTMLDivElement> & {
    /** Default `right`. No collision detection — it won't flip near an edge. */
    side?: ContextMenuSide;
    /** Default `start`. */
    align?: ContextMenuAlign;
    /** Gap between the parent row and the submenu, **in px**. Default `4`. */
    sideOffset?: number;
    className?: string;
    children?: React.ReactNode;
  };
