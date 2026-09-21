/* Browse B3.2 · the faceted filter drawer (Pattern/FilterDrawer).

   - A search at the top matches OPTION labels across every facet.
   - The applied set sits beneath it as FilterTags (mirrors B3.3).
   - Facets in three labeled groups (Content / Access / Metadata), each option
     with a COUNT, so nobody picks an option with zero results.
   - A facet with something applied opens with a count badge; untouched ones
     stay closed. "Show all N" past five options.
   - The footer COMMITS: nothing filters until "Show N results". */

import { useEffect, useMemo, useState } from 'react';
import { ChevronsUpDown, Search } from 'lucide-react';
import Badge from '../../../../../components/Badge';
import Button from '../../../../../components/Button';
import Checkbox from '../../../../../components/Checkbox';
import Collapsible, { CollapsibleContent, CollapsibleTrigger } from '../../../../../components/Collapsible';
import Drawer, { DrawerBody, DrawerFooter, DrawerHeader } from '../../../../../components/Drawer';
import FilterTag, { FilterTagGroup } from '../../../../../components/FilterTag';
import Input from '../../../../../components/Input';
import Separator from '../../../../../components/Separator';
import type { Dashboard } from '../../../types';
import { FACETS, appliedCount, matches, optionsOf } from './facets';
import type { Facet, FacetId, Filters } from './facets';

const SHOW = 5;
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');

type Props = {
  open: boolean;
  onClose: () => void;
  /** The library after the page's search — the set the counts are taken over. */
  base: Dashboard[];
  /** The library size before search, for the subtitle. */
  total: number;
  applied: Filters;
  onApply: (f: Filters) => void;
};

export function FilterDrawer({ open, onClose, base, total, applied, onApply }: Props) {
  const [draft, setDraft] = useState<Filters>(applied);
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<Partial<Record<FacetId, boolean>>>({});
  const [showAll, setShowAll] = useState<Partial<Record<FacetId, boolean>>>({});

  // Every opening starts from what is applied now.
  useEffect(() => {
    if (!open) return;
    setDraft(applied);
    setQuery('');
    setShowAll({});
    setExpanded(Object.fromEntries(FACETS.map((f) => [f.id, !!applied[f.id]?.length])));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const results = useMemo(() => base.filter((d) => matches(d, draft)).length, [base, draft]);
  const n = appliedCount(draft);
  const q = query.trim().toLowerCase();

  const toggle = (facet: FacetId, value: string) =>
    setDraft((f) => {
      const cur = f[facet] ?? [];
      const next = cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value];
      return { ...f, [facet]: next };
    });

  const countFor = (facet: Facet, value: string) =>
    base.filter((d) => matches(d, draft, facet.id) && facet.values(d).includes(value)).length;

  const groups = ['Content', 'Access', 'Metadata'] as const;

  return (
    <Drawer id="ds-browse-filters" open={open} onClose={onClose} side="right">
      <DrawerHeader
        id="ds-browse-filters-header"
        title="Filters"
        description={`${n} applied · ${results} of ${total} dashboards`}
        onClose={onClose}
      />
      <DrawerBody>
        <div className="ds-browse-facets">
          <Input
            id="ds-browse-filters-search"
            size="sm"
            placeholder="Search all filters…"
            IconLeft={Search}
            value={query}
            onValueChange={setQuery}
            aria-label="Search all filters"
          />

          {n > 0 && (
            <FilterTagGroup id="ds-browse-filters-active" label="Active filters" size="sm">
              {FACETS.flatMap((facet) =>
                (draft[facet.id] ?? []).map((v) => (
                  <FilterTag
                    key={`${facet.id}-${v}`}
                    id={`ds-browse-filters-tag-${facet.id}-${slug(v)}`}
                    size="sm"
                    label={`${facet.label}: ${v}`}
                    onRemove={() => toggle(facet.id, v)}
                  />
                )),
              )}
            </FilterTagGroup>
          )}

          {groups.map((group) => {
            const facets = FACETS.filter((f) => f.group === group);
            const shown = facets
              .map((facet) => ({ facet, options: optionsOf(facet, base).filter((o) => !q || o.toLowerCase().includes(q)) }))
              .filter((x) => x.options.length > 0);
            if (!shown.length) return null;
            return (
              <div key={group} className="ds-browse-facet-group">
                <Separator label={group} />
                {shown.map(({ facet, options }) => {
                  const picked = draft[facet.id] ?? [];
                  const isOpen = !!q || !!expanded[facet.id];
                  const long = !q && options.length > SHOW && !showAll[facet.id];
                  const list = long ? options.slice(0, SHOW) : options;
                  return (
                    <Collapsible
                      key={facet.id}
                      id={`ds-browse-facet-${facet.id}`}
                      className="ds-browse-facet"
                      open={isOpen}
                      onOpenChange={(o) => setExpanded((e) => ({ ...e, [facet.id]: o }))}
                    >
                      <CollapsibleTrigger>
                        <button type="button" className="ds-browse-facet__trigger">
                          <span className="ds-browse-facet__label">{facet.label}</span>
                          {picked.length > 0 && (
                            <Badge id={`ds-browse-facet-${facet.id}-count`} label={String(picked.length)} color="info" appearance="soft" />
                          )}
                          <ChevronsUpDown aria-hidden="true" className="ds-browse-facet__chevron" />
                        </button>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <ul className="ds-browse-facet__options">
                          {list.map((o) => {
                            const c = countFor(facet, o);
                            return (
                              <li key={o} className="ds-browse-facet__option">
                                <Checkbox
                                  id={`ds-browse-opt-${facet.id}-${slug(o)}`}
                                  size="sm"
                                  label={o}
                                  checked={picked.includes(o)}
                                  disabled={c === 0 && !picked.includes(o)}
                                  onCheckedChange={() => toggle(facet.id, o)}
                                />
                                <span className="ds-browse-facet__count">{c}</span>
                              </li>
                            );
                          })}
                        </ul>
                        {long && (
                          <Button
                            id={`ds-browse-facet-${facet.id}-all`}
                            style="link"
                            size="sm"
                            label={`Show all ${options.length}`}
                            onClick={() => setShowAll((s) => ({ ...s, [facet.id]: true }))}
                          />
                        )}
                      </CollapsibleContent>
                    </Collapsible>
                  );
                })}
              </div>
            );
          })}

          {q && FACETS.every((f) => !optionsOf(f, base).some((o) => o.toLowerCase().includes(q))) && (
            <p className="ds-muted">No filter options match “{query}”.</p>
          )}
        </div>
      </DrawerBody>
      <DrawerFooter>
        <Button id="ds-browse-filters-clear" style="ghost" label="Clear all" disabled={n === 0} onClick={() => setDraft({})} />
        <Button
          id="ds-browse-filters-apply"
          label={`Show ${results} ${results === 1 ? 'result' : 'results'}`}
          onClick={() => {
            onApply(draft);
            onClose();
          }}
        />
      </DrawerFooter>
    </Drawer>
  );
}
