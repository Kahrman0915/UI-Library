import { emit, nextId } from './toast-emitter';
import type {
  ToastOptions,
  ToastPromiseMessages,
  ToastRecord,
  ToastVariant,
} from './Toast.types';

// Error toasts dwell longer than everything else. Non-error toasts deliberately
// leave `duration` undefined so the Toaster's own `duration` prop can apply —
// baking a default in here is what made `<Toaster duration>` a no-op.
const ERROR_DURATION = 6000;

const create = (
  title: React.ReactNode,
  opts: ToastOptions = {},
  defaultVariant: ToastVariant = 'default',
): string => {
  const id = opts.id ?? nextId();
  const record: ToastRecord = {
    id,
    title,
    variant: opts.variant ?? defaultVariant,
    description: opts.description,
    duration:
      opts.duration ??
      (defaultVariant === 'error' ? ERROR_DURATION : undefined),
    Icon: opts.Icon,
    action: opts.action,
    cancel: opts.cancel,
    progress: opts.progress,
    onDismiss: opts.onDismiss,
    createdAt: Date.now(),
  };
  emit({ type: 'ADD', toast: record });
  return id;
};

type ToastFn = {
  (title: React.ReactNode, opts?: ToastOptions): string;
  success: (title: React.ReactNode, opts?: ToastOptions) => string;
  info: (title: React.ReactNode, opts?: ToastOptions) => string;
  warning: (title: React.ReactNode, opts?: ToastOptions) => string;
  error: (title: React.ReactNode, opts?: ToastOptions) => string;
  /** Sticky toast (no auto-dismiss). Update or dismiss it manually via its id. */
  loading: (title: React.ReactNode, opts?: ToastOptions) => string;
  /** Dismiss one toast by id, or all toasts if id is omitted. */
  dismiss: (id?: string) => void;
  /**
   * Attach a toast to a promise. Renders `loading` while pending, then swaps to
   * `success` or `error` with the appropriate variant when the promise settles.
   */
  promise: <T>(
    promise: Promise<T>,
    msgs: ToastPromiseMessages<T>,
    opts?: Omit<ToastOptions, 'variant' | 'duration'>,
  ) => Promise<T>;
};

const base = (title: React.ReactNode, opts?: ToastOptions) =>
  create(title, opts, 'default');

const fn = base as ToastFn;

fn.success = (title, opts) => create(title, opts, 'success');
fn.info = (title, opts) => create(title, opts, 'info');
fn.warning = (title, opts) => create(title, opts, 'warning');
fn.error = (title, opts) => create(title, opts, 'error');
fn.loading = (title, opts) =>
  create(title, { ...opts, duration: Infinity }, 'default');

fn.dismiss = (id) => {
  emit({ type: 'DISMISS', id });
};

fn.promise = (promise, msgs, opts) => {
  const id = create(msgs.loading, { ...opts, duration: Infinity }, 'default');
  promise.then(
    (value) => {
      const title =
        typeof msgs.success === 'function' ? msgs.success(value) : msgs.success;
      emit({
        type: 'UPDATE',
        id,
        // Explicit `undefined` clears the sticky `Infinity` set while pending and
        // hands the choice back to the Toaster's `duration` prop.
        patch: { title, variant: 'success', duration: undefined },
      });
    },
    (err) => {
      const title =
        typeof msgs.error === 'function' ? msgs.error(err) : msgs.error;
      emit({
        type: 'UPDATE',
        id,
        patch: { title, variant: 'error', duration: ERROR_DURATION },
      });
    },
  );
  return promise;
};

export const toast: ToastFn = fn;
