import {
  forwardRef,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { TabsContext } from './Tabs.context';
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
      activationMode = 'automatic',
      className,
      children,
      ...rest
    },
    ref,
  ) => {
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
          className={`ui-tabs ui-tabs--${orientation}${className ? ' ' + className : ''}`}
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

    const composedRef = (node: HTMLDivElement | null) => {
      listRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref)
        (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
    };

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
