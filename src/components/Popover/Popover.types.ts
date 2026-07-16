import type { Side, Align } from '#/utils/computePosition';

export type PopoverSide = Side;
export type PopoverAlign = Align;

export type PopoverProps = {
  id: string;
  children: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export type PopoverTriggerProps = {
  children: React.ReactElement;
};

export type PopoverContentProps = React.HTMLAttributes<HTMLDivElement> & {
  side?: PopoverSide;
  align?: PopoverAlign;
  sideOffset?: number;
  className?: string;
  children?: React.ReactNode;
};

export type PopoverCloseProps = {
  children: React.ReactElement;
};
