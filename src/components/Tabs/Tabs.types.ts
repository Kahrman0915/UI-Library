export type TabsOrientation = 'horizontal' | 'vertical';

/**
 * The visual treatment of the tablist. Purely presentational — every variant
 * has identical semantics, keyboard behaviour and aria wiring.
 * - `default` — the enclosed pill track. The active tab is a lifted pill.
 * - `line` — no track; the active tab is marked by a bar on `--primary`,
 *   sitting on the list's own hairline. Themes.
 * - `browser` — the active tab is a card-shaped tab merging into the panel
 *   below, which becomes a bordered surface.
 *
 * **`browser` is horizontal-only.** Paired with `orientation="vertical"` it
 * falls back to `line` styling rather than render something incoherent.
 *
 * **`browser` is not {@link TabBar}.** It borrows the shape, not the job: a
 * Tabs trigger reveals a panel shipped beside it, and has no close affordance
 * or overflow scrolling. A strip of open documents the user can close is
 * `TabBar`, whatever either one looks like.
 */
export type TabsVariant = 'default' | 'line' | 'browser';

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
  /**
   * Default `default`. Presentation only — see {@link TabsVariant}. Set on the
   * root; the parts style off a single root class, so nothing is threaded down.
   */
  variant?: TabsVariant;
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
