export type DialogContentAlignment = 'left' | 'center';

export type DialogRole = 'dialog' | 'alertdialog';

// `role` is redefined as the narrowed DialogRole union, so the loose native
// `role?: string` must be Omitted.
export type DialogProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'role' | 'children'
> & {
  id: string;
  /** Controlled — Dialog has no trigger of its own. */
  open: boolean;
  /** Fires on Escape, on the header X, and on outside click when that's enabled. */
  onClose: () => void;
  children: React.ReactNode;
  /** Close when the backdrop is clicked. Default `false`. */
  closeOnOutsideClick?: boolean;
  /**
   * Close on Escape. Default `true`.
   *
   * Set `false` only to take Escape over yourself — the panel then has no
   * keyboard exit until you supply one. `FullScreenDialog` is the reason this
   * exists: it has to inspect what else is open before deciding whether an
   * Escape was meant for the page or for a menu floating above it, and there is
   * no way to suppress this listener selectively from outside the component.
   */
  closeOnEscape?: boolean;
  /**
   * ARIA role for the panel. Default `dialog`. `alertdialog` marks an
   * interruptive confirmation that requires a response — used by AlertDialog.
   */
  role?: DialogRole;
  /**
   * Element to focus when the dialog opens. Defaults to the first focusable
   * element in the panel.
   *
   * **Set this on every `AlertDialog`.** APG asks that a confirmation open with
   * focus on the *least destructive* action, and the first focusable element is
   * usually the opposite — in a "Cancel / Delete" footer it lands on Cancel only
   * by accident of source order, and any header content moves it somewhere else
   * entirely. Point it at the button you want a keyboard user to hit by reflex.
   */
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  /**
   * Render in-flow (no portal, no overlay, no focus trap, no scroll lock).
   * For embedding the panel chrome inside a page section.
   */
  inline?: boolean;
  className?: string;
};

// `title` is redefined as the heading string, so the native tooltip-text
// `title` attribute must be Omitted.
export type DialogHeaderProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'title'
> & {
  /** Must match the `Dialog`'s `id` — it seeds `{id}-title` for aria-labelledby. */
  id: string;
  /** The dialog's heading. Rendered into `{id}-title`, which names the dialog. */
  title: string;
  /** Supporting line under the title. Rendered into `{id}-description`, which
   *  the panel references via `aria-describedby`. Omit it and the reference is
   *  dropped rather than left dangling. */
  description?: string;
  /** Default `left`. `center` for a short confirmation. */
  alignment?: DialogContentAlignment;
  /** Show the X. Default `true`; `AlertDialog` locks it off, since an alert
   *  dialog must be answered rather than dismissed. */
  showCloseButton?: boolean;
  /** Fires when the X is pressed. Wire it to the same setter as the Dialog's
   *  own `onClose`. */
  onClose?: () => void;
  className?: string;
};

/**
 * The scrolling middle of the panel. **The only part that scrolls** — the panel
 * is a flex column capped at 85vh, and the header and footer are pinned outside
 * this element.
 */
export type DialogBodyProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children'
> & {
  children: React.ReactNode;
  /** Default `left`. Match the header's for a coherent panel. */
  alignment?: DialogContentAlignment;
  className?: string;
};

/**
 * The action row, pinned to the bottom. Order matters for keyboard users —
 * whichever button comes first is what `Dialog` focuses unless you set
 * `initialFocusRef`.
 */
export type DialogFooterProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children'
> & {
  children: React.ReactNode;
  className?: string;
};
