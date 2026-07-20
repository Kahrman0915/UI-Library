import type { Size } from '#/types/GlobalTypes';

export type ButtonProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'style' | 'onClick'
> & {
  id: string;
  label?: string;
  onClick?: () => void;
  variant?: ButtonVariant;
  style?: ButtonStyle;
  size?: Size;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  isLoading?: boolean;
  IconLeft?: React.FC;
  IconRight?: React.FC;
  iconOnly?: boolean;
  IconCenter?: React.FC;
  'aria-label'?: string;
  className?: string;
};

export type ButtonVariant =
  | 'default'
  | 'error'
  | 'info'
  | 'success'
  | 'warning'
  | 'aiden';

export type ButtonStyle =
  | 'default'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'link';

export type ButtonAidenStyle =
  | 'default'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'link';

export type ButtonStyleByVariant = {
  aiden: ButtonAidenStyle;
  default: ButtonStyle;
  error: ButtonStyle;
  info: ButtonStyle;
  success: ButtonStyle;
  warning: ButtonStyle;
};
