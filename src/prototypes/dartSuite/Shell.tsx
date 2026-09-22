/* ── DART Suite prototype · the shell ─────────────────────────────────────────
   AppShell as Pattern/AppShell draws it: the account cell, one tab strip shared
   by both applications, the AppRail, and a Sidebar that follows the ACTIVE
   tab's application (Pattern/AppSidebar, App = Dart Central | DartBoards).

   The admin group of the DART Central sidebar changes with the admin scope —
   Pattern/AppSidebar Admin = None | Overall | Sub | Application — and the
   scope is switched from the account menu so every variant can be reached. */

import {
  BarChart3,
  Box,
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
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import AppShell, { AppShellBody, AppShellMain, AppShellTabStrip, AppShellWorkspace } from '../../components/AppShell';
import AppRail, { AppRailItem } from '../../components/AppRail';
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
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '../../components/Sidebar';
import { Toaster } from '../../components/Toast';
import { ME } from './data';
import { useNav } from './nav';
import { scopeProducts, useSuite } from './store';
import type { SuiteState } from './store';
import { appOf } from './types';
import type { AdminScope, Route } from './types';
import { SuiteNewTab } from './newTab';
import { useUi } from './ui';
import { WHATS_NEW } from './screens/whatsNew/entries';

/* ── Tab titles and icons ─────────────────────────────────────────────────── */

export function tabMeta(route: Route, state: SuiteState): { label: string; Icon: LucideIcon } {
  switch (route.page) {
    case 'home':
      return { label: 'Home', Icon: Home };
    case 'my-requests':
      return { label: 'My Requests', Icon: Inbox };
    case 'request-detail':
      return { label: state.requests.find((r) => r.id === route.id)?.title ?? route.id, Icon: Inbox };
    case 'new-request':
    case 'request-form':
      return { label: 'New request', Icon: Plus };
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
      return { label: 'Browse', Icon: BarChart3 };
    case 'space':
      return { label: state.spaces.find((s) => s.id === route.id)?.name ?? 'Space', Icon: LayoutGrid };
    case 'shared':
      return { label: 'Shared with me', Icon: UsersRound };
    case 'builder':
      return {
        label: route.spaceId ? `Edit · ${state.spaces.find((s) => s.id === route.spaceId)?.name ?? 'space'}` : 'New space',
        Icon: LayoutGrid,
      };
    case 'dashboard':
      return { label: state.dashboards.find((d) => d.id === route.id)?.name ?? 'Dashboard', Icon: BarChart3 };
    case 'aiden-launcher':
      return { label: 'New tab', Icon: Sparkles };
    case 'aiden-chat':
      return { label: state.aidenChats.find((c) => c.id === route.chatId)?.title ?? 'Aiden', Icon: Sparkles };
  }
}

/* ── Sidebar items ────────────────────────────────────────────────────────── */

type NavItem = { label: string; Icon: LucideIcon; route: Route; badge?: number; match?: Route['page'][] };

function NavList({ items, current }: { items: NavItem[]; current: Route }) {
  const { go } = useNav();
  return (
    <SidebarMenu>
      {items.map(({ label, Icon, route, badge, match }) => {
        const active =
          (match ?? [route.page]).includes(current.page) &&
          (route.page !== 'space' || (current.page === 'space' && current.id === (route as { id: string }).id)) &&
          (route.page !== 'placeholder' || (current.page === 'placeholder' && current.title === (route as { title: string }).title));
        return (
          <SidebarMenuItem key={label}>
            <SidebarMenuButton isActive={active} onClick={() => go(route)}>
              <Icon />
              <span>{label}</span>
            </SidebarMenuButton>
            {badge ? <SidebarMenuBadge>{badge}</SidebarMenuBadge> : null}
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}

function CentralSidebar({ current }: { current: Route }) {
  const { state } = useSuite();
  const needsReply = state.requests.filter((r) => r.requesterId === ME.id && r.status === 'awaiting-reply').length;
  const scope = state.adminScope;
  const products = scopeProducts(scope);
  const pending = state.requests.filter((r) => products.includes(r.product) && (r.status === 'new' || r.status === 'needs-review')).length;

  const main: NavItem[] = [
    { label: 'Home', Icon: Home, route: { page: 'home' } },
    { label: 'My Requests', Icon: Inbox, route: { page: 'my-requests' }, badge: needsReply, match: ['my-requests', 'request-detail', 'new-request', 'request-form', 'request-submitted'] },
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
    { label: 'All', Icon: Store, route: { page: 'placeholder', title: 'Marketplace' } },
    { label: 'Dashboards', Icon: ChartColumn, route: { page: 'browse' }, match: ['browse', 'dashboard'] },
    { label: 'Reports', Icon: FileBarChart, route: { page: 'placeholder', title: 'Reports' } },
    { label: 'Metrics', Icon: Activity, route: { page: 'placeholder', title: 'Metrics' } },
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

/* ── Rail ─────────────────────────────────────────────────────────────────── */

const OTHER_APPS: { code: string; name: string; Icon: LucideIcon; count?: number }[] = [
  { code: 'irm', name: 'IRM', Icon: Box, count: 3 },
  { code: 'phoenix', name: 'Phoenix', Icon: Flame },
  { code: 'eclipse', name: 'Eclipse', Icon: Layers },
  { code: 'notegen', name: 'NoteGen', Icon: FileText },
];

/* ── The shell ────────────────────────────────────────────────────────────── */

const SCOPES: { value: string; label: string }[] = [
  { value: 'none', label: 'Requester (no admin rights)' },
  { value: 'overall', label: 'Overall admin' },
  { value: 'sub', label: 'Sub admin' },
  { value: 'application', label: 'Application admin (Aiden only)' },
];

export function Shell({ children, aiden }: { children: ReactNode; aiden?: ReactNode }) {
  const { state, setAdminScope } = useSuite();
  const nav = useNav();
  const { aidenStop, setAidenStop } = useUi();
  const app = appOf(nav.route);

  const item = (t: { id: string; route: Route }): TabBarMenuItem => ({ value: t.id, ...tabMeta(t.route, state), groupable: t.id !== 'home' });
  const setOf = (group: string | null) => nav.tabs.filter((t) => t.id !== 'home' && t.group === group).map(item);

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
                <Button id="ds-account" className="ui-app-shell__account" style="ghost" label={ME.name} IconRight={ChevronDown} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel>{ME.email}</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => nav.go({ page: 'placeholder', title: 'My profile' })}>
                  <CircleUser aria-hidden="true" />
                  My profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => nav.go({ page: 'placeholder', title: 'Settings' })}>
                  <Settings aria-hidden="true" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Prototype · act as</DropdownMenuLabel>
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
          /* Ask Aiden at the far end of the strip, beside the Fab (owner, 2026-09-22: keep both).
             The strip button opens the side panel; the Fab opens the mini window. */
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
                <TabBarTab key={t.id} value="home" label="Home" Icon={Home} iconOnly closable={false} />
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
              label="DARTBoards"
              Icon={LayoutDashboard}
              active={app === 'boards'}
              onClick={() => app !== 'boards' && nav.go({ page: 'browse' })}
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
              <SidebarContent>{app === 'boards' ? <BoardsSidebar current={nav.route} /> : <CentralSidebar current={nav.route} />}</SidebarContent>
            </Sidebar>
            <SidebarInset>
              <AppShellMain>{children}</AppShellMain>
            </SidebarInset>
          </AppShellWorkspace>
        </SidebarProvider>
      </AppShellBody>

      {aiden}
      <Toaster position="bottom-right" />
    </AppShell>
  );
}

