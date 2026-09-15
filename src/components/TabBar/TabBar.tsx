import { Children, forwardRef, isValidElement, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Plus, X } from 'lucide-react';
import Popover, { PopoverContent, PopoverTrigger } from '../Popover';
import Command, { CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from '../Command';
import ContextMenu, { ContextMenuContent, ContextMenuTrigger } from '../ContextMenu';
import { TabBarContext, TabBarGroupContext, TabBarSplitContext } from './TabBar.context';
import { TAB_BAR_DRAG_TYPE } from './TabBar.constants';
import type {
  TabBarGroupProps,
  TabBarListProps,
  TabBarSplitProps,
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

// Only tabs the keyboard can land on: disabled tabs and tabs hidden inside a
// collapsed group are skipped, because focus() on a display:none node does nothing.
const NAV_SELECTOR = '[role="tab"]:not([aria-disabled="true"]):not([hidden])';
// Real tabs only — a group chip is also role="tab" but stands for no document.
const DOC_TAB_SELECTOR = '[role="tab"][data-value]';

const carriesTab = (e: React.DragEvent) =>
  Array.from(e.dataTransfer.types).includes(TAB_BAR_DRAG_TYPE);

/** Before or after the hovered element, from the pointer's side of its midpoint. */
const dropSide = (e: React.DragEvent<HTMLElement>): 'before' | 'after' => {
  const rect = e.currentTarget.getBoundingClientRect();
  const rtl = getComputedStyle(e.currentTarget).direction === 'rtl';
  const firstHalf = e.clientX < rect.left + rect.width / 2;
  return firstHalf !== rtl ? 'before' : 'after';
};

/** The tab right after `el` in bar order, or null at the end. */
const nextTabValue = (el: HTMLElement): string | null => {
  const list = el.closest('[role="tablist"]');
  if (!list) return null;
  const tabs = Array.from(list.querySelectorAll<HTMLElement>(DOC_TAB_SELECTOR));
  const next = tabs[tabs.indexOf(el) + 1];
  return next?.getAttribute('data-value') ?? null;
};

/** Wraps a node in a right-click menu when there is one to show. */
const withMenu = (menuId: string, menu: React.ReactNode, node: React.ReactElement) =>
  menu ? (
    <ContextMenu id={menuId}>
      <ContextMenuTrigger>{node}</ContextMenuTrigger>
      <ContextMenuContent>{menu}</ContextMenuContent>
    </ContextMenu>
  ) : (
    node
  );

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
      onTabMove,
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
      () => ({ id, value, setValue, activationMode, onTabMove }),
      [id, value, setValue, activationMode, onTabMove],
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
  ({ className, children, onKeyDown, onDragOver, onDrop, ...rest }, ref) => {
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
          NAV_SELECTOR,
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
        // A drop on the bar's empty space, past the last tab: to the end, ungrouped.
        // Tabs and chips handle their own drops and stop them reaching here.
        onDragOver={(e) => {
          onDragOver?.(e);
          if (!ctx.onTabMove || !carriesTab(e)) return;
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
        }}
        onDrop={(e) => {
          onDrop?.(e);
          if (!ctx.onTabMove || !carriesTab(e)) return;
          e.preventDefault();
          const dragged = e.dataTransfer.getData(TAB_BAR_DRAG_TYPE);
          if (dragged) ctx.onTabMove({ value: dragged, before: null, group: null });
        }}
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
      menu,
      className,
      onKeyDown,
      ...rest
    },
    ref,
  ) => {
    const ctx = useTabBar();
    const group = useContext(TabBarGroupContext);
    const split = useContext(TabBarSplitContext);
    const active = ctx.value === value;
    const draggable = Boolean(ctx.onTabMove) && !disabled;
    const [dragging, setDragging] = useState(false);
    const [drop, setDrop] = useState<'before' | 'after' | null>(null);

    const select = () => {
      if (!disabled) ctx.setValue(value);
    };

    const tab = (
      <div
        {...rest}
        ref={ref}
        id={tabId(ctx.id, value)}
        role="tab"
        data-value={value}
        data-state={active ? 'active' : 'inactive'}
        data-grouped={group ? '' : undefined}
        data-split={split ? (split.active ? 'active' : 'inactive') : undefined}
        data-dragging={dragging ? '' : undefined}
        data-drop={drop ?? undefined}
        aria-selected={active}
        aria-disabled={disabled || undefined}
        // A collapsed group hides its tabs, but never one whose document is on screen —
        // the open tab, or either half of a split that is showing.
        hidden={group?.collapsed && !active && !split?.active ? true : undefined}
        tabIndex={active && !disabled ? 0 : -1}
        draggable={draggable || undefined}
        className={`ui-tab-bar__tab${className ? ' ' + className : ''}`}
        onClick={select}
        onDragStart={(e) => {
          if (!draggable) return;
          e.dataTransfer.setData(TAB_BAR_DRAG_TYPE, value);
          e.dataTransfer.setData('text/plain', label);
          e.dataTransfer.effectAllowed = 'move';
          setDragging(true);
        }}
        onDragEnd={() => setDragging(false)}
        onDragOver={(e) => {
          if (!ctx.onTabMove || !carriesTab(e)) return;
          e.preventDefault();
          e.stopPropagation();
          e.dataTransfer.dropEffect = 'move';
          setDrop(dropSide(e));
        }}
        onDragLeave={(e) => {
          // dragleave also fires when the pointer crosses onto a child.
          if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
          setDrop(null);
        }}
        onDrop={(e) => {
          if (!ctx.onTabMove || !carriesTab(e)) return;
          e.preventDefault();
          e.stopPropagation();
          setDrop(null);
          const dragged = e.dataTransfer.getData(TAB_BAR_DRAG_TYPE);
          if (!dragged || dragged === value) return;
          const side = dropSide(e);
          ctx.onTabMove({
            value: dragged,
            before: side === 'before' ? value : nextTabValue(e.currentTarget),
            group: group?.value ?? null,
          });
        }}
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

    return withMenu(`${tabId(ctx.id, value)}-menu`, menu, tab);
  },
);

TabBarTab.displayName = 'TabBarTab';

// ═════════════════════════════════════════════════════════════════════════════
// Group — a coloured chip and the tabs it holds.
// ═════════════════════════════════════════════════════════════════════════════

/** Counts document tabs among a group's children, a split counting as two. */
const countTabs = (children: React.ReactNode): number =>
  Children.toArray(children).reduce<number>((n, child) => {
    if (isValidElement<{ children?: React.ReactNode }>(child) && child.type === TabBarSplit) {
      return n + Children.count(child.props.children);
    }
    return n + 1;
  }, 0);

/**
 * A tab group, the way Chrome and Figma draw one: a coloured chip in front of its
 * tabs, and a line in the same colour along the top of each. The wrapper is
 * `role="none"` so the tablist still owns the tabs directly.
 */
const TabBarGroup = forwardRef<HTMLDivElement, TabBarGroupProps>(
  (
    {
      value,
      label,
      color = 'blue',
      collapsed: collapsedProp,
      defaultCollapsed = false,
      onCollapsedChange,
      menu,
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    const ctx = useTabBar();
    const controlled = collapsedProp !== undefined;
    const [internal, setInternal] = useState(defaultCollapsed);
    const collapsed = controlled ? collapsedProp : internal;
    const [drop, setDrop] = useState(false);
    const count = countTabs(children);

    const toggle = () => {
      if (!controlled) setInternal(!collapsed);
      onCollapsedChange?.(!collapsed);
    };

    const groupCtx = useMemo(() => ({ value, collapsed }), [value, collapsed]);
    const chipId = `${ctx.id}-group-${value}`;

    const chip = (
      <div
        id={chipId}
        role="tab"
        aria-selected={false}
        aria-expanded={!collapsed}
        aria-label={`${label} group, ${count} ${count === 1 ? 'tab' : 'tabs'}`}
        tabIndex={-1}
        data-drop={drop ? '' : undefined}
        className="ui-tab-bar__group-chip"
        onClick={toggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggle();
          }
        }}
        onDragOver={(e) => {
          if (!ctx.onTabMove || !carriesTab(e)) return;
          e.preventDefault();
          e.stopPropagation();
          e.dataTransfer.dropEffect = 'move';
          setDrop(true);
        }}
        onDragLeave={(e) => {
          if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
          setDrop(false);
        }}
        onDrop={(e) => {
          if (!ctx.onTabMove || !carriesTab(e)) return;
          e.preventDefault();
          e.stopPropagation();
          setDrop(false);
          const dragged = e.dataTransfer.getData(TAB_BAR_DRAG_TYPE);
          if (!dragged) return;
          // Onto the chip: first in the group.
          const first = e.currentTarget.parentElement
            ?.closest('.ui-tab-bar__group')
            ?.querySelector<HTMLElement>(DOC_TAB_SELECTOR);
          const firstValue = first?.getAttribute('data-value') ?? null;
          ctx.onTabMove({
            value: dragged,
            before: firstValue === dragged ? nextTabValue(first!) : firstValue,
            group: value,
          });
        }}
      >
        <span className="ui-tab-bar__group-label">
          {label}
          {collapsed && <span className="ui-tab-bar__group-count" aria-hidden="true">{count}</span>}
        </span>
      </div>
    );

    return (
      <TabBarGroupContext.Provider value={groupCtx}>
        <div
          {...rest}
          ref={ref}
          role="none"
          data-group={value}
          data-collapsed={collapsed ? '' : undefined}
          className={`ui-tab-bar__group ui-tab-bar__group--${color}${className ? ' ' + className : ''}`}
        >
          {withMenu(`${chipId}-menu`, menu, chip)}
          {children}
        </div>
      </TabBarGroupContext.Provider>
    );
  },
);

TabBarGroup.displayName = 'TabBarGroup';

// ═════════════════════════════════════════════════════════════════════════════
// Split — two tabs drawn as one joined tab.
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Two tabs open side by side in the page. The halves stay real tabs, so each is
 * reachable with the arrow keys and each still closes on its own; the wrapper is
 * `role="none"` and only draws the join.
 */
const TabBarSplit = forwardRef<HTMLDivElement, TabBarSplitProps>(
  ({ className, children, ...rest }, ref) => {
    const ctx = useTabBar();
    const values = Children.toArray(children).flatMap((child) =>
      isValidElement<{ value?: string }>(child) && child.props.value ? [child.props.value] : [],
    );
    const active = ctx.value !== undefined && values.includes(ctx.value);
    const splitCtx = useMemo(() => ({ active }), [active]);

    return (
      <TabBarSplitContext.Provider value={splitCtx}>
        <div
          {...rest}
          ref={ref}
          role="none"
          data-state={active ? 'active' : 'inactive'}
          className={`ui-tab-bar__split${className ? ' ' + className : ''}`}
        >
          {children}
        </div>
      </TabBarSplitContext.Provider>
    );
  },
);

TabBarSplit.displayName = 'TabBarSplit';

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
export { TabBarList, TabBarTab, TabBarGroup, TabBarSplit, TabBarNewTab, TabBarMenu };
