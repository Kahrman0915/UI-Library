/* DART Central · Home — "Next up".

   One line under the greeting naming the single most important thing for this person, with its action,
   so the page answers "what do I do first?" before it shows anything else. It reads the same list as
   Needs your attention and Open items (`waitingOn`, urgent first), so it adapts to every role with no
   setup: a business owner sees a reply or an approval, a developer a P1 to start, governance evidence to
   review, production support a deployment. When nothing needs the person it says so and stays quiet. */

import type { LucideIcon } from 'lucide-react';
import { Archive, ArrowRight, CircleCheck, ClipboardCheck, FileClock, MessageSquare, Play, Rocket, ShieldCheck, Stamp, Ticket, TriangleAlert, UserPlus } from 'lucide-react';
import Badge from '../../../../components/Badge';
import Button from '../../../../components/Button';
import FeaturedIcon from '../../../../components/FeaturedIcon';
import { APP_NAME, waitingOn } from '../../hub';
import type { WaitingKind } from '../../hub';
import { useNav } from '../../nav';
import { useSignedIn, useSuite } from '../../store';
import type { SuiteState } from '../../store';
import type { Route } from '../../types';
import { CHANGE_STATUS, WORK_STATUSES, ageInStatus, fmtIso, isAged } from '../../irm';
import { myJiraTickets, openInJira } from './jira';
import { openReplyOnArrival } from '../requests/RequestDetail';
import { useWaitingActions } from './RoleWork';

/**
 * What is late in the person's OWN work — assigned IRM requests past their SLA, blocked Jira tickets. These
 * are not asks from someone else, so `waitingOn` does not hold them; but "you're all caught up" beside a
 * queue reading "3 past SLA" is a lie, so Next up and the greeting count them too.
 */
export type LateWork = { key: string; title: string; detail: string; app: string; action: string; urgent: string; run: 'route' | 'jira'; route?: Route; jiraKey?: string };

export function lateWork(state: SuiteState, personId: string): LateWork[] {
  const out: LateWork[] = [];
  const today = state.irm.today;
  const mine = state.irm.changes
    .filter((c) => c.assigneeId === personId && WORK_STATUSES.includes(c.status) && isAged(c, today, state.irm.workflows))
    .sort((a, b) => a.statusSince.localeCompare(b.statusSince));
  for (const c of mine)
    out.push({ key: `late-${c.id}`, title: c.title, detail: `${c.id} · ${CHANGE_STATUS[c.status].label}, ${ageInStatus(c, today)} days`, app: 'IRM', action: 'Open', urgent: 'Past SLA', run: 'route', route: { page: 'irm-change', id: c.id } });
  for (const t of myJiraTickets(personId).filter((x) => x.status === 'Blocked'))
    out.push({ key: `jira-${t.key}`, title: t.summary, detail: `${t.key}${t.due ? ` · due ${fmtIso(t.due)}` : ''}`, app: 'Jira', action: 'Open in Jira', urgent: 'Blocked', run: 'jira', jiraKey: t.key });
  return out;
}

/** How many things need this person: asks from others plus their own late work. The greeting reads this. */
export const needsCount = (state: SuiteState, personId: string) => waitingOn(state, personId).length + lateWork(state, personId).length;

const KIND_ICON: Record<WaitingKind, LucideIcon> = {
  reply: MessageSquare,
  approve: Stamp,
  review: ShieldCheck,
  certify: FileClock,
  attest: ClipboardCheck,
  retiring: Archive,
  start: Play,
  assign: UserPlus,
  take: Rocket,
  deploy: Rocket,
};

export function NextUp() {
  const { state } = useSuite();
  const { person } = useSignedIn();
  const { go } = useNav();
  const { act, dialogs } = useWaitingActions();
  const items = waitingOn(state, person.id);
  const late = lateWork(state, person.id);
  // An urgent ask from someone else comes first; then the person's own late work; then any other ask.
  const w = items.find((x) => x.urgent) ? items[0] : undefined;
  const l = !w ? late[0] : undefined;
  const ask = w ?? (!l ? items[0] : undefined);

  if (l)
    return (
      <section className="ds-next" aria-label="Next up">
        <FeaturedIcon Icon={l.run === 'jira' ? Ticket : TriangleAlert} color="error" />
        <div className="ds-next__text">
          <span className="ds-next__eyebrow">
            Next up
            <Badge id="ds-next-urgent" label={l.urgent} color="error" appearance="soft" />
          </span>
          <span className="ds-next__title">{l.title}</span>
          <span className="ds-next__detail">
            {l.app} · {l.detail}
          </span>
        </div>
        <div className="ds-next__actions">
          {items.length + late.length - 1 > 0 && (
            <Button id="ds-next-more" style="ghost" size="sm" label={`${items.length + late.length - 1} more need you`} IconRight={ArrowRight} onClick={() => go({ page: 'my-requests' })} />
          )}
          <Button id="ds-next-act" size="sm" label={l.action} onClick={() => (l.run === 'jira' ? openInJira(l.jiraKey) : l.route && go(l.route))} />
        </div>
      </section>
    );

  if (!ask)
    return (
      <section className="ds-next ds-next--clear" aria-label="Next up">
        <FeaturedIcon Icon={CircleCheck} color="success" />
        <div className="ds-next__text">
          <span className="ds-next__title">You’re all caught up</span>
          <span className="ds-next__detail">Nothing needs you in any app right now.</span>
        </div>
      </section>
    );

  const a = ask;
  const run = () => {
    if (a.kind === 'reply') {
      openReplyOnArrival(a.ref);
      go(a.route);
    } else act(a);
  };
  const more = items.length + late.length - 1;

  return (
    <section className="ds-next" aria-label="Next up">
      <FeaturedIcon Icon={KIND_ICON[a.kind]} color={a.urgent ? 'error' : 'warning'} />
      <div className="ds-next__text">
        <span className="ds-next__eyebrow">
          Next up
          {a.urgent && <Badge id="ds-next-urgent" label={a.urgent} color="error" appearance="soft" />}
        </span>
        <span className="ds-next__title">{a.title}</span>
        <span className="ds-next__detail">
          {APP_NAME[a.app]} · {a.detail}
        </span>
      </div>
      <div className="ds-next__actions">
        {more > 0 && <Button id="ds-next-more" style="ghost" size="sm" label={`${more} more need you`} IconRight={ArrowRight} onClick={() => go({ page: 'my-requests' })} />}
        <Button id="ds-next-act" size="sm" label={a.action} onClick={run} />
      </div>
      {dialogs}
    </section>
  );
}
