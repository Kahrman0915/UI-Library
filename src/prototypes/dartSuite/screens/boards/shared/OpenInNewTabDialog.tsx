/* The tab bar's "+" — Open in new tab (Figma: Space S5.1–S5.4).

   S5.1 recent + quick actions · S5.2 a type filter with nothing in it · S5.3
   results grouped by type · S5.4 no results. Whatever you pick opens in a NEW
   tab — that is the point of the "+". */

import { Database, Gauge, LayoutDashboard, LayoutGrid, Search, SearchX, Sparkles, Workflow } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import Dialog, { DialogBody, DialogHeader } from '../../../../../components/Dialog';
import Empty, { EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '../../../../../components/Empty';
import Input from '../../../../../components/Input';
import Item, { ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from '../../../../../components/Item';
import Section from '../../../../../components/Section';
import ScrollArea from '../../../../../components/ScrollArea';
import ToggleGroup, { ToggleGroupItem } from '../../../../../components/ToggleGroup';
import { useNav } from '../../../nav';
import { useSuite } from '../../../store';
import type { Route } from '../../../types';
import '../space/Space.scss';

type Kind = 'spaces' | 'dashboards' | 'metrics' | 'workflows' | 'aiden';
type Filter = 'all' | Kind;

type Result = { key: string; kind: Kind; title: string; description: string; Icon: LucideIcon; route: Route };

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'spaces', label: 'Spaces' },
  { value: 'dashboards', label: 'Dashboards' },
  { value: 'metrics', label: 'Metrics' },
  { value: 'workflows', label: 'Workflows' },
  { value: 'aiden', label: 'Aiden chats' },
];

const GROUP_LABEL: Record<Kind, string> = {
  aiden: 'Aiden',
  spaces: 'Spaces',
  dashboards: 'Dashboards',
  metrics: 'Metrics',
  workflows: 'Workflows',
};
const ORDER: Kind[] = ['aiden', 'spaces', 'dashboards', 'metrics', 'workflows'];

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

export function OpenInNewTabDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state } = useSuite();
  const nav = useNav();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  // Every opening starts fresh.
  useEffect(() => {
    if (open) {
      setQuery('');
      setFilter('all');
    }
  }, [open]);

  const all = useMemo<Result[]>(() => {
    const spaceOf = (dashId: string) => state.spaces.find((s) => s.items.some((i) => i.dashboardId === dashId))?.name;
    return [
      ...state.aidenChats.map<Result>((c) => ({
        key: `aiden-${c.id}`,
        kind: 'aiden',
        title: c.title,
        description: `Aiden chat · ${c.updatedAt}`,
        Icon: Sparkles,
        route: { page: 'aiden-chat', chatId: c.id },
      })),
      ...state.spaces.map<Result>((s) => ({
        key: `space-${s.id}`,
        kind: 'spaces',
        title: s.name,
        description: `${s.items.length} ${s.items.length === 1 ? 'dashboard' : 'dashboards'} · ${s.shared ? 'shared with you' : 'only you'}`,
        Icon: LayoutGrid,
        route: { page: 'space', id: s.id },
      })),
      ...state.dashboards.map<Result>((d) => ({
        key: `dash-${d.id}`,
        kind: 'dashboards',
        title: d.name,
        description: spaceOf(d.id) ? `In ${spaceOf(d.id)}` : `${d.category} · ${d.source}`,
        Icon: LayoutDashboard,
        route: { page: 'dashboard', id: d.id },
      })),
      ...METRICS.map<Result>((m) => ({
        key: `metric-${m.name}`,
        kind: 'metrics',
        title: m.name,
        description: `In ${m.where}`,
        Icon: Gauge,
        route: { page: 'placeholder', title: 'Metrics' },
      })),
      ...WORKFLOWS.map<Result>((w) => ({
        key: `workflow-${w.name}`,
        kind: 'workflows',
        title: w.name,
        description: w.where,
        Icon: Workflow,
        route: { page: 'placeholder', title: 'Workflows' },
      })),
    ];
  }, [state.aidenChats, state.spaces, state.dashboards]);

  const q = query.trim().toLowerCase();
  const matches = all.filter(
    (r) => (filter === 'all' || r.kind === filter) && (!q || r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q)),
  );

  const pick = (route: Route) => {
    onClose();
    nav.open(route);
  };

  const row = (r: Result) => (
    <Item key={r.key} size="sm" onClick={() => pick(r.route)} aria-label={`${r.title}, opens in a new tab`}>
      <ItemMedia variant="icon">
        <r.Icon />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{r.title}</ItemTitle>
        <ItemDescription>{r.description}</ItemDescription>
      </ItemContent>
    </Item>
  );

  const lastChat = state.aidenChats[0];
  const recent: Result[] = [
    ...(lastChat
      ? [{ key: 'recent-chat', kind: 'aiden' as const, title: 'Aiden chat', description: `Opened ${lastChat.updatedAt.toLowerCase()}`, Icon: Sparkles, route: { page: 'aiden-chat', chatId: lastChat.id } as Route }]
      : []),
    { key: 'recent-explorer', kind: 'workflows', title: 'Data Explorer', description: 'Opened 3 days ago', Icon: Database, route: { page: 'placeholder', title: 'Data Explorer' } },
  ];
  const quick: Result[] = [
    { key: 'quick-aiden', kind: 'aiden', title: 'Start a new chat with Aiden', description: 'Ask Aiden about your spaces', Icon: Sparkles, route: { page: 'aiden-launcher' } },
    { key: 'quick-explorer', kind: 'workflows', title: 'Open Data Explorer', description: 'Build a query and add it to a space', Icon: Database, route: { page: 'placeholder', title: 'Data Explorer' } },
  ];

  let content;
  if (!q && filter === 'all') {
    // S5.1
    content = (
      <>
        <Section id="ds-newtab-recent" variant="group" heading="Last 30 days">
          <ItemGroup>{recent.map(row)}</ItemGroup>
        </Section>
        <Section id="ds-newtab-quick" variant="group" heading="Quick actions">
          <ItemGroup>{quick.map(row)}</ItemGroup>
        </Section>
      </>
    );
  } else if (!matches.length && !q) {
    // S5.2
    content = (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Search />
          </EmptyMedia>
          <EmptyTitle>Search to get started</EmptyTitle>
          <EmptyDescription>Type a space, dashboard, metric or workflow, or ask Aiden a question.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  } else if (!matches.length) {
    // S5.4
    content = (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <SearchX />
          </EmptyMedia>
          <EmptyTitle>No results for “{query.trim()}”</EmptyTitle>
          <EmptyDescription>Check the spelling, or search for a space, dashboard or metric by name.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  } else {
    // S5.3
    content = ORDER.filter((k) => matches.some((m) => m.kind === k)).map((k) => (
      <Section key={k} id={`ds-newtab-group-${k}`} variant="group" heading={GROUP_LABEL[k]}>
        <ItemGroup>{matches.filter((m) => m.kind === k).slice(0, 6).map(row)}</ItemGroup>
      </Section>
    ));
  }

  return (
    <Dialog id="ds-newtab" open={open} onClose={onClose} closeOnOutsideClick>
      <DialogHeader id="ds-newtab-header" title="Open in new tab" onClose={onClose} />
      <DialogBody>
        <div className="ds-newtab__body">
          <Input
            id="ds-newtab-search"
            aria-label="Search spaces, dashboards and metrics"
            placeholder="Search spaces, dashboards and metrics"
            IconLeft={Search}
            value={query}
            onValueChange={setQuery}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter' && q && matches[0]) pick(matches[0].route);
            }}
          />
          <ScrollArea id="ds-newtab-filters-scroll" className="ds-newtab__filters" orientation="horizontal" type="hover">
            <ToggleGroup
              id="ds-newtab-filter"
              type="single"
              size="sm"
              value={filter}
              onValueChange={(v) => setFilter((v || 'all') as Filter)}
              aria-label="Filter by type"
            >
              {FILTERS.map((f) => (
                <ToggleGroupItem key={f.value} value={f.value} label={f.label} />
              ))}
            </ToggleGroup>
          </ScrollArea>
          <ScrollArea id="ds-newtab-results-scroll" className="ds-scroll-max ds-newtab__scroll">
            <div className="ds-newtab__results" aria-live="polite">
              {content}
            </div>
          </ScrollArea>
        </div>
      </DialogBody>
    </Dialog>
  );
}
