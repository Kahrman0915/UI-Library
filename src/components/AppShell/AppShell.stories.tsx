import type { Meta, StoryObj } from '@storybook/react';
import { BarChart3, Bell, Box, ChartColumn, FileText, Flame, Grid2x2, Home, Inbox, Layers, LayoutGrid, ListChecks, Plus, Search, Settings, Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import AppShell, { AppShellTabStrip, AppShellBody, AppShellWorkspace, AppShellMain } from './AppShell';
import AppRail, { AppRailItem } from '../AppRail';
import TabBar, { TabBarGroup, TabBarList, TabBarTab, TabBarNewTab, TabBarMenu, TabBarSplit } from '../TabBar';
import SplitView, { SplitViewPane } from '../SplitView';
import { ContextMenuItem, ContextMenuSeparator } from '../ContextMenu';
import { useTabLayout } from '../../hooks/useTabLayout';
import type { TabLayoutItem } from '../../hooks/useTabLayout';
import Sidebar, { SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from '../Sidebar';
import Tooltip, { TooltipContent, TooltipTrigger } from '../Tooltip';
import Button from '../Button';
import Avatar from '../Avatar';
import ModeToggler from '../ModeToggler';
import Badge from '../Badge';
import Input from '../Input';
import PageContainer from '../PageContainer';
import type { PageContainerWidth } from '../PageContainer';
import PageHeader from '../PageHeader';
import Section from '../Section';
import Stack from '../Stack';
import Card, { CardHeader } from '../Card';
import type { UiDocsParameters } from '../../types/DocsTypes';

const meta: Meta<typeof AppShell> = {
  title: 'Components/AppShell',
  component: AppShell,
  subcomponents: { AppShellTabStrip, AppShellBody, AppShellWorkspace, AppShellMain },
  parameters: {
    layout: 'fullscreen',
    ui: {
      description:
        'The chrome every sub-application shares, as structure rather than advice: a tab strip (logo · `TabBar` · actions), ' +
        'then `AppRail` · `Sidebar` · `AppShellMain`. The strip\'s `actions` hold Ask Aiden alone — the assistant\'s place in every ' +
        'application; tab search lives in the `TabBar` itself (`TabBarMenu`). Strip 48, rail 52, sidebar 252, so Main Content is 1136 wide at the 1440 ' +
        'design viewport and 1616 at 1920 — the width every flow screen is drawn at. A page fills Main with a `PageContainer` and ' +
        'never re-derives the geometry. `AppRail` is its own component, composed here like `Sidebar` and `TabBar`; the shell has no ' +
        'brand prop and reads the scope it stands in.',
      tags: ['layout', 'chrome', 'shell'],
      usage: {
        when: ['Every application in the suite. One `AppShell` at the root, in a `100dvh` box; `AppShellWorkspace` holds the `SidebarProvider`.'],
        avoid: ['Hand-rolling the strip, the rail or the workspace — the workspace\'s `contain: layout` and the SidebarProvider height override are the parts that took a phase to get right.'],
        notes: 'The Aiden mounting contract (`Fab` at `--z-80`, `AidenPanel` at `--z-40`, Fab hidden while a surface is open) is composed by the app for now; see the DART Central prototype.',
      },
      changelog: [
        {
          date: '2026-09-15',
          summary: 'The tab bar fills the strip, and the story shows an icon-only Home tab, a tab group and a split view.',
          detail:
            '`.ui-app-shell__tabs > .ui-tab-bar` now takes `flex: 1`, so the tab menu sits at the far end of the strip rather than right after the "+". Story: Home is `iconOnly`; My Requests and Approval queue are a `TabBarGroup`; two dashboards are a `TabBarSplit`, and Main holds a `SplitView` that shows both while either is selected. The layout runs on `useTabLayout` and is saved.',
        },
        {
          date: '2026-09-15',
          summary: 'The strip joins the rail and sidebar on one surface, the logo carries the application name, and Ask Aiden is a quiet icon button.',
          detail:
            'The strip paints `--sidebar` with a `--sidebar-border` rule, so the strip, rail and sidebar read as one frame around the page. `__logo` no longer takes the rail\'s width: it hugs the logo and the wordmark (`padding-inline: --p-2 --p-5`). Rail 48 → 52 and sidebar 256 → 252 via the tokens, so Main Content stays 1136 / 1616. `AppShellWorkspace` now sets `overflow: clip`: an offcanvas collapse parks the panel at minus the sidebar width from the workspace, so without the clip it slid out over the rail and past the window edge.\n\n' +
            'Story: the wordmark sits beside the logo; Ask Aiden is a ghost icon-only `Button` with a tooltip; the sidebar hides when collapsed (offcanvas — the rail is the collapsed view); the sidebar header is a plain "Home" title.',
        },
        { date: '2026-09-07', summary: 'Initial build. The shared application chrome as a component.', detail: 'AppShell · AppShellTabStrip · AppShellBody · AppShellWorkspace · AppShellMain; composes `AppRail`, `TabBar` and `Sidebar`. Geometry from the Figma App Shell proof; `--app-rail-width` and `--app-strip-height` tokens. docs/skill-and-shell-plan.md Phase 1.' }],
    } satisfies UiDocsParameters,
  },
};
export default meta;
type Story = StoryObj<typeof AppShell>;

const APPS = [
  { code: 'db', name: 'DART Central', Icon: LayoutGrid, active: true },
  { code: 'dc', name: 'IRM', Icon: Box, count: 3 },
  { code: 'ph', name: 'Phoenix', Icon: Flame },
  { code: 'ec', name: 'Eclipse', Icon: Layers },
  { code: 'nb', name: 'NoteGen', Icon: FileText },
  { code: 'rm', name: 'DARTBoards', Icon: Grid2x2 },
];
const NAV: Array<{ label: string; Icon: typeof Home; active?: boolean; count?: number }> = [
  { label: 'Home', Icon: Home },
  { label: 'My Requests', Icon: Inbox, active: true },
  { label: "What's New", Icon: Bell, count: 3 },
  { label: 'Settings', Icon: Settings },
];

const Row = ({ id, title, description }: { id: string; title: string; description: string }) => (
  <Card id={id}>
    <CardHeader id={`${id}-header`} title={title} description={description} action={<Badge id={`${id}-badge`} color="info" label="Pending review" />} />
  </Card>
);

type Doc = { label: string; Icon: LucideIcon; closable?: boolean };
const DOCS: Record<string, Doc> = {
  home: { label: 'Home', Icon: Home, closable: false },
  requests: { label: 'My Requests', Icon: Inbox },
  queue: { label: 'Approval queue', Icon: ListChecks },
  volume: { label: 'Originations volume', Icon: BarChart3 },
  pipeline: { label: 'Pipeline health', Icon: ChartColumn },
  'whats-new': { label: "What's New", Icon: Bell },
};

/** My Requests is the real page; the other tabs open a titled placeholder. */
function Page({ value, width }: { value: string; width: PageContainerWidth }) {
  if (value !== 'requests') {
    return (
      <PageContainer width={width}>
        <PageHeader id={`page-${value}`} title={DOCS[value].label} description="An open document in the workspace." />
      </PageContainer>
    );
  }
  return (
    <PageContainer width={width}>
      <PageHeader
        id="my-requests"
        title="My Requests"
        description="Submit requests to the DART Central admin team and track their status."
        actions={<Button id="new-request" label="New request" IconLeft={Plus} />}
        toolbar={<Input id="search-requests" placeholder="Search requests by name or reference number…" aria-label="Search requests" IconLeft={Search} />}
      />
      <Stack level={2}>
        <Section id="g-review" heading="In review" variant="group">
          <Stack level={3}>
            <Row id="r417" title="Add Originations Daily Volume to the library" description="Request to add the Originations Daily Volume dashboard to the Dartboards library." />
            <Row id="r425" title="Let me pin a dashboard to the top of Browse" description="A pin control on each dashboard card that keeps my most-used boards at the top." />
          </Stack>
        </Section>
        <Section id="g-active" heading="Active" variant="group">
          <Stack level={3}>
            <Row id="r412" title="Promote Collateral Health Dashboard" description="Highlighted on the browse page, 08/25/2026 – 10/31/2026." />
          </Stack>
        </Section>
      </Stack>
    </PageContainer>
  );
}

function Shell({ width }: { width: PageContainerWidth }) {
  const layout = useTabLayout({
    storageKey: 'ui-lib-stories-app-shell-tabs',
    initial: {
      tabs: ['home', 'requests', 'queue', 'volume', 'pipeline', 'whats-new'],
      active: 'requests',
      groups: [{ id: 'requests-group', label: 'Requests', color: 'blue', collapsed: false }],
      groupOf: { requests: 'requests-group', queue: 'requests-group' },
      split: ['volume', 'pipeline'],
    },
  });
  const { state } = layout;
  const closed = Object.keys(DOCS).filter((v) => !state.tabs.includes(v));

  const tabMenu = (value: string) => (
    <>
      {state.split?.includes(value) ? (
        <ContextMenuItem onClick={layout.unsplit}>Close split view</ContextMenuItem>
      ) : (
        state.active &&
        state.active !== value && (
          <ContextMenuItem onClick={() => layout.split(value, 'end', state.active!)}>Open beside {DOCS[state.active].label}</ContextMenuItem>
        )
      )}
      {state.groupOf[value] ? (
        <ContextMenuItem onClick={() => layout.removeFromGroup(value)}>Remove from group</ContextMenuItem>
      ) : (
        <ContextMenuItem onClick={() => layout.addToGroup(value, 'requests-group')}>Add to Requests</ContextMenuItem>
      )}
      {DOCS[value].closable !== false && (
        <>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={() => layout.close(value)}>Close tab</ContextMenuItem>
        </>
      )}
    </>
  );

  const renderTab = (value: string) => (
    <TabBarTab
      key={value}
      value={value}
      label={DOCS[value].label}
      Icon={DOCS[value].Icon}
      iconOnly={value === 'home'}
      closable={DOCS[value].closable !== false}
      onClose={() => layout.close(value)}
      menu={tabMenu(value)}
    />
  );
  const renderItem = (item: TabLayoutItem) =>
    item.type === 'tab' ? (
      renderTab(item.value)
    ) : (
      <TabBarSplit key={item.values.join('+')}>
        {renderTab(item.values[0])}
        {renderTab(item.values[1])}
      </TabBarSplit>
    );

  const panes = state.split && state.active && state.split.includes(state.active) ? state.split : state.active ? [state.active] : [];

  return (
    <AppShell id="shell">
      <AppShellTabStrip
        logo={
          <>
            <Button id="shell-home" style="ghost" iconOnly IconCenter={() => <LayoutGrid size={16} aria-hidden="true" />} aria-label="DART Central home" />
            <span style={{ fontSize: 'var(--text-base)', lineHeight: 'var(--leading-6)', fontWeight: 'var(--font-medium)', color: 'var(--foreground)', whiteSpace: 'nowrap' }}>
              Dart Central
            </span>
          </>
        }
        actions={
          <Tooltip id="shell-aiden-tooltip" side="bottom">
            <TooltipTrigger>
              <Button id="shell-aiden" variant="default" style="ghost" iconOnly IconCenter={() => <Sparkles size={20} aria-hidden="true" />} aria-label="Ask Aiden" />
            </TooltipTrigger>
            <TooltipContent>Ask Aiden</TooltipContent>
          </Tooltip>
        }
      >
        <TabBar id="shell-tabs" value={state.active ?? undefined} onValueChange={layout.select} onTabMove={layout.move}>
          <TabBarList aria-label="Open documents">
            {layout.segments.map((seg) =>
              seg.type === 'group' ? (
                <TabBarGroup
                  key={seg.group.id}
                  value={seg.group.id}
                  label={seg.group.label}
                  color={seg.group.color}
                  collapsed={seg.group.collapsed}
                  onCollapsedChange={(collapsed) => layout.updateGroup(seg.group.id, { collapsed })}
                  menu={
                    <>
                      <ContextMenuItem onClick={() => layout.ungroup(seg.group.id)}>Ungroup</ContextMenuItem>
                      <ContextMenuItem variant="destructive" onClick={() => layout.closeGroup(seg.group.id)}>
                        Close group
                      </ContextMenuItem>
                    </>
                  }
                >
                  {seg.items.map(renderItem)}
                </TabBarGroup>
              ) : (
                renderItem(seg)
              ),
            )}
          </TabBarList>
          <TabBarNewTab onClick={() => closed[0] && layout.open(closed[0])} disabled={closed.length === 0} />
          <TabBarMenu
            tabs={state.tabs.map((v) => ({ value: v, label: DOCS[v].label, Icon: DOCS[v].Icon }))}
            recentlyClosed={closed.map((v) => ({ value: v, label: DOCS[v].label, Icon: DOCS[v].Icon }))}
            onReopen={(item) => layout.open(item.value)}
          />
        </TabBar>
      </AppShellTabStrip>

      <AppShellBody>
        <SidebarProvider>
          <AppRail
            header={<SidebarTrigger />}
            footer={
              <>
                <ModeToggler id="shell-mode" variant="ghost" size="sm" />
                <Avatar id="shell-me" fallback="KM" alt="Kahrman McKenzie" size="sm" />
              </>
            }
          >
            {APPS.map(({ code, name, Icon, active, count }) => (
              <AppRailItem key={code} id={`shell-app-${code}`} href={`/${code}`} label={name} Icon={Icon} active={active} count={count} />
            ))}
          </AppRail>

          <AppShellWorkspace>
            {/* Offcanvas (the default): collapsing hides the sidebar and the rail is the collapsed view. */}
            <Sidebar>
              <SidebarHeader>
                <span style={{ fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-5)', fontWeight: 'var(--font-semibold)', color: 'var(--sidebar-foreground)' }}>Home</span>
              </SidebarHeader>
              <SidebarContent>
                <SidebarGroup>
                  <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {NAV.map(({ label, Icon, active, count }) => (
                        <SidebarMenuItem key={label}>
                          <SidebarMenuButton isActive={active}>
                            <Icon />
                            <span>{label}</span>
                          </SidebarMenuButton>
                          {count ? <SidebarMenuBadge>{count}</SidebarMenuBadge> : null}
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </SidebarContent>
            </Sidebar>
            <SidebarInset>
              <AppShellMain>
                <SplitView id="shell-split" onTabDrop={({ value, side }) => layout.split(value, side)}>
                  {panes.map((v) => (
                    <SplitViewPane
                      key={v}
                      aria-label={DOCS[v].label}
                      active={v === state.active}
                      onPointerDown={() => v !== state.active && layout.select(v)}
                    >
                      <Page value={v} width={width} />
                    </SplitViewPane>
                  ))}
                </SplitView>
              </AppShellMain>
            </SidebarInset>
          </AppShellWorkspace>
        </SidebarProvider>
      </AppShellBody>
    </AppShell>
  );
}

/** The shell with a real page in Main Content: PageContainer › PageHeader › Stack › Section › Card. */
export const Playground: Story = {
  render: () => (
    <div data-theme="db" style={{ height: '100vh' }}>
      <Shell width="narrow" />
    </div>
  ),
};

/** A table page wants the whole content window: `PageContainer width="full"`. */
export const FullWidthPage: Story = {
  render: () => (
    <div data-theme="db" style={{ height: '100vh' }}>
      <Shell width="full" />
    </div>
  ),
};
