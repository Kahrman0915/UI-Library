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
  ({ children, ...rest }, ref) => {
    return (
      <Dialog
        {...rest}
        ref={ref}
        role="alertdialog"
        // The two carve-outs vs a plain Dialog: overlay click never dismisses.
        closeOnOutsideClick={false}
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
  (props, ref) => {
    return <DialogHeader {...props} ref={ref} showCloseButton={false} />;
  },
);

AlertDialogHeader.displayName = 'AlertDialogHeader';

const AlertDialogBody = forwardRef<HTMLDivElement, AlertDialogBodyProps>(
  (props, ref) => <DialogBody {...props} ref={ref} />,
);

AlertDialogBody.displayName = 'AlertDialogBody';

const AlertDialogFooter = forwardRef<HTMLDivElement, AlertDialogFooterProps>(
  (props, ref) => <DialogFooter {...props} ref={ref} />,
);

AlertDialogFooter.displayName = 'AlertDialogFooter';

export default AlertDialog;
export { AlertDialogHeader, AlertDialogBody, AlertDialogFooter };
