import { useEffect, useRef, useState } from 'react';

export type UseStreamingTextOptions = {
  /** Characters revealed per tick. */
  charsPerTick?: number;
  /** Milliseconds between ticks. */
  intervalMs?: number;
  /** When false, the full target shows immediately (no reveal). */
  enabled?: boolean;
};

/**
 * Reveals `target` progressively — the "typing out" effect that pairs with
 * `ChatBubble`'s `streaming` caret. Presentational and dependency-free: the
 * consumer still owns the content and transport.
 *
 * Works for both the demo case (pass the full string, watch it type out) and
 * real streaming (append tokens to `target` as they arrive — the reveal simply
 * catches up to the growing target). If `target` is replaced by something that
 * isn't a forward-extension of what's shown, the reveal restarts.
 *
 * ```tsx
 * const { text, isStreaming } = useStreamingText(full);
 * <ChatBubble streaming={isStreaming}>{text}</ChatBubble>
 * ```
 */
export const useStreamingText = (
  target: string,
  { charsPerTick = 2, intervalMs = 20, enabled = true }: UseStreamingTextOptions = {},
) => {
  const [count, setCount] = useState(enabled ? 0 : target.length);
  const countRef = useRef(count);
  countRef.current = count;
  const targetRef = useRef(target);

  // On target change: extend (keep count) or restart (reset to 0).
  useEffect(() => {
    const shown = targetRef.current.slice(0, countRef.current);
    targetRef.current = target;
    if (!enabled) {
      setCount(target.length);
    } else if (!target.startsWith(shown)) {
      setCount(0);
    }
  }, [target, enabled]);

  // One continuous ticker that reads the live target via ref, so it isn't
  // torn down and recreated on every revealed character.
  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => {
      setCount((c) => {
        const len = targetRef.current.length;
        return c >= len ? c : Math.min(c + charsPerTick, len);
      });
    }, intervalMs);
    return () => clearInterval(id);
  }, [enabled, charsPerTick, intervalMs]);

  const text = target.slice(0, count);
  return {
    text,
    isStreaming: enabled && count < target.length,
    isDone: count >= target.length,
  };
};
