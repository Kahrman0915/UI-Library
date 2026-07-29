import { useEffect, useState } from 'react';

/**
 * The current light/dark mode, reactively.
 *
 * Storybook's own docs blocks (`<Source>`) are themed by its emotion provider,
 * which knows nothing about our `data-mode` attribute — left alone, a Source
 * block renders near-black text over our dark page background and is
 * effectively invisible. This reads the attribute the preview decorator writes
 * to `<html>` and re-renders when it flips, so `<Source dark={...} />` can
 * follow the toolbar.
 *
 * A MutationObserver rather than Storybook's globals API on purpose: the
 * attribute is the single source of truth the whole library already reads, and
 * watching it keeps this working no matter what sets it.
 */
export function useDocsMode(): 'light' | 'dark' {
  const [mode, setMode] = useState<'light' | 'dark'>(() =>
    typeof document === 'undefined'
      ? 'light'
      : document.documentElement.getAttribute('data-mode') === 'dark'
        ? 'dark'
        : 'light',
  );

  useEffect(() => {
    const html = document.documentElement;
    const read = () =>
      setMode(html.getAttribute('data-mode') === 'dark' ? 'dark' : 'light');

    read();
    const observer = new MutationObserver(read);
    observer.observe(html, { attributes: true, attributeFilter: ['data-mode'] });
    return () => observer.disconnect();
  }, []);

  return mode;
}
