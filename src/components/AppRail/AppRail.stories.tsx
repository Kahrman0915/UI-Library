import type { Meta, StoryObj } from '@storybook/react';
import { Bell, Box, FileText, Flame, Grid2x2, Layers, LayoutGrid, Settings } from 'lucide-react';
import AppRail, { AppRailItem } from './AppRail';
import { SidebarProvider, SidebarTrigger } from '../Sidebar';
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
        'The application switcher: a 52px rail of icon-only links on the sidebar surface, with a `header` (the sidebar ' +
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
        {
          date: '2026-09-15',
          summary: 'A quieter rail: muted icons, a hover that differs from the selected tile, more room between tiles, and the active application toggles the sidebar.',
          detail:
            'Resting tiles are `--sidebar-muted-foreground` and brighten to `--sidebar-accent-foreground` on hover and when active. Hover is a 35% pass of `--sidebar-accent` over `--sidebar` and active a 70% pass, so the two are never one paint (the collision recorded on 2026-09-11 is fixed). The sidebar trigger in the header is muted the same way.\n\n' +
            'Tiles are 8 apart (`--p-2`) and start 16 below the header (`--p-4`); the rail no longer matches the sidebar menu\'s 4px gap. Width 48 → 52 through `--app-rail-width`. The header takes a `--h-11` minimum, the same as `.ui-sidebar__header`, so both bottom rules sit at y 92 in the shell.\n\n' +
            'Clicking the active `AppRailItem` inside a `SidebarProvider` calls `preventDefault` and toggles the sidebar; your `onClick` runs first and can opt out with `preventDefault`. Outside a provider it is a plain link.',
        },
        {
          date: '2026-09-11',
          summary: 'The tiles sit 4px apart instead of 2, matching the gap between `Sidebar` menu rows.',
          detail:
            'The rail and the sidebar stand side by side and read as one piece of chrome, so they should not use different rungs. At 2 an active tile and the tile hovered beneath it left a 2px seam between two 36px fills, which reads as one block rather than two. Applies to the applications list and the footer.\n\n' +
            'Still open, and visible in the same situation: a hovered tile paints the **same** `--sidebar-accent` as the selected tile, so the two states are indistinguishable. `Sidebar` hit this exact collision and fixed it on 2026-08-08 by making hover a partial pass of the selected paint; the rail never got that change.',
        },
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
    <SidebarProvider style={{ minHeight: 0 }}>
    <div style={{ height: 520, display: 'flex' }}>
      <AppRail
        header={<SidebarTrigger />}
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
    </SidebarProvider>
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
