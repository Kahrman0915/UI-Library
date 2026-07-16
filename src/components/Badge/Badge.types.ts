export type BadgeVariant =
  | 'default'
  | 'outline'
  | 'error'
  | 'error-outline'
  | 'success'
  | 'success-outline'
  | 'warning'
  | 'warning-outline'
  | 'info'
  | 'info-outline'
  | 'aiden'
  | 'aiden-outline';

export type BadgeProps = React.HTMLAttributes<HTMLDivElement> & {
  id: string;
  label?: string;
  variant?: BadgeVariant;
  IconLeft?: React.FC;
  IconRight?: React.FC;
  IconCenter?: React.FC;
  className?: string;
};
