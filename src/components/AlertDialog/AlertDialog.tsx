import { forwardRef } from 'react';
import Dialog, {
  DialogHeader,
  DialogBody,
  DialogFooter,
} from '#components/Dialog/Dialog';
import type {
  AlertDialogProps,
  AlertDialogHeaderProps,
  AlertDialogBodyProps,
  AlertDialogFooterProps,
} from './AlertDialog.types';

/**
 * A confirmation dialog that requires an explicit choice. It's a thin preset of
 * `Dialog`: same portal, focus trap, scroll lock, Escape-to-close and
 * focus-restore, but with `role="alertdialog"` and — deliberately — no
 * overlay-click-to-dismiss and no header close button. The user must pick an
 * action in the footer. No new machinery of its own.
 */
const AlertDialog = forwardRef<HTMLDivElement, AlertDialogProps>(
  ({ id, open, onClose, children, inline = false, className }, ref) => {
    return (
      <Dialog
        ref={ref}
        id={id}
        open={open}
        onClose={onClose}
        role="alertdialog"
        // The two carve-outs vs a plain Dialog: overlay click never dismisses.
        closeOnOutsideClick={false}
        inline={inline}
        className={className}
      >
        {children}
      </Dialog>
    );
  },
);

AlertDialog.displayName = 'AlertDialog';

// The header omits the close button (the other carve-out) — an alert dialog is
// dismissed only through a footer action or Escape.
const AlertDialogHeader = forwardRef<HTMLDivElement, AlertDialogHeaderProps>(
  ({ id, title, description, alignment, className }, ref) => {
    return (
      <DialogHeader
        ref={ref}
        id={id}
        title={title}
        description={description}
        alignment={alignment}
        showCloseButton={false}
        className={className}
      />
    );
  },
);

AlertDialogHeader.displayName = 'AlertDialogHeader';

const AlertDialogBody = forwardRef<HTMLDivElement, AlertDialogBodyProps>(
  ({ children, alignment, className }, ref) => (
    <DialogBody ref={ref} alignment={alignment} className={className}>
      {children}
    </DialogBody>
  ),
);

AlertDialogBody.displayName = 'AlertDialogBody';

const AlertDialogFooter = forwardRef<HTMLDivElement, AlertDialogFooterProps>(
  ({ children, className }, ref) => (
    <DialogFooter ref={ref} className={className}>
      {children}
    </DialogFooter>
  ),
);

AlertDialogFooter.displayName = 'AlertDialogFooter';

export default AlertDialog;
export { AlertDialogHeader, AlertDialogBody, AlertDialogFooter };
