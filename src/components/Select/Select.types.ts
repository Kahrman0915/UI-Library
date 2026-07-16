import type { Side, Align } from '#/utils/computePosition';

export type SelectSize = 'sm' | 'default' | 'lg';
export type SelectSide = Side;
export type SelectAlign = Align;

export type SelectProps = {
  id: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  name?: string;
  disabled?: boolean;
  required?: boolean;
  size?: SelectSize;
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: boolean;
  errorMessage?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
};

export type SelectTriggerProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'type'
> & {
  placeholder?: React.ReactNode;
  className?: string;
};

export type SelectContentProps = React.HTMLAttributes<HTMLDivElement> & {
  side?: SelectSide;
  align?: SelectAlign;
  sideOffset?: number;
  matchTriggerWidth?: boolean;
  className?: string;
  children?: React.ReactNode;
};

export type SelectItemProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'onSelect'
> & {
  value: string;
  disabled?: boolean;
  label?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
};

export type SelectGroupProps = React.HTMLAttributes<HTMLDivElement> & {
  label?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
};

export type SelectLabelProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  children?: React.ReactNode;
};

export type SelectSeparatorProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
};
