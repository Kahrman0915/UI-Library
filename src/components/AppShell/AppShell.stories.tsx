import type { Meta, StoryObj } from '@storybook/react';
import { Bell, Box, FileText, Flame, Grid2x2, Home, Inbox, Layers, LayoutGrid, Plus, Search, Settings, Sparkles } from 'lucide-react';
import AppShell, { AppShellTabStrip, AppShellBody, AppShellWorkspace, AppShellMain } from './AppShell';
import AppRail, { AppRailItem } from '../AppRail';
import TabBar, { TabBarList, TabBarTab, TabBarNewTab } from '../TabBar';
import Sidebar, { SidebarContent, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from '../Sidebar';
import Mark from '../Mark';
import Button from '../Button';
import Avatar from '../Avatar';
import ModeToggler from '../ModeToggler';
import Badge from '../Badge';
import Input from '../Input';
import PageContainer from '../PageContainer';
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
        'then `AppRail` · `Sidebar` · `AppShellMain`. Strip 48, rail 48, sidebar 256, so Main Content is 1136 wide at the 1440 ' +
        'design viewport and 1616 at 1920 — the width every flow screen is drawn at. A page fills Main with a `PageContainer` and ' +
        'never re-derives the geometry. `AppRail` is its own component, composed here like `Sidebar` and `TabBar`; the shell has no ' +
        'brand prop and reads the scope it stands in.',
      tags: ['layout', 'chrome', 'shell'],
      usage: {
        when: ['Every application in the suite. One `AppShell` at the root, in a `100dvh` box; `AppShellWorkspace` holds the `SidebarProvider`.'],
        avoid: ['Hand-rolling the strip, the rail or the workspace — the workspace\'s `contain: layout` and the SidebarProvider height override are the parts that took a phase to get right.'],
        notes: 'The Aiden mounting contract (`Fab` at `--z-80`, `AidenPanel` at `--z-40`, Fab hidden while a surface is open) is composed by the app for now; see the DART Central prototype.',
      },
      changelog: [{ date: '2026-09-07', summary: 'Initial build. The shared application chrome as a component.', detail: 'AppShell · AppShellTabStrip · AppShellBody · AppShellWorkspace · AppShellMain; composes `AppRail`, `TabBar` and `Sidebar`. Geometry from the Figma App Shell proof; `--app-rail-width` and `--app-strip-height` tokens. docs/skill-and-shell-plan.md Phase 1.' }],
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
const NAV = [
  { label: 'Home', Icon: Home },
  { label: 'My Requests', Icon: Inbox, active: true },
  { label: "What's New", Icon: Bell },
  { label: 'Settings', Icon: Settings },
];

const Row = ({ id, title, description }: { id: string; title: string; description: string }) => (
  <Card id={id}>
    <CardHeader id={`${id}-header`} title={title} description={description} action={<Badge id={`${id}-badge`} color="info" label="Pending review" />} />
  </Card>
);

function Shell({ width }: { width: 'narrow' | 'default' | 'full' }) {
  return (
    <AppShell id="shell">
      <AppShellTabStrip
        logo={<Button id="shell-home" style="ghost" iconOnly IconCenter={() => <LayoutGrid size={16} aria-hidden="true" />} aria-label="DART Central" />}
        actions={
          <>
            <Button id="shell-apps" style="ghost" size="sm" iconOnly IconCenter={() => <Grid2x2 size={16} aria-hidden="true" />} aria-label="All apps" />
            <span data-surface="aiden">
              <Button id="shell-aiden" variant="aiden" style="secondary" size="sm" label="Ask Aiden" IconLeft={() => <Sparkles size={14} aria-hidden="true" />} />
            </span>
          </>
        }
      >
        <TabBar id="shell-tabs" defaultValue="requests">
          <TabBarList>
            <TabBarTab value="home" label="Home" Icon={Home} closable={false} />
            <TabBarTab value="requests" label="My Requests" Icon={Inbox} />
          </TabBarList>
          <TabBarNewTab />
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
            <Sidebar collapsible="icon">
              <SidebarHeader>
                <Mark id="shell-sidebar-mark" Icon={LayoutGrid} size="sm" motion="none" title="DART Central" description="Workspace" />
              </SidebarHeader>
              <SidebarContent>
                <SidebarGroup>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {NAV.map(({ label, Icon, active }) => (
                        <SidebarMenuItem key={label}>
                          <SidebarMenuButton tooltip={label} isActive={active}>
                            <Icon />
                            <span>{label}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </SidebarContent>
            </Sidebar>
            <SidebarInset>
              <AppShellMain>
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
