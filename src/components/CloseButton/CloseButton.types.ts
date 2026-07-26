export type CloseButtonVariant = 'default' | 'background';
export type CloseButtonSize = 'sm' | 'default' | 'lg';

export type CloseButtonProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'type' | 'aria-label'
> & {
  id: string;
  variant?: CloseButtonVariant;
  /**
   * `sm` (20px) for dense surfaces like a Toast, `default` (24px) for dialog and
   * banner headers, `lg` (32px) for touch-first layouts. Every size keeps a
   * pointer target of at least 24×24 — see CloseButton.scss.
   */
  size?: CloseButtonSize;
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  ariaLabel?: string;
  className?: string;
};
