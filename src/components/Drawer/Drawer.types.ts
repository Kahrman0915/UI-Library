/** Which edge the panel slides in from. */
export type DrawerSide = 'top' | 'right' | 'bottom' | 'left';

/**
 * Edge panel. Shares Dialog's portal, focus trap, scroll lock and Escape
 * handling, and animates out via a `closed → open → closing` state machine.
 * Controlled only — there is no `defaultOpen`.
 */
export type DrawerProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Required. `DrawerHeader` must be given the SAME id — it seeds
   *  `{id}-title` / `{id}-description` for the panel's aria wiring. */
  id: string;
  /** Controlled — Drawer has no trigger of its own. */
  open: boolean;
  /** Fires on Escape, the close button, and (by default) an overlay click. */
  onClose: () => void;
  children: React.ReactNode;
  /** Default `right`. */
  side?: DrawerSide;
  /**
   * Default **`true`** — note this is the OPPOSITE of `Dialog`, which defaults
   * to `false`. Set `false` for a drawer holding unsaved work.
   */
  closeOnOutsideClick?: boolean;
  className?: string;
};

export type DrawerHeaderProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Must equal the `Drawer`'s `id`, or the panel loses its accessible name. */
  id: string;
  /** Rendered as the `<h2>` the drawer is labelled by. */
  title: string;
  /** Rendered under the title and referenced by the panel's `aria-describedby`. */
  description?: string;
  /** Default `true`. Requires `onClose` to actually render. */
  showCloseButton?: boolean;
  /** Fires when the X is pressed. Wire it to the same setter as the Drawer's
   *  own `onClose`. */
  onClose?: () => void;
  className?: string;
};

/** Scrollable middle region. Put long content here so the header/footer stay put. */
export type DrawerBodyProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
  className?: string;
};

/** Action row, pinned to the bottom of the panel. */
export type DrawerFooterProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
  className?: string;
};
