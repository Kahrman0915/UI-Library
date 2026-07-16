import type { Meta, StoryObj } from '@storybook/react';
import {
  Calendar,
  ChevronRight,
  FileText,
  Home,
  Inbox,
  LayoutDashboard,
  MoreHorizontal,
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

const meta: Meta<typeof Sidebar> = {
  title: 'Components/Sidebar',
  component: Sidebar,
  parameters: { layout: 'fullscreen' },
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
                <Home />
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
                <MoreHorizontal />
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
