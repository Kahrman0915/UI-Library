/**
 * Chip has no `large` rung. Both spellings are accepted — see `Size` in
 * `types/GlobalTypes.ts` for why the library carries two.
 */
export type ChipSize = 'xsmall' | 'small' | 'default' | 'xs' | 'sm';

type ChipBase = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'onClick' | 'type' | 'aria-label'
> & {
  id: string;
  /** Default `default`. See {@link ChipSize}. */
  size?: ChipSize;
  /** The on state — filled with `--primary`. Controlled: you own the boolean. */
  active?: boolean;
  disabled?: boolean;
  /** Note the narrowed signature: it receives **no event**. */
  onClick?: () => void;
  /** Icon before the label. Must be a zero-prop component (`() => JSX`). */
  IconLeft?: React.FC;
  /** Icon after the label. Must be a zero-prop component. */
  IconRight?: React.FC;
  /** Renders alone and centred. Supplying it without a `label` makes an icon-only chip. */
  IconCenter?: React.FC;
  className?: string;
};

/**
 * A chip needs an accessible name. With a visible `label` that comes for free;
 * without one — an icon-only chip — `aria-label` becomes required, because there
 * is no sensible name to invent (unlike CloseButton, which can always default to
 * "Close"). The union enforces that at compile time rather than leaving it to a
 * review to catch.
 */
export type ChipProps = ChipBase &
  (
    | {
        /** Visible text. Supplying it makes `aria-label` optional. */
        label: string;
        /** Optional here — the visible `label` already names the chip. */
        'aria-label'?: string;
      }
    | {
        /** Omitted — this is the icon-only form. */
        label?: undefined;
        /** **Required** without a visible `label`: an icon-only chip has no
         *  text to name it, and there's nothing sensible to invent. */
        'aria-label': string;
      }
  );
