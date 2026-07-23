import { useCallback, useEffect, useRef, useState } from 'react';

export type UseStickToBottomOptions = {
  /** How close to the bottom (px) still counts as "pinned". */
  threshold?: number;
};

/**
 * Keeps a scroll container pinned to the bottom as its content grows — the
 * chat-transcript behaviour: new messages follow to the newest, unless the
 * user has scrolled up to read history (then it stays put and exposes
 * `scrollToBottom` for a jump affordance).
 *
 * Pass the content dependency (e.g. the messages array or its length) so the
 * follow-to-bottom fires whenever the transcript changes:
 *
 * ```tsx
 * const { ref, isPinned, scrollToBottom } = useStickToBottom([messages.length]);
 * <div ref={ref} className="scroll">…</div>
 * {!isPinned && <button onClick={() => scrollToBottom()}>Latest</button>}
 * ```
 */
export const useStickToBottom = <T extends HTMLElement = HTMLDivElement>(
  deps: React.DependencyList = [],
  { threshold = 40 }: UseStickToBottomOptions = {},
) => {
  const ref = useRef<T | null>(null);
  // Ref mirror so the follow effect reads the live value without listing
  // `isPinned` as a dependency (which would fight the user's scroll).
  const pinnedRef = useRef(true);
  const [isPinned, setIsPinned] = useState(true);

  const setPinned = useCallback((v: boolean) => {
    pinnedRef.current = v;
    setIsPinned(v);
  }, []);

  const scrollToBottom = useCallback(
    (behavior: ScrollBehavior = 'smooth') => {
      const el = ref.current;
      if (!el) return;
      el.scrollTo({ top: el.scrollHeight, behavior });
      setPinned(true);
    },
    [setPinned],
  );

  // Follow new content to the bottom, but only while pinned. Defined before the
  // scroll listener so on mount it pins to the bottom *first* — otherwise the
  // listener's initial measurement (scrollTop 0) would wrongly mark it detached.
  useEffect(() => {
    if (!pinnedRef.current) return;
    const el = ref.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  // Track proximity to the bottom as the user scrolls.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
      setPinned(distance <= threshold);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener('scroll', onScroll);
  }, [threshold, setPinned]);

  return { ref, isPinned, scrollToBottom };
};
