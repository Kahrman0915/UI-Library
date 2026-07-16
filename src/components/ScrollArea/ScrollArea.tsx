import {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import type { ScrollAreaProps } from './ScrollArea.types';
import './ScrollArea.scss';

type ThumbState = {
  visible: boolean;
  offset: number;
  size: number;
};

const THUMB_MIN_SIZE = 20;

const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(
  (
    {
      id,
      children,
      orientation = 'vertical',
      type = 'auto',
      className,
      ...rest
    },
    ref,
  ) => {
    const viewportRef = useRef<HTMLDivElement | null>(null);
    const [vertical, setVertical] = useState<ThumbState>({
      visible: false,
      offset: 0,
      size: 0,
    });
    const [horizontal, setHorizontal] = useState<ThumbState>({
      visible: false,
      offset: 0,
      size: 0,
    });

    const showVertical = orientation === 'vertical' || orientation === 'both';
    const showHorizontal = orientation === 'horizontal' || orientation === 'both';

    const updateThumbs = useCallback(() => {
      const vp = viewportRef.current;
      if (!vp) return;

      const nextEqual = (a: ThumbState, b: ThumbState) =>
        a.visible === b.visible && a.offset === b.offset && a.size === b.size;

      if (showVertical) {
        const scrollable = vp.scrollHeight - vp.clientHeight;
        const next: ThumbState =
          scrollable <= 0
            ? { visible: false, offset: 0, size: 0 }
            : (() => {
                const trackSize = vp.clientHeight;
                const rawThumb = (vp.clientHeight / vp.scrollHeight) * trackSize;
                const thumbSize = Math.max(THUMB_MIN_SIZE, rawThumb);
                const offset =
                  (vp.scrollTop / scrollable) * (trackSize - thumbSize);
                return { visible: true, offset, size: thumbSize };
              })();
        setVertical((prev) => (nextEqual(prev, next) ? prev : next));
      }

      if (showHorizontal) {
        const scrollable = vp.scrollWidth - vp.clientWidth;
        const next: ThumbState =
          scrollable <= 0
            ? { visible: false, offset: 0, size: 0 }
            : (() => {
                const trackSize = vp.clientWidth;
                const rawThumb = (vp.clientWidth / vp.scrollWidth) * trackSize;
                const thumbSize = Math.max(THUMB_MIN_SIZE, rawThumb);
                const offset =
                  (vp.scrollLeft / scrollable) * (trackSize - thumbSize);
                return { visible: true, offset, size: thumbSize };
              })();
        setHorizontal((prev) => (nextEqual(prev, next) ? prev : next));
      }
    }, [showVertical, showHorizontal]);

    useLayoutEffect(() => {
      updateThumbs();
    }, [updateThumbs, children]);

    useEffect(() => {
      const vp = viewportRef.current;
      if (!vp) return;

      vp.addEventListener('scroll', updateThumbs, { passive: true });
      const ro = new ResizeObserver(updateThumbs);
      ro.observe(vp);
      Array.from(vp.children).forEach((child) => ro.observe(child));

      return () => {
        vp.removeEventListener('scroll', updateThumbs);
        ro.disconnect();
      };
    }, [updateThumbs]);

    const startDrag = useCallback(
      (
        e: React.PointerEvent,
        axis: 'y' | 'x',
      ) => {
        e.preventDefault();
        const vp = viewportRef.current;
        if (!vp) return;

        const startClient = axis === 'y' ? e.clientY : e.clientX;
        const startScroll = axis === 'y' ? vp.scrollTop : vp.scrollLeft;
        const scrollable =
          axis === 'y'
            ? vp.scrollHeight - vp.clientHeight
            : vp.scrollWidth - vp.clientWidth;
        const trackSize = axis === 'y' ? vp.clientHeight : vp.clientWidth;
        const thumbSize = axis === 'y' ? vertical.size : horizontal.size;
        const trackScrollable = Math.max(1, trackSize - thumbSize);

        const onMove = (moveEvent: PointerEvent) => {
          const delta =
            (axis === 'y' ? moveEvent.clientY : moveEvent.clientX) -
            startClient;
          const scrollDelta = (delta / trackScrollable) * scrollable;
          if (axis === 'y') vp.scrollTop = startScroll + scrollDelta;
          else vp.scrollLeft = startScroll + scrollDelta;
        };

        const onUp = () => {
          document.removeEventListener('pointermove', onMove);
          document.removeEventListener('pointerup', onUp);
        };

        document.addEventListener('pointermove', onMove);
        document.addEventListener('pointerup', onUp);
      },
      [vertical.size, horizontal.size],
    );

    return (
      <div
        {...rest}
        ref={ref}
        id={id}
        className={`ui-scroll-area ui-scroll-area--${orientation} ui-scroll-area--type-${type}${className ? ' ' + className : ''}`}
      >
        <div className="ui-scroll-area__inner">
          <div ref={viewportRef} className="ui-scroll-area__viewport">
            {children}
          </div>
          {showVertical && vertical.visible && (
            <div
              className="ui-scroll-area__scrollbar ui-scroll-area__scrollbar--vertical"
              aria-hidden="true"
            >
              <div
                className="ui-scroll-area__thumb"
                style={{
                  transform: `translateY(${vertical.offset}px)`,
                  height: vertical.size,
                }}
                onPointerDown={(e) => startDrag(e, 'y')}
              />
            </div>
          )}
          {showHorizontal && horizontal.visible && (
            <div
              className="ui-scroll-area__scrollbar ui-scroll-area__scrollbar--horizontal"
              aria-hidden="true"
            >
              <div
                className="ui-scroll-area__thumb"
                style={{
                  transform: `translateX(${horizontal.offset}px)`,
                  width: horizontal.size,
                }}
                onPointerDown={(e) => startDrag(e, 'x')}
              />
            </div>
          )}
        </div>
      </div>
    );
  },
);

ScrollArea.displayName = 'ScrollArea';

export default ScrollArea;
