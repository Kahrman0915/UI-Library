import { useEffect, useState, type RefObject } from 'react';

/**
 * Reports an element's content-box width, or `null` until first measured.
 *
 * Charts render at a declared width first and upgrade to the measured one after
 * mount. That order is deliberate and load-bearing: it is what lets a chart
 * exist as complete static markup with no JavaScript, which the `preview/*.html`
 * cards depend on. The alternative — a fixed `viewBox` with
 * `preserveAspectRatio` and `width: 100%` — scales EVERYTHING, so a 1px gridline
 * becomes 1.7px on a wide container, axis labels shrink or bloat, and the 2px
 * gap between stacked fills stops being 2px. Mark specs are stated in device
 * pixels; uniform scaling breaks all of them at once.
 *
 * Returns null (not a default) so the caller can distinguish "not measured yet"
 * from "measured as zero" and keep serving its declared width in the meantime.
 */
export function useMeasuredWidth(ref: RefObject<HTMLElement | null>): number | null {
  const [width, setWidth] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Guard the constructor, not just the call — jsdom and older Safari lack it,
    // and the same check guards Tabs.tsx and ScrollArea.tsx.
    if (typeof ResizeObserver === 'undefined') {
      setWidth(el.getBoundingClientRect().width);
      return;
    }

    let frame = 0;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      // Batch into one frame. Writing synchronously inside the callback is what
      // produces "ResizeObserver loop completed with undelivered notifications"
      // when a chart's own re-render changes its container.
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const next = entry.contentRect.width;
        setWidth((prev) => (prev !== null && Math.abs(prev - next) < 1 ? prev : next));
      });
    });

    observer.observe(el);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [ref]);

  return width;
}
