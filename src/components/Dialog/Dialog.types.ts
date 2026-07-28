export type DialogContentAlignment = 'left' | 'center';

export type DialogRole = 'dialog' | 'alertdialog';

// `role` is redefined as the narrowed DialogRole union, so the loose native
// `role?: string` must be Omitted.
export type DialogProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'role' | 'children'
> & {
  id: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Close when the backdrop is clicked. Default `false`. */
  closeOnOutsideClick?: boolean;
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
  title: string;
  description?: string;
  alignment?: DialogContentAlignment;
  showCloseButton?: boolean;
  onClose?: () => void;
  className?: string;
};

export type DialogBodyProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children'
> & {
  children: React.ReactNode;
  alignment?: DialogContentAlignment;
  className?: string;
};

export type DialogFooterProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children'
> & {
  children: React.ReactNode;
  className?: string;
};
