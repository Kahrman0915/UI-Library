import { useCallback } from 'react';
import './ripple.scss';

export type UseRippleResult = {
  /** Spread onto the host element (which also needs the `ui-ripple` class). */
  onPointerDown: (event: React.PointerEvent<HTMLElement>) => void;
};

/**
 * Opt-in Material-style ripple for any interactive element.
 *
 * This is a deliberately un-defaulted primitive — no component turns it on for
 * you (Button intentionally does NOT ship a `ripple` prop). Reach for it only
 * where the ripple is actually seen and actually helps.
 *
 * **When to use it**
 * - Touch-first surfaces. On a touchscreen there's no cursor or hover state, so
 *   the ripple is the tap's acknowledgement. This is its real job.
 * - Actions that stay on the same screen: a toggle, add-to-cart, like/bookmark,
 *   a quantity stepper, expand/collapse — the button remains mounted long enough
 *   to see the ~600ms wave.
 * - A button that kicks off a brief async op and stays put; the ripple fills the
 *   moment before the response.
 *
 * **When NOT to use it**
 * - Navigation that unmounts the screen — the user never sees the wave (or sees
 *   a half-played one as the view tears down).
 * - Desktop/mouse-only UIs — hover and `:active` already give feedback, so the
 *   ripple is mostly decorative there.
 * - Dialog confirm/cancel and anything that closes on click.
 * - When you want the UI to feel instant; the ripple subtly implies "working".
 *
 * The effect is a Material/Android signature; much of modern web and iOS design
 * omits it. Treat it as an occasional accent, not a house style.
 *
 * **How to use it** — spread `onPointerDown` on a `.ui-ripple` element (the class
 * provides `position: relative; overflow: hidden` to clip the wave):
 *
 * ```tsx
 * const { onPointerDown } = useRipple();
 * <button className="ui-button ui-ripple" onPointerDown={onPointerDown}>
 *   Add to cart
 * </button>
 * ```
 *
 * On pointer-down it appends a `.ui-ripple__wave` span at the press point and
 * removes it when the CSS animation ends. A duration-based `setTimeout` backs
 * up `animationend` — that event doesn't fire on a backgrounded tab or when the
 * animation is interrupted, and without the fallback the wave nodes would leak.
 * Under `prefers-reduced-motion` the global rule makes the wave near-instant but
 * still cleaned up.
 *
 * Pass `disabled` to make it a no-op (e.g. a disabled control).
 */
export const useRipple = (disabled = false): UseRippleResult => {
  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (disabled) return;
      const host = event.currentTarget;
      const rect = host.getBoundingClientRect();
      // A diameter that comfortably covers the host from the press point;
      // overflow:hidden on `.ui-ripple` clips the excess.
      const size = Math.max(rect.width, rect.height) * 2;
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const wave = document.createElement('span');
      wave.className = 'ui-ripple__wave';
      wave.style.width = `${size}px`;
      wave.style.height = `${size}px`;
      wave.style.left = `${x - size / 2}px`;
      wave.style.top = `${y - size / 2}px`;

      let removed = false;
      const cleanup = () => {
        if (removed) return;
        removed = true;
        wave.remove();
      };
      wave.addEventListener('animationend', cleanup, { once: true });
      // Fallback comfortably past the animation's own duration (--duration-ripple
      // = 600ms) so `animationend` normally wins; this only fires when that event
      // doesn't (reduced motion / backgrounded tab / interrupted).
      window.setTimeout(cleanup, 900);

      host.appendChild(wave);
    },
    [disabled],
  );

  return { onPointerDown };
};

export default useRipple;
