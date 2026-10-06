/* IRM · Deployments — production support's home. Everything reviewed and
   waiting to go out, unassigned first and oldest first. Taking one makes it
   yours; deploying it is the moment a change takes effect — and the moment
   DartBoards hears about it (a fixed break clears its known-issue notice, a
   modification bumps the version, a new report becomes listable). */

import { Rocket, Undo2, UserPlus } from 'lucide-react';
import Button from '../../../../components/Button';
import PageContainer from '../../../../components/PageContainer';
import PageHeader from '../../../../components/PageHeader';
import Section from '../../../../components/Section';
import Stack from '../../../../components/Stack';
import Text from '../../../../components/Text';
import { Kpi, KpiRow } from '../admin/shared';
import { ageInStatus, fmtIso, isAged } from '../../irm';
import { useSuite } from '../../store';
import { ChangeTable, nameOf, useIrm } from './shared';

export function Deployments() {
  const { state } = useSuite();
  const irm = useIrm();
  const today = state.irm.today;
  const waiting = state.irm.changes
    .filter((c) => c.status === 'awaiting-deployment')
    // Unassigned first, then oldest in status.
    .sort((a, b) => Number(!!a.deployerId) - Number(!!b.deployerId) || ageInStatus(b, today) - ageInStatus(a, today));
  const unassigned = waiting.filter((c) => !c.deployerId);
  const mine = waiting.filter((c) => c.deployerId === irm.me);
  const recent = state.irm.changes.filter((c) => c.status === 'deployed' && c.deployerId).slice(0, 6);
  const retiring = state.irm.changes.filter((c) => c.status === 'scheduled');

  return (
    <PageContainer width="narrow">
      <PageHeader
        id="ds-irm-dep-header"
        title="Deployments"
        description="Reviewed changes waiting to go to production — unassigned first, oldest first. Take one, deploy it, or roll it back to review."
      />
      <Stack level={2}>
        <KpiRow>
          <Kpi id="ds-irm-p-wait" value={waiting.length} label="Awaiting deployment" hint="reviewed and ready" tone="neutral" />
          <Kpi id="ds-irm-p-un" value={unassigned.length} label="Unassigned" hint="nobody has taken them" tone={unassigned.length ? 'warning' : 'neutral'} />
          <Kpi id="ds-irm-p-mine" value={mine.length} label="Yours" hint="taken by you" tone="neutral" />
          <Kpi id="ds-irm-p-aged" value={waiting.filter((c) => isAged(c, today, state.irm.workflows)).length} label="Past their SLA" hint="more than 3 days waiting" tone={waiting.some((c) => isAged(c, today, state.irm.workflows)) ? 'warning' : 'neutral'} />
        </KpiRow>

        <Section id="ds-irm-dep-queue" heading="Awaiting deployment">
          {waiting.length ? (
            <ChangeTable
              id="ds-irm-dep-table"
              label="Awaiting deployment"
              rows={waiting}
              columns={['id', 'title', 'type', 'priority', 'age']}
              actions={(c) => (
                <Stack level={5} direction="horizontal" justify="end" align="center">
                  {!c.deployerId ? (
                    <Button id={`ds-irm-dep-take-${c.id}`} size="sm" style="outline" label="Take" IconLeft={UserPlus} onClick={() => irm.take(c.id)} />
                  ) : c.deployerId === irm.me ? (
                    <>
                      <Button id={`ds-irm-dep-go-${c.id}`} size="sm" style="outline" label="Deploy" IconLeft={Rocket} onClick={() => irm.deploy(c.id)} />
                      <Button id={`ds-irm-dep-back-${c.id}`} size="sm" style="ghost" iconOnly IconCenter={Undo2} aria-label={`Roll back ${c.id}`} title="Roll back to review" onClick={() => irm.rollback(c.id)} />
                    </>
                  ) : (
                    <Text as="span" size="sm" tone="muted">{nameOf(c.deployerId)}</Text>
                  )}
                </Stack>
              )}
            />
          ) : (
            <Text tone="muted">Nothing is waiting to deploy.</Text>
          )}
        </Section>

        {retiring.length > 0 && (
          <Section id="ds-irm-dep-retiring" heading="Scheduled retirements">
            <ChangeTable id="ds-irm-dep-retire-table" label="Scheduled retirements" rows={retiring} columns={['id', 'title', 'record']} />
            <Text size="sm" tone="muted">
              {retiring.map((c) => `${c.record} retires ${c.retireOn ? fmtIso(c.retireOn) : '—'}`).join(' · ')} — DartBoards archives the listing automatically on the day.
            </Text>
          </Section>
        )}

        <Section id="ds-irm-dep-recent" heading="Recently deployed">
          <ChangeTable id="ds-irm-dep-recent-table" label="Recently deployed" rows={recent} columns={['id', 'title', 'type', 'opened']} />
        </Section>
      </Stack>
    </PageContainer>
  );
}
