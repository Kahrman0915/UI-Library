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
  className,
}: ToasterProps) => {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
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
      if (!Number.isFinite(record.duration)) return;
      const timer = window.setTimeout(() => {
        emit({ type: 'DISMISS', id: record.id });
      }, record.duration);
      timersRef.current.set(record.id, timer);
    };

    const unsubscribe = subscribe((action) => {
      if (action.type === 'ADD') {
        setToasts((prev) => {
          const existingIndex = prev.findIndex((t) => t.id === action.toast.id);
          if (existingIndex >= 0) {
            // Reuse of an id — replace in place.
            const next = [...prev];
            next[existingIndex] = action.toast;
            return next;
          }
          // Newer toasts render at the top of the stack; overflow drops off the tail.
          return [action.toast, ...prev].slice(0, visibleToasts);
        });
        scheduleDismiss(action.toast);
      } else if (action.type === 'DISMISS') {
        setToasts((prev) => {
          if (action.id === undefined) {
            prev.forEach((t) => {
              clearTimer(t.id);
              t.onDismiss?.();
            });
            return [];
          }
          const target = prev.find((t) => t.id === action.id);
          if (!target) return prev;
          clearTimer(target.id);
          target.onDismiss?.();
          return prev.filter((t) => t.id !== action.id);
        });
      } else if (action.type === 'UPDATE') {
        setToasts((prev) => {
          const next = prev.map((t) =>
            t.id === action.id ? { ...t, ...action.patch } : t,
          );
          // If the update changed duration, reschedule.
          const updated = next.find((t) => t.id === action.id);
          if (updated) scheduleDismiss(updated);
          return next;
        });
      }
    });

    return () => {
      unsubscribe();
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      timersRef.current.clear();
    };
  }, [visibleToasts]);

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
