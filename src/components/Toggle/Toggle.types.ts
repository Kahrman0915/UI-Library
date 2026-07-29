/** `outline` adds a border, for a toggle that stands alone rather than in a group. */
export type ToggleVariant = 'default' | 'outline';
/** Control height. */
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
  /** Fires with the new state on every press. */
  onPressedChange?: (pressed: boolean) => void;
  /** Default `default`. See {@link ToggleVariant}. */
  variant?: ToggleVariant;
  /** Default `default`. See {@link ToggleSize}. */
  size?: ToggleSize;
  disabled?: boolean;
  /** Icon before the label. Must be a zero-prop component (`() => JSX`). */
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
    | {
        /** Visible text. Supplying it makes `aria-label` optional. */
        label: React.ReactNode;
        /** Optional here — the visible `label` already names the toggle. */
        'aria-label'?: string;
      }
    | {
        /** Omitted — this is the icon-only form. */
        label?: undefined;
        /** **Required** without a visible `label`: an icon-only toggle has no
         *  text to name it. */
        'aria-label': string;
      }
  );
