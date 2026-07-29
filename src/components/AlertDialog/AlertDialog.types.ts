import type {
  DialogProps,
  DialogHeaderProps,
  DialogBodyProps,
  DialogFooterProps,
} from '../Dialog/Dialog.types';

// Thin preset of Dialog — the props ARE Dialog's props minus the two locked
// carve-outs (`role` is always alertdialog, overlay-click never dismisses).
// Deriving keeps the full HTMLAttributes passthrough in sync with Dialog.
/**
 * A modal that requires an explicit choice. A thin preset of `Dialog` with the
 * two carve-outs the pattern demands — `role="alertdialog"`, and no dismissal
 * by outside click or header X — so `role` and `closeOnOutsideClick` are Omitted.
 *
 * **Set `initialFocusRef`** (inherited from `DialogProps`) so it opens on the
 * least destructive action rather than whatever happens to come first.
 */
export type AlertDialogProps = Omit<
  DialogProps,
  'role' | 'closeOnOutsideClick' | 'onClose'
> & {
  /** Fires on Escape (a cancel). Overlay-click never dismisses an alert dialog. */
  onClose: () => void;
};

// Header preset: the close button is locked off — an alert dialog is dismissed
// only through a footer action or Escape.
export type AlertDialogHeaderProps = Omit<
  DialogHeaderProps,
  'showCloseButton' | 'onClose'
>;

/** Body preset — identical to `DialogBody`. */
export type AlertDialogBodyProps = DialogBodyProps;

/**
 * Footer preset — identical to `DialogFooter`. Put the least destructive action
 * first and point `initialFocusRef` at it; an alert dialog should never open
 * focused on the destructive choice.
 */
export type AlertDialogFooterProps = DialogFooterProps;
