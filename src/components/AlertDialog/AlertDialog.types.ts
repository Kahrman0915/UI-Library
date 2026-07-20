import type { DialogContentAlignment } from '../Dialog/Dialog.types';

export type AlertDialogProps = {
  id: string;
  open: boolean;
  /** Fires on Escape (a cancel). Overlay-click never dismisses an alert dialog. */
  onClose: () => void;
  children: React.ReactNode;
  inline?: boolean;
  className?: string;
};

export type AlertDialogHeaderProps = {
  id: string;
  title: string;
  description?: string;
  alignment?: DialogContentAlignment;
  className?: string;
};

export type AlertDialogBodyProps = {
  children: React.ReactNode;
  alignment?: DialogContentAlignment;
  className?: string;
};

export type AlertDialogFooterProps = {
  children: React.ReactNode;
  className?: string;
};
