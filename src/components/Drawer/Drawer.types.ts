/** Which edge the panel slides in from. */
export type DrawerSide = 'top' | 'right' | 'bottom' | 'left';

/**
 * Edge panel. Shares Dialog's portal, focus trap, scroll lock and Escape
 * handling, and animates out via a `closed → open → closing` state machine.
 * Controlled only — there is no `defaultOpen`. `modal={false}` makes it a docked,
 * non-modal panel instead (see `modal`).
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
  /**
   * Default `true`. `false` makes a DOCKED, non-modal panel for work that happens beside
   * it — the Builder's side panel, where you add components and watch the canvas change.
   * It renders in place (no portal) and positions `absolute` inside its nearest positioned
   * ancestor; there is no overlay, no focus trap, no scroll lock and no outside-click
   * close, and it is a non-modal dialog (no `aria-modal`). Escape still closes it, but only
   * while focus is inside the panel. Focus moves in on open and back on close, and the
   * slide animation is the same. `closeOnOutsideClick` is ignored.
   */
  modal?: boolean;
  className?: string;
};

export type DrawerHeaderProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Must equal the `Drawer`'s `id`, or the panel loses its accessible name. */
  id: string;
  /** Rendered as the `<h2>` the drawer is labeled by. */
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
