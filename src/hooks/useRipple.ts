import { useCallback } from 'react';
import './ripple.scss';

export type UseRippleResult = {
  /** Spread onto the host element (which also needs the `ui-ripple` class). */
  onPointerDown: (event: React.PointerEvent<HTMLElement>) => void;
};

/**
 * Opt-in Material-style ripple for any interactive element.
 *
 * ```tsx
 * const { onPointerDown } = useRipple();
 * <button className="ui-ripple" onPointerDown={onPointerDown}>Tap</button>
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
      // Fallback ≥ the animation's own duration (--duration-slow ≈ 300ms).
      window.setTimeout(cleanup, 600);

      host.appendChild(wave);
    },
    [disabled],
  );

  return { onPointerDown };
};

export default useRipple;
