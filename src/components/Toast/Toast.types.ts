import type { LucideIcon } from 'lucide-react';

export type ToastVariant =
  | 'default'
  | 'info'
  | 'success'
  | 'warning'
  | 'error';

export type ToastPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export type ToastAction = {
  label: string;
  onClick: () => void;
};

export type ToastCancel = {
  label: string;
  onClick?: () => void;
};

/** Options that a caller can pass to `toast()` or its variant helpers. */
export type ToastOptions = {
  /** Dedupe key. Reusing an id updates the existing toast rather than adding a new one. */
  id?: string;
  variant?: ToastVariant;
  description?: React.ReactNode;
  /** ms until auto-dismiss. `Infinity` = sticky. */
  duration?: number;
  Icon?: LucideIcon;
  action?: ToastAction;
  cancel?: ToastCancel;
  /**
   * 0–100. When set, the toast renders a slim Progress bar under the
   * description. Update it by re-calling `toast()` with the same `id`.
   */
  progress?: number;
  onDismiss?: () => void;
};

/** Internal record for a live toast. */
export type ToastRecord = {
  id: string;
  title: React.ReactNode;
  variant: ToastVariant;
  description?: React.ReactNode;
  duration: number;
  Icon?: LucideIcon;
  action?: ToastAction;
  cancel?: ToastCancel;
  progress?: number;
  onDismiss?: () => void;
  createdAt: number;
};

export type ToasterProps = {
  /** Where the stack lives on screen. Default `bottom-right`. */
  position?: ToastPosition;
  /** Maximum simultaneously visible toasts. Older ones drop off. Default 3. */
  visibleToasts?: number;
  /** Gap between stacked toasts in px. Default 8. */
  gap?: number;
  /** Fallback auto-dismiss duration if the individual toast didn't set one. Default 4000ms. */
  duration?: number;
  className?: string;
};

export type ToastPromiseMessages<T> = {
  loading: React.ReactNode;
  success: React.ReactNode | ((data: T) => React.ReactNode);
  error: React.ReactNode | ((err: unknown) => React.ReactNode);
};
