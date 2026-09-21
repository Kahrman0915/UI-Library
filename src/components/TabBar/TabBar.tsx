import { Children, forwardRef, isValidElement, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronLeft, GalleryVerticalEnd, Layers, LayoutGrid, Plus, Settings2, SquarePlus, X } from 'lucide-react';
import Popover, { PopoverContent, PopoverTrigger } from '../Popover';
import Command, { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '../Command';
import Swatch from '../Swatch';
import Button from '../Button';
import ContextMenu, { ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '../ContextMenu';
import Checkbox from '../Checkbox';
import Chip from '../Chip';
import Input from '../Input';
import ScrollArea from '../ScrollArea';
import type { CategoryColor } from '../../types/GlobalTypes';
import Tooltip, { TooltipContent, TooltipTrigger } from '../Tooltip';
import { TabBarContext, TabBarGroupContext, TabBarSplitContext } from './TabBar.context';
import { TAB_BAR_DRAG_TYPE } from './TabBar.constants';
import type {
  TabBarGroupProps,
  TabBarListProps,
  TabBarSplitProps,
  TabBarMenuGroup,
  TabBarNewGroup,
  TabBarNewGroupItemProps,
  TabBarNewTabItem,
  TabBarNewTabMenuProps,
  TabBarMenuItem,
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

    const groupForm = useRef<((tabs?: string[]) => void) | null>(null);
    const ctxValue = useMemo(
      () => ({ id, value, setValue, activationMode, onTabMove, groupForm }),
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
      iconOnly = false,
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

    const showClose = closable && !iconOnly;

    const tab = (
      <div
        // The label is the only name an icon-only tab has. Before the spread, so a
        // consumer's own aria-label still wins.
        aria-label={iconOnly ? label : undefined}
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
        className={`ui-tab-bar__tab${iconOnly ? ' ui-tab-bar__tab--icon-only' : ''}${className ? ' ' + className : ''}`}
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
        {!iconOnly && <span className="ui-tab-bar__tab-label">{label}</span>}
        {showClose && (
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

    // An icon-only tab shows its name on hover and focus, like a pinned browser tab.
    const named = iconOnly ? (
      <Tooltip id={`${tabId(ctx.id, value)}-tooltip`} side="bottom">
        <TooltipTrigger>{tab}</TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    ) : (
      tab
    );

    return withMenu(`${tabId(ctx.id, value)}-menu`, menu, named);
  },
);

TabBarTab.displayName = 'TabBarTab';

// ═════════════════════════════════════════════════════════════════════════════
// Group — a colored chip and the tabs it holds.
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
 * A tab group, the way Chrome and Figma draw one: a colored chip in front of its
 * tabs, and a line in the same color along the top of each. The wrapper is
 * `role="none"` so the tablist still owns the tabs directly.
 */
/**
 * @deprecated 2026-09-21 — the old in-bar tab group. The bar now shows one set of
 * tabs at a time and `TabBarMenu` switches between groups. Kept so existing code
 * builds; do not use it in new work.
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
 * The control every browser puts at the end of its tab strip: a button that
 * opens a search over the open tabs and the recently closed list. With `groups`
 * it is also the tab-group switcher (Notion's model, 2026-09-19): a group is a
 * named set of tabs, the bar shows one set at a time, and `groupLabel` names the
 * set on screen beside the glyph. Its glyph is a
 * stack of pages (`GalleryVerticalEnd`) — "your tabs" — rather than a chevron,
 * which reads as "more of this", or an app window, which is the rail's job. Built on
 * `Popover` + `Command`, so typing filters and the arrow keys move the
 * highlight without leaving the search field. Pinned to the far end with
 * `margin-inline-start: auto`, outside the tablist like the "+".
 */
const RECENT_LIMIT = 5;

/**
 * Whether a scrolling list has more below the fold — the menus fade their foot
 * while it does, so a section under the fold does not read as absent.
 */
function useMoreBelow(listRef: { current: HTMLElement | null }, active: boolean, deps: unknown[]) {
  const [more, setMore] = useState(false);
  useEffect(() => {
    const el = listRef.current;
    if (!active || !el) return setMore(false);
    const check = () => setMore(el.scrollHeight - el.scrollTop - el.clientHeight > 1);
    check();
    el.addEventListener('scroll', check, { passive: true });
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', check);
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, listRef, ...deps]);
  return more;
}

/** The group colors offered by default — eight category hues that read apart. */
const GROUP_COLORS: CategoryColor[] = ['blue', 'violet', 'emerald', 'amber', 'rose', 'cyan', 'orange', 'indigo'];

/** A row's trailing meta — a count or the group a tab lives in. Muted text, not a keycap. */
const MenuMeta = ({ children }: { children: React.ReactNode }) => <span className="ui-tab-bar__menu-meta">{children}</span>;

/** The current set or tab: a check plus the word for screen readers. */
const MenuCurrent = () => (
  <span className="ui-tab-bar__menu-current">
    <Check aria-hidden="true" />
    <span className="ui-tab-bar__sr-only">current</span>
  </span>
);

const tabsWord = (n: number) => `${n} ${n === 1 ? 'tab' : 'tabs'}`;

const TabBarMenu = forwardRef<HTMLButtonElement, TabBarMenuProps>(
  (
    {
      tabs,
      recentlyClosed = [],
      onReopen,
      label = 'Search tabs',
      switcherLabel = 'switch tab group or search tabs',
      placeholder = 'Search tabs…',
      emptyText = 'No tabs match',
      openHeading = 'Open tabs',
      closedHeading = 'Recently closed',
      groupLabel,
      groups,
      activeGroup = null,
      onSelectGroup,
      ungroupedCount,
      ungroupedTabs,
      onOpenTab,
      onNewGroup,
      onGroupTabs,
      onCreateGroup,
      groupColors = GROUP_COLORS,
      onRecolorGroup,
      onRenameGroup,
      onUngroup,
      onDeleteGroup,
      windowLabel = 'Ungrouped tabs',
      windowHeading: _windowHeading,
      groupsHeading = 'Tab groups',
      className,
      ...rest
    },
    ref,
  ) => {
    const ctx = useTabBar();
    const [open, setOpen] = useState(false);
    const [view, setView] = useState<'main' | 'manage' | 'create'>('main');
    // Tabs checked when the form opens: the tab you are on from the menu, the
    // right-clicked tab from `TabBarNewGroupItem`.
    const [preset, setPreset] = useState<string[]>([]);
    const [search, setSearch] = useState('');
    const menuId = `${ctx.id}-menu`;
    const inputRef = useRef<HTMLInputElement | null>(null);
    const listRef = useRef<HTMLDivElement | null>(null);

    const hasGroups = !!groups;
    const current = activeGroup === null ? windowLabel : (groupLabel ?? groups?.find((g) => g.value === activeGroup)?.label ?? windowLabel);
    const windowCount = ungroupedTabs?.length ?? ungroupedCount;
    const canManage = !!groups?.length && !!(onRenameGroup || onRecolorGroup || onUngroup || onDeleteGroup);

    // Open the form from outside (a tab's right-click menu). Registered only
    // while the menu can create groups, so the item does nothing elsewhere.
    const openForm = useCallback(
      (tabValues?: string[]) => {
        setPreset(tabValues ?? (ctx.value ? [ctx.value] : []));
        setView('create');
        setOpen(true);
      },
      [ctx.value],
    );
    useEffect(() => {
      if (!onCreateGroup) return;
      ctx.groupForm.current = openForm;
      return () => {
        if (ctx.groupForm.current === openForm) ctx.groupForm.current = null;
      };
    }, [ctx.groupForm, openForm, onCreateGroup]);

    // The next color not already taken, so a new group reads apart from the rest.
    const nextColor = groupColors.find((c) => !groups?.some((g) => g.color === c)) ?? groupColors[(groups?.length ?? 0) % groupColors.length];

    // Removing the last group leaves nothing to manage — go back rather than
    // show an empty list.
    useEffect(() => {
      if (view === 'manage' && !groups?.length) setView('main');
    }, [view, groups?.length]);

    // Every opening starts with an empty search; closing returns to the main
    // view, so the next click on the trigger lands on the list, while an opening
    // from `openForm` keeps its "create" view.
    useEffect(() => {
      if (open) setSearch('');
      else setView('main');
    }, [open]);

    // PopoverContent focuses its own surface on open (right for a generic
    // popover); a search menu wants the field. Child effects run first, so this
    // rAF is queued after the popover's and lands last in the same frame.
    // Both a frame and a zero-delay timer: a background or occluded tab never
    // fires a frame, and whichever runs last wins the field either way.
    useEffect(() => {
      if (!open || view !== 'main') return;
      const focus = () => inputRef.current?.focus();
      const raf = requestAnimationFrame(focus);
      const timer = setTimeout(focus, 0);
      return () => {
        cancelAnimationFrame(raf);
        clearTimeout(timer);
      };
    }, [open, view]);

    const moreBelow = useMoreBelow(listRef, open && view === 'main', [search, tabs.length, recentlyClosed.length, groups?.length]);

    const close = () => setOpen(false);

    // Tabs in the OTHER sets, for search: the ungrouped tabs while a group is on
    // screen, and every group that is not. Only listed while searching, so the
    // unfiltered menu stays short.
    const elsewhere = useMemo(() => {
      if (!onOpenTab || !groups) return [];
      const rows: { tab: TabBarMenuItem; group: string | null; where: string }[] = [];
      if (activeGroup !== null) for (const t of ungroupedTabs ?? []) rows.push({ tab: t, group: null, where: windowLabel });
      for (const g of groups) if (g.value !== activeGroup) for (const t of g.tabs ?? []) rows.push({ tab: t, group: g.value, where: g.label });
      return rows;
    }, [onOpenTab, groups, activeGroup, ungroupedTabs, windowLabel]);

    const triggerLabel = hasGroups ? `${current}, ${switcherLabel}` : groupLabel ? `${label}, ${groupLabel}` : label;
    // The name shows only while a real group is on screen. On the ungrouped tabs
    // the button is the plain icon cell — there is no group to name.
    const shownName = hasGroups ? (activeGroup !== null ? current : undefined) : groupLabel;

    return (
      <Popover id={menuId} open={open} onOpenChange={setOpen}>
        <PopoverTrigger>
          <button
            aria-label={triggerLabel}
            {...rest}
            ref={ref}
            type="button"
            className={`ui-icon-button ui-icon-button--fill ui-tab-bar__menu${shownName ? ' ui-tab-bar__menu--labeled' : ''}${className ? ' ' + className : ''}`}
          >
            <GalleryVerticalEnd aria-hidden="true" />
            {shownName && <span aria-hidden="true">{shownName}</span>}
          </button>
        </PopoverTrigger>
        <PopoverContent
          side="bottom"
          align="end"
          className="ui-tab-bar__menu-surface"
          data-more-below={moreBelow && view === 'main' ? '' : undefined}
          // Whenever the surface itself takes focus (the popover does this on
          // open), hand it to the search field. Deterministic, unlike the rAF.
          onFocus={(e) => {
            if (e.target !== e.currentTarget) return;
            if (view === 'main') inputRef.current?.focus();
            // The form's Name field — opened from a tab's right-click menu, the
            // popover takes focus after the form's own request has run.
            else if (view === 'create') e.currentTarget.querySelector<HTMLInputElement>('.ui-tab-bar__form input')?.focus();
          }}
        >
          {view === 'create' && onCreateGroup ? (
            <GroupForm
              id={`${menuId}-create`}
              tabs={tabs.filter((t) => t.groupable !== false)}
              preset={preset}
              colors={groupColors}
              defaultColor={nextColor}
              taken={groups?.map((g) => g.label) ?? []}
              onCancel={() => setView('main')}
              onCreate={(group) => {
                onCreateGroup(group);
                close();
              }}
            />
          ) : view === 'manage' && groups ? (
            <ManageGroups
              id={`${menuId}-manage`}
              groups={groups}
              colors={groupColors}
              onBack={() => setView('main')}
              onRecolorGroup={onRecolorGroup}
              onRenameGroup={onRenameGroup}
              onUngroup={onUngroup}
              onDeleteGroup={onDeleteGroup}
            />
          ) : (
            // Nothing highlighted on open: the first selectable row is a DIFFERENT
            // set, and a highlight on it read as "you are here". Typing or an
            // arrow key highlights as usual.
            <Command id={`${menuId}-command`} value={search} onValueChange={setSearch} highlightOnOpen={false}>
              <CommandInput ref={inputRef} placeholder={placeholder} aria-label={placeholder} />
              <CommandList ref={listRef}>
                <CommandEmpty>{emptyText}</CommandEmpty>
                {groups && (
                  <>
                    {/* One list of sets: the ungrouped tabs first, then every group — the
                        check marks whichever is on screen. (A separate "This window"
                        heading read as "the view you are in" even while a group was.) */}
                    <CommandGroup heading={groupsHeading}>
                      {/* The current set is not selectable: choosing it did nothing, and the
                          first highlight should land on something that does. */}
                      <CommandItem
                        value={windowLabel}
                        className={`ui-tab-bar__menu-item${activeGroup === null ? ' ui-tab-bar__menu-item--current' : ''}`}
                        disabled={activeGroup === null}
                        onSelect={() => {
                          onSelectGroup?.(null);
                          close();
                        }}
                      >
                        <LayoutGrid aria-hidden="true" />
                        <span className="ui-tab-bar__menu-label">{windowLabel}</span>
                        {windowCount !== undefined && <MenuMeta>{tabsWord(windowCount)}</MenuMeta>}
                        {activeGroup === null && <MenuCurrent />}
                      </CommandItem>
                      {groups.map((g) => {
                        const isCurrent = activeGroup === g.value;
                        const count = g.tabs?.length ?? g.count;
                        return (
                          <CommandItem
                            key={`group-${g.value}`}
                            value={g.label}
                            className={`ui-tab-bar__menu-item${isCurrent ? ' ui-tab-bar__menu-item--current' : ''}`}
                            disabled={isCurrent}
                            onSelect={() => {
                              onSelectGroup?.(g.value);
                              close();
                            }}
                          >
                            {g.color ? <Swatch color={g.color} size="sm" /> : <GalleryVerticalEnd aria-hidden="true" />}
                            <span className="ui-tab-bar__menu-label">{g.label}</span>
                            {count !== undefined && <MenuMeta>{tabsWord(count)}</MenuMeta>}
                            {isCurrent && <MenuCurrent />}
                          </CommandItem>
                        );
                      })}
                      {onCreateGroup && (
                        <CommandItem
                          value="New group"
                          className="ui-tab-bar__menu-item"
                          onSelect={() => openForm(ctx.value ? [ctx.value] : [])}
                        >
                          <SquarePlus aria-hidden="true" />
                          <span className="ui-tab-bar__menu-label">New group…</span>
                        </CommandItem>
                      )}
                      {!onCreateGroup && onGroupTabs && activeGroup === null && (
                        <CommandItem
                          value="Group these tabs"
                          className="ui-tab-bar__menu-item"
                          onSelect={() => {
                            onGroupTabs();
                            close();
                          }}
                        >
                          <Layers aria-hidden="true" />
                          <span className="ui-tab-bar__menu-label">Group these tabs</span>
                        </CommandItem>
                      )}
                      {!onCreateGroup && onNewGroup && (
                        <CommandItem
                          value="New empty group"
                          className="ui-tab-bar__menu-item"
                          onSelect={() => {
                            onNewGroup();
                            close();
                          }}
                        >
                          <SquarePlus aria-hidden="true" />
                          <span className="ui-tab-bar__menu-label">New empty group</span>
                        </CommandItem>
                      )}
                      {canManage && (
                        <CommandItem value="Manage groups" className="ui-tab-bar__menu-item" onSelect={() => setView('manage')}>
                          <Settings2 aria-hidden="true" />
                          <span className="ui-tab-bar__menu-label">Manage groups…</span>
                        </CommandItem>
                      )}
                    </CommandGroup>
                    <CommandSeparator />
                  </>
                )}
                <CommandGroup heading={openHeading}>
                  {tabs.map((t) => {
                    const isCurrent = ctx.value === t.value;
                    return (
                      <CommandItem
                        key={`open-${t.value}`}
                        value={t.label}
                        className={`ui-tab-bar__menu-item${isCurrent ? ' ui-tab-bar__menu-item--current' : ''}`}
                        disabled={isCurrent}
                        onSelect={() => {
                          ctx.setValue(t.value);
                          close();
                        }}
                      >
                        {t.Icon && <t.Icon aria-hidden="true" />}
                        <span className="ui-tab-bar__menu-label">{t.label}</span>
                        {isCurrent && <MenuCurrent />}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
                {search.trim() !== '' && elsewhere.length > 0 && (
                  <CommandGroup heading="In other groups">
                    {elsewhere.map(({ tab, group, where }) => (
                      <CommandItem
                        key={`elsewhere-${group ?? 'window'}-${tab.value}`}
                        value={tab.label}
                        className="ui-tab-bar__menu-item"
                        onSelect={() => {
                          onOpenTab?.(tab.value, group);
                          close();
                        }}
                      >
                        {tab.Icon && <tab.Icon aria-hidden="true" />}
                        <span className="ui-tab-bar__menu-label">{tab.label}</span>
                        <MenuMeta>{where}</MenuMeta>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
                {recentlyClosed.length > 0 && (
                  <>
                    <CommandSeparator />
                    <CommandGroup heading={closedHeading}>
                      {recentlyClosed.slice(0, RECENT_LIMIT).map((t) => (
                        <CommandItem
                          key={`closed-${t.value}`}
                          value={t.label}
                          className="ui-tab-bar__menu-item"
                          onSelect={() => {
                            onReopen?.(t);
                            close();
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
          )}
        </PopoverContent>
      </Popover>
    );
  },
);

TabBarMenu.displayName = 'TabBarMenu';

/**
 * The menu's second view: rename, ungroup or delete each group. A plain list of
 * real controls rather than Command rows — an option cannot hold buttons or a
 * text field, so these do not live in the searchable list.
 */
function ManageGroups({
  id,
  groups,
  colors,
  onBack,
  onRecolorGroup,
  onRenameGroup,
  onUngroup,
  onDeleteGroup,
}: {
  id: string;
  groups: TabBarMenuGroup[];
  colors: CategoryColor[];
  onBack: () => void;
  onRecolorGroup?: (value: string, color: CategoryColor) => void;
  onRenameGroup?: (value: string, label: string) => void;
  onUngroup?: (value: string) => void;
  onDeleteGroup?: (value: string) => void;
}) {
  const [names, setNames] = useState<Record<string, string>>(() => Object.fromEntries(groups.map((g) => [g.value, g.label])));
  const [confirming, setConfirming] = useState<string | null>(null);
  const [recoloring, setRecoloring] = useState<string | null>(null);
  const backRef = useRef<HTMLButtonElement | null>(null);

  // Arriving from the search list, focus the way back rather than leaving focus
  // on a row that no longer exists.
  useEffect(() => {
    backRef.current?.focus();
  }, []);

  const commit = (g: TabBarMenuGroup) => {
    const next = (names[g.value] ?? '').trim();
    if (!next) return setNames((n) => ({ ...n, [g.value]: g.label }));
    if (next !== g.label) onRenameGroup?.(g.value, next);
  };

  return (
    <div className="ui-tab-bar__manage" role="group" aria-labelledby={`${id}-title`}>
      <div className="ui-tab-bar__manage-head">
        <button ref={backRef} type="button" className="ui-icon-button ui-icon-button--fill ui-tab-bar__manage-back" aria-label="Back to tab groups" onClick={onBack}>
          <ChevronLeft aria-hidden="true" />
        </button>
        <span id={`${id}-title`} className="ui-tab-bar__manage-title">
          Manage groups
        </span>
      </div>
      <ul className="ui-tab-bar__manage-list">
        {groups.map((g) => {
          const count = g.tabs?.length ?? g.count;
          return (
            <li key={g.value} className="ui-tab-bar__manage-row">
              {confirming === g.value ? (
                <div className="ui-tab-bar__manage-confirm" role="alert">
                  <span>
                    Delete “{g.label}”{count !== undefined ? ` and close its ${tabsWord(count)}` : ''}?
                  </span>
                  <div className="ui-tab-bar__manage-actions">
                    <Button id={`${id}-${g.value}-cancel`} style="ghost" size="xs" label="Cancel" onClick={() => setConfirming(null)} />
                    <Button
                      id={`${id}-${g.value}-delete`}
                      variant="error"
                      size="xs"
                      label="Delete"
                      onClick={() => {
                        onDeleteGroup?.(g.value);
                        setConfirming(null);
                      }}
                    />
                  </div>
                </div>
              ) : (
                <>
                  {onRecolorGroup ? (
                    <button
                      type="button"
                      className="ui-tab-bar__manage-swatch"
                      aria-label={`Color of ${g.label}`}
                      aria-expanded={recoloring === g.value}
                      onClick={() => setRecoloring((v) => (v === g.value ? null : g.value))}
                    >
                      {g.color ? <Swatch color={g.color} size="sm" /> : <GalleryVerticalEnd className="ui-tab-bar__manage-glyph" aria-hidden="true" />}
                    </button>
                  ) : g.color ? (
                    <Swatch color={g.color} size="sm" />
                  ) : (
                    <GalleryVerticalEnd className="ui-tab-bar__manage-glyph" aria-hidden="true" />
                  )}
                  {onRenameGroup ? (
                    <input
                      className="ui-tab-bar__manage-name"
                      value={names[g.value] ?? g.label}
                      aria-label={`Name of ${g.label}`}
                      onChange={(e) => setNames((n) => ({ ...n, [g.value]: e.target.value }))}
                      onBlur={() => commit(g)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          commit(g);
                          (e.target as HTMLInputElement).blur();
                        }
                      }}
                    />
                  ) : (
                    <span className="ui-tab-bar__manage-name ui-tab-bar__manage-name--static">{g.label}</span>
                  )}
                  {/* Text, not bare icons: an unlabeled "ungroup" glyph beside a trash can
                      did not say what it did. The accessible names add the group, and
                      still start with the visible word. */}
                  {onUngroup && (
                    <Button
                      id={`${id}-${g.value}-ungroup`}
                      style="ghost"
                      size="xs"
                      label="Ungroup"
                      aria-label={`Ungroup ${g.label}`}
                      onClick={() => onUngroup(g.value)}
                    />
                  )}
                  {onDeleteGroup && (
                    <Button
                      id={`${id}-${g.value}-delete-start`}
                      variant="error"
                      style="ghost"
                      size="xs"
                      label="Delete"
                      aria-label={`Delete ${g.label}`}
                      onClick={() => setConfirming(g.value)}
                    />
                  )}
                  {recoloring === g.value && onRecolorGroup && (
                    <ColorChoice
                      name={`${id}-${g.value}-color`}
                      label={`Color of ${g.label}`}
                      colors={colors}
                      value={g.color}
                      className="ui-tab-bar__manage-colors"
                      onChange={(c) => {
                        onRecolorGroup(g.value, c);
                        setRecoloring(null);
                      }}
                    />
                  )}
                </>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default TabBar;
export { TabBarList, TabBarTab, TabBarGroup, TabBarSplit, TabBarNewTab, TabBarMenu };


/**
 * A row of color swatches as a radio group — native radios, so arrow keys move
 * between colors and the group is one tab stop.
 */
function ColorChoice({
  name,
  label,
  colors,
  value,
  onChange,
  className,
}: {
  name: string;
  label: string;
  colors: CategoryColor[];
  value: CategoryColor | undefined;
  onChange: (color: CategoryColor) => void;
  className?: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className={`ui-tab-bar__colors${className ? ' ' + className : ''}`}>
      {colors.map((c) => (
        <label key={c} className="ui-tab-bar__color" title={c}>
          <input type="radio" name={name} value={c} checked={value === c} onChange={() => onChange(c)} aria-label={c} />
          <Swatch color={c} size="default" />
        </label>
      ))}
    </div>
  );
}

/**
 * The "New group…" form: a name (focused, required), a color, and which of the
 * tabs on screen move into the group — the tab you are on (or the one you
 * right-clicked) already checked. Checking none makes an empty group.
 */
function GroupForm({
  id,
  tabs,
  preset,
  colors,
  defaultColor,
  taken,
  onCancel,
  onCreate,
}: {
  id: string;
  tabs: TabBarMenuItem[];
  preset: string[];
  colors: CategoryColor[];
  defaultColor: CategoryColor;
  taken: string[];
  onCancel: () => void;
  onCreate: (group: TabBarNewGroup) => void;
}) {
  const [name, setName] = useState('');
  const [color, setColor] = useState<CategoryColor>(defaultColor);
  const [picked, setPicked] = useState<string[]>(() => preset.filter((v) => tabs.some((t) => t.value === v)));
  const nameRef = useRef<HTMLInputElement | null>(null);

  // Same reason as the search field: the popover focuses its own surface on
  // open, so claim focus after it (a frame and a timer, whichever runs last).
  useEffect(() => {
    const focus = () => nameRef.current?.focus();
    const raf = requestAnimationFrame(focus);
    const timer = setTimeout(focus, 0);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, []);

  const trimmed = name.trim();
  const duplicate = taken.some((t) => t.toLowerCase() === trimmed.toLowerCase());
  const canCreate = trimmed !== '' && !duplicate;

  return (
    <form
      className="ui-tab-bar__form"
      aria-labelledby={`${id}-title`}
      onSubmit={(e) => {
        e.preventDefault();
        if (canCreate) onCreate({ label: trimmed, color, tabs: picked });
      }}
    >
      <div className="ui-tab-bar__manage-head">
        <button type="button" className="ui-icon-button ui-icon-button--fill ui-tab-bar__manage-back" aria-label="Back to tab groups" onClick={onCancel}>
          <ChevronLeft aria-hidden="true" />
        </button>
        <span id={`${id}-title`} className="ui-tab-bar__manage-title">
          New group
        </span>
      </div>
      <div className="ui-tab-bar__form-body">
        <Input
          ref={nameRef}
          id={`${id}-name`}
          label="Name"
          size="sm"
          placeholder="e.g. Q4 planning"
          value={name}
          onValueChange={setName}
          error={duplicate}
          errorMessage={duplicate ? 'A group already has this name.' : undefined}
          autoComplete="off"
        />
        <div className="ui-tab-bar__form-field">
          <span className="ui-tab-bar__form-label" id={`${id}-color`}>
            Color
          </span>
          <ColorChoice name={`${id}-color-choice`} label="Color" colors={colors} value={color} onChange={setColor} />
        </div>
        {tabs.length > 0 && (
          <fieldset className="ui-tab-bar__form-field ui-tab-bar__form-tabs">
            <legend className="ui-tab-bar__form-label">
              Tabs to move into the group <span className="ui-tab-bar__form-count">{picked.length} selected</span>
            </legend>
            <ScrollArea id={`${id}-tabs`} className="ui-tab-bar__form-scroll">
              <div className="ui-tab-bar__form-list">
                {tabs.map((t) => (
                  <Checkbox
                    key={t.value}
                    id={`${id}-tab-${t.value}`}
                    size="sm"
                    label={t.label}
                    checked={picked.includes(t.value)}
                    onCheckedChange={(on) => setPicked((p) => (on ? [...p, t.value] : p.filter((v) => v !== t.value)))}
                  />
                ))}
              </div>
            </ScrollArea>
          </fieldset>
        )}
      </div>
      <div className="ui-tab-bar__form-foot">
        <Button id={`${id}-cancel`} style="ghost" size="sm" label="Cancel" onClick={onCancel} />
        <Button id={`${id}-submit`} type="submit" size="sm" label="Create group" disabled={!canCreate} />
      </div>
    </form>
  );
}

/**
 * "New group…" for a tab's right-click menu: opens the tab menu's form with this
 * tab checked, so a group can start from the tab itself (and the keyboard can
 * reach it — Shift+F10 on the tab).
 */
const TabBarNewGroupItem = ({ tabs, label = 'New group…', className }: TabBarNewGroupItemProps) => {
  const ctx = useTabBar();
  return (
    <ContextMenuItem
      className={className}
      onClick={() => {
        // Let the context menu finish closing (and restoring focus) before the
        // popover opens and takes it.
        setTimeout(() => ctx.groupForm.current?.(tabs), 0);
      }}
    >
      {label}
    </ContextMenuItem>
  );
};

TabBarNewGroupItem.displayName = 'TabBarNewGroupItem';

export { TabBarNewGroupItem };


/**
 * The "+" as a menu — Notion's new-tab search: a search field, one filter chip
 * per category, then Create actions, Recently opened, and every page grouped by
 * category. Opens as a centered `CommandDialog` (a palette, not a dropdown under
 * the "+"), so it has room for every section and never runs off a narrow window;
 * the chips are real `Chip` toggles between the field and the list.
 */
const TabBarNewTabMenu = forwardRef<HTMLButtonElement, TabBarNewTabMenuProps>(
  (
    {
      items,
      categories = [],
      recent = [],
      actions = [],
      onOpen,
      label = 'New tab',
      placeholder = 'Search pages…',
      emptyText = 'No pages match',
      actionsHeading = 'Create',
      recentHeading = 'Recently opened',
      otherHeading = 'Other',
      open: openProp,
      onOpenChange,
      className,
      ...rest
    },
    ref,
  ) => {
    const ctx = useTabBar();
    const [openState, setOpenState] = useState(false);
    const open = openProp ?? openState;
    const setOpen = (next: boolean) => {
      if (openProp === undefined) setOpenState(next);
      onOpenChange?.(next);
    };
    const [search, setSearch] = useState('');
    const [chips, setChips] = useState<string[]>([]);
    const menuId = `${ctx.id}-new`;
    const inputRef = useRef<HTMLInputElement | null>(null);
    const listRef = useRef<HTMLDivElement | null>(null);

    // Every opening starts fresh: no search, no chips.
    useEffect(() => {
      if (open) {
        setSearch('');
        setChips([]);
      }
    }, [open]);

    // Focus the search field once the dialog has placed itself and run its own focus.
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

    // The dialog mounts its content a render after `open` flips, so track the
    // list node itself: the fade check has to re-run once the list exists.
    const [listEl, setListEl] = useState<HTMLDivElement | null>(null);
    const moreBelow = useMoreBelow(listRef, open && listEl !== null, [listEl, search, chips.join('|'), items.length]);

    const filtering = chips.length > 0;
    const inChips = (i: TabBarNewTabItem) => !filtering || (i.category !== undefined && chips.includes(i.category));
    const pick = (item: TabBarNewTabItem) => {
      onOpen(item);
      setOpen(false);
    };

    // Items grouped by category, in category order; anything uncategorized last.
    const sections = useMemo(() => {
      const known = new Set(categories.map((c) => c.value));
      const out = categories
        .filter((c) => !filtering || chips.includes(c.value))
        .map((c) => ({ key: c.value, heading: c.label, items: items.filter((i) => i.category === c.value) }));
      if (!filtering) out.push({ key: '__other', heading: otherHeading, items: items.filter((i) => !i.category || !known.has(i.category)) });
      return out.filter((sec) => sec.items.length > 0);
    }, [categories, items, chips, filtering, otherHeading]);

    const row = (item: TabBarNewTabItem, key: string) => (
      <CommandItem
        key={key}
        value={[item.label, item.description].filter(Boolean).join(' ')}
        keywords={item.keywords}
        className="ui-tab-bar__menu-item"
        onSelect={() => pick(item)}
      >
        {item.Icon && <item.Icon aria-hidden="true" />}
        <span className="ui-tab-bar__menu-label">{item.label}</span>
        {item.description && <MenuMeta>{item.description}</MenuMeta>}
      </CommandItem>
    );

    const recentShown = recent.filter(inChips).slice(0, RECENT_LIMIT);
    const showRecent = search.trim() === '' && recentShown.length > 0;

    return (
      <>
        <button
          aria-label={label}
          aria-haspopup="dialog"
          aria-expanded={open}
          {...rest}
          ref={ref}
          type="button"
          className={`ui-icon-button ui-icon-button--fill ui-tab-bar__new${className ? ' ' + className : ''}`}
          onClick={(e) => {
            rest.onClick?.(e);
            if (!e.defaultPrevented) setOpen(true);
          }}
        >
          <Plus aria-hidden="true" />
        </button>
        <CommandDialog
          id={menuId}
          open={open}
          onClose={() => setOpen(false)}
          title={label}
          placement="center"
          className="ui-tab-bar__new-dialog"
        >
          <div className="ui-tab-bar__new-palette" data-more-below={moreBelow ? '' : undefined}>
            <Command id={`${menuId}-command`} value={search} onValueChange={setSearch} highlightOnOpen={false}>
              <CommandInput ref={inputRef} placeholder={placeholder} aria-label={placeholder} />
              {categories.length > 0 && (
                <div className="ui-tab-bar__chips" role="group" aria-label="Filter by type">
                  {categories.map((c) => (
                    <Chip
                      key={c.value}
                      id={`${menuId}-chip-${c.value}`}
                      size="xs"
                      label={c.label}
                      active={chips.includes(c.value)}
                      onClick={() => setChips((cs) => (cs.includes(c.value) ? cs.filter((x) => x !== c.value) : [...cs, c.value]))}
                    />
                  ))}
                </div>
              )}
              <CommandList
                ref={(node) => {
                  listRef.current = node;
                  setListEl(node);
                }}
              >
                <CommandEmpty>{emptyText}</CommandEmpty>
                {!filtering && actions.length > 0 && (
                  <CommandGroup heading={actionsHeading}>{actions.map((a) => row(a, `action-${a.value}`))}</CommandGroup>
                )}
                {showRecent && <CommandGroup heading={recentHeading}>{recentShown.map((r) => row(r, `recent-${r.value}`))}</CommandGroup>}
                {sections.map((sec) => (
                  <CommandGroup key={sec.key} heading={sec.heading}>
                    {sec.items.map((i) => row(i, `${sec.key}-${i.value}`))}
                  </CommandGroup>
                ))}
              </CommandList>
            </Command>
          </div>
        </CommandDialog>
      </>
    );
  },
);

TabBarNewTabMenu.displayName = 'TabBarNewTabMenu';

export { TabBarNewTabMenu };
