/* ── DART Suite prototype · the store ─────────────────────────────────────────
   One in-memory store for the whole suite, so the two halves of every loop are
   actually connected: a request filed on My Requests appears in the admin
   queue, an approval there changes the status the requester sees, a dashboard
   added to a space appears on that space and in the Builder.

   Screens read `state` and call the named actions below. For a change specific
   to one area, prefer `update(draft => …)` in that area's own file over adding
   an action here — this file is shared by every screen folder. */

import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { BadgeAppearance, BadgeColor } from '../../components/Badge/Badge.types';
import type { ChartPalette } from '../../charts';
import type { CategoryColor } from '../../types/GlobalTypes';
import {
  ACTIVITY,
  ADMINS,
  AIDEN_CHATS,
  ASSETS,
  BANNERS,
  COLLECTIONS_DASHBOARDS,
  DASHBOARDS,
  DEFAULT_WIDGETS,
  FOLLOWED_SUITES,
  ME,
  PEOPLE,
  PROMOTIONS,
  REDIRECTS,
  REQUESTS,
  SPACES,
  SUITES,
} from './data';
import type {
  ActivityEntry,
  Admin,
  AdminScope,
  AdminWidget,
  HomeTile,
  BentoSize,
  AidenChat,
  Asset,
  Banner,
  Dashboard,
  NativeFilters,
  Promotion,
  Redirect,
  Request,
  RequestStatus,
  Route,
  Space,
  SpaceItem,
  Suite,
  ThreadEntry,
} from './types';
import { seedIrm } from './irm';
import type { IrmState } from './irm';
import { notify, reconcile } from './irmEngine';

/** A person's inventory table: which columns, in what order, sorted how, filtered to what. */
export type InventoryView = {
  columns: string[];
  sort: { key: string; dir: 'asc' | 'desc' } | null;
  /** Column key → the values kept (any of them matches). */
  filters: Record<string, string[]>;
  /** Only the reports the person starred. */
  favoritesOnly?: boolean;
  /** The saved view this one was opened from, if any — so the page can say which, and whether it was edited. */
  savedId?: string;
};

/** A view a person named and kept, to come back to. */
export type SavedView<V> = { id: string; name: string; view: V };
export type SavedInventoryView = SavedView<InventoryView>;

/** A person's IRM requests list: which types, open or closed, sorted how. */
export type RequestView = {
  type: 'all' | 'new' | 'break' | 'modification' | 'decommission';
  phase: 'active' | 'closed' | 'all';
  sort: { key: 'priority' | 'age' | 'opened'; dir: 'asc' | 'desc' } | null;
  /** Which columns show, in order (`ChangeColumn` keys). Absent = the default set. */
  columns?: string[];
  savedId?: string;
};

export type SuiteState = {
  requests: Request[];
  dashboards: Dashboard[];
  spaces: Space[];
  /** Metrics, workflows and reports — what a space can hold besides dashboards. */
  assets: Asset[];
  /** Team-curated suites of library dashboards (Browse scoped to one). */
  suites: Suite[];
  /** Suite ids this user follows — shown in the DartBoards sidebar. Toggle with `update`. */
  followedSuites: string[];
  /** Per suite: the filters its native dashboards share. Absent = DEFAULT_NATIVE_FILTERS. Set with `update`. */
  suiteFilters: Record<string, NativeFilters>;
  banners: Banner[];
  promotions: Promotion[];
  redirects: Redirect[];
  admins: Admin[];
  activity: ActivityEntry[];
  /** The admin overview's widget arrangement (per-admin; Admin Flow 1.2–1.6). */
  widgets: AdminWidget[];
  /** Each person's DART Central Home, as they arranged it. Absent = their role's default. */
  homeLayouts: Record<string, HomeTile[]>;
  /** What each person chose to show in Home's Today strip (ids from `TODAY_METRICS`). Absent = their role's default. */
  homeToday: Record<string, string[]>;
  /** IRM records each person starred, by IRM number. */
  irmFavorites: Record<string, string[]>;
  /** Tabs each person saved to reopen in one click (a quick action on Home). */
  tabSets: Record<string, TabSet[]>;
  /** How each person set up IRM's inventory table: columns, sort, filters. Absent = the default view. */
  irmInventoryView: Record<string, InventoryView>;
  /** The inventory views each person named and saved. */
  irmSavedViews: Record<string, SavedInventoryView[]>;
  /** The requests list as each person last left it, and the views they named. */
  irmRequestView: Record<string, RequestView>;
  irmSavedRequestViews: Record<string, SavedView<RequestView>[]>;
  /** Admin Overview widget sizes the admin changed; absent = the widget's default. */
  widgetSizes: Partial<Record<AdminWidget, BentoSize>>;
  aidenChats: AidenChat[];
  /**
   * Who the prototype user is acting as. `null` = a requester with no admin
   * rights. Switched from the account menu so every sidebar variant in Figma
   * (Pattern/AppSidebar Admin=None/Overall/Sub/Application) can be reached.
   */
  adminScope: AdminScope | null;
  /**
   * Per-chart colour, keyed by chart id. Absent = the chart follows the user's
   * theme, which is the default and what most charts stay on.
   *
   * It lives in the SHARED state, not in the user's own settings, because the
   * colour is how people refer to a chart ("the magenta one"). A per-viewer
   * colour would make that reference mean different things to different readers.
   */
  chartPalettes: Record<string, ChartPalette>;
  /** IRM — the system of record every DartBoards listing points at (irm.ts, irmEngine.ts). */
  irm: IrmState;
  /**
   * Who is signed in. The rest of DART Central still acts as ME; IRM reads this,
   * because IRM's views follow the person's IRM ROLE and there is no switcher —
   * each persona is a different person (one Storybook story each).
   */
  userId: string;
};

const initial = (userId: string = ME.id): SuiteState => {
  // The Collections suite's 42 are ordinary library dashboards too.
  const dashboards = structuredClone([...DASHBOARDS, ...COLLECTIONS_DASHBOARDS]);
  // Every listing gets its IRM record (and its `irm` number) before anything reads them.
  const irm = seedIrm(dashboards);
  const state: SuiteState = {
  requests: structuredClone(REQUESTS),
  dashboards,
  // A space with no owner is the main user's — the seed was written for them.
  spaces: structuredClone(SPACES).map((s) => ({ ...s, ownerId: s.ownerId ?? ME.id })),
  assets: structuredClone(ASSETS),
  suites: structuredClone(SUITES),
  followedSuites: [...FOLLOWED_SUITES],
  suiteFilters: {},
  banners: structuredClone(BANNERS),
  promotions: structuredClone(PROMOTIONS),
  redirects: structuredClone(REDIRECTS),
  admins: structuredClone(ADMINS),
  activity: structuredClone(ACTIVITY),
  widgets: [...DEFAULT_WIDGETS],
  homeLayouts: {},
  homeToday: {},
  irmFavorites: {},
  // A sample saved set, so the one-click reopen can be tried without saving one first.
  tabSets: {
    'u-km': [{ id: 'ts-monday', name: 'Monday review', color: 'blue', routes: [{ page: 'my-requests' }, { page: 'space', id: 'weekly-ops' }, { page: 'irm-home' }] }],
  },
  irmInventoryView: {},
  irmSavedViews: {},
  irmRequestView: {},
  irmSavedRequestViews: {},
  widgetSizes: {},
  aidenChats: structuredClone(AIDEN_CHATS),
  adminScope: 'overall',
  // Section 5.5's "Views by product" ships magenta, so the prototype opens with
  // one chart already off the user's theme — the point of the feature on screen.
  chartPalettes: { 'ds-mu-by-product-chart': 'rm' },
  irm,
  userId,
  };
  // Project every listing from its record once, quietly — the seed is the starting truth, not news.
  reconcile(state, true);
  // Requests already waiting on their requester show in the bell from the start.
  for (const r of state.requests) if (r.status === 'awaiting-reply') tell(state, r, `Question on ${r.id}`, r.title);
  return state;
};

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
  /** Repaint one chart for everyone; `null` puts it back on the user's theme. */
  setChartPalette: (chartId: string, palette: ChartPalette | null) => void;

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
  /** `null` puts the person back on their role's default. */
  setHomeLayout: (personId: string, tiles: HomeTile[] | null) => void;
  /** `null` puts Today back on the role's default numbers. */
  setHomeToday: (personId: string, metrics: string[] | null) => void;
  toggleIrmFavorite: (personId: string, number: string) => void;
  /** Save a set of tabs to reopen in one click; a set with the same id is replaced. */
  saveTabSet: (personId: string, set: TabSet) => void;
  removeTabSet: (personId: string, id: string) => void;
  /** `null` puts the person back on the default inventory view. */
  setInventoryView: (personId: string, view: InventoryView | null) => void;
  setSavedInventoryViews: (personId: string, views: SavedInventoryView[]) => void;
  setRequestView: (personId: string, view: RequestView | null) => void;
  setSavedRequestViews: (personId: string, views: SavedView<RequestView>[]) => void;
  logActivity: (action: string, target: string) => void;

  // ── Aiden ──
  saveChat: (chat: AidenChat) => void;
};

type Ctx = { state: SuiteState } & Actions;

const SuiteCtx = createContext<Ctx | null>(null);

export function SuiteProvider({ children, signedInAs }: { children: ReactNode; signedInAs?: string }) {
  const [state, setState] = useState<SuiteState>(() => initial(signedInAs));

  const update = useCallback((fn: (d: SuiteState) => void) => {
    setState((prev) => {
      const draft = structuredClone(prev);
      fn(draft);
      return draft;
    });
  }, []);

  // The actions are memoized once; they read who is signed in through this ref.
  const userRef = useRef(state.userId);
  userRef.current = state.userId;
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
      setChartPalette: (chartId, palette) =>
        update((d) => {
          if (palette) d.chartPalettes[chartId] = palette;
          else delete d.chartPalettes[chartId];
        }),

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
            tell(d, r, `${r.id} approved`, r.title);
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
            tell(d, r, `${r.id} was not approved`, reason);
            r.thread.push(entry('admin', ME.name, reason));
            log(d, ME.name, 'denied', `${r.id} ${r.title}`, r.product);
          }),
        ),
      replyAsAdmin: (id, text, close) =>
        update((d) =>
          touch(d, id, (r) => {
            r.thread.push(entry('admin', ME.name, text));
            r.status = close ? 'closed' : 'awaiting-reply';
            tell(d, r, close ? `${r.id} answered and closed` : `Question on ${r.id}`, text);
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
            tell(d, r, `${r.id} is live`, `${r.title} — the change has been applied.`);
            if (r.changes && r.assetId) {
              const dash = d.dashboards.find((x) => x.id === r.assetId);
              for (const c of r.changes) {
                if (!dash) break;
                if (c.field === 'Owner') dash.owner = c.proposed;
                if (c.field === 'Description') dash.description = c.proposed;
                if (c.field === 'Name' || c.field === 'Display title') dash.name = c.proposed;
                if (c.field === 'Category') dash.category = c.proposed as Dashboard['category'];
                if (c.field === 'Tags') dash.tags = c.proposed.split(',').map((t) => t.trim()).filter(Boolean);
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
            if (spaceIds.includes(s.id) && !s.items.some((i) => i.dashboardId === dashboardId && !i.widgetId)) {
              s.items.push({ dashboardId, layout: 'card' });
            }
          }
        }),
      removeFromSpace: (spaceId, dashboardId) =>
        update((d) => {
          const s = d.spaces.find((x) => x.id === spaceId);
          // A single chart from the dashboard is a different item; it stays.
          if (s) s.items = s.items.filter((i) => i.dashboardId !== dashboardId || !!i.widgetId);
        }),
      setItemLayout: (spaceId, dashboardId, layout) =>
        update((d) => {
          const it = d.spaces.find((x) => x.id === spaceId)?.items.find((i) => i.dashboardId === dashboardId);
          if (it) it.layout = layout;
        }),
      saveSpace: (space) => {
        // A new space belongs to whoever is signed in; an existing one keeps its owner.
        const saved: Space = { ...space, id: space.id ?? uid('space'), ownerId: space.ownerId ?? userRef.current };
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
      setHomeLayout: (personId, tiles) =>
        update((d) => {
          if (tiles) d.homeLayouts[personId] = tiles;
          else delete d.homeLayouts[personId];
        }),
      saveTabSet: (personId, set) =>
        update((d) => {
          const list = (d.tabSets[personId] ?? []).filter((x) => x.id !== set.id);
          d.tabSets[personId] = [...list, set];
        }),
      removeTabSet: (personId, id) =>
        update((d) => {
          d.tabSets[personId] = (d.tabSets[personId] ?? []).filter((x) => x.id !== id);
        }),
      toggleIrmFavorite: (personId, number) =>
        update((d) => {
          const list = d.irmFavorites[personId] ?? [];
          d.irmFavorites[personId] = list.includes(number) ? list.filter((n) => n !== number) : [...list, number];
        }),
      setInventoryView: (personId, view) =>
        update((d) => {
          if (view) d.irmInventoryView[personId] = view;
          else delete d.irmInventoryView[personId];
        }),
      setSavedInventoryViews: (personId, views) => update((d) => void (d.irmSavedViews[personId] = views)),
      setRequestView: (personId, view) =>
        update((d) => {
          if (view) d.irmRequestView[personId] = view;
          else delete d.irmRequestView[personId];
        }),
      setSavedRequestViews: (personId, views) => update((d) => void (d.irmSavedRequestViews[personId] = views)),
      setHomeToday: (personId, metrics) =>
        update((d) => {
          if (metrics) d.homeToday[personId] = metrics;
          else delete d.homeToday[personId];
        }),
      logActivity: (action, target) => update((d) => log(d, ME.name, action, target)),

      saveChat: (chat) =>
        update((d) => {
          const i = d.aidenChats.findIndex((c) => c.id === chat.id);
          if (i >= 0) d.aidenChats[i] = chat;
          else d.aidenChats.unshift(chat);
        }),
    };
  }, [update]);

  // Every screen sees the signed-in person's spaces — their own, plus the ones shared
  // with them (marked `shared`). Writes go through `update` on the full list, so a
  // space nobody can see is never lost.
  const view = useMemo<SuiteState>(
    () => ({
      ...state,
      spaces: state.spaces
        .filter((s) => s.ownerId === state.userId || s.sharedWith?.includes(state.userId))
        .map((s) => ({ ...s, shared: s.ownerId !== state.userId })),
    }),
    [state],
  );
  const value = useMemo(() => ({ state: view, ...actions }), [view, actions]);
  return <SuiteCtx.Provider value={value}>{children}</SuiteCtx.Provider>;
}

/** The signed-in person. IRM's views follow their `irmRole`; absent = a business user. */
/**
 * Can a reader FIND this listing? Published and not retiring: IRM's notice
 * period hides a listing from Browse, the Marketplace and the Builder while
 * keeping it reachable by link and from the spaces it already sits on.
 */
export const discoverable = (d: Dashboard) => d.lifecycle === 'published' && !d.retiring;

/** A DART Central request changed: the requester hears about it in the suite's one bell. */
function tell(d: SuiteState, r: Request, title: string, body: string) {
  notify(d, {
    key: `req:${r.id}:${r.thread.length}:${title}`,
    personId: r.requesterId,
    kind: 'request-update',
    app: r.type.startsWith('dashboard') ? 'DartBoards' : 'DART Central',
    title,
    body,
    route: { page: 'request-detail', id: r.id },
  });
}

export function useSignedIn() {
  const { state } = useSuite();
  const person = PEOPLE.find((p) => p.id === state.userId) ?? ME;
  return { person, role: person.irmRole ?? 'business' } as const;
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

/** A saved set of tabs: reopened in one click as a tab group of the same name (a quick action on Home). */
export type TabSet = { id: string; name: string; color: CategoryColor; routes: Route[] };

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
  'dashboard-add': 'Publish to DartBoards',
  'dashboard-edit': 'Update DartBoards listing',
  'dashboard-promote': 'Promote Dashboard',
  'dashboard-remove': 'Unpublish from DartBoards',
  banner: 'Banner / Notice',
  'banner-edit': 'Banner / Notice (edit)',
  general: 'General Request',
  feature: 'Feature Request',
};

/** Products the current admin scope may see (Admin Flow: an Aiden-only admin sees Aiden rows only). */
export const scopeProducts = (scope: AdminScope | null): Request['product'][] =>
  scope === 'application' ? ['Aiden'] : ['DART Central', 'DARTBoards', 'Aiden'];
