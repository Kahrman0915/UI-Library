import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import ContextMenu, {
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from './ContextMenu';

const meta: Meta<typeof ContextMenu> = {
  title: 'Components/ContextMenu',
  component: ContextMenu,
  parameters: { layout: 'centered' },
  args: {
    id: 'story-context-menu',
  },
};

export default meta;

type Story = StoryObj<typeof ContextMenu>;

const droparea: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 360,
  height: 200,
  background: 'var(--card)',
  border: 'var(--border-w-100) dashed var(--border)',
  borderRadius: 'var(--rounded-lg)',
  color: 'var(--muted-foreground)',
  fontSize: 'var(--text-sm)',
  userSelect: 'none',
};

export const Playground: Story = {
  render: (args) => (
    <ContextMenu {...args}>
      <ContextMenuTrigger>
        <div style={droparea}>Right-click here</div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>
          Back
          <ContextMenuShortcut>⌘[</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>
          Forward
          <ContextMenuShortcut>⌘]</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>
          Reload
          <ContextMenuShortcut>⌘R</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem>Save Page As…</ContextMenuItem>
        <ContextMenuItem>Print…</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
};

export const WithCheckboxAndRadio: Story = {
  render: () => {
    const [showToolbar, setShowToolbar] = useState(true);
    const [showSidebar, setShowSidebar] = useState(false);
    const [position, setPosition] = useState('bottom');
    return (
      <ContextMenu id="cx-check">
        <ContextMenuTrigger>
          <div style={droparea}>Right-click here</div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuLabel>View</ContextMenuLabel>
          <ContextMenuCheckboxItem
            checked={showToolbar}
            onCheckedChange={setShowToolbar}
          >
            Show toolbar
            <ContextMenuShortcut>⌘⇧T</ContextMenuShortcut>
          </ContextMenuCheckboxItem>
          <ContextMenuCheckboxItem
            checked={showSidebar}
            onCheckedChange={setShowSidebar}
          >
            Show sidebar
          </ContextMenuCheckboxItem>
          <ContextMenuSeparator />
          <ContextMenuLabel>Position</ContextMenuLabel>
          <ContextMenuRadioGroup
            value={position}
            onValueChange={setPosition}
          >
            <ContextMenuRadioItem value="top">Top</ContextMenuRadioItem>
            <ContextMenuRadioItem value="bottom">Bottom</ContextMenuRadioItem>
            <ContextMenuRadioItem value="left">Left</ContextMenuRadioItem>
            <ContextMenuRadioItem value="right">Right</ContextMenuRadioItem>
          </ContextMenuRadioGroup>
        </ContextMenuContent>
      </ContextMenu>
    );
  },
};

export const WithSubmenu: Story = {
  render: () => (
    <ContextMenu id="cx-sub">
      <ContextMenuTrigger>
        <div style={droparea}>Right-click for submenu</div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>New Tab</ContextMenuItem>
        <ContextMenuItem>New Window</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuSub>
          <ContextMenuSubTrigger>Share</ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem>Email link</ContextMenuItem>
            <ContextMenuItem>Copy link</ContextMenuItem>
            <ContextMenuSub>
              <ContextMenuSubTrigger>Send to…</ContextMenuSubTrigger>
              <ContextMenuSubContent>
                <ContextMenuItem>Bluetooth</ContextMenuItem>
                <ContextMenuItem>Nearby device</ContextMenuItem>
                <ContextMenuItem>Messages</ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuSub>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator />
        <ContextMenuItem variant="destructive">
          Move to Trash
          <ContextMenuShortcut>⌘⌫</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
};

export const DestructiveActions: Story = {
  render: () => (
    <ContextMenu id="cx-destructive">
      <ContextMenuTrigger>
        <div style={droparea}>Right-click for delete</div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>Open</ContextMenuItem>
        <ContextMenuItem>Rename</ContextMenuItem>
        <ContextMenuItem>Duplicate</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem variant="destructive">
          Delete
          <ContextMenuShortcut>⌫</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
};

export const WithGroups: Story = {
  render: () => (
    <ContextMenu id="cx-groups">
      <ContextMenuTrigger>
        <div style={droparea}>Right-click here</div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuGroup>
          <ContextMenuLabel>Edit</ContextMenuLabel>
          <ContextMenuItem>
            Cut
            <ContextMenuShortcut>⌘X</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem>
            Copy
            <ContextMenuShortcut>⌘C</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem>
            Paste
            <ContextMenuShortcut>⌘V</ContextMenuShortcut>
          </ContextMenuItem>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuGroup>
          <ContextMenuLabel>Selection</ContextMenuLabel>
          <ContextMenuItem>Select all</ContextMenuItem>
          <ContextMenuItem>Deselect</ContextMenuItem>
        </ContextMenuGroup>
      </ContextMenuContent>
    </ContextMenu>
  ),
};
