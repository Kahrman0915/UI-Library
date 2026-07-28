import type {
  DialogProps,
  DialogHeaderProps,
  DialogBodyProps,
  DialogFooterProps,
} from '../Dialog/Dialog.types';

// Thin preset of Dialog — the props ARE Dialog's props minus the two locked
// carve-outs (`role` is always alertdialog, overlay-click never dismisses).
// Deriving keeps the full HTMLAttributes passthrough in sync with Dialog.
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

export type AlertDialogBodyProps = DialogBodyProps;

export type AlertDialogFooterProps = DialogFooterProps;
