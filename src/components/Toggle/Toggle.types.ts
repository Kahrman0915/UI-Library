export type ToggleVariant = 'default' | 'outline';
export type ToggleSize = 'sm' | 'default' | 'lg';

export type ToggleProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'onClick' | 'type'
> & {
  id: string;
  /** Controlled pressed state. Omit to let the toggle manage its own. */
  pressed?: boolean;
  /** Initial pressed state when uncontrolled. Default `false`. */
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  variant?: ToggleVariant;
  size?: ToggleSize;
  disabled?: boolean;
  label?: React.ReactNode;
  IconLeft?: React.FC;
  /** Icon-only toggle — renders a single centred glyph; provide an `aria-label`. */
  IconCenter?: React.FC;
  'aria-label'?: string;
  className?: string;
};
