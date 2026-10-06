/* DartBoards · Browse, scoped to one suite.

   This is where a team's suite lives: inside Browse, not beside it. The page is
   Browse's own grid with three additions and nothing more —

   1. IDENTITY, kept to one mark: the suite's glyph on a tile in its hue, the
      team in the overline, the curator in the footer. No theme, no banner, no
      second sidebar. The suite should feel like a place without feeling like a
      different application.
   2. ITS SECTIONS — the grouping the team used to draw as its own left
      navigation. Here they are the page's section headings, a filter in the
      header, and (for a suite you follow) sub-items under the suite in the one
      DartBoards sidebar. Same names in all three places. A team whose navigation
      was NESTED keeps its second level as TOPICS: a filter inside a section,
      never a deeper sidebar.
   3. TWO WAYS TO MAKE IT YOURS: Follow (puts it in your sidebar, copies
      nothing) and Create space (a space of your own, from any sections or any
      single dashboards).

   It has to hold a 5-dashboard suite and a 50-dashboard one. The size rules
   (suiteShared.ts) do that without a second layout:
   - "All sections" is an OVERVIEW — each section shows its first few and a
     "View all" — except the curator's "Start here" section, shown in full;
   - a big suite opens in the list view;
   - many sections turn the section row into a searchable picker;
   - search, filters and sort are Browse's own, limited to the suite.

   Every card and row is the ordinary Browse one, so "Add to space", details and
   access work exactly as they do in the full library. */

import { Check, ChevronDown, Layers, LayoutGrid, List, Plus, Search, SearchX, SlidersHorizontal } from 'lucide-react';
import { useRef, useState } from 'react';
import Breadcrumb, { BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../../../../../components/Breadcrumb';
import Button from '../../../../../components/Button';
import Combobox from '../../../../../components/Combobox';
import DropdownMenu, { DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from '../../../../../components/DropdownMenu';
import Empty, { EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '../../../../../components/Empty';
import FeaturedIcon from '../../../../../components/FeaturedIcon';
import FilterTag, { FilterTagGroup } from '../../../../../components/FilterTag';
import Input from '../../../../../components/Input';
import PageContainer from '../../../../../components/PageContainer';
import PageHeader from '../../../../../components/PageHeader';
import Section from '../../../../../components/Section';
import Stack from '../../../../../components/Stack';
import ToggleGroup, { ToggleGroupItem } from '../../../../../components/ToggleGroup';
import Toolbar, { ToolbarGroup } from '../../../../../components/Toolbar';
import Grid from '../../../../../components/Grid';
import Text from '../../../../../components/Text';
import { useNav } from '../../../nav';
import { useSuite, discoverable } from '../../../store';
import type { Dashboard } from '../../../types';
import { BrowseCard, BrowseRow } from '../browse/BrowseItems';
import { FilterDrawer } from '../browse/FilterDrawer';
import { FACETS, SORTS, appliedCount, matches, sortDashboards } from '../browse/facets';
import type { Filters, SortId } from '../browse/facets';
import { CreateSpaceFromSuiteDialog } from './CreateSpaceFromSuiteDialog';
import {
  INLINE_SECTIONS,
  LIST_VIEW_AT,
  PREVIEW,
  countLabel,
  orderedSections,
  suiteDashboardIds,
  suiteIcon,
  useFollowSuite,
} from './suiteShared';
import '../browse/Browse.scss';
import './Suite.scss';

/** A suite adds one order Browse does not have: the curator's. It is the default. */
type SuiteSort = SortId | 'curated';
const SUITE_SORTS: { id: SuiteSort; label: string; short: string }[] = [{ id: 'curated', label: 'Curator’s order', short: 'Curator’s order' }, ...SORTS];

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');

export function SuiteBrowse({ suiteId, sectionId }: { suiteId: string; sectionId?: string }) {
  const { state } = useSuite();
  const { go, replace } = useNav();
  const suite = state.suites.find((s) => s.id === suiteId);
  const { following, toggle } = useFollowSuite(suite);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SuiteSort>('curated');
  const [filters, setFilters] = useState<Filters>({});
  const [drawer, setDrawer] = useState(false);
  // `null` = the size default (list view for a big suite); set once the user picks.
  const [view, setView] = useState<'grid' | 'rows' | null>(null);
  // A topic belongs to one section; switching section drops it.
  const [topicPick, setTopicPick] = useState<{ section: string; topic: string }>({ section: '', topic: '' });
  // `null` = closed; otherwise the sections the dialog opens with.
  const [creating, setCreating] = useState<string[] | null>(null);
  const filterBtn = useRef<HTMLButtonElement>(null);

  if (!suite) {
    return (
      <PageContainer>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Layers />
            </EmptyMedia>
            <EmptyTitle>This suite is no longer published</EmptyTitle>
            <EmptyDescription>Its dashboards are still in the library, and any space you started from it is unchanged.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button id={`ds-suite-${suiteId}-gone`} style="outline" label="Browse all dashboards" onClick={() => go({ page: 'browse' })} />
          </EmptyContent>
        </Empty>
      </PageContainer>
    );
  }

  const base = `ds-suite-${suite.id}`;
  const Icon = suiteIcon(suite.id);
  const find = (id: string) => state.dashboards.find((d) => d.id === id && discoverable(d));
  const present = (ids: string[]) => ids.map(find).filter((d): d is Dashboard => !!d);

  const all = present(suiteDashboardIds(suite));
  const total = all.length;
  const shownView = view ?? (total > LIST_VIEW_AT ? 'rows' : 'grid');
  const sections = orderedSections(suite);
  const current = sections.find((s) => s.id === sectionId);
  const active = current?.id ?? 'all';
  const topic = current && topicPick.section === current.id ? topicPick.topic : '';

  const q = query.trim().toLowerCase();
  const nApplied = appliedCount(filters);
  const narrowing = !!q || nApplied > 0;
  const searched = all.filter((d) => !q || `${d.name} ${d.description} ${d.owner}`.toLowerCase().includes(q));
  const keep = (d: Dashboard) => (!q || searched.includes(d)) && matches(d, filters);
  const order = (list: Dashboard[]) => (sort === 'curated' ? list : sortDashboards(list, state.dashboards, sort));

  const shown = (current ? [current] : sections)
    .map((s) => {
      const ids = (topic && s.topics?.find((t) => t.id === topic)?.dashboardIds) || s.dashboardIds;
      const list = order(present(ids).filter(keep));
      const isStart = s.id === suite.startSectionId;
      // The overview: a few per section. Never while searching or filtering (every hit
      // counts), never inside one section, and never for the curator's start section.
      const preview = PREVIEW[shownView];
      const limit = !current && !narrowing && !isStart && list.length > preview + 1 ? preview : list.length;
      return { ...s, list, visible: list.slice(0, limit), more: list.length - limit, isStart };
    })
    .filter((s) => s.list.length > 0);

  // Section changes REPLACE the route: a filter is not a place to go back to.
  const pickSection = (v: string) => replace({ page: 'browse', suite: suite.id, section: v && v !== 'all' ? v : undefined });
  const clearFilters = () => setFilters({});
  const removeFilter = (facet: keyof Filters, v: string) => setFilters((f) => ({ ...f, [facet]: (f[facet] ?? []).filter((x) => x !== v) }));
  const inSection = (id: string) => present(suite.sections.find((s) => s.id === id)?.dashboardIds ?? []).length;

  // Up to INLINE_SECTIONS, sections are a row you can read at a glance; past that, a row
  // would scroll sideways or wrap, so they become one searchable picker (Combobox: the
  // library's choice for a long list you filter by typing).
  const sectionControl =
    sections.length <= INLINE_SECTIONS ? (
      <ToggleGroup id={`${base}-sections`} type="single" variant="line" value={active} onValueChange={pickSection} aria-label="Sections">
        <ToggleGroupItem value="all" label="All sections" />
        {sections.map((s) => (
          <ToggleGroupItem key={s.id} value={s.id} label={s.name} />
        ))}
      </ToggleGroup>
    ) : (
      <Combobox
        id={`${base}-sections`}
        size="sm"
        className="ds-suite-section-pick"
        label="Section"
        options={[
          { value: 'all', label: 'All sections', description: countLabel(total, 'dashboard') },
          ...sections.map((s) => ({ value: s.id, label: s.name, description: countLabel(inSection(s.id), 'dashboard') })),
        ]}
        value={active}
        onValueChange={(v) => pickSection(v || 'all')}
        searchPlaceholder={`Find one of ${sections.length} sections…`}
        matchTriggerWidth={false}
      />
    );

  const sortLabel = SUITE_SORTS.find((s) => s.id === sort)?.short ?? 'Curator’s order';

  const toolbar = (
    <Toolbar id={`${base}-toolbar`} label={`Filter ${suite.name}`}>
      <ToolbarGroup>{sectionControl}</ToolbarGroup>
      <ToolbarGroup>
        <Input
          id={`${base}-search`}
          size="sm"
          type="search"
          className="ds-browse-search"
          placeholder={`Search ${countLabel(total, 'dashboard')}…`}
          IconLeft={Search}
          value={query}
          onValueChange={setQuery}
          aria-label={`Search ${suite.name}`}
        />
        <Button
          ref={filterBtn}
          id={`${base}-filter`}
          style="outline"
          size="sm"
          label="Filter"
          IconLeft={SlidersHorizontal}
          count={nApplied || undefined}
          aria-label={nApplied ? `Filter, ${nApplied} applied` : 'Filter'}
          onClick={() => setDrawer(true)}
        />
        <DropdownMenu id={`${base}-sort`}>
          <DropdownMenuTrigger>
            <Button id={`${base}-sort-trigger`} style="outline" size="sm" label={`Sort: ${sortLabel}`} IconRight={ChevronDown} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuRadioGroup value={sort} onValueChange={(v) => setSort(v as SuiteSort)}>
              {SUITE_SORTS.map((s) => (
                <DropdownMenuRadioItem key={s.id} value={s.id}>
                  {s.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <ToggleGroup
          id={`${base}-view`}
          type="single"
          size="sm"
          variant="outline"
          value={shownView}
          onValueChange={(v) => v && setView(v as 'grid' | 'rows')}
          aria-label="View"
        >
          <ToggleGroupItem value="grid" IconCenter={LayoutGrid} aria-label="Grid view" />
          <ToggleGroupItem value="rows" IconCenter={List} aria-label="List view" />
        </ToggleGroup>
      </ToolbarGroup>
    </Toolbar>
  );

  const list = (items: Dashboard[]) =>
    shownView === 'grid' ? (
      <Grid level={3} minItemWidth="var(--w-64)">
        {items.map((d) => (
          <BrowseCard key={d.id} d={d} inSuite />
        ))}
      </Grid>
    ) : (
      <div className="ds-browse-rows">
        {items.map((d) => (
          <BrowseRow key={d.id} d={d} />
        ))}
      </div>
    );

  return (
    <PageContainer className="ds-browse ds-suite">
      <Breadcrumb aria-label="Breadcrumb">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink
              href="#"
              onClick={(e) => {
                e.preventDefault();
                go({ page: 'browse' });
              }}
            >
              Dashboards
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{suite.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <PageHeader
        id={`${base}-header`}
        visual={<FeaturedIcon id={`${base}-mark`} Icon={Icon} size="lg" color={suite.hue} />}
        overline={`Suite · ${suite.team}`}
        title={suite.name}
        description={`${suite.description} ${countLabel(total, 'dashboard')} in ${countLabel(suite.sections.length, 'section')}.`}
        showDivider
        actions={
          <>
            <Button
              id={`${base}-follow`}
              style={following ? 'secondary' : 'outline'}
              label={following ? 'Following' : 'Follow'}
              IconLeft={following ? Check : Plus}
              aria-pressed={following}
              onClick={toggle}
            />
            <Button id={`${base}-create`} label="Create space from suite" onClick={() => setCreating(suite.sections.map((s) => s.id))} />
          </>
        }
        toolbar={toolbar}
      />

      {nApplied > 0 && (
        <FilterTagGroup id={`${base}-active`} label="Active filters:" onClearAll={clearFilters} returnFocusRef={filterBtn}>
          {FACETS.flatMap((facet) =>
            (filters[facet.id] ?? []).map((v) => (
              <FilterTag
                key={`${facet.id}-${v}`}
                id={`${base}-active-${facet.id}-${slug(v)}`}
                label={`${facet.label}: ${v}`}
                onRemove={() => removeFilter(facet.id, v)}
              />
            )),
          )}
        </FilterTagGroup>
      )}

      {shown.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SearchX />
            </EmptyMedia>
            <EmptyTitle>{q ? `Nothing in ${current ? current.name : 'this suite'} matches “${query.trim()}”` : 'Nothing here matches these filters'}</EmptyTitle>
            <EmptyDescription>{current ? 'Try all sections, or the rest of the library.' : 'The rest of the library may have it.'}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            {current && <Button id={`${base}-all-sections`} style="outline" label="Search all sections" onClick={() => pickSection('all')} />}
            <Button id={`${base}-all`} style="ghost" label="Search all dashboards" onClick={() => go({ page: 'browse' })} />
          </EmptyContent>
        </Empty>
      ) : (
        <Stack level={2}>
          {shown.map((s) => (
            <Section
              key={s.id}
              id={`${base}-sec-${s.id}`}
              heading={s.name}
              actions={
                <div className="ds-suite-section-actions">
                  <Text as="span" tone="muted">
                    {s.more > 0 ? `${s.visible.length} of ${countLabel(s.list.length, 'dashboard')}` : countLabel(s.list.length, 'dashboard')}
                  </Text>
                  <Button id={`${base}-sec-${s.id}-space`} style="ghost" size="sm" label="New space from section" onClick={() => setCreating([s.id])} />
                </div>
              }
            >
              <Stack level={4}>
                {/* The team's old second level, as a filter in place — one topic at a time, re-click clears. */}
                {current && s.topics?.length ? (
                  <ToggleGroup
                    id={`${base}-topics`}
                    type="single"
                    size="sm"
                    variant="outline"
                    value={topic}
                    onValueChange={(v) => setTopicPick({ section: s.id, topic: v })}
                    aria-label={`Topics in ${s.name}`}
                  >
                    {s.topics.map((t) => (
                      <ToggleGroupItem key={t.id} value={t.id} label={t.name} />
                    ))}
                  </ToggleGroup>
                ) : null}
                {list(s.visible)}
                {s.more > 0 && (
                  <div className="ds-suite-more">
                    <Button
                      id={`${base}-sec-${s.id}-more`}
                      style="outline"
                      size="sm"
                      label={`View all ${s.list.length} in ${s.name}`}
                      onClick={() => pickSection(s.id)}
                    />
                  </div>
                )}
              </Stack>
            </Section>
          ))}
        </Stack>
      )}

      <Text tone="muted" className="ds-suite-foot">
        Curated by {suite.owner} for the {suite.team}, updated {suite.updatedAt}. Every dashboard here is also in the full library.
      </Text>

      <FilterDrawer open={drawer} onClose={() => setDrawer(false)} base={searched} total={total} applied={filters} onApply={setFilters} />
      <CreateSpaceFromSuiteDialog
        open={creating !== null}
        suite={suite}
        initialSections={creating ?? undefined}
        onClose={() => setCreating(null)}
      />
    </PageContainer>
  );
}
