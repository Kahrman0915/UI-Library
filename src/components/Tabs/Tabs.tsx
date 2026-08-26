import {
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { TabsContext } from './Tabs.context';

// SSR-safe layout effect: useLayoutEffect on the client (no flash of an
// unpositioned indicator), useEffect on the server (avoids the React warning).
const useIsoLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;
import type {
  TabsContentProps,
  TabsListProps,
  TabsProps,
  TabsTriggerProps,
} from './Tabs.types';
import './Tabs.scss';

const useTabs = () => {
  const ctx = useContext(TabsContext);
  if (!ctx) {
    throw new Error('Tabs subcomponents must be used inside <Tabs>.');
  }
  return ctx;
};

const triggerId = (id: string, value: string) => `${id}-trigger-${value}`;
const contentId = (id: string, value: string) => `${id}-content-${value}`;

const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  (
    {
      id,
      value: valueProp,
      defaultValue,
      onValueChange,
      orientation = 'horizontal',
      variant = 'default',
      activationMode = 'automatic',
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    // `browser` is horizontal-only — a vertical browser tab strip isn't a
    // thing. Fall back to `line`, which reads correctly in both orientations,
    // rather than emit a class whose rules assume a horizontal list.
    const resolvedVariant =
      variant === 'browser' && orientation === 'vertical' ? 'line' : variant;
    const controlled = valueProp !== undefined;
    const [internalValue, setInternalValue] = useState<string | undefined>(
      defaultValue,
    );
    const value = controlled ? valueProp : internalValue;

    const setValue = useCallback(
      (next: string) => {
        if (!controlled) setInternalValue(next);
        onValueChange?.(next);
      },
      [controlled, onValueChange],
    );

    const ctxValue = useMemo(
      () => ({ id, value, setValue, orientation, activationMode }),
      [id, value, setValue, orientation, activationMode],
    );

    return (
      <TabsContext.Provider value={ctxValue}>
        <div
          {...rest}
          ref={ref}
          id={id}
          data-orientation={orientation}
          data-variant={resolvedVariant}
          // `default` deliberately emits NO modifier class — it is the base
          // styling, so `.ui-tabs--default` would be a class nothing selects,
          // which is the dead-BEM noise this repo scans for. Same call as
          // Mark's `motion="none"`. `data-variant` is always present and is the
          // hook to target the default case.
          className={`ui-tabs ui-tabs--${orientation}${resolvedVariant === 'default' ? '' : ` ui-tabs--${resolvedVariant}`}${className ? ' ' + className : ''}`}
        >
          {children}
        </div>
      </TabsContext.Provider>
    );
  },
);

Tabs.displayName = 'Tabs';

// ═════════════════════════════════════════════════════════════════════════════
// List — role="tablist", handles arrow-key + Home/End across its own triggers.
// ═════════════════════════════════════════════════════════════════════════════

const TabsList = forwardRef<HTMLDivElement, TabsListProps>(
  ({ children, className, onKeyDown, ...rest }, ref) => {
    const ctx = useTabs();
    const listRef = useRef<HTMLDivElement | null>(null);
    const indicatorRef = useRef<HTMLSpanElement | null>(null);
    const firstRef = useRef(true);

    const composedRef = (node: HTMLDivElement | null) => {
      listRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref)
        (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
    };

    // One shared indicator that SLIDES between triggers. It's positioned
    // imperatively from the active trigger's offset box (behind the triggers),
    // so switching tabs animates the pill across instead of cross-fading two.
    const positionIndicator = useCallback((animate: boolean) => {
      const list = listRef.current;
      const indicator = indicatorRef.current;
      if (!list || !indicator) return;
      const active = list.querySelector<HTMLElement>(
        '[role="tab"][data-state="active"]',
      );
      if (!active) {
        indicator.style.opacity = '0';
        return;
      }
      const apply = () => {
        indicator.style.opacity = '1';
        indicator.style.width = `${active.offsetWidth}px`;
        indicator.style.height = `${active.offsetHeight}px`;
        indicator.style.transform = `translate(${active.offsetLeft}px, ${active.offsetTop}px)`;
      };
      if (animate) {
        apply();
      } else {
        // First paint / resize: jump into place without sliding from 0.
        indicator.style.transition = 'none';
        apply();
        void indicator.offsetWidth; // force reflow so the next change transitions
        indicator.style.transition = '';
      }
    }, []);

    useIsoLayoutEffect(() => {
      positionIndicator(!firstRef.current);
      firstRef.current = false;
    }, [ctx.value, ctx.orientation, positionIndicator]);

    // Keep the indicator aligned when the list reflows (container resize, font
    // load). Re-measure without sliding — a reflow isn't a tab change.
    useEffect(() => {
      const list = listRef.current;
      if (!list || typeof ResizeObserver === 'undefined') return;
      const ro = new ResizeObserver(() => positionIndicator(false));
      ro.observe(list);
      return () => ro.disconnect();
    }, [positionIndicator]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(e);
      const items = Array.from(
        listRef.current?.querySelectorAll<HTMLButtonElement>(
          '[role="tab"]:not([disabled])',
        ) ?? [],
      );
      if (items.length === 0) return;
      const active = document.activeElement as HTMLElement | null;
      const current = active ? items.indexOf(active as HTMLButtonElement) : -1;

      const isVertical = ctx.orientation === 'vertical';
      const nextKey = isVertical ? 'ArrowDown' : 'ArrowRight';
      const prevKey = isVertical ? 'ArrowUp' : 'ArrowLeft';

      let nextIndex: number | null = null;
      if (e.key === nextKey) {
        nextIndex = current < 0 ? 0 : (current + 1) % items.length;
      } else if (e.key === prevKey) {
        nextIndex = current <= 0 ? items.length - 1 : current - 1;
      } else if (e.key === 'Home') {
        nextIndex = 0;
      } else if (e.key === 'End') {
        nextIndex = items.length - 1;
      }

      if (nextIndex !== null) {
        e.preventDefault();
        const target = items[nextIndex];
        target.focus();
        if (ctx.activationMode === 'automatic') {
          const value = target.getAttribute('data-value');
          if (value) ctx.setValue(value);
        }
      }
    };

    return (
      <div
        {...rest}
        ref={composedRef}
        role="tablist"
        aria-orientation={ctx.orientation}
        data-orientation={ctx.orientation}
        className={`ui-tabs__list${className ? ' ' + className : ''}`}
        onKeyDown={handleKeyDown}
      >
        <span
          ref={indicatorRef}
          className="ui-tabs__indicator"
          aria-hidden="true"
        />
        {children}
      </div>
    );
  },
);

TabsList.displayName = 'TabsList';

// ═════════════════════════════════════════════════════════════════════════════
// Trigger — role="tab", roving tabindex.
// ═════════════════════════════════════════════════════════════════════════════

const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(
  (
    { value, disabled = false, className, onClick, children, ...rest },
    ref,
  ) => {
    const ctx = useTabs();
    const active = ctx.value === value;

    return (
      <button
        {...rest}
        ref={ref}
        id={triggerId(ctx.id, value)}
        type="button"
        role="tab"
        data-value={value}
        data-state={active ? 'active' : 'inactive'}
        aria-selected={active}
        aria-controls={contentId(ctx.id, value)}
        tabIndex={active ? 0 : -1}
        disabled={disabled}
        className={`ui-tabs__trigger${className ? ' ' + className : ''}`}
        onClick={(e) => {
          onClick?.(e);
          if (!disabled) ctx.setValue(value);
        }}
      >
        {children}
      </button>
    );
  },
);

TabsTrigger.displayName = 'TabsTrigger';

// ═════════════════════════════════════════════════════════════════════════════
// Content — role="tabpanel". Unmounts unless forceMount.
// ═════════════════════════════════════════════════════════════════════════════

const TabsContent = forwardRef<HTMLDivElement, TabsContentProps>(
  ({ value, forceMount = false, className, children, ...rest }, ref) => {
    const ctx = useTabs();
    const active = ctx.value === value;
    if (!active && !forceMount) return null;
    return (
      <div
        {...rest}
        ref={ref}
        id={contentId(ctx.id, value)}
        role="tabpanel"
        data-state={active ? 'active' : 'inactive'}
        aria-labelledby={triggerId(ctx.id, value)}
        tabIndex={0}
        hidden={!active}
        className={`ui-tabs__content${className ? ' ' + className : ''}`}
      >
        {children}
      </div>
    );
  },
);

TabsContent.displayName = 'TabsContent';

export default Tabs;
export { TabsList, TabsTrigger, TabsContent };
