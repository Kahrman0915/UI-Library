/* The Builder's library filters — ONE registry for every kind of thing a space
   can hold (owner, 2026-10-01).

   Some filters mean the same thing for everything (subject, owner, source);
   some only exist for one kind (a metric's grain, a report's cadence, a
   workflow's "assigned to me"). Each facet says which kinds it applies to:

   - On ALL, only the shared facets show — which is what keeps All usable.
   - Narrowed to one kind, that kind's facets appear under its own heading.
   - Switching kinds keeps the shared filters. A kind-specific filter is PARKED,
     not deleted: it stops filtering, is listed as "metrics only", and comes back
     when you return to that kind.

   SUBJECT is the facet that matters most: it is what brings a metric, its
   dashboards, its workflow and its report back together. */

import type { SuiteState } from '../../../store';
import type { Dashboard } from '../../../types';
import type { LibraryKind } from './panels';

export type FacetFilters = Record<string, string[]>;

export type FacetDef = {
  id: string;
  label: string;
  /** `all` = shared by every kind. */
  appliesTo: LibraryKind[] | 'all';
};

export const FACET_DEFS: FacetDef[] = [
  { id: 'subject', label: 'Subject', appliesTo: 'all' },
  { id: 'owner', label: 'Owner', appliesTo: 'all' },
  { id: 'source', label: 'Source', appliesTo: 'all' },
  { id: 'delivery', label: 'Shown as', appliesTo: ['dashboard'] },
  { id: 'from', label: 'From dashboard', appliesTo: ['widget'] },
  { id: 'grain', label: 'Grain', appliesTo: ['metric'] },
  { id: 'breakdown', label: 'Can break down by', appliesTo: ['metric'] },
  { id: 'certified', label: 'Certification', appliesTo: ['metric'] },
  { id: 'cadence', label: 'Cadence', appliesTo: ['report'] },
  { id: 'audience', label: 'Audience', appliesTo: ['report'] },
  { id: 'assigned', label: 'Assigned', appliesTo: ['workflow'] },
  { id: 'overdue', label: 'Overdue', appliesTo: ['workflow'] },
];

export const appliesTo = (f: FacetDef, kind: LibraryKind | undefined) => f.appliesTo === 'all' || (!!kind && f.appliesTo.includes(kind));

/** The facets on screen for a scope: shared, then the kind's own. */
export const facetsFor = (kind: LibraryKind | undefined) => FACET_DEFS.filter((f) => appliesTo(f, kind));

/** Applied values that do not filter in this scope — kept, shown as parked. */
export const parkedIn = (filters: FacetFilters, kind: LibraryKind | undefined) =>
  FACET_DEFS.filter((f) => !appliesTo(f, kind) && filters[f.id]?.length).map((f) => ({ def: f, values: filters[f.id] }));

/** Every applied filter that applies to this entry's kind must match (AND across facets, OR within one). */
export const matchesFacets = (entry: { kind: LibraryKind; facets: Record<string, string[]> }, filters: FacetFilters, scope: LibraryKind | undefined) =>
  FACET_DEFS.every((f) => {
    const want = filters[f.id];
    if (!want?.length || !appliesTo(f, scope)) return true; // parked, or nothing chosen
    if (f.appliesTo !== 'all' && !f.appliesTo.includes(entry.kind)) return true;
    return (entry.facets[f.id] ?? []).some((v) => want.includes(v));
  });

export const facetCount = (filters: FacetFilters, kind: LibraryKind | undefined) =>
  facetsFor(kind).reduce((n, f) => n + (filters[f.id]?.length ?? 0), 0);

/* ── Subject ──────────────────────────────────────────────────────────────── */

const SUITE_SHORT: Record<string, string> = { collections: 'Collections', servicing: 'Servicing', risk: 'Credit risk', growth: 'Revenue' };

/** A dashboard's subject: set on it, else its suite section (not "Start here"), else its category. */
export function subjectOf(state: SuiteState, d: Dashboard): string {
  if (d.subject) return d.subject;
  for (const s of state.suites) {
    const sec = s.sections.find((x) => x.id !== s.startSectionId && x.dashboardIds.includes(d.id));
    if (sec) return `${SUITE_SHORT[s.id] ?? s.name} › ${sec.name.replace(/\s*\(.*\)$/, '')}`;
  }
  return d.category;
}
