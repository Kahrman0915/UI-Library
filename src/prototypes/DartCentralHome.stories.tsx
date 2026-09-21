import type { Meta, StoryObj } from '@storybook/react';
import {
  BarChart3,
  Bell,
  Box,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  CircleUser,
  Clock,
  FileText,
  Flame,
  LayoutDashboard,
  Home,
  Inbox,
  Layers,
  LayoutGrid,
  LogOut,
  Phone,
  Pin,
  Search,
  Settings,
  Slash,
  Sparkles,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import AppShell, { AppShellBody, AppShellMain, AppShellTabStrip, AppShellWorkspace } from '../components/AppShell';
import AppRail, { AppRailItem } from '../components/AppRail';
import TabBar, { TabBarList, TabBarMenu, TabBarNewTab, TabBarTab } from '../components/TabBar';
import DropdownMenu, {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/DropdownMenu';
import Fab from '../components/Fab';
import Button from '../components/Button';
import Card from '../components/Card';
import FeaturedIcon from '../components/FeaturedIcon';
import Kbd from '../components/Kbd';
import ModeToggler from '../components/ModeToggler';
import Sidebar, {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '../components/Sidebar';
import Item, { ItemActions, ItemContent, ItemMedia, ItemTitle } from '../components/Item';
import InputGroup, {
  InputGroupAddon,
  InputGroupInput,
} from '../components/InputGroup';
import './DartCentralHome.scss';
import { AidenSparkles } from './AidenSparkles';

const meta: Meta = {
  title: 'Prototypes/DART Central — Home',
  parameters: {
    layout: 'fullscreen',
    ui: {
      description:
        'A real application shell, built only from library components and tokens. ' +
        'Themed `db`, responsive, and light/dark aware.\n\n' +
        'It exists to answer a question a spec grid cannot: does the system actually ' +
        'compose into a product? The chrome is `AppShell` with no hand-built parts: the ' +
        'account cell (DART Central mark · your name and menu), a `TabBar` whose Home tab is ' +
        'icon-only and never closes, `AppRail` (applications, mode toggle), `Sidebar` with no ' +
        'header, and the Aiden `Fab` bottom-right with its intro twinkle. The page inside is ' +
        'Card, Item, InputGroup, FeaturedIcon and Kbd.',
      tags: ['prototype', 'composed screen', 'themed db'],
    },
  },
};

export default meta;
type Story = StoryObj;

/* The rail's apps. Icon-only links in the one theme the user picked — no per-app
   color (owner, 2026-09-19). */
const RAIL_APPS: { code: string; name: string; Icon: LucideIcon; count?: number }[] = [
  { code: 'db', name: 'DARTBoards', Icon: LayoutDashboard },
  { code: 'dc', name: 'IRM', Icon: Box, count: 3 },
  { code: 'ph', name: 'Phoenix', Icon: Flame },
  { code: 'ec', name: 'Eclipse', Icon: Layers },
  { code: 'nb', name: 'NoteGen', Icon: FileText },
];

const NAV = [
  { label: 'Home', Icon: Home, active: true },
  { label: 'Settings', Icon: Settings },
  { label: "What's New", Icon: Bell },
  { label: 'My Requests', Icon: Inbox },
];

const QUICK = [
  { label: 'Create Space', Icon: LayoutGrid, variant: 'default' },
  { label: 'New IRM Request', Icon: Box, variant: 'info' },
  { label: 'Open Phoenix', Icon: Flame, variant: 'warning' },
  { label: 'Eclipse Queue', Icon: Layers, variant: 'default' },
  { label: 'New Note', Icon: FileText, variant: 'success' },
  { label: 'Chat with Aiden', Icon: Sparkles, variant: 'default' },
] as const;

const RECENT = [
  { name: 'My Requests', app: 'DART Central', Icon: Inbox },
  { name: 'IRM', app: 'IRM', Icon: Box },
  { name: 'Phoenix', app: 'Phoenix', Icon: Flame },
  { name: 'Eclipse', app: 'Eclipse', Icon: Layers },
  { name: 'NoteGen', app: 'NoteGen', Icon: FileText },
  { name: 'Call Center', app: 'DARTBoards', Icon: Phone },
  { name: 'DARTBoards', app: 'DARTBoards', Icon: LayoutDashboard },
  { name: 'Phone Analytics', app: 'DARTBoards', Icon: BarChart3 },
];

const PINNED = [
  { title: 'Call Center', desc: 'Monitor call center performance and service levels', Icon: Phone },
  { title: 'IRM Metrics', desc: 'Track IRM requests and modifications', Icon: Box },
  { title: 'Tableau Internal', desc: 'Monitor Tableau and DARTBoards platform usage', Icon: BarChart3 },
];


function Shell() {
  return (
    <AppShell id="dc">
      {/* ── the strip: account cell · tabs. Home is the fixed tab: icon-only, never closable. ── */}
      <AppShellTabStrip
        logo={
          <>
            <Button id="dc-home" style="ghost" size="sm" iconOnly IconCenter={() => <LayoutGrid size={16} aria-hidden="true" />} aria-label="DART Central home" />
            <Slash className="ui-app-shell__sep" aria-hidden="true" />
            <DropdownMenu id="dc-account-menu">
              <DropdownMenuTrigger>
                <Button id="dc-account" className="ui-app-shell__account" style="ghost" label="Kahrman McKenzie" IconRight={ChevronDown} />
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
        <TabBar id="dc-tabs" value="home">
          <TabBarList aria-label="Open documents">
            <TabBarTab value="home" label="Home" Icon={Home} iconOnly closable={false} />
          </TabBarList>
          <TabBarNewTab />
          <TabBarMenu tabs={[{ value: 'home', label: 'Home', Icon: Home }]} />
        </TabBar>
      </AppShellTabStrip>

      <AppShellBody>
        <SidebarProvider>
          <AppRail header={<SidebarTrigger />} footer={<ModeToggler id="dc-mode" variant="ghost" size="sm" />}>
            {RAIL_APPS.map(({ code, name, Icon, count }) => (
              <AppRailItem key={code} id={`dc-rail-${code}`} href={`/${code}`} label={name} Icon={Icon} count={count} />
            ))}
          </AppRail>

          <AppShellWorkspace>
          <Sidebar>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {NAV.map(({ label, Icon, active }) => (
                      <SidebarMenuItem key={label}>
                        <SidebarMenuButton isActive={active}>
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
              <div className="dc-col">
                <header className="dc-greeting">
                  <h1 className="dc-greeting__title">Good evening, Kahrman</h1>
                  <p className="dc-greeting__sub">What would you like to work on today?</p>
                </header>

                {/* Search — InputGroup, so the icon and the shortcut are addons
                    inside the field rather than siblings faking one. */}
                <div style={{ marginTop: 'var(--p-10)' }}>
                  <InputGroup id="dc-search">
                    <InputGroupAddon align="inline-start">
                      <Search size={16} aria-hidden="true" />
                    </InputGroupAddon>
                    <InputGroupInput
                      id="dc-search-input"
                      placeholder="Search spaces, dashboards, requests…"
                      aria-label="Search"
                    />
                    <InputGroupAddon align="inline-end">
                      <Kbd size="sm">⌘K</Kbd>
                    </InputGroupAddon>
                  </InputGroup>
                </div>

                {/* Aiden prompt. data-surface, not data-theme — the assistant
                    composes inside db rather than replacing it. */}
                <div style={{ marginTop: 'var(--p-10)' }} data-surface="aiden">
                  <Card id="dc-aiden" className="dc-aiden-card">
                    <div style={{ padding: 'var(--p-4)' }}>
                      <div className="dc-aiden__head">
                        <Sparkles aria-hidden="true" />
                        Ask Aiden
                      </div>
                      <div className="dc-aiden__row">
                        <span className="dc-aiden__placeholder">
                          Help me analyze my data, build a dashboard, find an IRM request…
                        </span>
                        <Button id="dc-aiden-send" variant="aiden" size="sm" label="Send" />
                      </div>
                    </div>
                  </Card>
                </div>

                <section className="dc-section">
                  <div className="dc-section__head">
                    <h2 className="dc-section__title">Quick actions</h2>
                  </div>
                  <div className="dc-section__body dc-grid">
                    {QUICK.map(({ label, Icon, variant }) => (
                      <Card id={`dc-q-${label}`} key={label} interactive>
                        <Item size="sm">
                          <ItemMedia variant="icon">
                            <FeaturedIcon Icon={Icon} size="sm" color={variant} />
                          </ItemMedia>
                          <ItemContent>
                            <ItemTitle>{label}</ItemTitle>
                          </ItemContent>
                        </Item>
                      </Card>
                    ))}
                  </div>
                </section>

                <section className="dc-section">
                  <div className="dc-section__head">
                    <h2 className="dc-section__title">
                      <Clock aria-hidden="true" />
                      Recent
                    </h2>
                  </div>
                  <div className="dc-section__body dc-rows">
                    {RECENT.map(({ name, app, Icon }) => (
                      <Item key={name} size="sm" onClick={() => {}}>
                        <ItemMedia variant="icon">
                          <Icon />
                        </ItemMedia>
                        <ItemContent>
                          <ItemTitle>{name}</ItemTitle>
                        </ItemContent>
                        <ItemActions>
                          <span className="dc-row__context">{app}</span>
                        </ItemActions>
                      </Item>
                    ))}
                  </div>
                </section>

                <section className="dc-section">
                  <div className="dc-section__head">
                    <h2 className="dc-section__title">
                      <Pin aria-hidden="true" />
                      Pinned spaces
                    </h2>
                    <Button
                      id="dc-pinned-all"
                      style="link"
                      size="xs"
                      label="View all"
                      IconRight={() => <ChevronRight size={12} aria-hidden="true" />}
                    />
                  </div>
                  <div className="dc-section__body dc-grid dc-grid--wide">
                    {PINNED.map(({ title, desc, Icon }) => (
                      <Card id={`dc-p-${title}`} key={title} interactive>
                        <Item size="sm">
                          <ItemMedia variant="icon">
                            <FeaturedIcon Icon={Icon} size="sm" />
                          </ItemMedia>
                          <ItemContent>
                            <ItemTitle>{title}</ItemTitle>
                            <span
                              style={{
                                fontSize: 'var(--text-xs)',
                                lineHeight: 'var(--leading-4)',
                                color: 'var(--muted-foreground)',
                              }}
                            >
                              {desc}
                            </span>
                          </ItemContent>
                        </Item>
                      </Card>
                    ))}
                  </div>
                </section>
              </div>
            </AppShellMain>
          </SidebarInset>
          </AppShellWorkspace>
        </SidebarProvider>
      </AppShellBody>

      {/* Aiden: the Fab in the bottom-right corner, inside the Aiden surface for its gradient. */}
      <div data-surface="aiden">
        <Fab id="dc-aiden" size="default" intro aria-label="Ask Aiden">
          <AidenSparkles />
        </Fab>
      </div>
    </AppShell>
  );
}

/**
 * The screen as designed — themed `db`, which is the only difference between
 * this and any other product in the suite. Nothing below the wrapper knows
 * which brand it is in.
 */
export const Home_db: Story = {
  name: 'DART Central (db)',
  render: () => (
    <div data-theme="db" style={{ height: '100vh' }}>
      <Shell />
    </div>
  ),
};

/**
 * The same markup with the tint axis on. `data-tint="page rail"` is opt-in and
 * pulls the neutral surfaces toward the brand — the strongest argument that the
 * theming system reaches past the accent.
 */
export const Home_db_tinted: Story = {
  name: 'DART Central (db · tinted)',
  render: () => (
    <div data-theme="db" data-tint="page rail" style={{ height: '100vh' }}>
      <Shell />
    </div>
  ),
};
