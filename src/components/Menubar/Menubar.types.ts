/**
 * The desktop-style horizontal menu bar (File / Edit / View …).
 *
 * Owns which menu is open, so only one ever is. Once one is open, **hovering**
 * another trigger switches to it; ArrowLeft/Right move across the triggers via
 * a roving tabindex, so the bar is a single tab stop.
 *
 * Built on `DropdownMenu` — each `MenubarMenu` is a controlled one, and the
 * surface parts below are DropdownMenu's re-exported. Positioning, item
 * navigation, Escape and outside-click all come from there.
 *
 * **v1 gaps:** no submenus (only `ContextMenu` has those), and no
 * ArrowLeft/Right from *inside* an open menu — use hover, or Escape then arrow.
 */
export type MenubarProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Required. Seeds each menu's trigger and content ids. */
  id: string;
  className?: string;
};

/**
 * One menu in the bar: a `MenubarTrigger` plus a `MenubarContent`. Renders a
 * `DropdownMenu` whose open state the bar controls.
 *
 * Trigger order for arrow-key navigation comes from mount order, not from
 * `value` — `value` is only an identity.
 */
export type MenubarMenuProps = {
  /** Unique identity for this menu within the bar. */
  value: string;
  children: React.ReactNode;
};

/**
 * The bar button that opens one menu. `value` is Omitted — it belongs to the
 * enclosing `MenubarMenu`, not to the button.
 */
export type MenubarTriggerProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'value'
> & {
  className?: string;
};

// The menu-surface parts are DropdownMenu's, re-exported under Menubar names.
export type {
  DropdownMenuContentProps as MenubarContentProps,
  DropdownMenuItemProps as MenubarItemProps,
  DropdownMenuLabelProps as MenubarLabelProps,
  DropdownMenuSeparatorProps as MenubarSeparatorProps,
  DropdownMenuGroupProps as MenubarGroupProps,
  DropdownMenuCheckboxItemProps as MenubarCheckboxItemProps,
  DropdownMenuRadioGroupProps as MenubarRadioGroupProps,
  DropdownMenuRadioItemProps as MenubarRadioItemProps,
  DropdownMenuShortcutProps as MenubarShortcutProps,
  DropdownMenuSide as MenubarSide,
  DropdownMenuAlign as MenubarAlign,
} from '../DropdownMenu/DropdownMenu.types';
