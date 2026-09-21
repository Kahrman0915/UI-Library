/* ── DART Suite prototype · navigation ────────────────────────────────────────
   The tab strip IS the router. Each open tab holds one Route and its own back
   history; the Home tab is fixed (DART Central home, icon-only, never closes).

   `go(route)` navigates the ACTIVE tab — except from Home, which is fixed, so
   going anywhere from Home opens a new tab. `open(route)` always opens a tab.

   TAB GROUPS follow the library's model (Notion's): a group is a named set of
   tabs and the bar shows ONE set at a time — the ungrouped tabs or one group —
   with Home in every set. Each tab carries its `group`; `visibleTabs` is the set
   on screen, and the tab menu at the end of the bar switches sets.

   LEAVE GUARDS (Request Flow ④ FLOW MAP): "Leaving a dirty form by ANY route
   (breadcrumb, Sidebar, AppRail, tab switch, tab close) → Leave without
   submitting?". The guard belongs to the navigation event, not to a button, so
   a screen registers one with `useLeaveGuard` and every exit here honors it. */

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import AlertDialog, { AlertDialogBody, AlertDialogFooter, AlertDialogHeader } from '../../components/AlertDialog';
import Button from '../../components/Button';
import type { CategoryColor } from '../../types/GlobalTypes';
import type { TabBarNewGroup } from '../../components/TabBar';
import type { Route } from './types';

/** `group` is the tab group the tab belongs to; `null` = the ungrouped tabs. Home is always `null` and shows in every set. */
export type Tab = { id: string; route: Route; history: Route[]; group: string | null };
export type TabGroup = { id: string; label: string; color: CategoryColor };
/** A closed tab, kept for the tab menu's Recently closed. `key` is unique per closing. */
export type ClosedTab = { key: string; route: Route };

export type LeaveGuard = {
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
};

type NavCtx = {
  tabs: Tab[];
  activeId: string;
  route: Route;
  /** Navigate the active tab (or open a tab when Home is active). */
  go: (route: Route) => void;
  /** Always open a new tab and activate it. */
  open: (route: Route) => void;
  /** Replace the active tab's route without adding history (e.g. submit → outcome). */
  replace: (route: Route) => void;
  back: () => void;
  canGoBack: boolean;
  activate: (tabId: string) => void;
  closeTab: (tabId: string) => void;
  /** Bumped every time the tab strip is used — Drawers close on it (AppShell rule). */
  tabBarUsed: number;
  markTabBarUsed: () => void;

  /* Tab groups — one set on screen at a time. */
  groups: TabGroup[];
  /** The set on screen: a group id, or `null` for the ungrouped tabs. */
  activeGroup: string | null;
  /** Home plus the tabs of the set on screen, in bar order. */
  visibleTabs: Tab[];
  selectGroup: (group: string | null) => void;
  /** Switch to `group` and activate `tabId` in it (the tab menu's cross-set search). */
  openTabIn: (tabId: string, group: string | null) => void;
  createGroup: (g: TabBarNewGroup) => void;
  moveToGroup: (tabId: string, group: string | null) => void;
  renameGroup: (group: string, label: string) => void;
  recolorGroup: (group: string, color: CategoryColor) => void;
  /** The group's tabs join the ungrouped tabs. */
  ungroup: (group: string) => void;
  /** Closes the group's tabs (they go to Recently closed). */
  deleteGroup: (group: string) => void;
  closed: ClosedTab[];
  reopen: (key: string) => void;
};

const Ctx = createContext<NavCtx | null>(null);
const GuardCtx = createContext<{ set: (tabId: string, g: LeaveGuard | null) => void; activeId: string } | null>(null);

const HOME: Tab = { id: 'home', route: { page: 'home' }, history: [], group: null };
let tabSeq = 1;
let groupSeq = 1;
let closedSeq = 1;

const same = (a: Route, b: Route) => JSON.stringify(a) === JSON.stringify(b);

export function NavProvider({ initial, children }: { initial?: Route; children: ReactNode }) {
  const [tabs, setTabs] = useState<Tab[]>(() =>
    initial && initial.page !== 'home' ? [HOME, { id: `t${tabSeq++}`, route: initial, history: [], group: null }] : [HOME],
  );
  const [activeId, setActiveId] = useState(() => (initial && initial.page !== 'home' ? 't1' : 'home'));
  const [tabBarUsed, setTabBarUsed] = useState(0);
  const guards = useRef(new Map<string, LeaveGuard>());
  const [pending, setPending] = useState<{ guard: LeaveGuard; run: () => void } | null>(null);
  const [groups, setGroups] = useState<TabGroup[]>([]);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [closed, setClosed] = useState<ClosedTab[]>([]);
  /** The tab each set last had open, so switching back lands where you left it. Key `''` = ungrouped. */
  const lastActive = useRef(new Map<string, string>());

  /** Run `fn` now, or after the user confirms leaving a guarded tab. */
  const guarded = useCallback((tabId: string, fn: () => void) => {
    const g = guards.current.get(tabId);
    if (!g) return fn();
    setPending({
      guard: g,
      run: () => {
        guards.current.delete(tabId);
        fn();
      },
    });
  }, []);

  const activeTab = tabs.find((t) => t.id === activeId) ?? tabs[0];
  const visibleTabs = tabs.filter((t) => t.id === 'home' || t.group === activeGroup);

  const openNow = useCallback(
    (route: Route) => {
      const id = `t${tabSeq++}`;
      setTabs((ts) => [...ts, { id, route, history: [], group: activeGroup }]);
      setActiveId(id);
    },
    [activeGroup],
  );

  /** Show `group`, landing on `tabId` if given, else where that set was left. No guard — callers guard. */
  const showSet = useCallback(
    (group: string | null, tabId?: string, all: Tab[] = tabs) => {
      lastActive.current.set(activeGroup ?? '', activeId);
      const inSet = all.filter((t) => t.id !== 'home' && t.group === group);
      const remembered = lastActive.current.get(group ?? '');
      const target =
        tabId ?? (remembered && (remembered === 'home' || inSet.some((t) => t.id === remembered)) ? remembered : inSet[0]?.id ?? 'home');
      setActiveGroup(group);
      setActiveId(target);
    },
    [tabs, activeGroup, activeId],
  );

  const go = useCallback(
    (route: Route) => {
      if (activeId === 'home') {
        if (route.page === 'home') return;
        // Reuse an open tab already showing this route rather than stacking duplicates.
        const existing = tabs.find((t) => t.id !== 'home' && t.group === activeGroup && same(t.route, route));
        if (existing) return setActiveId(existing.id);
        return openNow(route);
      }
      if (route.page === 'home') return guarded(activeId, () => setActiveId('home'));
      guarded(activeId, () =>
        setTabs((ts) =>
          ts.map((t) => (t.id === activeId && !same(t.route, route) ? { ...t, history: [...t.history, t.route], route } : t)),
        ),
      );
    },
    [activeId, activeGroup, tabs, guarded, openNow],
  );

  const replace = useCallback(
    (route: Route) => {
      guards.current.delete(activeId);
      setTabs((ts) => ts.map((t) => (t.id === activeId ? { ...t, route } : t)));
    },
    [activeId],
  );

  const back = useCallback(() => {
    guarded(activeId, () =>
      setTabs((ts) =>
        ts.map((t) => {
          if (t.id !== activeId || !t.history.length) return t;
          const history = t.history.slice(0, -1);
          return { ...t, history, route: t.history[t.history.length - 1] };
        }),
      ),
    );
  }, [activeId, guarded]);

  const activate = useCallback(
    (tabId: string) => {
      if (tabId === activeId) return;
      guarded(activeId, () => setActiveId(tabId));
    },
    [activeId, guarded],
  );

  const closeTab = useCallback(
    (tabId: string) => {
      if (tabId === 'home') return;
      guarded(tabId, () => {
        const tab = tabs.find((t) => t.id === tabId);
        if (tab) setClosed((c) => [{ key: `c${closedSeq++}`, route: tab.route }, ...c]);
        setTabs((ts) => {
          const set = ts.filter((t) => t.id === 'home' || t.group === activeGroup);
          const i = set.findIndex((t) => t.id === tabId);
          const rest = set.filter((t) => t.id !== tabId);
          if (tabId === activeId) setActiveId((rest[i] ?? rest[i - 1] ?? rest[0]).id);
          return ts.filter((t) => t.id !== tabId);
        });
        guards.current.delete(tabId);
      });
    },
    [activeId, activeGroup, tabs, guarded],
  );

  /* ── Groups ─────────────────────────────────────────────────────────────── */

  const selectGroup = useCallback(
    (group: string | null) => {
      if (group === activeGroup) return;
      guarded(activeId, () => showSet(group));
    },
    [activeGroup, activeId, guarded, showSet],
  );

  const openTabIn = useCallback(
    (tabId: string, group: string | null) => {
      if (tabId === activeId) return;
      guarded(activeId, () => showSet(group, tabId));
    },
    [activeId, guarded, showSet],
  );

  /** A new group takes the chosen tabs out of the set on screen, and you move into it. */
  const createGroup = useCallback(
    ({ label, color, tabs: chosen }: TabBarNewGroup) => {
      const id = `g${groupSeq++}`;
      const moved = chosen.filter((t) => t !== 'home');
      setGroups((gs) => [...gs, { id, label, color }]);
      const next = tabs.map((t) => (moved.includes(t.id) ? { ...t, group: id } : t));
      setTabs(next);
      guarded(activeId, () => showSet(id, moved.includes(activeId) ? activeId : moved[0], next));
    },
    [tabs, activeId, guarded, showSet],
  );

  /** Move one tab to another set; you stay where you are. */
  const moveToGroup = useCallback(
    (tabId: string, group: string | null) => {
      if (tabId === 'home') return;
      setTabs((ts) => {
        if (tabId === activeId) {
          const set = ts.filter((t) => t.id === 'home' || t.group === activeGroup);
          const i = set.findIndex((t) => t.id === tabId);
          const rest = set.filter((t) => t.id !== tabId);
          setActiveId((rest[i] ?? rest[i - 1] ?? rest[0]).id);
        }
        return ts.map((t) => (t.id === tabId ? { ...t, group } : t));
      });
    },
    [activeId, activeGroup],
  );

  const renameGroup = useCallback((group: string, label: string) => setGroups((gs) => gs.map((g) => (g.id === group ? { ...g, label } : g))), []);
  const recolorGroup = useCallback((group: string, color: CategoryColor) => setGroups((gs) => gs.map((g) => (g.id === group ? { ...g, color } : g))), []);

  const ungroup = useCallback(
    (group: string) => {
      setTabs((ts) => ts.map((t) => (t.group === group ? { ...t, group: null } : t)));
      setGroups((gs) => gs.filter((g) => g.id !== group));
      if (activeGroup === group) setActiveGroup(null);
    },
    [activeGroup],
  );

  const deleteGroup = useCallback(
    (group: string) => {
      const gone = tabs.filter((t) => t.group === group);
      const run = () => {
        setClosed((c) => [...gone.map((t) => ({ key: `c${closedSeq++}`, route: t.route })), ...c]);
        gone.forEach((t) => guards.current.delete(t.id));
        const next = tabs.filter((t) => t.group !== group);
        setTabs(next);
        setGroups((gs) => gs.filter((g) => g.id !== group));
        if (activeGroup === group) showSet(null, undefined, next);
      };
      // Deleting the set on screen leaves it, so honor its guard.
      if (activeGroup === group) guarded(activeId, run);
      else run();
    },
    [tabs, activeGroup, activeId, guarded, showSet],
  );

  const reopen = useCallback(
    (key: string) => {
      const c = closed.find((x) => x.key === key);
      if (!c) return;
      setClosed((cs) => cs.filter((x) => x.key !== key));
      guarded(activeId, () => openNow(c.route));
    },
    [closed, activeId, guarded, openNow],
  );

  const value = useMemo<NavCtx>(
    () => ({
      tabs,
      activeId,
      route: activeTab.route,
      go,
      open: (r) => guarded(activeId, () => openNow(r)),
      replace,
      back,
      canGoBack: activeTab.history.length > 0,
      activate,
      closeTab,
      tabBarUsed,
      markTabBarUsed: () => setTabBarUsed((n) => n + 1),
      groups,
      activeGroup,
      visibleTabs,
      selectGroup,
      openTabIn,
      createGroup,
      moveToGroup,
      renameGroup,
      recolorGroup,
      ungroup,
      deleteGroup,
      closed,
      reopen,
    }),
    [tabs, activeId, activeTab, go, guarded, openNow, replace, back, activate, closeTab, tabBarUsed, groups, activeGroup, visibleTabs, selectGroup, openTabIn, createGroup, moveToGroup, renameGroup, recolorGroup, ungroup, deleteGroup, closed, reopen],
  );

  const guardApi = useMemo(
    () => ({
      activeId,
      set: (tabId: string, g: LeaveGuard | null) => {
        if (g) guards.current.set(tabId, g);
        else guards.current.delete(tabId);
      },
    }),
    [activeId],
  );

  return (
    <Ctx.Provider value={value}>
      <GuardCtx.Provider value={guardApi}>
        {children}
        <AlertDialog id="ds-leave" open={!!pending} onClose={() => setPending(null)}>
          <AlertDialogHeader id="ds-leave-header" title={pending?.guard.title ?? ''} />
          <AlertDialogBody>{pending?.guard.description}</AlertDialogBody>
          <AlertDialogFooter>
            <Button id="ds-leave-stay" style="ghost" label={pending?.guard.cancelLabel ?? 'Keep editing'} onClick={() => setPending(null)} />
            <Button
              id="ds-leave-go"
              variant="error"
              label={pending?.guard.confirmLabel ?? 'Leave'}
              onClick={() => {
                const run = pending?.run;
                setPending(null);
                run?.();
              }}
            />
          </AlertDialogFooter>
        </AlertDialog>
      </GuardCtx.Provider>
    </Ctx.Provider>
  );
}

export function useNav() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useNav must be used inside <NavProvider>');
  return ctx;
}

/**
 * Guard the CURRENT tab while `guard` is non-null. Pass `null` when the form is
 * clean. Cleared automatically when the screen unmounts.
 *
 *   useLeaveGuard(dirty ? LEAVE_FORM : null);
 */
export function useLeaveGuard(guard: LeaveGuard | null) {
  const ctx = useContext(GuardCtx);
  if (!ctx) throw new Error('useLeaveGuard must be used inside <NavProvider>');
  // The tab this screen was mounted in — not whichever tab is active later.
  const tabId = useRef(ctx.activeId).current;
  const { set } = ctx;
  const key = guard ? JSON.stringify(guard) : '';
  useEffect(() => {
    set(tabId, guard);
    return () => set(tabId, null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, tabId, set]);
}

/** Copy from Request Flow ⑤ ALERT DIALOGS, verbatim. */
export const LEAVE_FORM: LeaveGuard = {
  title: 'Leave without submitting?',
  description: 'This request hasn’t been submitted yet. The details you’ve entered will be discarded.',
  confirmLabel: 'Discard request',
  cancelLabel: 'Keep editing',
};

export const DISCARD_REPLY: LeaveGuard = {
  title: 'Discard your reply?',
  description: 'You’ve written a reply that hasn’t been sent. It won’t be saved.',
  confirmLabel: 'Discard reply',
  cancelLabel: 'Keep editing',
};

export const DISCARD_BUILDER: LeaveGuard = {
  title: 'Discard changes?',
  description: 'You have changes to this space that have not been saved.',
  confirmLabel: 'Discard changes',
  cancelLabel: 'Keep editing',
};
