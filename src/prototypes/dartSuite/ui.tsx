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
   - Leaving DART Central (owner, 2026-10-02): a web report or an external chart
     opens in a new tab, behind a one-time message per KIND of destination. The
     "don't show again" choices sit beside the theme in localStorage — a real
     build keeps them on the account, so a new laptop does not bring them back.
     The account menu turns them all back on.
   - Aiden's stop (closed / mini / panel). Two controls open Aiden — the Fab
     and the Ask Aiden button at the far end of the tab strip — so which stop
     is showing lives here, not in AidenHost.

   The dialog components themselves live with the screens that own them; this
   file only holds which one is open. */

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { AddToSpaceDialog } from './screens/boards/shared/AddToSpaceDialog';
import { DashboardInfoDialog } from './screens/boards/shared/DashboardInfoDialog';
import { AssetInfoDialog } from './screens/boards/shared/AssetInfoDialog';
import { GetAccessDialog } from './screens/boards/shared/GetAccessDialog';
import { LeaveDialog } from './screens/boards/external/LeaveDialog';
import type { LeaveTarget } from './screens/boards/external/LeaveDialog';
import { toast } from '../../components/Toast';

type Overlay =
  | { kind: 'add-to-space'; dashboardId: string }
  | { kind: 'add-asset-to-space'; assetId: string }
  | { kind: 'asset-info'; assetId: string }
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

const LEAVE_KEY = 'ds-suite-leave-skip';
function readSkips(): string[] {
  try {
    const saved = JSON.parse(window.localStorage.getItem(LEAVE_KEY) ?? '[]');
    return Array.isArray(saved) ? saved.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

/**
 * Opens the new tab. In a real build this is the link's own target="_blank"
 * rel="noopener"; the prototype's URLs are placeholders, so it opens a stand-in
 * page named for the destination. Must run inside the click — browsers block a
 * new tab that is not.
 */
function openOutside(t: LeaveTarget): boolean {
  const w = window.open('', '_blank');
  if (!w) return false;
  const doc = w.document;
  doc.title = t.name;
  const main = doc.createElement('main');
  main.style.cssText = 'font-family: system-ui, sans-serif; padding: 48px; max-width: 640px; line-height: 1.5';
  const h = doc.createElement('h1');
  h.textContent = t.name;
  const p = doc.createElement('p');
  p.textContent = `Prototype stand-in for ${t.url}. The real ${t.dest === 'report' ? 'report' : 'chart'} opens here${t.dest === 'report' ? '' : `, in ${t.site}`}. DART Central is still open in the tab you came from.`;
  main.append(h, p);
  doc.body.append(main);
  return true;
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
  /** The same dialog for a report (or any asset) from the Marketplace. */
  openAddAssetToSpace: (assetId: string) => void;
  /** A metric's details — the dialog "View metric details" opens, like a dashboard's. */
  openAssetInfo: (assetId: string) => void;
  openDashboardInfo: (dashboardId: string) => void;
  openGetAccess: (dashboardId: string) => void;
  /** Leave DART Central for a web report or an external chart — the one-time message first, unless skipped. */
  leave: (target: LeaveTarget) => void;
  /** Whether any leaving message is still on; turning this on brings them all back. */
  leaveNotices: boolean;
  setLeaveNotices: (on: boolean) => void;
  /**
   * Ask Aiden something FROM a surface that already knows the answer's inputs —
   * a native chart hands over its own numbers. Opens the side panel on a new
   * chat with the question asked. AidenHost consumes it and clears it.
   */
  aidenAsk: AidenAsk | null;
  askAiden: (question: string, answer: string) => void;
  clearAidenAsk: () => void;
  close: () => void;
};

export type AidenAsk = { key: number; question: string; answer: string };
let askSeq = 0;

const Ctx = createContext<UiCtx | null>(null);

export function UiProvider({ children }: { children: ReactNode }) {
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [newTabOpen, setNewTabOpen] = useState(false);
  const [aidenStop, setAidenStop] = useState<AidenStop>('closed');
  const [aidenAsk, setAidenAsk] = useState<AidenAsk | null>(null);
  const [theme, setTheme] = useState<ThemeCode>(() => (typeof window === 'undefined' ? DEFAULT_THEME : readTheme()));
  const [skips, setSkips] = useState<string[]>(() => (typeof window === 'undefined' ? [] : readSkips()));
  const [leaving, setLeaving] = useState<LeaveTarget | null>(null);
  useEffect(() => {
    try {
      window.localStorage.setItem(LEAVE_KEY, JSON.stringify(skips));
    } catch {
      /* storage blocked — the choice lasts this session only */
    }
  }, [skips]);
  const go = (t: LeaveTarget) => {
    if (!openOutside(t))
      toast.error('Your browser blocked the new tab', { description: `Allow pop-ups for DART Central, then open ${t.name} again.` });
  };

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
      openAddAssetToSpace: (assetId) => setOverlay({ kind: 'add-asset-to-space', assetId }),
      openAssetInfo: (assetId) => setOverlay({ kind: 'asset-info', assetId }),
      openDashboardInfo: (dashboardId) => setOverlay({ kind: 'dashboard-info', dashboardId }),
      openGetAccess: (dashboardId) => setOverlay({ kind: 'get-access', dashboardId }),
      leave: (t) => (skips.includes(t.dest) ? go(t) : setLeaving(t)),
      // "On" while at least one kind still shows its message — the opposite of
      // "every kind has been ticked away", which is all the prototype knows of.
      leaveNotices: skips.length === 0,
      setLeaveNotices: (on) => setSkips(on ? [] : ['report', 'external:Tableau', 'external:Power BI']),
      aidenAsk,
      askAiden: (question, answer) => setAidenAsk({ key: ++askSeq, question, answer }),
      clearAidenAsk: () => setAidenAsk(null),
      close: () => setOverlay(null),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [newTabOpen, aidenStop, theme, aidenAsk, skips],
  );
  const close = api.close;
  return (
    <Ctx.Provider value={api}>
      {children}
      <AddToSpaceDialog
        open={overlay?.kind === 'add-to-space' || overlay?.kind === 'add-asset-to-space'}
        dashboardId={overlay?.kind === 'add-to-space' ? overlay.dashboardId : null}
        assetId={overlay?.kind === 'add-asset-to-space' ? overlay.assetId : null}
        onClose={close}
      />
      <AssetInfoDialog open={overlay?.kind === 'asset-info'} assetId={overlay?.kind === 'asset-info' ? overlay.assetId : null} onClose={close} />
      <DashboardInfoDialog
        open={overlay?.kind === 'dashboard-info'}
        dashboardId={overlay?.kind === 'dashboard-info' ? overlay.dashboardId : null}
        onClose={close}
      />
      <LeaveDialog
        target={leaving}
        onCancel={() => setLeaving(null)}
        onLeave={(t, remember) => {
          // Open first, inside the click, then close — or the browser blocks the tab.
          go(t);
          if (remember) setSkips((s) => (s.includes(t.dest) ? s : [...s, t.dest]));
          setLeaving(null);
        }}
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
