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
