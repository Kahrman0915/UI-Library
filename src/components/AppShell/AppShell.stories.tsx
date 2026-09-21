import type { Meta, StoryObj } from '@storybook/react';
import { useEffect, useState } from 'react';
import { BarChart3, Bell, Box, ChartColumn, ChevronDown, CircleHelp, CircleUser, FileText, Flame, LayoutDashboard, LayoutGrid, Home, Inbox, Layers, ListChecks, LogOut, Plus, Search, Settings } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import AppShell, { AppShellTabStrip, AppShellBody, AppShellWorkspace, AppShellMain } from './AppShell';
import AppRail, { AppRailItem } from '../AppRail';
import TabBar, { TabBarList, TabBarTab, TabBarNewTabMenu, TabBarMenu, TabBarNewGroupItem, TabBarSplit } from '../TabBar';
import SplitView, { SplitViewPane } from '../SplitView';
import { ContextMenuItem, ContextMenuSeparator, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger } from '../ContextMenu';
import Swatch from '../Swatch';
import { useTabLayout } from '../../hooks/useTabLayout';
import type { TabBarMenuProps, TabBarNewTabCategory, TabBarNewTabItem } from '../TabBar/TabBar.types';
import { WINDOW, isNewTab, newTabValue, useTabSets } from '../../prototypes/tabSets';
import type { TabSet, TabSetGroup, TabSets } from '../../prototypes/tabSets';
import type { TabLayoutItem } from '../../hooks/useTabLayout';
import Sidebar, { SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarInset, SidebarMenu, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from '../Sidebar';
import DropdownMenu, { DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../DropdownMenu';
import Fab from '../Fab';
import Button from '../Button';
import ModeToggler from '../ModeToggler';
import Badge from '../Badge';
import Input from '../Input';
import PageContainer from '../PageContainer';
import type { PageContainerWidth } from '../PageContainer';
import PageHeader from '../PageHeader';
import Section from '../Section';
import Stack from '../Stack';
import Card, { CardHeader } from '../Card';
import Drawer, { DrawerHeader, DrawerBody, DrawerFooter } from '../Drawer';
import { Toaster, toast } from '../Toast';
import type { UiDocsParameters } from '../../types/DocsTypes';
import { AidenSparkles } from '../../prototypes/AidenSparkles';

const meta: Meta<typeof AppShell> = {
  title: 'Components/AppShell',
  component: AppShell,
  subcomponents: { AppShellTabStrip, AppShellBody, AppShellWorkspace, AppShellMain },
  parameters: {
    layout: 'fullscreen',
    ui: {
      description:
        'The chrome every sub-application shares, as structure rather than advice: a tab strip (the account cell · `TabBar`), ' +
        'then `AppRail` · `Sidebar` · `AppShellMain`. The account cell is the DART Central mark and your name with its menu, 304 wide ' +
        'so the tabs start over the page; tab search and tab groups live in the `TabBar` itself (`TabBarMenu`), and Aiden is a `Fab` ' +
        'in the bottom-right corner. Strip 48, rail 52, sidebar 252, so Main Content is 1136 wide at the 1440 ' +
        'design viewport and 1616 at 1920 — the width every flow screen is drawn at. A page fills Main with a `PageContainer` and ' +
        'never re-derives the geometry. `AppRail` is its own component, composed here like `Sidebar` and `TabBar`; the shell has no ' +
        'brand prop and reads the scope it stands in.',
      tags: ['layout', 'chrome', 'shell'],
      usage: {
        when: ['Every application in the suite. One `AppShell` at the root, in a `100dvh` box; `AppShellWorkspace` holds the `SidebarProvider`.'],
        avoid: ['Hand-rolling the strip, the rail or the workspace — the workspace\'s `contain: layout` and the SidebarProvider height override are the parts that took a phase to get right.'],
        notes: 'The Aiden mounting contract (`Fab` at `--z-40`, below every overlay, and hidden while an `AidenPanel` is open) is composed by the app for now; see the DART Central prototype.',
      },
      changelog: [
        {
          date: '2026-09-21',
          summary: 'The slash between the home mark and your name is now a short straight line, drawn by the shell in line with the rail\'s right edge. The mark sits right above the rail\'s icons and your name lines up with the sidebar below it.',
          detail: '`.ui-app-shell__logo` is a two-column grid: the first column is `--app-rail-width`, with the mark centered in it, and the account button fills the second. The account button starts `--p-3` (12) in, where the sidebar\'s rows start, and its `--p-2` padding puts the name level with the sidebar\'s row icons; the cell keeps `--p-3` at the end to match. The divider is the cell\'s `::before`: 1px by `--h-4`, `--sidebar-border`, on the same pixel as the rail\'s right border (`--app-rail-width - --border-w-100`), so it reads as that border continuing into the strip. The first column is the rail\'s content box (width less the border), so the mark centers exactly over the rail\'s icons. Chosen upright from an angle study. **Apps no longer pass a divider**: remove any `Slash` or `.ui-app-shell__sep` from the `logo` slot (the class is gone) and pass exactly the mark and the account button.',
        },
        {
          date: '2026-09-21',
          summary: 'Every example on this page uses the same "+" and the same group button: the "+" opens the new-tab palette and the button at the far end switches tab groups.',
          detail: 'The Overlays story had a plain `TabBarNewTab` and no `TabBarMenu`. It now renders the shared `ShellNewTab` (the same `TabBarNewTabMenu` the Playground uses) and a `TabBarMenu` wired to the same `useTabSets` groups. No component change.',
        },
        {
          date: '2026-09-19',
          summary: 'A drawer opened in the shell starts below the tab strip, the Aiden button sits under it, and toasts stack above the Aiden button.',
          detail: '`AppShell` provides `DrawerBelowStripContext`, so any `Drawer` inside starts at `--app-strip-height` and covers the rail, sidebar and page. The Fab moved to `--z-40` and the Toaster lifts above a bottom-right Fab (see those components). New `Overlays` story.',
        },
        {
          date: '2026-09-19',
          summary: 'On a narrow window the sidebar slides out beside the rail instead of covering the whole screen.',
          detail: '`AppShellWorkspace` now provides the internal `SidebarContainedContext`. Below the 768px mobile breakpoint a `Sidebar` inside it no longer swaps to a portalled `Drawer` (which covered the rail and the tab strip); it stays in the workspace as an overlay, fully out or fully off-canvas, over a full-width page. The rail trigger, the sidebar trigger and ⌘B open it; Escape or a click on the page closes it.',
        },
        {
          date: '2026-09-19',
          summary: 'The shell no longer runs 48px past the bottom of the window when the sidebar provider also wraps the rail.',
          detail: 'The `SidebarProvider` height override only matched `AppShellWorkspace > .ui-sidebar-provider`, but the documented composition puts the provider directly in `AppShellBody` so a rail item can toggle the sidebar. There it kept its `min-height: 100svh` under the 48px strip (page 948 tall in a 900 window). `__body > .ui-sidebar-provider` now gets the same override.',
        },
        {
          date: '2026-09-19',
          summary: 'The strip follows Notion: your account top-left across the rail and sidebar, tabs over the page, Aiden as a Fab, and tab groups you switch between.',
          detail:
            '`__logo` is now the account cell, a fixed `--app-rail-width + --sidebar-width` (304) so the tabs start over Main. Supabase’s pattern: the DART Central mark (a ghost icon button home), a muted slash (`.ui-app-shell__sep`), then the user’s name and a chevron in a ghost `Button` (`className="ui-app-shell__account"`) that opens a `DropdownMenu` (profile, settings, help, sign out). No avatar — the name says it. The strip hairline is an inset shadow so the open tab can cover it and join the page. Ask Aiden left the strip — `actions` is empty and the `.ui-app-shell__aiden` hook is gone — for a `Fab` inside `data-surface="aiden"`. The rail footer keeps only the mode toggle (settings moved into the account menu), and the sidebar has no header — a small app name there is the recorded fallback if users lose track of which app they are in. Story: groups use the tab menu switcher (`TabBarMenu` `groups` / `groupLabel`); each set keeps its own saved layout.',
        },
        {
          date: '2026-09-18',
          summary: 'Ask Aiden is a small icon button at the same weight as the tab controls; on hover its icon turns Aiden blurple.',
          detail:
            'Story: the button is `size="sm"` (32px box, 16px glyph, 1.33 stroke), matching the tab menu and the "+"; at the default size the sparkle was 20px and 1.67 stroke and out-weighed them. New hook `.ui-app-shell__aiden`: on hover the glyph takes `--aiden-text`; the neutral ghost hover tile is unchanged. Add the class to the Ask Aiden button in `actions`.',
        },
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

const APPS: Array<{ code: string; name: string; Icon: typeof Box; active?: boolean; count?: number }> = [
  { code: 'db', name: 'DARTBoards', Icon: LayoutDashboard },
  { code: 'dc', name: 'IRM', Icon: Box, count: 3 },
  { code: 'ph', name: 'Phoenix', Icon: Flame },
  { code: 'ec', name: 'Eclipse', Icon: Layers },
  { code: 'nb', name: 'NoteGen', Icon: FileText },
];
const NAV: Array<{ label: string; Icon: typeof Home; active?: boolean; count?: number }> = [
  { label: 'Home', Icon: Home },
  { label: 'My Requests', Icon: Inbox, active: true },
  { label: "What's New", Icon: Bell, count: 3 },
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
  dashboards: { label: 'Dashboards', Icon: LayoutDashboard },
};
/* What the "+" menu offers, by category. */
const SHELL_CATEGORIES: TabBarNewTabCategory[] = [
  { value: 'requests', label: 'Requests' },
  { value: 'dashboards', label: 'Dashboards' },
  { value: 'news', label: 'News' },
];
const SHELL_PAGES: TabBarNewTabItem[] = [
  { value: 'requests', label: 'My Requests', Icon: Inbox, category: 'requests' },
  { value: 'queue', label: 'Approval queue', Icon: ListChecks, category: 'requests' },
  { value: 'volume', label: 'Originations volume', Icon: BarChart3, category: 'dashboards' },
  { value: 'pipeline', label: 'Pipeline health', Icon: ChartColumn, category: 'dashboards' },
  { value: 'whats-new', label: "What's New", Icon: Bell, category: 'news' },
];

/** The shell's "+": the same new-tab palette in every AppShell story. */
const ShellNewTab = ({ onOpen }: { onOpen: (value: string) => void }) => (
  <TabBarNewTabMenu
    items={SHELL_PAGES}
    categories={SHELL_CATEGORIES}
    recent={SHELL_PAGES.slice(0, 3).map((p, i) => ({ ...p, description: ['Opened today', 'Opened yesterday', '2 days ago'][i] }))}
    actions={[{ value: 'blank', label: 'New blank tab', Icon: Plus }]}
    onOpen={(item) => onOpen(item.value === 'blank' ? newTabValue() : item.value)}
  />
);

/** A catalog document, or a blank "New tab" the "+" opened. */
const docOf = (v: string): Doc => DOCS[v] ?? (isNewTab(v) ? { label: 'New tab', Icon: Plus } : { label: v, Icon: FileText });

/** My Requests is the real page; the other tabs open a titled placeholder. */
function Page({ value, width }: { value: string; width: PageContainerWidth }) {
  if (value !== 'requests') {
    return (
      <PageContainer width={width}>
        <PageHeader id={`page-${value}`} title={docOf(value).label} description="An open document in the workspace." />
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


/**
 * Tab groups, Notion's model: a group is a named set of tabs and the bar shows ONE set at a
 * time; the tab menu at the far end is the switcher. The model lives in
 * `prototypes/tabSets.tsx`, shared with the TabBar stories, so both pages run the same rules.
 */
const UNGROUPED = ['home', 'requests', 'queue', 'volume', 'pipeline', 'whats-new'];
const INITIAL_GROUPS: TabSetGroup[] = [
  { value: 'q3', label: 'Q3 Review', color: 'violet' },
  { value: 'onboarding', label: 'Onboarding', color: 'emerald' },
];
const INITIAL_SETS: Record<string, TabSet> = {
  [WINDOW]: { tabs: UNGROUPED, active: 'requests' },
  q3: { tabs: ['home', 'volume', 'pipeline'], active: 'volume' },
  onboarding: { tabs: ['home', 'whats-new', 'queue'], active: 'whats-new' },
};

function Shell({ width }: { width: PageContainerWidth }) {
  const sets = useTabSets({
    groups: INITIAL_GROUPS,
    sets: INITIAL_SETS,
    pinned: 'home',
    item: (v) => ({ value: v, label: docOf(v).label, Icon: docOf(v).Icon }),
    notify: (title, description) => toast.success(title, { description }),
  });
  // Keyed on the set, so switching remounts the bar with that set's own tabs.
  return (
    <ShellFrame
      key={sets.key}
      width={width}
      set={sets.set}
      onSetChange={sets.reportSet}
      closed={sets.closed}
      onClosed={sets.onClosed}
      onReopened={sets.onReopened}
      menu={sets.menuProps}
      groups={sets.groups}
      activeGroup={sets.activeGroup}
      onMoveTab={sets.moveTab}
    />
  );
}

function ShellFrame({
  width,
  set,
  onSetChange,
  closed,
  onClosed,
  onReopened,
  menu,
  groups,
  activeGroup,
  onMoveTab,
}: {
  width: PageContainerWidth;
  set: TabSet;
  onSetChange: (set: TabSet) => void;
  closed: string[];
  onClosed: (value: string) => void;
  onReopened: (value: string) => void;
  menu: Omit<TabBarMenuProps, 'tabs' | 'recentlyClosed' | 'onReopen'>;
  groups: TabSetGroup[];
  activeGroup: string | null;
  onMoveTab: (tab: string, target: string | null) => void;
}) {
  const layout = useTabLayout({ initial: { tabs: set.tabs, active: set.active, groups: [], groupOf: {} } });
  const { state } = layout;

  // Report this set's tabs back to the Shell, so the menu can search them from any other set.
  const tabsKey = state.tabs.join('|');
  useEffect(() => {
    onSetChange({ tabs: state.tabs, active: state.active ?? state.tabs[0] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabsKey, state.active]);

  const closeTab = (value: string) => {
    layout.close(value);
    onClosed(value);
  };
  // Moving a tab takes it off this bar; the Shell adds it to the other set.
  const moveTab = (value: string, target: string | null) => {
    layout.close(value);
    onMoveTab(value, target);
  };
  const reopen = (value: string) => {
    layout.open(value);
    onReopened(value);
  };

  const tabMenu = (value: string) => (
    <>
      {state.split?.includes(value) ? (
        <ContextMenuItem onClick={layout.unsplit}>Close split view</ContextMenuItem>
      ) : (
        state.active &&
        state.active !== value && (
          <ContextMenuItem onClick={() => layout.split(value, 'end', state.active!)}>Open beside {docOf(state.active).label}</ContextMenuItem>
        )
      )}
      {value !== 'home' && (
        <>
          <ContextMenuSeparator />
          <ContextMenuSub>
            <ContextMenuSubTrigger>Add to group</ContextMenuSubTrigger>
            <ContextMenuSubContent>
              {groups
                .filter((g) => g.value !== activeGroup)
                .map((g) => (
                  <ContextMenuItem key={g.value} onClick={() => moveTab(value, g.value)}>
                    <Swatch color={g.color} size="sm" />
                    {g.label}
                  </ContextMenuItem>
                ))}
              {groups.some((g) => g.value !== activeGroup) && <ContextMenuSeparator />}
              <TabBarNewGroupItem tabs={[value]} />
            </ContextMenuSubContent>
          </ContextMenuSub>
          {activeGroup !== null && <ContextMenuItem onClick={() => moveTab(value, null)}>Remove from group</ContextMenuItem>}
        </>
      )}
      {docOf(value).closable !== false && (
        <>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={() => closeTab(value)}>Close tab</ContextMenuItem>
        </>
      )}
    </>
  );

  const renderTab = (value: string) => (
    <TabBarTab
      key={value}
      value={value}
      label={docOf(value).label}
      Icon={docOf(value).Icon}
      iconOnly={value === 'home'}
      closable={docOf(value).closable !== false}
      onClose={() => closeTab(value)}
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
            <Button id="shell-home" style="ghost" size="sm" iconOnly IconCenter={() => <LayoutGrid size={16} aria-hidden="true" />} aria-label="DART Central home" />
            <DropdownMenu id="shell-account-menu">
            <DropdownMenuTrigger>
              <Button
                id="shell-account"
                className="ui-app-shell__account"
                style="ghost"
                label="Kahrman McKenzie"
                IconRight={ChevronDown}
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>kahrman.mckenzie@gmail.com</DropdownMenuLabel>
              <DropdownMenuItem>
                <CircleUser aria-hidden="true" />
                My profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings aria-hidden="true" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <CircleHelp aria-hidden="true" />
                Help
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive">
                <LogOut aria-hidden="true" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          </>
        }
      >
        <TabBar id="shell-tabs" value={state.active ?? undefined} onValueChange={layout.select} onTabMove={layout.move}>
          <TabBarList aria-label="Open documents">
            {/* One set at a time: groups are switched from the tab menu, never drawn in the bar. */}
            {layout.segments.map((seg) => (seg.type === 'group' ? seg.items.map(renderItem) : renderItem(seg)))}
          </TabBarList>
          <ShellNewTab onOpen={layout.open} />
          <TabBarMenu
            {...menu}
            tabs={state.tabs.map((v) => ({ value: v, label: docOf(v).label, Icon: docOf(v).Icon, groupable: v !== 'home' }))}
            recentlyClosed={closed.filter((v) => !state.tabs.includes(v)).map((v) => ({ value: v, label: docOf(v).label, Icon: docOf(v).Icon }))}
            onReopen={(item) => reopen(item.value)}
          />
        </TabBar>
      </AppShellTabStrip>

      <AppShellBody>
        <SidebarProvider>
          <AppRail
            header={<SidebarTrigger />}
            footer={<ModeToggler id="shell-mode" variant="ghost" size="sm" />}
          >
            {APPS.map(({ code, name, Icon, active, count }) => (
              <AppRailItem key={code} data-theme={code} id={`shell-app-${code}`} href={`/${code}`} label={name} Icon={Icon} active={active} count={count} />
            ))}
          </AppRail>

          <AppShellWorkspace>
            {/* Offcanvas (the default): collapsing hides the sidebar and the rail is the collapsed view. */}
            <Sidebar>
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
                      aria-label={docOf(v).label}
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

      {/* Aiden: the Fab in the page's bottom-right corner, inside the Aiden surface for its gradient. */}
      <div data-surface="aiden">
        <Fab id="shell-aiden" size="default" intro aria-label="Ask Aiden">
          <AidenSparkles />
        </Fab>
      </div>
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

/**
 * Overlays in the shell. A `Drawer` opened inside `AppShell` starts below the tab strip, so
 * the tabs stay visible, and covers the rail, the sidebar and the page. The Aiden `Fab` sits
 * under it (`--z-40`, below every overlay). A toast in the Fab's corner stacks above the Fab.
 */
/**
 * The Overlays story's bar. Smaller than the Playground's (no split view, no drag), but its
 * "+" and its group button are the same controls running the same tab-set model.
 */
function OverlayTabs() {
  const sets = useTabSets({
    groups: INITIAL_GROUPS,
    sets: { ...INITIAL_SETS, [WINDOW]: { tabs: ['home', 'dashboards'], active: 'dashboards' } },
    pinned: 'home',
    item: (v) => ({ value: v, label: docOf(v).label, Icon: docOf(v).Icon }),
  });
  return <OverlayTabsFrame key={sets.key} sets={sets} />;
}

function OverlayTabsFrame({ sets }: { sets: TabSets }) {
  const layout = useTabLayout({ initial: { tabs: sets.set.tabs, active: sets.set.active, groups: [], groupOf: {} } });
  const { state } = layout;
  const tabsKey = state.tabs.join('|');
  useEffect(() => {
    sets.reportSet({ tabs: state.tabs, active: state.active ?? state.tabs[0] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabsKey, state.active]);
  const closed = sets.closed.filter((v) => !state.tabs.includes(v));
  return (
    <TabBar id="overlay-tabs" value={state.active ?? undefined} onValueChange={layout.select}>
      <TabBarList aria-label="Open documents">
        {state.tabs.map((v) => (
          <TabBarTab
            key={v}
            value={v}
            label={docOf(v).label}
            Icon={docOf(v).Icon}
            iconOnly={v === 'home'}
            closable={docOf(v).closable !== false}
            onClose={() => {
              layout.close(v);
              sets.onClosed(v);
            }}
          />
        ))}
      </TabBarList>
      <ShellNewTab onOpen={layout.open} />
      <TabBarMenu
        {...sets.menuProps}
        tabs={state.tabs.map(sets.menuItem)}
        recentlyClosed={closed.map(sets.menuItem)}
        onReopen={(item) => {
          layout.open(item.value);
          sets.onReopened(item.value);
        }}
      />
    </TabBar>
  );
}

function OverlayShell() {
  const [open, setOpen] = useState(false);
  return (
    <AppShell id="overlay-shell">
      <AppShellTabStrip
        logo={
          <>
            <Button id="overlay-home" style="ghost" size="sm" iconOnly IconCenter={() => <LayoutGrid size={16} aria-hidden="true" />} aria-label="DART Central home" />
            <Button id="overlay-account" className="ui-app-shell__account" style="ghost" label="Kahrman McKenzie" IconRight={ChevronDown} />
          </>
        }
      >
        <OverlayTabs />
      </AppShellTabStrip>
      <AppShellBody>
        <SidebarProvider>
          <AppRail header={<SidebarTrigger />} footer={<ModeToggler id="overlay-mode" variant="ghost" size="sm" />}>
            {APPS.map(({ code, name, Icon }) => (
              <AppRailItem key={code} id={`overlay-app-${code}`} href={`/${code}`} label={name} Icon={Icon} />
            ))}
          </AppRail>
          <AppShellWorkspace>
            <Sidebar>
              <SidebarContent>
                <SidebarGroup>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton isActive>
                          <LayoutDashboard />
                          <span>Dashboards</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </SidebarContent>
            </Sidebar>
            <SidebarInset>
              <AppShellMain>
                <PageContainer width="narrow">
                  <PageHeader
                    id="overlay-page"
                    title="Dashboards"
                    description="Open the edit drawer, or save to see the toast land above the Aiden button."
                    actions={
                      <>
                        <Button id="overlay-toast" style="outline" label="Save" onClick={() => toast('Dashboard updated', { description: 'Collateral Health Dashboard · 3 fields changed.' })} />
                        <Button id="overlay-edit" label="Edit dashboard" onClick={() => setOpen(true)} />
                      </>
                    }
                  />
                </PageContainer>
              </AppShellMain>
            </SidebarInset>
          </AppShellWorkspace>
        </SidebarProvider>
      </AppShellBody>
      <Drawer id="overlay-drawer" open={open} onClose={() => setOpen(false)}>
        <DrawerHeader id="overlay-drawer" onClose={() => setOpen(false)} title="Edit dashboard" description="Direct edit, no request. Recorded in Activity under your name." />
        <DrawerBody>
          <Input id="overlay-name" label="Name" defaultValue="Collateral Health Dashboard" />
        </DrawerBody>
        <DrawerFooter>
          <Button id="overlay-cancel" style="ghost" label="Cancel" onClick={() => setOpen(false)} />
          <Button id="overlay-save" label="Save changes" onClick={() => setOpen(false)} />
        </DrawerFooter>
      </Drawer>
      <Toaster />
      <div data-surface="aiden">
        <Fab id="overlay-aiden" size="default" aria-label="Ask Aiden">
          <AidenSparkles />
        </Fab>
      </div>
    </AppShell>
  );
}

export const Overlays: Story = {
  render: () => (
    <div data-theme="db" style={{ height: '100vh' }}>
      <OverlayShell />
    </div>
  ),
};
