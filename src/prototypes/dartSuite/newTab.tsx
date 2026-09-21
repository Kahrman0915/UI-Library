/* ── DART Suite prototype · the tab bar's "+" ────────────────────────────────
   The library's new-tab palette (`TabBarNewTabMenu`), filled from the suite:
   Create actions, Recently opened, then every space, dashboard, metric,
   workflow and Aiden chat by type, with a filter chip per type. Whatever you
   pick opens in a NEW tab in the set on screen — that is the point of the "+".
   It replaced the "Open in new tab" dialog (Figma: Space S5.1–S5.4) on
   2026-09-21 so the Suite's "+" matches the TabBar and AppShell examples.

   The Home screen's search card opens the same palette through `useUi`. */

import { Database, Gauge, LayoutDashboard, LayoutGrid, Sparkles, Workflow } from 'lucide-react';
import { useMemo } from 'react';
import { TabBarNewTabMenu } from '../../components/TabBar';
import type { TabBarNewTabCategory, TabBarNewTabItem } from '../../components/TabBar';
import { useNav } from './nav';
import { useSuite } from './store';
import type { Route } from './types';
import { useUi } from './ui';

const CATEGORIES: TabBarNewTabCategory[] = [
  { value: 'spaces', label: 'Spaces' },
  { value: 'dashboards', label: 'Dashboards' },
  { value: 'metrics', label: 'Metrics' },
  { value: 'workflows', label: 'Workflows' },
  { value: 'aiden', label: 'Aiden chats' },
];

/* Metrics and workflows have no screens in the suite; they open the placeholder. */
const METRICS = [
  { name: 'Average handle time', where: 'Servicing operations' },
  { name: 'Promise-to-pay rate', where: 'Collections desk' },
  { name: 'Win rate', where: 'Weekly Ops Review' },
  { name: 'First response time', where: 'Servicing operations' },
];
const WORKFLOWS = [
  { name: 'Monday ops digest', where: 'Runs every Monday at 07:00' },
  { name: 'Collections escalation', where: 'Runs when promise-to-pay drops below 60%' },
];

type Entry = TabBarNewTabItem & { route: Route };

export function SuiteNewTab() {
  const { state } = useSuite();
  const nav = useNav();
  const { newTabOpen, setNewTabOpen } = useUi();

  const { items, recent, actions } = useMemo(() => {
    const spaceOf = (dashId: string) => state.spaces.find((s) => s.items.some((i) => i.dashboardId === dashId))?.name;
    const items: Entry[] = [
      ...state.spaces.map<Entry>((s) => ({
        value: `space-${s.id}`,
        label: s.name,
        description: `${s.items.length} ${s.items.length === 1 ? 'dashboard' : 'dashboards'} · ${s.shared ? 'shared with you' : 'only you'}`,
        Icon: LayoutGrid,
        category: 'spaces',
        route: { page: 'space', id: s.id },
      })),
      ...state.dashboards.map<Entry>((d) => ({
        value: `dash-${d.id}`,
        label: d.name,
        description: spaceOf(d.id) ? `In ${spaceOf(d.id)}` : `${d.category} · ${d.source}`,
        Icon: LayoutDashboard,
        category: 'dashboards',
        route: { page: 'dashboard', id: d.id },
      })),
      ...METRICS.map<Entry>((m) => ({
        value: `metric-${m.name}`,
        label: m.name,
        description: `In ${m.where}`,
        Icon: Gauge,
        category: 'metrics',
        route: { page: 'placeholder', title: 'Metrics' },
      })),
      ...WORKFLOWS.map<Entry>((w) => ({
        value: `workflow-${w.name}`,
        label: w.name,
        description: w.where,
        Icon: Workflow,
        category: 'workflows',
        route: { page: 'placeholder', title: 'Workflows' },
      })),
      ...state.aidenChats.map<Entry>((c) => ({
        value: `aiden-${c.id}`,
        label: c.title,
        description: c.updatedAt,
        Icon: Sparkles,
        category: 'aiden',
        route: { page: 'aiden-chat', chatId: c.id },
      })),
    ];
    const lastChat = state.aidenChats[0];
    const recent: Entry[] = [
      ...(lastChat
        ? [{ value: 'recent-chat', label: lastChat.title, description: `Opened ${lastChat.updatedAt.toLowerCase()}`, Icon: Sparkles, category: 'aiden', route: { page: 'aiden-chat', chatId: lastChat.id } as Route }]
        : []),
      { value: 'recent-explorer', label: 'Data Explorer', description: 'Opened 3 days ago', Icon: Database, category: 'workflows', route: { page: 'placeholder', title: 'Data Explorer' } },
    ];
    const actions: Entry[] = [
      { value: 'new-aiden', label: 'New chat with Aiden', Icon: Sparkles, route: { page: 'aiden-launcher' } },
      { value: 'new-explorer', label: 'Open Data Explorer', Icon: Database, route: { page: 'placeholder', title: 'Data Explorer' } },
    ];
    return { items, recent, actions };
  }, [state.spaces, state.dashboards, state.aidenChats]);

  return (
    <TabBarNewTabMenu
      items={items}
      categories={CATEGORIES}
      recent={recent}
      actions={actions}
      placeholder="Search spaces, dashboards and metrics…"
      emptyText="No results. Check the spelling, or search for a space, dashboard or metric by name."
      open={newTabOpen}
      onOpenChange={setNewTabOpen}
      onClick={nav.markTabBarUsed}
      onOpen={(item) => nav.open((item as Entry).route)}
    />
  );
}
