export type CloseButtonVariant = 'default' | 'background';

export type CloseButtonProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'type' | 'aria-label'
> & {
  id: string;
  variant?: CloseButtonVariant;
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  ariaLabel?: string;
  className?: string;
};
