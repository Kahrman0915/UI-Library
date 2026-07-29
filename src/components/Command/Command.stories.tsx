import { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Calculator,
  Calendar,
  CreditCard,
  Search,
  Settings,
  SmilePlus,
  Trash2,
  User,
} from 'lucide-react';
import Command, {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from './Command';
import type { UiDocsParameters } from '../../types/DocsTypes';

const meta: Meta<typeof Command> = {
  title: 'Components/Command',
  component: Command,
  parameters: {
    layout: 'padded',
    ui: {
      description:
        'The ⌘K palette: a search field over a grouped, keyboard-driven list of ' +
        'actions. `CommandDialog` mounts it in a modal for the app-wide shortcut.',
      tags: ['compound', '9 parts', 'portal'],
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
    id: 'story-command',
  },
};

export default meta;

type Story = StoryObj<typeof Command>;

// ─── Playground — inline Command ───────────────────────────────────────────

export const Playground: Story = {
  render: (args) => (
    <div style={{ width: 480 }}>
      <Command {...args}>
        <CommandInput placeholder="Type a command or search…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem onSelect={() => alert('Calendar')}>
              <Calendar />
              Calendar
            </CommandItem>
            <CommandItem onSelect={() => alert('Search emoji')}>
              <SmilePlus />
              Search emoji
            </CommandItem>
            <CommandItem onSelect={() => alert('Calculator')}>
              <Calculator />
              Calculator
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Settings">
            <CommandItem onSelect={() => alert('Profile')}>
              <User />
              Profile
              <CommandShortcut>⌘P</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => alert('Billing')}>
              <CreditCard />
              Billing
              <CommandShortcut>⌘B</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => alert('Settings')}>
              <Settings />
              Settings
              <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  ),
};

// ─── With destructive action ────────────────────────────────────────────────

export const WithDestructive: Story = {
  render: (args) => (
    <div style={{ width: 480 }}>
      <Command {...args}>
        <CommandInput />
        <CommandList>
          <CommandEmpty>No results.</CommandEmpty>
          <CommandGroup heading="Actions">
            <CommandItem onSelect={() => alert('Rename')}>Rename…</CommandItem>
            <CommandItem onSelect={() => alert('Duplicate')}>
              Duplicate
            </CommandItem>
            <CommandItem
              variant="error"
              onSelect={() => alert('Delete')}
            >
              <Trash2 />
              Delete
              <CommandShortcut>⌘⌫</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  ),
};

// ─── With disabled item ────────────────────────────────────────────────────

export const WithDisabledItem: Story = {
  render: (args) => (
    <div style={{ width: 480 }}>
      <Command {...args}>
        <CommandInput placeholder="Try me…" />
        <CommandList>
          <CommandGroup heading="Team">
            <CommandItem onSelect={() => alert('Invite')}>
              Invite member
            </CommandItem>
            <CommandItem disabled onSelect={() => alert('Removed')}>
              Remove member (admin only)
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  ),
};

// ─── Empty state ───────────────────────────────────────────────────────────

export const EmptyState: Story = {
  render: (args) => (
    <div style={{ width: 480 }}>
      <Command {...args} defaultValue="zzzzz">
        <CommandInput />
        <CommandList>
          <CommandEmpty>No results for "zzzzz".</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem>Calendar</CommandItem>
            <CommandItem>Calculator</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  ),
};

// ─── With keywords (extra searchable terms per item) ───────────────────────

export const WithKeywords: Story = {
  render: (args) => (
    <div style={{ width: 480 }}>
      <Command {...args}>
        <CommandInput placeholder="Try 'money' or 'plastic'…" />
        <CommandList>
          <CommandEmpty>No results.</CommandEmpty>
          <CommandGroup heading="Wallet">
            <CommandItem keywords={['money', 'cash', 'usd']}>
              <CreditCard />
              Send payment
            </CommandItem>
            <CommandItem keywords={['plastic', 'card', 'visa', 'mastercard']}>
              <CreditCard />
              Manage cards
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  ),
};

// ─── Dialog variant — the classic cmd-K modal ──────────────────────────────

export const AsDialog: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    useEffect(() => {
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          setOpen((o) => !o);
        }
      };
      document.addEventListener('keydown', onKey);
      return () => document.removeEventListener('keydown', onKey);
    }, []);

    return (
      <div style={{ padding: 24 }}>
        <p
          style={{
            margin: 0,
            fontSize: 'var(--text-sm)',
            color: 'var(--muted-foreground)',
          }}
        >
          Press <kbd>⌘K</kbd> (or <kbd>Ctrl+K</kbd>) or&nbsp;
          <button
            type="button"
            onClick={() => setOpen(true)}
            style={{
              padding: '4px 8px',
              border: 'var(--border-w-100) solid var(--border)',
              borderRadius: 'var(--rounded-sm)',
              background: 'var(--background)',
              color: 'var(--foreground)',
              fontFamily: 'var(--font-family)',
              cursor: 'pointer',
            }}
          >
            open the command menu
          </button>
        </p>
        <CommandDialog
          id="story-command-dialog"
          open={open}
          onClose={() => setOpen(false)}
          title="Command menu"
        >
          <Command id="story-command-dialog-command">
            <CommandInput />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Suggestions">
                <CommandItem onSelect={() => setOpen(false)}>
                  <Search />
                  Search projects
                </CommandItem>
                <CommandItem onSelect={() => setOpen(false)}>
                  <Calendar />
                  Calendar
                </CommandItem>
                <CommandItem onSelect={() => setOpen(false)}>
                  <SmilePlus />
                  Search emoji
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Settings">
                <CommandItem onSelect={() => setOpen(false)}>
                  <User />
                  Profile
                  <CommandShortcut>⌘P</CommandShortcut>
                </CommandItem>
                <CommandItem onSelect={() => setOpen(false)}>
                  <Settings />
                  Settings
                  <CommandShortcut>⌘,</CommandShortcut>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </CommandDialog>
      </div>
    );
  },
};
