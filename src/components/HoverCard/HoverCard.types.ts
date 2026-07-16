import type { Side, Align } from '#/utils/computePosition';

export type HoverCardSide = Side;
export type HoverCardAlign = Align;

export type HoverCardProps = {
  id: string;
  children: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  openDelay?: number;
  closeDelay?: number;
};

export type HoverCardTriggerProps = {
  children: React.ReactElement;
};

export type HoverCardContentProps = React.HTMLAttributes<HTMLDivElement> & {
  side?: HoverCardSide;
  align?: HoverCardAlign;
  sideOffset?: number;
  className?: string;
  children?: React.ReactNode;
};
