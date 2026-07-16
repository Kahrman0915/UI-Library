import { useEffect, useState } from 'react';

/**
 * Tracks whether the viewport is below `breakpoint` (default 768px).
 * SSR-safe: returns `false` until mounted, then reflects the real match and
 * updates on resize.
 */
export const useIsMobile = (breakpoint = 768): boolean => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const update = () => setIsMobile(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, [breakpoint]);

  return isMobile;
};
