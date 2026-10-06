/* IRM · lineage. Where a report's data comes from (systems, pipelines, tables,
   and other reports it takes figures from), and what depends on it (reports
   built on it, its DartBoards listings, the spaces those sit on). The second
   half is the impact of changing or retiring it, which is why the decommission
   form reads it too. */

import { ArrowRight, Database, FileBarChart, GitBranch, LayoutDashboard, LayoutGrid, Server } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Alert from '../../../../components/Alert';
import Card, { CardBody } from '../../../../components/Card';
import Grid from '../../../../components/Grid';
import Item, { ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from '../../../../components/Item';
import Section from '../../../../components/Section';
import Text from '../../../../components/Text';
import { dependentsOf, recordName } from '../../irm';
import type { IrmLineageNode, IrmRecord } from '../../irm';
import { useNav } from '../../nav';
import { useSuite } from '../../store';
import type { SuiteState } from '../../store';

const KIND: Record<IrmLineageNode['kind'], { Icon: LucideIcon; label: string }> = {
  system: { Icon: Server, label: 'Source system' },
  pipeline: { Icon: GitBranch, label: 'Pipeline' },
  table: { Icon: Database, label: 'Warehouse table' },
};

/** Everything downstream of a report: other reports (direct and through others), listings, spaces. */
export function impactOf(state: SuiteState, number: string) {
  const reports = dependentsOf(state.irm.records, number);
  const direct = new Set(state.irm.records.filter((r) => r.dependsOn.includes(number)).map((r) => r.number));
  const listings = state.dashboards.filter((d) => d.irm === number && d.lifecycle !== 'archived');
  const spaces = state.spaces.filter((s) => s.items.some((i) => listings.some((l) => l.id === i.dashboardId)));
  return { reports, direct, listings, spaces, total: reports.length + listings.length + spaces.length };
}

export function LineageView({ record }: { record: IrmRecord }) {
  const { state } = useSuite();
  const { go } = useNav();
  const upstreamReports = record.dependsOn.map((n) => state.irm.records.find((r) => r.number === n)).filter((r): r is IrmRecord => !!r);
  const impact = impactOf(state, record.number);
  const reportItem = (r: IrmRecord, note?: string) => (
    <Item key={r.number} size="sm" variant="outline" onClick={() => go({ page: 'irm-record', number: r.number })}>
      <ItemMedia variant="icon">
        <FileBarChart />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{recordName(r)}</ItemTitle>
        <ItemDescription>{note ? `${r.number} · ${note}` : r.number}</ItemDescription>
      </ItemContent>
    </Item>
  );
  return (
    <Grid level={3} columns={3} minItemWidth="var(--w-56)">
      <Section id="ds-irm-lin-up" heading="Comes from" variant="group">
        {record.sources.length + upstreamReports.length ? (
          <ItemGroup className="ds-irm-lineage">
            {record.sources.map((n) => {
              const { Icon, label } = KIND[n.kind];
              return (
                <Item key={n.id} size="sm" variant="outline">
                  <ItemMedia variant="icon">
                    <Icon />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>{n.name}</ItemTitle>
                    <ItemDescription>{`${label} · ${n.platform}`}</ItemDescription>
                  </ItemContent>
                </Item>
              );
            })}
            {upstreamReports.map((r) => reportItem(r, 'report it takes figures from'))}
          </ItemGroup>
        ) : (
          <Text size="sm" tone="muted">Not recorded yet. The developer adds lineage while building the report.</Text>
        )}
      </Section>

      <Section id="ds-irm-lin-self" heading="This report" variant="group">
        <Card id="ds-irm-lin-card" size="sm" className="ds-irm-lineage__self">
          <CardBody>
            <Text weight="semibold">{recordName(record)}</Text>
            <Text size="sm" tone="muted">{`${record.number} · ${record.source} · refreshed ${record.refresh.toLowerCase()}`}</Text>
            <Text size="sm" tone="muted">
              <ArrowRight size={14} aria-hidden="true" /> {impact.total ? `${impact.total} thing${impact.total === 1 ? '' : 's'} depend on it` : 'Nothing depends on it'}
            </Text>
          </CardBody>
        </Card>
      </Section>

      <Section id="ds-irm-lin-down" heading="Feeds" variant="group">
        {impact.total ? (
          <ItemGroup className="ds-irm-lineage">
            {impact.reports.map((r) => reportItem(r, impact.direct.has(r.number) ? 'takes figures from it' : 'through another report'))}
            {impact.listings.map((d) => (
              <Item key={d.id} size="sm" variant="outline" onClick={() => go({ page: 'dashboard', id: d.id })}>
                <ItemMedia variant="icon">
                  <LayoutDashboard />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>{d.name}</ItemTitle>
                  <ItemDescription>DartBoards listing</ItemDescription>
                </ItemContent>
              </Item>
            ))}
            {impact.spaces.map((s) => (
              <Item key={s.id} size="sm" variant="outline" onClick={() => go({ page: 'space', id: s.id })}>
                <ItemMedia variant="icon">
                  <LayoutGrid />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>{s.name}</ItemTitle>
                  <ItemDescription>Space showing the listing</ItemDescription>
                </ItemContent>
              </Item>
            ))}
          </ItemGroup>
        ) : (
          <Text size="sm" tone="muted">No report, listing or space uses it.</Text>
        )}
      </Section>
    </Grid>
  );
}

/** On a decommission: what retiring this report would break. */
export function ImpactAlert({ number }: { number: string }) {
  const { state } = useSuite();
  const impact = impactOf(state, number);
  if (!impact.total) return null;
  const parts = [
    impact.reports.length && `${impact.reports.length} report${impact.reports.length === 1 ? '' : 's'} (${impact.reports.map(recordName).join(', ')})`,
    impact.listings.length && `${impact.listings.length} DartBoards listing${impact.listings.length === 1 ? '' : 's'}`,
    impact.spaces.length && `${impact.spaces.length} space${impact.spaces.length === 1 ? '' : 's'}`,
  ].filter(Boolean);
  return (
    <Alert
      id="ds-irm-impact"
      variant="warning"
      title={`${impact.total} thing${impact.total === 1 ? '' : 's'} depend on this report`}
      description={`Retiring it affects ${parts.join(', ')}. Name a replacement so readers are pointed somewhere, and tell the owners of the reports built on it.`}
    />
  );
}
