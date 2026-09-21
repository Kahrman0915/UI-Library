/* DartBoards · Browse — Figma page "Browse" (3347:23177).

   B1.1–B1.3 grid / rows (ToggleGroup at the end of the header) · B1.4 card
   states · B2 dashboard info (opened from a card) · B3.1 sort menu · B3.2
   filter drawer · B3.3 active filters · B4 add to space (useUi) · B5.1 loading ·
   B5.2 empty library · B5.3/B5.4 search · B5.5 lazy load.

   Search, Filter, Sort and the view toggle sit in the PageHeader ACTIONS row —
   the recorded browse-page exception (owner, 15 Sep). */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, LayoutGrid, LibraryBig, List, SearchX, SlidersHorizontal, Search } from 'lucide-react';
import Button from '../../../../../components/Button';
import DropdownMenu, {
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '../../../../../components/DropdownMenu';
import Empty, { EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '../../../../../components/Empty';
import FilterTag, { FilterTagGroup } from '../../../../../components/FilterTag';
import Input from '../../../../../components/Input';
import PageContainer from '../../../../../components/PageContainer';
import PageHeader from '../../../../../components/PageHeader';
import Skeleton from '../../../../../components/Skeleton';
import ToggleGroup, { ToggleGroupItem } from '../../../../../components/ToggleGroup';
import { useNav } from '../../../nav';
import { useSuite } from '../../../store';
import { BrowseCard, BrowseCardSkeleton, BrowseRow, BrowseRowSkeleton } from './BrowseItems';
import { FilterDrawer } from './FilterDrawer';
import { FACETS, SORTS, appliedCount, matches, sortDashboards } from './facets';
import type { Filters, SortId } from './facets';
import './Browse.scss';

const PAGE = 8;
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');

export function Browse() {
  const { state } = useSuite();
  const { go } = useNav();

  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'rows'>('grid');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortId>('most-used');
  const [filters, setFilters] = useState<Filters>({});
  const [drawer, setDrawer] = useState(false);
  const [shown, setShown] = useState(PAGE);
  const [loadingMore, setLoadingMore] = useState(false);
  const filterBtn = useRef<HTMLButtonElement>(null);
  const sentinel = useRef<HTMLDivElement>(null);

  // B5.1 — the library "loads" once, on first open.
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  // The marketplace lists what is published; drafts and archived stay out.
  const library = useMemo(() => state.dashboards.filter((d) => d.lifecycle === 'published'), [state.dashboards]);
  const q = query.trim().toLowerCase();
  const searched = useMemo(
    () => library.filter((d) => !q || `${d.name} ${d.description} ${d.owner} ${d.category}`.toLowerCase().includes(q)),
    [library, q],
  );
  const matching = useMemo(
    () => sortDashboards(searched.filter((d) => matches(d, filters)), state.dashboards, sort),
    [searched, filters, sort, state.dashboards],
  );
  const visible = matching.slice(0, shown);
  const more = visible.length < matching.length;
  const nApplied = appliedCount(filters);

  // A new question starts from the first page again.
  useEffect(() => setShown(PAGE), [q, filters, sort]);

  // B5.5 — the next page fetches when the sentinel row scrolls into view.
  const loadMore = useCallback(() => {
    if (loadingMore) return;
    setLoadingMore(true);
    setTimeout(() => {
      setShown((s) => s + PAGE);
      setLoadingMore(false);
    }, 600);
  }, [loadingMore]);

  useEffect(() => {
    const el = sentinel.current;
    if (!el || !more || loading || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && loadMore(), { rootMargin: '0px 0px 200px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, [more, loading, loadMore, visible.length, view]);

  const clearSearch = () => setQuery('');
  const clearFilters = () => setFilters({});
  const removeFilter = (facet: keyof Filters, v: string) =>
    setFilters((f) => ({ ...f, [facet]: (f[facet] ?? []).filter((x) => x !== v) }));

  const description = q
    ? matching.length
      ? `${matching.length} of ${library.length} dashboards match “${query.trim()}”.`
      : `No dashboards match “${query.trim()}”.`
    : nApplied
      ? `${matching.length} of ${library.length} dashboards match your filters.`
      : 'Every dashboard you can add to a space.';

  const sortLabel = SORTS.find((s) => s.id === sort)?.short ?? 'Most used';

  const actions = (
    <div className="ds-browse-actions">
      <Input
        id="ds-browse-search"
        size="sm"
        type="search"
        className="ds-browse-search"
        placeholder="Search dashboards…"
        IconLeft={Search}
        value={query}
        onValueChange={setQuery}
        aria-label="Search dashboards"
      />
      <Button
        ref={filterBtn}
        id="ds-browse-filter"
        style="outline"
        size="sm"
        label="Filter"
        IconLeft={SlidersHorizontal}
        count={nApplied || undefined}
        aria-label={nApplied ? `Filter, ${nApplied} applied` : 'Filter'}
        onClick={() => setDrawer(true)}
      />
      <DropdownMenu id="ds-browse-sort">
        <DropdownMenuTrigger>
          <Button id="ds-browse-sort-trigger" style="outline" size="sm" label={`Sort: ${sortLabel}`} IconRight={ChevronDown} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuRadioGroup value={sort} onValueChange={(v) => setSort(v as SortId)}>
            {SORTS.map((s) => (
              <DropdownMenuRadioItem key={s.id} value={s.id}>
                {s.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <ToggleGroup
        id="ds-browse-view"
        type="single"
        size="sm"
        variant="outline"
        value={view}
        onValueChange={(v) => v && setView(v as 'grid' | 'rows')}
        aria-label="View"
      >
        <ToggleGroupItem value="grid" IconCenter={LayoutGrid} aria-label="Grid view" />
        <ToggleGroupItem value="rows" IconCenter={List} aria-label="List view" />
      </ToggleGroup>
    </div>
  );

  let content;
  if (loading) {
    content =
      view === 'grid' ? (
        <div className="ds-browse-grid" aria-busy="true" aria-label="Loading dashboards">
          {Array.from({ length: PAGE }, (_, i) => (
            <BrowseCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="ds-browse-rows" aria-busy="true" aria-label="Loading dashboards">
          {Array.from({ length: 6 }, (_, i) => (
            <BrowseRowSkeleton key={i} />
          ))}
        </div>
      );
  } else if (library.length === 0) {
    // B5.2 — the marketplace itself is empty.
    content = (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <LibraryBig />
          </EmptyMedia>
          <EmptyTitle>No dashboards yet</EmptyTitle>
          <EmptyDescription>
            When your teams publish dashboards to the marketplace they will appear here, ready to add to a space.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button
            id="ds-browse-empty-request"
            label="Request a dashboard"
            onClick={() => go({ page: 'request-form', kind: 'dashboard', mode: 'add' })}
          />
        </EmptyContent>
      </Empty>
    );
  } else if (matching.length === 0) {
    // B5.4 — nothing matched the search (or the filters).
    content = (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <SearchX />
          </EmptyMedia>
          <EmptyTitle>{q ? 'Nothing matched that search' : 'No dashboards match these filters'}</EmptyTitle>
          <EmptyDescription>
            {q
              ? `Try a shorter term or check the spelling. You can also browse all ${library.length} dashboards.`
              : 'Remove a filter or clear them all to see more.'}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button
            id="ds-browse-noresults-clear"
            style="outline"
            label={q ? 'Clear search' : 'Clear filters'}
            onClick={q ? clearSearch : clearFilters}
          />
        </EmptyContent>
      </Empty>
    );
  } else {
    content = (
      <>
        {view === 'grid' ? (
          <div className="ds-browse-grid">
            {visible.map((d) => (
              <BrowseCard key={d.id} d={d} />
            ))}
            {loadingMore && Array.from({ length: Math.min(4, matching.length - visible.length) }, (_, i) => <BrowseCardSkeleton key={`s${i}`} />)}
          </div>
        ) : (
          <div className="ds-browse-rows">
            {visible.map((d) => (
              <BrowseRow key={d.id} d={d} />
            ))}
            {loadingMore && Array.from({ length: Math.min(3, matching.length - visible.length) }, (_, i) => <BrowseRowSkeleton key={`s${i}`} />)}
          </div>
        )}
        {more ? (
          <div ref={sentinel} className="ds-browse-end">
            {loadingMore ? (
              <span className="ds-browse-end__loading" aria-live="polite">
                <Skeleton shape="circle" width="var(--w-3)" height="var(--h-3)" />
                Loading more…
              </span>
            ) : (
              <Button
                id="ds-browse-load-more"
                style="ghost"
                size="sm"
                label={`Load more · ${matching.length - visible.length} left`}
                onClick={loadMore}
              />
            )}
          </div>
        ) : (
          <p className="ds-browse-end ds-muted" aria-live="polite">
            {q || nApplied
              ? `That’s all ${matching.length} matching ${matching.length === 1 ? 'dashboard' : 'dashboards'}.`
              : `That’s all ${library.length} dashboards.`}
          </p>
        )}
      </>
    );
  }

  return (
    <PageContainer className="ds-browse">
      <PageHeader id="ds-browse-header" title="Browse" description={description} actions={actions} showDivider />
      {nApplied > 0 && (
        <FilterTagGroup
          id="ds-browse-active"
          label="Active filters:"
          onClearAll={clearFilters}
          returnFocusRef={filterBtn}
        >
          {FACETS.flatMap((facet) =>
            (filters[facet.id] ?? []).map((v) => (
              <FilterTag
                key={`${facet.id}-${v}`}
                id={`ds-browse-active-${facet.id}-${slug(v)}`}
                label={`${facet.label}: ${v}`}
                onRemove={() => removeFilter(facet.id, v)}
              />
            )),
          )}
        </FilterTagGroup>
      )}
      {content}
      <FilterDrawer
        open={drawer}
        onClose={() => setDrawer(false)}
        base={searched}
        total={library.length}
        applied={filters}
        onApply={setFilters}
      />
    </PageContainer>
  );
}
