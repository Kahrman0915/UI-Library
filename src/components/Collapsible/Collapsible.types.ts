export type CollapsibleProps = React.HTMLAttributes<HTMLDivElement> & {
  id: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
};

export type CollapsibleTriggerProps = {
  children: React.ReactElement;
};

export type CollapsibleContentProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  children?: React.ReactNode;
};
