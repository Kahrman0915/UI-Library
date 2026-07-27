export type ChipSize = 'xsmall' | 'small' | 'default';

type ChipBase = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'onClick' | 'type' | 'aria-label'
> & {
  id: string;
  size?: ChipSize;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  IconLeft?: React.FC;
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
    | { label: string; 'aria-label'?: string }
    | { label?: undefined; 'aria-label': string }
  );
