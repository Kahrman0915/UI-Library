/* ── DART Suite prototype · the shell ─────────────────────────────────────────
   AppShell as Pattern/AppShell draws it: the account cell, one tab strip shared
   by both applications, the AppRail, and a Sidebar that follows the ACTIVE
   tab's application (Pattern/AppSidebar, App = Dart Central | DartBoards).

   The admin group of the DART Central sidebar changes with the admin scope —
   Pattern/AppSidebar Admin = None | Overall | Sub | Application — and the
   scope is switched from the account menu so every variant can be reached. */

import {
  BarChart3,
  ChartColumn,
  ChevronDown,
  CircleHelp,
  CircleUser,
  Compass,
  FileText,
  Flame,
  Gauge,
  Home,
  Inbox,
  Layers,
  LayoutDashboard,
  LayoutGrid,
  Link2,
  ExternalLink,
  ListChecks,
  LogOut,
  Megaphone,
  Pin,
  Plus,
  Settings,
  ShieldCheck,
  Sparkles,
  Store,
  Activity,
  Users,
  UsersRound,
  FileBarChart,
  LineChart,
  Rocket,
  Kanban,
  ClipboardList,
  Plug,
  GitPullRequest,
  Database,
  ShieldAlert,
  ScrollText,
  Workflow,
  Star,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import AppShell, { AppShellBody, AppShellMain, AppShellTabStrip, AppShellWorkspace } from '../../components/AppShell';
import AppRail, { AppRailItem } from '../../components/AppRail';
import { APP_ICON } from './appIcons';
import TabBar, { TabBarList, TabBarMenu, TabBarNewGroupItem, TabBarTab } from '../../components/TabBar';
import type { TabBarMenuItem } from '../../components/TabBar';
import { ContextMenuItem, ContextMenuSeparator, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger } from '../../components/ContextMenu';
import Swatch from '../../components/Swatch';
import DropdownMenu, {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/DropdownMenu';
import Button from '../../components/Button';
import Tooltip, { TooltipContent, TooltipTrigger } from '../../components/Tooltip';
import { AidenSparkles } from '../AidenSparkles';
import ModeToggler from '../../components/ModeToggler';
import Sidebar, {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
} from '../../components/Sidebar';
import { Toaster, toast } from '../../components/Toast';
import Dialog, { DialogBody, DialogFooter, DialogHeader } from '../../components/Dialog';
import Input from '../../components/Input';
import { ME, PEOPLE } from './data';
import { useNav } from './nav';
import { scopeProducts, useSignedIn, useSuite } from './store';
import { IrmAnnouncer, NotificationsMenu, SimulateMenu } from './screens/irm';
import { AUDIENCE_LABEL, audienceOf, waitingOn } from './hub';
import { openItems } from './openItems';
import { ROLE_LABEL, recordName } from './irm';
import type { SuiteState } from './store';
import { appOf } from './types';
import type { AdminScope, Route } from './types';
import { SuiteNewTab } from './newTab';
import { THEMES, useUi } from './ui';
import type { ThemeCode } from './ui';
import { WHATS_NEW } from './screens/whatsNew/entries';
import { SIDEBAR_SECTIONS, orderedSections, suiteIcon } from './screens/boards/suite/suiteShared';

/* ── Tab titles and icons ─────────────────────────────────────────────────── */

export function tabMeta(route: Route, state: SuiteState): { label: string; Icon: LucideIcon } {
  switch (route.page) {
    case 'home':
      return { label: 'Home', Icon: Home };
    case 'my-requests':
      return { label: 'Open items', Icon: Inbox };
    case 'request-detail':
      return { label: state.requests.find((r) => r.id === route.id)?.title ?? route.id, Icon: Inbox };
    case 'new-request':
    case 'request-form':
      return { label: 'New request', Icon: Plus };
    case 'report-request':
      return { label: 'New request', Icon: Plus };
    case 'report-request-detail':
      return { label: route.id, Icon: Inbox };
    case 'request-submitted':
      return { label: 'Request submitted', Icon: Inbox };
    case 'whats-new':
      return { label: "What's New", Icon: Megaphone };
    case 'whats-new-story':
      return { label: WHATS_NEW.find((e) => e.id === route.id)?.title ?? "What's New", Icon: Megaphone };
    case 'placeholder':
      return { label: route.title, Icon: Compass };
    case 'admin-overview':
      return { label: 'Admin Overview', Icon: Gauge };
    case 'admin-queue':
      return { label: 'Approval queue', Icon: ListChecks };
    case 'admin-review':
    case 'admin-applied':
      return { label: `Review ${route.id}`, Icon: ListChecks };
    case 'admin-activity':
      return { label: 'Activity', Icon: Activity };
    case 'admin-dashboards':
      return { label: 'Dashboards', Icon: LayoutDashboard };
    case 'admin-banners':
      return { label: 'Banners', Icon: Megaphone };
    case 'admin-promotions':
      return { label: 'Promotions', Icon: Rocket };
    case 'admin-redirects':
      return { label: 'URL Redirects', Icon: Link2 };
    case 'admin-usage':
      return { label: 'Usage Analytics', Icon: LineChart };
    case 'admin-access':
      return { label: 'Access Control', Icon: ShieldCheck };
    case 'browse':
      return route.suite
        ? { label: state.suites.find((x) => x.id === route.suite)?.name ?? 'Suite', Icon: suiteIcon(route.suite) }
        : { label: 'Browse', Icon: BarChart3 };
    case 'marketplace':
      return { label: 'Marketplace', Icon: Store };
    case 'reports':
      return { label: 'Reports', Icon: FileBarChart };
    case 'metrics':
      return { label: 'Metrics', Icon: Activity };
    case 'metric':
      return { label: state.assets.find((a) => a.id === route.id)?.name ?? 'Metric', Icon: Activity };
    case 'report':
      // A report's page in DartBoards; the link icon says the report itself lives elsewhere.
      return { label: state.assets.find((a) => a.id === route.id)?.name ?? 'Report', Icon: ExternalLink };
    case 'space':
      return { label: state.spaces.find((s) => s.id === route.id)?.name ?? 'Space', Icon: LayoutGrid };
    case 'shared':
      return { label: 'Shared with me', Icon: UsersRound };
    case 'builder':
      return {
        label: route.spaceId ? `Edit · ${state.spaces.find((s) => s.id === route.spaceId)?.name ?? 'space'}` : 'New space',
        Icon: LayoutGrid,
      };
    case 'dashboard': {
      const d = state.dashboards.find((x) => x.id === route.id);
      // An external chart's tab is its DartBoards details page — the link icon says the chart itself lives elsewhere.
      return { label: d?.name ?? 'Dashboard', Icon: d?.external ? ExternalLink : BarChart3 };
    }
    case 'aiden-launcher':
      return { label: 'New tab', Icon: Sparkles };
    case 'aiden-chat':
      return { label: state.aidenChats.find((c) => c.id === route.chatId)?.title ?? 'Aiden', Icon: Sparkles };
    case 'irm-home':
      return { label: 'IRM', Icon: APP_ICON.irm };
    case 'irm-records':
      return { label: 'Inventory', Icon: Database };
    case 'irm-record':
      return { label: route.number, Icon: Database };
    case 'irm-changes':
      return { label: 'All requests', Icon: GitPullRequest };
    case 'irm-change':
      return { label: route.id, Icon: GitPullRequest };
    case 'irm-new-change':
      return { label: 'New IRM request', Icon: Plus };
    case 'irm-board':
      return { label: 'Team board', Icon: Kanban };
    case 'irm-activity':
      return { label: 'IRM activity', Icon: BarChart3 };
    case 'irm-governance':
      return { label: 'Governance', Icon: ShieldAlert };
    case 'irm-deployments':
      return { label: 'Deployments', Icon: Rocket };
    case 'irm-integrations':
      return { label: 'Integrations', Icon: Plug };
    case 'irm-audit':
      return { label: 'Audit log', Icon: ScrollText };
    case 'irm-workflows':
      return { label: 'Workflows', Icon: Workflow };
  }
}

/* ── Sidebar items ────────────────────────────────────────────────────────── */

/** `action` is a second door on the row — a "+" that starts something new from the place it belongs to. */
type NavItem = { label: string; Icon: LucideIcon; route: Route; badge?: number; match?: Route['page'][]; action?: { label: string; Icon: LucideIcon; route: Route } };

function NavList({ items, current: here }: { items: NavItem[]; current: Route }) {
  const { go, previous } = useNav();
  // A request belongs to the list it was opened from: from My work, My work stays lit, not All requests.
  const current = here.page === 'irm-change' && previous && previous.page.startsWith('irm-') && previous.page !== 'irm-change' ? previous : here;
  return (
    <SidebarMenu>
      {items.map(({ label, Icon, route, badge, match, action }) => {
        const active =
          (match ?? [route.page]).includes(current.page) &&
          (route.page !== 'space' || (current.page === 'space' && current.id === (route as { id: string }).id)) &&
          (route.page !== 'placeholder' || (current.page === 'placeholder' && current.title === (route as { title: string }).title)) &&
          (route.page !== 'irm-record' || (current.page === 'irm-record' && current.number === (route as { number: string }).number)) &&
          // A suite is Browse scoped down; its own sidebar item is the active one, not "Dashboards".
          !(route.page === 'browse' && current.page === 'browse' && current.suite);
        return (
          <SidebarMenuItem key={label}>
            <SidebarMenuButton isActive={active} onClick={() => go(route)}>
              <Icon />
              <span>{label}</span>
            </SidebarMenuButton>
            {badge ? <SidebarMenuBadge>{badge}</SidebarMenuBadge> : null}
            {action && (
              <Tooltip id={`ds-nav-${route.page}-action-tip`} side="right">
                <TooltipTrigger>
                  <SidebarMenuAction aria-label={action.label} onClick={() => go(action.route)}>
                    <action.Icon />
                  </SidebarMenuAction>
                </TooltipTrigger>
                <TooltipContent>{action.label}</TooltipContent>
              </Tooltip>
            )}
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}

function CentralSidebar({ current }: { current: Route }) {
  const { state } = useSuite();
  const { person } = useSignedIn();
  // Open items' badge is its "Needs you" count — the same number Home's Needs your attention shows.
  const needsYou = waitingOn(state, person.id).length;
  const scope = state.adminScope;
  const products = scopeProducts(scope);
  const pending = state.requests.filter((r) => products.includes(r.product) && (r.status === 'new' || r.status === 'needs-review')).length;

  const main: NavItem[] = [
    { label: 'Home', Icon: Home, route: { page: 'home' } },
    { label: 'Open items', Icon: Inbox, route: { page: 'my-requests' }, badge: needsYou, match: ['my-requests', 'request-detail', 'report-request-detail'] },
    // Starting something is its own row, not a button inside Open items: Open items is a to-do list across
    // every app now, so "New request" under it would be a door nobody looks for. Lit while you fill one in.
    { label: 'New request', Icon: Plus, route: { page: 'new-request' }, match: ['new-request', 'request-form', 'report-request', 'request-submitted'] },
  ];
  const discover: NavItem[] = [
    { label: "What's New", Icon: Megaphone, route: { page: 'whats-new' }, match: ['whats-new', 'whats-new-story'] },
    { label: 'Community', Icon: Users, route: { page: 'placeholder', title: 'Community' } },
  ];

  // Admin = Overall | Sub | Application — a FLAT list; items you cannot use are hidden, never regrouped.
  const adminAll: (NavItem & { scopes: AdminScope[] })[] = [
    { label: 'Overview', Icon: Gauge, route: { page: 'admin-overview' }, scopes: ['overall', 'sub', 'application'] },
    { label: 'Approval Queue', Icon: ListChecks, route: { page: 'admin-queue' }, badge: pending, match: ['admin-queue', 'admin-review', 'admin-applied'], scopes: ['overall', 'sub', 'application'] },
    { label: 'Activity', Icon: Activity, route: { page: 'admin-activity' }, scopes: ['overall', 'sub', 'application'] },
    { label: 'Dashboards', Icon: LayoutDashboard, route: { page: 'admin-dashboards' }, scopes: ['overall', 'sub'] },
    { label: 'Banners', Icon: Megaphone, route: { page: 'admin-banners' }, scopes: ['overall', 'sub', 'application'] },
    { label: 'Promotions', Icon: Rocket, route: { page: 'admin-promotions' }, scopes: ['overall', 'sub'] },
    { label: 'URL Redirects', Icon: Link2, route: { page: 'admin-redirects' }, scopes: ['overall', 'sub'] },
    { label: 'Usage Analytics', Icon: LineChart, route: { page: 'admin-usage' }, scopes: ['overall', 'sub'] },
    { label: 'Access Control', Icon: ShieldCheck, route: { page: 'admin-access' }, scopes: ['overall'] },
  ];
  const admin = scope ? adminAll.filter((i) => i.scopes.includes(scope)) : [];

  return (
    <>
      <SidebarGroup>
        <SidebarGroupContent>
          <NavList items={main} current={current} />
        </SidebarGroupContent>
      </SidebarGroup>
      <SidebarGroup>
        <SidebarGroupLabel>Discover</SidebarGroupLabel>
        <SidebarGroupContent>
          <NavList items={discover} current={current} />
        </SidebarGroupContent>
      </SidebarGroup>
      {admin.length > 0 && (
        <SidebarGroup>
          <SidebarGroupLabel>Admin</SidebarGroupLabel>
          <SidebarGroupContent>
            <NavList items={admin} current={current} />
          </SidebarGroupContent>
        </SidebarGroup>
      )}
      <SidebarGroup>
        <SidebarGroupContent>
          <NavList items={[{ label: 'Help', Icon: CircleHelp, route: { page: 'placeholder', title: 'Help' } }]} current={current} />
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  );
}

function BoardsSidebar({ current }: { current: Route }) {
  const { state } = useSuite();
  const own = state.spaces.filter((s) => !s.shared);
  const spaces: NavItem[] = [
    ...own.map((s) => ({ label: s.name, Icon: s.pinned ? Pin : LayoutGrid, route: { page: 'space', id: s.id } as Route })),
    { label: 'New space', Icon: Plus, route: { page: 'builder' }, match: [] },
    { label: 'Shared with me', Icon: UsersRound, route: { page: 'shared' } },
  ];
  const market: NavItem[] = [
    { label: 'All', Icon: Store, route: { page: 'marketplace' } },
    { label: 'Dashboards', Icon: ChartColumn, route: { page: 'browse' }, match: ['browse', 'dashboard'] },
    { label: 'Reports', Icon: FileBarChart, route: { page: 'reports' }, match: ['reports', 'report'] },
    { label: 'Metrics', Icon: Activity, route: { page: 'metrics' }, match: ['metrics', 'metric'] },
  ];
  // "New space" is active while the Builder is creating one.
  const creating = current.page === 'builder' && !current.spaceId;
  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>Spaces</SidebarGroupLabel>
        <SidebarGroupContent>
          <NavList items={spaces.map((s) => (s.label === 'New space' && creating ? { ...s, match: ['builder'] } : s))} current={current} />
        </SidebarGroupContent>
      </SidebarGroup>
      <SuitesGroup current={current} />
      <SidebarGroup>
        <SidebarGroupLabel>Marketplace</SidebarGroupLabel>
        <SidebarGroupContent>
          <NavList items={market} current={current} />
        </SidebarGroupContent>
      </SidebarGroup>
      <SidebarGroup>
        <SidebarGroupContent>
          <NavList items={[{ label: 'Help', Icon: CircleHelp, route: { page: 'placeholder', title: 'Help' } }]} current={current} />
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  );
}

/**
 * The suites you follow, in the ONE DartBoards sidebar. A team that built its
 * suite around its own left navigation gets that navigation here, one level
 * down: the suite is an item, and only the suite you are IN opens to show its
 * sections — so following five suites costs five rows, not five navigations.
 */
function SuitesGroup({ current }: { current: Route }) {
  const { state } = useSuite();
  const { go } = useNav();
  const followed = state.followedSuites.map((id) => state.suites.find((s) => s.id === id)).filter((s) => !!s);
  if (!followed.length) return null;
  const inSuite = current.page === 'browse' ? current.suite : undefined;
  const section = current.page === 'browse' ? current.section : undefined;
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Suites</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {followed.map((s) => {
            const Icon = suiteIcon(s.id);
            const open = inSuite === s.id;
            // A big suite shows its first few sections and a way to the rest; the one you are
            // in always shows, even past the cap, so the sidebar never loses your place.
            const ordered = orderedSections(s);
            const capped = ordered.length > SIDEBAR_SECTIONS;
            const rows = capped
              ? ordered.filter((sec, i) => i < SIDEBAR_SECTIONS - 1 || sec.id === section)
              : ordered;
            return (
              <SidebarMenuItem key={s.id}>
                <SidebarMenuButton isActive={open && !section} aria-expanded={open} onClick={() => go({ page: 'browse', suite: s.id })}>
                  <Icon />
                  <span>{s.name}</span>
                </SidebarMenuButton>
                {open && (
                  <SidebarMenuSub>
                    {rows.map((sec) => (
                      <SidebarMenuSubItem key={sec.id}>
                        <SidebarMenuSubButton
                          href="#"
                          isActive={section === sec.id}
                          aria-current={section === sec.id ? 'page' : undefined}
                          onClick={(e) => {
                            e.preventDefault();
                            go({ page: 'browse', suite: s.id, section: sec.id });
                          }}
                        >
                          <span>{sec.name}</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                    {capped && (
                      <SidebarMenuSubItem>
                        {/* Opens the section picker's home: the suite's overview, every section on one page. */}
                        <SidebarMenuSubButton
                          href="#"
                          className="ds-sidebar-more"
                          onClick={(e) => {
                            e.preventDefault();
                            go({ page: 'browse', suite: s.id });
                          }}
                        >
                          <span>All {ordered.length} sections</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    )}
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

/**
 * IRM's sidebar follows the signed-in person's ROLE — there is no switcher.
 * Each role's home is the first item; the shared screens follow; the
 * prototype's Simulate menu sits at the bottom.
 */
function IrmSidebar({ current }: { current: Route }) {
  const { state } = useSuite();
  const { person, role } = useSignedIn();
  const me = person.id;
  const active = state.irm.changes.filter((c) => c.status !== 'deployed' && c.status !== 'rejected' && c.status !== 'cancelled');
  const home: Record<typeof role, NavItem> = {
    // The badge is the page's own "Needs you" count, so the two numbers can never disagree.
    business: { label: 'My IRM', Icon: Home, route: { page: 'irm-home' }, badge: openItems(state, me).filter((m) => m.app === 'irm' && m.section === 'needs').length },
    developer: { label: 'My queue', Icon: ClipboardList, route: { page: 'irm-home' }, badge: active.filter((c) => c.assigneeId === me).length },
    'dev-manager': { label: 'Team board', Icon: Kanban, route: { page: 'irm-home' }, match: ['irm-home', 'irm-board'], badge: active.filter((c) => !c.assigneeId && c.status === 'ready').length },
    governance: {
      label: 'Governance',
      Icon: ShieldAlert,
      route: { page: 'irm-home' },
      match: ['irm-home', 'irm-governance'],
      // What needs governance now — the evidence the page opens on, and Home's count — not the evergreen backlog.
      badge: openItems(state, me).filter((m) => m.app === 'irm' && m.section === 'needs').length,
    },
    'prod-support': { label: 'Deployments', Icon: Rocket, route: { page: 'irm-home' }, match: ['irm-home', 'irm-deployments'], badge: active.filter((c) => c.status === 'awaiting-deployment' && !c.deployerId).length },
  };
  const work: NavItem[] = [
    home[role],
    ...(role === 'dev-manager' ? [{ label: 'Month over month', Icon: BarChart3, route: { page: 'irm-activity' } } as NavItem] : []),
  ];
  const favorites: NavItem[] = (state.irmFavorites[me] ?? [])
    .map((n) => state.irm.records.find((r) => r.number === n))
    .filter((r): r is NonNullable<typeof r> => !!r)
    .map((r) => ({ label: recordName(r), Icon: Star, route: { page: 'irm-record', number: r.number } as Route }));
  const shared: NavItem[] = [
    // Everyone's IRM requests — "All", so it is never mistaken for Open items or My IRM (yours).
    { label: 'All requests', Icon: GitPullRequest, route: { page: 'irm-changes' }, match: ['irm-changes', 'irm-change'] },
    // A visible row, like DART Central's New request and DartBoards' New space — it was a "+" that only
    // showed on hover, which nobody finds. "New IRM request", not "New request": DART Central's New request
    // is the chooser across every app, and this one goes straight to IRM's own form.
    { label: 'New IRM request', Icon: Plus, route: { page: 'irm-new-change' } },
    { label: 'Inventory', Icon: Database, route: { page: 'irm-records' }, match: ['irm-records', 'irm-record'] },
    ...(role === 'governance' ? [{ label: 'Activity', Icon: BarChart3, route: { page: 'irm-activity' } } as NavItem] : []),
    { label: 'Workflows', Icon: Workflow, route: { page: 'irm-workflows' } },
    ...(role === 'governance' ? [{ label: 'Audit log', Icon: ScrollText, route: { page: 'irm-audit' } } as NavItem] : []),
    { label: 'Integrations', Icon: Plug, route: { page: 'irm-integrations' } },
  ];
  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>{ROLE_LABEL[role]}</SidebarGroupLabel>
        <SidebarGroupContent>
          <NavList items={work} current={current} />
        </SidebarGroupContent>
      </SidebarGroup>
      {/* No "IRM" label: the rail already says which application this is. */}
      <SidebarGroup>
        <SidebarGroupContent>
          <NavList items={shared} current={current} />
        </SidebarGroupContent>
      </SidebarGroup>
      {/* The reports this person starred in the inventory, one click from anywhere in IRM. */}
      {favorites.length > 0 && (
        <SidebarGroup>
          <SidebarGroupLabel>Favorites</SidebarGroupLabel>
          <SidebarGroupContent>
            <NavList items={favorites} current={current} />
          </SidebarGroupContent>
        </SidebarGroup>
      )}
      <SidebarGroup>
        <SidebarGroupLabel>Prototype</SidebarGroupLabel>
        <SidebarGroupContent>
          <SimulateMenu />
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  );
}

/* ── Rail ─────────────────────────────────────────────────────────────────── */

const OTHER_APPS: { code: string; name: string; Icon: LucideIcon; count?: number }[] = [
  { code: 'phoenix', name: 'Phoenix', Icon: Flame },
  { code: 'eclipse', name: 'Eclipse', Icon: Layers },
  { code: 'notegen', name: 'NoteGen', Icon: FileText },
];

/* ── The shell ────────────────────────────────────────────────────────────── */

/** One seed person per IRM role — the personas the prototype can sign in as. */
const PERSONAS = [ME.id, 'u-tb', 'u-jm', 'u-ar', 'u-np', 'u-oh', 'u-cb'].map((id) => PEOPLE.find((p) => p.id === id) ?? ME);

const SCOPES: { value: string; label: string }[] = [
  { value: 'none', label: 'Requester (no admin rights)' },
  { value: 'overall', label: 'Overall admin' },
  { value: 'sub', label: 'Sub admin' },
  { value: 'application', label: 'Application admin (Aiden only)' },
];

export function Shell({ children, aiden }: { children: ReactNode; aiden?: ReactNode }) {
  const { state, setAdminScope, update, saveTabSet } = useSuite();
  const nav = useNav();
  const { aidenStop, setAidenStop, theme, setTheme, leaveNotices, setLeaveNotices } = useUi();
  const app = appOf(nav.route);
  const { person } = useSignedIn();

  const item = (t: { id: string; route: Route }): TabBarMenuItem => ({ value: t.id, ...tabMeta(t.route, state), groupable: t.id !== 'home' });
  const setOf = (group: string | null) => nav.tabs.filter((t) => t.id !== 'home' && t.group === group).map(item);

  /* Save the tabs in the bar — the group on screen, or the loose tabs — to reopen in one click from a quick
     action on Home. Saving under a name that already exists updates that set. */
  const [savingTabs, setSavingTabs] = useState<string | null>(null);
  const shownGroup = nav.groups.find((g) => g.id === nav.activeGroup);
  const shownRoutes = nav.visibleTabs.filter((t) => t.id !== 'home').map((t) => t.route);
  const saveShownTabs = () => {
    const name = (savingTabs ?? '').trim();
    if (!name) return;
    const existing = (state.tabSets[person.id] ?? []).find((x) => x.name.toLowerCase() === name.toLowerCase());
    saveTabSet(person.id, { id: existing?.id ?? `ts-${Date.now().toString(36)}`, name, color: shownGroup?.color ?? 'blue', routes: shownRoutes });
    setSavingTabs(null);
    toast.success(`${existing ? 'Updated' : 'Saved'} “${name}”`, { description: `${shownRoutes.length} tabs. Add it to a Quick actions widget on Home to reopen them all in one click.` });
  };

  // Right-click on a tab: move it to another group, or start a new one with it.
  const tabMenu = (tabId: string) => {
    const targets = nav.groups.filter((g) => g.id !== nav.activeGroup);
    return (
      <>
        <ContextMenuSub>
          <ContextMenuSubTrigger>Add to group</ContextMenuSubTrigger>
          <ContextMenuSubContent>
            {targets.map((g) => (
              <ContextMenuItem key={g.id} onClick={() => nav.moveToGroup(tabId, g.id)}>
                <Swatch color={g.color} size="sm" />
                {g.label}
              </ContextMenuItem>
            ))}
            {targets.length > 0 && <ContextMenuSeparator />}
            <TabBarNewGroupItem tabs={[tabId]} />
          </ContextMenuSubContent>
        </ContextMenuSub>
        {nav.activeGroup !== null && <ContextMenuItem onClick={() => nav.moveToGroup(tabId, null)}>Remove from group</ContextMenuItem>}
        <ContextMenuItem onClick={() => setSavingTabs(shownGroup?.label ?? '')}>Save these tabs…</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          onClick={() => {
            nav.markTabBarUsed();
            nav.closeTab(tabId);
          }}
        >
          Close tab
        </ContextMenuItem>
      </>
    );
  };

  return (
    <AppShell id="ds">
      <AppShellTabStrip
        logo={
          <>
            <Button
              id="ds-home"
              style="ghost"
              size="sm"
              iconOnly
              IconCenter={() => <LayoutGrid size={16} aria-hidden="true" />}
              aria-label="DART Central home"
              onClick={() => nav.activate('home')}
            />
            <DropdownMenu id="ds-account-menu">
              <DropdownMenuTrigger>
                <Button id="ds-account" className="ui-app-shell__account" style="ghost" label={person.name} IconRight={ChevronDown} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel>{person.email}</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => nav.go({ page: 'placeholder', title: 'My profile' })}>
                  <CircleUser aria-hidden="true" />
                  My profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => nav.go({ page: 'placeholder', title: 'Settings' })}>
                  <Settings aria-hidden="true" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {/* One theme for the whole suite, chosen by the user (not one per application). */}
                <DropdownMenuLabel>Theme</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={theme} onValueChange={(v) => setTheme(v as ThemeCode)}>
                  {THEMES.map((t) => (
                    <DropdownMenuRadioItem key={t.value} value={t.value}>
                      <span className="ds-theme-dot" data-theme={t.value} aria-hidden="true" />
                      {t.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
                {/* Brings back every "opens in a new tab" message the user ticked away. */}
                <DropdownMenuCheckboxItem checked={leaveNotices} onCheckedChange={(on) => setLeaveNotices(!!on)}>
                  Explain links that open a new tab
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                {/* Prototype only: who is signed in. In IRM the person's role decides the views — the real app has no switch. */}
                <DropdownMenuLabel>Prototype · sign in as</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={person.id}
                  onValueChange={(id) =>
                    update((d) => {
                      d.userId = id;
                    })
                  }
                >
                  {PERSONAS.map((p) => (
                    <DropdownMenuRadioItem key={p.id} value={p.id}>
                      {p.name} · {AUDIENCE_LABEL[audienceOf(state, p.id)]}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Prototype · DART Central admin rights</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={state.adminScope ?? 'none'}
                  onValueChange={(v) => setAdminScope(v === 'none' ? null : (v as AdminScope))}
                >
                  {SCOPES.map((s) => (
                    <DropdownMenuRadioItem key={s.value} value={s.value}>
                      {s.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => nav.go({ page: 'placeholder', title: 'Help' })}>
                  <CircleHelp aria-hidden="true" />
                  Help
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={() => nav.go({ page: 'placeholder', title: 'Signed out' })}>
                  <LogOut aria-hidden="true" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        }
        actions={
          <>
            <NotificationsMenu />
            {/* Ask Aiden at the far end of the strip, beside the Fab (owner, 2026-09-22: keep both).
               The strip button opens the side panel; the Fab opens the mini window. */}
            <Tooltip id="ds-ask-aiden-tooltip" side="bottom">
              <TooltipTrigger>
                <Button
                  id="ds-ask-aiden"
                  style="ghost"
                  size="sm"
                  iconOnly
                  IconCenter={() => <AidenSparkles size={16} gradient />}
                  aria-label={aidenStop === 'panel' ? 'Close Aiden' : 'Ask Aiden'}
                  aria-expanded={aidenStop === 'panel'}
                  aria-controls={aidenStop === 'panel' ? 'ds-aiden-panel' : undefined}
                  onClick={() => setAidenStop((s) => (s === 'panel' ? 'closed' : 'panel'))}
                />
              </TooltipTrigger>
              <TooltipContent>{aidenStop === 'panel' ? 'Close Aiden' : 'Ask Aiden'}</TooltipContent>
            </Tooltip>
          </>
        }
      >
        <TabBar
          id="ds-tabs"
          value={nav.activeId}
          onValueChange={(v) => {
            nav.markTabBarUsed();
            nav.activate(v);
          }}
        >
          <TabBarList aria-label="Open documents">
            {/* One set at a time: groups are switched from the tab menu, never drawn in the bar. */}
            {nav.visibleTabs.map((t) => {
              const { label, Icon } = tabMeta(t.route, state);
              return t.id === 'home' ? (
                // Home is pinned (never closable), and says "Home" rather than leaving the icon to say it (owner, 2026-10-06).
                <TabBarTab key={t.id} value="home" label="Home" Icon={Home} closable={false} className="ds-tab-home" />
              ) : (
                <TabBarTab
                  key={t.id}
                  value={t.id}
                  label={label}
                  Icon={Icon}
                  onClose={() => {
                    nav.markTabBarUsed();
                    nav.closeTab(t.id);
                  }}
                  menu={tabMenu(t.id)}
                />
              );
            })}
          </TabBarList>
          <SuiteNewTab />
          <TabBarMenu
            tabs={nav.visibleTabs.map(item)}
            recentlyClosed={nav.closed.slice(0, 5).map((c) => ({ ...tabMeta(c.route, state), value: c.key }))}
            onReopen={(i) => {
              nav.markTabBarUsed();
              nav.reopen(i.value);
            }}
            groups={nav.groups.map((g) => ({ value: g.id, label: g.label, color: g.color, tabs: setOf(g.id) }))}
            activeGroup={nav.activeGroup}
            onSelectGroup={(g) => {
              nav.markTabBarUsed();
              nav.selectGroup(g);
            }}
            ungroupedTabs={setOf(null)}
            onOpenTab={(tab, g) => {
              nav.markTabBarUsed();
              nav.openTabIn(tab, g);
            }}
            onCreateGroup={nav.createGroup}
            onRecolorGroup={nav.recolorGroup}
            onRenameGroup={nav.renameGroup}
            onUngroup={nav.ungroup}
            onDeleteGroup={nav.deleteGroup}
          />
        </TabBar>
      </AppShellTabStrip>

      <AppShellBody>
        <SidebarProvider>
          <AppRail header={<SidebarTrigger />} footer={<ModeToggler id="ds-mode" variant="ghost" size="sm" />}>
            <AppRailItem
              id="ds-rail-boards"
              label="DartBoards"
              Icon={APP_ICON.boards}
              active={app === 'boards'}
              onClick={() => app !== 'boards' && nav.openApp({ page: 'browse' })}
            />
            <AppRailItem
              id="ds-rail-irm"
              label="IRM"
              Icon={APP_ICON.irm}
              active={app === 'irm'}
              onClick={() => app !== 'irm' && nav.openApp({ page: 'irm-home' })}
            />
            {OTHER_APPS.map(({ code, name, Icon, count }) => (
              <AppRailItem
                key={code}
                id={`ds-rail-${code}`}
                label={name}
                Icon={Icon}
                count={count}
                onClick={() => nav.go({ page: 'placeholder', title: name })}
              />
            ))}
          </AppRail>

          <AppShellWorkspace>
            <Sidebar>
              <SidebarContent>
                {app === 'boards' ? <BoardsSidebar current={nav.route} /> : app === 'irm' ? <IrmSidebar current={nav.route} /> : <CentralSidebar current={nav.route} />}
              </SidebarContent>
            </Sidebar>
            <SidebarInset>
              <AppShellMain>{children}</AppShellMain>
            </SidebarInset>
          </AppShellWorkspace>
        </SidebarProvider>
      </AppShellBody>

      {aiden}
      <IrmAnnouncer />
      <Toaster position="bottom-right" />
      <Dialog id="ds-save-tabs" open={savingTabs !== null} onClose={() => setSavingTabs(null)}>
        <DialogHeader
          id="ds-save-tabs-header"
          title="Save these tabs"
          description={`The ${shownRoutes.length} ${shownRoutes.length === 1 ? 'tab' : 'tabs'} open${shownGroup ? ` in ${shownGroup.label}` : ''}. Add the set to a Quick actions widget on Home to reopen them all in one click.`}
          onClose={() => setSavingTabs(null)}
        />
        <DialogBody>
          <form
            id="ds-save-tabs-form"
            onSubmit={(e) => {
              e.preventDefault();
              saveShownTabs();
            }}
          >
            <Input id="ds-save-tabs-name" label="Name" placeholder="e.g. Monday review" value={savingTabs ?? ''} onValueChange={setSavingTabs} autoFocus />
          </form>
        </DialogBody>
        <DialogFooter>
          <Button id="ds-save-tabs-cancel" style="ghost" label="Cancel" onClick={() => setSavingTabs(null)} />
          <Button id="ds-save-tabs-save" label="Save tabs" disabled={!(savingTabs ?? '').trim() || !shownRoutes.length} onClick={saveShownTabs} />
        </DialogFooter>
      </Dialog>
    </AppShell>
  );
}

