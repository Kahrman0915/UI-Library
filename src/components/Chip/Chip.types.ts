export type ChipSize = 'xsmall' | 'small' | 'default';

export type ChipProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'onClick' | 'type'
> & {
  id: string;
  label?: string;
  size?: ChipSize;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  IconLeft?: React.FC;
  IconRight?: React.FC;
  IconCenter?: React.FC;
  'aria-label'?: string;
  className?: string;
};
