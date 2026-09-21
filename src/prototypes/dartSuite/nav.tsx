/* ── DART Suite prototype · navigation ────────────────────────────────────────
   The tab strip IS the router. Each open tab holds one Route and its own back
   history; the Home tab is fixed (DART Central home, icon-only, never closes).

   `go(route)` navigates the ACTIVE tab — except from Home, which is fixed, so
   going anywhere from Home opens a new tab. `open(route)` always opens a tab.

   LEAVE GUARDS (Request Flow ④ FLOW MAP): "Leaving a dirty form by ANY route
   (breadcrumb, Sidebar, AppRail, tab switch, tab close) → Leave without
   submitting?". The guard belongs to the navigation event, not to a button, so
   a screen registers one with `useLeaveGuard` and every exit here honors it. */

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import AlertDialog, { AlertDialogBody, AlertDialogFooter, AlertDialogHeader } from '../../components/AlertDialog';
import Button from '../../components/Button';
import type { Route } from './types';

export type Tab = { id: string; route: Route; history: Route[] };

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
};

const Ctx = createContext<NavCtx | null>(null);
const GuardCtx = createContext<{ set: (tabId: string, g: LeaveGuard | null) => void; activeId: string } | null>(null);

const HOME: Tab = { id: 'home', route: { page: 'home' }, history: [] };
let tabSeq = 1;

const same = (a: Route, b: Route) => JSON.stringify(a) === JSON.stringify(b);

export function NavProvider({ initial, children }: { initial?: Route; children: ReactNode }) {
  const [tabs, setTabs] = useState<Tab[]>(() =>
    initial && initial.page !== 'home' ? [HOME, { id: `t${tabSeq++}`, route: initial, history: [] }] : [HOME],
  );
  const [activeId, setActiveId] = useState(() => (initial && initial.page !== 'home' ? 't1' : 'home'));
  const [tabBarUsed, setTabBarUsed] = useState(0);
  const guards = useRef(new Map<string, LeaveGuard>());
  const [pending, setPending] = useState<{ guard: LeaveGuard; run: () => void } | null>(null);

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

  const openNow = useCallback((route: Route) => {
    const id = `t${tabSeq++}`;
    setTabs((ts) => [...ts, { id, route, history: [] }]);
    setActiveId(id);
  }, []);

  const go = useCallback(
    (route: Route) => {
      if (activeId === 'home') {
        if (route.page === 'home') return;
        // Reuse an open tab already showing this route rather than stacking duplicates.
        const existing = tabs.find((t) => same(t.route, route));
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
    [activeId, tabs, guarded, openNow],
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
        setTabs((ts) => {
          const i = ts.findIndex((t) => t.id === tabId);
          const next = ts.filter((t) => t.id !== tabId);
          if (tabId === activeId) setActiveId((next[i] ?? next[i - 1] ?? next[0]).id);
          return next;
        });
        guards.current.delete(tabId);
      });
    },
    [activeId, guarded],
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
    }),
    [tabs, activeId, activeTab, go, guarded, openNow, replace, back, activate, closeTab, tabBarUsed],
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
