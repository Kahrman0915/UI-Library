import type { LucideIcon } from 'lucide-react';

export type AlertVariant =
  | 'default'
  | 'brand'
  | 'info'
  | 'success'
  | 'warning'
  | 'error';

export type AlertStyle = 'default' | 'outline';

export type AlertProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> & {
  id: string;
  variant?: AlertVariant;
  style?: AlertStyle;
  title?: React.ReactNode;
  description?: React.ReactNode;
  Icon?: LucideIcon;
  action?: React.ReactNode;
  onClose?: () => void;
  className?: string;
  children?: React.ReactNode;
};
