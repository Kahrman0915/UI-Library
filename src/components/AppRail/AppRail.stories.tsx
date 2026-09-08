import type { Meta, StoryObj } from '@storybook/react';
import { Bell, Box, FileText, Flame, Grid2x2, Layers, LayoutGrid, Settings } from 'lucide-react';
import AppRail, { AppRailItem } from './AppRail';
import Avatar from '../Avatar';
import Button from '../Button';
import ModeToggler from '../ModeToggler';
import type { UiDocsParameters } from '../../types/DocsTypes';

const meta: Meta<typeof AppRail> = {
  title: 'Components/AppRail',
  component: AppRail,
  subcomponents: { AppRailItem },
  parameters: {
    layout: 'padded',
    ui: {
      description:
        'The application switcher: a 48px rail of icon-only links on the sidebar surface, with a `header` (the sidebar ' +
        'trigger) above and a `footer` (mode, account, settings) below. Each `AppRailItem` is an `<a>` on the shared ' +
        'icon-button shell — the rail reads as icons, not brand tiles, and nothing here takes a brand. `AppShell` composes ' +
        'it beside `Sidebar`, the way it composes `TabBar` in the strip.',
      tags: ['chrome', 'navigation', 'shell'],
      usage: {
        when: ['One per application, on the inline-start edge, inside `AppShell`. One item per sub-application; `active` on the one the user is in.'],
        avoid: ['Using it for navigation *within* an application — that is `Sidebar`. The rail moves between applications.', 'Drawing brand colour on the items. The destination paints its own colour once you are in it.'],
        notes: '`href` renders an `<a>`; omit it for a `<button>` when a router does the switch. `count` shows as a corner dot (the number is announced, not printed) — a visible number belongs in the sidebar row\'s `SidebarMenuBadge`.',
      },
      changelog: [
        { date: '2026-09-07', summary: 'The unread count is a small dot, not a numbered pill.', detail: '`count` renders a `StatusDot` (busy, 10px) in the tile corner with an accessible `${count} unread` label; the 24px Badge swamped the 36px tile.' },
        { date: '2026-09-07', summary: 'Split out of AppShell as its own component.', detail: 'Same API and classes; `AppShell` now imports it. Own Figma page.' },
        { date: '2026-09-07', summary: 'Initial build inside AppShell. Icon-only links on the icon-button shell (owner corrected the first Mark-tile cut).', detail: '`AppRail` (label, header, footer) and `AppRailItem` (id, label, Icon, active, count, href).' },
      ],
    } satisfies UiDocsParameters,
  },
};
export default meta;
type Story = StoryObj<typeof AppRail>;

const APPS = [
  { code: 'db', name: 'DART Central', Icon: LayoutGrid, active: true },
  { code: 'dc', name: 'IRM', Icon: Box, count: 3 },
  { code: 'ph', name: 'Phoenix', Icon: Flame },
  { code: 'ec', name: 'Eclipse', Icon: Layers },
  { code: 'nb', name: 'NoteGen', Icon: FileText },
  { code: 'rm', name: 'DARTBoards', Icon: Grid2x2 },
];

const Items = () => (
  <>
    {APPS.map(({ code, name, Icon, active, count }) => (
      <AppRailItem key={code} id={`rail-${code}`} href={`/${code}`} label={name} Icon={Icon} active={active} count={count} />
    ))}
  </>
);

/** Six applications, one active, one with a count; the sidebar trigger above, account below. */
export const Playground: Story = {
  render: () => (
    <div style={{ height: 520, display: 'flex' }}>
      <AppRail
        header={<Button id="rail-collapse" style="ghost" iconOnly IconCenter={() => <LayoutGrid size={16} aria-hidden="true" />} aria-label="Collapse sidebar" />}
        footer={
          <>
            <Button id="rail-notifications" style="ghost" size="sm" iconOnly IconCenter={() => <Bell size={16} aria-hidden="true" />} aria-label="Notifications" />
            <ModeToggler id="rail-mode" variant="ghost" size="sm" />
            <Button id="rail-settings" style="ghost" size="sm" iconOnly IconCenter={() => <Settings size={16} aria-hidden="true" />} aria-label="Settings" />
            <Avatar id="rail-me" fallback="KM" alt="Kahrman McKenzie" size="sm" />
          </>
        }
      >
        <Items />
      </AppRail>
    </div>
  ),
};

/** The rail with nothing but applications. */
export const ItemsOnly: Story = {
  render: () => (
    <div style={{ height: 360, display: 'flex' }}>
      <AppRail>
        <Items />
      </AppRail>
    </div>
  ),
};
