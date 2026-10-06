/* IRM · workflows. Each request type's process — who approves, which stages it
   goes through, how long each may take, and for a decommission the shortest
   notice it may give — is set here by the governance team. Everyone else reads
   it. A save writes one audit line per field that moved. */

import { useState } from 'react';
import Alert from '../../../../components/Alert';
import Button from '../../../../components/Button';
import Card, { CardBody, CardFooter, CardHeader } from '../../../../components/Card';
import Input from '../../../../components/Input';
import NativeSelect, { NativeSelectOption } from '../../../../components/NativeSelect';
import PageContainer from '../../../../components/PageContainer';
import PageHeader from '../../../../components/PageHeader';
import Stack from '../../../../components/Stack';
import Switch from '../../../../components/Switch';
import Table, { TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../../../../components/Table';
import Text from '../../../../components/Text';
import { toast } from '../../../../components/Toast';
import { APPROVER, CHANGE_STATUS, CHANGE_TYPE } from '../../irm';
import type { IrmApprover, IrmWorkflow } from '../../irm';
import type { IrmChangeType } from '../../types';
import { useSuite } from '../../store';
import { useIrm } from './shared';

const TYPES: IrmChangeType[] = ['new', 'modification', 'break', 'decommission'];
const days = (v: string) => Math.max(0, Math.min(365, Math.round(Number(v) || 0)));

export function IrmWorkflows() {
  const irm = useIrm();
  const canEdit = irm.role === 'governance';
  return (
    <PageContainer width="narrow">
      <PageHeader
        id="ds-irm-wf-header"
        title="Workflows"
        description="How each kind of request moves: who approves it, the stages it goes through, and how long each stage may take."
      />
      <Stack level={2}>
        {!canEdit && <Alert id="ds-irm-wf-readonly" variant="info" title="Set by the governance team" description="You can see every workflow here. Ask the governance team to change one." />}
        {TYPES.map((t) => (
          <WorkflowCard key={t} type={t} canEdit={canEdit} />
        ))}
      </Stack>
    </PageContainer>
  );
}

function WorkflowCard({ type, canEdit }: { type: IrmChangeType; canEdit: boolean }) {
  const { state } = useSuite();
  const irm = useIrm();
  const saved = state.irm.workflows[type];
  const [draft, setDraft] = useState<IrmWorkflow>(saved);
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const base = `ds-irm-wf-${type}`;
  const set = (patch: Partial<IrmWorkflow>) => setDraft((w) => ({ ...w, ...patch }));
  const setStage = (status: string, patch: { enabled?: boolean; slaDays?: number }) =>
    setDraft((w) => ({ ...w, stages: w.stages.map((s) => (s.status === status ? { ...s, ...patch } : s)) }));

  return (
    <Card id={base}>
      <CardHeader id={`${base}-header`} title={CHANGE_TYPE[type].label} description={CHANGE_TYPE[type].hint} />
      <CardBody>
        <Stack level={3}>
          <Stack level={4} direction="horizontal" wrap align="end">
            <NativeSelect
              id={`${base}-approver`}
              label="Approved by"
              value={draft.approver}
              disabled={!canEdit}
              onValueChange={(v) => set({ approver: v as IrmApprover })}
            >
              {(Object.keys(APPROVER) as IrmApprover[]).map((a) => (
                <NativeSelectOption key={a} value={a}>
                  {APPROVER[a].label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            {draft.approver !== 'none' && (
              <Input id={`${base}-approval-sla`} label="Approval SLA (days)" type="number" value={String(draft.approvalSlaDays)} disabled={!canEdit} onValueChange={(v) => set({ approvalSlaDays: days(v) })} />
            )}
            {type === 'decommission' && (
              <Input
                id={`${base}-notice`}
                label="Shortest notice (days)"
                type="number"
                value={String(draft.noticeDays ?? 0)}
                disabled={!canEdit}
                onValueChange={(v) => set({ noticeDays: days(v) })}
              />
            )}
          </Stack>
          <Text size="sm" tone="muted">
            {APPROVER[draft.approver].hint}
            {type === 'decommission' ? ' The shortest notice is the earliest a retire date may be, counted from the request.' : ''}
          </Text>
          <Table id={`${base}-stages`} label={`${CHANGE_TYPE[type].label} stages`} density="sm">
            <TableHead>
              <TableRow>
                <TableHeaderCell>Stage</TableHeaderCell>
                <TableHeaderCell>Used</TableHeaderCell>
                <TableHeaderCell>SLA (days)</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {draft.stages.map((s) => (
                <TableRow key={s.status}>
                  <TableCell>
                    <Stack level={5}>
                      <Text as="span" size="sm">{CHANGE_STATUS[s.status].label}</Text>
                      {s.required && <Text as="span" size="xs" tone="muted">Every request goes through this stage</Text>}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Switch
                      id={`${base}-${s.status}-on`}
                      aria-label={`Use the ${CHANGE_STATUS[s.status].label} stage`}
                      checked={s.enabled}
                      disabled={!canEdit || s.required}
                      onCheckedChange={(on) => setStage(s.status, { enabled: on })}
                    />
                  </TableCell>
                  <TableCell>
                    {s.slaDays === undefined ? (
                      <Text as="span" size="sm" tone="muted">Until the retire date</Text>
                    ) : (
                      <Input
                        id={`${base}-${s.status}-sla`}
                        size="sm"
                        type="number"
                        aria-label={`${CHANGE_STATUS[s.status].label} SLA in days`}
                        value={String(s.slaDays)}
                        disabled={!canEdit || !s.enabled}
                        onValueChange={(v) => setStage(s.status, { slaDays: days(v) })}
                        className="ds-irm-wf-sla"
                      />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Stack>
      </CardBody>
      {canEdit && (
        <CardFooter>
          <Button id={`${base}-discard`} style="ghost" label="Discard" disabled={!dirty} onClick={() => setDraft(saved)} />
          <Button
            id={`${base}-save`}
            label="Save workflow"
            disabled={!dirty}
            onClick={() => {
              irm.updateWorkflow(draft);
              toast.success(`${CHANGE_TYPE[type].label} workflow saved`, { description: 'New requests follow it now. The change is in the audit log.' });
            }}
          />
        </CardFooter>
      )}
    </Card>
  );
}
