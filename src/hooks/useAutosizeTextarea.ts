import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';

// useLayoutEffect warns during SSR; fall back to useEffect on the server so the
// hook stays SSR-safe like the rest of the library.
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export type UseAutosizeTextareaOptions = {
  /** Cap the grown height at this many rows, then let the textarea scroll. */
  maxRows?: number;
  /** Floor the height at this many rows. */
  minRows?: number;
};

/**
 * Grows a `<textarea>` to fit its content up to `maxRows`, after which it
 * scrolls. Recomputes whenever `value` changes (and on mount), so it stays
 * correct for controlled inputs.
 *
 * Used by `ChatComposerInput`. Attach the returned ref to the textarea:
 *
 * ```tsx
 * const ref = useAutosizeTextarea(value, { maxRows: 8 });
 * <textarea ref={ref} value={value} onChange={...} rows={1} />
 * ```
 */
export const useAutosizeTextarea = (
  value: string,
  { maxRows = 8, minRows = 1 }: UseAutosizeTextareaOptions = {},
) => {
  const ref = useRef<HTMLTextAreaElement | null>(null);

  const resize = useCallback(() => {
    const el = ref.current;
    if (!el) return;

    const cs = window.getComputedStyle(el);
    // `line-height: normal` → NaN; fall back to ~1.4× the font size.
    const lineHeight =
      parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.4 || 20;
    const vPadding = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
    const vBorder =
      parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth);
    const chrome = vPadding + vBorder;

    const minHeight = lineHeight * minRows + chrome;
    const maxHeight = lineHeight * maxRows + chrome;

    // Reset to measure the true content height, then clamp.
    el.style.height = 'auto';
    const next = Math.max(minHeight, Math.min(el.scrollHeight, maxHeight));
    el.style.height = `${next}px`;
    el.style.overflowY = el.scrollHeight > maxHeight ? 'auto' : 'hidden';
  }, [maxRows, minRows]);

  useIsomorphicLayoutEffect(() => {
    resize();
  }, [value, resize]);

  return ref;
};
