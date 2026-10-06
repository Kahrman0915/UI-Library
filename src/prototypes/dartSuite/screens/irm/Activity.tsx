/* IRM · Activity and Integrations.
   Activity is the dev manager's month over month: how much came in, how much
   went out, and what kind. Integrations is the outbound event log — every
   lifecycle event IRM sent and what DartBoards did with it. It is the
   prototype's stand-in for a webhook queue, and the place to look when a
   listing changed and nobody knows why. */

import { useState } from 'react';
import { CircleCheck } from 'lucide-react';
import { BarChart } from '../../../../charts';
import Badge from '../../../../components/Badge';
import Card, { CardBody } from '../../../../components/Card';
import Grid from '../../../../components/Grid';
import PageContainer from '../../../../components/PageContainer';
import PageHeader from '../../../../components/PageHeader';
import Section from '../../../../components/Section';
import Stack from '../../../../components/Stack';
import Text from '../../../../components/Text';
import Timeline, { TimelineItem } from '../../../../components/Timeline';
import ToggleGroup, { ToggleGroupItem } from '../../../../components/ToggleGroup';
import { Kpi, KpiRow } from '../admin/shared';
import { CHANGE_STATUS, CHANGE_TYPE, EVENT_LABEL, IRM_HISTORY, fmtIso, monthLabel } from '../../irm';
import { useSuite } from '../../store';
import type { IrmChangeType } from '../../types';
import { Performance } from './Governance';
import { Ref } from './shared';

const TYPES: IrmChangeType[] = ['new', 'break', 'modification', 'decommission'];

export function IrmActivity() {
  const { state } = useSuite();
  const today = state.irm.today;
  const month = today.slice(0, 7);
  const thisMonth = state.irm.changes.filter((c) => c.opened.startsWith(month));
  const closedThisMonth = state.irm.changes.filter((c) => c.closed?.startsWith(month));
  const last = IRM_HISTORY[IRM_HISTORY.length - 1];
  // The current month is only partly gone, so it says so rather than reading as a collapse.
  const months = [...IRM_HISTORY.map((h) => monthLabel(h.month)), `${monthLabel(today)} (to date)`];
  const open = state.irm.changes.filter((c) => CHANGE_STATUS[c.status].active);

  return (
    <PageContainer>
      <PageHeader id="ds-irm-act-header" title="Activity" description="Requests in and out, month over month — what the team took on, what it finished, and where the time goes." />
      <Stack level={2}>
        <KpiRow>
          <Kpi id="ds-irm-a-open" value={thisMonth.length} label="Opened this month" hint={`month to date · ${last.opened} last month`} tone="neutral" trend={IRM_HISTORY.map((h) => h.opened)} />
          <Kpi id="ds-irm-a-closed" value={closedThisMonth.length} label="Closed this month" hint={`month to date · ${last.closed} last month`} tone="neutral" trend={IRM_HISTORY.map((h) => h.closed)} />
          <Kpi id="ds-irm-a-wip" value={open.length} label="Open now" hint="every active request" tone="neutral" />
          <Kpi id="ds-irm-a-un" value={open.filter((c) => !c.assigneeId && c.status !== 'pending-approval' && c.status !== 'scheduled').length} label="Unassigned" hint="approved, nobody has it" tone="warning" />
        </KpiRow>

        <Section id="ds-irm-act-mom" heading="Month over month">
          <Grid level={3} minItemWidth="var(--w-80)" stretch>
            <Card id="ds-irm-act-flow">
              <CardBody>
                <BarChart
                  id="ds-irm-act-flow-chart"
                  title="Opened and closed"
                  description="Requests opened and closed each month"
                  categories={months}
                  series={[
                    { key: 'opened', label: 'Opened', data: [...IRM_HISTORY.map((h) => h.opened), thisMonth.length] },
                    { key: 'closed', label: 'Closed', data: [...IRM_HISTORY.map((h) => h.closed), closedThisMonth.length] },
                  ]}
                  height={240}
                />
              </CardBody>
            </Card>
            <Card id="ds-irm-act-type">
              <CardBody>
                <BarChart
                  id="ds-irm-act-type-chart"
                  title="Throughput by type"
                  description="Requests opened each month, by type"
                  categories={months}
                  series={TYPES.map((t) => ({
                    key: t,
                    label: CHANGE_TYPE[t].label,
                    data: [...IRM_HISTORY.map((h) => h.byType[t]), thisMonth.filter((c) => c.type === t).length],
                  }))}
                  layout="stacked"
                  height={240}
                />
              </CardBody>
            </Card>
          </Grid>
        </Section>

        <Section id="ds-irm-act-perf" heading="Performance">
          <Performance />
        </Section>
      </Stack>
    </PageContainer>
  );
}

export function IrmIntegrations() {
  const { state } = useSuite();
  const [only, setOnly] = useState<'all' | 'effects'>('all');
  const events = state.irm.events.filter((e) => only === 'all' || e.effects.length);
  return (
    <PageContainer width="narrow">
      <PageHeader
        id="ds-irm-int-header"
        title="Integrations"
        description="Every lifecycle event sent to DartBoards, newest first, and what DartBoards did with it. A nightly reconcile re-sends anything a listing has drifted from."
        actions={
          <ToggleGroup id="ds-irm-int-filter" type="single" variant="plain" size="sm" value={only} onValueChange={(v) => setOnly((v as 'effects') || 'all')}>
            <ToggleGroupItem value="all" label="All events" />
            <ToggleGroupItem value="effects" label="Changed a listing" />
          </ToggleGroup>
        }
      />
      <Stack level={2}>
        <Card id="ds-irm-int-sub">
          <CardBody>
            <Stack level={4} direction="horizontal" align="center" justify="between" wrap>
              <Stack level={5}>
                <Text weight="medium">DartBoards</Text>
                <Text size="sm" tone="muted">Subscribed to every record with a listing · matched on the IRM number</Text>
              </Stack>
              <Badge id="ds-irm-int-live" label="Connected" color="success" appearance="soft" />
            </Stack>
          </CardBody>
        </Card>
        {events.length ? (
          <Timeline connector aria-label="Events sent to DartBoards">
            {events.map((e) => (
              <TimelineItem key={e.id} author={EVENT_LABEL[e.type]} time={fmtIso(e.at)} dateTime={e.at}>
                <Stack level={5}>
                  <Text size="sm">
                    <Ref>{e.record}</Ref> {e.detail}
                  </Text>
                  {e.effects.length ? (
                    <Stack level={5} direction="horizontal" align="center" wrap>
                      <Badge id={`ds-irm-int-${e.id}`} label="Delivered" color="success" appearance="outline" />
                      <CircleCheck aria-hidden="true" className="ds-irm-int-tick" />
                      <Text as="span" size="sm" tone="muted">{e.effects.join(' · ')}</Text>
                    </Stack>
                  ) : (
                    <Text size="sm" tone="muted">No DartBoards listing for this record — nothing to change.</Text>
                  )}
                </Stack>
              </TimelineItem>
            ))}
          </Timeline>
        ) : (
          <Text tone="muted">No events yet. Approve a retirement, deploy a fix, or use Simulate to send one.</Text>
        )}
      </Stack>
    </PageContainer>
  );
}
