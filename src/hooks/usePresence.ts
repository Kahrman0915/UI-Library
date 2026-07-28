import { useCallback, useEffect, useState } from 'react';
import type { AnimationEvent } from 'react';

type PresenceStatus = 'open' | 'closing' | 'closed';

/**
 * usePresence — keeps a portal/overlay mounted through its exit animation.
 *
 * React unmounts instantly when `open` flips false, so a closing surface has no
 * chance to animate out. This runs the same `closed → open → closing` state
 * machine as Dialog/Drawer: while `open` is true → `open`; when it flips false →
 * `closing` (still `present`, so the caller keeps rendering it with an exit
 * class); once the exit ends → `closed` (unmount).
 *
 * The caller renders while `present`, picks its enter/exit class from `status`,
 * and wires `onExitAnimationEnd` to the animated element's `onAnimationEnd`. The
 * handler only fires on the element's own `ui-overlay-out-*` animation (not a
 * child's, and not the enter animation), so it can't unmount early. A duration
 * fallback covers reduced-motion / backgrounded tabs where `animationend` is
 * unreliable — both paths are idempotent.
 *
 * Positioning (computePosition) stays keyed on the real `open`, so a closing
 * surface holds its last position and doesn't re-measure mid-exit.
 */
export function usePresence(open: boolean, exitFallbackMs = 260) {
  const [status, setStatus] = useState<PresenceStatus>(
    open ? 'open' : 'closed',
  );

  // Adjust state DURING render (React re-renders immediately, before commit —
  // no extra frame), not in an effect. Opening must be synchronous: the content
  // has to mount the same tick so its positioning layout-effect (keyed on the
  // real `open`) runs with a live ref. A deferred effect would mount it a render
  // late, after that effect already ran against a null ref — leaving it unplaced
  // (visibility:hidden). Closing flips to `closing` so it stays present to exit.
  if (open && status !== 'open') {
    setStatus('open');
  } else if (!open && status === 'open') {
    setStatus('closing');
  }

  useEffect(() => {
    if (status !== 'closing') return;
    const timer = setTimeout(() => setStatus('closed'), exitFallbackMs);
    return () => clearTimeout(timer);
  }, [status, exitFallbackMs]);

  const onExitAnimationEnd = useCallback((e: AnimationEvent<HTMLElement>) => {
    if (
      e.target === e.currentTarget &&
      e.animationName.startsWith('ui-overlay-out')
    ) {
      setStatus((prev) => (prev === 'closing' ? 'closed' : prev));
    }
  }, []);

  return {
    /** Render the surface while this is true (covers both `open` and `closing`). */
    present: status !== 'closed',
    /** `open` | `closing` | `closed` — drives the enter vs exit class. */
    status,
    /** Wire to the animated element's `onAnimationEnd`. */
    onExitAnimationEnd,
  };
}
