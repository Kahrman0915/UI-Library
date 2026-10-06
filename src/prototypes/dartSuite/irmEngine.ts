/* ── DART Suite prototype · IRM ↔ DartBoards ──────────────────────────────────
   The single integration point. IRM is the system of record; DartBoards
   consumes it. Two mechanisms, as a real integration would have:

   1. EVENTS. Every IRM action that a consumer cares about `emit`s an event.
      DartBoards reacts by re-projecting the affected listings, and the event
      records what changed — the Integrations page shows both. In production
      this is a webhook or a queue consumer.
   2. RECONCILE. `reconcile` re-projects EVERY listing from its record and
      advances anything the clock has passed (a retire date, a control due
      date). It runs on load and whenever the simulated clock moves. In
      production this is the nightly job that catches a missed event.

   Both go through `project`, which DERIVES a listing's IRM-owned fields
   (`retiring`, `retired`, `irmFlags`, the IRM side of `health`, and `lifecycle:
   archived` once retired) from the record. Derived, not patched: a listing can
   never disagree with IRM, whatever order events arrive in.

   Everything here mutates a draft (store.tsx `update`), so it composes inside
   one state change. */

import type { SuiteState } from './store';
import type { Dashboard, IrmChangeType, ThreadEntry } from './types';
import {
  APPROVER,
  CHANGE_STATUS,
  CONTROLS,
  addDaysIso,
  daysBetween,
  evergreenState,
  fmtIso,
  isAged,
  recordName,
  rollupControls,
  stagesFor,
} from './irm';
import { brdFor } from './irm';
import type {
  IrmAttestation,
  IrmAuditEntry,
  IrmChange,
  IrmChangeStatus,
  IrmEvent,
  IrmEventType,
  IrmEvidence,
  IrmNotification,
  IrmPriority,
  IrmRecord,
  IrmWorkflow,
} from './irm';
import { ME, PEOPLE } from './data';

const nameOf = (id: string) => (id === 'irm' ? 'IRM' : PEOPLE.find((p) => p.id === id)?.name ?? id);
/** The governance team — who reviews evidence and approves what the workflow sends them. */
export const GOVERNANCE_IDS = PEOPLE.filter((p) => p.irmRole === 'governance').map((p) => p.id);
let seq = 1100;
/** The next change id — taken BEFORE the update, so a screen can navigate to the change it just created. */
export const nextChangeId = () => `CHG-${seq++}`;
const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 8)}`;

const rec = (d: SuiteState, number: string) => d.irm.records.find((r) => r.number === number);
const listingsOf = (d: SuiteState, number: string) => d.dashboards.filter((x) => x.irm === number);
const listingIdFor = (d: SuiteState, number?: string) => (number ? d.dashboards.find((x) => x.irm === number && x.lifecycle !== 'archived')?.id : undefined);
const say = (d: SuiteState, author: ThreadEntry['author'], name: string, text: string): ThreadEntry => ({
  id: uid('t'),
  author,
  name,
  at: fmtIso(d.irm.today),
  text,
});

/* ── Audit and notifications ────────────────────────────────────────────────── */

/** Every IRM change of state writes one line: who, when, what, from what to what. */
export function audit(d: SuiteState, e: Omit<IrmAuditEntry, 'id' | 'at'>) {
  d.irm.audit.unshift({ id: uid('AUD'), at: d.irm.today, ...e });
}

/** Tell a person something. The key stops the same reminder going out twice for one occurrence. */
export function notify(d: SuiteState, n: Omit<IrmNotification, 'id' | 'at' | 'read'>) {
  if (d.irm.notifications.some((x) => x.key === n.key && x.personId === n.personId)) return;
  d.irm.notifications.unshift({ id: uid('N'), at: d.irm.today, read: false, ...n });
}

/** Who has to approve this change now, under its type's workflow. */
export function approversOf(c: IrmChange, workflows: Record<string, IrmWorkflow>): string[] {
  const a = workflows[c.type].approver;
  if (c.status !== 'pending-approval' || a === 'none') return [];
  if (a === 'business-owner') return [c.requestedForId];
  if (a === 'governance') return GOVERNANCE_IDS;
  return c.ownerApproved ? GOVERNANCE_IDS : [c.requestedForId];
}

/** The reminders the clock produces. Run by reconcile; safe to run any number of times. */
function remind(d: SuiteState) {
  const today = d.irm.today;
  for (const r of d.irm.records) {
    if (r.lifecycle !== 'production' && r.lifecycle !== 'retiring') continue;
    const ever = evergreenState(r, today);
    if (ever !== 'current')
      notify(d, {
        key: `evergreen:${r.number}:${r.evergreen.due}:${ever}`,
        personId: r.businessOwnerId,
        kind: 'evergreen',
        title: ever === 'past-due' ? `${recordName(r)} is past its recertification` : `Recertify ${recordName(r)} by ${fmtIso(r.evergreen.due)}`,
        body: ever === 'past-due' ? 'It is past due. Governance can see it on their list.' : 'Confirm the report is still needed and still right.',
        route: { page: 'irm-record', number: r.number },
      });
    for (const c of r.controlItems) {
      if (!c.lastAttested || daysBetween(today, c.due) > 7 || c.kind === 'data-quality') continue;
      notify(d, {
        key: `control:${c.id}:${c.due}`,
        personId: r.businessOwnerId,
        kind: 'control-due',
        title: c.due < today ? `${c.name} on ${recordName(r)} is overdue` : `${c.name} on ${recordName(r)} is due ${fmtIso(c.due)}`,
        body: 'Attach the evidence and submit it for review.',
        route: { page: 'irm-record', number: r.number },
      });
    }
    // The people who USE the report hear about a retirement, not just its owner: anyone with it on a space.
    if (r.lifecycle === 'retiring' && r.retireOn) {
      const listing = d.dashboards.find((x) => x.irm === r.number);
      // Everyone who has it on a space — the space's owner and the people it is shared with.
      const users = listing
        ? d.spaces.filter((sp) => sp.items.some((i) => i.dashboardId === listing.id)).flatMap((sp) => [sp.ownerId ?? ME.id, ...(sp.sharedWith ?? [])])
        : [];
      const soon = daysBetween(today, r.retireOn) <= 7;
      for (const person of new Set([r.businessOwnerId, ...users]))
        notify(d, {
          key: `retiring:${r.number}:${r.retireOn}:${soon ? 'soon' : 'scheduled'}`,
          personId: person,
          kind: 'retiring',
          title: `${listing?.name ?? recordName(r)} retires ${soon ? 'in ' + daysBetween(today, r.retireOn) + ' days' : 'on ' + fmtIso(r.retireOn)}`,
          body: r.replacedBy ? `Use ${recordName(d.irm.records.find((x) => x.number === r.replacedBy) ?? r)} instead.` : 'It will be archived in DartBoards on that date.',
          route: listing ? { page: 'dashboard', id: listing.id } : { page: 'irm-record', number: r.number },
        });
    }
  }
  // Evidence waiting on review tells the governance team (same key as on submit).
  for (const a of d.irm.attestations) {
    if (a.outcome !== 'pending') continue;
    const r = rec(d, a.record);
    const ctl = r?.controlItems.find((c) => c.id === a.controlId);
    if (!r || !ctl) continue;
    for (const person of GOVERNANCE_IDS.filter((p) => p !== a.submittedById))
      notify(d, { key: `review:${a.id}`, personId: person, kind: 'attestation-review', title: `Review evidence: ${ctl.name}`, body: `${recordName(r)} — submitted by ${nameOf(a.submittedById)}.`, route: { page: 'irm-record', number: r.number } });
  }
  // Anything waiting on someone's approval tells them (same key as when it was filed, so never twice).
  for (const c of d.irm.changes)
    for (const person of approversOf(c, d.irm.workflows))
      notify(d, { key: `approval:${c.id}:${c.ownerApproved ? 1 : 0}`, personId: person, kind: 'approval', title: `Approve ${c.id}`, body: c.title, route: { page: 'irm-change', id: c.id } });
  for (const c of d.irm.changes) {
    if (!CHANGE_STATUS[c.status].active || !isAged(c, today, d.irm.workflows)) continue;
    const who = c.status === 'pending-approval' ? approversOf(c, d.irm.workflows) : c.status === 'awaiting-deployment' ? [c.deployerId ?? 'u-cb'] : c.assigneeId ? [c.assigneeId] : ['u-ar'];
    for (const person of who)
      notify(d, {
        key: `aged:${c.id}:${c.status}:${c.statusSince}`,
        personId: person,
        kind: 'aged',
        title: `${c.id} is past its SLA in ${CHANGE_STATUS[c.status].label.toLowerCase()}`,
        body: c.title,
        route: { page: 'irm-change', id: c.id },
      });
  }
}

/* ── Projection: record → listing ───────────────────────────────────────────── */

/** Re-derive one listing's IRM-owned fields from its record. Returns what changed, in words. */
function projectListing(d: SuiteState, dash: Dashboard, r: IrmRecord): string[] {
  const was = { retiring: !!dash.retiring, retired: !!dash.retired, incident: dash.irmFlags?.incident, overdue: !!dash.irmFlags?.controlsOverdue };
  const before = JSON.stringify([dash.retiring, dash.retired, dash.irmFlags, dash.health, dash.lifecycle]);
  const incident = d.irm.incidents.find((i) => i.record === r.number && !i.resolved);
  const replacement = listingIdFor(d, r.replacedBy);
  const retired = r.lifecycle === 'retired';

  dash.retiring = r.lifecycle === 'retiring' && r.retireOn ? { on: r.retireOn, replacedBy: replacement } : undefined;
  if (retired) {
    dash.retired = { on: r.retireOn ?? d.irm.today, replacedBy: replacement };
    dash.lifecycle = 'archived';
  } else dash.retired = undefined;
  // A retired report has nothing left to warn readers about.
  const flags = retired ? {} : { controlsOverdue: r.controls === 'overdue' || undefined, incident: incident?.summary };
  dash.irmFlags = flags.controlsOverdue || flags.incident ? flags : undefined;
  // Health is IRM's to say: retiring or retired → decommissioning; an open break → unreachable.
  // A listing DartBoards took down itself (a removal) keeps its own health — the report is still live in IRM.
  const delistedHere = dash.lifecycle === 'archived' && !retired;
  if (!delistedHere) dash.health = r.lifecycle === 'retiring' || retired ? 'decommissioning' : incident ? 'unreachable' : 'ok';

  if (JSON.stringify([dash.retiring, dash.retired, dash.irmFlags, dash.health, dash.lifecycle]) === before) return [];
  // Say what CHANGED, not what is true — the log is read as a list of things that happened.
  const out: string[] = [];
  if (dash.retiring && !was.retiring) out.push(`“${dash.name}” marked retiring on ${fmtIso(dash.retiring.on)} and hidden from Browse`);
  if (!dash.retiring && was.retiring && !dash.retired) out.push(`“${dash.name}” no longer retiring; back in Browse`);
  if (dash.retired && !was.retired) out.push(`“${dash.name}” archived; spaces show a retired placeholder${replacement ? ' pointing to its replacement' : ''}`);
  const inc = dash.irmFlags?.incident;
  if (inc && inc !== was.incident) out.push(`Known-issue notice on “${dash.name}”`);
  if (!inc && was.incident && !dash.retired) out.push(`Known-issue notice cleared on “${dash.name}”`);
  const od = !!dash.irmFlags?.controlsOverdue;
  if (od && !was.overdue) out.push(`Controls-overdue notice on “${dash.name}”`);
  if (!od && was.overdue && !dash.retired) out.push(`Controls notice cleared on “${dash.name}”`);
  return out.length ? out : [`“${dash.name}” updated`];
}

/** Project every listing of one record. */
export function project(d: SuiteState, number: string): string[] {
  const r = rec(d, number);
  if (!r) return [];
  return listingsOf(d, number).flatMap((dash) => projectListing(d, dash, r));
}

/* ── Events ─────────────────────────────────────────────────────────────────── */

/** Append an IRM event, let DartBoards react, and record what it did. */
export function emit(d: SuiteState, type: IrmEventType, number: string, detail: string): IrmEvent {
  const effects = project(d, number);
  const ev: IrmEvent = { id: uid('ev'), type, record: number, at: d.irm.today, detail, effects };
  d.irm.events.unshift(ev);
  for (const e of effects) d.activity.unshift({ id: uid('a'), at: `${fmtIso(d.irm.today)} now`, who: 'IRM', action: 'updated', target: e, product: 'DARTBoards' });
  return ev;
}

/* ── Reconcile: the clock, and the safety net ───────────────────────────────── */

export function reconcile(d: SuiteState, quiet = false) {
  const today = d.irm.today;
  for (const r of d.irm.records) {
    // A retire date the clock has passed retires the report.
    if (r.lifecycle === 'retiring' && r.retireOn && r.retireOn <= today) {
      r.lifecycle = 'retired';
      for (const c of d.irm.changes) {
        if (c.record === r.number && c.type === 'decommission' && c.status === 'scheduled') {
          c.status = 'deployed';
          c.statusSince = today;
          c.closed = today;
          c.history.push(say(d, 'system', 'IRM', 'Retired on schedule.'));
        }
      }
      audit(d, { actorId: 'irm', record: r.number, entity: 'record', entityId: r.number, action: 'Retired on schedule', field: 'lifecycle', from: 'Retiring', to: 'Retired' });
      if (!quiet) emit(d, 'retired', r.number, `Retired on schedule${r.replacedBy ? `, replaced by ${r.replacedBy}` : ''}.`);
    }
    // A retired report is out of the control regime: nothing to attest, nothing to flag.
    if (r.lifecycle === 'retired') continue;
    // Data-quality checks are automated: they run with every refresh and attest themselves, unless the
    // report has an open break — a failing report cannot certify its own figures.
    const broken = d.irm.incidents.some((i) => i.record === r.number && !i.resolved);
    // It runs when it falls due, not on every reconcile, so its history is one line a month.
    if (!quiet && !broken && (r.lifecycle === 'production' || r.lifecycle === 'retiring'))
      for (const c of r.controlItems)
        if (c.kind === 'data-quality' && c.lastAttested && daysBetween(today, c.due) <= 1) {
          const from = c.lastAttested;
          c.lastAttested = today;
          c.due = addDaysIso(today, c.cadenceDays);
          d.irm.attestations.unshift({
            id: uid('ATT'),
            record: r.number,
            controlId: c.id,
            submittedById: 'irm',
            submittedOn: today,
            evidence: [{ kind: 'link', label: 'Automated data-quality run', url: `https://dq.example.com/runs/${r.number.toLowerCase()}` }],
            note: 'Passed every check.',
            outcome: 'accepted',
          });
          audit(d, { actorId: 'irm', record: r.number, entity: 'control', entityId: c.id, action: 'Automated check passed', field: 'last attested', from: fmtIso(from), to: fmtIso(today) });
        }
    // A control the clock has passed turns the roll-up overdue; an attestation brings it back.
    const was = r.controls;
    r.controls = rollupControls(r, today);
    if (was !== r.controls) audit(d, { actorId: 'irm', record: r.number, entity: 'record', entityId: r.number, action: 'Controls re-evaluated', field: 'controls', from: CONTROLS[was].short, to: CONTROLS[r.controls].short });
    if (!quiet && was !== r.controls && (was === 'overdue' || r.controls === 'overdue')) {
      emit(d, r.controls === 'overdue' ? 'controls-overdue' : 'controls-restored', r.number, r.controls === 'overdue' ? 'A control passed its due date without an attestation.' : 'Every control is attested.');
    }
  }
  // The safety net: every listing re-derived from its record, whatever events were missed.
  for (const r of d.irm.records) project(d, r.number);
  remind(d);
}

/* ── IRM actions (draft mutators) ───────────────────────────────────────────── */

const setStatus = (d: SuiteState, c: IrmChange, status: IrmChangeStatus, byId: string, note?: string) => {
  audit(d, { actorId: byId, record: c.record, entity: 'change', entityId: c.id, action: 'Moved', field: 'status', from: CHANGE_STATUS[c.status].label, to: CHANGE_STATUS[status].label });
  c.status = status;
  c.statusSince = d.irm.today;
  if (!CHANGE_STATUS[status].active) c.closed = d.irm.today;
  c.history.push(say(d, byId === 'irm' ? 'system' : 'admin', byId === 'irm' ? 'IRM' : nameOf(byId), note ?? `Moved to ${CHANGE_STATUS[status].label}.`));
};

export type NewChangeInput = {
  id?: string;
  type: IrmChangeType;
  /** Existing record; absent for `new`, which creates one at intake. */
  record?: string;
  newReportName?: string;
  title: string;
  summary: string;
  priority: IrmPriority;
  createdById: string;
  requestedForId: string;
  retireOn?: string;
  replacedBy?: string;
};

export const irmOps = {
  createChange(d: SuiteState, input: NewChangeInput): IrmChange {
    let number = input.record;
    if (input.type === 'new' || !number) {
      const max = Math.max(...d.irm.records.map((r) => Number(r.number.slice(4))));
      number = `IRM-${max + 1}`;
      const owner = nameOf(input.requestedForId);
      d.irm.records.push({
        number,
        name: `${number} ${input.newReportName ?? input.title} v1`,
        description: input.summary,
        developer: '—',
        developerId: '',
        businessOwner: owner,
        businessOwnerId: input.requestedForId,
        source: 'Tableau',
        accessGroup: 'TBD',
        department: 'To be agreed',
        purpose: input.summary,
        brdLocation: brdFor(number, 'Intake'),
        controls: 'pending',
        lastReviewed: '—',
        lifecycle: 'intake',
        tier: 3,
        classification: 'Internal',
        refresh: 'To be agreed',
        version: 1,
        controlItems: [
          { id: `${number}-access-review`, name: 'Access review', kind: 'access-review', cadenceDays: 180, due: addDaysIso(d.irm.today, 30), ownerId: 'u-np' },
          { id: `${number}-data-quality`, name: 'Data quality checks', kind: 'data-quality', cadenceDays: 30, due: addDaysIso(d.irm.today, 30), ownerId: 'u-np' },
        ],
        evergreen: { cadence: 'Annual', lastCertified: d.irm.today, due: addDaysIso(d.irm.today, 365) },
        // Lineage is filled in as the developer builds it.
        sources: [],
        dependsOn: [],
      });
    }
    const c: IrmChange = {
      id: input.id ?? nextChangeId(),
      record: number,
      type: input.type,
      title: input.title,
      summary: input.summary,
      // The type's workflow decides: no approver → straight to its first working stage.
      status: d.irm.workflows[input.type].approver === 'none' ? stagesFor(input.type, d.irm.workflows)[0] : 'pending-approval',
      priority: input.priority,
      createdById: input.createdById,
      requestedForId: input.requestedForId,
      opened: d.irm.today,
      statusSince: d.irm.today,
      retireOn: input.retireOn,
      replacedBy: input.replacedBy,
      history: [say(d, 'requester', nameOf(input.createdById), `Requested: ${input.title}.`)],
    };
    d.irm.changes.unshift(c);
    audit(d, { actorId: input.createdById, record: number, entity: 'change', entityId: c.id, action: 'Requested', field: 'status', to: CHANGE_STATUS[c.status].label });
    for (const person of approversOf(c, d.irm.workflows))
      notify(d, { key: `approval:${c.id}:0`, personId: person, kind: 'approval', title: `Approve ${c.id}`, body: c.title, route: { page: 'irm-change', id: c.id } });
    // A break means something in production is wrong NOW — the listing says so before anyone triages it.
    if (input.type === 'break') {
      d.irm.incidents.unshift({ id: `INC-${c.id.slice(4)}`, record: number, changeId: c.id, summary: input.title, opened: d.irm.today });
      emit(d, 'incident-opened', number, input.title);
    }
    return c;
  },

  /** Approve as `byId`. Who may approve, and how many approvals it takes, is the type's workflow. */
  approve(d: SuiteState, id: string, byId: string) {
    const c = d.irm.changes.find((x) => x.id === id);
    if (!c || c.status !== 'pending-approval' || !approversOf(c, d.irm.workflows).includes(byId)) return;
    const wf = d.irm.workflows[c.type];
    // Two-step: the owner's approval hands it to governance rather than starting work.
    if (wf.approver === 'both' && !c.ownerApproved) {
      c.ownerApproved = true;
      c.history.push(say(d, 'admin', nameOf(byId), 'Approved by the business owner. Waiting on the governance team.'));
      audit(d, { actorId: byId, record: c.record, entity: 'change', entityId: c.id, action: 'Approved (business owner)', field: 'approval', from: 'Business owner', to: 'Governance team' });
      for (const person of GOVERNANCE_IDS)
        notify(d, { key: `approval:${c.id}:1`, personId: person, kind: 'approval', title: `Approve ${c.id}`, body: `${c.title} — approved by its business owner.`, route: { page: 'irm-change', id: c.id } });
      return;
    }
    if (c.type === 'decommission') {
      const r = rec(d, c.record);
      if (!r || !c.retireOn) return;
      setStatus(d, c, 'scheduled', byId, `Approved. Retires on ${fmtIso(c.retireOn)}.`);
      audit(d, { actorId: byId, record: r.number, entity: 'record', entityId: r.number, action: 'Retirement scheduled', field: 'lifecycle', from: 'Production', to: `Retiring ${fmtIso(c.retireOn)}` });
      r.lifecycle = 'retiring';
      r.retireOn = c.retireOn;
      r.replacedBy = c.replacedBy;
      emit(d, 'decommission-scheduled', r.number, `Retires on ${fmtIso(c.retireOn)}${c.replacedBy ? `, replaced by ${c.replacedBy}` : ''}.`);
      remind(d);
      return;
    }
    const next = stagesFor(c.type, d.irm.workflows)[0];
    setStatus(d, c, next, byId, `Approved. ${CHANGE_STATUS[next].label}.`);
    const r = rec(d, c.record);
    if (r && c.type === 'new' && r.lifecycle === 'intake') r.lifecycle = 'in-development';
  },

  reject(d: SuiteState, id: string, byId: string, reason: string) {
    const c = d.irm.changes.find((x) => x.id === id);
    if (!c) return;
    setStatus(d, c, 'rejected', byId, reason || 'Rejected.');
    // A rejected break leaves no known issue behind.
    for (const i of d.irm.incidents) if (i.changeId === c.id && !i.resolved) i.resolved = d.irm.today;
    project(d, c.record);
  },

  assign(d: SuiteState, id: string, assigneeId: string | undefined, byId: string) {
    const c = d.irm.changes.find((x) => x.id === id);
    if (!c) return;
    audit(d, { actorId: byId, record: c.record, entity: 'change', entityId: c.id, action: assigneeId ? 'Assigned' : 'Unassigned', field: 'assignee', from: c.assigneeId ? nameOf(c.assigneeId) : 'Unassigned', to: assigneeId ? nameOf(assigneeId) : 'Unassigned' });
    c.assigneeId = assigneeId;
    c.history.push(say(d, 'system', 'IRM', assigneeId ? `Assigned to ${nameOf(assigneeId)} by ${nameOf(byId)}.` : `Unassigned by ${nameOf(byId)}.`));
  },

  move(d: SuiteState, id: string, status: IrmChangeStatus, byId: string) {
    const c = d.irm.changes.find((x) => x.id === id);
    if (!c || c.status === status) return;
    // A stage the type's workflow does not use is not a place a change can go.
    if (status !== 'on-hold' && !stagesFor(c.type, d.irm.workflows).includes(status)) return;
    setStatus(d, c, status, byId);
    const r = rec(d, c.record);
    if (r && c.type === 'new') {
      if (status === 'in-development') r.lifecycle = 'in-development';
      if (status === 'in-review' || status === 'awaiting-deployment') r.lifecycle = 'in-review';
    }
  },

  setPriority(d: SuiteState, id: string, priority: IrmPriority, byId: string) {
    const c = d.irm.changes.find((x) => x.id === id);
    if (!c) return;
    audit(d, { actorId: byId, record: c.record, entity: 'change', entityId: c.id, action: 'Reprioritised', field: 'priority', from: c.priority, to: priority });
    c.priority = priority;
    c.history.push(say(d, 'system', 'IRM', `Priority set to ${priority} by ${nameOf(byId)}.`));
  },

  /** Production support takes the deployment. */
  takeDeployment(d: SuiteState, id: string, byId: string) {
    const c = d.irm.changes.find((x) => x.id === id);
    if (!c) return;
    audit(d, { actorId: byId, record: c.record, entity: 'change', entityId: c.id, action: 'Took the deployment', field: 'deployer', from: 'Unassigned', to: nameOf(byId) });
    c.deployerId = byId;
    c.history.push(say(d, 'system', 'IRM', `${nameOf(byId)} took the deployment.`));
  },

  /** Deploying is where a change takes effect — and where DartBoards hears about it. */
  deploy(d: SuiteState, id: string, byId: string) {
    const c = d.irm.changes.find((x) => x.id === id);
    const r = c && rec(d, c.record);
    if (!c || !r) return;
    setStatus(d, c, 'deployed', byId, `Deployed by ${nameOf(byId)}.`);
    if (c.type === 'new') {
      // The step people forget: a finished report is not in DartBoards until someone lists it.
      for (const person of new Set([c.assigneeId, r.developerId, c.createdById].filter((x): x is string => !!x)))
        notify(d, {
          key: `list:${r.number}`,
          personId: person,
          kind: 'ready-to-list',
          app: 'DartBoards',
          title: `${recordName(r)} is in production — list it in DartBoards`,
          body: 'Nobody can find it until it is listed. The request form is filled in from IRM.',
          route: { page: 'request-form', kind: 'dashboard', mode: 'add', record: r.number },
        });
      audit(d, { actorId: byId, record: r.number, entity: 'record', entityId: r.number, action: 'Went to production', field: 'lifecycle', from: 'In review', to: 'Production' });
      r.lifecycle = 'production';
      emit(d, 'record-published', r.number, `${r.name} is in production and can be listed in DartBoards.`);
    } else if (c.type === 'break') {
      for (const i of d.irm.incidents) if (i.record === r.number && !i.resolved) i.resolved = d.irm.today;
      emit(d, 'incident-resolved', r.number, `Fixed by ${c.id}.`);
    } else if (c.type === 'modification') {
      audit(d, { actorId: byId, record: r.number, entity: 'record', entityId: r.number, action: `Released ${c.id}`, field: 'version', from: `v${r.version}`, to: `v${r.version + 1}` });
      r.version += 1;
      r.name = r.name.replace(/v\d+$/, `v${r.version}`);
      for (const dash of listingsOf(d, r.number)) dash.updatedAt = fmtIso(d.irm.today);
      emit(d, 'release-deployed', r.number, `v${r.version} released: ${c.title}.`);
    }
  },

  rollback(d: SuiteState, id: string, byId: string) {
    const c = d.irm.changes.find((x) => x.id === id);
    if (c) setStatus(d, c, 'in-review', byId, `Rolled back by ${nameOf(byId)} — back to review.`);
  },

  cancelDecommission(d: SuiteState, id: string, byId: string) {
    const c = d.irm.changes.find((x) => x.id === id);
    const r = c && rec(d, c.record);
    if (!c || !r || c.status !== 'scheduled') return;
    setStatus(d, c, 'cancelled', byId, `Retirement cancelled by ${nameOf(byId)}.`);
    audit(d, { actorId: byId, record: r.number, entity: 'record', entityId: r.number, action: 'Retirement cancelled', field: 'lifecycle', from: 'Retiring', to: 'Production' });
    r.lifecycle = 'production';
    r.retireOn = undefined;
    r.replacedBy = undefined;
    emit(d, 'decommission-cancelled', r.number, 'The report stays in production.');
  },

  /** Governance: retire now, without waiting for the date. */
  retireNow(d: SuiteState, number: string, byId: string) {
    const r = rec(d, number);
    if (!r || (r.lifecycle !== 'retiring' && r.lifecycle !== 'production')) return;
    audit(d, { actorId: byId, record: r.number, entity: 'record', entityId: r.number, action: 'Retired early', field: 'retire on', from: r.retireOn ? fmtIso(r.retireOn) : '—', to: fmtIso(d.irm.today) });
    r.retireOn = d.irm.today;
    r.lifecycle = 'retiring';
    for (const c of d.irm.changes) if (c.record === number && c.status === 'scheduled') c.retireOn = d.irm.today;
    reconcile(d);
  },

  /** Submit evidence for a control. It counts once someone ELSE accepts it. */
  submitAttestation(d: SuiteState, number: string, controlId: string, byId: string, evidence: IrmEvidence[], note: string) {
    const r = rec(d, number);
    const ctl = r?.controlItems.find((c) => c.id === controlId);
    if (!r || !ctl || !evidence.length) return;
    const a: IrmAttestation = { id: uid('ATT'), record: number, controlId, submittedById: byId, submittedOn: d.irm.today, evidence, note, outcome: 'pending' };
    d.irm.attestations.unshift(a);
    audit(d, { actorId: byId, record: number, entity: 'control', entityId: controlId, action: 'Evidence submitted', field: 'evidence', to: evidence.map((e) => e.label).join(', ') });
    for (const person of GOVERNANCE_IDS.filter((p) => p !== byId))
      notify(d, { key: `review:${a.id}`, personId: person, kind: 'attestation-review', title: `Review evidence: ${ctl.name}`, body: `${recordName(r)} — submitted by ${nameOf(byId)}.`, route: { page: 'irm-record', number } });
  },

  /** Accept or reject a submission. The submitter can never review their own. */
  reviewAttestation(d: SuiteState, attestationId: string, byId: string, outcome: 'accepted' | 'rejected', reviewNote: string) {
    const a = d.irm.attestations.find((x) => x.id === attestationId);
    const r = a && rec(d, a.record);
    const ctl = r?.controlItems.find((c) => c.id === a?.controlId);
    if (!a || !r || !ctl || a.outcome !== 'pending' || a.submittedById === byId) return;
    a.outcome = outcome;
    a.reviewerId = byId;
    a.reviewedOn = d.irm.today;
    a.reviewNote = reviewNote;
    if (outcome === 'accepted') {
      audit(d, { actorId: byId, record: r.number, entity: 'control', entityId: ctl.id, action: 'Evidence accepted', field: 'last attested', from: ctl.lastAttested ? fmtIso(ctl.lastAttested) : 'Never', to: fmtIso(a.submittedOn) });
      ctl.lastAttested = a.submittedOn;
      ctl.due = addDaysIso(a.submittedOn, ctl.cadenceDays);
      r.lastReviewed = fmtIso(a.submittedOn);
    } else {
      audit(d, { actorId: byId, record: r.number, entity: 'control', entityId: ctl.id, action: 'Evidence rejected', field: 'evidence', from: 'In review', to: `Rejected: ${reviewNote || 'no reason given'}` });
    }
    if (a.submittedById !== 'irm')
      notify(d, {
        key: `reviewed:${a.id}`,
        personId: a.submittedById,
        kind: 'attestation-reviewed',
        title: `${ctl.name} evidence ${outcome}`,
        body: outcome === 'accepted' ? `${recordName(r)} is attested until ${fmtIso(ctl.due)}.` : `${recordName(r)}: ${reviewNote || 'see the reviewer’s note'}.`,
        route: { page: 'irm-record', number: r.number },
      });
    reconcile(d);
  },

  /** Governance edits a type's workflow. Every field that moved is one audit line. */
  updateWorkflow(d: SuiteState, next: IrmWorkflow, byId: string) {
    const prev = d.irm.workflows[next.type];
    const line = (field: string, from: string, to: string) =>
      from !== to && audit(d, { actorId: byId, entity: 'workflow', entityId: next.type, action: 'Workflow changed', field, from, to });
    line('approver', APPROVER[prev.approver].label, APPROVER[next.approver].label);
    line('approval SLA', `${prev.approvalSlaDays} days`, `${next.approvalSlaDays} days`);
    if (next.noticeDays !== undefined) line('notice period', `${prev.noticeDays} days`, `${next.noticeDays} days`);
    for (const st of next.stages) {
      const was = prev.stages.find((x) => x.status === st.status);
      if (!was) continue;
      line(`${CHANGE_STATUS[st.status].label} stage`, was.enabled ? 'Used' : 'Skipped', st.enabled ? 'Used' : 'Skipped');
      if (st.slaDays !== undefined) line(`${CHANGE_STATUS[st.status].label} SLA`, `${was.slaDays} days`, `${st.slaDays} days`);
    }
    d.irm.workflows[next.type] = next;
    remind(d);
  },

  markRead(d: SuiteState, ids: string[]) {
    for (const n of d.irm.notifications) if (ids.includes(n.id)) n.read = true;
  },

  /** The business owner recertifies the report (the "evergreen"). */
  certify(d: SuiteState, number: string, byId: string) {
    const r = rec(d, number);
    if (!r) return;
    const months = r.evergreen.cadence === 'Annual' ? 365 : r.evergreen.cadence === 'Semi-annual' ? 182 : 91;
    audit(d, { actorId: byId, record: r.number, entity: 'record', entityId: r.number, action: 'Recertified', field: 'evergreen due', from: fmtIso(r.evergreen.due), to: fmtIso(addDaysIso(d.irm.today, months)) });
    r.evergreen = { ...r.evergreen, lastCertified: d.irm.today, due: addDaysIso(d.irm.today, months) };
  },

  flag(d: SuiteState, number: string, reason: string, byId: string) {
    const r = rec(d, number);
    if (!r) return;
    audit(d, { actorId: byId, record: number, entity: 'record', entityId: number, action: 'Flagged for review', field: 'flag', from: 'None', to: reason });
    r.flagged = { reason, byId, on: d.irm.today };
  },
  clearFlag(d: SuiteState, number: string, byId: string) {
    const r = rec(d, number);
    if (!r?.flagged) return;
    audit(d, { actorId: byId, record: number, entity: 'record', entityId: number, action: 'Flag cleared', field: 'flag', from: r.flagged.reason, to: 'None' });
    r.flagged = undefined;
  },

  /* ── Simulate (a prototype tool, visible to every role) ── */
  advanceClock(d: SuiteState, days: number) {
    d.irm.today = addDaysIso(d.irm.today, days);
    reconcile(d);
  },
  simulateOverdue(d: SuiteState, number: string) {
    const r = rec(d, number);
    if (!r) return;
    const ctl = r.controlItems[0];
    audit(d, { actorId: 'irm', record: number, entity: 'control', entityId: ctl.id, action: 'Simulated: control lapsed', field: 'due', from: fmtIso(ctl.due), to: fmtIso(addDaysIso(d.irm.today, -1)) });
    ctl.due = addDaysIso(d.irm.today, -1);
    reconcile(d);
  },
  simulateIncident(d: SuiteState, number: string, summary: string) {
    d.irm.incidents.unshift({ id: uid('INC'), record: number, summary, opened: d.irm.today });
    emit(d, 'incident-opened', number, summary);
  },
};

/** A record's DartBoards listings, for the record page's "DartBoards listings" tab. */
export const listingsFor = (dashboards: Dashboard[], number: string) => dashboards.filter((x) => x.irm === number);
