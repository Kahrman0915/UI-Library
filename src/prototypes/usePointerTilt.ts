import { useEffect, useRef } from 'react';

/**
 * The tvOS parallax, as three CSS custom properties.
 *
 * Writes `--mx` and `--my` (both −1 to 1, origin at the element's centre) and
 * `--on` (0 at rest, 1 while a pointer is tracking). Everything visual lives in
 * CSS as a calc off those three — see the POINTER TILT block in
 * `deeperThemingRecipe.ts`. This file decides nothing about how far anything
 * moves; it only reports where the pointer is.
 *
 * Three things that matter more than they look:
 *
 * MEASURE ON ENTER, NOT ON EVERY MOVE. `getBoundingClientRect()` forces layout,
 * and calling it per pointermove means a forced reflow on every frame of the
 * interaction. The rect is cached on pointerenter and dropped on leave.
 *
 * WRITE IN A rAF, AND ONLY THE LATEST. Pointer events fire faster than frames
 * on a high-rate trackpad, so unbatched writes do work that is thrown away. One
 * pending frame, always carrying the newest position.
 *
 * NO STATE, NO RE-RENDER. React never sees the pointer. Routing this through
 * `useState` would re-render the whole subtree at pointer rate, which for a grid
 * of marks is the difference between smooth and not.
 *
 * Honours `prefers-reduced-motion` by never attaching, so the CSS falls back to
 * its rest values with nothing to undo.
 */
export function usePointerTilt<T extends HTMLElement>(enabled = true) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let rect: DOMRect | null = null;
    let frame = 0;
    let next: [number, number, number] | null = null;

    const flush = () => {
      frame = 0;
      if (!next) return;
      const [mx, my, on] = next;
      el.style.setProperty('--mx', mx.toFixed(4));
      el.style.setProperty('--my', my.toFixed(4));
      el.style.setProperty('--on', String(on));
    };
    const schedule = (mx: number, my: number, on: number) => {
      next = [mx, my, on];
      if (!frame) frame = requestAnimationFrame(flush);
    };
    const clamp = (n: number) => (n < -1 ? -1 : n > 1 ? 1 : n);

    const enter = (e: PointerEvent) => {
      rect = el.getBoundingClientRect();
      move(e);
    };
    const move = (e: PointerEvent) => {
      if (!rect) rect = el.getBoundingClientRect();
      schedule(
        clamp(((e.clientX - rect.left) / rect.width) * 2 - 1),
        clamp(((e.clientY - rect.top) / rect.height) * 2 - 1),
        1,
      );
    };
    const leave = () => {
      rect = null;
      schedule(0, 0, 0);
    };

    el.addEventListener('pointerenter', enter);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    el.addEventListener('pointercancel', leave);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      el.removeEventListener('pointerenter', enter);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
      el.removeEventListener('pointercancel', leave);
      el.style.removeProperty('--mx');
      el.style.removeProperty('--my');
      el.style.removeProperty('--on');
    };
  }, [enabled]);

  return ref;
}
