export type DropdownMenuSide = 'top' | 'right' | 'bottom' | 'left';
export type DropdownMenuAlign = 'start' | 'center' | 'end';

export type DropdownMenuProps = {
  id: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export type DropdownMenuTriggerProps = {
  children: React.ReactElement;
};

export type DropdownMenuContentProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children'
> & {
  children: React.ReactNode;
  side?: DropdownMenuSide;
  align?: DropdownMenuAlign;
  sideOffset?: number;
  className?: string;
};

export type DropdownMenuItemProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children' | 'onClick'
> & {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  disabled?: boolean;
  className?: string;
};

export type DropdownMenuLabelProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children'
> & {
  children: React.ReactNode;
  className?: string;
};

export type DropdownMenuSeparatorProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children'
> & {
  className?: string;
};

export type DropdownMenuGroupProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children'
> & {
  children: React.ReactNode;
  className?: string;
};

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

export type DropdownMenuRadioGroupProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children'
> & {
  children: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
};

export type DropdownMenuRadioItemProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children' | 'onClick'
> & {
  children: React.ReactNode;
  value: string;
  disabled?: boolean;
  className?: string;
};

export type DropdownMenuShortcutProps = Omit<
  React.HTMLAttributes<HTMLSpanElement>,
  'children'
> & {
  children: React.ReactNode;
  className?: string;
};
