/* IRM · the audit trail. One line per change of state, everywhere in IRM:
   who, when, what, and the value before and after. It is append-only — nothing
   in the app edits or deletes a line — and it is what an auditor reads first.
   A record shows its own trail; the governance team reads the whole log. */

import { useMemo, useState } from 'react';
import { Download, Search } from 'lucide-react';
import Button from '../../../../components/Button';
import Input from '../../../../components/Input';
import PageContainer from '../../../../components/PageContainer';
import PageHeader from '../../../../components/PageHeader';
import Stack from '../../../../components/Stack';
import Table, { TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../../../../components/Table';
import Text from '../../../../components/Text';
import ToggleGroup, { ToggleGroupItem } from '../../../../components/ToggleGroup';
import Toolbar, { ToolbarGroup } from '../../../../components/Toolbar';
import { CHANGE_TYPE, fmtIso } from '../../irm';
import type { IrmAuditEntry, IrmRecord } from '../../irm';
import type { IrmChangeType } from '../../types';
import { useSuite } from '../../store';
import { RecordLink, Ref, nameOf } from './shared';

const actor = (id: string) => (id === 'irm' ? 'IRM (automatic)' : nameOf(id));
/** What the line is about, in words: a workflow by its type, a control by its name, anything else by its id. */
const subject = (e: IrmAuditEntry, records: IrmRecord[]) =>
  e.entity === 'workflow'
    ? `${CHANGE_TYPE[e.entityId as IrmChangeType]?.label ?? e.entityId} workflow`
    : e.entity === 'control'
      ? (records.find((r) => r.number === e.record)?.controlItems.find((c) => c.id === e.entityId)?.name ?? e.entityId)
      : e.entityId;

export function AuditTable({ id, rows, showRecord = true }: { id: string; rows: IrmAuditEntry[]; showRecord?: boolean }) {
  const { state } = useSuite();
  return (
    <Table id={id} label="Audit trail" density="sm">
      <TableHead>
        <TableRow>
          <TableHeaderCell>When</TableHeaderCell>
          <TableHeaderCell>Who</TableHeaderCell>
          {showRecord && <TableHeaderCell>Report</TableHeaderCell>}
          <TableHeaderCell>What</TableHeaderCell>
          <TableHeaderCell>Field</TableHeaderCell>
          <TableHeaderCell>From</TableHeaderCell>
          <TableHeaderCell>To</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((e) => (
          <TableRow key={e.id}>
            <TableCell>{fmtIso(e.at)}</TableCell>
            <TableCell>{actor(e.actorId)}</TableCell>
            {showRecord && (
              <TableCell>
                {e.record ? <RecordLink id={`${id}-${e.id}`} record={state.irm.records.find((r) => r.number === e.record)} number={e.record} /> : <Text as="span" tone="muted">—</Text>}
              </TableCell>
            )}
            <TableCell>
              <Stack level={5}>
                <Text as="span" size="sm">{e.action}</Text>
                <Ref>{subject(e, state.irm.records)}</Ref>
              </Stack>
            </TableCell>
            <TableCell>{e.field ?? '—'}</TableCell>
            <TableCell>
              <Text as="span" size="sm" tone="muted">{e.from ?? '—'}</Text>
            </TableCell>
            <TableCell>{e.to ?? '—'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

const ENTITIES = [
  { value: 'all', label: 'Everything' },
  { value: 'change', label: 'Requests' },
  { value: 'record', label: 'Reports' },
  { value: 'control', label: 'Controls' },
  { value: 'workflow', label: 'Workflows' },
] as const;

/** Rows as CSV, so an auditor can take the log away. */
const toCsv = (rows: IrmAuditEntry[], records: IrmRecord[]) =>
  [['When', 'Who', 'Report', 'Subject', 'Action', 'Field', 'From', 'To'], ...rows.map((e) => [e.at, actor(e.actorId), e.record ?? '', subject(e, records), e.action, e.field ?? '', e.from ?? '', e.to ?? ''])]
    .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n');

export function IrmAuditLog() {
  const { state } = useSuite();
  const [entity, setEntity] = useState('all');
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const rows = useMemo(
    () =>
      state.irm.audit
        .filter((e) => entity === 'all' || e.entity === entity)
        .filter((e) => !q || [e.record, e.entityId, e.action, e.field, e.from, e.to, actor(e.actorId)].some((s) => s?.toLowerCase().includes(q))),
    [state.irm.audit, entity, q],
  );
  const shown = rows.slice(0, 200);
  return (
    <PageContainer>
      <PageHeader
        id="ds-irm-audit-header"
        title="Audit log"
        description="Every change in IRM — who, when, and the value before and after. Nothing here can be edited or deleted."
        actions={
          <Button
            id="ds-irm-audit-export"
            style="outline"
            label="Export CSV"
            IconLeft={Download}
            onClick={() => {
              const url = URL.createObjectURL(new Blob([toCsv(rows, state.irm.records)], { type: 'text/csv' }));
              const a = document.createElement('a');
              a.href = url;
              a.download = `irm-audit-${state.irm.today}.csv`;
              a.click();
              URL.revokeObjectURL(url);
            }}
          />
        }
      />
      <Stack level={4}>
        <Toolbar id="ds-irm-audit-filters" label="Filter the audit log" justify="between">
          <ToolbarGroup>
            <ToggleGroup id="ds-irm-audit-entity" type="single" variant="plain" size="sm" value={entity} onValueChange={(v) => setEntity(v || 'all')}>
              {ENTITIES.map((e) => (
                <ToggleGroupItem key={e.value} value={e.value} label={e.label} />
              ))}
            </ToggleGroup>
          </ToolbarGroup>
          <ToolbarGroup>
            <Input id="ds-irm-audit-search" size="sm" aria-label="Search the audit log" placeholder="Report, person or value…" IconLeft={Search} value={query} onValueChange={setQuery} className="ds-admin-search" />
          </ToolbarGroup>
        </Toolbar>
        <AuditTable id="ds-irm-audit-table" rows={shown} />
        <Text size="sm" tone="muted">{rows.length > shown.length ? `Showing the latest ${shown.length} of ${rows.length}. Export for the rest.` : `${rows.length} entries.`}</Text>
      </Stack>
    </PageContainer>
  );
}
