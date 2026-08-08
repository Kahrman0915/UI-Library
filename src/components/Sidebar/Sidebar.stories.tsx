import type { Meta, StoryObj } from '@storybook/react';
import {
  Calendar,
  ChevronRight,
  Ellipsis,
  FileText,
  House,
  Inbox,
  LayoutDashboard,
  Plus,
  Search,
  Settings,
  User,
} from 'lucide-react';
import Sidebar, {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
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
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from './Sidebar';
import type { SidebarCollapsible, SidebarVariant, SidebarSide } from './Sidebar.types';
import type { UiDocsParameters } from '../../types/DocsTypes';

const meta: Meta<typeof Sidebar> = {
  title: 'Components/Sidebar',
  component: Sidebar,
  parameters: {
    layout: 'fullscreen',
    ui: {
      description:
        'The full app-sidebar subsystem: collapsible to icons or off-canvas, ⌘B to ' +
        'toggle, persisted to localStorage, and swapped for a `Drawer` under 768px. ' +
        'Has its own neutral `--sidebar-*` token surface, which a brand theme ' +
        'deliberately does not remap.',
      tags: ['compound', '23 parts', 'navigation'],
      changelog: [
        {
          date: '2026-08-08',
          summary:
            'Hovering a menu row no longer looks identical to the selected row. Hover is now a ' +
            'partial pass of the selected paint rather than the same paint.',
          detail:
            'Hover and `--active` both set a flat `--sidebar-accent`, so the two states were one ' +
            'colour told apart only by `font-weight`. Hover is now ' +
            '`color-mix(in srgb, var(--sidebar-accent) 55%, var(--sidebar))` — the accent blended ' +
            'back toward the rail it sits on, which is mode-correct for free: light rails are ' +
            'lighter than the accent so hover lands above active, dark rails are darker so it ' +
            'lands below.\n\n' +
            'IT MUST STAY A COLOUR. The base is `background: transparent` with ' +
            '`transition: background`. An earlier version of this fix layered a gradient over the ' +
            'accent, which looks right and breaks the animation — `background-image` cannot ' +
            'interpolate from `none`, so every row snapped instead of fading. Do not reintroduce ' +
            'a gradient here.',
        },
        {
          date: '2026-08-08',
          summary:
            'The `--sidebar-*` surface can now be tinted toward the active brand with ' +
            '`data-tint="rail"`. Off by default; nothing changes unless you opt in.',
          detail:
            'Part of deeper theming v2. The rail mixes `--tint-stock` for its value and a little ' +
            'raw `--primary` for its hue, in that order — swapping primary in for the stock ' +
            'instead of layering over it lightens the rail and gives back the separation from the ' +
            'content area. See docs/deeper-theming-v2-merge.md.\n\n' +
            'KNOWN GAP: `.ui-sidebar__input` paints with `--background`, a PAGE surface, so with ' +
            '`rail` alone the rail moves and the search field does not — the gap between them ' +
            'widens from 1.22:1 to 1.45:1 in dark. `page rail` brings it back to 1.28:1. Unresolved.',
        },
        {
          date: '2026-07-29',
          summary: 'Initial build complete.',
          detail:
            'Component shipped: tokenised styles, full prop surface, stories, and documented API.',
        },
      ],
    } satisfies UiDocsParameters,
  },
};

export default meta;

type Story = StoryObj<typeof Sidebar>;

const DemoSidebar = ({
  collapsible = 'offcanvas',
  variant = 'sidebar',
  side = 'left',
}: {
  collapsible?: SidebarCollapsible;
  variant?: SidebarVariant;
  side?: SidebarSide;
}) => (
  <Sidebar collapsible={collapsible} variant={variant} side={side}>
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" tooltip="Workspace">
            <LayoutDashboard />
            <span>Workspace</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
      <SidebarInput placeholder="Search…" aria-label="Search" />
    </SidebarHeader>

    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Platform</SidebarGroupLabel>
        <SidebarGroupAction aria-label="Add">
          <Plus />
        </SidebarGroupAction>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Home" isActive>
                <House />
                <span>Home</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Inbox">
                <Inbox />
                <span>Inbox</span>
              </SidebarMenuButton>
              <SidebarMenuBadge>12</SidebarMenuBadge>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Calendar">
                <Calendar />
                <span>Calendar</span>
              </SidebarMenuButton>
              <SidebarMenuAction showOnHover aria-label="More">
                <Ellipsis />
              </SidebarMenuAction>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Search">
                <Search />
                <span>Search</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarSeparator />

      <SidebarGroup>
        <SidebarGroupLabel>Documents</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Projects">
                <FileText />
                <span>Projects</span>
                <ChevronRight />
              </SidebarMenuButton>
              <SidebarMenuSub>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton href="#" isActive>
                    <span>Q4 roadmap</span>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton href="#">
                    <span>Design specs</span>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>

    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton tooltip="Account">
            <User />
            <span>Account</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton tooltip="Settings">
            <Settings />
            <span>Settings</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>

    <SidebarRail />
  </Sidebar>
);

const InsetContent = ({ title }: { title: string }) => (
  <SidebarInset>
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--p-3)',
        height: 'var(--h-14)',
        padding: '0 var(--p-4)',
        borderBottom: 'var(--border-w-100) solid var(--border)',
      }}
    >
      <SidebarTrigger />
      <span style={{ fontWeight: 'var(--font-medium)' }}>{title}</span>
    </header>
    <div style={{ padding: 'var(--p-6)', color: 'var(--muted-foreground)' }}>
      <p style={{ margin: 0 }}>
        Toggle the sidebar with the trigger or <code>⌘B</code> / <code>Ctrl B</code>.
      </p>
    </div>
  </SidebarInset>
);

export const Default: Story = {
  render: () => (
    <SidebarProvider>
      <DemoSidebar collapsible="offcanvas" />
      <InsetContent title="Offcanvas sidebar" />
    </SidebarProvider>
  ),
};

export const IconCollapsible: Story = {
  render: () => (
    <SidebarProvider>
      <DemoSidebar collapsible="icon" />
      <InsetContent title="Icon-collapsible sidebar" />
    </SidebarProvider>
  ),
};

export const Floating: Story = {
  render: () => (
    <SidebarProvider>
      <DemoSidebar collapsible="icon" variant="floating" />
      <InsetContent title="Floating variant" />
    </SidebarProvider>
  ),
};

export const Inset: Story = {
  render: () => (
    <SidebarProvider>
      <DemoSidebar collapsible="icon" variant="inset" />
      <InsetContent title="Inset variant" />
    </SidebarProvider>
  ),
};

export const RightSide: Story = {
  render: () => (
    <SidebarProvider>
      <DemoSidebar collapsible="offcanvas" side="right" />
      <InsetContent title="Right-anchored sidebar" />
    </SidebarProvider>
  ),
};
