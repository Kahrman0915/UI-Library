import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useMounted } from '#/hooks/useMounted';
import ToastCard from './ToastCard';
import { emit, subscribe } from './toast-emitter';
import type { ToastRecord, ToasterProps } from './Toast.types';
import './Toast.scss';

// How long a dismissed toast stays mounted to play its exit before removal.
// Must comfortably exceed the CSS exit animation (--duration-normal, 200ms); the
// buffer covers reduced-motion / backgrounded tabs where animationend is flaky.
const EXIT_MS = 260;

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
  // Pause plumbing (WCAG 2.2.1): hovering or focusing the stack suspends
  // auto-dismiss so a toast can't vanish while the user reaches for its action.
  const pausedRef = useRef(false);
  const hoverRef = useRef(false);
  const focusRef = useRef(false);
  const pauseApiRef = useRef<{ pause: () => void; resume: () => void } | null>(
    null,
  );
  const containerRef = useRef<HTMLDivElement | null>(null);
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
      // While paused, don't arm the timer — resume() re-schedules everything.
      if (pausedRef.current) return;
      // A record with no duration of its own defers to this Toaster's prop.
      const ms = record.duration ?? duration;
      if (!Number.isFinite(ms)) return;
      const timer = window.setTimeout(() => {
        emit({ type: 'DISMISS', id: record.id });
      }, ms);
      timersRef.current.set(record.id, timer);
    };

    // Suspend auto-dismiss for every live (non-leaving) toast; exit timers on
    // `leaving` toasts keep running so mid-exit cards still unmount. Resume
    // restarts each live toast's full duration — simpler than tracking
    // remaining time, and strictly more generous to the user.
    pauseApiRef.current = {
      pause: () => {
        if (pausedRef.current) return;
        pausedRef.current = true;
        containerRef.current?.setAttribute('data-paused', '');
        for (const t of toastsRef.current) {
          if (!t.leaving) clearTimer(t.id);
        }
      },
      resume: () => {
        if (!pausedRef.current) return;
        pausedRef.current = false;
        containerRef.current?.removeAttribute('data-paused');
        for (const t of toastsRef.current) {
          if (!t.leaving) scheduleDismiss(t);
        }
      },
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
          const combined = [action.toast, ...prev];
          const kept = combined.slice(0, visibleToasts);
          // Overflowed toasts must be dismissed PROPERLY, not silently removed:
          // clear their timers (else they leak until unmount) and honour the
          // consumer's onDismiss contract.
          for (const dropped of combined.slice(visibleToasts)) {
            clearTimer(dropped.id);
            dropped.onDismiss?.();
          }
          commit(kept);
        }
        scheduleDismiss(action.toast);
      } else if (action.type === 'DISMISS') {
        if (action.id === undefined) {
          // Mark every toast leaving so the whole stack animates out together,
          // then remove them once the exit has played.
          const ids = prev.map((t) => t.id);
          prev.forEach((t) => {
            clearTimer(t.id);
            t.onDismiss?.();
          });
          commit(prev.map((t) => ({ ...t, leaving: true })));
          const timer = window.setTimeout(() => {
            commit(toastsRef.current.filter((t) => !ids.includes(t.id)));
            timersRef.current.delete('*');
          }, EXIT_MS);
          timersRef.current.set('*', timer);
          return;
        }
        const target = prev.find((t) => t.id === action.id);
        if (!target || target.leaving) return;
        const id = target.id;
        clearTimer(id);
        target.onDismiss?.();
        // Flag the card so it plays its exit keyframes, then drop it once done.
        commit(prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
        const timer = window.setTimeout(() => {
          commit(toastsRef.current.filter((t) => t.id !== id));
          timersRef.current.delete(id);
        }, EXIT_MS);
        timersRef.current.set(id, timer);
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

    // When the effect re-runs (a `duration`/`visibleToasts` prop change), the
    // cleanup below has just cleared every timer while the visible toasts
    // survive in state — reschedule them or they'd be stranded on screen
    // forever. (`leaving` toasts are mid-exit; their removal is re-armed too.)
    for (const t of toastsRef.current) {
      if (t.leaving) {
        const timer = window.setTimeout(() => {
          commit(toastsRef.current.filter((x) => x.id !== t.id));
          timersRef.current.delete(t.id);
        }, EXIT_MS);
        timersRef.current.set(t.id, timer);
      } else {
        scheduleDismiss(t);
      }
    }

    return () => {
      unsubscribe();
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      timersRef.current.clear();
    };
  }, [visibleToasts, duration]);

  if (!mounted) return null;

  // The container stays mounted even when empty — several screen-reader/browser
  // pairs miss content inserted at the same moment its live region is created,
  // so the region must pre-exist the first toast. It's pointer-events: none and
  // visually nothing when empty.
  const updatePaused = () => {
    const shouldPause = hoverRef.current || focusRef.current;
    if (shouldPause) pauseApiRef.current?.pause();
    else pauseApiRef.current?.resume();
  };

  return createPortal(
    <div
      ref={containerRef}
      role="region"
      aria-label="Notifications"
      data-position={position}
      className={`ui-toaster ui-toaster--${position}${className ? ' ' + className : ''}`}
      style={{ gap }}
      // Pause auto-dismiss while the pointer or keyboard focus is on the stack
      // (WCAG 2.2.1 — the toast can't race the user to its own action button).
      onMouseEnter={() => {
        hoverRef.current = true;
        updatePaused();
      }}
      onMouseLeave={() => {
        hoverRef.current = false;
        updatePaused();
      }}
      onFocusCapture={() => {
        focusRef.current = true;
        updatePaused();
      }}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          focusRef.current = false;
          updatePaused();
        }
      }}
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
