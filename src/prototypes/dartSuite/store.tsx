/* ── DART Suite prototype · the store ─────────────────────────────────────────
   One in-memory store for the whole suite, so the two halves of every loop are
   actually connected: a request filed on My Requests appears in the admin
   queue, an approval there changes the status the requester sees, a dashboard
   added to a space appears on that space and in the Builder.

   Screens read `state` and call the named actions below. For a change specific
   to one area, prefer `update(draft => …)` in that area's own file over adding
   an action here — this file is shared by every screen folder. */

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { BadgeAppearance, BadgeColor } from '../../components/Badge/Badge.types';
import {
  ACTIVITY,
  ADMINS,
  AIDEN_CHATS,
  BANNERS,
  DASHBOARDS,
  DEFAULT_WIDGETS,
  ME,
  PROMOTIONS,
  REDIRECTS,
  REQUESTS,
  SPACES,
} from './data';
import type {
  ActivityEntry,
  Admin,
  AdminScope,
  AdminWidget,
  AidenChat,
  Banner,
  Dashboard,
  Promotion,
  Redirect,
  Request,
  RequestStatus,
  Space,
  SpaceItem,
  ThreadEntry,
} from './types';

export type SuiteState = {
  requests: Request[];
  dashboards: Dashboard[];
  spaces: Space[];
  banners: Banner[];
  promotions: Promotion[];
  redirects: Redirect[];
  admins: Admin[];
  activity: ActivityEntry[];
  /** The admin overview's widget arrangement (per-admin; Admin Flow 1.2–1.6). */
  widgets: AdminWidget[];
  aidenChats: AidenChat[];
  /**
   * Who the prototype user is acting as. `null` = a requester with no admin
   * rights. Switched from the account menu so every sidebar variant in Figma
   * (Pattern/AppSidebar Admin=None/Overall/Sub/Application) can be reached.
   */
  adminScope: AdminScope | null;
};

const initial = (): SuiteState => ({
  requests: structuredClone(REQUESTS),
  dashboards: structuredClone(DASHBOARDS),
  spaces: structuredClone(SPACES),
  banners: structuredClone(BANNERS),
  promotions: structuredClone(PROMOTIONS),
  redirects: structuredClone(REDIRECTS),
  admins: structuredClone(ADMINS),
  activity: structuredClone(ACTIVITY),
  widgets: [...DEFAULT_WIDGETS],
  aidenChats: structuredClone(AIDEN_CHATS),
  adminScope: 'overall',
});

/** Today, in the MM/DD/YYYY the Figma screens use. */
export const today = () => {
  const n = new Date();
  return `${String(n.getMonth() + 1).padStart(2, '0')}/${String(n.getDate()).padStart(2, '0')}/${n.getFullYear()}`;
};

let seq = 432;
const nextRequestId = () => `#0${seq++}`;
const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 8)}`;

export type NewRequestInput = Pick<Request, 'type' | 'product' | 'title' | 'summary' | 'fields'> & {
  changes?: Request['changes'];
  assetId?: string;
};

type Actions = {
  /** Escape hatch for area-specific edits. The draft is a deep copy; return nothing. */
  update: (fn: (draft: SuiteState) => void) => void;
  setAdminScope: (scope: AdminScope | null) => void;

  // ── requests (requester side) ──
  submitRequest: (input: NewRequestInput) => Request;
  replyAsRequester: (id: string, text: string) => void;

  // ── requests (admin side) ──
  /** Approve records the decision only; nothing goes live (Admin Flow ②b). */
  approve: (id: string, note?: string) => void;
  deny: (id: string, reason: string) => void;
  replyAsAdmin: (id: string, text: string, close?: boolean) => void;
  close: (id: string) => void;
  /** Apply a staged edit — the only step that changes what users see. */
  applyRequest: (id: string) => void;
  markDuplicate: (id: string, backlogTitle: string) => void;
  setStatus: (id: string, status: RequestStatus) => void;

  // ── spaces ──
  addToSpaces: (dashboardId: string, spaceIds: string[]) => void;
  removeFromSpace: (spaceId: string, dashboardId: string) => void;
  setItemLayout: (spaceId: string, dashboardId: string, layout: SpaceItem['layout']) => void;
  /** Creates (no id) or overwrites a space. Returns the saved space. */
  saveSpace: (space: Omit<Space, 'id'> & { id?: string }) => Space;
  deleteSpace: (spaceId: string) => void;
  dismissSpaceBanner: (spaceId: string, bannerId: string) => void;

  // ── admin overview ──
  setWidgets: (widgets: AdminWidget[]) => void;
  logActivity: (action: string, target: string) => void;

  // ── Aiden ──
  saveChat: (chat: AidenChat) => void;
};

type Ctx = { state: SuiteState } & Actions;

const SuiteCtx = createContext<Ctx | null>(null);

export function SuiteProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SuiteState>(initial);

  const update = useCallback((fn: (d: SuiteState) => void) => {
    setState((prev) => {
      const draft = structuredClone(prev);
      fn(draft);
      return draft;
    });
  }, []);

  const actions = useMemo<Actions>(() => {
    const log = (d: SuiteState, who: string, action: string, target: string, product: Request['product'] = 'DARTBoards') =>
      d.activity.unshift({ id: uid('a'), at: `${today()} now`, who, action, target, product });
    const touch = (d: SuiteState, id: string, fn: (r: Request) => void) => {
      const r = d.requests.find((x) => x.id === id);
      if (r) {
        fn(r);
        r.updatedAt = today();
      }
    };
    const entry = (author: ThreadEntry['author'], name: string, text: string): ThreadEntry => ({
      id: uid('t'),
      author,
      name,
      at: today(),
      text,
    });

    return {
      update,
      setAdminScope: (scope) => update((d) => void (d.adminScope = scope)),

      submitRequest: (input) => {
        const req: Request = {
          ...input,
          id: nextRequestId(),
          requesterId: ME.id,
          submittedAt: today(),
          updatedAt: today(),
          status: 'new',
          thread: [entry('system', 'DART Central', 'Request submitted.')],
        };
        update((d) => {
          d.requests.unshift(req);
          log(d, ME.name, 'submitted', `${req.id} ${req.title}`, req.product);
        });
        return req;
      },
      replyAsRequester: (id, text) =>
        update((d) =>
          touch(d, id, (r) => {
            r.thread.push(entry('requester', ME.name, text));
            // Their answer hands it back to the admin, above the new ones.
            r.status = 'needs-review';
            log(d, ME.name, 'replied on', `${r.id} ${r.title}`, r.product);
          }),
        ),

      approve: (id, note) =>
        update((d) =>
          touch(d, id, (r) => {
            if (note) r.thread.push(entry('admin', ME.name, note));
            // Feature requests publish on approval — the one type with no apply step.
            const staged = r.type === 'dashboard-edit' || r.type === 'banner-edit' || r.type === 'banner' || r.type === 'dashboard-add';
            r.status = staged ? 'approved-not-applied' : 'approved';
            r.thread.push(entry('system', 'DART Central', staged ? 'Approved. Not applied yet.' : 'Approved.'));
            log(d, ME.name, 'approved', `${r.id} ${r.title}`, r.product);
          }),
        ),
      deny: (id, reason) =>
        update((d) =>
          touch(d, id, (r) => {
            r.status = 'denied';
            r.thread.push(entry('admin', ME.name, reason));
            log(d, ME.name, 'denied', `${r.id} ${r.title}`, r.product);
          }),
        ),
      replyAsAdmin: (id, text, close) =>
        update((d) =>
          touch(d, id, (r) => {
            r.thread.push(entry('admin', ME.name, text));
            r.status = close ? 'closed' : 'awaiting-reply';
            log(d, ME.name, close ? 'answered and closed' : 'asked a question on', `${r.id} ${r.title}`, r.product);
          }),
        ),
      close: (id) =>
        update((d) =>
          touch(d, id, (r) => {
            r.status = 'closed';
            r.thread.push(entry('system', 'DART Central', 'Closed without a reply.'));
            log(d, ME.name, 'closed', `${r.id} ${r.title}`, r.product);
          }),
        ),
      applyRequest: (id) =>
        update((d) =>
          touch(d, id, (r) => {
            r.status = 'applied';
            if (r.changes && r.assetId) {
              const dash = d.dashboards.find((x) => x.id === r.assetId);
              for (const c of r.changes) {
                if (!dash) break;
                if (c.field === 'Owner') dash.owner = c.proposed;
                if (c.field === 'Description') dash.description = c.proposed;
                if (c.field === 'Name') dash.name = c.proposed;
              }
            }
            r.thread.push(entry('system', 'DART Central', 'Changes applied.'));
            log(d, ME.name, 'applied', `${r.id} ${r.title}`, r.product);
          }),
        ),
      markDuplicate: (id, backlogTitle) =>
        update((d) =>
          touch(d, id, (r) => {
            r.status = 'closed';
            r.thread.push(entry('admin', ME.name, `This is already on the backlog: “${backlogTitle}”. Follow it there.`));
            log(d, ME.name, 'marked as duplicate', `${r.id} ${r.title}`, r.product);
          }),
        ),
      setStatus: (id, status) => update((d) => touch(d, id, (r) => void (r.status = status))),

      addToSpaces: (dashboardId, spaceIds) =>
        update((d) => {
          for (const s of d.spaces) {
            if (spaceIds.includes(s.id) && !s.items.some((i) => i.dashboardId === dashboardId)) {
              s.items.push({ dashboardId, layout: 'card' });
            }
          }
        }),
      removeFromSpace: (spaceId, dashboardId) =>
        update((d) => {
          const s = d.spaces.find((x) => x.id === spaceId);
          if (s) s.items = s.items.filter((i) => i.dashboardId !== dashboardId);
        }),
      setItemLayout: (spaceId, dashboardId, layout) =>
        update((d) => {
          const it = d.spaces.find((x) => x.id === spaceId)?.items.find((i) => i.dashboardId === dashboardId);
          if (it) it.layout = layout;
        }),
      saveSpace: (space) => {
        const saved: Space = { ...space, id: space.id ?? uid('space') };
        update((d) => {
          const i = d.spaces.findIndex((x) => x.id === saved.id);
          if (i >= 0) d.spaces[i] = saved;
          else d.spaces.push(saved);
        });
        return saved;
      },
      deleteSpace: (spaceId) => update((d) => void (d.spaces = d.spaces.filter((s) => s.id !== spaceId))),
      dismissSpaceBanner: (spaceId, bannerId) =>
        update((d) => {
          const s = d.spaces.find((x) => x.id === spaceId);
          if (s?.banners) s.banners = s.banners.filter((b) => b.id !== bannerId);
        }),

      setWidgets: (widgets) => update((d) => void (d.widgets = widgets)),
      logActivity: (action, target) => update((d) => log(d, ME.name, action, target)),

      saveChat: (chat) =>
        update((d) => {
          const i = d.aidenChats.findIndex((c) => c.id === chat.id);
          if (i >= 0) d.aidenChats[i] = chat;
          else d.aidenChats.unshift(chat);
        }),
    };
  }, [update]);

  const value = useMemo(() => ({ state, ...actions }), [state, actions]);
  return <SuiteCtx.Provider value={value}>{children}</SuiteCtx.Provider>;
}

export function useSuite() {
  const ctx = useContext(SuiteCtx);
  if (!ctx) throw new Error('useSuite must be used inside <SuiteProvider>');
  return ctx;
}

/* ── Status vocabulary ────────────────────────────────────────────────────────
   One request status, two audiences (Admin Flow ① READ FIRST). Never label a
   request with an asset word, or the reverse. */

export type Tone = 'default' | 'info' | 'success' | 'warning' | 'error' | 'neutral';

/** Tone → Badge props. `neutral` is an outline badge; everything else is soft. */
export const toneBadge = (t: Tone): { color: BadgeColor; appearance: BadgeAppearance } =>
  t === 'neutral' ? { color: 'default', appearance: 'outline' } : { color: t, appearance: 'soft' };

export const requesterStatus = (s: RequestStatus): { label: string; tone: Tone; group: 'reply' | 'review' | 'active' | 'done' } => {
  switch (s) {
    case 'awaiting-reply':
      return { label: 'Needs your reply', tone: 'warning', group: 'reply' };
    case 'new':
    case 'needs-review':
      return { label: 'Pending review', tone: 'info', group: 'review' };
    case 'approved':
    case 'approved-not-applied':
      return { label: 'Approved', tone: 'success', group: 'active' };
    case 'applied':
      return { label: 'Active', tone: 'success', group: 'active' };
    case 'denied':
      return { label: 'Rejected', tone: 'error', group: 'done' };
    case 'closed':
      return { label: 'Closed', tone: 'neutral', group: 'done' };
  }
};

export const adminStatus = (s: RequestStatus): { label: string; tone: Tone; active: boolean; rank: number } => {
  switch (s) {
    case 'needs-review':
      return { label: 'Needs review', tone: 'warning', active: true, rank: 0 };
    case 'new':
      return { label: 'New', tone: 'info', active: true, rank: 1 };
    case 'awaiting-reply':
      return { label: 'Awaiting reply', tone: 'neutral', active: true, rank: 2 };
    case 'approved-not-applied':
      return { label: 'Approved · not applied', tone: 'warning', active: false, rank: 3 };
    case 'approved':
    case 'applied':
      return { label: 'Approved', tone: 'success', active: false, rank: 4 };
    case 'denied':
      return { label: 'Denied', tone: 'error', active: false, rank: 5 };
    case 'closed':
      return { label: 'Closed', tone: 'neutral', active: false, rank: 6 };
  }
};

export const typeLabel: Record<Request['type'], string> = {
  'dashboard-add': 'Add Dashboard',
  'dashboard-edit': 'Edit Dashboard',
  'dashboard-promote': 'Promote Dashboard',
  'dashboard-remove': 'Remove Dashboard',
  banner: 'Banner / Notice',
  'banner-edit': 'Banner / Notice (edit)',
  general: 'General Request',
  feature: 'Feature Request',
};

/** Products the current admin scope may see (Admin Flow: an Aiden-only admin sees Aiden rows only). */
export const scopeProducts = (scope: AdminScope | null): Request['product'][] =>
  scope === 'application' ? ['Aiden'] : ['DART Central', 'DARTBoards', 'Aiden'];
