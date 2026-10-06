/* DART Central · Home — the quick actions a person can put on their home.

   Grouped by the application each one belongs to, so a person can build an
   "IRM actions" widget and park it beside their IRM reports, or one widget of
   the shortcuts they use everywhere. A quick-actions widget holds the ids of the
   actions its owner picked, in the order they picked them. */

import type { LucideIcon } from 'lucide-react';
import {
  Bug,
  ClipboardCheck,
  FilePlus2,
  FileX2,
  KanbanSquare,
  LayoutGrid,
  ListChecks,
  Megaphone,
  PenLine,
  Plus,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
  Store,
  Users,
} from 'lucide-react';
import type { Audience } from '../../hub';
import { reportRequestRoute } from '../../hub';
import type { Route } from '../../types';

export type QuickApp = 'central' | 'boards' | 'irm' | 'aiden' | 'admin';
export const QUICK_APPS: { id: QuickApp; label: string }[] = [
  { id: 'central', label: 'DART Central' },
  { id: 'boards', label: 'DartBoards' },
  { id: 'irm', label: 'IRM' },
  { id: 'aiden', label: 'Aiden' },
  { id: 'admin', label: 'Admin' },
];

export type QuickAction = {
  id: string;
  label: string;
  /** One line in the picker: what pressing it does. */
  hint: string;
  app: QuickApp;
  Icon: LucideIcon;
  route: (audience: Audience) => Route;
  /** Only these people can add it (absent = everyone). */
  for?: Audience[];
  /** Admins only. */
  admin?: boolean;
};

const IRM_ROLES: Audience[] = ['developer', 'dev-manager', 'governance', 'prod-support'];

export const QUICK_ACTIONS: QuickAction[] = [
  { id: 'new-request', label: 'New request', hint: 'Ask any team', app: 'central', Icon: Plus, route: () => ({ page: 'new-request' }) },
  { id: 'my-requests', label: 'Open items', hint: 'Everything open, every app', app: 'central', Icon: ListChecks, route: () => ({ page: 'my-requests' }) },
  { id: 'whats-new', label: 'What’s new', hint: 'The latest releases', app: 'central', Icon: Megaphone, route: () => ({ page: 'whats-new' }) },

  { id: 'browse', label: 'Browse dashboards', hint: 'Find a dashboard', app: 'boards', Icon: Search, route: () => ({ page: 'browse' }) },
  { id: 'new-space', label: 'New space', hint: 'Dashboards on one page', app: 'boards', Icon: LayoutGrid, route: () => ({ page: 'builder' }) },
  { id: 'marketplace', label: 'Marketplace', hint: 'Dashboards and metrics', app: 'boards', Icon: Store, route: () => ({ page: 'marketplace' }) },
  { id: 'publish', label: 'List a dashboard', hint: 'Publish a finished report', app: 'boards', Icon: FilePlus2, route: () => ({ page: 'request-form', kind: 'dashboard', mode: 'add' }) },

  { id: 'irm-new', label: 'New IRM request', hint: 'Ask for a new report', app: 'irm', Icon: FilePlus2, route: (a) => reportRequestRoute(a, 'new') },
  { id: 'irm-break', label: 'Report a break', hint: 'A report is wrong', app: 'irm', Icon: Bug, route: (a) => reportRequestRoute(a, 'break') },
  { id: 'irm-change', label: 'Change a report', hint: 'Ask for a modification', app: 'irm', Icon: PenLine, route: (a) => reportRequestRoute(a, 'modification') },
  { id: 'irm-retire', label: 'Retire a report', hint: 'Decommission a report', app: 'irm', Icon: FileX2, route: (a) => reportRequestRoute(a, 'decommission'), for: ['owner', ...IRM_ROLES] },
  { id: 'irm-inventory', label: 'IRM inventory', hint: 'Reports and controls', app: 'irm', Icon: ClipboardCheck, route: () => ({ page: 'irm-records' }) },
  { id: 'irm-board', label: 'Team board', hint: 'Assign and move work', app: 'irm', Icon: KanbanSquare, route: () => ({ page: 'irm-board' }), for: ['dev-manager', 'developer'] },
  { id: 'irm-deploys', label: 'Deployments', hint: 'What’s waiting to ship', app: 'irm', Icon: Rocket, route: () => ({ page: 'irm-deployments' }), for: ['prod-support', 'dev-manager'] },
  { id: 'irm-governance', label: 'Governance', hint: 'Evidence and SLAs', app: 'irm', Icon: ShieldCheck, route: () => ({ page: 'irm-governance' }), for: ['governance'] },

  { id: 'aiden', label: 'Ask Aiden', hint: 'Start a conversation', app: 'aiden', Icon: Sparkles, route: () => ({ page: 'aiden-launcher' }) },

  { id: 'admin-queue', label: 'Approval queue', hint: 'Waiting on an admin', app: 'admin', Icon: ListChecks, route: () => ({ page: 'admin-queue' }), admin: true },
  { id: 'admin-access', label: 'Access control', hint: 'Who can do what', app: 'admin', Icon: Users, route: () => ({ page: 'admin-access' }), admin: true },
];

export const quickAction = (id: string) => QUICK_ACTIONS.find((a) => a.id === id);

/**
 * A saved set of tabs as a quick action: `tabset:<id>`. One click reopens every tab in it, as a tab group
 * of the same name (nav.openTabSet). Sets are the person's own (store `tabSets`), saved from any tab's
 * right-click menu › Save these tabs…, so they are looked up at render rather than listed here.
 */
export const TAB_SET_PREFIX = 'tabset:';
export const isTabSetAction = (id: string) => id.startsWith(TAB_SET_PREFIX);
export const tabSetActionId = (setId: string) => `${TAB_SET_PREFIX}${setId}`;

/** The actions this person can add. */
export const availableActions = (audience: Audience, isAdmin: boolean) => QUICK_ACTIONS.filter((a) => (!a.for || a.for.includes(audience)) && (!a.admin || isAdmin));

/** A quick-actions widget is named for its application when every action in it comes from one. */
export const quickTitle = (ids: string[]) => {
  const apps = [...new Set(ids.map((id) => quickAction(id)?.app).filter(Boolean))];
  if (apps.length !== 1) return 'Quick actions';
  return `${QUICK_APPS.find((a) => a.id === apps[0])!.label} actions`;
};

/** How many actions fit each size: Small holds two, Medium four, Large eight. */
export const QUICK_CAPACITY = { S: 2, M: 4, L: 8, W: 8, XL: 8 } as const;

/** A starting set for a role, used when a quick-actions widget is first added. */
export const defaultActions = (audience: Audience): string[] =>
  audience === 'owner' ? ['irm-new', 'irm-break'] : audience === 'reader' ? ['new-request', 'browse'] : audience === 'governance' ? ['irm-governance', 'irm-inventory'] : ['irm-new', 'irm-inventory'];
