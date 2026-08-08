import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { MoreHorizontal, Plus, Search } from 'lucide-react';
import {
  Avatar,
  Badge,
  Button,
  Chip,
  Combobox,
  Input,
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  StatusDot,
} from '../index';
import type { ComboboxOption } from '../index';

// ─────────────────────────────────────────────────────────────────────────────
// Test-drive screen #2: a developer builds the "Team members" list from the
// Figma handoff (page "🧪 Example — Team list"). Rows map to the Item compound;
// the status filter mirrors the design's Chips. See review notes for the
// Chip-vs-ToggleGroup question the static design couldn't disambiguate.
// ─────────────────────────────────────────────────────────────────────────────

const meta: Meta = {
  title: 'Prototypes/Team List Handoff',
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj;

const roles: ComboboxOption[] = [
  { value: 'all', label: 'All roles' },
  { value: 'admin', label: 'Admin' },
  { value: 'member', label: 'Member' },
  { value: 'viewer', label: 'Viewer' },
];

type Member = {
  name: string;
  email: string;
  initials: string;
  role: string;
  roleVariant: 'default' | 'outline';
  status: 'online' | 'away' | 'offline';
  statusLabel: string;
};

const members: Member[] = [
  { name: 'Ada Lovelace', email: 'ada@example.com', initials: 'AL', role: 'Admin', roleVariant: 'default', status: 'online', statusLabel: 'Online' },
  { name: 'Alan Turing', email: 'alan@example.com', initials: 'AT', role: 'Member', roleVariant: 'outline', status: 'online', statusLabel: 'Online' },
  { name: 'Grace Hopper', email: 'grace@example.com', initials: 'GH', role: 'Member', roleVariant: 'outline', status: 'away', statusLabel: 'Away' },
  { name: 'Katherine Johnson', email: 'katherine@example.com', initials: 'KJ', role: 'Viewer', roleVariant: 'outline', status: 'offline', statusLabel: 'Offline' },
  { name: 'Linus Torvalds', email: 'linus@example.com', initials: 'LT', role: 'Member', roleVariant: 'outline', status: 'offline', statusLabel: 'Offline' },
];

const STATUSES = ['All', 'Active', 'Invited'] as const;

function TeamList() {
  const [status, setStatus] = useState<string>('All');

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
      <div
        style={{
          maxWidth: 880,
          margin: '0 auto',
          padding: 'var(--p-8)',
          display: 'grid',
          gap: 'var(--p-6)',
        }}
      >
        {/* Header */}
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
              Team members
            </h1>
            <p
              style={{
                margin: 'var(--p-1) 0 0',
                fontSize: 'var(--text-sm)',
                color: 'var(--muted-foreground)',
              }}
            >
              Manage your team’s access, roles and status.
            </p>
          </div>
          <Button id="invite" label="Invite member" IconLeft={Plus} />
        </div>

        {/* Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--p-3)' }}>
          <div style={{ flex: 1 }}>
            <Input id="search" placeholder="Search members…" IconLeft={Search} />
          </div>
          <div style={{ width: 180 }}>
            <Combobox id="role-filter" options={roles} defaultValue="all" />
          </div>
          <div style={{ display: 'flex', gap: 'var(--p-2)' }}>
            {STATUSES.map((s) => (
              <Chip
                key={s}
                id={`status-${s.toLowerCase()}`}
                label={s}
                active={status === s}
                onClick={() => setStatus(s)}
              />
            ))}
          </div>
        </div>

        {/* List */}
        <div
          style={{
            border: 'var(--border-w-100) solid var(--border)',
            borderRadius: 'var(--rounded-xl)',
            overflow: 'hidden',
            background: 'var(--card)',
          }}
        >
          {members.map((m, i) => (
            <div key={m.email}>
              {i > 0 && <ItemSeparator />}
              <Item>
                <ItemMedia>
                  <Avatar id={`av-${m.initials}`} fallback={m.initials} />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>{m.name}</ItemTitle>
                  <ItemDescription>{m.email}</ItemDescription>
                </ItemContent>
                <ItemActions>
                  <Badge id={`role-${m.initials}`} label={m.role} variant={m.roleVariant} />
                  <StatusDot id={`dot-${m.initials}`} status={m.status} label={m.statusLabel} />
                  <Button
                    id={`more-${m.initials}`}
                    style="ghost"
                    size="sm"
                    IconLeft={MoreHorizontal}
                    aria-label={`Actions for ${m.name}`}
                  />
                </ItemActions>
              </Item>
            </div>
          ))}
        </div>

        {/* Footer / pagination */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--p-4)' }}>
          <span style={{ flex: 1, fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
            Showing 1–5 of 24 members
          </span>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive>
                  1
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">2</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">3</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">8</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
}

export const TeamList_: Story = {
  name: 'Team List',
  render: () => <TeamList />,
};
