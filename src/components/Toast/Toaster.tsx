import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useMounted } from '#/hooks/useMounted';
import ToastCard from './ToastCard';
import { emit, subscribe } from './toast-emitter';
import type { ToastRecord, ToasterProps } from './Toast.types';
import './Toast.scss';

/**
 * Toaster — mount once at the app root. Owns the visible toast stack and
 * subscribes to the global toast emitter. Consumers fire notifications by
 * calling the imperative `toast()` API from anywhere.
 */
const Toaster = ({
  position = 'bottom-right',
  visibleToasts = 3,
  gap = 8,
  duration = 4000,
  className,
}: ToasterProps) => {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  // Mirror of `toasts`, written synchronously alongside every state update so
  // the emitter handlers never have to read state from inside an updater.
  const toastsRef = useRef<ToastRecord[]>([]);
  const timersRef = useRef<Map<string, number>>(new Map());
  const mounted = useMounted();

  useEffect(() => {
    const clearTimer = (id: string) => {
      const timer = timersRef.current.get(id);
      if (timer !== undefined) {
        window.clearTimeout(timer);
        timersRef.current.delete(id);
      }
    };

    const scheduleDismiss = (record: ToastRecord) => {
      clearTimer(record.id);
      // A record with no duration of its own defers to this Toaster's prop.
      const ms = record.duration ?? duration;
      if (!Number.isFinite(ms)) return;
      const timer = window.setTimeout(() => {
        emit({ type: 'DISMISS', id: record.id });
      }, ms);
      timersRef.current.set(record.id, timer);
    };

    // Single funnel for state writes. `toastsRef` is kept in lockstep so the
    // handlers below can read the current stack *outside* a state updater —
    // React treats updaters as pure and may run them more than once (StrictMode
    // does in dev), which double-fired consumer `onDismiss` callbacks and
    // double-scheduled timers. Assigning the ref synchronously here also keeps
    // same-tick bursts correct, which is what the old `prev` argument bought us.
    const commit = (next: ToastRecord[]) => {
      toastsRef.current = next;
      setToasts(next);
    };

    const unsubscribe = subscribe((action) => {
      const prev = toastsRef.current;

      if (action.type === 'ADD') {
        const existingIndex = prev.findIndex((t) => t.id === action.toast.id);
        if (existingIndex >= 0) {
          // Reuse of an id — replace in place.
          const next = [...prev];
          next[existingIndex] = action.toast;
          commit(next);
        } else {
          // Newer toasts render at the top of the stack; overflow drops off the tail.
          commit([action.toast, ...prev].slice(0, visibleToasts));
        }
        scheduleDismiss(action.toast);
      } else if (action.type === 'DISMISS') {
        if (action.id === undefined) {
          commit([]);
          prev.forEach((t) => {
            clearTimer(t.id);
            t.onDismiss?.();
          });
          return;
        }
        const target = prev.find((t) => t.id === action.id);
        if (!target) return;
        commit(prev.filter((t) => t.id !== action.id));
        clearTimer(target.id);
        target.onDismiss?.();
      } else if (action.type === 'UPDATE') {
        const next = prev.map((t) =>
          t.id === action.id ? { ...t, ...action.patch } : t,
        );
        commit(next);
        // If the update changed duration, reschedule.
        const updated = next.find((t) => t.id === action.id);
        if (updated) scheduleDismiss(updated);
      }
    });

    return () => {
      unsubscribe();
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      timersRef.current.clear();
    };
  }, [visibleToasts, duration]);

  if (!mounted) return null;
  if (toasts.length === 0) return null;

  return createPortal(
    <div
      data-position={position}
      className={`ui-toaster ui-toaster--${position}${className ? ' ' + className : ''}`}
      style={{ gap }}
    >
      {toasts.map((t) => (
        <ToastCard
          key={t.id}
          toast={t}
          onDismiss={() => emit({ type: 'DISMISS', id: t.id })}
        />
      ))}
    </div>,
    document.body,
  );
};

Toaster.displayName = 'Toaster';

export default Toaster;
