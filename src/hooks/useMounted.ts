import { useEffect, useState } from 'react';

/**
 * Returns `true` after the component has mounted on the client.
 *
 * Used by portal-rendering components (Dialog, Tooltip, DropdownMenu, and any
 * future Popover / Sheet / Toast) to gate `createPortal` calls that would
 * otherwise reference `document` during SSR / first render.
 */
export const useMounted = (): boolean => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
};
