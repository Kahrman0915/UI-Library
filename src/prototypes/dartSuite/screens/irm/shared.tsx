/* IRM — pieces every IRM screen shares: the badges, the actions bound to the
   signed-in person, the change table, links between records and changes, and
   the prototype's Simulate menu. */

import { useEffect, useRef, useState } from 'react';
import { Archive, CalendarClock, FilePlus, FlaskConical, MoreHorizontal, Pencil, TriangleAlert, Wrench, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { FeaturedIconColor } from '../../../../components/FeaturedIcon/FeaturedIcon.types';
import Badge from '../../../../components/Badge';
import Button from '../../../../components/Button';
import Dialog, { DialogBody, DialogFooter, DialogHeader } from '../../../../components/Dialog';
import Breadcrumb, { BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../../../../components/Breadcrumb';
import DropdownMenu, {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../../components/DropdownMenu';
import Stack from '../../../../components/Stack';
import Table, { TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../../../../components/Table';
import type { TableSortDirection } from '../../../../components/Table/Table.types';
import Text from '../../../../components/Text';
import Textarea from '../../../../components/Textarea';
import { toast } from '../../../../components/Toast';
import { IRM_DEVELOPERS, PEOPLE, personById } from '../../data';
import {
  CHANGE_STATUS,
  CHANGE_TYPE,
  CONTROLS,
  EVENT_LABEL,
  EVERGREEN,
  LIFECYCLE,
  PRIORITY,
  ageInStatus,
  daysBetween,
  evergreenState,
  fmtIso,
  isAged,
  recordName,
  stagesFor,
} from '../../irm';
import type { IrmChange, IrmChangeStatus, IrmEvent, IrmEventType, IrmEvidence, IrmPriority, IrmRecord, IrmWorkflow } from '../../irm';
import { irmOps, nextChangeId } from '../../irmEngine';
import { audienceOf, staysInCentral } from '../../hub';
import type { NewChangeInput } from '../../irmEngine';
import { useNav } from '../../nav';
import { toneBadge, useSignedIn, useSuite } from '../../store';
import type { Tone } from '../../store';
import type { IrmRole, Route } from '../../types';
import '../admin/Admin.scss';
import './Irm.scss';

/* ── States ─────────────────────────────────────────────────────────────────
   A state is a badge only when it needs attention (warning or error). The
   normal states — In development, Production, Complete, Current, P3 — are
   plain text, so the exceptions are what the eye finds. */

const needsAttention = (t: Tone) => t === 'warning' || t === 'error';

/** Plain text for a normal state, a soft badge for one that needs attention. */
export function StateLabel({ id, label, tone }: { id: string; label: string; tone: Tone }) {
  return needsAttention(tone) ? (
    <Badge id={id} label={label} {...toneBadge(tone)} />
  ) : (
    <Text as="span" size="sm">{label}</Text>
  );
}

export const StatusBadge = ({ id, status }: { id: string; status: IrmChangeStatus }) => (
  <StateLabel id={id} label={CHANGE_STATUS[status].label} tone={CHANGE_STATUS[status].tone} />
);
export const TypeBadge = ({ id, change }: { id: string; change: IrmChange }) => (
  <StateLabel id={id} label={CHANGE_TYPE[change.type].label} tone={CHANGE_TYPE[change.type].tone} />
);
export const PriorityBadge = ({ id, priority }: { id: string; priority: IrmPriority }) => (
  <StateLabel id={id} label={priority} tone={PRIORITY[priority].tone} />
);
export const LifecycleBadge = ({ id, record }: { id: string; record: IrmRecord }) => (
  <StateLabel id={id} label={LIFECYCLE[record.lifecycle].label} tone={LIFECYCLE[record.lifecycle].tone} />
);
/** `prefixed` says "Controls …" — for places with no column header to say it, like the record's eyebrow. */
export const ControlsBadge = ({ id, record, prefixed }: { id: string; record: IrmRecord; prefixed?: boolean }) => (
  <StateLabel id={id} label={prefixed ? CONTROLS[record.controls].label : CONTROLS[record.controls].short} tone={CONTROLS[record.controls].color} />
);
/** Due soon and past due differ in WORDS, not only colour: "Due in 9 days" against "Past due". */
export function EvergreenBadge({ id, record, prefixed }: { id: string; record: IrmRecord; prefixed?: boolean }) {
  const { state } = useSuite();
  const s = evergreenState(record, state.irm.today);
  const days = daysBetween(state.irm.today, record.evergreen.due);
  const label = s === 'due-soon' ? `Due in ${days} day${days === 1 ? '' : 's'}` : EVERGREEN[s].label;
  return <StateLabel id={id} label={prefixed ? `Evergreen ${label.toLowerCase()}` : label} tone={EVERGREEN[s].tone} />;
}

/** "12 days", red past the status's SLA — the number every queue sorts by. */
export function Age({ change }: { change: IrmChange }) {
  const { state } = useSuite();
  const days = ageInStatus(change, state.irm.today);
  return (
    <Text as="span" size="sm" weight={isAged(change, state.irm.today, state.irm.workflows) ? 'semibold' : 'normal'} className={isAged(change, state.irm.today, state.irm.workflows) ? 'ds-irm-aged' : undefined}>
      {days === 0 ? 'Today' : `${days} day${days === 1 ? '' : 's'}`}
    </Text>
  );
}

/** An identifier (CHG-1042, IRM-20270): quiet metadata, never a chip that outweighs the title beside it. */
export const Ref = ({ children }: { children: string }) => (
  <Text as="span" size="sm" tone="muted">{children}</Text>
);

/** A record in a table: its name as the link, its IRM number quietly underneath. */
export function RecordLink({ id, record, number }: { id: string; record?: IrmRecord; number: string }) {
  const { go } = useNav();
  return (
    <Stack level={5}>
      <Button id={id} style="link" className="ds-admin-rowlink" label={record ? recordName(record) : number} onClick={() => go({ page: 'irm-record', number })} />
      {record && <Text as="span" size="xs" tone="muted">{number}</Text>}
    </Stack>
  );
}

/** Each kind of IRM request's icon and color — the same on the New request cards, the form and Open items. */
export const IRM_TYPE_VISUAL: Record<IrmChange['type'], { Icon: LucideIcon; color: FeaturedIconColor }> = {
  new: { Icon: FilePlus, color: 'info' },
  break: { Icon: Wrench, color: 'error' },
  modification: { Icon: Pencil, color: 'default' },
  decommission: { Icon: Archive, color: 'warning' },
};

/** The label for an IRM page as a breadcrumb parent — the role's home is named as the sidebar names it. */
export const IRM_HOME_LABEL: Record<IrmRole, string> = { business: 'My IRM', developer: 'My queue', 'dev-manager': 'Team board', governance: 'Governance', 'prod-support': 'Deployments' };

/**
 * Where a detail page sits — a place, so a breadcrumb rather than a back button. The parent is the IRM
 * list the tab came from (My IRM, Open items, All requests, a report…), so the way back is the way in; `parent` is
 * used when the tab came from outside IRM or opened straight onto the page.
 */
export function IrmCrumbs({ parent: fallback, page }: { parent: { label: string; route: Route }; page: string }) {
  const { go, previous } = useNav();
  const { state } = useSuite();
  const { role } = useIrm();
  const fromLabel = (r: Route): string | undefined => {
    switch (r.page) {
      case 'irm-home':
        return IRM_HOME_LABEL[role];
      case 'irm-changes':
        return 'All requests';
      case 'irm-records':
        return 'Inventory';
      case 'irm-record': {
        const rec = state.irm.records.find((x) => x.number === r.number);
        return rec ? recordName(rec) : r.number;
      }
      case 'irm-board':
        return 'Team board';
      case 'irm-governance':
        return 'Governance';
      case 'irm-deployments':
        return 'Deployments';
      case 'my-requests':
        return 'Open items';
      case 'home':
        return 'Home';
      default:
        return undefined;
    }
  };
  const label = previous && fromLabel(previous);
  const parent = previous && label ? { label, route: previous } : fallback;
  return (
    <Breadcrumb aria-label="Breadcrumb">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink
            href="#"
            onClick={(e) => {
              e.preventDefault();
              go(parent.route);
            }}
          >
            {parent.label}
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{page}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

/** A person's name, or "Unassigned". */
export const nameOf = (id?: string) => (id ? personById(id).name : 'Unassigned');

/* ── Actions, bound to the signed-in person ──────────────────────────────── */

/** Every IRM action, run as the signed-in person. What each did to DartBoards is announced by `IrmAnnouncer`. */
export function useIrm() {
  const { state, update } = useSuite();
  const { person, role } = useSignedIn();
  const me = person.id;
  const run = (fn: Parameters<typeof update>[0]) => update(fn);
  return {
    me,
    role,
    person,
    today: state.irm.today,
    /** Files a change request and returns its id. */
    create: (input: Omit<NewChangeInput, 'createdById' | 'id'>) => {
      const id = nextChangeId();
      update((d) => void irmOps.createChange(d, { ...input, id, createdById: me }));
      return id;
    },
    approve: (id: string) => run((d) => irmOps.approve(d, id, me)),
    reject: (id: string, reason: string) => run((d) => irmOps.reject(d, id, me, reason)),
    assign: (id: string, assignee?: string) => run((d) => irmOps.assign(d, id, assignee, me)),
    move: (id: string, status: IrmChangeStatus) => run((d) => irmOps.move(d, id, status, me)),
    setPriority: (id: string, p: IrmPriority) => run((d) => irmOps.setPriority(d, id, p, me)),
    take: (id: string) => run((d) => irmOps.takeDeployment(d, id, me)),
    deploy: (id: string) => run((d) => irmOps.deploy(d, id, me)),
    rollback: (id: string) => run((d) => irmOps.rollback(d, id, me)),
    cancelDecommission: (id: string) => run((d) => irmOps.cancelDecommission(d, id, me)),
    retireNow: (number: string) => run((d) => irmOps.retireNow(d, number, me)),
    submitAttestation: (number: string, controlId: string, evidence: IrmEvidence[], note: string) =>
      run((d) => irmOps.submitAttestation(d, number, controlId, me, evidence, note)),
    reviewAttestation: (id: string, outcome: 'accepted' | 'rejected', note: string) => run((d) => irmOps.reviewAttestation(d, id, me, outcome, note)),
    updateWorkflow: (wf: IrmWorkflow) => run((d) => irmOps.updateWorkflow(d, wf, me)),
    markRead: (ids: string[]) => run((d) => irmOps.markRead(d, ids)),
    certify: (number: string) => run((d) => irmOps.certify(d, number, me)),
    flag: (number: string, reason: string) => run((d) => irmOps.flag(d, number, reason, me)),
    clearFlag: (number: string) => run((d) => irmOps.clearFlag(d, number, me)),
  };
}

/**
 * What an IRM event means, said to someone who only uses the report. Business
 * people never see IRM's own vocabulary ("incident", "controls", "DartBoards
 * effect"): they hear what happened to the report and what people now see.
 */
const PLAIN: Record<IrmEventType, (name: string) => [string, string?]> = {
  'incident-opened': (n) => [`We’ve flagged a known issue on ${n}`, 'Anyone opening it sees a notice while it’s being fixed.'],
  'incident-resolved': (n) => [`${n} is fixed`, 'The known-issue notice is gone.'],
  'decommission-scheduled': (n) => [`${n} is scheduled to retire`, 'People who use it now see the retire date.'],
  'decommission-cancelled': (n) => [`${n} is no longer retiring`, 'It stays listed as before.'],
  retired: (n) => [`${n} has been retired`, 'It’s no longer listed.'],
  'controls-overdue': (n) => [`${n} has an overdue review`, 'People see a note that its figures may not be certified yet.'],
  'controls-restored': (n) => [`${n}’s reviews are up to date`, 'The note about certification is gone.'],
  'release-deployed': (n) => [`An update to ${n} is live`],
  'access-changed': (n) => [`Who can see ${n} has changed`],
  'record-published': (n) => [`${n} is ready to be listed`],
};

/**
 * Says out loud what IRM just told DartBoards. Mounted once in the shell: it
 * watches the event log and toasts each new event's effect, whichever screen
 * (or the Simulate menu) caused it. For IRM's own roles that toast IS the
 * linkage, made visible; owners and readers get the same news in plain words.
 */
export function IrmAnnouncer() {
  const { state } = useSuite();
  const { go } = useNav();
  const { person } = useSignedIn();
  const plain = staysInCentral(audienceOf(state, person.id));
  const latest = state.irm.events[0]?.id;
  const seen = useRef<string | undefined>(latest);
  useEffect(() => {
    if (!latest || latest === seen.current) return;
    const fresh: IrmEvent[] = [];
    for (const ev of state.irm.events) {
      if (ev.id === seen.current) break;
      fresh.push(ev);
    }
    seen.current = latest;
    const nameOfRecord = (number: string) => {
      const r = state.irm.records.find((x) => x.number === number);
      return r ? recordName(r) : number;
    };
    // A burst (the clock moving on, a nightly reconcile) is one toast, not a stack of them.
    if (fresh.length > 2) {
      const changed = fresh.filter((e) => e.effects.length);
      if (plain) {
        if (!changed.length) return;
        const names = [...new Set(changed.map((e) => nameOfRecord(e.record)))];
        toast(`${names.length} ${names.length === 1 ? 'report has' : 'reports have'} news`, {
          description: names.slice(0, 3).join(' · ') + (names.length > 3 ? ' · …' : ''),
          action: { label: 'Open items', onClick: () => go({ page: 'my-requests' }) },
        });
        return;
      }
      toast(`IRM sent ${fresh.length} events${changed.length ? ` · ${changed.length} changed DartBoards` : ''}`, {
        description: changed.length
          ? changed.slice(0, 3).flatMap((e) => e.effects).join(' · ') + (changed.length > 3 ? ' · …' : '')
          : [...new Set(fresh.map((e) => EVENT_LABEL[e.type]))].join(' · '),
        action: { label: 'View log', onClick: () => go({ page: 'irm-integrations' }) },
      });
      return;
    }
    for (const ev of fresh.reverse()) {
      if (plain) {
        // Nothing listed for this report, so nothing anyone sees changed.
        if (!ev.effects.length) continue;
        const [title, description] = PLAIN[ev.type](nameOfRecord(ev.record));
        toast(title, description ? { description } : undefined);
        continue;
      }
      toast(ev.effects.length ? `IRM → DartBoards · ${EVENT_LABEL[ev.type]}` : `IRM · ${EVENT_LABEL[ev.type]}`, {
        description: ev.effects.length ? ev.effects.join(' · ') : ev.detail,
      });
    }
  }, [latest, state.irm.events, state.irm.records, plain, go]);
  return null;
}

/* ── The change table ────────────────────────────────────────────────────── */

export type ChangeColumn = 'id' | 'title' | 'record' | 'type' | 'priority' | 'status' | 'assignee' | 'requestedFor' | 'age' | 'opened' | 'createdBy' | 'deployer' | 'department' | 'closed' | 'update';
export type ChangeSort = { key: 'priority' | 'age' | 'opened'; dir: Exclude<TableSortDirection, null> };

export const sortChanges = (rows: IrmChange[], sort: ChangeSort | null, today: string) => {
  if (!sort) return rows;
  const v = (c: IrmChange) =>
    // Opened sorts by the date itself, so ascending is oldest first and the header arrow means what it shows.
    sort.key === 'priority' ? PRIORITY[c.priority].rank : sort.key === 'age' ? ageInStatus(c, today) : Number(c.opened.replace(/-/g, ''));
  return [...rows].sort((a, b) => (v(a) - v(b)) * (sort.dir === 'asc' ? 1 : -1));
};

export const CHANGE_HEADERS: Record<ChangeColumn, string> = {
  id: 'Change',
  title: 'Request',
  record: 'Report',
  type: 'Type',
  priority: 'Priority',
  status: 'Status',
  assignee: 'Assignee',
  requestedFor: 'Business owner',
  age: 'Age in status',
  opened: 'Opened',
  createdBy: 'Requested by',
  deployer: 'Deployer',
  department: 'Department',
  closed: 'Closed',
  update: 'Latest update',
};

export function ChangeTable({
  id,
  label,
  rows,
  columns,
  actions,
  sort,
  onSort,
}: {
  id: string;
  label: string;
  rows: IrmChange[];
  columns: ChangeColumn[];
  actions?: (c: IrmChange) => React.ReactNode;
  sort?: ChangeSort | null;
  onSort?: (s: ChangeSort) => void;
}) {
  const { state } = useSuite();
  const { go } = useNav();
  const sortable = (k: ChangeColumn): ChangeSort['key'] | null => (k === 'priority' ? 'priority' : k === 'age' ? 'age' : k === 'opened' ? 'opened' : null);
  return (
    <Table id={id} label={label}>
      <TableHead>
        <TableRow>
          {columns.map((k) => {
            const key = sortable(k);
            return (
              <TableHeaderCell
                key={k}
                sortDirection={key && onSort ? (sort?.key === key ? sort.dir : null) : undefined}
                onSort={key && onSort ? (dir) => onSort({ key, dir }) : undefined}
              >
                {CHANGE_HEADERS[k]}
              </TableHeaderCell>
            );
          })}
          {actions && (
            <TableHeaderCell align="end">
              <span className="ui-table__sr-only">Actions</span>
            </TableHeaderCell>
          )}
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((c) => {
          const rec = state.irm.records.find((r) => r.number === c.record);
          const key = `${id}-${c.id}`;
          return (
            <TableRow key={c.id}>
              {columns.map((k) => (
                <TableCell key={k} className={`ds-chg__cell ds-chg__cell--${k}`}>
                  {k === 'id' && <Ref>{c.id}</Ref>}
                  {k === 'title' && (
                    <Button id={`${key}-open`} style="link" className="ds-admin-rowlink" label={c.title} onClick={() => go({ page: 'irm-change', id: c.id })} />
                  )}
                  {k === 'record' && <RecordLink id={`${key}-rec`} record={rec} number={c.record} />}
                  {k === 'type' && <TypeBadge id={`${key}-type`} change={c} />}
                  {k === 'priority' && <PriorityBadge id={`${key}-pri`} priority={c.priority} />}
                  {k === 'status' && <StatusBadge id={`${key}-st`} status={c.status} />}
                  {k === 'assignee' && <Text as="span" tone={c.assigneeId ? 'default' : 'muted'}>{nameOf(c.assigneeId)}</Text>}
                  {k === 'requestedFor' && nameOf(c.requestedForId)}
                  {k === 'age' && <Age change={c} />}
                  {k === 'opened' && fmtIso(c.opened)}
                  {k === 'createdBy' && nameOf(c.createdById)}
                  {k === 'deployer' && <Text as="span" tone={c.deployerId ? 'default' : 'muted'}>{c.deployerId ? nameOf(c.deployerId) : '—'}</Text>}
                  {k === 'department' && (rec?.department ?? '—')}
                  {k === 'closed' && <Text as="span" tone={c.closed ? 'default' : 'muted'}>{c.closed ? fmtIso(c.closed) : 'Open'}</Text>}
                  {k === 'update' && <LatestUpdate change={c} />}
                </TableCell>
              ))}
              {actions && <TableCell align="end" className="ds-chg__cell">{actions(c)}</TableCell>}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

/* ── The row menu a developer / manager works a change with ──────────────── */

export function WorkMenu({ id, change, canAssign = true, className }: { id: string; change: IrmChange; canAssign?: boolean; className?: string }) {
  const { state } = useSuite();
  const irm = useIrm();
  return (
    <DropdownMenu id={`${id}-menu`}>
      <DropdownMenuTrigger>
        <Button id={`${id}-menu-btn`} className={className} style="ghost" size="sm" iconOnly IconCenter={MoreHorizontal} aria-label={`Actions for ${change.id}`} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Move to</DropdownMenuLabel>
        {stagesFor(change.type, state.irm.workflows).filter((s) => s !== change.status).map((s) => (
          <DropdownMenuItem key={s} onClick={() => irm.move(change.id, s)}>
            {CHANGE_STATUS[s].label}
          </DropdownMenuItem>
        ))}
        {change.status !== 'on-hold' && <DropdownMenuItem onClick={() => irm.move(change.id, 'on-hold')}>On hold</DropdownMenuItem>}
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Priority</DropdownMenuLabel>
        {(['P1', 'P2', 'P3', 'P4'] as const)
          .filter((p) => p !== change.priority)
          .map((p) => (
            <DropdownMenuItem key={p} onClick={() => irm.setPriority(change.id, p)}>
              {PRIORITY[p].label}
            </DropdownMenuItem>
          ))}
        {canAssign && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Assign to</DropdownMenuLabel>
            {IRM_DEVELOPERS.filter((p) => p !== change.assigneeId).map((p) => (
              <DropdownMenuItem key={p} onClick={() => irm.assign(change.id, p)}>
                {nameOf(p)}
              </DropdownMenuItem>
            ))}
            {change.assigneeId && <DropdownMenuItem onClick={() => irm.assign(change.id, undefined)}>Unassign</DropdownMenuItem>}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ── Simulate — a prototype tool, not a feature ──────────────────────────── */

/** Records with a live DartBoards listing, for the Simulate menu's targets. */
const listedRecord = (state: ReturnType<typeof useSuite>['state'], dashId: string) => state.dashboards.find((d) => d.id === dashId)?.irm;

export function SimulateMenu() {
  const { state, update } = useSuite();
  // The announcer reports what DartBoards did; this only says what the simulation changed.
  const after = (fn: Parameters<typeof update>[0], what: string) => {
    update(fn);
    toast(what);
  };
  return (
    <DropdownMenu id="ds-irm-sim">
      <DropdownMenuTrigger>
        <Button id="ds-irm-sim-btn" style="ghost" size="sm" IconLeft={FlaskConical} label={`Simulate · ${fmtIso(state.irm.today)}`} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>Prototype only — move IRM’s clock or cause trouble</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => after((d) => irmOps.advanceClock(d, 7), 'IRM’s clock moved on 7 days')}>
          <CalendarClock aria-hidden="true" />
          Advance 7 days
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => after((d) => irmOps.advanceClock(d, 30), 'IRM’s clock moved on 30 days')}>
          <CalendarClock aria-hidden="true" />
          Advance 30 days
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            const n = listedRecord(state, 'nps-trends');
            if (n) after((d) => irmOps.simulateOverdue(d, n), 'A control on NPS Trends is now overdue');
          }}
        >
          <TriangleAlert aria-hidden="true" />
          Make a control overdue (NPS Trends)
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            const n = listedRecord(state, 'revenue-by-region');
            if (n) after((d) => irmOps.simulateIncident(d, n, 'Revenue by Region did not refresh this morning'), 'Revenue by Region has an open incident');
          }}
        >
          <Zap aria-hidden="true" />
          Open an incident (Revenue by Region)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Everyone in IRM, for owner pickers. */
export const IRM_PEOPLE = PEOPLE;

/** The newest line of a request's history and when it happened: "Moved to In review · Oct 4". */
function LatestUpdate({ change }: { change: IrmChange }) {
  const last = change.history[change.history.length - 1];
  if (!last) return <Text as="span" tone="muted">—</Text>;
  return (
    <span className="ds-chg__update">
      <Text as="span" size="sm" lines={1}>{last.text}</Text>
      <Text as="span" size="xs" tone="muted">
        {last.name} · {last.at}
      </Text>
    </span>
  );
}

/**
 * Reject with a reason. The requester reads the reason in the request's history, so a rejection is
 * never a dead end: they learn what to change and can ask again.
 */
export function RejectDialog({ id, change, onClose }: { id: string; change: IrmChange | null; onClose: () => void }) {
  const irm = useIrm();
  const [reason, setReason] = useState('');
  const close = () => {
    setReason('');
    onClose();
  };
  const commit = () => {
    if (!change || !reason.trim()) return;
    irm.reject(change.id, reason.trim());
    close();
  };
  return (
    <Dialog id={id} open={!!change} onClose={close}>
      <DialogHeader id={`${id}-header`} title={`Reject ${change?.id ?? ''}`} description={change?.title} onClose={close} />
      <DialogBody>
        <Textarea
          id={`${id}-reason`}
          label="Reason"
          description="The requester sees this on the request, so say what would need to change."
          value={reason}
          onValueChange={setReason}
          required
          autoFocus
        />
      </DialogBody>
      <DialogFooter>
        <Button id={`${id}-cancel`} style="ghost" label="Cancel" onClick={close} />
        <Button id={`${id}-confirm`} variant="error" label="Reject request" disabled={!reason.trim()} onClick={commit} />
      </DialogFooter>
    </Dialog>
  );
}
