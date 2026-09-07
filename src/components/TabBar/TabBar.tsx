import { forwardRef, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Plus, X } from 'lucide-react';
import Popover, { PopoverContent, PopoverTrigger } from '../Popover';
import Command, { CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from '../Command';
import { TabBarContext } from './TabBar.context';
import type {
  TabBarListProps,
  TabBarMenuProps,
  TabBarNewTabProps,
  TabBarProps,
  TabBarTabProps,
} from './TabBar.types';
import '../../styles/icon-button.scss';
import './TabBar.scss';

const useTabBar = () => {
  const ctx = useContext(TabBarContext);
  if (!ctx) {
    throw new Error('TabBar subcomponents must be used inside <TabBar>.');
  }
  return ctx;
};

const tabId = (id: string, value: string) => `${id}-tab-${value}`;

/**
 * The browser-style tab strip — one tab per OPEN DOCUMENT (a dashboard, an
 * application, a workspace), plus a new-tab button.
 *
 * Not to be confused with `Tabs`, which switches between sections of one page.
 * The tell is what a tab owns: a `Tabs` trigger reveals a `TabsContent` that
 * ships beside it, while a `TabBar` tab stands for something the consumer
 * opened and can close. That difference is also why activation is manual here
 * — see `TabBarActivationMode`.
 *
 * The bar closes nothing on its own: `onClose` reports the intent and the
 * consumer owns the list, exactly as `onValueChange` reports a switch.
 */
const TabBar = forwardRef<HTMLDivElement, TabBarProps>(
  (
    {
      id,
      value: valueProp,
      defaultValue,
      onValueChange,
      activationMode = 'manual',
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
      () => ({ id, value, setValue, activationMode }),
      [id, value, setValue, activationMode],
    );

    return (
      <TabBarContext.Provider value={ctxValue}>
        <div
          {...rest}
          ref={ref}
          id={id}
          className={`ui-tab-bar${className ? ' ' + className : ''}`}
        >
          {children}
        </div>
      </TabBarContext.Provider>
    );
  },
);

TabBar.displayName = 'TabBar';

// ═════════════════════════════════════════════════════════════════════════════
// List — role="tablist". Owns arrow-key movement across its own tabs.
// ═════════════════════════════════════════════════════════════════════════════

/**
 * The scrolling tablist. Separate from the root so `TabBarNewTab` can sit
 * OUTSIDE the tablist — a tablist's children should be tabs, and the new-tab
 * button is not one. It is the same split `Tabs` / `TabsList` already uses.
 *
 * Pass an `aria-label` ("Open dashboards"): a tablist with no accessible name
 * announces as an unlabelled group.
 */
const TabBarList = forwardRef<HTMLDivElement, TabBarListProps>(
  ({ className, children, onKeyDown, ...rest }, ref) => {
    const ctx = useTabBar();
    const listRef = useRef<HTMLDivElement | null>(null);

    const composedRef = (node: HTMLDivElement | null) => {
      listRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref)
        (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(e);
      // Only the tab itself steers. A key pressed while the close button holds
      // focus belongs to that button.
      if ((e.target as HTMLElement).getAttribute('role') !== 'tab') return;

      const items = Array.from(
        listRef.current?.querySelectorAll<HTMLElement>(
          '[role="tab"]:not([aria-disabled="true"])',
        ) ?? [],
      );
      if (items.length === 0) return;
      const current = items.indexOf(e.target as HTMLElement);

      let nextIndex: number | null = null;
      if (e.key === 'ArrowRight') {
        nextIndex = current < 0 ? 0 : (current + 1) % items.length;
      } else if (e.key === 'ArrowLeft') {
        nextIndex = current <= 0 ? items.length - 1 : current - 1;
      } else if (e.key === 'Home') {
        nextIndex = 0;
      } else if (e.key === 'End') {
        nextIndex = items.length - 1;
      }

      if (nextIndex === null) return;
      e.preventDefault();
      const target = items[nextIndex];
      target.focus();
      if (ctx.activationMode === 'automatic') {
        const value = target.getAttribute('data-value');
        if (value) ctx.setValue(value);
      }
    };

    return (
      <div
        {...rest}
        ref={composedRef}
        role="tablist"
        className={`ui-tab-bar__list${className ? ' ' + className : ''}`}
        onKeyDown={handleKeyDown}
      >
        {children}
      </div>
    );
  },
);

TabBarList.displayName = 'TabBarList';

// ═════════════════════════════════════════════════════════════════════════════
// Tab — role="tab" on a DIV, not a <button>, and that is load-bearing.
// ═════════════════════════════════════════════════════════════════════════════

/**
 * One open document.
 *
 * The element is a `div[role="tab"]` rather than a `<button>` because a
 * closable tab has to contain the close `<button>`, and a button inside a
 * button is invalid HTML that browsers silently un-nest. Keeping the tab a div
 * makes the nesting legal AND keeps the close control a real button, so it
 * gets its own accessible name and its own focus. The cost is that Enter and
 * Space have to be handled here rather than coming free — they are, below.
 */
const TabBarTab = forwardRef<HTMLDivElement, TabBarTabProps>(
  (
    {
      value,
      label,
      Icon,
      closable = true,
      onClose,
      closeLabel,
      disabled = false,
      className,
      onKeyDown,
      ...rest
    },
    ref,
  ) => {
    const ctx = useTabBar();
    const active = ctx.value === value;

    const select = () => {
      if (!disabled) ctx.setValue(value);
    };

    return (
      <div
        {...rest}
        ref={ref}
        id={tabId(ctx.id, value)}
        role="tab"
        data-value={value}
        data-state={active ? 'active' : 'inactive'}
        aria-selected={active}
        aria-disabled={disabled || undefined}
        tabIndex={active && !disabled ? 0 : -1}
        className={`ui-tab-bar__tab${className ? ' ' + className : ''}`}
        onClick={select}
        onKeyDown={(e) => {
          onKeyDown?.(e);
          // A key pressed on the nested close button is that button's.
          if (e.target !== e.currentTarget) return;
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            select();
          }
        }}
      >
        {Icon && (
          <span className="ui-tab-bar__tab-icon">
            <Icon aria-hidden="true" />
          </span>
        )}
        <span className="ui-tab-bar__tab-label">{label}</span>
        {closable && (
          <button
            type="button"
            aria-label={closeLabel ?? `Close ${label}`}
            disabled={disabled}
            className="ui-icon-button ui-icon-button--fill ui-tab-bar__close"
            onClick={(e) => {
              // Without this the click bubbles to the tab and closing a
              // background tab would also switch to it on the way out.
              e.stopPropagation();
              onClose?.(e);
            }}
          >
            <X aria-hidden="true" />
          </button>
        )}
      </div>
    );
  },
);

TabBarTab.displayName = 'TabBarTab';

// ═════════════════════════════════════════════════════════════════════════════
// NewTab — the trailing "+". Outside the tablist, deliberately.
// ═════════════════════════════════════════════════════════════════════════════

/** The trailing `+`. A plain button — it opens a tab, it is not one. */
const TabBarNewTab = forwardRef<HTMLButtonElement, TabBarNewTabProps>(
  ({ label = 'New tab', className, ...rest }, ref) => (
    <button
      aria-label={label}
      {...rest}
      ref={ref}
      type="button"
      className={`ui-icon-button ui-icon-button--fill ui-tab-bar__new${className ? ' ' + className : ''}`}
    >
      <Plus aria-hidden="true" />
    </button>
  ),
);

TabBarNewTab.displayName = 'TabBarNewTab';

// ═════════════════════════════════════════════════════════════════════════════
// Menu — tab search + recently closed, pinned to the far end of the bar.
// ═════════════════════════════════════════════════════════════════════════════

/**
 * The control every browser puts at the end of its tab strip: a chevron that
 * opens a search over the open tabs and the recently closed list. Built on
 * `Popover` + `Command`, so typing filters and the arrow keys move the
 * highlight without leaving the search field. Pinned to the far end with
 * `margin-inline-start: auto`, outside the tablist like the "+".
 */
const TabBarMenu = forwardRef<HTMLButtonElement, TabBarMenuProps>(
  (
    {
      tabs,
      recentlyClosed = [],
      onReopen,
      label = 'Search tabs',
      placeholder = 'Search tabs…',
      emptyText = 'No tabs match',
      openHeading = 'Open tabs',
      closedHeading = 'Recently closed',
      className,
      ...rest
    },
    ref,
  ) => {
    const ctx = useTabBar();
    const [open, setOpen] = useState(false);
    const menuId = `${ctx.id}-menu`;
    const inputRef = useRef<HTMLInputElement | null>(null);

    // PopoverContent focuses its own surface on open (right for a generic
    // popover); a search menu wants the field. Child effects run first, so this
    // rAF is queued after the popover's and lands last in the same frame.
    // Both a frame and a zero-delay timer: a background or occluded tab never
    // fires a frame, and whichever runs last wins the field either way.
    useEffect(() => {
      if (!open) return;
      const focus = () => inputRef.current?.focus();
      const raf = requestAnimationFrame(focus);
      const timer = setTimeout(focus, 0);
      return () => {
        cancelAnimationFrame(raf);
        clearTimeout(timer);
      };
    }, [open]);

    return (
      <Popover id={menuId} open={open} onOpenChange={setOpen}>
        <PopoverTrigger>
          <button
            aria-label={label}
            {...rest}
            ref={ref}
            type="button"
            className={`ui-icon-button ui-icon-button--fill ui-tab-bar__menu${className ? ' ' + className : ''}`}
          >
            <ChevronDown aria-hidden="true" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          side="bottom"
          align="end"
          className="ui-tab-bar__menu-surface"
          // Whenever the surface itself takes focus (the popover does this on
          // open), hand it to the search field. Deterministic, unlike the rAF.
          onFocus={(e) => {
            if (e.target === e.currentTarget) inputRef.current?.focus();
          }}
        >
          <Command id={`${menuId}-command`}>
            <CommandInput ref={inputRef} placeholder={placeholder} aria-label={placeholder} />
            <CommandList>
              <CommandEmpty>{emptyText}</CommandEmpty>
              <CommandGroup heading={openHeading}>
                {tabs.map((t) => (
                  <CommandItem
                    key={`open-${t.value}`}
                    value={t.label}
                    className="ui-tab-bar__menu-item"
                    onSelect={() => {
                      ctx.setValue(t.value);
                      setOpen(false);
                    }}
                  >
                    {t.Icon && <t.Icon aria-hidden="true" />}
                    <span className="ui-tab-bar__menu-label">{t.label}</span>
                    {ctx.value === t.value && <CommandShortcut>Current</CommandShortcut>}
                  </CommandItem>
                ))}
              </CommandGroup>
              {recentlyClosed.length > 0 && (
                <>
                  <CommandSeparator />
                  <CommandGroup heading={closedHeading}>
                    {recentlyClosed.map((t) => (
                      <CommandItem
                        key={`closed-${t.value}`}
                        value={t.label}
                        className="ui-tab-bar__menu-item"
                        onSelect={() => {
                          onReopen?.(t);
                          setOpen(false);
                        }}
                      >
                        {t.Icon && <t.Icon aria-hidden="true" />}
                        <span className="ui-tab-bar__menu-label">{t.label}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  },
);

TabBarMenu.displayName = 'TabBarMenu';

export default TabBar;
export { TabBarList, TabBarTab, TabBarNewTab, TabBarMenu };
