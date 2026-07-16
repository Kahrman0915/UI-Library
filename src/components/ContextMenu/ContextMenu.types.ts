import type { Side, Align } from '#/utils/computePosition';

export type ContextMenuSide = Side;
export type ContextMenuAlign = Align;

export type ContextMenuItemVariant = 'default' | 'destructive';

// ═════════════════════════════════════════════════════════════════════════════
// Root
// ═════════════════════════════════════════════════════════════════════════════

export type ContextMenuProps = {
  id: string;
  children: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Milliseconds a touch must be held before opening. */
  longPressDelay?: number;
};

// ═════════════════════════════════════════════════════════════════════════════
// Trigger — wraps its children in a div that captures the contextmenu event
// ═════════════════════════════════════════════════════════════════════════════

export type ContextMenuTriggerProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'onContextMenu'
> & {
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
};

// ═════════════════════════════════════════════════════════════════════════════
// Content — portalled menu at pointer position
// ═════════════════════════════════════════════════════════════════════════════

export type ContextMenuContentProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  children?: React.ReactNode;
};

// ═════════════════════════════════════════════════════════════════════════════
// Item + related
// ═════════════════════════════════════════════════════════════════════════════

export type ContextMenuItemProps = React.HTMLAttributes<HTMLDivElement> & {
  disabled?: boolean;
  variant?: ContextMenuItemVariant;
  /** Set to false to keep the menu open after activation. */
  closeOnSelect?: boolean;
  className?: string;
  children?: React.ReactNode;
};

export type ContextMenuCheckboxItemProps =
  React.HTMLAttributes<HTMLDivElement> & {
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    disabled?: boolean;
    className?: string;
    children?: React.ReactNode;
  };

export type ContextMenuRadioGroupProps = React.HTMLAttributes<HTMLDivElement> & {
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children?: React.ReactNode;
};

export type ContextMenuRadioItemProps = React.HTMLAttributes<HTMLDivElement> & {
  value: string;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
};

export type ContextMenuLabelProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  children?: React.ReactNode;
};

export type ContextMenuSeparatorProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
};

export type ContextMenuGroupProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  children?: React.ReactNode;
};

export type ContextMenuShortcutProps = React.HTMLAttributes<HTMLSpanElement> & {
  className?: string;
  children?: React.ReactNode;
};

// ═════════════════════════════════════════════════════════════════════════════
// Submenu
// ═════════════════════════════════════════════════════════════════════════════

export type ContextMenuSubProps = {
  children: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  openDelay?: number;
};

export type ContextMenuSubTriggerProps = React.HTMLAttributes<HTMLDivElement> & {
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
};

export type ContextMenuSubContentProps =
  React.HTMLAttributes<HTMLDivElement> & {
    side?: ContextMenuSide;
    align?: ContextMenuAlign;
    sideOffset?: number;
    className?: string;
    children?: React.ReactNode;
  };
