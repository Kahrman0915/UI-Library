import type { Side, Align } from '#/utils/computePosition';

export type ComboboxSize = 'sm' | 'default' | 'lg';
export type ComboboxSide = Side;
export type ComboboxAlign = Align;

export type ComboboxOption = {
  value: string;
  label: React.ReactNode;
  /** Optional plain-text search key. Falls back to `label` when it's a string. */
  searchText?: string;
  description?: React.ReactNode;
  disabled?: boolean;
};

export type ComboboxProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'defaultValue' | 'onChange'
> & {
  id: string;
  options: ComboboxOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  name?: string;
  size?: ComboboxSize;
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: boolean;
  errorMessage?: React.ReactNode;
  placeholder?: React.ReactNode;
  searchPlaceholder?: string;
  emptyMessage?: React.ReactNode;
  disabled?: boolean;
  required?: boolean;
  clearable?: boolean;
  /**
   * Accessible name for the clear button. Default `'Clear selection'`. A prop
   * because the button is an internal element `...rest` can't reach.
   */
  clearLabel?: string;
  /** Optional custom filter. Default: case-insensitive substring on option label/searchText. */
  filter?: (option: ComboboxOption, search: string) => boolean;
  side?: ComboboxSide;
  align?: ComboboxAlign;
  sideOffset?: number;
  matchTriggerWidth?: boolean;
  className?: string;
};
