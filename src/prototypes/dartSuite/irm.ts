/* ── DART Suite prototype · IRM, the system of record ─────────────────────────
   IRM is where a report is REQUESTED, BUILT and GOVERNED for its whole life:
   a new report, a break (fix), a modification, a decommission — each a change
   request against an IRM record, which also carries the report's controls,
   owners, access group and its periodic recertification ("evergreen").

   DartBoards only LISTS finished reports. A listing points at its record by IRM
   number (`Dashboard.irm`), and IRM drives it: retiring a record retires the
   listing, an open break shows as a known issue, overdue controls are flagged to
   viewers. That linkage lives in irmEngine.ts; this file is the domain and the
   seed data. IRM's dates are ISO and run on a simulated clock (`irm.today`), so a
   notice period can be played through in the prototype. */

import type { Dashboard, IrmChangeType, IrmRole, Route, ThreadEntry } from './types';
import type { Tone } from './store';

/* ── Domain ─────────────────────────────────────────────────────────────────── */

/** The roll-up a DartBoards screen shows: any control overdue → overdue; any awaiting sign-off → pending. */
export type IrmControls = 'complete' | 'pending' | 'overdue';

export type IrmLifecycle = 'intake' | 'in-development' | 'in-review' | 'production' | 'retiring' | 'retired';

export type IrmControlKind = 'access-review' | 'data-quality' | 'change-approval' | 'recertification';

export type IrmControl = {
  id: string;
  name: string;
  kind: IrmControlKind;
  /** Days between attestations. */
  cadenceDays: number;
  /** ISO. Absent = never attested (a new report's controls start pending). */
  lastAttested?: string;
  /** ISO. Past this and not attested = overdue. */
  due: string;
  ownerId: string;
};

export type IrmEvergreen = {
  cadence: 'Annual' | 'Semi-annual' | 'Quarterly';
  /** ISO. */
  lastCertified: string;
  /** ISO. */
  due: string;
};

export type IrmRecord = {
  /** "IRM-20512". Every IRM name starts with it. */
  number: string;
  /** The name as IRM holds it — number first, version last. */
  name: string;
  description: string;
  developer: string;
  developerId: string;
  businessOwner: string;
  businessOwnerId: string;
  source: Dashboard['source'];
  /** The access role (entitlement group) a reader needs to see the report. */
  accessGroup: string;
  /** The business or department the report serves. */
  department: string;
  /** Why the report exists, in one sentence — what decision it supports. */
  purpose: string;
  /** Where its Business Requirements Document lives (a SharePoint link). */
  brdLocation: string;
  /** ISO date-time of its last successful run. Absent = it has never run (still being built). */
  lastRun?: string;
  /** Roll-up of `controlItems`, kept in step by the engine. Read by DartBoards. */
  controls: IrmControls;
  /** The most recent attestation across the controls, for display. */
  lastReviewed: string;
  lifecycle: IrmLifecycle;
  /** ISO. Set while retiring and after. */
  retireOn?: string;
  /** The IRM number that replaces this report, when there is one. */
  replacedBy?: string;
  /** 1 = critical (regulatory, committee), 3 = team convenience. Drives control cadence. */
  tier: 1 | 2 | 3;
  classification: 'Internal' | 'Confidential' | 'Restricted';
  refresh: string;
  version: number;
  controlItems: IrmControl[];
  evergreen: IrmEvergreen;
  flagged?: { reason: string; byId: string; on: string };
  /** Lineage, upstream: the data assets this report is built from. */
  sources: IrmLineageNode[];
  /** Lineage, upstream: other IRM reports this one takes figures from. Downstream is derived (`dependentsOf`). */
  dependsOn: string[];
};

/** A data asset a report reads: a source system, a pipeline, a warehouse table. */
export type IrmLineageNode = {
  id: string;
  name: string;
  kind: 'system' | 'pipeline' | 'table';
  /** Where it lives: Salesforce, dbt, Snowflake… */
  platform: string;
};

export type IrmChangeStatus =
  | 'pending-approval'
  | 'ready'
  | 'in-development'
  | 'in-review'
  | 'awaiting-deployment'
  | 'scheduled'
  | 'deployed'
  | 'on-hold'
  | 'rejected'
  | 'cancelled';

export type IrmPriority = 'P1' | 'P2' | 'P3' | 'P4';

export type IrmChange = {
  /** "CHG-1042". */
  id: string;
  /** The record it is against. A `new` request creates its record at intake. */
  record: string;
  type: IrmChangeType;
  title: string;
  summary: string;
  status: IrmChangeStatus;
  priority: IrmPriority;
  /** The developer working it. Absent = unassigned (the dev manager's Unassigned lane). */
  assigneeId?: string;
  /** Production support's owner for the deployment step. */
  deployerId?: string;
  createdById: string;
  /** The business owner it is for — who approves it. */
  requestedForId: string;
  /** ISO. */
  opened: string;
  /** ISO. When it entered its current status — "age in status". */
  statusSince: string;
  /** ISO. When it reached deployed / rejected / cancelled. */
  closed?: string;
  /** Decommission only. */
  retireOn?: string;
  replacedBy?: string;
  /** Two-step approval (`approver: 'both'`): the business owner has approved, governance has not yet. */
  ownerApproved?: boolean;
  history: ThreadEntry[];
};

export type IrmIncident = {
  id: string;
  record: string;
  /** The break change that will fix it. */
  changeId?: string;
  summary: string;
  /** ISO. */
  opened: string;
  resolved?: string;
};

/**
 * What IRM tells the systems that consume it. The prototype's stand-in for a
 * webhook or a queue: every IRM action that a consumer cares about appends one,
 * and `effects` records what DartBoards did with it — the Integrations page
 * shows the two side by side, which is the linkage made visible.
 */
export type IrmEventType =
  | 'decommission-scheduled'
  | 'decommission-cancelled'
  | 'retired'
  | 'controls-overdue'
  | 'controls-restored'
  | 'incident-opened'
  | 'incident-resolved'
  | 'release-deployed'
  | 'access-changed'
  | 'record-published';

export type IrmEvent = {
  id: string;
  type: IrmEventType;
  record: string;
  /** ISO, on IRM's clock. */
  at: string;
  detail: string;
  /** What DartBoards did. Empty = no listing for this record, so nothing to change. */
  effects: string[];
};

/* ── Evidence: an attestation is a submission someone else reviews ── */

export type IrmEvidence = { kind: 'link' | 'file'; label: string; url?: string };

export type IrmAttestation = {
  id: string;
  record: string;
  controlId: string;
  /** `irm` for an automated check. */
  submittedById: string;
  /** ISO. The control counts as attested from this date once accepted. */
  submittedOn: string;
  evidence: IrmEvidence[];
  note: string;
  outcome: 'pending' | 'accepted' | 'rejected';
  /** Never the submitter: separation of duties. */
  reviewerId?: string;
  reviewedOn?: string;
  reviewNote?: string;
};

/* ── Notifications: what IRM tells a person, in the app and by email ── */

export type IrmNotificationKind =
  | 'approval'
  | 'evergreen'
  | 'control-due'
  | 'aged'
  | 'attestation-review'
  | 'attestation-reviewed'
  | 'retiring'
  | 'ready-to-list'
  | 'request-update';

export type IrmNotification = {
  id: string;
  /** Dedup key: the same reminder is never sent twice for the same occurrence. */
  key: string;
  personId: string;
  /** ISO, IRM's clock. */
  at: string;
  kind: IrmNotificationKind;
  title: string;
  body: string;
  route: Route;
  read: boolean;
  /** Which application it is from. Absent = IRM. The bell is the whole suite's, so it says. */
  app?: 'IRM' | 'DartBoards' | 'DART Central';
};

/* ── Audit: who changed what, when, from what to what ── */

export type IrmAuditEntry = {
  id: string;
  /** ISO, IRM's clock. */
  at: string;
  /** A person id, or `irm` for the system (the clock, an automated check). */
  actorId: string;
  /** The IRM record it concerns; absent for a workflow change. */
  record?: string;
  entity: 'record' | 'change' | 'control' | 'workflow';
  /** CHG-…, IRM-…, a control id, or a workflow type. */
  entityId: string;
  action: string;
  field?: string;
  from?: string;
  to?: string;
};

/* ── Workflow: per request type, set by the governance team ── */

export type IrmApprover = 'none' | 'business-owner' | 'governance' | 'both';

export type IrmStage = {
  status: IrmChangeStatus;
  enabled: boolean;
  /** A stage the process cannot run without. */
  required?: boolean;
  /** Days a change may sit here before it is past its SLA. */
  slaDays?: number;
};

export type IrmWorkflow = {
  type: IrmChangeType;
  approver: IrmApprover;
  /** In order. `pending-approval` is governed by `approver`, not listed here. */
  stages: IrmStage[];
  /** Decommission only: the shortest notice a retire date may give. */
  noticeDays?: number;
  /** SLA for the approval step. */
  approvalSlaDays: number;
};

export type IrmState = {
  records: IrmRecord[];
  changes: IrmChange[];
  incidents: IrmIncident[];
  events: IrmEvent[];
  attestations: IrmAttestation[];
  notifications: IrmNotification[];
  audit: IrmAuditEntry[];
  workflows: Record<IrmChangeType, IrmWorkflow>;
  /** The simulated date, ISO. Advanced from IRM's Simulate menu to play a notice period through. */
  today: string;
};

/* ── Vocabulary ─────────────────────────────────────────────────────────────── */

export const CONTROLS: Record<IrmControls, { label: string; short: string; color: 'success' | 'warning' | 'error' }> = {
  complete: { label: 'Controls complete', short: 'Complete', color: 'success' },
  pending: { label: 'Controls pending sign-off', short: 'Pending sign-off', color: 'warning' },
  overdue: { label: 'Control review overdue', short: 'Overdue', color: 'error' },
};

export const LIFECYCLE: Record<IrmLifecycle, { label: string; tone: Tone }> = {
  intake: { label: 'Intake', tone: 'neutral' },
  'in-development': { label: 'In development', tone: 'info' },
  'in-review': { label: 'In review', tone: 'info' },
  production: { label: 'Production', tone: 'success' },
  retiring: { label: 'Retiring', tone: 'warning' },
  retired: { label: 'Retired', tone: 'neutral' },
};

export const CHANGE_TYPE: Record<IrmChangeType, { label: string; tone: Tone; hint: string }> = {
  new: { label: 'A new report', tone: 'info', hint: 'A report that does not exist yet.' },
  break: { label: 'Something is wrong', tone: 'error', hint: 'Something in production is wrong — a fix.' },
  modification: { label: 'Change what a report shows', tone: 'default', hint: 'A change to a working report.' },
  decommission: { label: 'Retire a report', tone: 'warning', hint: 'Retire a report, with a notice period.' },
};

export const CHANGE_STATUS: Record<IrmChangeStatus, { label: string; tone: Tone; active: boolean }> = {
  'pending-approval': { label: 'Pending approval', tone: 'warning', active: true },
  ready: { label: 'Ready', tone: 'info', active: true },
  'in-development': { label: 'In development', tone: 'info', active: true },
  'in-review': { label: 'In review', tone: 'info', active: true },
  'awaiting-deployment': { label: 'Awaiting deployment', tone: 'info', active: true },
  scheduled: { label: 'Scheduled', tone: 'warning', active: true },
  deployed: { label: 'Deployed', tone: 'success', active: false },
  'on-hold': { label: 'On hold', tone: 'neutral', active: true },
  rejected: { label: 'Rejected', tone: 'error', active: false },
  cancelled: { label: 'Cancelled', tone: 'neutral', active: false },
};

/** The working order of a change, for the board's columns and the "move to" menus. */
export const WORK_STATUSES: IrmChangeStatus[] = ['ready', 'in-development', 'in-review', 'awaiting-deployment'];

export const PRIORITY: Record<IrmPriority, { label: string; tone: Tone; rank: number }> = {
  P1: { label: 'P1 · Critical', tone: 'error', rank: 0 },
  P2: { label: 'P2 · High', tone: 'default', rank: 1 },
  P3: { label: 'P3 · Normal', tone: 'info', rank: 2 },
  P4: { label: 'P4 · Low', tone: 'neutral', rank: 3 },
};

/** Days a change may sit in one status before governance calls it aged. */
export const STATUS_SLA_DAYS: Partial<Record<IrmChangeStatus, number>> = {
  'pending-approval': 3,
  ready: 5,
  'in-development': 15,
  'in-review': 5,
  'awaiting-deployment': 3,
};

export const ROLE_LABEL: Record<IrmRole, string> = {
  business: 'Business user',
  developer: 'Developer',
  'dev-manager': 'Development manager',
  governance: 'Governance team',
  'prod-support': 'Production support',
};

export const EVENT_LABEL: Record<IrmEventType, string> = {
  'decommission-scheduled': 'Retirement scheduled',
  'decommission-cancelled': 'Retirement cancelled',
  retired: 'Report retired',
  'controls-overdue': 'Controls overdue',
  'controls-restored': 'Controls restored',
  'incident-opened': 'Incident opened',
  'incident-resolved': 'Incident resolved',
  'release-deployed': 'Release deployed',
  'access-changed': 'Access group changed',
  'record-published': 'Ready to list',
};

/* ── Dates (ISO, on IRM's clock) ────────────────────────────────────────────── */

/**
 * The suite's one clock starts on today's date, so IRM and Home agree on what "today" is (Home's date
 * reads `state.irm.today`; Simulate moves both). The seed is built relative to it, so ages and due
 * dates hold whatever day the prototype is opened.
 */
export const IRM_START = (() => {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
})();

const toDate = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
};
const toIso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Day arithmetic on the calendar fields, never milliseconds (DST). */
export const addDaysIso = (iso: string, n: number) => {
  const d = toDate(iso);
  return toIso(new Date(d.getFullYear(), d.getMonth(), d.getDate() + n));
};
export const daysBetween = (from: string, to: string) =>
  Math.round((toDate(to).getTime() - toDate(from).getTime()) / 86_400_000);
/** "2026-10-17" → "Oct 17, 2026". */
export const fmtIso = (iso: string) =>
  toDate(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
/** "2026-10" → "Oct". */
export const monthLabel = (iso: string) => toDate(iso).toLocaleDateString('en-US', { month: 'short' });

/* ── Derived state ──────────────────────────────────────────────────────────── */

export type ControlState = 'ok' | 'due-soon' | 'overdue' | 'pending' | 'in-review';
/** `inReview`: evidence has been submitted and is waiting on a reviewer. */
export const controlState = (c: IrmControl, today: string, inReview = false): ControlState =>
  inReview ? 'in-review' : !c.lastAttested ? 'pending' : c.due < today ? 'overdue' : daysBetween(today, c.due) <= 14 ? 'due-soon' : 'ok';

export const CONTROL_STATE: Record<ControlState, { label: string; tone: Tone }> = {
  ok: { label: 'Attested', tone: 'default' },
  'due-soon': { label: 'Due soon', tone: 'warning' },
  overdue: { label: 'Overdue', tone: 'error' },
  pending: { label: 'Not attested', tone: 'warning' },
  'in-review': { label: 'Evidence in review', tone: 'info' },
};

export const rollupControls = (r: IrmRecord, today: string): IrmControls => {
  const states = r.controlItems.map((c) => controlState(c, today));
  return states.includes('overdue') ? 'overdue' : states.includes('pending') ? 'pending' : 'complete';
};

export type EvergreenState = 'current' | 'due-soon' | 'past-due';
export const evergreenState = (r: IrmRecord, today: string): EvergreenState =>
  r.evergreen.due < today ? 'past-due' : daysBetween(today, r.evergreen.due) <= 30 ? 'due-soon' : 'current';

export const EVERGREEN: Record<EvergreenState, { label: string; tone: Tone }> = {
  current: { label: 'Current', tone: 'success' },
  'due-soon': { label: 'Due soon', tone: 'warning' },
  'past-due': { label: 'Past due', tone: 'error' },
};

export const ageInStatus = (c: IrmChange, today: string) => daysBetween(c.statusSince, today);
/** The SLA a change's current status carries under its type's workflow. */
export const slaFor = (c: IrmChange, workflows: Record<IrmChangeType, IrmWorkflow>): number | undefined => {
  const wf = workflows[c.type];
  if (c.status === 'pending-approval') return wf.approvalSlaDays;
  return wf.stages.find((s) => s.status === c.status)?.slaDays ?? STATUS_SLA_DAYS[c.status];
};
export const isAged = (c: IrmChange, today: string, workflows: Record<IrmChangeType, IrmWorkflow>) => {
  const sla = slaFor(c, workflows);
  return sla !== undefined && ageInStatus(c, today) > sla;
};

/* ── Workflow defaults (governance can change every one of these) ── */

export const APPROVER: Record<IrmApprover, { label: string; hint: string }> = {
  none: { label: 'No approval', hint: 'Goes straight to the development queue.' },
  'business-owner': { label: 'Business owner', hint: 'The report’s business owner approves.' },
  governance: { label: 'Governance team', hint: 'The governance team approves.' },
  both: { label: 'Business owner, then governance', hint: 'The business owner approves first, then the governance team.' },
};

const build = (opts: { review?: boolean; ready?: boolean }): IrmStage[] => [
  { status: 'ready', enabled: opts.ready ?? true, slaDays: 5 },
  { status: 'in-development', enabled: true, required: true, slaDays: 15 },
  { status: 'in-review', enabled: opts.review ?? true, slaDays: 5 },
  { status: 'awaiting-deployment', enabled: true, required: true, slaDays: 3 },
];

export const DEFAULT_WORKFLOWS: Record<IrmChangeType, IrmWorkflow> = {
  new: { type: 'new', approver: 'business-owner', approvalSlaDays: 3, stages: build({}) },
  break: {
    type: 'break',
    approver: 'none',
    approvalSlaDays: 1,
    stages: [
      { status: 'ready', enabled: true, slaDays: 1 },
      { status: 'in-development', enabled: true, required: true, slaDays: 3 },
      { status: 'in-review', enabled: true, slaDays: 1 },
      { status: 'awaiting-deployment', enabled: true, required: true, slaDays: 1 },
    ],
  },
  modification: { type: 'modification', approver: 'business-owner', approvalSlaDays: 3, stages: build({}) },
  decommission: {
    type: 'decommission',
    approver: 'governance',
    approvalSlaDays: 5,
    noticeDays: 14,
    stages: [{ status: 'scheduled', enabled: true, required: true }],
  },
};

/** The working stages a change of this type moves through, in order. */
export const stagesFor = (type: IrmChangeType, workflows: Record<IrmChangeType, IrmWorkflow>) =>
  workflows[type].stages.filter((s) => s.enabled).map((s) => s.status);

/* ── Lineage ── */

/** Everything that takes figures from this report, directly or through another report. */
export function dependentsOf(records: IrmRecord[], number: string, seen = new Set<string>()): IrmRecord[] {
  const direct = records.filter((r) => r.dependsOn.includes(number) && !seen.has(r.number) && r.lifecycle !== 'retired');
  for (const r of direct) seen.add(r.number);
  return [...direct, ...direct.flatMap((r) => dependentsOf(records, r.number, seen))];
}

/** A record's name as people say it: no IRM number in front, no version behind. */
export const recordName = (r: Pick<IrmRecord, 'name'>) => r.name.replace(/^IRM-\d+\s*/, '').replace(/\s+v\d+$/, '');

/** Records finished in IRM and not yet listed in DartBoards — what a publish request picks from. */
export const publishable = (records: IrmRecord[], dashboards: Dashboard[]) =>
  records.filter((r) => r.lifecycle === 'production' && !dashboards.some((d) => d.irm === r.number && d.lifecycle === 'published'));

/** The IRM record behind a DartBoards listing. Every seed listing has one (seedIrm assigns it). */
export function irmFor(d: Dashboard, records: IrmRecord[]): IrmRecord | undefined {
  return d.irm ? records.find((r) => r.number === d.irm) : undefined;
}

/** "IRM-20512 Originations Daily Volume v1" → "Originations Daily Volume": the number and version are IRM's, not the reader's. */
export const displayTitleFrom = (irmName: string) =>
  irmName
    .replace(/^IRM-\d+\s*/, '')
    .replace(/\s+v\d+$/i, '')
    .trim();

/* ── Seed ───────────────────────────────────────────────────────────────────── */

const hash = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

/** The IRM people. Business owners are the DartBoards owners; the rest work in IRM. */
export const IRM_PEOPLE_BY_NAME: Record<string, string> = {
  'Kahrman McKenzie': 'u-km',
  'Priya Raman': 'u-pr',
  'Sam Okafor': 'u-so',
  'Dana Wu': 'u-dw',
  'Jordan Lee': 'u-jl',
  'Maya Hart': 'u-mh',
  'Jordan Mount': 'u-jm',
  'Leo Grant': 'u-lg',
};
const DEVS = [
  ['Jordan Mount', 'u-jm'],
  ['Sam Okafor', 'u-so'],
  ['Dana Wu', 'u-dw'],
  ['Leo Grant', 'u-lg'],
] as const;
const GOVERNANCE_ID = 'u-np';

const controlsFor = (number: string, tier: IrmRecord['tier'], ownerId: string, today: string, overdue: boolean): IrmControl[] => {
  const h = hash(number);
  const mk = (kind: IrmControlKind, name: string, cadenceDays: number, ago: number): IrmControl => {
    const lastAttested = addDaysIso(today, -ago);
    return { id: `${number}-${kind}`, name, kind, cadenceDays, lastAttested, due: addDaysIso(lastAttested, cadenceDays), ownerId };
  };
  // Tier 1 reviews access quarterly; everything else twice a year.
  const accessCadence = tier === 1 ? 90 : 180;
  return [
    mk('access-review', 'Access review', accessCadence, overdue ? accessCadence + 12 : 20 + (h % 40)),
    mk('data-quality', 'Data quality checks', 30, 5 + (h % 20)),
    mk('change-approval', 'Change approval on release', 365, 40 + (h % 200)),
  ];
};

const record = (
  base: Omit<
    IrmRecord,
    'controls' | 'lastReviewed' | 'controlItems' | 'evergreen' | 'tier' | 'classification' | 'refresh' | 'version' | 'description' | 'developerId' | 'businessOwnerId' | 'sources' | 'dependsOn' | 'purpose' | 'brdLocation' | 'lastRun'
  > &
    Partial<IrmRecord> & { overdue?: boolean; evergreenAgo?: number },
  today: string,
): IrmRecord => {
  const h = hash(base.number);
  const tier = base.tier ?? (((h % 3) + 1) as IrmRecord['tier']);
  const ownerId = IRM_PEOPLE_BY_NAME[base.businessOwner] ?? 'u-pr';
  const controlItems = base.controlItems ?? controlsFor(base.number, tier, GOVERNANCE_ID, today, !!base.overdue);
  const lastCertified = addDaysIso(today, -(base.evergreenAgo ?? 30 + (h % 300)));
  const r: IrmRecord = {
    description: base.description ?? '',
    developerId: IRM_PEOPLE_BY_NAME[base.developer] ?? 'u-jm',
    businessOwnerId: ownerId,
    tier,
    classification: base.classification ?? (tier === 1 ? 'Restricted' : h % 2 ? 'Confidential' : 'Internal'),
    refresh: base.refresh ?? ['Daily · 6:00 AM ET', 'Hourly', 'Weekly · Mondays', 'Nightly'][h % 4],
    version: base.version ?? 1 + (h % 3),
    evergreen: base.evergreen ?? { cadence: 'Annual', lastCertified, due: addDaysIso(lastCertified, 365) },
    sources: base.sources ?? [],
    dependsOn: base.dependsOn ?? [],
    purpose: base.purpose ?? (base.description || `Gives ${base.department} one governed view of ${base.name.replace(/^IRM-\d+\s*/, '').replace(/\s+v\d+$/, '').toLowerCase()}.`),
    brdLocation: base.brdLocation ?? brdFor(base.number, base.department),
    // A report in production last ran within the last couple of days; one still being built never has.
    lastRun: base.lastRun ?? (base.lifecycle === 'production' || base.lifecycle === 'retiring' ? `${addDaysIso(today, -(h % 3))}T${String(5 + (h % 4)).padStart(2, '0')}:${String((h * 7) % 60).padStart(2, '0')}` : undefined),
    ...base,
    controlItems,
    controls: 'complete',
    lastReviewed: '',
  };
  r.controls = rollupControls(r, today);
  const last = controlItems.map((c) => c.lastAttested).filter((x): x is string => !!x).sort().pop();
  r.lastReviewed = last ? fmtIso(last) : '—';
  return r;
};

/** Where a report's BRD lives: its department's SharePoint library, filed by IRM number. */
export const brdFor = (number: string, department: string) => `https://sharepoint.example.com/sites/BRD/${department.replace(/\s+/g, '')}/${number}-BRD.docx`;

/** A dashboard's category, as the business it serves. */
const DEPARTMENT: Record<Dashboard['category'], string> = { Operations: 'Operations', Finance: 'Finance', Sales: 'Sales', Customer: 'Customer Experience', Risk: 'Risk' };

/**
 * Gives every DartBoards dashboard its IRM record (and its `irm` number), then
 * adds the reports IRM holds that DartBoards does not list yet, and the change
 * requests, incidents and history every persona's view is built from.
 * Mutates `dashboards` to set `irm` — they are the store's own copies.
 */
export function seedIrm(dashboards: Dashboard[], today = IRM_START): IrmState {
  const used = new Set<number>();
  const numberFor = (d: Dashboard) => {
    let n = 20000 + (hash(d.id) % 900);
    while (used.has(n)) n++;
    used.add(n);
    return `IRM-${n}`;
  };
  // The unlisted ones take their numbers first, so a listing can never collide with them.
  for (const n of [20512, 20577, 20603, 20618, 20641, 20655, 20668]) used.add(n);

  const records: IrmRecord[] = [];
  for (const d of dashboards) {
    if (d.id === 'originations-volume') d.irm = 'IRM-20512';
    if (!d.irm) d.irm = numberFor(d);
    if (d.id === 'originations-volume') continue; // it is the unlisted IRM-20512, below
    const h = hash(d.id);
    const [developer] = DEVS[h % DEVS.length];
    // A few listings start with something for IRM to say: overdue controls, a past-due evergreen.
    // Rare on purpose — a governance queue that is mostly red teaches nothing.
    const overdue = h % 23 === 0 && d.id !== 'nps-trends';
    records.push(
      record(
        {
          number: d.irm,
          name: `${d.irm} ${d.name} v${1 + (h % 3)}`,
          description: d.description,
          developer,
          businessOwner: d.owner,
          source: d.source,
          accessGroup: `${d.category.toUpperCase()}_${d.hasAccess ? 'ALL' : 'RESTRICTED'}`,
          department: DEPARTMENT[d.category],
          lifecycle: 'production',
          overdue,
          evergreenAgo: h % 31 === 0 ? 372 + (h % 45) : h % 13 === 0 ? 345 + (h % 15) : undefined,
        },
        today,
      ),
    );
  }

  // The legacy servicing dashboard is mid-decommission: IRM retires it in two weeks.
  const legacy = dashboards.find((d) => d.id === 'servicing-overview-legacy');
  const replacement = dashboards.find((d) => d.id === 'servicing-overview');
  const legacyRec = records.find((r) => r.number === legacy?.irm);
  if (legacyRec && replacement?.irm) {
    legacyRec.lifecycle = 'retiring';
    legacyRec.retireOn = addDaysIso(today, 14);
    legacyRec.replacedBy = replacement.irm;
  }

  // The current user owns a handful, so the business-user persona has an inventory.
  for (const id of ['revenue-by-region', 'pipeline-health', 'campaign-roi', 'marketing-funnel']) {
    const r = records.find((x) => x.number === dashboards.find((d) => d.id === id)?.irm);
    if (r) {
      r.businessOwner = 'Kahrman McKenzie';
      r.businessOwnerId = 'u-km';
      // One is coming up for recertification, so the owner has something to certify.
      if (id === 'marketing-funnel') {
        const last = addDaysIso(today, -352);
        r.evergreen = { ...r.evergreen, lastCertified: last, due: addDaysIso(last, 365) };
      }
    }
  }
  // Two flagged for governance review.
  const flag = (id: string, reason: string) => {
    const r = records.find((x) => x.number === dashboards.find((d) => d.id === id)?.irm);
    if (r) r.flagged = { reason, byId: GOVERNANCE_ID, on: addDaysIso(today, -6) };
  };
  flag('churn-risk', 'Uses customer sentiment scores — confirm the classification is still Confidential.');
  flag('risk-exposure', 'Feeds the risk committee pack; tier 1 controls need a second reviewer.');

  // Finished in IRM, not listed in DartBoards yet — what a publish request picks from.
  const unlisted: [string, string, string, string, Dashboard['source'], string, IrmLifecycle, string, string][] = [
    ['IRM-20512', 'Originations Daily Volume', 'Jordan Mount', 'Priya Raman', 'Tableau', 'ORIG_READERS', 'production', 'Lending', 'Tracks daily application and funded volume so lending can staff underwriting.'],
    ['IRM-20577', 'Hardship Program Tracker', 'Sam Okafor', 'Jordan Lee', 'Power BI', 'COLL_HARDSHIP', 'production', 'Collections', 'Shows who is on a hardship plan and how many stay current, for the monthly program review.'],
    ['IRM-20603', 'Fraud Alerts Monitor', 'Dana Wu', 'Maya Hart', 'Tableau', 'FRAUD_OPS', 'production', 'Risk', 'Surfaces fraud alerts by channel so the fraud desk can work the riskiest first.'],
    ['IRM-20618', 'Recoveries Weekly Pack', 'Jordan Mount', 'Jordan Lee', 'DART', 'COLL_ALL', 'production', 'Collections', 'The weekly recoveries numbers the collections leadership meeting runs on.'],
    // Still being built — they appear in IRM and nowhere in DartBoards.
    ['IRM-20641', 'Agency Placement Tracker', 'Leo Grant', 'Jordan Lee', 'DART', 'COLL_AGENCY', 'in-development', 'Collections', 'Compares outside agencies on what they recover, to decide where accounts are placed.'],
    ['IRM-20655', 'Branch Traffic Daily', 'Dana Wu', 'Kahrman McKenzie', 'Power BI', 'BRANCH_ALL', 'intake', 'Retail Banking', 'Counts branch visits by hour so branches can schedule tellers.'],
    ['IRM-20668', 'Mortgage Pipeline Aging', 'Sam Okafor', 'Priya Raman', 'Tableau', 'MORT_PIPE', 'in-review', 'Lending', 'Shows how long mortgages sit at each stage, to find where closings stall.'],
  ];
  for (const [number, title, developer, owner, source, group, lifecycle, department, purpose] of unlisted) {
    const r = record({ number, name: `${number} ${title} v1`, developer, businessOwner: owner, source, accessGroup: group, lifecycle, version: 1, evergreenAgo: 10, department, purpose }, today);
    // The Fraud monitor's controls are not signed off yet — the publish form holds it back.
    if (number === 'IRM-20603') r.controlItems[0].lastAttested = undefined;
    // Reports still being built have no attestations at all.
    if (lifecycle !== 'production') r.controlItems.forEach((c) => (c.lastAttested = undefined));
    r.controls = rollupControls(r, today);
    records.push(r);
  }

  /* ── Change requests ── */
  const byIrm = (dashId: string) => dashboards.find((d) => d.id === dashId)?.irm ?? 'IRM-20000';
  const entry = (author: ThreadEntry['author'], name: string, at: string, text: string): ThreadEntry => ({
    id: `t-${hash(name + at + text)}`,
    author,
    name,
    at: fmtIso(at),
    text,
  });
  let seq = 1040;
  const changes: IrmChange[] = [];
  const add = (
    rec: string,
    type: IrmChangeType,
    title: string,
    status: IrmChangeStatus,
    o: { pri?: IrmPriority; assignee?: string; deployer?: string; by?: string; for?: string; opened: number; since: number; summary?: string; retireOn?: string; replacedBy?: string },
  ) => {
    const id = `CHG-${seq++}`;
    const opened = addDaysIso(today, -o.opened);
    const statusSince = addDaysIso(today, -o.since);
    const by = o.by ?? 'u-pr';
    const owner = o.for ?? records.find((r) => r.number === rec)?.businessOwnerId ?? 'u-pr';
    const history = [entry('requester', nameOf(by), opened, `Requested: ${title}.`)];
    if (status !== 'pending-approval') history.push(entry('admin', nameOf(owner), addDaysIso(opened, 1), 'Approved.'));
    if (o.assignee) history.push(entry('system', 'IRM', addDaysIso(opened, 2), `Assigned to ${nameOf(o.assignee)}.`));
    if (status !== 'pending-approval' && status !== 'ready') history.push(entry('system', 'IRM', statusSince, `Moved to ${CHANGE_STATUS[status].label}.`));
    changes.push({
      id,
      record: rec,
      type,
      title,
      summary: o.summary ?? title,
      status,
      priority: o.pri ?? 'P3',
      assigneeId: o.assignee,
      deployerId: o.deployer,
      createdById: by,
      requestedForId: owner,
      opened,
      statusSince,
      closed: status === 'deployed' || status === 'rejected' || status === 'cancelled' ? statusSince : undefined,
      retireOn: o.retireOn,
      replacedBy: o.replacedBy,
      history,
    });
    return id;
  };

  // Business user (Kahrman) — requests in every state, and one waiting on their approval.
  add(byIrm('revenue-by-region'), 'modification', 'Add a region-by-segment drill to Revenue by Region', 'in-development', { by: 'u-km', assignee: 'u-jm', opened: 12, since: 6, pri: 'P2' });
  add(byIrm('pipeline-health'), 'break', 'Pipeline Health shows yesterday’s slipped deals twice', 'in-review', { by: 'u-km', assignee: 'u-dw', opened: 4, since: 1, pri: 'P1' });
  add('IRM-20655', 'new', 'Branch Traffic Daily — a daily view of branch footfall', 'pending-approval', { by: 'u-dw', for: 'u-km', opened: 2, since: 2, pri: 'P3' });
  add(byIrm('campaign-roi'), 'modification', 'Split Campaign ROI by paid and organic', 'pending-approval', { by: 'u-lg', for: 'u-km', opened: 5, since: 5, pri: 'P3' });
  add(byIrm('marketing-funnel'), 'modification', 'Rename funnel stages to the new CRM names', 'deployed', { by: 'u-km', assignee: 'u-so', deployer: 'u-cb', opened: 40, since: 18 });

  // Developer (Jordan Mount) — a working queue with ages, plus things he raised.
  add(byIrm('collections-performance'), 'modification', 'Add promise-kept rate to Collections Performance', 'in-development', { by: 'u-jl', assignee: 'u-jm', opened: 21, since: 17, pri: 'P2' });
  add('IRM-20641', 'new', 'Agency Placement Tracker', 'in-development', { by: 'u-jl', assignee: 'u-jm', opened: 30, since: 12, pri: 'P2', summary: 'Build the new report from the BRD: recovery and cost by outside agency, to decide where accounts are placed.' });
  add(byIrm('delivery-sla'), 'break', 'Delivery SLA carrier feed fails on weekends', 'ready', { by: 'u-jm', opened: 3, since: 2, pri: 'P1', summary: 'The carrier extract does not run on Saturdays and Sundays, so Monday shows two empty days.' });
  add(byIrm('servicing-handle-time'), 'modification', 'Show 90th-percentile handle time by channel', 'in-review', { by: 'u-mh', assignee: 'u-jm', opened: 15, since: 7, pri: 'P3' });
  add('IRM-20668', 'new', 'Mortgage Pipeline Aging', 'in-review', { by: 'u-pr', assignee: 'u-so', opened: 26, since: 3, pri: 'P2' });
  add(byIrm('nps-trends'), 'modification', 'Add verbatim theme filter to NPS Trends', 'ready', { by: 'u-jm', opened: 9, since: 8, pri: 'P4' });
  add(byIrm('servicing-quality'), 'modification', 'Calibration trend by reviewer', 'ready', { by: 'u-mh', opened: 6, since: 6, pri: 'P3' });
  add(byIrm('headcount-plan'), 'modification', 'Add contractor roles to Headcount Plan', 'on-hold', { by: 'u-dw', assignee: 'u-dw', opened: 33, since: 20, pri: 'P4' });

  // Production support (Chris) — the deployment queue, unassigned first.
  add(byIrm('support-backlog'), 'modification', 'Severity filter on Support Backlog', 'awaiting-deployment', { by: 'u-so', assignee: 'u-so', opened: 18, since: 4, pri: 'P3' });
  add(byIrm('servicing-sla'), 'break', 'Servicing SLA breach counts double on transfers', 'awaiting-deployment', { by: 'u-mh', assignee: 'u-jm', opened: 8, since: 1, pri: 'P1', summary: 'A transferred case is counted as a breach on both teams. The fix is ready and reviewed.' });
  add(byIrm('servicing-staffing'), 'modification', 'Add the Phoenix site to Staffing vs Forecast', 'awaiting-deployment', { by: 'u-mh', assignee: 'u-lg', deployer: 'u-cb', opened: 11, since: 6, pri: 'P2' });
  add(byIrm('servicing-queue-depth'), 'modification', 'Queue Depth by Hour — weekend staffing line', 'deployed', { by: 'u-mh', assignee: 'u-dw', deployer: 'u-cb', opened: 25, since: 9 });

  // Governance — the decommission already under way, and the work it approves.
  const legacyChange = legacyRec
    ? add(legacyRec.number, 'decommission', 'Retire the Legacy Servicing Overview', 'scheduled', {
        by: 'u-mh',
        opened: 20,
        since: 10,
        pri: 'P3',
        retireOn: legacyRec.retireOn,
        replacedBy: legacyRec.replacedBy,
        summary: 'Teams have moved to Servicing Overview. Retire the legacy dashboard after a two-week notice.',
      })
    : undefined;
  void legacyChange;
  add(byIrm('churn-risk'), 'modification', 'Add renewal-date banding to Churn Risk', 'rejected', { by: 'u-pr', opened: 45, since: 38 });
  add(byIrm('risk-exposure'), 'break', 'Risk Exposure watchlist omits new names', 'deployed', { by: 'u-jl', assignee: 'u-so', deployer: 'u-cb', opened: 60, since: 51, pri: 'P1' });
  // Developer (Jordan Mount) — a new report he built, now live; he has asked DartBoards to list it (#0417).
  add('IRM-20512', 'new', 'Originations Daily Volume', 'deployed', { by: 'u-pr', assignee: 'u-jm', deployer: 'u-cb', opened: 35, since: 6, pri: 'P2' });

  /* ── Incidents — an open break is a known issue on its DartBoards listing ── */
  const incidents: IrmIncident[] = [];
  for (const c of changes) {
    if (c.type !== 'break') continue;
    const done = c.status === 'deployed';
    incidents.push({
      id: `INC-${c.id.slice(4)}`,
      record: c.record,
      changeId: c.id,
      summary: c.title,
      opened: c.opened,
      resolved: done ? c.statusSince : undefined,
    });
  }

  /* ── Lineage: where each report's data comes from, and which reports feed others ── */
  const SYSTEM: Record<Dashboard['category'], string> = {
    Sales: 'Salesforce',
    Customer: 'Medallia',
    Operations: 'Genesys Cloud',
    Finance: 'Oracle GL',
    Risk: 'Experian feed',
  };
  for (const r of records) {
    const d = dashboards.find((x) => x.irm === r.number);
    const cat: Dashboard['category'] = d?.category ?? 'Operations';
    const slug = recordName(r).toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_|_$/g, '');
    r.sources = [
      { id: `${r.number}-sys`, name: SYSTEM[cat], kind: 'system', platform: SYSTEM[cat] },
      { id: `${r.number}-pipe`, name: `${slug.toLowerCase()}_daily`, kind: 'pipeline', platform: 'dbt' },
      { id: `${r.number}-tbl`, name: `${cat.toUpperCase()}_MART.${slug}`, kind: 'table', platform: 'Snowflake' },
    ];
  }
  const dep = (child: string, parents: string[]) => {
    const r = records.find((x) => x.number === byIrm(child));
    if (r) r.dependsOn = parents.map(byIrm).filter((n) => n !== r.number);
  };
  dep('revenue-by-region', ['pipeline-health']);
  dep('campaign-roi', ['marketing-funnel', 'revenue-by-region']);
  dep('servicing-overview', ['servicing-sla', 'servicing-handle-time', 'servicing-queue-depth']);

  /* ── Evidence: every attested control has the submission that attested it ── */
  const EVIDENCE: Record<IrmControlKind, (r: IrmRecord) => IrmEvidence> = {
    'access-review': (r) => ({ kind: 'file', label: `Access review export — ${r.accessGroup}.xlsx` }),
    'data-quality': (r) => ({ kind: 'link', label: 'Automated data-quality run', url: `https://dq.example.com/runs/${r.number.toLowerCase()}` }),
    'change-approval': () => ({ kind: 'link', label: 'Change board minutes', url: 'https://cab.example.com/minutes' }),
    recertification: () => ({ kind: 'file', label: 'Recertification sign-off.pdf' }),
  };
  const attestations: IrmAttestation[] = [];
  for (const r of records)
    for (const c of r.controlItems) {
      if (!c.lastAttested) continue;
      const auto = c.kind === 'data-quality';
      attestations.push({
        id: `ATT-${hash(c.id + c.lastAttested)}`,
        record: r.number,
        controlId: c.id,
        submittedById: auto ? 'irm' : r.businessOwnerId,
        submittedOn: c.lastAttested,
        evidence: [EVIDENCE[c.kind](r)],
        note: auto ? 'Passed every check.' : 'Reviewed and attached.',
        outcome: 'accepted',
        reviewerId: auto ? undefined : GOVERNANCE_ID,
        reviewedOn: auto ? undefined : addDaysIso(c.lastAttested, 1) > today ? c.lastAttested : addDaysIso(c.lastAttested, 1),
      });
    }
  // Two submissions waiting on the governance team.
  for (const [dashId, kind, note] of [
    ['campaign-roi', 'access-review', 'Quarterly access review done — two leavers removed.'],
    ['pipeline-health', 'change-approval', 'The break fix went through the change board on Tuesday.'],
  ] as const) {
    const r = records.find((x) => x.number === byIrm(dashId));
    const c = r?.controlItems.find((x) => x.kind === kind);
    if (!r || !c) continue;
    attestations.unshift({
      id: `ATT-${hash(c.id + 'pending')}`,
      record: r.number,
      controlId: c.id,
      submittedById: r.businessOwnerId,
      submittedOn: addDaysIso(today, -2),
      evidence: [EVIDENCE[kind](r), { kind: 'link', label: 'Ticket', url: 'https://servicedesk.example.com/RITM0042' }],
      note,
      outcome: 'pending',
    });
  }

  /* ── Audit: what the seed history implies, so a record's trail is never empty ── */
  const audit: IrmAuditEntry[] = [];
  const log = (e: Omit<IrmAuditEntry, 'id'>) => audit.push({ id: `AUD-${hash(JSON.stringify(e))}`, ...e });
  for (const c of changes) {
    // A break skips approval (its default workflow), so its trail starts at Ready.
    const first = c.type === 'break' ? 'Ready' : 'Pending approval';
    log({ at: c.opened, actorId: c.createdById, record: c.record, entity: 'change', entityId: c.id, action: 'Requested', field: 'status', to: first });
    if (CHANGE_STATUS[c.status].label !== first)
      log({ at: c.statusSince, actorId: c.assigneeId ?? c.requestedForId, record: c.record, entity: 'change', entityId: c.id, action: 'Moved', field: 'status', from: first, to: CHANGE_STATUS[c.status].label });
  }
  for (const a of attestations)
    if (a.outcome === 'accepted')
      log({ at: a.reviewedOn ?? a.submittedOn, actorId: a.reviewerId ?? 'irm', record: a.record, entity: 'control', entityId: a.controlId, action: 'Attested', field: 'last attested', to: fmtIso(a.submittedOn) });
  audit.sort((a, b) => (a.at < b.at ? 1 : -1));

  return {
    records,
    changes,
    incidents,
    events: [],
    attestations,
    notifications: [],
    audit,
    workflows: structuredClone(DEFAULT_WORKFLOWS),
    today,
  };
}

const NAMES: Record<string, string> = Object.fromEntries(Object.entries(IRM_PEOPLE_BY_NAME).map(([n, id]) => [id, n]));
NAMES['u-ar'] = 'Alex Rivera';
NAMES['u-np'] = 'Nina Patel';
NAMES['u-oh'] = 'Omar Haddad';
NAMES['u-cb'] = 'Chris Bauer';
const nameOf = (id: string) => NAMES[id] ?? id;

/* ── Month-over-month history (the dev manager's and governance's charts) ── */

/**
 * The six months before the current one, as IRM's reporting would hold them.
 * The current month is computed live from `changes`, so moving work on the board
 * moves the last bar.
 */
export const IRM_HISTORY: { month: string; opened: number; closed: number; byType: Record<IrmChangeType, number>; slaMet: number; avgDays: number }[] = [
  { month: '2026-04-01', opened: 31, closed: 27, byType: { new: 6, break: 9, modification: 14, decommission: 2 }, slaMet: 0.82, avgDays: 14 },
  { month: '2026-05-01', opened: 28, closed: 30, byType: { new: 5, break: 7, modification: 15, decommission: 3 }, slaMet: 0.85, avgDays: 13 },
  { month: '2026-06-01', opened: 35, closed: 29, byType: { new: 8, break: 11, modification: 13, decommission: 3 }, slaMet: 0.79, avgDays: 16 },
  { month: '2026-07-01', opened: 33, closed: 34, byType: { new: 7, break: 8, modification: 16, decommission: 2 }, slaMet: 0.83, avgDays: 15 },
  { month: '2026-08-01', opened: 38, closed: 35, byType: { new: 9, break: 10, modification: 17, decommission: 2 }, slaMet: 0.81, avgDays: 15 },
  { month: '2026-09-01', opened: 36, closed: 39, byType: { new: 6, break: 9, modification: 19, decommission: 2 }, slaMet: 0.86, avgDays: 12 },
];
