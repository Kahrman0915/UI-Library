/* DartBoards · Marketplace › All.

   Everything the Marketplace offers on one page — dashboards, metrics and web
   reports — for someone who knows the SUBJECT before they know the kind.

   - LANDS IN ONE A–Z LIST BY TITLE (owner, 2026-10-02), every kind mixed, under
     letter headings — so everything about "Business" is together under B,
     whatever kind it is. Grouping by kind is one of the sort options, not the default.
   - One search and one Subject filter across all three, on the title row like
     every other Marketplace page; the Kind toggle is the one row under it.
   - A Kind filter narrows the page to one kind without leaving it.
   - The cards ARE each kind's own card (Browse, Metrics, Reports), so the actions
     are identical everywhere: Add to space on all of them, plus "Open report" on
     web reports alone — the one exception, until reports move inside DART Central. */

import { ChevronDown, Search, SearchX } from 'lucide-react';
import { useState } from 'react';
import Button from '../../../../../components/Button';
import Combobox from '../../../../../components/Combobox';
import DropdownMenu, { DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from '../../../../../components/DropdownMenu';
import Empty, { EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '../../../../../components/Empty';
import Input from '../../../../../components/Input';
import PageContainer from '../../../../../components/PageContainer';
import PageHeader from '../../../../../components/PageHeader';
import Section from '../../../../../components/Section';
import Stack from '../../../../../components/Stack';
import ToggleGroup, { ToggleGroupItem } from '../../../../../components/ToggleGroup';
import Toolbar, { ToolbarGroup } from '../../../../../components/Toolbar';
import Grid from '../../../../../components/Grid';
import { useNav } from '../../../nav';
import { useSuite } from '../../../store';
import type { Dashboard, Route } from '../../../types';
import { BrowseCard } from '../browse/BrowseItems';
import { subjectOf } from '../builder/facets';
import { updatedOn } from '../shared/boardsShared';
import { MetricCard, isMetric } from '../metrics';
import type { Metric } from '../metrics';
import { ReportCard, isReport } from '../reports';
import type { Report } from '../reports';
import '../browse/Browse.scss';
import '../reports/Reports.scss';
import '../metrics/Metrics.scss';

type Kind = 'dashboards' | 'metrics' | 'reports';
/** One row of each kind on the landing view. */
const PER_ROW = 4;

type Arrange = 'az' | 'za' | 'recent' | 'kind';
const ARRANGE: { id: Arrange; label: string; short: string }[] = [
  { id: 'az', label: 'Name (A–Z)', short: 'Name A–Z' },
  { id: 'za', label: 'Name (Z–A)', short: 'Name Z–A' },
  { id: 'recent', label: 'Recently updated', short: 'Recently updated' },
  { id: 'kind', label: 'Grouped by kind', short: 'Grouped by kind' },
];

/** The first letter a title files under; digits and symbols file together under #. */
const letterOf = (title: string) => {
  const c = title.trim().charAt(0).toUpperCase();
  return /[A-Z]/.test(c) ? c : '#';
};

export function MarketplaceAll() {
  const { state } = useSuite();
  const { go } = useNav();
  const [arrange, setArrange] = useState<Arrange>('az');
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState<Kind | ''>('');
  const [subject, setSubject] = useState('');

  const dashboards = state.dashboards.filter((d) => d.lifecycle === 'published' && !d.external);
  const metrics = state.assets.filter(isMetric);
  const reports = state.assets.filter(isReport);

  const q = query.trim().toLowerCase();
  const subjects = [
    ...new Set([...dashboards.map((d) => subjectOf(state, d)), ...metrics.map((m) => m.subject), ...reports.map((r) => r.subject)]),
  ].sort();
  const keep = (text: string, subj: string) => (!q || text.toLowerCase().includes(q)) && (!subject || subj === subject);

  const d = dashboards.filter((x) => keep(`${x.name} ${x.description} ${x.owner} ${subjectOf(state, x)}`, subjectOf(state, x)));
  const m = metrics.filter((x) => keep(`${x.name} ${x.description} ${x.owner} ${x.subject}`, x.subject));
  const r = reports.filter((x) => keep(`${x.name} ${x.description} ${x.owner} ${x.subject}`, x.subject));
  const narrowed = !!q || !!subject || !!kind;
  const total = d.length + m.length + r.length;

  /* Every kind in one list, for the A–Z and recent arrangements. */
  type Entry = { key: string; title: string; updated: number; node: React.ReactNode };
  const mixed: Entry[] = [
    ...(!kind || kind === 'dashboards' ? d.map((x) => ({ key: `d-${x.id}`, title: x.name, updated: updatedOn(x).getTime(), node: <BrowseCard key={`d-${x.id}`} d={x} showKind /> })) : []),
    ...(!kind || kind === 'metrics' ? m.map((x) => ({ key: `m-${x.id}`, title: x.name, updated: Date.parse(x.updatedAt) || 0, node: <MetricCard key={`m-${x.id}`} m={x} showKind /> })) : []),
    ...(!kind || kind === 'reports' ? r.map((x) => ({ key: `r-${x.id}`, title: x.name, updated: Date.parse(x.updatedAt) || 0, node: <ReportCard key={`r-${x.id}`} r={x} showKind /> })) : []),
  ].sort((a, b) =>
    arrange === 'recent' ? b.updated - a.updated : arrange === 'za' ? b.title.localeCompare(a.title) : a.title.localeCompare(b.title),
  );
  const byLetter = mixed.reduce<{ letter: string; entries: Entry[] }[]>((acc, e) => {
    const l = letterOf(e.title);
    const last = acc[acc.length - 1];
    if (last?.letter === l) last.entries.push(e);
    else acc.push({ letter: l, entries: [e] });
    return acc;
  }, []);
  const arrangeLabel = ARRANGE.find((a) => a.id === arrange)!.short;

  const section = <T,>(k: Kind, title: string, list: T[], all: number, to: Route, card: (x: T) => React.ReactNode) => {
    if (kind && kind !== k) return null;
    if (!list.length) return null;
    const shown = narrowed ? list : list.slice(0, PER_ROW);
    return (
      <Section
        key={k}
        id={`ds-market-${k}`}
        heading={narrowed ? `${title} · ${list.length}` : title}
        actions={<Button id={`ds-market-${k}-all`} style="link" size="sm" label={`View all ${all} ${title.toLowerCase()}`} onClick={() => go(to)} />}
      >
        <Grid level={3} minItemWidth="var(--w-64)">{shown.map(card)}</Grid>
      </Section>
    );
  };

  return (
    <PageContainer className="ds-browse ds-market">
      <PageHeader
        id="ds-market-header"
        title="Marketplace"
        description={
          narrowed
            ? `${total} ${total === 1 ? 'match' : 'matches'} across dashboards, metrics and reports.`
            : `${dashboards.length} dashboards, ${metrics.length} metrics and ${reports.length} web reports to find and add to your spaces. Widgets, workflows and blocks are in the Builder.`
        }
        showDivider
        actions={
          <div className="ds-browse-actions">
            <Input
              id="ds-market-search"
              size="sm"
              type="search"
              className="ds-browse-search"
              placeholder="Search the Marketplace…"
              IconLeft={Search}
              value={query}
              onValueChange={setQuery}
              aria-label="Search the Marketplace"
            />
            {/* Subject on the title row, between search and sort — the same row as
                Dashboards, Reports and Metrics (owner, 2026-10-02). */}
            <Combobox
              id="ds-market-subject"
              size="sm"
              label="Subject"
              className="ds-reports-subject ds-reports-subject--bare"
              options={subjects.map((s) => ({ value: s, label: s }))}
              value={subject || undefined}
              onValueChange={setSubject}
              placeholder="Any subject"
              searchPlaceholder="Search subjects…"
              clearable
              clearLabel="Clear subject"
            />
            <DropdownMenu id="ds-market-sort">
              <DropdownMenuTrigger>
                <Button id="ds-market-sort-trigger" style="outline" size="sm" label={`Sort: ${arrangeLabel}`} IconRight={ChevronDown} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuRadioGroup value={arrange} onValueChange={(v) => setArrange(v as Arrange)}>
                  {ARRANGE.map((a) => (
                    <DropdownMenuRadioItem key={a.id} value={a.id}>
                      {a.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        }
        toolbar={
          <Toolbar id="ds-market-filters" label="Filter the Marketplace" justify="start">
            <ToolbarGroup>
              {/* Re-click clears back to every kind. */}
              <ToggleGroup id="ds-market-kind" type="single" size="sm" variant="outline" value={kind} onValueChange={(v) => setKind(v as Kind | '')} aria-label="Kind">
                <ToggleGroupItem value="dashboards" label="Dashboards" />
                <ToggleGroupItem value="metrics" label="Metrics" />
                <ToggleGroupItem value="reports" label="Reports" />
              </ToggleGroup>
            </ToolbarGroup>
          </Toolbar>
        }
      />

      {total === 0 || (kind === 'dashboards' && !d.length) || (kind === 'metrics' && !m.length) || (kind === 'reports' && !r.length) ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SearchX />
            </EmptyMedia>
            <EmptyTitle>Nothing in the Marketplace matches</EmptyTitle>
            <EmptyDescription>Try a shorter search, another subject, or every kind.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button
              id="ds-market-clear"
              style="outline"
              label="Clear search and filters"
              onClick={() => {
                setQuery('');
                setKind('');
                setSubject('');
              }}
            />
          </EmptyContent>
        </Empty>
      ) : arrange === 'recent' ? (
        <Grid level={3} minItemWidth="var(--w-64)">{mixed.map((e) => e.node)}</Grid>
      ) : arrange !== 'kind' ? (
        // A–Z (or Z–A) under letter headings: one list, every kind, filed by title.
        <Stack level={2}>
          {byLetter.map((g) => (
            <Section key={g.letter} id={`ds-market-letter-${g.letter === '#' ? 'num' : g.letter}`} heading={g.letter} variant="group">
              <Grid level={3} minItemWidth="var(--w-64)">{g.entries.map((e) => e.node)}</Grid>
            </Section>
          ))}
        </Stack>
      ) : (
        <Stack level={2}>
          {section<Dashboard>('dashboards', 'Dashboards', d, dashboards.length, { page: 'browse' }, (x) => <BrowseCard key={x.id} d={x} />)}
          {section<Metric>('metrics', 'Metrics', m, metrics.length, { page: 'metrics' }, (x) => <MetricCard key={x.id} m={x} />)}
          {section<Report>('reports', 'Web reports', r, reports.length, { page: 'reports' }, (x) => <ReportCard key={x.id} r={x} />)}
        </Stack>
      )}
    </PageContainer>
  );
}
