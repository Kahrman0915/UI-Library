/**
 * - `default` — no border; pressed fills with the neutral `--accent`.
 * - `outline` — adds a border, for a toggle that stands alone rather than in a group.
 * - `line` — no box at all; the pressed item is marked by a `--primary` bar on its
 *   bottom edge, the same treatment `Tabs` uses for its own `line` variant. For a
 *   quiet filter bar where a segmented control would shout.
 * - `plain` — no box and no bar; pressed is `--foreground` at `--font-semibold`
 *   against `--muted-foreground` elsewhere. The quietest rung.
 *
 * `line` and `plain` are presentation only — identical semantics, keyboard
 * behaviour and aria to the other two. In a `ToggleGroup` they also drop the
 * segmented border-collapse and sit apart on a gap, since they have no borders
 * to share.
 */
export type ToggleVariant = 'default' | 'outline' | 'line' | 'plain';
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
  /** Icon after the label. Must be a zero-prop component. */
  IconRight?: React.FC;
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
