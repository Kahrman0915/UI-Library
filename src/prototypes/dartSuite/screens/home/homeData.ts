/* DART Central · Home — the data the widgets and Today read. Computed live from
   the suite's state, so Home can never disagree with the screens it points at. */

import { seriesFor } from '../../data';
import { audienceOf, irmGroup, myIrmChanges, reportChangeRoute } from '../../hub';
import { CHANGE_STATUS, controlState, evergreenState } from '../../irm';
import type { IrmControl, IrmRecord } from '../../irm';
import type { SuiteState } from '../../store';
import type { Dashboard, Route } from '../../types';
import { statusFor } from '../requests/shared';

export const WEEKS = Array.from({ length: 12 }, (_, i) => `Week ${i + 1}`);

/** The dashboards on a person's own spaces — what they watch. */
export const watched = (state: SuiteState): Dashboard[] => {
  const ids = [...new Set(state.spaces.filter((s) => !s.shared).flatMap((s) => s.items.map((i) => i.dashboardId).filter((x): x is string => !!x)))];
  return ids.map((id) => state.dashboards.find((d) => d.id === id)).filter((d): d is Dashboard => !!d && d.lifecycle === 'published');
};

/** Change of the last 4 weeks against the 4 before, in whole percent. */
export const change4 = (s: number[]) => {
  const now = s.slice(-4).reduce((a, b) => a + b, 0);
  const before = s.slice(-8, -4).reduce((a, b) => a + b, 0);
  return before ? Math.round(((now - before) / before) * 100) : 0;
};

export const sumSeries = (all: number[][]) => WEEKS.map((_, i) => all.reduce((t, s) => t + (s[i] ?? 0), 0));

export const viewsOf = (d: Dashboard) => seriesFor(d.id, 12);

/** A dashboard's notice, in two words — or none. */
export const flagOf = (d: Dashboard) => (d.retiring ? 'Retiring' : d.irmFlags?.incident ? 'Known issue' : d.irmFlags?.controlsOverdue ? 'Review overdue' : undefined);

export type OpenRequest = { id: string; title: string; app: string; status: string; group: string; route: Route };

/** A person's open requests across every application, waiting-on-you first. */
export function openRequests(state: SuiteState, personId: string): OpenRequest[] {
  const audience = audienceOf(state, personId);
  return [
    ...state.requests
      .filter((r) => r.requesterId === personId)
      .map((r) => ({ id: r.id, title: r.title, app: r.type.startsWith('dashboard') ? 'DartBoards' : 'DART Central', status: statusFor(r).label, group: statusFor(r).group, route: { page: 'request-detail', id: r.id } as Route })),
    ...myIrmChanges(state, personId).map((c) => ({ id: c.id, title: c.title, app: 'IRM', status: CHANGE_STATUS[c.status].label, group: irmGroup(c), route: reportChangeRoute(audience, c.id) })),
  ]
    .filter((r) => r.group !== 'done')
    .sort((a, b) => Number(b.group === 'reply') - Number(a.group === 'reply'));
}

/** The live reports a person owns in IRM. */
export const ownedReports = (state: SuiteState, personId: string) => state.irm.records.filter((r) => r.businessOwnerId === personId && r.lifecycle !== 'retired');

/** Owned reports whose recertification is due soon or past due, most urgent first. */
export const recertsDue = (state: SuiteState, personId: string) =>
  ownedReports(state, personId)
    .filter((r) => evergreenState(r, state.irm.today) !== 'current')
    .sort((a, b) => a.evergreen.due.localeCompare(b.evergreen.due));

export type ControlDue = { record: IrmRecord; control: IrmControl; state: ReturnType<typeof controlState> };

/** Controls this person attests for, on live reports, that are not plainly fine — overdue first. */
export function controlsDue(state: SuiteState, personId: string): ControlDue[] {
  const today = state.irm.today;
  const rank = { overdue: 0, pending: 1, 'due-soon': 2, 'in-review': 3, ok: 4 } as const;
  return state.irm.records
    .filter((r) => r.lifecycle !== 'retired')
    .flatMap((record) =>
      record.controlItems
        .filter((c) => c.ownerId === personId || (record.businessOwnerId === personId && c.kind !== 'data-quality'))
        .map((control) => ({ record, control, state: controlState(control, today, state.irm.attestations.some((a) => a.controlId === control.id && a.outcome === 'pending')) })),
    )
    .filter((x) => x.state !== 'ok')
    .sort((a, b) => rank[a.state] - rank[b.state] || a.control.due.localeCompare(b.control.due));
}

/** A value as the library writes it ("3.4%", "68%", "2h 14m"), as a number (minutes for a time). */
const parseMetricValue = (v: string) => {
  const t = v.match(/(\d+)h\s*(\d+)m/);
  return t ? +t[1] * 60 + +t[2] : parseFloat(v) || 0;
};

const hash = (s: string) => [...s].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) | 0, 7);
const noise = (key: string, i: number) => {
  const x = Math.sin(hash(key) + i * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

/**
 * A metric's recent shape, from the one line the library holds for it ("3.4% · down 0.4 pts"): `n` points
 * that end on the previous value and the value now, so the line finishes where the number says.
 * Generated — the prototype has no metrics API — but always consistent with the number beside it.
 */
export function glanceTrend(glance: string, key: string, n = 12): number[] {
  const [v, change = ''] = glance.split(' · ');
  const now = parseMetricValue(v);
  const m = change.match(/(up|down)\s+([\d.]+)/);
  const prev = now - (m ? +m[2] * (m[1] === 'up' ? 1 : -1) : 0);
  // A gentle drift into the previous value, not independent noise — a flat metric should look flat.
  const start = prev * (0.96 + noise(key, 0) * 0.08);
  const walk = Array.from({ length: n - 2 }, (_, i) => start + ((prev - start) * i) / (n - 2) + prev * (noise(key, i + 1) - 0.5) * 0.03);
  return [...walk.map((v) => +v.toFixed(2)), prev, now];
}
