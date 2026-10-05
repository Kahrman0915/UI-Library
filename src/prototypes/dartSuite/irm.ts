/* ── DART Suite prototype · IRM, as DartBoards sees it ─────────────────────────
   IRM is where a report is BUILT and CONTROLLED: requirements, development,
   access and controls live there for the report's whole life, under its IRM
   number. DART Central never edits any of that. It only asks for a finished
   report to be SHOWN in DartBoards — published, its listing (title and
   description) changed, or unpublished.

   So a DartBoards dashboard is a LISTING of an IRM record: it carries the IRM
   number for traceability and its own display title, because IRM names always
   start with the number and nobody wants "IRM-20431 Servicing SLA v3" in Browse.

   IRM is not built in this prototype; these records stand in for what its API
   would return. */

import type { Dashboard } from './types';

export type IrmControls = 'complete' | 'pending' | 'overdue';

export type IrmRecord = {
  /** Always starts the IRM name. */
  number: string;
  /** The name as IRM holds it — number first. */
  name: string;
  developer: string;
  businessOwner: string;
  source: Dashboard['source'];
  accessGroup: string;
  controls: IrmControls;
  lastReviewed: string;
};

export const CONTROLS: Record<IrmControls, { label: string; color: 'success' | 'warning' | 'error' }> = {
  complete: { label: 'Controls complete', color: 'success' },
  pending: { label: 'Controls pending sign-off', color: 'warning' },
  overdue: { label: 'Control review overdue', color: 'error' },
};

const hash = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

/** Finished reports in IRM that are NOT in DartBoards yet — what a publish request picks from. */
export const IRM_UNPUBLISHED: IrmRecord[] = [
  { number: 'IRM-20512', name: 'IRM-20512 Originations Daily Volume v1', developer: 'Jordan Mount', businessOwner: 'Priya Raman', source: 'Tableau', accessGroup: 'ORIG_READERS', controls: 'complete', lastReviewed: 'Sep 22, 2026' },
  { number: 'IRM-20577', name: 'IRM-20577 Hardship Program Tracker v2', developer: 'Sam Okafor', businessOwner: 'Jordan Lee', source: 'Power BI', accessGroup: 'COLL_HARDSHIP', controls: 'complete', lastReviewed: 'Sep 18, 2026' },
  { number: 'IRM-20603', name: 'IRM-20603 Fraud Alerts Monitor v1', developer: 'Dana Wu', businessOwner: 'Maya Hart', source: 'Tableau', accessGroup: 'FRAUD_OPS', controls: 'pending', lastReviewed: '—' },
  { number: 'IRM-20618', name: 'IRM-20618 Recoveries Weekly Pack v1', developer: 'Jordan Mount', businessOwner: 'Jordan Lee', source: 'DART', accessGroup: 'COLL_ALL', controls: 'complete', lastReviewed: 'Sep 25, 2026' },
];

/** The IRM record behind a DartBoards listing. Derived for seed dashboards; exact for ones published from an IRM record. */
export function irmFor(d: Dashboard): IrmRecord {
  const known = d.irm ? IRM_UNPUBLISHED.find((r) => r.number === d.irm) : undefined;
  if (known) return known;
  const n = d.irm ?? `IRM-${20000 + (hash(d.id) % 900)}`;
  const h = hash(d.id);
  return {
    number: n,
    name: `${n} ${d.name} v${1 + (h % 3)}`,
    developer: ['Jordan Mount', 'Sam Okafor', 'Dana Wu'][h % 3],
    businessOwner: d.owner,
    source: d.source,
    accessGroup: `${d.category.toUpperCase()}_${d.hasAccess ? 'ALL' : 'RESTRICTED'}`,
    // A couple are overdue, so the status reads as something that can go wrong.
    controls: h % 7 === 0 ? 'overdue' : 'complete',
    lastReviewed: h % 7 === 0 ? 'Mar 3, 2026' : 'Aug 28, 2026',
  };
}

/** "IRM-20512 Originations Daily Volume v1" → "Originations Daily Volume": the number and version are IRM's, not the reader's. */
export const displayTitleFrom = (irmName: string) =>
  irmName
    .replace(/^IRM-\d+\s*/, '')
    .replace(/\s+v\d+$/i, '')
    .trim();

/** Where "Open IRM record" goes. IRM is not in the prototype, so this is a placeholder. */
export const irmUrl = (number: string) => `https://irm.example.com/records/${number}`;
