import type { Meta, StoryObj } from '@storybook/react';
import {
  BarChart3,
  Bell,
  Box,
  ChevronRight,
  Clock,
  FileText,
  Flame,
  Grid2x2,
  Home,
  Inbox,
  Layers,
  LayoutGrid,
  Phone,
  Pin,
  Plus,
  Search,
  Settings,
  Sparkles,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Avatar from '../components/Avatar';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Card from '../components/Card';
import FeaturedIcon from '../components/FeaturedIcon';
import Kbd from '../components/Kbd';
import Mark from '../components/Mark';
import ModeToggler from '../components/ModeToggler';
import Sidebar, {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
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

const meta: Meta = {
  title: 'Prototypes/DART Central — Home',
  parameters: {
    layout: 'fullscreen',
    ui: {
      description:
        'A real application shell, built only from library components and tokens. ' +
        'Themed `db`, responsive, and light/dark aware.\n\n' +
        'It exists to answer a question a spec grid cannot: does the system actually ' +
        'compose into a product? Everything a component already owns is a component ' +
        'here — Sidebar, Mark, Card, Item, InputGroup, FeaturedIcon, Kbd, Avatar, ' +
        'Badge, Button, ModeToggler. The only hand-built chrome is the icon rail, ' +
        'because an app switcher is not something the library ships.',
      tags: ['prototype', 'composed screen', 'themed db'],
    },
  },
};

export default meta;
type Story = StoryObj;

/* The rail's apps. Each is its own product, which is the whole reason the rail
   exists — and why every tile is a themed Mark rather than a flat glyph. */
const RAIL_APPS: { code: string; name: string; Icon: LucideIcon; count?: number }[] = [
  { code: 'db', name: 'DART Central', Icon: LayoutGrid },
  { code: 'dc', name: 'IRM', Icon: Box, count: 3 },
  { code: 'ph', name: 'Phoenix', Icon: Flame },
  { code: 'ec', name: 'Eclipse', Icon: Layers },
  { code: 'nb', name: 'NoteGen', Icon: FileText },
  { code: 'rm', name: 'DARTBoards', Icon: Grid2x2 },
];

const NAV = [
  { label: 'Home', Icon: Home, active: true },
  { label: 'Settings', Icon: Settings },
  { label: "What's New", Icon: Bell },
  { label: 'My Requests', Icon: Inbox },
];

const QUICK = [
  { label: 'Create Space', Icon: LayoutGrid, variant: 'brand' },
  { label: 'New IRM Request', Icon: Box, variant: 'info' },
  { label: 'Open Phoenix', Icon: Flame, variant: 'warning' },
  { label: 'Eclipse Queue', Icon: Layers, variant: 'brand' },
  { label: 'New Note', Icon: FileText, variant: 'success' },
  { label: 'Chat with Aiden', Icon: Sparkles, variant: 'brand' },
] as const;

const RECENT = [
  { name: 'My Requests', app: 'DART Central', Icon: Inbox },
  { name: 'IRM', app: 'IRM', Icon: Box },
  { name: 'Phoenix', app: 'Phoenix', Icon: Flame },
  { name: 'Eclipse', app: 'Eclipse', Icon: Layers },
  { name: 'NoteGen', app: 'NoteGen', Icon: FileText },
  { name: 'Call Center', app: 'DARTBoards', Icon: Phone },
  { name: 'DARTBoards', app: 'DARTBoards', Icon: Grid2x2 },
  { name: 'Phone Analytics', app: 'DARTBoards', Icon: BarChart3 },
];

const PINNED = [
  { title: 'Call Center', desc: 'Monitor call center performance and service levels', Icon: Phone },
  { title: 'IRM Metrics', desc: 'Track IRM requests and modifications', Icon: Box },
  { title: 'Tableau Internal', desc: 'Monitor Tableau and DARTBoards platform usage', Icon: BarChart3 },
];

function Shell() {
  return (
    <div className="dc-shell">
      {/* ── tab strip ── */}
      <div className="dc-tabstrip">
        <span className="dc-tabstrip__mark">
          <Mark id="dc-mark" Icon={LayoutGrid} size="sm" motion="none" label="DART Central" />
        </span>

        <span className="dc-tabstrip__tab">
          <Home size={14} aria-hidden="true" />
          Home
          <Button
            id="dc-tab-close"
            style="ghost"
            size="xs"
            iconOnly
            IconCenter={() => <X size={12} aria-hidden="true" />}
            aria-label="Close tab"
          />
        </span>

        <Button
          id="dc-tab-new"
          style="ghost"
          size="xs"
          iconOnly
          IconCenter={() => <Plus size={14} aria-hidden="true" />}
          aria-label="New tab"
        />

        <span className="dc-tabstrip__spacer" />

        <span className="dc-tabstrip__actions">
          <Button
            id="dc-apps"
            style="ghost"
            size="xs"
            iconOnly
            IconCenter={() => <Grid2x2 size={14} aria-hidden="true" />}
            aria-label="All apps"
          />
          {/* The one place the Aiden surface appears in the chrome — the gradient
              is reserved for the assistant's own entry point. */}
          <span data-surface="aiden">
            <Button
              id="dc-ask-aiden"
              variant="aiden"
              size="xs"
              label="Ask Aiden"
              IconLeft={() => <Sparkles size={12} aria-hidden="true" />}
            />
          </span>
        </span>
      </div>

      <div className="dc-body">
        {/* ── app rail — hand-built, the only non-component chrome ── */}
        <nav className="dc-rail" aria-label="Applications">
          <div className="dc-rail__group">
            {RAIL_APPS.map(({ code, name, Icon, count }) => (
              <span className="dc-rail__slot" key={code} data-theme={code}>
                <Mark id={`dc-rail-${code}`} Icon={Icon} size="default" motion="none" label={name} />
                {count && (
                  <span className="dc-rail__badge">
                    <Badge id={`dc-rail-${code}-count`} variant="error">{count}</Badge>
                  </span>
                )}
              </span>
            ))}
          </div>

          <div className="dc-rail__group dc-rail__group--end">
            <Avatar id="dc-me" fallback="KM" alt="Kahrman McKenzie" size="sm" />
            <span className="dc-rail__slot">
              <Button
                id="dc-notifications"
                style="ghost"
                size="sm"
                iconOnly
                IconCenter={() => <Bell size={16} aria-hidden="true" />}
                aria-label="Notifications"
              />
              <span className="dc-rail__badge">
                <Badge id="dc-notifications-count" variant="error">3</Badge>
              </span>
            </span>
            <ModeToggler id="dc-mode" variant="ghost" size="sm" />
            <Button
              id="dc-settings"
              style="ghost"
              size="sm"
              iconOnly
              IconCenter={() => <Settings size={16} aria-hidden="true" />}
              aria-label="Settings"
            />
          </div>
        </nav>

        {/* ── sidebar + content ──
            .dc-workspace carries `contain: layout`, which is what stops the
            Sidebar's viewport-fixed panel from covering the rail and the tab
            strip. See the SCSS for why that is the fix and not a hack. */}
        <div className="dc-workspace">
        <SidebarProvider>
          <Sidebar collapsible="icon">
            <SidebarHeader>
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 'var(--p-2)',
                  padding: 'var(--p-1) var(--p-2)',
                  fontSize: 'var(--text-xs)',
                  lineHeight: 'var(--leading-4)',
                  fontWeight: 'var(--font-semibold)',
                  letterSpacing: 'var(--tracking-wide)',
                  textTransform: 'uppercase',
                  color: 'var(--sidebar-foreground)',
                }}
              >
                DART Central
                <SidebarTrigger />
              </span>
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
            <main className="dc-main">
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
                            <FeaturedIcon Icon={Icon} size="sm" variant={variant} />
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
                            <FeaturedIcon Icon={Icon} size="sm" variant="brand" />
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
            </main>
          </SidebarInset>
        </SidebarProvider>
        </div>
      </div>
    </div>
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
