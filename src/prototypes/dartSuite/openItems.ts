/* Open items — everything a person is working on or waiting on, from every application, in one list.

   It is the developer's day as the owner described it (2026-10-06): an IRM request for a new report
   (the business's BRD on it) → the Jira tickets opened from that BRD → the work done → a DartBoards
   request to list the report. Each lives in its own system and can be worked there; this brings them
   together, sorted by what they need:

     Needs you          — the next move is yours: a reply, an approval, a recertification, work to start.
                          EXACTLY Home's "Needs your attention" (`waitingOn`), so the two counts agree.
     Your work          — assigned to you: IRM work in hand, your Jira tickets (blocked first), and your
                          requests that are approved and running
     Waiting on others  — you asked; someone else has the next move
     Closed             — finished in the last 30 days, so you can confirm it happened

   The chain is SHOWN, not used to group: a Jira ticket opened for an IRM request sits under that request
   when the request is on the list, and a request and the DartBoards listing request for the same report
   name each other. Home is the glance; this is the working list. */

import type { LucideIcon } from 'lucide-react';
import { APP_NAME, audienceOf, irmChangeLabel, reportChangeRoute, requestHandler, waitingOn } from './hub';
import type { WaitingItem } from './hub';
import { CHANGE_STATUS, addDaysIso, ageInStatus, fmtIso, recordName } from './irm';
import type { IrmChange } from './irm';
import { myJiraTickets } from './screens/home/jira';
import type { JiraTicket } from './screens/home/jira';
import { dateKey, prettyDates, refLine, scopeLabel, statusFor } from './screens/requests/shared';
import type { SuiteState, Tone } from './store';
import { typeLabel } from './store';
import type { Request, Route } from './types';

export type OpenSection = 'needs' | 'progress' | 'waiting' | 'closed';
export type OpenApp = 'central' | 'boards' | 'irm' | 'jira';

export const OPEN_SECTIONS: { key: OpenSection; heading: string; empty?: string }[] = [
  { key: 'needs', heading: 'Needs you' },
  { key: 'progress', heading: 'Your work' },
  { key: 'waiting', heading: 'Waiting on others' },
  { key: 'closed', heading: 'Closed in the last 30 days' },
];

export type OpenItem = {
  key: string;
  section: OpenSection;
  app: OpenApp;
  /** "CHG-1046", "#0417", "DART-890" — what search matches as well as the title. */
  ref: string;
  title: string;
  /** "IRM · CHG-1046 · New report · Agency Placement Tracker". */
  line: string;
  summary?: string;
  status: { label: string; tone: Tone; Icon?: LucideIcon };
  /** "Opened Sep 1, 2026", "Due Oct 9, 2026", "6 days in status". */
  when: string;
  /** Newest first within a section. */
  sort: number;
  /** Where the item opens. A Jira ticket opens in Jira instead (`jira`). */
  route?: Route;
  jira?: JiraTicket;
  request?: Request;
  change?: IrmChange;
  /** The next move, when it is this person's and can be done in place (Home's waiting actions). */
  waiting?: WaitingItem;
  /** Jira tickets opened for this IRM request — shown under it. */
  tickets: JiraTicket[];
  /** The other half of a report's chain: its IRM request, or its DartBoards listing request. */
  links: { label: string; route: Route }[];
};

const isoKey = (iso: string) => new Date(`${iso}T00:00:00`).getTime();
const usToIso = (us: string) => {
  const m = us.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  return m ? `${m[3]}-${m[1]}-${m[2]}` : '';
};

const JIRA_TONE: Record<JiraTicket['status'], Tone> = { 'To Do': 'neutral', 'In Progress': 'info', 'In Review': 'info', Blocked: 'error' };

/** Everything open for `personId`, sorted into the four sections. */
export function openItems(state: SuiteState, personId: string): OpenItem[] {
  const today = state.irm.today;
  const since30 = addDaysIso(today, -30);
  const audience = audienceOf(state, personId);
  const out: OpenItem[] = [];
  const seen = new Set<string>();
  const tickets = myJiraTickets(personId);

  // The DartBoards listing request that names a report's IRM number, and back.
  const listingFor = (record: string) => state.requests.find((r) => r.type.startsWith('dashboard') && r.fields.some((f) => f.label === 'IRM record' && f.value === record));
  const changesFor = (record: string) => state.irm.changes.filter((c) => c.record === record && c.type === 'new');

  const irmItem = (c: IrmChange, section: OpenSection, waiting?: WaitingItem): OpenItem => {
    const rec = state.irm.records.find((r) => r.number === c.record);
    const st = CHANGE_STATUS[c.status];
    const listing = listingFor(c.record);
    const closed = !st.active;
    return {
      key: `irm-${c.id}`,
      section,
      app: 'irm',
      ref: c.id,
      title: c.title,
      line: [APP_NAME.irm, c.id, irmChangeLabel(c), rec ? recordName(rec) : c.record].join(' · '),
      summary: c.summary !== c.title ? c.summary : undefined,
      status: { label: st.label, tone: st.tone },
      when: closed && c.closed ? `Closed ${fmtIso(c.closed)}` : `${ageInStatus(c, today)} ${ageInStatus(c, today) === 1 ? 'day' : 'days'} in status`,
      sort: isoKey(c.closed ?? c.statusSince),
      route: reportChangeRoute(audience, c.id),
      change: c,
      waiting,
      tickets: [],
      links: listing ? [{ label: `DartBoards listing request ${listing.id} · ${statusFor(listing).label}`, route: { page: 'request-detail', id: listing.id } }] : [],
    };
  };

  const requestItem = (r: Request, section: OpenSection, waiting?: WaitingItem): OpenItem => {
    const s = statusFor(r);
    const record = r.fields.find((f) => f.label === 'IRM record')?.value;
    const built = record ? changesFor(record)[0] : undefined;
    return {
      key: `req-${r.id}`,
      section,
      app: requestHandler(r),
      ref: r.id,
      title: r.title,
      line: refLine(APP_NAME[requestHandler(r)], r.id, typeLabel[r.type], scopeLabel(r)),
      summary: prettyDates(r.summary),
      status: { label: s.label, tone: s.tone, Icon: s.Icon },
      when: section === 'closed' ? `Closed ${prettyDates(r.updatedAt)}` : `Opened ${prettyDates(r.submittedAt)}`,
      sort: dateKey(section === 'closed' ? r.updatedAt : r.submittedAt),
      route: { page: 'request-detail', id: r.id },
      request: r,
      waiting,
      tickets: [],
      links: built ? [{ label: `Built under IRM ${built.id} · ${CHANGE_STATUS[built.status].label}`, route: reportChangeRoute(audience, built.id) }] : [],
    };
  };

  const jiraItem = (t: JiraTicket, section: OpenSection): OpenItem => ({
    key: `jira-${t.key}`,
    section,
    app: 'jira',
    ref: t.key,
    title: t.summary,
    line: ['Jira', t.key, t.type, t.project, t.irm ? `for ${t.irm}` : ''].filter(Boolean).join(' · '),
    status: { label: t.status, tone: JIRA_TONE[t.status] },
    when: t.due ? `Due ${fmtIso(t.due)}` : `Updated ${fmtIso(t.updated)}`,
    sort: isoKey(t.due ?? t.updated),
    jira: t,
    tickets: [],
    links: [],
  });

  // 1 · Needs you — whatever waitingOn says is this person's next move, in every application.
  for (const w of waitingOn(state, personId)) {
    const c = w.app === 'irm' ? state.irm.changes.find((x) => x.id === w.ref) : undefined;
    const r = w.kind === 'reply' ? state.requests.find((x) => x.id === w.ref) : undefined;
    if (c) {
      out.push({ ...irmItem(c, 'needs', w), key: `w-${w.key}` });
      seen.add(c.id);
    } else if (r) {
      out.push(requestItem(r, 'needs', w));
      seen.add(r.id);
    } else {
      // A report-level task (recertify, attest, review, a retiring dashboard): no request behind it.
      out.push({
        key: `w-${w.key}`,
        section: 'needs',
        app: w.app,
        ref: w.record ?? w.ref,
        title: w.title,
        line: [APP_NAME[w.app], w.detail].join(' · '),
        status: { label: w.urgent ?? 'To do', tone: w.urgent ? 'error' : 'neutral' },
        when: '',
        sort: 0,
        route: w.route,
        waiting: w,
        tickets: [],
        links: [],
      });
    }
  }
  // 2 · Your work — IRM work assigned to this person that is moving, and every Jira ticket of theirs.
  for (const c of state.irm.changes)
    if (!seen.has(c.id) && c.assigneeId === personId && CHANGE_STATUS[c.status].active && c.status !== 'pending-approval') {
      out.push(irmItem(c, 'progress'));
      seen.add(c.id);
    }
  for (const t of tickets) out.push(jiraItem(t, 'progress'));

  // 3 · Waiting on others — what this person asked for that someone else now has. A request that is
  // approved and running (a promotion, a banner) is not waiting on anyone: it is in progress.
  for (const r of state.requests)
    if (r.requesterId === personId && !seen.has(r.id) && statusFor(r).group !== 'done') {
      out.push(requestItem(r, statusFor(r).group === 'active' ? 'progress' : 'waiting'));
      seen.add(r.id);
    }
  for (const c of state.irm.changes)
    if (!seen.has(c.id) && (c.createdById === personId || c.requestedForId === personId) && CHANGE_STATUS[c.status].active) {
      out.push(irmItem(c, 'waiting'));
      seen.add(c.id);
    }

  // 4 · Closed in the last 30 days — asked for, built or deployed by this person.
  for (const r of state.requests)
    if (r.requesterId === personId && !seen.has(r.id) && statusFor(r).group === 'done' && usToIso(r.updatedAt) >= since30) out.push(requestItem(r, 'closed'));
  for (const c of state.irm.changes)
    if (
      !seen.has(c.id) &&
      (c.createdById === personId || c.requestedForId === personId || c.assigneeId === personId || c.deployerId === personId) &&
      !CHANGE_STATUS[c.status].active &&
      (c.closed ?? '') >= since30
    )
      out.push(irmItem(c, 'closed'));

  // The chain: a Jira ticket opened for an IRM request on this list sits under it instead of on its own.
  const byChange = new Map(out.filter((i) => i.change).map((i) => [i.change!.id, i]));
  const nested = new Set<string>();
  for (const t of tickets) {
    const parent = t.irm ? byChange.get(t.irm) : undefined;
    if (parent) {
      parent.tickets.push(t);
      nested.add(`jira-${t.key}`);
    }
  }
  // A request with one of your own tickets on it is your work, not something you are waiting on: the
  // business owner's UAT ticket on a request in development is theirs to do (it would hide under
  // "Waiting on others" otherwise).
  for (const item of byChange.values()) if (item.section === 'waiting' && item.tickets.length) item.section = 'progress';

  // Needs you is a to-do list: urgent first, then oldest/soonest. Your work puts what is blocked first.
  // The rest read newest first.
  const urgent = (i: OpenItem) => Number(i.status.tone === 'error' || !!i.waiting?.urgent);
  return out
    .filter((i) => !nested.has(i.key))
    .sort((a, b) =>
      a.section === 'needs' && b.section === 'needs'
        ? urgent(b) - urgent(a) || a.sort - b.sort
        : a.section === 'progress' && b.section === 'progress'
          ? urgent(b) - urgent(a) || b.sort - a.sort
          : b.sort - a.sort,
    );
}
