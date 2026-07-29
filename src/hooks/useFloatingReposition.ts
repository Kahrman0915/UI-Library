import { useEffect } from 'react';

/**
 * Keeps a floating surface anchored to its trigger while it's open.
 *
 * `computePosition` measures the trigger *once*, when the surface opens. Anything
 * that moves the trigger afterwards — the window resizing, a side panel being
 * dragged, an ancestor scrolling — leaves the surface stranded at its original
 * coordinates, visibly detached from the control that owns it.
 *
 * This re-runs the caller's positioning on those events, rAF-throttled so a
 * continuous drag costs one measurement per frame rather than one per event.
 *
 * @param active     Only listen while the surface is open.
 * @param reposition Recomputes and applies the position. Must be stable
 *                   (`useCallback`) — it's a dependency of the effect.
 * @param observe    Optional element (usually the trigger) watched with a
 *                   ResizeObserver, for layout shifts that fire no window event.
 */
export function useFloatingReposition(
  active: boolean,
  reposition: () => void,
  observe?: HTMLElement | null,
) {
  useEffect(() => {
    if (!active) return;

    let frame = 0;
    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        reposition();
      });
    };

    window.addEventListener('resize', schedule);
    // Capture phase: catches scrolling in ANY ancestor container, not just the
    // window — a menu inside a scrollable panel has to follow its trigger too.
    window.addEventListener('scroll', schedule, true);

    let observer: ResizeObserver | undefined;
    if (observe && typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(schedule);
      observer.observe(observe);
    }

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('scroll', schedule, true);
      observer?.disconnect();
    };
  }, [active, reposition, observe]);
}
