/* ── DART Suite prototype · shared overlays ───────────────────────────────────
   Overlays that more than one screen opens live here, so every screen opens
   them the same way and gets the same component:

   - The tab bar's "+" palette (also opened from the Home search card). Only
     its open state lives here; the palette itself is `newTab.tsx`, rendered in
     the tab bar.
   - Add to space (Browse, Dashboard, Builder)  → Browse B4.1–B4.5, Pattern/AddToSpace
   - Dashboard info (Browse, Space)             → Browse B2.1–B2.2, Pattern/DashboardInfo
   - How to get access (Dashboard, Space)       → Dashboard D2.3
   - Aiden's stop (closed / mini / panel). Two controls open Aiden — the Fab
     and the Ask Aiden button at the far end of the tab strip — so which stop
     is showing lives here, not in AidenHost.

   The dialog components themselves live with the screens that own them; this
   file only holds which one is open. */

import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { AddToSpaceDialog } from './screens/boards/shared/AddToSpaceDialog';
import { DashboardInfoDialog } from './screens/boards/shared/DashboardInfoDialog';
import { GetAccessDialog } from './screens/boards/shared/GetAccessDialog';

type Overlay =
  | { kind: 'add-to-space'; dashboardId: string }
  | { kind: 'dashboard-info'; dashboardId: string }
  | { kind: 'get-access'; dashboardId: string }
  | null;

export type AidenStop = 'closed' | 'mini' | 'panel';

type UiCtx = {
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
  const api = useMemo<UiCtx>(
    () => ({
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
    [newTabOpen, aidenStop],
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
