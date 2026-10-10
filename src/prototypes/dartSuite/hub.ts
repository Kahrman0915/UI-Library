/* ── DART Suite prototype · DART Central as the hub ───────────────────────────
   DART Central is where a person talks to every application under it; each
   application is where its work actually happens. So a person never has to
   know which system a request lives in: requests are named by what they are
   ABOUT and say who HANDLES them, and "what is waiting on me" is one list
   across all of them. This file is that vocabulary and that list. */

import { CHANGE_STATUS, CHANGE_TYPE, addDaysIso, evergreenState, fmtIso, isAged, recordName } from './irm';
import type { IrmChange } from './irm';
import { GOVERNANCE_IDS, approversOf } from './irmEngine';
import { PEOPLE } from './data';
import { adminOf, typeLabel } from './store';
import type { SuiteState } from './store';
import type { Request, Route } from './types';

/** Who answers a request — the line every request card and chooser option carries. */
export const HANDLER = {
  irm: 'Handled in IRM by the report’s owner and developers',
  boards: 'Handled by DartBoards admins',
  central: 'Handled by the DART Central team',
} as const;
export type Handler = keyof typeof HANDLER;

/**
 * Who handles a DART Central request: its product's admins. Read from the product, not the type — a banner
 * on DartBoards (#0416) is the DartBoards admins', though only dashboard requests used to say so. Aiden's
 * requests have no application of their own here, so they read as DART Central's.
 */
export const requestHandler = (r: Request): Handler => (r.product === 'DARTBoards' ? 'boards' : 'central');

export const APP_NAME: Record<Handler, string> = { irm: 'IRM', boards: 'DartBoards', central: 'DART Central' };

/** IRM change requests this person raised or asked for — they belong on "My Requests" too. */
export const myIrmChanges = (state: SuiteState, personId: string): IrmChange[] =>
  state.irm.changes.filter((c) => c.createdById === personId);

/** An IRM change on the requester's terms: the same four groups My Requests uses. */
export const irmGroup = (c: IrmChange): 'reply' | 'review' | 'active' | 'done' =>
  !CHANGE_STATUS[c.status].active ? 'done' : c.status === 'pending-approval' ? 'review' : 'active';

export const irmChangeLabel = (c: IrmChange) =>
  CHANGE_TYPE[c.type].label;

/** What kind of thing is waiting — Home acts on it in place by kind, without leaving DART Central. */
export type WaitingKind = 'reply' | 'triage' | 'approve' | 'review' | 'certify' | 'attest' | 'retiring' | 'start' | 'assign' | 'take' | 'deploy';

export type WaitingItem = {
  key: string;
  kind: WaitingKind;
  /** What it acts on: a request or change id, an IRM number, an attestation id, a control id. */
  ref: string;
  /** For `attest`: the record the control belongs to. */
  record?: string;
  title: string;
  detail: string;
  app: Handler;
  /** What the person has to do, as a verb. */
  action: string;
  route: Route;
  /** Why it cannot wait, in two words — shown as a badge, and it sorts the item first. */
  urgent?: string;
};

/**
 * Everything waiting on one person, across DART Central, DartBoards and IRM —
 * the hub's "Waiting on you". Computed live, so it can never disagree with the
 * screens it points at.
 */
export function waitingOn(state: SuiteState, personId: string): WaitingItem[] {
  const today = state.irm.today;
  const out: WaitingItem[] = [];

  // DART Central / DartBoards: an admin asked the requester something.
  for (const r of state.requests)
    if (r.requesterId === personId && r.status === 'awaiting-reply')
      out.push({ key: `req-${r.id}`, kind: 'reply', ref: r.id, title: r.title, detail: `${r.id} · the admins asked you a question`, app: requestHandler(r), action: 'Reply', route: { page: 'request-detail', id: r.id }, urgent: 'Needs a reply' });

  // DART Central / DartBoards requests this person handles as an admin: new ones, and ones the requester
  // answered. Only the products they administer, and never their own — nobody approves what they asked for.
  // A banner whose start date is close (or gone) cannot wait: a banner that misses its window has failed.
  const rights = adminOf(state, personId);
  if (rights)
    for (const r of state.requests) {
      if (!rights.products.includes(r.product) || r.requesterId === personId) continue;
      if (r.status !== 'new' && r.status !== 'needs-review') continue;
      const last = r.thread[r.thread.length - 1];
      const where = r.status === 'new' ? 'new request' : last?.author === 'requester' ? 'the requester answered' : 'in review';
      const starts = r.type.startsWith('banner') ? r.fields.find((f) => f.label === 'Starts')?.value : undefined;
      const startIso = starts ? starts.replace(/^(\d{2})\/(\d{2})\/(\d{4})$/, '$3-$1-$2') : undefined;
      const urgent = !startIso ? undefined : startIso < today ? 'Overdue' : startIso <= addDaysIso(today, 3) ? 'Starts soon' : undefined;
      out.push({
        key: `adm-${r.id}`,
        kind: 'triage',
        ref: r.id,
        title: r.title,
        detail: `${r.id} · ${typeLabel[r.type]} · ${where}${starts ? ` · starts ${fmtIso(startIso!)}` : ''}`,
        app: requestHandler(r),
        action: 'Review',
        route: { page: 'admin-review', id: r.id },
        urgent,
      });
    }

  // IRM approvals, whatever the workflow sends this person.
  for (const c of state.irm.changes)
    if (approversOf(c, state.irm.workflows).includes(personId))
      out.push({ key: `apr-${c.id}`, kind: 'approve', ref: c.id, title: c.title, detail: `${c.id} · ${irmChangeLabel(c)}`, app: 'irm', action: 'Approve', route: { page: 'irm-change', id: c.id } });

  // Evidence the governance team has to review (never one's own).
  for (const a of state.irm.attestations) {
    if (a.outcome !== 'pending' || a.submittedById === personId) continue;
    const r = state.irm.records.find((x) => x.number === a.record);
    const ctl = r?.controlItems.find((c) => c.id === a.controlId);
    if (r && ctl && GOVERNANCE_IDS.includes(personId))
      out.push({ key: `rev-${a.id}`, kind: 'review', ref: a.id, record: r.number, title: `Review evidence: ${ctl.name}`, detail: recordName(r), app: 'irm', action: 'Review', route: { page: 'irm-record', number: r.number } });
  }

  // Reports this person owns: recertification and controls coming due.
  for (const r of state.irm.records) {
    if (r.businessOwnerId !== personId || (r.lifecycle !== 'production' && r.lifecycle !== 'retiring')) continue;
    const ever = evergreenState(r, today);
    if (ever !== 'current')
      out.push({ key: `ev-${r.number}`, kind: 'certify', ref: r.number, title: `Recertify ${recordName(r)}`, detail: ever === 'past-due' ? 'Past due' : `Due ${fmtIso(r.evergreen.due)}`, app: 'irm', action: 'Certify', route: { page: 'irm-record', number: r.number }, urgent: ever === 'past-due' ? 'Past due' : undefined });
    for (const c of r.controlItems) {
      if (c.kind === 'data-quality' || !c.lastAttested || c.due > addDaysIso(today, 14)) continue;
      if (state.irm.attestations.some((a) => a.controlId === c.id && a.outcome === 'pending')) continue;
      out.push({ key: `ctl-${c.id}`, kind: 'attest', ref: c.id, record: r.number, title: `Attest ${c.name.toLowerCase()}`, detail: `${recordName(r)} · ${c.due < today ? 'overdue' : `due ${fmtIso(c.due)}`}`, app: 'irm', action: 'Attest', route: { page: 'irm-record', number: r.number }, urgent: c.due < today ? 'Overdue' : undefined });
    }
  }

  // Reports retiring that sit on a space this person has (`state.spaces` is already theirs).
  for (const d of state.dashboards) {
    if (!d.retiring || !state.spaces.some((s) => s.items.some((i) => i.dashboardId === d.id))) continue;
    out.push({ key: `ret-${d.id}`, kind: 'retiring', ref: d.id, title: `${d.name} is retiring`, detail: `On ${fmtIso(d.retiring.on)} · it is on one of your spaces`, app: 'boards', action: 'Open', route: { page: 'dashboard', id: d.id } });
  }

  // The IRM roles' own work, so their hub is not empty until something breaches its SLA.
  const role = PEOPLE.find((p) => p.id === personId)?.irmRole;
  const aged = (c: IrmChange) => (isAged(c, today, state.irm.workflows) ? 'Past SLA' : undefined);
  for (const c of state.irm.changes) {
    if (role === 'developer' && c.assigneeId === personId && c.status === 'ready')
      out.push({ key: `start-${c.id}`, kind: 'start', ref: c.id, title: c.title, detail: `${c.id} · ${c.priority} · ready to start`, app: 'irm', action: 'Start', route: { page: 'irm-change', id: c.id }, urgent: aged(c) });
    if (role === 'dev-manager' && !c.assigneeId && c.status === 'ready')
      out.push({ key: `assign-${c.id}`, kind: 'assign', ref: c.id, title: c.title, detail: `${c.id} · ${c.priority} · nobody has it`, app: 'irm', action: 'Assign', route: { page: 'irm-board' }, urgent: aged(c) });
    if (role === 'prod-support' && c.status === 'awaiting-deployment' && (!c.deployerId || c.deployerId === personId))
      out.push({
        key: `dep-${c.id}`,
        kind: c.deployerId ? 'deploy' : 'take',
        ref: c.id,
        title: c.title,
        detail: `${c.id} · ${c.priority} · ${c.deployerId ? 'yours to deploy' : 'unassigned'}`,
        app: 'irm',
        action: c.deployerId ? 'Deploy' : 'Take',
        route: { page: 'irm-deployments' },
        urgent: aged(c),
      });
  }

  return out.sort((a, b) => Number(!!b.urgent) - Number(!!a.urgent));
}

/* ── Who can ask for what ─────────────────────────────────────────────────────
   Not everyone should see every request. What a person can ask for follows
   their role (the IRM personas) and, for business users, whether they own a
   report: an owner can change, promote or retire what is theirs; a reader can
   ask for a report and say when one is wrong, and little else. One table, so
   the policy is read and changed in one place. */

export type Audience = 'owner' | 'reader' | 'developer' | 'dev-manager' | 'governance' | 'prod-support';

export const AUDIENCE_LABEL: Record<Audience, string> = {
  owner: 'Business user · report owner',
  reader: 'Report reader',
  developer: 'Developer',
  'dev-manager': 'Development manager',
  governance: 'Governance team',
  'prod-support': 'Production support',
};

export type RequestOptionId = 'new' | 'break' | 'change' | 'retire' | 'publish' | 'edit' | 'promote' | 'unpublish' | 'banner' | 'banner-app' | 'feature' | 'general';

const EVERYONE: Audience[] = ['owner', 'reader', 'developer', 'dev-manager', 'governance', 'prod-support'];

export const REQUEST_AUDIENCE: Record<RequestOptionId, Audience[]> = {
  // A report itself (IRM)
  new: ['owner', 'reader'],
  break: EVERYONE,
  change: ['owner', 'developer', 'dev-manager'],
  retire: ['owner', 'governance'],
  // How it appears in DartBoards
  publish: ['developer', 'dev-manager'],
  edit: ['owner', 'developer'],
  promote: ['owner'],
  unpublish: ['owner', 'developer'],
  banner: ['owner', 'developer', 'dev-manager', 'prod-support'],
  // Everything else
  'banner-app': ['owner', 'developer', 'dev-manager', 'prod-support'],
  feature: EVERYONE,
  general: EVERYONE,
};

/** A person's audience: their IRM role, or — for business users — owner or reader by what they own. */
export function audienceOf(state: SuiteState, personId: string): Audience {
  const role = PEOPLE.find((p) => p.id === personId)?.irmRole ?? 'business';
  if (role !== 'business') return role;
  return state.irm.records.some((r) => r.businessOwnerId === personId && r.lifecycle !== 'retired') ? 'owner' : 'reader';
}

export const canRequest = (option: RequestOptionId, audience: Audience) => REQUEST_AUDIENCE[option].includes(audience);

/** IRM's request types, in the chooser's words. */
export const IRM_TYPE_OPTION = { new: 'new', break: 'break', modification: 'change', decommission: 'retire' } as const;
/** The DartBoards form's modes, in the chooser's words. */
export const LISTING_MODE_OPTION = { add: 'publish', edit: 'edit', promote: 'promote', remove: 'unpublish' } as const;

/** Business people (owners, readers) file and follow report requests without leaving DART Central; IRM's own roles work in IRM. */
export const staysInCentral = (audience: Audience) => audience === 'owner' || audience === 'reader';

/** Where a report-request route goes for this person. */
export const reportRequestRoute = (audience: Audience, type: IrmChange['type'], record?: string): Route =>
  staysInCentral(audience) ? { page: 'report-request', type, record } : { page: 'irm-new-change', type, record };
export const reportChangeRoute = (audience: Audience, id: string): Route =>
  staysInCentral(audience) ? { page: 'report-request-detail', id } : { page: 'irm-change', id };
