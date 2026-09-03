import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Search,
  Plus,
  ChevronDown,
  Ellipsis,
  User,
  Settings,
  LogOut,
  TrendingUp,
  Activity,
  FolderGit2,
  Info,
} from 'lucide-react';
import {
  Button,
  Badge,
  Chip,
  Avatar,
  StatusDot,
  Input,
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  CardOverline,
  Progress,
  Item,
  ItemMedia,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemActions,
  Alert,
  Banner,
  Separator,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Popover,
  PopoverTrigger,
  PopoverContent,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from '../index';
import type { BadgeColor } from '../index';
import { ThemeHarness, srOnly } from './ThemeHarness';

const meta: Meta = {
  title: 'Prototypes/Console Dashboard',
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj;

const stats = [
  { id: 'st-rev', label: 'Revenue', value: '$42,391', delta: '+12.4%', variant: 'success' as const },
  { id: 'st-usr', label: 'Active users', value: '1,204', delta: '+3.1%', variant: 'info' as const },
  { id: 'st-err', label: 'Error rate', value: '0.4%', delta: '-0.2%', variant: 'warning' as const },
];

const activity = [
  { id: 'a1', who: 'Ren Guo', what: 'merged feat/preview-cards', status: 'online' as const, tag: 'Merged', v: 'success' as const },
  { id: 'a2', who: 'Priya N.', what: 'opened a pull request', status: 'away' as const, tag: 'Review', v: 'info' as const },
  { id: 'a3', who: 'Deploy bot', what: 'shipped v4.1 to production', status: 'busy' as const, tag: 'Deploy', v: 'default' as const },
];

function Dashboard() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filter, setFilter] = useState('all');

  return (
    <ThemeHarness>
      {/* Top bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--p-4)',
          padding: 'var(--p-4) var(--p-6)',
          borderBottom: 'var(--border-w-100) solid var(--border)',
        }}
      >
        <FolderGit2 width={20} height={20} />
        <strong>Console</strong>
        <Separator orientation="vertical" style={{ height: 20 }} />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Workspace</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Overview</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <span style={{ flex: 1 }} />
        <div style={{ width: 240 }}>
          <Input id="search" IconLeft={Search} placeholder="Search…" aria-label="Search" />
        </div>
        <Badge id="plan" color="success" appearance="outline" label="Pro plan" />
        <DropdownMenu id="acct">
          <DropdownMenuTrigger>
            <Button id="acct-btn" label="Kahrman" IconRight={ChevronDown} style="outline" size="sm" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>My account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User width={14} height={14} /> Profile
              <DropdownMenuShortcut>⌘P</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings width={14} height={14} /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut width={14} height={14} /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Brand banner — themes with --primary */}
      <Banner
        id="promo"
        variant="brand"
        title="You're on the Pro plan — team seats are 20% off this month."
        action={<Button id="promo-cta" label="Upgrade" size="xs" style="outline" />}
      />

      <div style={{ padding: 'var(--p-6)', display: 'grid', gap: 'var(--p-6)', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--p-3)' }}>
          <h1 style={{ margin: 0, fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-semibold)' }}>Overview</h1>
          <span style={{ flex: 1 }} />
          <Button id="new-project" label="New project" IconLeft={Plus} />
        </div>

        <h2 style={srOnly}>Project metrics and activity</h2>
        <Tabs id="tabs" defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            {/* Stat cards — interactive (hover lift) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--p-4)', marginTop: 'var(--p-4)' }}>
              {stats.map((s) => (
                <Card key={s.id} id={s.id} interactive>
                  <CardBody>
                    {/* The stat card inverts CardHeader's ranking — the small
                        thing is the label and the big thing is the value — so
                        it composes the parts instead. `as="p"` keeps a number
                        out of the document outline. */}
                    <CardOverline>
                      <span style={{ flex: 1 }}>{s.label}</span>
                      <Badge id={`${s.id}-d`} color={s.variant as BadgeColor} appearance="outline" label={s.delta} />
                    </CardOverline>
                    <CardTitle as="p" scale="2xl">{s.value}</CardTitle>
                  </CardBody>
                </Card>
              ))}
            </div>

            {/* Usage + filters */}
            <Card id="usage" style={{ marginTop: 'var(--p-4)' }}>
              <CardHeader id="usage-header" title="Monthly usage" description="Build minutes across all projects" action={<TrendingUp width={16} height={16} />} />
              <CardBody>
                <Progress value={72} label="Build minutes" showValue />
                <div style={{ display: 'flex', gap: 'var(--p-2)', marginTop: 'var(--p-4)', flexWrap: 'wrap' }}>
                  {['all', 'web', 'api', 'mobile'].map((f) => (
                    <Chip key={f} id={`chip-${f}`} label={f} active={filter === f} onClick={() => setFilter(f)} />
                  ))}
                </div>
              </CardBody>
            </Card>

            <div style={{ marginTop: 'var(--p-4)' }}>
              <Alert id="tip" variant="info" Icon={Info} title="Tip" description="Primary CTAs and the brand banner follow the theme picker; the sidebar chrome, Tooltip, and ghost buttons stay neutral." />
            </div>
          </TabsContent>

          <TabsContent value="activity">
            <div style={{ marginTop: 'var(--p-4)', display: 'grid', gap: 'var(--p-2)' }}>
              {activity.map((a) => (
                <Item key={a.id} id={a.id} variant="outline">
                  <ItemMedia variant="icon"><Activity width={16} height={16} /></ItemMedia>
                  <ItemContent>
                    <ItemTitle>
                      {a.who} <StatusDot status={a.status} />
                    </ItemTitle>
                    <ItemDescription>{a.what}</ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <Badge id={`${a.id}-b`} color={a.v} label={a.tag} />
                  </ItemActions>
                </Item>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="members">
            <div style={{ marginTop: 'var(--p-4)', display: 'flex', gap: 'var(--p-3)', alignItems: 'center' }}>
              <Avatar id="m1" fallback="KM" />
              <Avatar id="m2" fallback="RG" />
              <Avatar id="m3" fallback="PN" />
              <HoverCard id="m-hc" openDelay={150}>
                <HoverCardTrigger>
                  <Button id="m-hc-t" label="+4 more" style="link" />
                </HoverCardTrigger>
                <HoverCardContent>
                  <div style={{ fontSize: 'var(--text-sm)' }}>4 more members on the Design team.</div>
                </HoverCardContent>
              </HoverCard>
            </div>
          </TabsContent>
        </Tabs>

        {/* Overlays sampler */}
        <Card id="overlays">
          <CardHeader id="overlays-header" title="Overlays & actions" description="Every floating surface, plus the primary / neutral / destructive button ladder." />
          <CardBody>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--p-3)', alignItems: 'center' }}>
              <Button id="ov-dialog" label="Open dialog" onClick={() => setDialogOpen(true)} />

              <Popover id="ov-pop">
                <PopoverTrigger>
                  <Button id="ov-pop-t" label="Popover" style="outline" />
                </PopoverTrigger>
                <PopoverContent>
                  <div style={{ fontSize: 'var(--text-sm)' }}>A floating popover on the --popover surface.</div>
                </PopoverContent>
              </Popover>

              <Tooltip id="ov-tip" delayDuration={0}>
                <TooltipTrigger>
                  <Button id="ov-tip-t" label="Tooltip (stays neutral)" style="outline" />
                </TooltipTrigger>
                <TooltipContent>Tooltip never themes — it's the carve-out.</TooltipContent>
              </Tooltip>

              <ContextMenu id="ov-ctx">
                <ContextMenuTrigger>
                  <Button id="ov-ctx-t" label="Right-click me" style="outline" IconRight={Ellipsis} />
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem>Rename</ContextMenuItem>
                  <ContextMenuItem>Duplicate</ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuItem variant="destructive">Delete</ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>

              <Separator orientation="vertical" style={{ height: 24 }} />

              <Button id="b-primary" label="Primary" />
              <Button id="b-ghost" label="Ghost (neutral)" style="ghost" />
              <Button id="b-error" label="Delete" variant="error" />
            </div>
          </CardBody>
        </Card>
      </div>

      <Dialog id="confirm" open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogHeader id="confirm" title="Create a new project" description="Projects group your builds, deploys, and members." onClose={() => setDialogOpen(false)} />
        <DialogBody>
          <Input id="proj-name" label="Project name" placeholder="my-project" />
        </DialogBody>
        <DialogFooter>
          <Button id="confirm-cancel" label="Cancel" style="ghost" onClick={() => setDialogOpen(false)} />
          <Button id="confirm-create" label="Create project" onClick={() => setDialogOpen(false)} />
        </DialogFooter>
      </Dialog>
    </ThemeHarness>
  );
}

export const Dashboard_: Story = {
  name: 'Dashboard',
  render: () => <Dashboard />,
};
