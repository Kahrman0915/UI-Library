import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ChevronDown, LogOut, Settings, User } from 'lucide-react';
import DropdownMenu, {
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from './DropdownMenu';
import Button from '../Button/Button';
import type { UiDocsParameters } from '../../types/DocsTypes';

const meta: Meta<typeof DropdownMenu> = {
  title: 'Components/DropdownMenu',
  component: DropdownMenu,
  parameters: {
    layout: 'centered',
    ui: {
      description:
        'A menu of actions opened from a button. A menu is for *doing* things — when ' +
        'the user is choosing a value, use `Select` instead.',
      tags: ['compound', '11 parts', 'portal'],
      changelog: [
        {
          date: '2026-07-29',
          summary: 'Initial build complete.',
          detail:
            'Component shipped: tokenised styles, full prop surface, stories, and documented API.',
        },
      ],
    } satisfies UiDocsParameters,
  },
  args: {
    id: 'story-dropdown',
  },
};

export default meta;

type Story = StoryObj<typeof DropdownMenu>;

export const Playground: Story = {
  render: () => (
    <DropdownMenu id="pg">
      <DropdownMenuTrigger>
        <Button id="pg-btn" label="Open menu" IconRight={ChevronDown} style="outline" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Billing</DropdownMenuItem>
        <DropdownMenuItem>Team</DropdownMenuItem>
        <DropdownMenuItem>Subscription</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const WithIconsAndShortcuts: Story = {
  render: () => (
    <DropdownMenu id="ic">
      <DropdownMenuTrigger>
        <Button id="ic-btn" label="Account" IconRight={ChevronDown} style="outline" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <User />
          Profile
          <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings />
          Settings
          <DropdownMenuShortcut>⌘,</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <LogOut />
          Sign out
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const CheckboxItems: Story = {
  render: () => {
    const [showToolbar, setShowToolbar] = useState(true);
    const [showStatus, setShowStatus] = useState(false);
    const [showPanel, setShowPanel] = useState(false);
    return (
      <DropdownMenu id="cb">
        <DropdownMenuTrigger>
          <Button id="cb-btn" label="View" IconRight={ChevronDown} style="outline" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Appearance</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={showToolbar}
            onCheckedChange={setShowToolbar}
          >
            Toolbar
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={showStatus}
            onCheckedChange={setShowStatus}
          >
            Status bar
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={showPanel}
            onCheckedChange={setShowPanel}
            disabled
          >
            Panel (disabled)
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
};

export const RadioItems: Story = {
  render: () => {
    const [position, setPosition] = useState('bottom');
    return (
      <DropdownMenu id="rd">
        <DropdownMenuTrigger>
          <Button id="rd-btn" label={`Panel: ${position}`} IconRight={ChevronDown} style="outline" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Panel Position</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={position} onValueChange={setPosition}>
            <DropdownMenuRadioItem value="top">Top</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="bottom">Bottom</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="right">Right</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
};

export const Complex: Story = {
  render: () => (
    <DropdownMenu id="cx">
      <DropdownMenuTrigger>
        <Button id="cx-btn" label="Open" IconRight={ChevronDown} style="outline" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <User />
            Profile
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Billing
            <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings />
            Settings
            <DropdownMenuShortcut>⌘,</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Team</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem>Invite users</DropdownMenuItem>
          <DropdownMenuItem>New team</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>API (disabled)</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <LogOut />
          Sign out
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const Controlled: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Pass `open` and `onOpenChange` to own the state — needed when something ' +
          'other than the trigger has to open or close the menu, or when opening it ' +
          'should also do something else (close a panel, fire analytics). ' +
          '`onOpenChange` fires for **every** cause: the trigger, Escape, an outside ' +
          'click, and selecting an item. Leave `open` off for the usual case; the ' +
          'menu manages itself.',
      },
    },
  },
  render: () => {
    const [open, setOpen] = useState(false);
    const [lastAction, setLastAction] = useState('—');
    return (
      <div style={{ display: 'grid', gap: 'var(--p-4)', justifyItems: 'start' }}>
        <div style={{ display: 'flex', gap: 'var(--p-2)' }}>
          <Button
            id="ext-open"
            label="Open from outside"
            style="outline"
            size="small"
            onClick={() => setOpen(true)}
          />
          <Button
            id="ext-close"
            label="Close from outside"
            style="outline"
            size="small"
            onClick={() => setOpen(false)}
          />
        </div>

        <DropdownMenu id="dm-controlled" open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger>
            <Button id="dm-controlled-trigger" label="Actions" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setLastAction('Rename')}>
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLastAction('Duplicate')}>
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setLastAction('Delete')}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <p
          style={{
            margin: 0,
            fontSize: 'var(--text-sm)',
            color: 'var(--muted-foreground)',
          }}
        >
          open: <strong>{String(open)}</strong> · last action:{' '}
          <strong>{lastAction}</strong>
        </p>
      </div>
    );
  },
};
