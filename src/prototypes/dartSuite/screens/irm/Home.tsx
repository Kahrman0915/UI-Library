/* IRM · home. There is no switcher: what a person lands on is their IRM role's
   home (Person.irmRole). Each persona's home is the view they live in all day —
   the others stay reachable from the sidebar. */

import { useMemo, useState } from 'react';
import { ArrowRight, FolderCheck, Plus } from 'lucide-react';
import Button from '../../../../components/Button';
import Empty, { EmptyDescription, EmptyHeader, EmptyTitle } from '../../../../components/Empty';
import PageContainer from '../../../../components/PageContainer';
import PageHeader from '../../../../components/PageHeader';
import Section from '../../../../components/Section';
import SelectionBar from '../../../../components/SelectionBar';
import Stack from '../../../../components/Stack';
import Table, { TableBody, TableCell, TableHead, TableHeaderCell, TableRow, TableSelectionCell } from '../../../../components/Table';
import Text from '../../../../components/Text';
import ToggleGroup, { ToggleGroupItem } from '../../../../components/ToggleGroup';
import Toolbar, { ToolbarGroup } from '../../../../components/Toolbar';
import { Kpi, KpiRow } from '../admin/shared';
import { CHANGE_STATUS, WORK_STATUSES, evergreenState, fmtIso, isAged } from '../../irm';
import type { IrmChange, IrmChangeStatus, IrmRecord } from '../../irm';
import { useNav } from '../../nav';
import { useSuite } from '../../store';
import { Board } from './Board';
import { openItems } from '../../openItems';
import { OpenItemsList } from '../requests/MyRequests';
import { useWaitingActions } from '../home/RoleWork';
import { Deployments } from './Deployments';
import { Governance } from './Governance';
import { Age, ControlsBadge, RecordLink, EvergreenBadge, LifecycleBadge, PriorityBadge, StatusBadge, TypeBadge, WorkMenu, sortChanges, useIrm } from './shared';
import type { ChangeSort } from './shared';

export function IrmHome() {
  const { role } = useIrm();
  if (role === 'developer') return <DeveloperHome />;
  if (role === 'dev-manager') return <Board />;
  if (role === 'governance') return <Governance />;
  if (role === 'prod-support') return <Deployments />;
  return <BusinessHome />;
}

/* ── Business user ───────────────────────────────────────────────────────── */


/**
 * My IRM — the business user's IRM home: Open items, IRM only (owner, 2026-10-06). The same sections in
 * the same order — Needs you · In progress · Waiting on others · Closed in the last 30 days — so moving
 * between the two pages changes the scope and nothing else; then the reports you own, which only IRM has.
 * Approving opens the same dialog Home and Open items use (reject asks for a reason). Jira tickets opened
 * for an IRM request sit under it here too — they are about this request.
 */
function BusinessHome() {
  const { state } = useSuite();
  const nav = useNav();
  const { go } = nav;
  const irm = useIrm();
  const { act, dialogs } = useWaitingActions();
  const today = state.irm.today;
  const items = useMemo(() => openItems(state, irm.me).filter((m) => m.app === 'irm'), [state, irm.me]);
  const due = (r: IrmRecord) => r.lifecycle === 'production' && evergreenState(r, today) !== 'current';
  const owned = state.irm.records.filter((r) => r.businessOwnerId === irm.me).sort((a, b) => Number(due(b)) - Number(due(a)));
  // Open items in its own tab — the one already open if there is one — so IRM stays where it is.
  const openAll = () => {
    const open = nav.tabs.find((t) => t.route.page === 'my-requests');
    if (open) nav.activate(open.id);
    else nav.open({ page: 'my-requests' });
  };

  return (
    <PageContainer width="narrow">
      <PageHeader
        id="ds-irm-home-header"
        overline={
          <>
            <FolderCheck size={16} aria-hidden />
            IRM
          </>
        }
        title="My IRM"
        description="Your IRM requests, approvals and reports — what needs you, what is moving, and what you are waiting on."
        actions={
          <>
            <Button id="ds-irm-open-all" style="ghost" label="Open items, every app" IconRight={ArrowRight} onClick={openAll} />
            <Button id="ds-irm-new" label="New IRM request" IconLeft={Plus} onClick={() => go({ page: 'irm-new-change' })} />
          </>
        }
      />
      <Stack level={2}>
        <OpenItemsList id="ds-irm-open" items={items} onAct={act} />

        <Section id="ds-irm-owned" heading="Reports you own">
          {owned.length ? (
            <RecordTable
              id="ds-irm-owned-table"
              label="Reports you own"
              rows={owned}
              actions={(r) => (due(r) ? <Button id={`ds-irm-owned-${r.number}-cert`} size="sm" style="outline" label="Certify" onClick={() => irm.certify(r.number)} /> : null)}
            />
          ) : (
            <Text size="sm" tone="muted">You are not the business owner of any report. Reports you own show here, with their controls and when they are due to be recertified.</Text>
          )}
        </Section>
      </Stack>
      {dialogs}
    </PageContainer>
  );
}

/** Evergreen: the business owner recertifies that the report is still needed and still right. */
export function EvergreenTable({ id, rows, canCertify = true }: { id: string; rows: IrmRecord[]; canCertify?: boolean }) {
  const { state } = useSuite();
  const irm = useIrm();
  return (
    <Table id={id} label="Evergreen recertification">
      <TableHead>
        <TableRow>
          <TableHeaderCell>Report</TableHeaderCell>
          <TableHeaderCell>Business owner</TableHeaderCell>
          <TableHeaderCell>Last certified</TableHeaderCell>
          <TableHeaderCell>Due</TableHeaderCell>
          <TableHeaderCell>State</TableHeaderCell>
          {canCertify && (
            <TableHeaderCell align="end">
              <span className="ui-table__sr-only">Actions</span>
            </TableHeaderCell>
          )}
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((r) => (
          <TableRow key={r.number}>
            <TableCell>
              <RecordLink id={`${id}-${r.number}`} record={r} number={r.number} />
            </TableCell>
            <TableCell>{r.businessOwner}</TableCell>
            <TableCell>{fmtIso(r.evergreen.lastCertified)}</TableCell>
            <TableCell>{fmtIso(r.evergreen.due)}</TableCell>
            <TableCell>
              <EvergreenBadge id={`${id}-${r.number}-ever`} record={r} />
            </TableCell>
            {canCertify && (
              <TableCell align="end">
                {evergreenState(r, state.irm.today) !== 'current' && (
                  <Button id={`${id}-${r.number}-cert`} size="sm" style="outline" label="Certify" onClick={() => irm.certify(r.number)} />
                )}
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function RecordTable({ id, label, rows, actions }: { id: string; label: string; rows: IrmRecord[]; actions?: (r: IrmRecord) => React.ReactNode }) {
  const { state } = useSuite();
  return (
    <Table id={id} label={label}>
      <TableHead>
        <TableRow>
          <TableHeaderCell>Report</TableHeaderCell>
          <TableHeaderCell>Lifecycle</TableHeaderCell>
          <TableHeaderCell>Controls</TableHeaderCell>
          <TableHeaderCell>Evergreen</TableHeaderCell>
          <TableHeaderCell>In DartBoards</TableHeaderCell>
          {actions && (
            <TableHeaderCell align="end">
              <span className="ui-table__sr-only">Actions</span>
            </TableHeaderCell>
          )}
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((r) => {
          const listing = state.dashboards.find((d) => d.irm === r.number);
          return (
            <TableRow key={r.number}>
              <TableCell>
                <RecordLink id={`${id}-${r.number}`} record={r} number={r.number} />
              </TableCell>
              <TableCell>
                <LifecycleBadge id={`${id}-${r.number}-lc`} record={r} />
              </TableCell>
              <TableCell>
                <ControlsBadge id={`${id}-${r.number}-ctl`} record={r} />
              </TableCell>
              <TableCell>
                <EvergreenBadge id={`${id}-${r.number}-ev`} record={r} />
              </TableCell>
              <TableCell>
                <Text as="span" tone={listing && listing.lifecycle === 'published' ? 'default' : 'muted'}>
                  {listing ? (listing.lifecycle === 'published' ? listing.name : `${listing.name} (${listing.lifecycle})`) : 'Not listed'}
                </Text>
              </TableCell>
              {actions && <TableCell align="end">{actions(r)}</TableCell>}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

/* ── Developer ───────────────────────────────────────────────────────────── */

const DEV_FILTERS: { value: string; label: string; statuses: IrmChangeStatus[] }[] = [
  { value: 'active', label: 'Active', statuses: [...WORK_STATUSES, 'on-hold'] },
  { value: 'ready', label: 'Ready', statuses: ['ready'] },
  { value: 'in-development', label: 'In development', statuses: ['in-development'] },
  { value: 'in-review', label: 'In review', statuses: ['in-review'] },
  { value: 'on-hold', label: 'On hold', statuses: ['on-hold'] },
];

function DeveloperHome() {
  const { state } = useSuite();
  const irm = useIrm();
  const [whose, setWhose] = useState<'assigned' | 'created'>('assigned');
  const [filter, setFilter] = useState('active');
  const [sort, setSort] = useState<ChangeSort | null>({ key: 'priority', dir: 'asc' });
  const [picked, setPicked] = useState<string[]>([]);
  const today = state.irm.today;

  const statuses = DEV_FILTERS.find((f) => f.value === filter)?.statuses ?? DEV_FILTERS[0].statuses;
  const base = state.irm.changes.filter((c) => (whose === 'assigned' ? c.assigneeId === irm.me : c.createdById === irm.me));
  const rows = useMemo(() => sortChanges(base.filter((c) => statuses.includes(c.status)), sort, today), [base, statuses, sort, today]);
  const assigned = state.irm.changes.filter((c) => c.assigneeId === irm.me && CHANGE_STATUS[c.status].active);
  const pickedRows = rows.filter((c) => picked.includes(c.id));
  const all = rows.length > 0 && pickedRows.length === rows.length;

  return (
    <PageContainer width="narrow">
      <PageHeader id="ds-irm-dev-header" title="My queue" description="What is assigned to you, oldest and most urgent first. Move it on as you work it." />
      <Stack level={2}>
        <KpiRow>
          <Kpi id="ds-irm-d-assigned" value={assigned.length} label="Assigned to you" hint="active work" tone="neutral" />
          <Kpi id="ds-irm-d-p1" value={assigned.filter((c) => c.priority === 'P1').length} label="P1 · critical" hint="things that are wrong first" tone={assigned.some((c) => c.priority === 'P1') ? 'error' : 'neutral'} />
          <Kpi id="ds-irm-d-aged" value={assigned.filter((c) => isAged(c, today, state.irm.workflows)).length} label="Past their SLA" hint="too long in one status" tone={assigned.some((c) => isAged(c, today, state.irm.workflows)) ? 'warning' : 'neutral'} />
          <Kpi id="ds-irm-d-review" value={assigned.filter((c) => c.status === 'in-review').length} label="In review" hint="waiting on a reviewer" tone="neutral" />
        </KpiRow>

        <Stack level={4}>
          {pickedRows.length > 0 ? (
            <SelectionBar
              id="ds-irm-dev-sel"
              label="Selected changes"
              count={pickedRows.length}
              summary={`${pickedRows.length} change${pickedRows.length === 1 ? '' : 's'} selected`}
              onClear={() => setPicked([])}
              actions={
                <>
                  {(['in-development', 'in-review', 'awaiting-deployment'] as const).map((s) => (
                    <Button
                      key={s}
                      id={`ds-irm-dev-bulk-${s}`}
                      size="sm"
                      style="outline"
                      label={`Move to ${CHANGE_STATUS[s].label.toLowerCase()}`}
                      onClick={() => {
                        pickedRows.forEach((c) => irm.move(c.id, s));
                        setPicked([]);
                      }}
                    />
                  ))}
                </>
              }
            />
          ) : (
            <Toolbar id="ds-irm-dev-filters" label="Filter your queue" justify="between">
              <ToolbarGroup>
                <ToggleGroup id="ds-irm-dev-whose" type="single" variant="plain" size="sm" value={whose} onValueChange={(v) => setWhose((v as 'assigned' | 'created') || 'assigned')}>
                  <ToggleGroupItem value="assigned" label="Assigned to me" />
                  <ToggleGroupItem value="created" label="Created by me" />
                </ToggleGroup>
                <ToggleGroup id="ds-irm-dev-status" type="single" variant="plain" size="sm" value={filter} onValueChange={(v) => setFilter(v || 'active')}>
                  {DEV_FILTERS.map((f) => (
                    <ToggleGroupItem key={f.value} value={f.value} label={f.label} />
                  ))}
                </ToggleGroup>
              </ToolbarGroup>
            </Toolbar>
          )}

          {rows.length ? (
            <Table id="ds-irm-dev-table" label="My queue">
              <TableHead>
                <TableRow>
                  <TableSelectionCell
                    id="ds-irm-dev-all"
                    label="Select every change"
                    checked={all}
                    indeterminate={pickedRows.length > 0 && !all}
                    onCheckedChange={(c) => setPicked(c ? rows.map((r) => r.id) : [])}
                  />
                  <TableHeaderCell>Request</TableHeaderCell>
                  <TableHeaderCell>Type</TableHeaderCell>
                  <TableHeaderCell sortDirection={sort?.key === 'priority' ? sort.dir : null} onSort={(dir) => setSort({ key: 'priority', dir })}>
                    Priority
                  </TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell sortDirection={sort?.key === 'age' ? sort.dir : null} onSort={(dir) => setSort({ key: 'age', dir })}>
                    Age in status
                  </TableHeaderCell>
                  <TableHeaderCell align="end">
                    <span className="ui-table__sr-only">Actions</span>
                  </TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <QueueRows rows={rows} picked={picked} setPicked={setPicked} />
              </TableBody>
            </Table>
          ) : (
            <Empty>
              <EmptyHeader>
                <EmptyTitle as="h2">Nothing here</EmptyTitle>
                <EmptyDescription>No changes match this filter.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </Stack>
      </Stack>
    </PageContainer>
  );
}

function QueueRows({ rows, picked, setPicked }: { rows: ReturnType<typeof sortChanges>; picked: string[]; setPicked: React.Dispatch<React.SetStateAction<string[]>> }) {
  const { go } = useNav();
  return (
    <>
      {rows.map((c) => {
        const on = picked.includes(c.id);
        const key = `ds-irm-dev-${c.id}`;
        return (
          <TableRow key={c.id} selected={on}>
            <TableSelectionCell id={`${key}-sel`} label={`Select ${c.id}`} checked={on} onCheckedChange={(v) => setPicked((p) => (v ? [...p, c.id] : p.filter((x) => x !== c.id)))} />
            {/* The change number under its title, not a column of its own: the queue is on the narrow page. */}
            <TableCell className="ds-chg__cell ds-chg__cell--title">
              <Button id={`${key}-open`} style="link" className="ds-admin-rowlink" label={c.title} onClick={() => go({ page: 'irm-change', id: c.id })} />
              <Text as="div" size="xs" tone="muted">
                {c.id}
              </Text>
            </TableCell>
            <TableCell className="ds-chg__cell ds-chg__cell--type">
              <QueueBadges change={c} part="type" />
            </TableCell>
            <TableCell className="ds-chg__cell">
              <QueueBadges change={c} part="priority" />
            </TableCell>
            <TableCell className="ds-chg__cell ds-chg__cell--status">
              <QueueBadges change={c} part="status" />
            </TableCell>
            <TableCell className="ds-chg__cell">
              <QueueBadges change={c} part="age" />
            </TableCell>
            <TableCell align="end">
              <WorkMenu id={key} change={c} canAssign={false} />
            </TableCell>
          </TableRow>
        );
      })}
    </>
  );
}

/* The badges are shared with ChangeTable; a thin switch keeps the queue's cells identical to it. */
function QueueBadges({ change, part }: { change: IrmChange; part: 'type' | 'priority' | 'status' | 'age' }) {
  const id = `ds-irm-q-${change.id}-${part}`;
  if (part === 'type') return <TypeBadge id={id} change={change} />;
  if (part === 'priority') return <PriorityBadge id={id} priority={change.priority} />;
  if (part === 'status') return <StatusBadge id={id} status={change.status} />;
  return <Age change={change} />;
}
