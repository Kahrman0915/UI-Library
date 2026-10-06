/* ── DART Suite prototype · persona journeys ─────────────────────────────────
   The script for walking someone through the suite. Each journey is a list of
   steps; each step says who is signed in, where they are, what happens, and —
   where the prototype fixed a rough edge — what changed. A step can also do
   itself ("Do this step for me"), so a presenter never has to fill a form live.

   Routes and actions read the live store, never a hard-coded id the store may
   not have: "the fix Taylor filed" is looked up, so the end-to-end story works
   however many requests were filed before it. */

import { irmOps, nextChangeId } from '../irmEngine';
import type { Handler } from '../hub';
import type { IrmChangeStatus } from '../irm';
import type { SuiteState } from '../store';
import type { Route } from '../types';

export type StepContext = { state: SuiteState; update: (fn: (d: SuiteState) => void) => void; go: (r: Route) => void };

export type JourneyStep = {
  /** Who is signed in for this step. */
  who: string;
  app: Handler;
  title: string;
  /** What happens on screen, in a sentence or two. */
  says: string;
  /** What to point out while you are there. */
  point?: string;
  /** The rough edge this step used to have, and what changed. */
  improved?: string;
  route: Route | ((s: SuiteState) => Route);
  /** Optional: the presenter can have the step done for them. */
  act?: { label: string; run: (ctx: StepContext) => void };
  /** Whether the step has already happened in the live store. */
  done?: (s: SuiteState) => boolean;
};

export type Journey = {
  id: string;
  title: string;
  /** For a persona journey, the persona; the end-to-end story has none. */
  who?: string;
  role: string;
  goal: string;
  steps: JourneyStep[];
};

/* ── Lookups against the live store ────────────────────────────────────── */

const irmOf = (s: SuiteState, dashboardId: string) => s.dashboards.find((d) => d.id === dashboardId)?.irm ?? '';
const recordRoute = (dashboardId: string) => (s: SuiteState): Route => ({ page: 'irm-record', number: irmOf(s, dashboardId) });
const change = (s: SuiteState, id: string) => s.irm.changes.find((c) => c.id === id);

/** The fix Taylor files in the end-to-end story: the newest break on NPS Trends they created. */
const theFix = (s: SuiteState) => s.irm.changes.find((c) => c.type === 'break' && c.createdById === TAYLOR && c.record === irmOf(s, 'nps-trends'));
const ORDER: IrmChangeStatus[] = ['ready', 'in-development', 'in-review', 'awaiting-deployment', 'deployed'];
const reached = (s: SuiteState, status: IrmChangeStatus) => {
  const c = theFix(s);
  return !!c && ORDER.indexOf(c.status) >= ORDER.indexOf(status);
};
/** Once filed, every route that is "the fix" goes to its page; before that, the board it will appear on. */
const fixRoute = (fallback: Route) => (s: SuiteState): Route => {
  const c = theFix(s);
  return c ? { page: 'irm-change', id: c.id } : fallback;
};

/* ── The cast ──────────────────────────────────────────────────────────── */

export const KAHRMAN = 'u-km';
export const TAYLOR = 'u-tb';
export const JORDAN = 'u-jm';
export const ALEX = 'u-ar';
export const NINA = 'u-np';
export const CHRIS = 'u-cb';

/* ── The full example: one fix, five people, three applications ───────── */

const endToEnd: Journey = {
  id: 'end-to-end',
  title: 'One fix, end to end',
  role: 'Five people · three applications',
  goal: 'A reader spots a problem on a dashboard; the fix is triaged, built, shipped, and the reader hears it’s fixed — without anyone being sent to a system they don’t use.',
  steps: [
    {
      who: TAYLOR,
      app: 'boards',
      title: 'Taylor spots a problem',
      says: 'Taylor reads dashboards and owns no reports. NPS Trends, on their own space, is showing last week twice.',
      point: 'Taylor’s Home and spaces are their own — nobody else’s spaces appear.',
      improved: 'Spaces used to show the same person’s spaces to everyone. They now belong to whoever made them, plus the people they share with.',
      route: { page: 'dashboard', id: 'nps-trends' },
    },
    {
      who: TAYLOR,
      app: 'central',
      title: 'Reports it — in DART Central',
      says: 'New request → “Something is wrong”. The form is IRM’s, but it opens inside DART Central with an Open items breadcrumb. Taylor never sees IRM.',
      improved: 'This used to land a reader in IRM’s application, with IRM’s sidebar — a system they had never heard of.',
      route: (s) => ({ page: 'report-request', type: 'break', record: irmOf(s, 'nps-trends') }),
      act: {
        label: 'File the report for Taylor',
        run: ({ state, update, go }) => {
          const number = irmOf(state, 'nps-trends');
          const owner = state.irm.records.find((r) => r.number === number)?.businessOwnerId ?? TAYLOR;
          const id = nextChangeId();
          update((d) =>
            void irmOps.createChange(d, {
              id,
              type: 'break',
              record: number,
              title: 'NPS Trends shows last week twice',
              summary: 'The weekly chart repeats last week’s bar since Monday’s refresh.',
              priority: 'P2',
              createdById: TAYLOR,
              requestedForId: owner,
            }),
          );
          go({ page: 'report-request-detail', id });
        },
      },
      done: (s) => !!theFix(s),
    },
    {
      who: TAYLOR,
      app: 'boards',
      title: 'Everyone sees it’s known',
      says: 'The moment it’s filed, NPS Trends carries a known-issue notice. Nobody else has to report it, and nobody trusts the wrong number in the meantime.',
      point: 'Taylor’s confirmation reads in plain words: “We’ve flagged a known issue on NPS Trends.”',
      improved: 'The confirmation used to say “IRM → DartBoards · Incident opened”.',
      route: { page: 'dashboard', id: 'nps-trends' },
      done: (s) => !!theFix(s),
    },
    {
      who: ALEX,
      app: 'central',
      title: 'Alex assigns it from Home',
      says: 'Alex runs the developers. Their Home leads with Team load, and the new fix is in Waiting on you with an Assign button. A dialog shows who has what; Alex picks Jordan.',
      improved: 'A dev manager’s Home used to be empty — unassigned work only showed up inside IRM, and acting on it meant leaving DART Central.',
      route: { page: 'home' },
      act: { label: 'Assign it to Jordan', run: ({ state, update }) => { const c = theFix(state); if (c) update((d) => irmOps.assign(d, c.id, JORDAN, ALEX)); } },
      done: (s) => !!theFix(s)?.assigneeId,
    },
    {
      who: JORDAN,
      app: 'central',
      title: 'Jordan starts it',
      says: 'Jordan’s Home shows Your queue, and the fix is waiting with a Start button. One click moves it to In development — no trip into IRM.',
      improved: 'A developer’s Home used to show nothing until something broke its SLA.',
      route: { page: 'home' },
      act: { label: 'Start it for Jordan', run: ({ state, update }) => { const c = theFix(state); if (c) update((d) => irmOps.move(d, c.id, 'in-development', JORDAN)); } },
      done: (s) => reached(s, 'in-development'),
    },
    {
      who: JORDAN,
      app: 'irm',
      title: 'Builds and hands it on',
      says: 'The work itself lives in IRM. Jordan opens the request, moves it through review and hands it to production support.',
      point: 'Each move is recorded with who and when — that is the audit trail governance reads later.',
      route: fixRoute({ page: 'irm-home' }),
      act: {
        label: 'Move it to awaiting deployment',
        run: ({ state, update }) => {
          const c = theFix(state);
          if (c)
            update((d) => {
              irmOps.move(d, c.id, 'in-review', JORDAN);
              irmOps.move(d, c.id, 'awaiting-deployment', JORDAN);
            });
        },
      },
      done: (s) => reached(s, 'awaiting-deployment'),
    },
    {
      who: CHRIS,
      app: 'central',
      title: 'Chris ships it',
      says: 'Chris is production support. Their Home shows the deploy queue; the fix is there with Take, then Deploy — confirmed in a dialog.',
      improved: 'Unassigned deployments used to be missing from Waiting on you entirely.',
      route: { page: 'home' },
      act: {
        label: 'Take and deploy it',
        run: ({ state, update }) => {
          const c = theFix(state);
          if (c)
            update((d) => {
              irmOps.takeDeployment(d, c.id, CHRIS);
              irmOps.deploy(d, c.id, CHRIS);
            });
        },
      },
      done: (s) => reached(s, 'deployed'),
    },
    {
      who: TAYLOR,
      app: 'boards',
      title: 'Taylor sees it fixed',
      says: 'Back as Taylor: the known-issue notice is gone from NPS Trends, and Open items shows the request as deployed, under Closed in the last 30 days.',
      point: 'Taylor never left DART Central and DartBoards, and never had to learn what IRM is.',
      route: { page: 'dashboard', id: 'nps-trends' },
      done: (s) => reached(s, 'deployed'),
    },
    {
      who: NINA,
      app: 'irm',
      title: 'Governance can trace all of it',
      says: 'Nina, on the governance team, opens the audit log: who reported it, who assigned, built and deployed it, and when.',
      route: { page: 'irm-audit' },
    },
  ],
};

/* ── One journey per persona ───────────────────────────────────────────── */

const owner: Journey = {
  id: 'owner',
  title: 'Report owner',
  who: KAHRMAN,
  role: 'Business owner',
  goal: 'Keep the reports I own trustworthy, and act on what’s waiting without hunting for it.',
  steps: [
    {
      who: KAHRMAN,
      app: 'central',
      title: 'Starts at Home',
      says: 'Waiting on you leads the page: a reply, two approvals and a recertification — from every application, in one list.',
      point: 'The page is theirs: Edit Today picks the numbers; Customize sizes, moves and adds widgets, quick actions included.',
      route: { page: 'home' },
    },
    {
      who: KAHRMAN,
      app: 'central',
      title: 'Approves without leaving',
      says: 'Approve opens a dialog with the request’s facts. Approve, or Reject with a reason — “Open in IRM” is there for the full page.',
      improved: 'Approving used to bounce the owner into IRM.',
      route: { page: 'home' },
      act: { label: 'Approve CHG-1042', run: ({ update }) => update((d) => irmOps.approve(d, 'CHG-1042', KAHRMAN)) },
      done: (s) => change(s, 'CHG-1042')?.status !== 'pending-approval',
    },
    {
      who: KAHRMAN,
      app: 'central',
      title: 'Recertifies in place',
      says: 'Marketing Funnel is due its yearly recertification. Certify confirms it’s still needed, still right, still theirs.',
      improved: 'This used to mean opening the record in IRM.',
      route: { page: 'home' },
      act: { label: 'Certify Marketing Funnel', run: ({ state, update }) => update((d) => irmOps.certify(d, irmOf(state, 'marketing-funnel'), KAHRMAN)) },
      done: (s) => s.irm.records.find((r) => r.number === irmOf(s, 'marketing-funnel'))?.evergreen.lastCertified === s.irm.today,
    },
    {
      who: KAHRMAN,
      app: 'central',
      title: 'Asks for a change',
      says: 'New request → “Change what a report shows”. Owners see the report options a reader doesn’t; the form stays in DART Central.',
      route: { page: 'report-request', type: 'modification' },
    },
    {
      who: KAHRMAN,
      app: 'central',
      title: 'Tracks it all in one place',
      says: 'Open items holds everything open across every application — requests, IRM work, Jira tickets — each labeled with where it lives.',
      route: { page: 'my-requests' },
    },
    {
      who: KAHRMAN,
      app: 'irm',
      title: 'Opens the record when they want the detail',
      says: 'The record has controls, lineage, and every DartBoards listing it feeds — there when wanted, never required.',
      route: recordRoute('marketing-funnel'),
    },
  ],
};

const reader: Journey = {
  id: 'reader',
  title: 'Dashboard reader',
  who: TAYLOR,
  role: 'Reader',
  goal: 'Find the numbers I need, and say so when something looks wrong.',
  steps: [
    {
      who: TAYLOR,
      app: 'central',
      title: 'A Home that is theirs',
      says: 'Their numbers and their spaces, data first. Nothing about other people’s work.',
      improved: 'Readers used to see someone else’s spaces.',
      route: { page: 'home' },
    },
    {
      who: TAYLOR,
      app: 'boards',
      title: 'Their space',
      says: 'My dashboards: the three they check every week, each with its trend.',
      route: { page: 'space', id: 'tb-my-dashboards' },
    },
    {
      who: TAYLOR,
      app: 'boards',
      title: 'Reads a dashboard',
      says: 'NPS Trends. If something were known to be wrong, a notice would say so here.',
      route: { page: 'dashboard', id: 'nps-trends' },
    },
    {
      who: TAYLOR,
      app: 'central',
      title: 'Only the requests a reader needs',
      says: 'New request shows what a reader can ask for — a reader can’t retire a report or change its controls.',
      route: { page: 'new-request' },
    },
    {
      who: TAYLOR,
      app: 'central',
      title: 'Reports something wrong',
      says: '“Something is wrong” opens in DART Central, not IRM. Submitting lands on their request under Open items.',
      improved: 'This used to drop a reader into IRM’s application shell.',
      route: (s) => ({ page: 'report-request', type: 'break', record: irmOf(s, 'nps-trends') }),
    },
    {
      who: TAYLOR,
      app: 'central',
      title: 'Hears back in plain words',
      says: 'Updates read like news about the report — “NPS Trends is fixed” — never IRM’s vocabulary.',
      improved: 'Updates used to read “IRM → DartBoards · Incident resolved”.',
      route: { page: 'my-requests' },
    },
  ],
};

const developer: Journey = {
  id: 'developer',
  title: 'Developer',
  who: JORDAN,
  role: 'Developer',
  goal: 'Know what to work on next, and move it along.',
  steps: [
    {
      who: JORDAN,
      app: 'central',
      title: 'Their queue on Home',
      says: 'Your queue: what’s assigned to them, by priority, with how many are past SLA.',
      improved: 'A developer’s Home used to be empty until something breached its SLA.',
      route: { page: 'home' },
    },
    {
      who: JORDAN,
      app: 'irm',
      title: 'The full queue in IRM',
      says: 'Sort by priority or age in status; filter by stage. This is where the work lives.',
      route: { page: 'irm-home' },
    },
    {
      who: JORDAN,
      app: 'irm',
      title: 'Moves a request along',
      says: 'CHG-1040 is in development. Moving it to review notifies the business owner and records the step.',
      route: { page: 'irm-change', id: 'CHG-1040' },
      act: { label: 'Move CHG-1040 to review', run: ({ update }) => update((d) => irmOps.move(d, 'CHG-1040', 'in-review', JORDAN)) },
      done: (s) => change(s, 'CHG-1040')?.status !== 'in-development',
    },
    {
      who: JORDAN,
      app: 'irm',
      title: 'Checks what depends on it',
      says: 'Lineage shows Revenue by Region’s sources and the reports built on it — so a change never surprises a downstream owner.',
      route: recordRoute('revenue-by-region'),
    },
  ],
};

const manager: Journey = {
  id: 'dev-manager',
  title: 'Dev manager',
  who: ALEX,
  role: 'Dev manager',
  goal: 'Balance the team and keep work moving.',
  steps: [
    {
      who: ALEX,
      app: 'central',
      title: 'Team load on Home',
      says: 'How much each developer has in progress, and how many requests nobody has yet.',
      improved: 'This used to exist only inside IRM.',
      route: { page: 'home' },
    },
    {
      who: ALEX,
      app: 'central',
      title: 'Assigns from Home',
      says: 'Assign opens a dialog listing each developer with their current load. Pick one; Waiting on you shrinks.',
      route: { page: 'home' },
      act: { label: 'Assign CHG-1047 to Dana', run: ({ update }) => update((d) => irmOps.assign(d, 'CHG-1047', 'u-dw', ALEX)) },
      done: (s) => !!change(s, 'CHG-1047')?.assigneeId,
    },
    {
      who: ALEX,
      app: 'irm',
      title: 'Balances the board',
      says: 'The team board: drag a card onto a person or a column. Every card has a menu that does the same from the keyboard.',
      route: { page: 'irm-board' },
    },
    {
      who: ALEX,
      app: 'irm',
      title: 'Month over month',
      says: 'Opened against closed, throughput by type, and how long work sits in each stage.',
      route: { page: 'irm-activity' },
    },
  ],
};

const governance: Journey = {
  id: 'governance',
  title: 'Governance',
  who: NINA,
  role: 'Governance',
  goal: 'Every report certified, controlled and traceable.',
  steps: [
    {
      who: NINA,
      app: 'central',
      title: 'The three numbers on Home',
      says: 'Evidence to review, recertifications past due, requests past SLA — and evidence opens for review right from Waiting on you.',
      improved: 'Governance used to have to open IRM to see any of it.',
      route: { page: 'home' },
    },
    {
      who: NINA,
      app: 'irm',
      title: 'Governance overview',
      says: 'Past-due evergreens, flagged reports and SLA performance in one place.',
      route: { page: 'irm-governance' },
    },
    {
      who: NINA,
      app: 'irm',
      title: 'Owns the workflows',
      says: 'Who approves each request type, which stages it passes and their SLAs. Only governance can edit them.',
      route: { page: 'irm-workflows' },
    },
    {
      who: NINA,
      app: 'irm',
      title: 'Reads the audit log',
      says: 'Every change to every report: who, what, when, from and to.',
      route: { page: 'irm-audit' },
    },
    {
      who: NINA,
      app: 'irm',
      title: 'Sees what DartBoards was told',
      says: 'The integration log: each event IRM sent, and what it changed in DartBoards.',
      route: { page: 'irm-integrations' },
    },
  ],
};

const support: Journey = {
  id: 'prod-support',
  title: 'Production support',
  who: CHRIS,
  role: 'Production support',
  goal: 'Ship what’s ready, safely.',
  steps: [
    {
      who: CHRIS,
      app: 'central',
      title: 'The deploy queue on Home',
      says: 'How much is waiting, how much nobody has taken, and what went out recently.',
      improved: 'Unassigned deployments used to be missing from Waiting on you.',
      route: { page: 'home' },
    },
    {
      who: CHRIS,
      app: 'central',
      title: 'Takes and deploys in place',
      says: 'Take claims it with one click; Deploy confirms in a dialog. CHG-1054 is a fix, so deploying it clears a known-issue notice.',
      route: { page: 'home' },
      act: {
        label: 'Take and deploy CHG-1054',
        run: ({ update }) =>
          update((d) => {
            irmOps.takeDeployment(d, 'CHG-1054', CHRIS);
            irmOps.deploy(d, 'CHG-1054', CHRIS);
          }),
      },
      done: (s) => change(s, 'CHG-1054')?.status === 'deployed',
    },
    {
      who: CHRIS,
      app: 'irm',
      title: 'The full deployments list',
      says: 'Unassigned first, by age in status, with roll back for anything that went wrong.',
      route: { page: 'irm-deployments' },
    },
  ],
};

export const JOURNEYS: Journey[] = [endToEnd, owner, reader, developer, manager, governance, support];
