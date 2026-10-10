/* DART Central · Home — Today.

   The strip at the top of Home: the numbers this person opens Home for, each a
   door to where it lives. It is a SECTION of the page, not a widget — it has its
   own heading, it never moves, and the person chooses what is in it ("Edit
   Today"). Up to eight numbers, four to a row, on the same columns as the
   widgets below, so the page reads as one board. Absent a choice, the role's
   four. */

import { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ArrowDown, ArrowUp, Pencil } from 'lucide-react';
import { APP_ICON } from '../../appIcons';
import Badge from '../../../../components/Badge';
import Button from '../../../../components/Button';
import Checkbox from '../../../../components/Checkbox';
import Drawer, { DrawerBody, DrawerFooter, DrawerHeader } from '../../../../components/Drawer';
import Section from '../../../../components/Section';
import Stack from '../../../../components/Stack';
import Text from '../../../../components/Text';
import { audienceOf, waitingOn } from '../../hub';
import type { Audience } from '../../hub';
import { CHANGE_STATUS, WORK_STATUSES, evergreenState, fmtIso, isAged } from '../../irm';
import { useNav } from '../../nav';
import { adminOf, useSignedIn, useSuite } from '../../store';
import type { SuiteState } from '../../store';
import type { Asset, Route } from '../../types';
import { Sparkline } from '../../../../charts';
import { isUrgent, myJiraTickets, openInJira } from './jira';
import { openItems } from '../../openItems';
import { change4, controlsDue, glanceTrend, flagOf, ownedReports, recertsDue, sumSeries, viewsOf, watched } from './homeData';

/**
 * The colour a number's DETAIL line takes — never the number itself, which is always the text colour.
 * Red is for something actually wrong (overdue, past due, blocked, late), orange for something that
 * can't wait, green and red for a trend's direction. Everything else stays uncoloured.
 */
type Tone = 'default' | 'success' | 'warning' | 'error';
/** `route` opens a page in DART Central; `open` opens somewhere outside it (Jira). */
/**
 * One Today number. Its picture is whichever fits WHAT it counts — never a chart for its own sake:
 * `trend` (a sparkline) for a metric that moves over time, `progress` (a bar) for a share of a whole,
 * `segments` (one block per thing counted, coloured by its state) for a count of items. A number
 * with no natural picture has none, and its tile still lines up with the rest.
 */
type Value = {
  value: string | number;
  context: string;
  tone?: Tone;
  progress?: number;
  trend?: number[];
  segments?: Tone[];
  route?: Route;
  open?: () => void;
};

export type TodayApp = 'DART Central' | 'DartBoards' | 'Metrics' | 'IRM' | 'Jira' | 'Admin';

/**
 * The tag a tile carries to say which application its number comes from. DART Central's own
 * numbers (what needs your attention, your requests) span every application, so they carry none.
 */
const APP_TAG: Record<TodayApp, { label: string; color: 'blue' | 'violet' | 'sky' | 'amber'; Icon?: LucideIcon } | null> = {
  'DART Central': null,
  DartBoards: { label: 'DartBoards', color: 'blue', Icon: APP_ICON.boards },
  // A metric lives in DartBoards' marketplace, so it carries DartBoards' tag.
  Metrics: { label: 'DartBoards', color: 'blue', Icon: APP_ICON.boards },
  IRM: { label: 'IRM', color: 'violet', Icon: APP_ICON.irm },
  Jira: { label: 'Jira', color: 'sky', Icon: APP_ICON.jira },
  Admin: { label: 'Admin', color: 'amber' },
}

export type TodayMetric = {
  id: string;
  label: string;
  /** The application the number comes from, shown in the picker. */
  app: TodayApp;
  /** Who can pick it (absent = everyone). */
  for?: Audience[];
  /** Admins only. */
  admin?: boolean;
  read: (state: SuiteState, personId: string) => Value;
};

/** The requests this person sees in the admin queue — only the products they administer. */
const adminRequests = (s: SuiteState, personId: string) => {
  const products = adminOf(s, personId)?.products ?? [];
  return s.requests.filter((r) => products.includes(r.product));
};

const IRM_WORK: Audience[] = ['developer', 'dev-manager', 'governance', 'prod-support'];

export const TODAY_METRICS: TodayMetric[] = [
  {
    id: 'needs',
    label: 'Needs your attention',
    app: 'DART Central',
    read: (s, p) => {
      const items = waitingOn(s, p);
      const urgent = items.filter((w) => w.urgent).length;
      return { value: items.length, segments: items.map((w) => (w.urgent ? 'warning' : 'default')), tone: urgent ? 'warning' : 'default', context: urgent ? `${urgent} can’t wait` : items.length ? 'Nothing overdue' : 'All caught up', route: { page: 'my-requests' } };
    },
  },
  {
    id: 'requests',
    label: 'Open items',
    app: 'DART Central',
    read: (s, p) => {
      const rows = openItems(s, p).filter((m) => m.section !== 'closed');
      const needs = rows.filter((m) => m.section === 'needs').length;
      return { value: rows.length, segments: rows.map((m) => (m.section === 'needs' ? 'warning' : 'default')), tone: needs ? 'warning' : 'default', context: needs ? `${needs} need${needs === 1 ? 's' : ''} you` : 'Nothing waiting on you', route: { page: 'my-requests' } };
    },
  },
  {
    // How much the dashboards are USED — an application number, so it is the admins', not a business user's.
    id: 'views',
    label: 'DartBoards views',
    app: 'Admin',
    admin: true,
    read: (s) => {
      const dash = watched(s);
      const total = sumSeries(dash.map(viewsOf));
      const c = change4(total);
      return { value: (total[total.length - 1] ?? 0).toLocaleString(), tone: c < 0 ? 'error' : c > 0 ? 'success' : 'default', context: `${c > 0 ? '▲' : c < 0 ? '▼' : ''} ${Math.abs(c)}% · ${dash.length} dashboards`, route: { page: 'browse' } };
    },
  },
  {
    id: 'notices',
    label: 'Dashboards with a notice',
    app: 'DartBoards',
    read: (s) => {
      const dash = watched(s);
      const n = dash.filter((d) => flagOf(d)).length;
      return { value: n, segments: dash.map((d) => (flagOf(d) ? 'warning' : 'default')), tone: n ? 'warning' : 'default', context: n ? 'Known issues or retiring' : 'All clear', route: { page: 'browse' } };
    },
  },
  {
    id: 'controls',
    label: 'Controls complete',
    app: 'IRM',
    for: ['owner', 'governance'],
    read: (s, p) => {
      const owned = ownedReports(s, p);
      const pct = owned.length ? Math.round((owned.filter((r) => r.controls === 'complete').length / owned.length) * 100) : 100;
      const overdue = owned.filter((r) => r.controls === 'overdue').length;
      return { value: `${pct}%`, progress: pct, tone: overdue ? 'error' : 'default', context: overdue ? `${overdue} with overdue controls` : `Across ${owned.length} reports you own`, route: { page: 'irm-records' } };
    },
  },
  {
    id: 'recert',
    label: 'Reports to recertify',
    app: 'IRM',
    for: ['owner'],
    read: (s, p) => {
      const due = recertsDue(s, p);
      const past = due.filter((r) => evergreenState(r, s.irm.today) === 'past-due').length;
      // One block per report you own: the ones due coloured, so "1" reads as "1 of 5".
      const segments = ownedReports(s, p).map((r): Tone => (evergreenState(r, s.irm.today) === 'past-due' ? 'error' : evergreenState(r, s.irm.today) === 'due-soon' ? 'warning' : 'default'));
      return { value: due.length, segments, tone: past ? 'error' : 'default', context: past ? `${past} past due` : due.length ? `Next due ${fmtIso(due[0].evergreen.due)}` : 'All current', route: { page: 'irm-records' } };
    },
  },
  {
    id: 'attest',
    label: 'Controls to attest',
    app: 'IRM',
    read: (s, p) => {
      const due = controlsDue(s, p);
      const over = due.filter((d) => d.state === 'overdue').length;
      return { value: due.length, segments: due.map((d) => (d.state === 'overdue' ? 'error' : 'default')), tone: over ? 'error' : 'default', context: over ? `${over} overdue` : due.length ? 'Coming due' : 'Nothing due', route: { page: 'irm-records' } };
    },
  },
  {
    id: 'assigned',
    label: 'Assigned to you',
    app: 'IRM',
    for: ['developer'],
    read: (s, p) => {
      const mine = s.irm.changes.filter((c) => c.assigneeId === p && WORK_STATUSES.includes(c.status));
      const late = mine.filter((c) => isAged(c, s.irm.today, s.irm.workflows)).length;
      return { value: mine.length, tone: late ? 'warning' : 'default', context: late ? `${late} past SLA` : 'All within SLA', route: { page: 'irm-home' } };
    },
  },
  {
    id: 'unassigned',
    label: 'Unassigned requests',
    app: 'IRM',
    for: ['dev-manager'],
    read: (s) => {
      const n = s.irm.changes.filter((c) => WORK_STATUSES.includes(c.status) && !c.assigneeId).length;
      return { value: n, tone: 'default', context: n ? 'Ready for a developer' : 'Everything has an owner', route: { page: 'irm-board' } };
    },
  },
  {
    id: 'in-flight',
    label: 'In progress',
    app: 'IRM',
    for: IRM_WORK,
    read: (s) => ({ value: s.irm.changes.filter((c) => WORK_STATUSES.includes(c.status)).length, context: 'Across the team', route: { page: 'irm-board' } }),
  },
  {
    id: 'late',
    label: 'Requests past SLA',
    app: 'IRM',
    for: IRM_WORK,
    read: (s) => {
      const n = s.irm.changes.filter((c) => CHANGE_STATUS[c.status].active && isAged(c, s.irm.today, s.irm.workflows)).length;
      return { value: n, tone: n ? 'error' : 'default', context: n ? 'Running late' : 'All within SLA', route: { page: 'irm-activity' } };
    },
  },
  {
    id: 'to-ship',
    label: 'Awaiting deployment',
    app: 'IRM',
    for: ['prod-support', 'dev-manager'],
    read: (s) => {
      const ship = s.irm.changes.filter((c) => c.status === 'awaiting-deployment');
      const free = ship.filter((c) => !c.deployerId).length;
      return { value: ship.length, tone: 'default', context: `${free} unassigned`, route: { page: 'irm-deployments' } };
    },
  },
  {
    id: 'evidence',
    label: 'Evidence to review',
    app: 'IRM',
    for: ['governance'],
    read: (s) => {
      const n = s.irm.attestations.filter((a) => a.outcome === 'pending').length;
      return { value: n, tone: 'default', context: n ? 'Submitted, waiting on you' : 'Nothing waiting', route: { page: 'irm-governance' } };
    },
  },
  {
    id: 'past-due',
    label: 'Recertifications past due',
    app: 'IRM',
    for: ['governance'],
    read: (s) => {
      const live = s.irm.records.filter((r) => r.lifecycle === 'production' || r.lifecycle === 'retiring');
      const n = live.filter((r) => evergreenState(r, s.irm.today) === 'past-due').length;
      return { value: n, tone: n ? 'error' : 'default', context: n ? `${n} past due · of ${live.length} live` : `of ${live.length} live reports`, route: { page: 'irm-governance' } };
    },
  },
  {
    id: 'jira',
    label: 'Tickets assigned',
    app: 'Jira',
    read: (_s, p) => {
      const tickets = myJiraTickets(p);
      const blocked = tickets.filter((t) => t.status === 'Blocked').length;
      const urgent = tickets.filter(isUrgent).length;
      return { value: tickets.length, segments: tickets.map((t) => (t.status === 'Blocked' ? 'error' : 'default')), tone: blocked ? 'error' : 'default', context: blocked ? `${blocked} blocked · opens in Jira` : `${urgent} high priority · opens in Jira`, open: () => openInJira() };
    },
  },
  {
    id: 'admin-review',
    label: 'Waiting for review',
    app: 'Admin',
    admin: true,
    read: (s, p) => {
      const waiting = adminRequests(s, p).filter((r) => r.status === 'new' || r.status === 'needs-review');
      const fresh = waiting.filter((r) => r.status === 'new').length;
      return { value: waiting.length, tone: 'default', context: waiting.length ? `${fresh} new, ${waiting.length - fresh} in review` : 'The queue is clear', route: { page: 'admin-queue' } };
    },
  },
  {
    id: 'admin-reply',
    label: 'Waiting on requesters',
    app: 'Admin',
    admin: true,
    read: (s, p) => {
      const n = adminRequests(s, p).filter((r) => r.status === 'awaiting-reply').length;
      return { value: n, context: n ? 'You asked; they haven’t answered' : 'No open questions', route: { page: 'admin-queue' } };
    },
  },
  {
    id: 'admin-apply',
    label: 'Approved, not applied',
    app: 'Admin',
    admin: true,
    read: (s, p) => {
      const n = adminRequests(s, p).filter((r) => r.status === 'approved-not-applied').length;
      return { value: n, tone: n ? 'warning' : 'default', context: n ? 'Approved but not live yet' : 'Everything approved is live', route: { page: 'admin-queue' } };
    },
  },
  {
    id: 'admin-listings',
    label: 'Dashboards in review',
    app: 'Admin',
    admin: true,
    read: (s) => {
      const n = s.dashboards.filter((d) => d.lifecycle === 'under-review').length;
      return { value: n, context: n ? 'Listings waiting to publish' : 'Nothing in review', route: { page: 'admin-dashboards' } };
    },
  },
  {
    id: 'admin-banners',
    label: 'Banners live',
    app: 'Admin',
    admin: true,
    read: (s) => {
      const live = s.banners.filter((b) => b.state === 'active').length;
      const next = s.banners.filter((b) => b.state === 'scheduled').length;
      return { value: live, context: `${next} scheduled`, route: { page: 'admin-banners' } };
    },
  },
  {
    id: 'admin-promotions',
    label: 'Promotions running',
    app: 'Admin',
    admin: true,
    read: (s) => {
      const live = s.promotions.filter((p) => p.state === 'active').length;
      const next = s.promotions.filter((p) => p.state === 'scheduled').length;
      return { value: live, context: `${next} scheduled`, route: { page: 'admin-promotions' } };
    },
  },
];

export const TODAY_MAX = 8;

/**
 * A development manager who is also an admin (Alex Rivera runs DART Central's request queue) trades "in
 * flight" for the queue: in flight is the number least likely to change what they do next, and the
 * requests waiting on an admin are the other half of their job.
 */
const defaultToday = (audience: Audience, isAdmin: boolean) =>
  audience === 'dev-manager' && isAdmin ? ['unassigned', 'admin-review', 'late', 'to-ship'] : DEFAULT_TODAY[audience];

const DEFAULT_TODAY: Record<Audience, string[]> = {
  // Each role's four numbers (owner, 2026-10-06). "Needs your attention" is not one of them: the greeting
  // says how many things need you and Next up names the first, so a tile repeating it was noise.
  // A business owner's numbers are on the board (their space card, right below), so Today does not repeat
  // them: it holds the health of the reports they own and what they are waiting on.
  owner: ['recert', 'controls', 'attest', 'notices'],
  reader: ['metric:m-roll-rate', 'metric:m-cure-rate', 'metric:m-ptp-kept', 'notices'],
  // A developer's own late work is on the Assigned tile; the team-wide past-SLA count beside it disagreed.
  developer: ['assigned', 'jira', 'to-ship', 'requests'],
  'dev-manager': ['unassigned', 'in-flight', 'late', 'to-ship'],
  // Their past-SLA count is the deployments card's; a team-wide one beside it read as a different answer.
  'prod-support': ['to-ship', 'notices', 'jira', 'requests'],
  // "Controls complete" counts reports you own; governance owns none, so it read 100% of 0. Known issues instead.
  governance: ['evidence', 'past-due', 'late', 'notices'],
};

/**
 * A business metric from DartBoards' marketplace, pinned to Today: its current value, and the change its
 * owner reports beside it. The change is NOT coloured — whether "down" is good depends on the metric
 * (a falling roll rate is good news), and the asset does not say.
 */
const metricEntry = (a: Asset): TodayMetric => ({
  id: `metric:${a.id}`,
  label: a.name,
  app: 'Metrics',
  read: () => {
    const [value, ...rest] = a.glance.split(' · ');
    return { value, context: rest.length ? `${rest.join(' · ')} · ${a.updatedAt}` : `Updated ${a.updatedAt}`, route: { page: 'metric', id: a.id }, trend: glanceTrend(a.glance, a.id) };
  },
});

/** Every number Today can show: the fixed ones, and one per metric in the marketplace. */
export const allTodayMetrics = (state: SuiteState) => [...TODAY_METRICS, ...state.assets.filter((a) => a.kind === 'metric').map(metricEntry)];
const findMetric = (state: SuiteState, id: string) => allTodayMetrics(state).find((m) => m.id === id);
/** Safe in a DOM id: a metric's id carries a colon. */
const domId = (id: string) => id.replace(/[^a-z0-9-]/gi, '-');

const metricsFor = (state: SuiteState, audience: Audience, isAdmin: boolean) => allTodayMetrics(state).filter((m) => (!m.for || m.for.includes(audience)) && (!m.admin || isAdmin));

export function Today() {
  const { state, setHomeToday } = useSuite();
  const { person } = useSignedIn();
  const { go } = useNav();
  const [editing, setEditing] = useState(false);
  const audience = audienceOf(state, person.id);
  const isAdmin = !!adminOf(state, person.id);
  const chosen = (state.homeToday[person.id] ?? defaultToday(audience, isAdmin)).map((id) => findMetric(state, id)).filter((m): m is TodayMetric => !!m && (!m.admin || isAdmin));
  const values = chosen.map((m) => m.read(state, person.id));
  // Drag a tile onto another to put it there (native drag and drop, no library). The arrows in Edit Today
  // are the keyboard route to the same thing.
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const dropOn = (targetId: string) => {
    if (!dragging || dragging === targetId) return;
    const ids = chosen.map((m) => m.id).filter((id) => id !== dragging);
    ids.splice(ids.indexOf(targetId) + (chosen.findIndex((m) => m.id === dragging) < chosen.findIndex((m) => m.id === targetId) ? 1 : 0), 0, dragging);
    setHomeToday(person.id, ids);
  };
  const endDrag = () => {
    setDragging(null);
    setOver(null);
  };
  // The suite's one clock (IRM's), so Home and IRM never disagree about today.
  const [y, mo, da] = state.irm.today.split('-').map(Number);
  const date = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date(y, mo - 1, da));

  return (
    <Section
      id="ds-today"
      heading="Today"
      className="ds-today"
      actions={
        <Stack level={4} direction="horizontal" align="center">
          <Text as="span" size="sm" tone="muted">
            {date}
          </Text>
          <Button id="ds-today-edit" style="ghost" size="sm" label="Edit Today" IconLeft={Pencil} onClick={() => setEditing(true)} />
        </Stack>
      }
    >
      {chosen.length ? (
        // A strip with a sparkline in it keeps room for the chart; without one the numbers take that room instead.
        <div className={`ds-today__tiles${values.some((v) => v.trend) ? ' ds-today__tiles--charts' : ''}`}>
          {chosen.map((m, i) => {
            const v = values[i];
            return (
              <button
                key={m.id}
                id={`ds-today-${domId(m.id)}`}
                type="button"
                className={`ds-today-tile${dragging === m.id ? ' ds-today-tile--dragging' : ''}${over === m.id && dragging && dragging !== m.id ? ' ds-today-tile--over' : ''}`}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.effectAllowed = 'move';
                  e.dataTransfer.setData('text/plain', m.id);
                  setDragging(m.id);
                }}
                onDragOver={(e) => {
                  if (!dragging) return;
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  if (over !== m.id) setOver(m.id);
                }}
                onDragLeave={() => over === m.id && setOver(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  dropOn(m.id);
                  endDrag();
                }}
                onDragEnd={endDrag}
                onClick={() => (v.open ? v.open() : v.route && go(v.route))}
              >
                <span className="ds-today-tile__label">
                  <span>{m.label}</span>
                  {APP_TAG[m.app] && (
                    // Beside the name, always. When tiles are narrow the tag is the app's icon alone (the
                    // rail's icon, so it still says which app) and the name keeps the room it needs.
                    <>
                      <Badge id={`ds-today-${domId(m.id)}-app`} className="ds-today-tag ds-today-tag--full" label={APP_TAG[m.app]!.label} color={APP_TAG[m.app]!.color} appearance="soft" IconLeft={APP_TAG[m.app]!.Icon} />
                      <Badge
                        id={`ds-today-${domId(m.id)}-app-icon`}
                        className="ds-today-tag ds-today-tag--icon"
                        role="img"
                        aria-label={APP_TAG[m.app]!.label}
                        title={APP_TAG[m.app]!.label}
                        color={APP_TAG[m.app]!.color}
                        appearance="soft"
                        IconCenter={APP_TAG[m.app]!.Icon}
                      />
                    </>
                  )}
                </span>
                <span className="ds-today-tile__value">{v.value}</span>
                {/* The picture slot: every tile has one, so numbers and detail lines line up across the row. */}
                <span className="ds-today-tile__visual">
                  {v.trend ? (
                    <Sparkline id={`ds-today-${domId(m.id)}-trend`} label={`${m.label}, last 12 periods`} data={v.trend} variant="area" height={28} />
                  ) : v.progress !== undefined ? (
                    <span className="ds-kpi__bar" aria-hidden="true">
                      <span className={`ds-kpi__fill ds-kpi__fill--${v.tone ?? 'default'}`} style={{ width: `${v.progress}%` }} />
                    </span>
                  ) : v.segments?.length ? (
                    <span className="ds-today-segments" aria-hidden="true">
                      {v.segments.slice(0, 24).map((t, i) => (
                        <span key={i} className={`ds-today-segments__item ds-today-segments__item--${t}`} />
                      ))}
                    </span>
                  ) : null}
                </span>
                <span className={`ds-today-tile__context${v.tone && v.tone !== 'default' ? ` ds-tone--${v.tone}` : ''}`}>{v.context}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <Text size="sm" tone="muted">
          Nothing chosen for Today. Use Edit Today to pick the numbers you want here.
        </Text>
      )}
      <TodayPicker
        open={editing}
        onClose={() => setEditing(false)}
        audience={audience}
        value={chosen.map((m) => m.id)}
        onChange={(ids) => setHomeToday(person.id, ids)}
        onReset={() => setHomeToday(person.id, null)}
      />
    </Section>
  );
}

/** Choose what Today shows, and in what order. */
function TodayPicker({
  open,
  onClose,
  audience,
  value,
  onChange,
  onReset,
}: {
  open: boolean;
  onClose: () => void;
  audience: Audience;
  value: string[];
  onChange: (ids: string[]) => void;
  onReset: () => void;
}) {
  const { state } = useSuite();
  const { person } = useSignedIn();
  const all = metricsFor(state, audience, !!adminOf(state, person.id));
  // Business metrics sit right after the hub's own numbers; usage and admin numbers come last.
  const ORDER: TodayApp[] = ['DART Central', 'Metrics', 'DartBoards', 'IRM', 'Jira', 'Admin'];
  const apps = ORDER.filter((app) => all.some((m) => m.app === app));
  const toggle = (id: string, on: boolean) => onChange(on ? [...value, id].slice(0, TODAY_MAX) : value.filter((x) => x !== id));
  const move = (id: string, by: number) => {
    const i = value.indexOf(id);
    const j = i + by;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const full = value.length >= TODAY_MAX;
  return (
    <Drawer id="ds-today-picker" open={open} onClose={onClose}>
      <DrawerHeader id="ds-today-picker-header" title="Edit Today" description={`Pick up to ${TODAY_MAX} numbers. They show four to a row, in this order — or drag the tiles on Home to reorder them.`} onClose={onClose} />
      <DrawerBody>
        <Stack level={2}>
          {value.length > 0 && (
            <Section id="ds-today-order" heading="Showing" variant="group" headingLevel="h3">
              <ol className="ds-today-order">
                {value.map((id, i) => {
                  const m = findMetric(state, id);
                  if (!m) return null;
                  return (
                    <li key={id} className="ds-today-order__row">
                      <Text as="span" size="sm" weight="medium">{`${i + 1}. ${m.label}`}</Text>
                      <Stack level={5} direction="horizontal">
                        <Button id={`ds-today-up-${domId(id)}`} style="ghost" size="xs" iconOnly IconCenter={ArrowUp} aria-label={`Move ${m.label} earlier`} disabled={i === 0} onClick={() => move(id, -1)} />
                        <Button id={`ds-today-down-${domId(id)}`} style="ghost" size="xs" iconOnly IconCenter={ArrowDown} aria-label={`Move ${m.label} later`} disabled={i === value.length - 1} onClick={() => move(id, 1)} />
                      </Stack>
                    </li>
                  );
                })}
              </ol>
            </Section>
          )}
          {apps.map((app) => (
            <Section key={app} id={`ds-today-app-${app.replace(/\s+/g, '-').toLowerCase()}`} heading={app === 'Metrics' ? 'DartBoards metrics' : app} variant="group" headingLevel="h3">
              <Stack level={4}>
                {all
                  .filter((m) => m.app === app)
                  .map((m) => {
                    const on = value.includes(m.id);
                    const v = m.read(state, person.id);
                    return (
                      <div key={m.id} className="ds-today-pick">
                        <Checkbox id={`ds-today-pick-${domId(m.id)}`} label={m.label} description={v.context} checked={on} disabled={!on && full} onCheckedChange={(c) => toggle(m.id, !!c)} />
                        <Badge id={`ds-today-pick-${domId(m.id)}-now`} label={String(v.value)} color="default" appearance="soft" />
                      </div>
                    );
                  })}
              </Stack>
            </Section>
          ))}
        </Stack>
      </DrawerBody>
      <DrawerFooter>
        <Button id="ds-today-reset" style="ghost" label="Reset to default" onClick={onReset} />
        <Button id="ds-today-done" label="Done" onClick={onClose} />
      </DrawerFooter>
    </Drawer>
  );
}

