/* Browse · the filter facets (B3.2) and the sort orders (B3.1). */

import type { Dashboard } from '../../../types';
import { updatedOn } from '../shared/boardsShared';

export type FacetId = 'category' | 'tags' | 'access' | 'source' | 'owner';

export type Facet = { id: FacetId; label: string; group: 'Content' | 'Access' | 'Metadata'; values: (d: Dashboard) => string[] };

export const FACETS: Facet[] = [
  { id: 'category', label: 'Category', group: 'Content', values: (d) => [d.category] },
  { id: 'tags', label: 'Tags', group: 'Content', values: (d) => (d.tags.length ? d.tags : ['Untagged']) },
  { id: 'access', label: 'Access', group: 'Access', values: (d) => [d.hasAccess ? 'Open to you' : 'Request needed'] },
  { id: 'source', label: 'Data source', group: 'Metadata', values: (d) => [d.source] },
  { id: 'owner', label: 'Owner', group: 'Metadata', values: (d) => [d.owner] },
];

export type Filters = Partial<Record<FacetId, string[]>>;

export const appliedCount = (f: Filters) => Object.values(f).reduce((n, v) => n + (v?.length ?? 0), 0);

/** Every facet must match (AND across facets), any value within a facet (OR). */
export const matches = (d: Dashboard, f: Filters, except?: FacetId) =>
  FACETS.every((facet) => {
    if (facet.id === except) return true;
    const want = f[facet.id];
    return !want?.length || facet.values(d).some((v) => want.includes(v));
  });

/** The options of a facet over a set of dashboards, most common first. */
export const optionsOf = (facet: Facet, list: Dashboard[]) => {
  const seen = new Map<string, number>();
  list.forEach((d) => facet.values(d).forEach((v) => seen.set(v, (seen.get(v) ?? 0) + 1)));
  return [...seen.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([v]) => v);
};

export type SortId = 'most-used' | 'recently-updated' | 'name-asc' | 'name-desc' | 'newest' | 'oldest';

export const SORTS: { id: SortId; label: string; short: string }[] = [
  { id: 'most-used', label: 'Most Used', short: 'Most used' },
  { id: 'recently-updated', label: 'Recently Updated', short: 'Recently updated' },
  { id: 'name-asc', label: 'Name (A-Z)', short: 'Name A–Z' },
  { id: 'name-desc', label: 'Name (Z-A)', short: 'Name Z–A' },
  { id: 'newest', label: 'Newest First', short: 'Newest' },
  { id: 'oldest', label: 'Oldest First', short: 'Oldest' },
];

/** Sort a copy. The catalog's order is the order dashboards were published, oldest first. */
export const sortDashboards = (list: Dashboard[], catalog: Dashboard[], sort: SortId) => {
  const pos = (d: Dashboard) => catalog.findIndex((x) => x.id === d.id);
  const out = [...list];
  switch (sort) {
    case 'most-used':
      return out.sort((a, b) => b.views - a.views);
    case 'recently-updated':
      return out.sort((a, b) => updatedOn(b).getTime() - updatedOn(a).getTime());
    case 'name-asc':
      return out.sort((a, b) => a.name.localeCompare(b.name));
    case 'name-desc':
      return out.sort((a, b) => b.name.localeCompare(a.name));
    case 'newest':
      return out.sort((a, b) => pos(b) - pos(a));
    case 'oldest':
      return out.sort((a, b) => pos(a) - pos(b));
  }
};
