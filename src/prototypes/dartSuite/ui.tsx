/* ── DART Suite prototype · shared overlays ───────────────────────────────────
   Overlays that more than one screen opens live here, so every screen opens
   them the same way and gets the same component:

   - The tab bar's "+" palette (also opened from the Home search card). Only
     its open state lives here; the palette itself is `newTab.tsx`, rendered in
     the tab bar.
   - Add to space (Browse, Dashboard, Builder)  → Browse B4.1–B4.5, Pattern/AddToSpace
   - Dashboard info (Browse, Space)             → Browse B2.1–B2.2, Pattern/DashboardInfo
   - How to get access (Dashboard, Space)       → Dashboard D2.3
   - The user's theme (account menu → Theme). ONE theme for the whole suite,
     picked by the user — not one per application (owner, 2026-09-19 and
     2026-09-22). Written onto <html> as data-theme so portals follow it, kept
     in localStorage so it survives a reload, Indigo (db) by default.
   - Aiden's stop (closed / mini / panel). Two controls open Aiden — the Fab
     and the Ask Aiden button at the far end of the tab strip — so which stop
     is showing lives here, not in AidenHost.

   The dialog components themselves live with the screens that own them; this
   file only holds which one is open. */

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { AddToSpaceDialog } from './screens/boards/shared/AddToSpaceDialog';
import { DashboardInfoDialog } from './screens/boards/shared/DashboardInfoDialog';
import { GetAccessDialog } from './screens/boards/shared/GetAccessDialog';

type Overlay =
  | { kind: 'add-to-space'; dashboardId: string }
  | { kind: 'dashboard-info'; dashboardId: string }
  | { kind: 'get-access'; dashboardId: string }
  | null;

/** The library's six built themes, by the names the Figma Theme collection uses. */
export const THEMES = [
  { value: 'db', label: 'Indigo' },
  { value: 'dc', label: 'Teal' },
  { value: 'ec', label: 'Cobalt' },
  { value: 'nb', label: 'Fern' },
  { value: 'ph', label: 'Amber' },
  { value: 'rm', label: 'Magenta' },
] as const;
export type ThemeCode = (typeof THEMES)[number]['value'];
const DEFAULT_THEME: ThemeCode = 'db';
const THEME_KEY = 'ds-suite-theme';

function readTheme(): ThemeCode {
  try {
    const saved = window.localStorage.getItem(THEME_KEY);
    if (saved && THEMES.some((t) => t.value === saved)) return saved as ThemeCode;
  } catch {
    /* storage blocked — fall back to the default */
  }
  return DEFAULT_THEME;
}

export type AidenStop = 'closed' | 'mini' | 'panel';

type UiCtx = {
  theme: ThemeCode;
  setTheme: (theme: ThemeCode) => void;
  aidenStop: AidenStop;
  setAidenStop: (stop: AidenStop | ((prev: AidenStop) => AidenStop)) => void;
  openNewTab: () => void;
  newTabOpen: boolean;
  setNewTabOpen: (open: boolean) => void;
  openAddToSpace: (dashboardId: string) => void;
  openDashboardInfo: (dashboardId: string) => void;
  openGetAccess: (dashboardId: string) => void;
  close: () => void;
};

const Ctx = createContext<UiCtx | null>(null);

export function UiProvider({ children }: { children: ReactNode }) {
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [newTabOpen, setNewTabOpen] = useState(false);
  const [aidenStop, setAidenStop] = useState<AidenStop>('closed');
  const [theme, setTheme] = useState<ThemeCode>(() => (typeof window === 'undefined' ? DEFAULT_THEME : readTheme()));

  // Storybook's decorator also writes data-theme (the story's global, 'db'), and
  // a parent's effect runs AFTER a child's on mount — so apply again on the next
  // frame, or a saved non-Indigo theme would be overwritten on load.
  useEffect(() => {
    const apply = () => document.documentElement.setAttribute('data-theme', theme);
    apply();
    const raf = requestAnimationFrame(apply);
    try {
      window.localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* storage blocked — the choice lasts this session only */
    }
    return () => cancelAnimationFrame(raf);
  }, [theme]);
  const api = useMemo<UiCtx>(
    () => ({
      theme,
      setTheme,
      aidenStop,
      setAidenStop,
      openNewTab: () => setNewTabOpen(true),
      newTabOpen,
      setNewTabOpen,
      openAddToSpace: (dashboardId) => setOverlay({ kind: 'add-to-space', dashboardId }),
      openDashboardInfo: (dashboardId) => setOverlay({ kind: 'dashboard-info', dashboardId }),
      openGetAccess: (dashboardId) => setOverlay({ kind: 'get-access', dashboardId }),
      close: () => setOverlay(null),
    }),
    [newTabOpen, aidenStop, theme],
  );
  const close = api.close;
  return (
    <Ctx.Provider value={api}>
      {children}
      <AddToSpaceDialog
        open={overlay?.kind === 'add-to-space'}
        dashboardId={overlay?.kind === 'add-to-space' ? overlay.dashboardId : null}
        onClose={close}
      />
      <DashboardInfoDialog
        open={overlay?.kind === 'dashboard-info'}
        dashboardId={overlay?.kind === 'dashboard-info' ? overlay.dashboardId : null}
        onClose={close}
      />
      <GetAccessDialog
        open={overlay?.kind === 'get-access'}
        dashboardId={overlay?.kind === 'get-access' ? overlay.dashboardId : null}
        onClose={close}
      />
    </Ctx.Provider>
  );
}

export function useUi() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useUi must be used inside <UiProvider>');
  return ctx;
}
