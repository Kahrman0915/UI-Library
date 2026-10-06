/* IRM · Governance — the team that runs IRM. Evergreen recertification, records
   flagged for review, decommissions waiting on them, work aging past its SLA,
   and how the process is performing month over month. Governance approves a
   decommission — the approval is what tells DartBoards to start the notice. */

import { Check, Flag, X } from 'lucide-react';
import { BarChart, LineChart } from '../../../../charts';
import Button from '../../../../components/Button';
import Card, { CardBody } from '../../../../components/Card';
import Grid from '../../../../components/Grid';
import PageContainer from '../../../../components/PageContainer';
import PageHeader from '../../../../components/PageHeader';
import Section from '../../../../components/Section';
import Stack from '../../../../components/Stack';
import Table, { TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../../../../components/Table';
import Text from '../../../../components/Text';
import { Kpi, KpiRow } from '../admin/shared';
import {
  CHANGE_STATUS,
  IRM_HISTORY,
  STATUS_SLA_DAYS,
  WORK_STATUSES,
  ageInStatus,
  evergreenState,
  fmtIso,
  isAged,
  monthLabel,
} from '../../irm';
import { useSuite } from '../../store';
import { approversOf } from '../../irmEngine';
import { ReviewQueue } from './Evidence';
import { EvergreenTable } from './Home';
import { ChangeTable, RecordLink, useIrm } from './shared';

export function Governance() {
  const { state } = useSuite();
  const irm = useIrm();
  const today = state.irm.today;
  const live = state.irm.records.filter((r) => r.lifecycle === 'production' || r.lifecycle === 'retiring');
  const pastDue = live.filter((r) => evergreenState(r, today) === 'past-due');
  const dueSoon = live.filter((r) => evergreenState(r, today) === 'due-soon');
  const flagged = state.irm.records.filter((r) => r.flagged);
  const overdue = live.filter((r) => r.controls === 'overdue');
  const aged = state.irm.changes.filter((c) => isAged(c, today, state.irm.workflows));
  // Whatever the workflows send to governance: decommissions by default, and anything set to 'both'.
  const decoms = state.irm.changes.filter((c) => approversOf(c, state.irm.workflows).includes(irm.me));
  const scheduled = state.irm.changes.filter((c) => c.status === 'scheduled');

  return (
    <PageContainer width="narrow">
      <PageHeader
        id="ds-irm-gov-header"
        title="Governance"
        description="Recertification, flags, controls and the health of the request process — everything the governance team is accountable for."
      />
      <Stack level={2}>
        <KpiRow>
          <Kpi id="ds-irm-g-ever" value={pastDue.length} label="Evergreen past due" hint={`${dueSoon.length} more due within 30 days`} tone={pastDue.length ? 'error' : 'neutral'} />
          <Kpi id="ds-irm-g-flag" value={flagged.length} label="Flagged for review" hint="raised by governance" tone={flagged.length ? 'warning' : 'neutral'} />
          <Kpi id="ds-irm-g-ctl" value={overdue.length} label="Controls overdue" hint="viewers in DartBoards are told" tone={overdue.length ? 'error' : 'neutral'} />
          <Kpi id="ds-irm-g-aged" value={aged.length} label="Requests past SLA" hint="share within SLA, last 6 months" tone={aged.length ? 'warning' : 'neutral'} trend={IRM_HISTORY.map((h) => Math.round(h.slaMet * 100))} />
        </KpiRow>

        {state.irm.attestations.some((x) => x.outcome === 'pending') && (
          <Section id="ds-irm-gov-evidence" heading="Evidence to review">
            <ReviewQueue />
          </Section>
        )}

        <Section id="ds-irm-gov-decom" heading="Waiting on governance approval">
          {decoms.length ? (
            <ChangeTable
              id="ds-irm-gov-decom-table"
              label="Retirements to approve"
              rows={decoms}
              columns={['id', 'title', 'record', 'type', 'requestedFor', 'age']}
              actions={(c) => (
                <Stack level={5} direction="horizontal" justify="end">
                  <Button id={`ds-irm-gov-ap-${c.id}`} size="sm" style="outline" label="Approve" IconLeft={Check} onClick={() => irm.approve(c.id)} />
                  <Button id={`ds-irm-gov-rj-${c.id}`} size="sm" style="ghost" label="Reject" IconLeft={X} onClick={() => irm.reject(c.id, 'Rejected by governance.')} />
                </Stack>
              )}
            />
          ) : (
            <Text tone="muted">Nothing is waiting on governance.</Text>
          )}
          {scheduled.length > 0 && (
            <Text size="sm" tone="muted">
              Scheduled to retire: {scheduled.map((c) => `${c.record} on ${c.retireOn ? fmtIso(c.retireOn) : '—'}`).join(' · ')}.
            </Text>
          )}
        </Section>

        <Section id="ds-irm-gov-evergreen" heading="Evergreen — past due and due soon">
          {pastDue.length + dueSoon.length ? (
            <EvergreenTable id="ds-irm-gov-ever-table" rows={[...pastDue, ...dueSoon]} canCertify={false} />
          ) : (
            <Text tone="muted">Every report is recertified.</Text>
          )}
        </Section>

        <Section id="ds-irm-gov-flagged" heading="Flagged for review">
          <Table id="ds-irm-gov-flag-table" label="Flagged for review">
            <TableHead>
              <TableRow>
                <TableHeaderCell>Report</TableHeaderCell>
                <TableHeaderCell>Why</TableHeaderCell>
                <TableHeaderCell>Flagged</TableHeaderCell>
                <TableHeaderCell align="end">
                  <span className="ui-table__sr-only">Actions</span>
                </TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {flagged.map((r) => (
                <TableRow key={r.number}>
                  <TableCell>
                    <RecordLink id={`ds-irm-gov-flag-${r.number}`} record={r} number={r.number} />
                  </TableCell>
                  <TableCell>{r.flagged?.reason}</TableCell>
                  <TableCell>{r.flagged ? `${fmtIso(r.flagged.on)} · ${daysAgo(r.flagged.on, today)}` : ''}</TableCell>
                  <TableCell align="end">
                    <Button id={`ds-irm-gov-clear-${r.number}`} size="sm" style="ghost" label="Clear flag" IconLeft={Flag} onClick={() => irm.clearFlag(r.number)} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Section>

        <Section id="ds-irm-gov-aged" heading="Requests past their SLA">
          {aged.length ? (
            <ChangeTable id="ds-irm-gov-aged-table" label="Requests past their SLA" rows={aged} columns={['id', 'title', 'status', 'assignee', 'age']} />
          ) : (
            <Text tone="muted">Nothing has sat in one status past its SLA.</Text>
          )}
        </Section>

        <Section id="ds-irm-gov-perf" heading="Performance monitoring">
          <Performance />
        </Section>
      </Stack>
    </PageContainer>
  );
}

const daysAgo = (iso: string, today: string) => {
  const n = Math.max(0, Math.round((new Date(today).getTime() - new Date(iso).getTime()) / 86_400_000));
  return n === 0 ? 'today' : `${n} day${n === 1 ? '' : 's'} ago`;
};

/** SLA adherence month over month, and where time goes today — by status. */
export function Performance() {
  const { state } = useSuite();
  const today = state.irm.today;
  const months = [...IRM_HISTORY.map((h) => monthLabel(h.month)), monthLabel(today)];
  const active = state.irm.changes.filter((c) => CHANGE_STATUS[c.status].active);
  const metNow = active.length ? Math.round((active.filter((c) => !isAged(c, today, state.irm.workflows)).length / active.length) * 100) : 100;
  const stages = (['pending-approval', ...WORK_STATUSES] as const).filter((s) => STATUS_SLA_DAYS[s] !== undefined);
  const avgIn = (s: (typeof stages)[number]) => {
    const rows = active.filter((c) => c.status === s);
    return rows.length ? Math.round(rows.reduce((t, c) => t + ageInStatus(c, today), 0) / rows.length) : 0;
  };
  return (
    <Grid level={3} minItemWidth="var(--w-80)" stretch>
      <Card id="ds-irm-perf-sla">
        <CardBody>
          <LineChart
            id="ds-irm-perf-sla-chart"
            title="Requests within SLA"
            description="Share of active requests inside their status SLA, month over month"
            categories={months}
            series={[{ key: 'met', label: 'Within SLA', data: [...IRM_HISTORY.map((h) => Math.round(h.slaMet * 100)), metNow] }]}
            valueFormatter={(v) => `${v}%`}
            yDomain={[60, 100]}
            height={240}
          />
        </CardBody>
      </Card>
      <Card id="ds-irm-perf-stage">
        <CardBody>
          <BarChart
            id="ds-irm-perf-stage-chart"
            title="Time in status, today"
            description="Average days the active requests have spent in each status, against its SLA"
            categories={stages.map((s) => CHANGE_STATUS[s].label)}
            series={[
              { key: 'avg', label: 'Average days', data: stages.map(avgIn) },
              { key: 'sla', label: 'SLA', data: stages.map((s) => STATUS_SLA_DAYS[s] ?? 0) },
            ]}
            valueFormatter={(v) => `${v}d`}
            height={240}
          />
        </CardBody>
      </Card>
    </Grid>
  );
}
