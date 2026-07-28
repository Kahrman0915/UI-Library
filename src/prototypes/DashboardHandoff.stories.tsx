import type { Meta, StoryObj } from '@storybook/react';
import {
  Bot,
  Calendar,
  FolderGit2,
  Frame,
  House,
  Inbox,
  Plus,
  Settings,
  SquareTerminal,
} from 'lucide-react';
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Item,
  ItemActions,
  ItemContent,
  ItemMedia,
  ItemTitle,
  ModeToggler,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from '../index';

// ─────────────────────────────────────────────────────────────────────────────
// Test-drive screen #3: a developer builds the dashboard app shell from the
// Figma handoff (page "🧪 Example — Dashboard"). Exercises the full Sidebar
// subsystem + SidebarInset, ModeToggler, Avatar, Card, Badge, Item.
// ─────────────────────────────────────────────────────────────────────────────

const meta: Meta = {
  title: 'Prototypes/Dashboard Handoff',
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj;

function Stat({
  label,
  value,
  trend,
  trendVariant,
}: {
  label: string;
  value: string;
  trend: string;
  trendVariant: 'success' | 'outline';
}) {
  return (
    <Card id={`stat-${label}`} style={{ flex: 1 }}>
      <CardBody>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--p-2)' }}>
          <span
            style={{
              flex: 1,
              fontSize: 'var(--text-xs)',
              color: 'var(--muted-foreground)',
            }}
          >
            {label}
          </span>
          <Badge id={`trend-${label}`} label={trend} variant={trendVariant} />
        </div>
        <div
          style={{
            marginTop: 'var(--p-2)',
            fontSize: 'var(--text-xl)',
            fontWeight: 'var(--font-semibold)',
            color: 'var(--foreground)',
          }}
        >
          {value}
        </div>
      </CardBody>
    </Card>
  );
}

const activity = [
  { initials: 'AL', name: 'Ada Lovelace', action: 'invited Grace Hopper to the team', time: '2m ago' },
  { initials: 'AT', name: 'Alan Turing', action: 'updated the billing settings', time: '1h ago' },
  { initials: 'GH', name: 'Grace Hopper', action: 'commented on “Q3 report”', time: '3h ago' },
  { initials: 'SY', name: 'System', action: 'deployed v2.4 to production', time: '5h ago' },
];

function Dashboard() {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" tooltip="Acme Inc">
                <SquareTerminal />
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
                  <span style={{ fontWeight: 'var(--font-medium)' }}>Acme Inc</span>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>
                    Enterprise
                  </span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <SidebarInput placeholder="Search…" aria-label="Search" />
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Dashboard" isActive>
                    <House />
                    <span>Dashboard</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Inbox">
                    <Inbox />
                    <span>Inbox</span>
                  </SidebarMenuButton>
                  <SidebarMenuBadge>24</SidebarMenuBadge>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Projects">
                    <Frame />
                    <span>Projects</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Calendar">
                    <Calendar />
                    <span>Calendar</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Settings">
                    <Settings />
                    <span>Settings</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator />

          <SidebarGroup>
            <SidebarGroupLabel>Projects</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Design Engineering">
                    <Frame />
                    <span>Design Engineering</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Sales & Marketing">
                    <Bot />
                    <span>Sales &amp; Marketing</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Travel">
                    <FolderGit2 />
                    <span>Travel</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" tooltip="Ada Lovelace">
                <Avatar id="sb-user" fallback="AL" size="sm" />
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
                  <span style={{ fontWeight: 'var(--font-medium)' }}>Ada Lovelace</span>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>
                    ada@acme.io
                  </span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        {/* Topbar */}
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--p-3)',
            height: 'var(--h-14)',
            padding: '0 var(--p-4)',
            borderBottom: 'var(--border-w-100) solid var(--border)',
            flexShrink: 0,
          }}
        >
          <SidebarTrigger />
          <span style={{ fontWeight: 'var(--font-medium)' }}>Dashboard</span>
          <div style={{ flex: 1 }} />
          <ModeToggler id="mode" />
          <Avatar id="topbar-user" fallback="AL" />
        </header>

        {/* Body */}
        <div style={{ padding: 'var(--p-6)', display: 'grid', gap: 'var(--p-5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--p-4)' }}>
            <div style={{ flex: 1 }}>
              <h1
                style={{
                  margin: 0,
                  fontSize: 'var(--text-2xl)',
                  fontWeight: 'var(--font-semibold)',
                  color: 'var(--foreground)',
                }}
              >
                Good morning, Ada
              </h1>
              <p
                style={{
                  margin: 'var(--p-1) 0 0',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--muted-foreground)',
                }}
              >
                Here’s what’s happening with your team today.
              </p>
            </div>
            <Button id="new-report" label="New report" IconLeft={Plus} />
          </div>

          <div style={{ display: 'flex', gap: 'var(--p-5)' }}>
            <Stat label="Revenue" value="$48.2k" trend="+12%" trendVariant="success" />
            <Stat label="Active users" value="2,340" trend="+4.1%" trendVariant="success" />
            <Stat label="Churn" value="1.2%" trend="−0.3%" trendVariant="outline" />
          </div>

          <Card id="activity">
            <CardHeader id="activity" title="Recent activity" />
            <CardBody style={{ padding: 0 }}>
              {activity.map((a, i) => (
                <div key={a.name + i}>
                  <Item>
                    <ItemMedia>
                      <Avatar id={`act-${i}`} fallback={a.initials} size="sm" />
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle>
                        {a.name}{' '}
                        <span style={{ fontWeight: 'var(--font-normal)', color: 'var(--muted-foreground)' }}>
                          {a.action}
                        </span>
                      </ItemTitle>
                    </ItemContent>
                    <ItemActions>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>
                        {a.time}
                      </span>
                    </ItemActions>
                  </Item>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export const Dashboard_: Story = {
  name: 'Dashboard',
  render: () => <Dashboard />,
};
