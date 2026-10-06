/* IRM · Inventory — every governed report, as a table the person sets up themselves.

   Any column sorts (click its header) and any column with a set of values can be
   filtered; department and status sit up front because they are what people
   reach for first. "Columns" picks which columns show and in what order. The
   whole set-up — columns, order, sort, filters — is kept per person
   (`irmInventoryView`), so the table opens the way they left it; "Reset view"
   puts it back. A star on each row favourites a report: favourites get their own
   filter here and their own list in the sidebar. */

import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { ExternalLink, ListFilter, Search, Star } from 'lucide-react';
import Button from '../../../../components/Button';
import Combobox from '../../../../components/Combobox';
import FilterTag, { FilterTagGroup } from '../../../../components/FilterTag';
import Input from '../../../../components/Input';
import PageContainer from '../../../../components/PageContainer';
import PageHeader from '../../../../components/PageHeader';
import Popover, { PopoverContent, PopoverTrigger } from '../../../../components/Popover';
import Stack from '../../../../components/Stack';
import Table, { TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../../../../components/Table';
import Text from '../../../../components/Text';
import Toggle from '../../../../components/Toggle';
import Toolbar, { ToolbarGroup } from '../../../../components/Toolbar';
import { CONTROLS, EVERGREEN, LIFECYCLE, evergreenState, recordName } from '../../irm';
import type { IrmLifecycle, IrmRecord } from '../../irm';
import { useNav } from '../../nav';
import { useSignedIn, useSuite } from '../../store';
import type { InventoryView, SuiteState } from '../../store';
import { ColumnsMenu, SavedViewsMenu } from './SavedViews';
import { ControlsBadge, EvergreenBadge, LifecycleBadge } from './shared';

/* ── The columns ─────────────────────────────────────────────────────────── */

type Col = {
  key: string;
  label: string;
  /** What the column sorts by. */
  sort: (r: IrmRecord, s: SuiteState) => string | number;
  /** The value a filter matches on. Absent = the column cannot be filtered (free text, dates, links). */
  filter?: (r: IrmRecord, s: SuiteState) => string;
  /** A filter value as a person reads it. */
  filterLabel?: (v: string) => string;
  render: (r: IrmRecord, s: SuiteState, id: string) => ReactNode;
  /** Always shown: the table makes no sense without it. */
  locked?: boolean;
};

const LIFECYCLE_ORDER: IrmLifecycle[] = ['intake', 'in-development', 'in-review', 'production', 'retiring', 'retired'];
const fmtRun = (iso?: string) =>
  iso ? new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'Never';

const COLUMNS: Col[] = [
  {
    key: 'number',
    label: 'Report number',
    locked: true,
    sort: (r) => r.number,
    render: (r, _s, id) => <ReportLink id={id} record={r} />,
  },
  { key: 'name', label: 'Report', sort: (r) => recordName(r), render: (r) => <Text as="span" size="sm" weight="medium">{recordName(r)}</Text> },
  {
    key: 'purpose',
    label: 'Purpose',
    sort: (r) => r.purpose,
    render: (r) => (
      <Text as="span" size="sm" tone="muted" lines={2} className="ds-inv__purpose">
        {r.purpose}
      </Text>
    ),
  },
  { key: 'department', label: 'Department', sort: (r) => r.department, filter: (r) => r.department, render: (r) => r.department },
  {
    key: 'status',
    label: 'Status',
    sort: (r) => LIFECYCLE_ORDER.indexOf(r.lifecycle),
    filter: (r) => r.lifecycle,
    filterLabel: (v) => LIFECYCLE[v as IrmLifecycle]?.label ?? v,
    render: (r, _s, id) => <LifecycleBadge id={`${id}-lc`} record={r} />,
  },
  {
    key: 'access',
    label: 'Access role',
    sort: (r) => r.accessGroup,
    filter: (r) => r.accessGroup,
    render: (r) => <code className="ds-inv__code">{r.accessGroup}</code>,
  },
  {
    key: 'brd',
    label: 'BRD location',
    sort: (r) => r.brdLocation,
    render: (r, _s, id) => (
      <a id={`${id}-brd`} className="ds-inv__link" href={r.brdLocation} target="_blank" rel="noopener noreferrer" title={r.brdLocation}>
        {`SharePoint › ${r.department}`}
        <ExternalLink aria-hidden="true" />
      </a>
    ),
  },
  {
    key: 'lastRun',
    label: 'Last run',
    sort: (r) => r.lastRun ?? '',
    render: (r) => <Text as="span" size="sm" tone={r.lastRun ? 'default' : 'muted'}>{fmtRun(r.lastRun)}</Text>,
  },
  { key: 'owner', label: 'Business owner', sort: (r) => r.businessOwner, filter: (r) => r.businessOwner, render: (r) => r.businessOwner },
  { key: 'developer', label: 'Developer', sort: (r) => r.developer, filter: (r) => r.developer, render: (r) => r.developer },
  {
    key: 'controls',
    label: 'Controls',
    sort: (r) => ['overdue', 'pending', 'complete'].indexOf(r.controls),
    filter: (r) => r.controls,
    filterLabel: (v) => CONTROLS[v as IrmRecord['controls']]?.label ?? v,
    render: (r, _s, id) => <ControlsBadge id={`${id}-ctl`} record={r} />,
  },
  {
    key: 'evergreen',
    label: 'Recertification',
    sort: (r) => r.evergreen.due,
    filter: (r, s) => evergreenState(r, s.irm.today),
    filterLabel: (v) => EVERGREEN[v as keyof typeof EVERGREEN]?.label ?? v,
    render: (r, _s, id) => <EvergreenBadge id={`${id}-ev`} record={r} />,
  },
  { key: 'source', label: 'Source', sort: (r) => r.source, filter: (r) => r.source, render: (r) => r.source },
  { key: 'classification', label: 'Classification', sort: (r) => r.classification, filter: (r) => r.classification, render: (r) => r.classification },
  { key: 'tier', label: 'Tier', sort: (r) => r.tier, filter: (r) => String(r.tier), filterLabel: (v) => `Tier ${v}`, render: (r) => `Tier ${r.tier}` },
  { key: 'refresh', label: 'Refresh', sort: (r) => r.refresh, render: (r) => r.refresh },
  {
    key: 'listing',
    label: 'In DartBoards',
    sort: (r, s) => s.dashboards.find((d) => d.irm === r.number && d.lifecycle === 'published')?.name ?? '~',
    filter: (r, s) => (s.dashboards.some((d) => d.irm === r.number && d.lifecycle === 'published') ? 'listed' : 'not-listed'),
    filterLabel: (v) => (v === 'listed' ? 'Listed' : 'Not listed'),
    render: (r, s) => {
      const d = s.dashboards.find((x) => x.irm === r.number);
      return <Text as="span" size="sm" tone={d?.lifecycle === 'published' ? 'default' : 'muted'}>{d ? d.name : 'Not listed'}</Text>;
    },
  },
];

const col = (key: string) => COLUMNS.find((c) => c.key === key);

/** The view a person starts with: the columns they asked for first, sorted by report number, unfiltered. */
export const DEFAULT_INVENTORY_VIEW: InventoryView = {
  columns: ['number', 'name', 'purpose', 'department', 'status', 'access', 'brd', 'lastRun'],
  sort: { key: 'number', dir: 'asc' },
  filters: {},
};

/* ── The page ────────────────────────────────────────────────────────────── */

export function IrmRecords() {
  const { state, setInventoryView, toggleIrmFavorite } = useSuite();
  const { person } = useSignedIn();
  const [query, setQuery] = useState('');
  const view = state.irmInventoryView[person.id] ?? DEFAULT_INVENTORY_VIEW;
  const save = (next: Partial<InventoryView>) => setInventoryView(person.id, { ...view, ...next });
  const favoritesOnly = !!view.favoritesOnly;
  const setFavoritesOnly = (on: boolean) => save({ favoritesOnly: on });
  const favorites = state.irmFavorites[person.id] ?? [];
  const columns = view.columns.map(col).filter((c): c is Col => !!c);

  const setFilter = (key: string, values: string[]) => {
    const filters = { ...view.filters };
    if (values.length) filters[key] = values;
    else delete filters[key];
    save({ filters });
  };

  const q = query.trim().toLowerCase();
  const rows = useMemo(() => {
    const kept = state.irm.records
      .filter((r) => !favoritesOnly || favorites.includes(r.number))
      .filter((r) => !q || [r.number, r.name, r.purpose, r.department, r.businessOwner, r.developer, r.accessGroup].some((s) => s.toLowerCase().includes(q)))
      .filter((r) => Object.entries(view.filters).every(([key, values]) => {
        const c = col(key);
        return !c?.filter || values.includes(c.filter(r, state));
      }));
    const s = view.sort && col(view.sort.key);
    if (!s || !view.sort) return kept;
    const dir = view.sort.dir === 'asc' ? 1 : -1;
    return [...kept].sort((a, b) => {
      const x = s.sort(a, state);
      const y = s.sort(b, state);
      return (typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y))) * dir || a.number.localeCompare(b.number);
    });
  }, [state, view, q, favoritesOnly, favorites]);

  // Every value a filterable column holds, as options to pick from.
  const optionsFor = (c: Col) =>
    [...new Set(state.irm.records.map((r) => c.filter!(r, state)))]
      .sort((a, b) => (c.key === 'status' ? LIFECYCLE_ORDER.indexOf(a as IrmLifecycle) - LIFECYCLE_ORDER.indexOf(b as IrmLifecycle) : a.localeCompare(b)))
      .map((v) => ({ value: v, label: c.filterLabel?.(v) ?? v }));

  const applied = Object.entries(view.filters).flatMap(([key, values]) => {
    const c = col(key);
    return c ? values.map((v) => ({ key, v, label: `${c.label}: ${c.filterLabel?.(v) ?? v}` })) : [];
  });
  const quick = ['department', 'status'];
  const moreFilters = COLUMNS.filter((c) => c.filter && !quick.includes(c.key));
  const moreCount = moreFilters.reduce((n, c) => n + (view.filters[c.key]?.length ?? 0), 0);

  return (
    <PageContainer>
      <PageHeader id="ds-irm-inv-header" title="Inventory" description="Every governed report, whether or not it is listed in DartBoards. Sort by any column, filter, and set the table up the way you work — it stays that way." />
      <Stack level={4}>
        <Toolbar id="ds-irm-inv-filters" label="Filter and arrange the inventory" justify="between">
          <ToolbarGroup>
            <Input id="ds-irm-inv-search" size="sm" aria-label="Search the inventory" placeholder="Number, report, purpose, person…" IconLeft={Search} value={query} onValueChange={setQuery} className="ds-admin-search" />
            {quick.map((key) => {
              const c = col(key)!;
              return (
                <Combobox
                  key={key}
                  id={`ds-irm-inv-f-${key}`}
                  size="sm"
                  multiple
                  aria-label={`Filter by ${c.label.toLowerCase()}`}
                  placeholder={key === 'department' ? 'All departments' : 'All statuses'}
                  options={optionsFor(c)}
                  values={view.filters[key] ?? []}
                  onValuesChange={(v) => setFilter(key, v)}
                  summary={(sel) => (sel.length === 1 ? sel[0].label : `${c.label} · ${sel.length}`)}
                  className="ds-inv__quick"
                />
              );
            })}
            <Toggle id="ds-irm-inv-favs" size="sm" variant="outline" label="Favorites" IconLeft={Star} pressed={favoritesOnly} onPressedChange={setFavoritesOnly} />
          </ToolbarGroup>
          <ToolbarGroup>
            {/* Pick a view first; then fine-tune it with filters and columns. */}
            <ViewsMenu view={view} />
            <Popover id="ds-irm-inv-more">
              <PopoverTrigger>
                <Button id="ds-irm-inv-more-btn" size="sm" style="outline" label={moreCount ? `Filters · ${moreCount}` : 'Filters'} IconLeft={ListFilter} />
              </PopoverTrigger>
              <PopoverContent align="end" className="ds-inv__panel">
                <Stack level={3}>
                  <Text size="sm" weight="semibold">Filter by any column</Text>
                  {moreFilters.map((c) => (
                    <Combobox
                      key={c.key}
                      id={`ds-irm-inv-f-${c.key}`}
                      size="sm"
                      multiple
                      label={c.label}
                      placeholder="Any"
                      options={optionsFor(c)}
                      values={view.filters[c.key] ?? []}
                      onValuesChange={(v) => setFilter(c.key, v)}
                      summary={(sel) => (sel.length === 1 ? sel[0].label : `${sel.length} selected`)}
                    />
                  ))}
                </Stack>
              </PopoverContent>
            </Popover>
            <ColumnsMenu
              id="ds-irm-inv-cols"
              all={COLUMNS}
              shown={view.columns}
              onChange={(columns) => save({ columns })}
              onReset={() => setInventoryView(person.id, null)}
            />
          </ToolbarGroup>
        </Toolbar>

        {applied.length > 0 && (
          <FilterTagGroup id="ds-irm-inv-applied" label="Applied filters" hideLabel onClearAll={() => save({ filters: {} })}>
            {applied.map((a) => (
              <FilterTag key={`${a.key}-${a.v}`} id={`ds-irm-inv-tag-${a.key}-${a.v}`.replace(/[^a-z0-9-]/gi, '-')} label={a.label} onRemove={() => setFilter(a.key, view.filters[a.key].filter((x) => x !== a.v))} />
            ))}
          </FilterTagGroup>
        )}

        <Text size="sm" tone="muted">{`${rows.length} of ${state.irm.records.length} reports${favoritesOnly ? ' · favorites only' : ''}`}</Text>

        <div className="ds-inv__scroll">
          <Table id="ds-irm-inv-table" label="Inventory" density="sm">
            <TableHead>
              <TableRow>
                <TableHeaderCell className="ds-inv__star-col">
                  <span className="ui-sr-only">Favorite</span>
                </TableHeaderCell>
                {columns.map((c) => (
                  <TableHeaderCell
                    key={c.key}
                    sortDirection={view.sort?.key === c.key ? view.sort.dir : null}
                    onSort={(dir) => save({ sort: { key: c.key, dir } })}
                  >
                    {c.label}
                  </TableHeaderCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r) => {
                const fav = favorites.includes(r.number);
                const id = `ds-irm-inv-${r.number}`;
                return (
                  <TableRow key={r.number}>
                    <TableCell className="ds-inv__star-col">
                      <button
                        type="button"
                        id={`${id}-fav`}
                        className={`ds-inv__star${fav ? ' ds-inv__star--on' : ''}`}
                        aria-pressed={fav}
                        aria-label={`${fav ? 'Remove' : 'Add'} ${recordName(r)} ${fav ? 'from' : 'to'} favorites`}
                        onClick={() => toggleIrmFavorite(person.id, r.number)}
                      >
                        <Star aria-hidden="true" />
                      </button>
                    </TableCell>
                    {columns.map((c) => (
                      <TableCell key={c.key} className={`ds-inv__cell ds-inv__cell--${c.key}`}>
                        {c.render(r, state, id)}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {!rows.length && (
            <Text size="sm" tone="muted" className="ds-inv__empty">
              No reports match. Clear a filter or the search.
            </Text>
          )}
        </div>
      </Stack>
    </PageContainer>
  );
}

/** A report's number, linking to its record. */
function ReportLink({ id, record }: { id: string; record: IrmRecord }) {
  const { go } = useNav();
  return <Button id={`${id}-open`} style="link" size="sm" className="ds-admin-rowlink" label={record.number} onClick={() => go({ page: 'irm-record', number: record.number })} />;
}

/* ── Saved views ─────────────────────────────────────────────────────────── */

/** The parts of a view a person sets up — what "the same view" means when comparing two. */
const essence = (v: InventoryView) => JSON.stringify({ c: v.columns, s: v.sort, f: Object.fromEntries(Object.entries(v.filters).sort()), fav: !!v.favoritesOnly });

function ViewsMenu({ view }: { view: InventoryView }) {
  const { state, setInventoryView, setSavedInventoryViews } = useSuite();
  const { person } = useSignedIn();
  return (
    <SavedViewsMenu
      id="ds-irm-inv-views"
      view={view}
      defaults={DEFAULT_INVENTORY_VIEW}
      saved={state.irmSavedViews[person.id] ?? []}
      essence={essence}
      keeps="your columns, their order, the sort and every filter"
      placeholder="e.g. My Collections reports"
      setView={(v) => setInventoryView(person.id, v)}
      setSaved={(list) => setSavedInventoryViews(person.id, list)}
    />
  );
}
