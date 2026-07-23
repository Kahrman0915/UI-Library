export type MenubarProps = React.HTMLAttributes<HTMLDivElement> & {
  id: string;
  className?: string;
};

export type MenubarMenuProps = {
  /** Unique identity for this menu within the bar. */
  value: string;
  children: React.ReactNode;
};

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
