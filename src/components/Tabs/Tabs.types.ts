export type TabsOrientation = 'horizontal' | 'vertical';

/**
 * How arrow-key navigation selects tabs (WAI-ARIA APG).
 * - `automatic` — moving focus with the arrows selects that tab immediately.
 *   Right for cheap, instant panels.
 * - `manual` — arrows move focus only; the user presses Enter/Space to select.
 *   Right when switching is expensive (a fetch) or destructive.
 */
export type TabsActivationMode = 'automatic' | 'manual';

export type TabsProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Required. Seeds every trigger/panel id pair for the aria wiring. */
  id: string;
  /** Controlled selected tab. Pair with `onValueChange`. */
  value?: string;
  /** Uncontrolled initial tab. Set one — with neither, no tab is selected and
   *  the tablist has no tabbable trigger. */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Also drives which arrow keys navigate (Left/Right vs Up/Down). */
  orientation?: TabsOrientation;
  /** Default `automatic`. See {@link TabsActivationMode}. */
  activationMode?: TabsActivationMode;
  className?: string;
  children?: React.ReactNode;
};

/**
 * The tablist. Owns the sliding active-tab indicator, which is positioned from
 * the active trigger's box — a custom replacement for this part loses it.
 */
export type TabsListProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  children?: React.ReactNode;
};

export type TabsTriggerProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'type' | 'value'
> & {
  /** Must match the `value` of its `TabsContent`. */
  value: string;
  /** Skipped by arrow-key navigation. */
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
};

export type TabsContentProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Must match its `TabsTrigger`'s `value`. */
  value: string;
  /**
   * Keep the panel mounted while hidden (it renders with the `hidden`
   * attribute). Use to preserve state — scroll position, a half-filled form,
   * an iframe — across tab switches. Default `false` (unmounts).
   */
  forceMount?: boolean;
  className?: string;
  children?: React.ReactNode;
};
