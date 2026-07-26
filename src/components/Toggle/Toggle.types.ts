export type ToggleVariant = 'default' | 'outline';
export type ToggleSize = 'sm' | 'default' | 'lg';

type ToggleBase = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'onClick' | 'type' | 'aria-label'
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
  IconLeft?: React.FC;
  /** Icon-only toggle — renders a single centred glyph. Requires an `aria-label`. */
  IconCenter?: React.FC;
  className?: string;
};

/**
 * A toggle needs an accessible name. A visible `label` supplies one; without it —
 * an icon-only toggle — `aria-label` becomes required, since there is no sensible
 * name to invent. Enforced at compile time rather than left to review. Chip and
 * ToggleGroupItem use the same union.
 */
export type ToggleProps = ToggleBase &
  (
    | { label: React.ReactNode; 'aria-label'?: string }
    | { label?: undefined; 'aria-label': string }
  );
