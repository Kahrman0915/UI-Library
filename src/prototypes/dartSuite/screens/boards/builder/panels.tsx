/* The Builder's side panels (Figma: Builder BL4.x). Each is a plain column of
   library parts; Builder.tsx owns the state and the panel chrome. */

import { Blocks, ChartLine, Check, ChevronLeft, Clock, CopyPlus, Crosshair, FileText, Filter, Gauge, Heading, LayoutDashboard, Link2, Lock, Minus, Plus, Search, SlidersHorizontal, Sparkles, StickyNote, Workflow } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState } from 'react';
import Badge from '../../../../../components/Badge';
import Button from '../../../../../components/Button';
import Checkbox from '../../../../../components/Checkbox';
import Chip from '../../../../../components/Chip';
import Combobox from '../../../../../components/Combobox';
import Empty, { EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '../../../../../components/Empty';
import FilterTag, { FilterTagGroup } from '../../../../../components/FilterTag';
import Input from '../../../../../components/Input';
import Item, { ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from '../../../../../components/Item';
import Label from '../../../../../components/Label';
import Section from '../../../../../components/Section';
import Swatch from '../../../../../components/Swatch';
import Stack from '../../../../../components/Stack';
import ToggleGroup, { ToggleGroupItem } from '../../../../../components/ToggleGroup';
import Separator from '../../../../../components/Separator';
import Text from '../../../../../components/Text';
import { FACET_DEFS, facetCount, facetsFor, matchesFacets, parkedIn } from './facets';
import type { FacetDef, FacetFilters } from './facets';
import type { Space, SpaceCardLayout } from '../../../types';
import { LAYOUT_PRESETS } from '../space/spaceLayout';
import type { LayoutPreset } from '../space/spaceLayout';

/* The Builder's rail IS the picker (owner, 2026-10-01). It used to open an "Add
   components" grid of tiles that then opened a second panel; now each kind has
   its own rail icon, and the Builder lands on ALL of them in one list. Layout
   moved into Settings — it is a setting of the space, not something you add. */

export type LibraryKind = 'dashboard' | 'widget' | 'metric' | 'workflow' | 'report';

export type PanelId = 'all' | 'dashboards' | 'widgets' | 'metrics' | 'workflows' | 'reports' | 'blocks' | 'filters' | 'settings' | 'item';

export const KIND_META: Record<LibraryKind, { label: string; plural: string; panel: PanelId; Icon: LucideIcon }> = {
  dashboard: { label: 'Dashboard', plural: 'Dashboards', panel: 'dashboards', Icon: LayoutDashboard },
  widget: { label: 'Widget', plural: 'Widgets', panel: 'widgets', Icon: Blocks },
  metric: { label: 'Metric', plural: 'Metrics', panel: 'metrics', Icon: ChartLine },
  workflow: { label: 'Workflow', plural: 'Workflows', panel: 'workflows', Icon: Workflow },
  report: { label: 'Report', plural: 'Reports', panel: 'reports', Icon: FileText },
};

export const PANEL_KIND: Partial<Record<PanelId, LibraryKind>> = {
  dashboards: 'dashboard',
  widgets: 'widget',
  metrics: 'metric',
  workflows: 'workflow',
  reports: 'report',
};

export const PANEL_META: Record<PanelId, { title: string; description: string }> = {
  all: { title: 'Add to your space', description: 'Everything you can add, in one list. Pick a kind from the rail to narrow it.' },
  dashboards: { title: 'Dashboards', description: 'Whole dashboards from the library.' },
  widgets: { title: 'Widgets', description: 'Single live charts from native dashboards. They follow their suite’s filters.' },
  metrics: { title: 'Metrics', description: 'One number, kept current, with its change.' },
  workflows: { title: 'Workflows', description: 'Work waiting on you or your team, with what is open.' },
  reports: { title: 'Reports', description: 'Packs and documents published on a schedule.' },
  blocks: { title: 'Blocks', description: 'Shape the space itself: headings, filters, links, a summary, a row of metrics.' },
  filters: { title: 'Filters', description: 'Shared filters work on everything; each kind adds its own.' },
  settings: { title: 'Space settings', description: 'Layout and defaults for this space only. Changes apply as you pick them.' },
  item: { title: 'Selected item', description: 'Click a card on the canvas to change it here.' },
};

/** One row in the library: something that can go on the canvas. */
export type LibraryEntry = {
  key: string;
  kind: LibraryKind;
  title: string;
  description: string;
  /** What it is about. Also listed under `facets.subject`. */
  subject: string;
  /** Every facet value this entry has, by facet id (facets.ts). */
  facets: Record<string, string[]>;
  /** `again` = already on the space, but more than one view of it makes sense (metrics). */
  status: 'add' | 'added' | 'again' | 'locked';
  onAdd: () => void;
  onLocked?: () => void;
};

const PREVIEW_PER_KIND = 3;

function EntryRow({ e, showKind }: { e: LibraryEntry; showKind: boolean }) {
  const m = KIND_META[e.kind];
  const id = `ds-builder-lib-${e.key.replace(/[^a-z0-9]+/gi, '-')}`;
  return (
    <Item size="sm">
      <ItemMedia variant="icon">{e.status === 'locked' ? <Lock /> : <m.Icon />}</ItemMedia>
      <ItemContent>
        <ItemTitle>{e.title}</ItemTitle>
        <ItemDescription>
          {e.status === 'locked' ? 'Restricted — request access to add' : e.status === 'again' ? 'On your space · add another view' : e.description}
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        {showKind && <Badge id={`${id}-kind`} label={m.label} color="info" appearance="outline" />}
        {e.status === 'locked' ? (
          <Button id={`${id}-access`} style="ghost" size="xs" iconOnly IconCenter={Lock} aria-label={`Request access to ${e.title}`} onClick={e.onLocked} />
        ) : (
          <Button
            id={`${id}-add`}
            style="ghost"
            size="xs"
            iconOnly
            IconCenter={e.status === 'added' ? Check : e.status === 'again' ? CopyPlus : Plus}
            disabled={e.status === 'added'}
            aria-label={e.status === 'added' ? `${e.title} is on the canvas` : e.status === 'again' ? `Add another view of ${e.title}` : `Add ${e.title}`}
            onClick={e.onAdd}
          />
        )}
      </ItemActions>
    </Item>
  );
}

/** Applied filters as removable tags, plus the parked ones as a quiet line. */
function AppliedFilters({ filters, onChange, kind }: { filters: FacetFilters; onChange: (f: FacetFilters) => void; kind: LibraryKind | undefined }) {
  const active = facetsFor(kind).flatMap((f) => (filters[f.id] ?? []).map((v) => ({ f, v })));
  const parked = parkedIn(filters, kind);
  if (!active.length && !parked.length) return null;
  return (
    <Stack level={4}>
      {active.length > 0 && (
        <FilterTagGroup id="ds-builder-active-filters" label="Filters" onClearAll={() => onChange(Object.fromEntries(Object.entries(filters).filter(([id]) => !facetsFor(kind).some((f) => f.id === id))))}>
          {active.map(({ f, v }) => (
            <FilterTag
              key={`${f.id}-${v}`}
              id={`ds-builder-filter-tag-${f.id}-${v.replace(/\W+/g, '-')}`}
              label={`${f.label}: ${v}`}
              onRemove={() => onChange({ ...filters, [f.id]: filters[f.id].filter((x) => x !== v) })}
            />
          ))}
        </FilterTagGroup>
      )}
      {parked.length > 0 && (
        <Text tone="muted" className="ds-builder-parked">
          Parked, kept for when you go back:{' '}
          {parked
            .map(({ def, values }) => `${def.label}: ${values.join(', ')} (${(def.appliesTo as LibraryKind[]).map((k) => KIND_META[k].plural.toLowerCase()).join(', ')} only)`)
            .join(' · ')}
        </Text>
      )}
    </Stack>
  );
}

/* ── The space's focus ─────────────────────────────────────────────────────
   Set once, shown at the top of EVERY library screen, and applied to every kind
   — so going from Metrics to Dashboards never means filtering again. Any subject
   in the library, as many as you like; the suggestion is only a shortcut. */

export type FocusProps = {
  subjects: string[];
  on: boolean;
  /** Every subject in the library, for the picker. */
  all: string[];
  /** Suggested from the first thing on the canvas, while there is no focus yet. */
  suggestion: string | null;
  onChange: (subjects: string[]) => void;
  onToggle: (on: boolean) => void;
};

function FocusBar({ subjects, on, all, suggestion, onChange, onToggle }: FocusProps) {
  const [picking, setPicking] = useState(false);
  const picker = (
    <Stack level={4}>
      <Combobox
        id="ds-builder-focus-pick"
        label="Space focus"
        description="Any subjects in the library. Every screen starts from them."
        multiple
        values={subjects}
        onValuesChange={(v) => {
          onChange(v);
          if (v.length) onToggle(true);
        }}
        options={all.map((s) => ({ value: s, label: s }))}
        placeholder="Pick one or more subjects"
        searchPlaceholder="Search subjects…"
        summary={(sel) => (sel.length ? sel.map((o) => o.label).join(', ') : 'Pick one or more subjects')}
      />
      <div>
        <Button id="ds-builder-focus-done" style="link" size="sm" label="Done" onClick={() => setPicking(false)} />
      </div>
    </Stack>
  );

  if (picking) return <div className="ds-builder-focus">{picker}</div>;
  if (!subjects.length) {
    return (
      <div className="ds-builder-focus">
        <Crosshair aria-hidden="true" className="ds-builder-focus__icon" />
        <span className="ds-builder-focus__text">{suggestion ? <>Focus this space on <strong>{suggestion}</strong>?</> : 'No focus yet — everything shows.'}</span>
        {suggestion && <Button id="ds-builder-focus-accept" style="link" size="sm" label="Focus" onClick={() => onChange([suggestion])} />}
        <Button id="ds-builder-focus-set" style="link" size="sm" label={suggestion ? 'Pick…' : 'Set a focus'} onClick={() => setPicking(true)} />
      </div>
    );
  }
  return (
    <div className="ds-builder-focus" data-on={on ? '' : undefined}>
      <Crosshair aria-hidden="true" className="ds-builder-focus__icon" />
      <span className="ds-builder-focus__text">
        {on ? (
          <>
            Focused on <strong>{subjects.join(', ')}</strong>
          </>
        ) : (
          'Focus off — showing everything'
        )}
      </span>
      <Button id="ds-builder-focus-change" style="link" size="sm" label="Change" onClick={() => setPicking(true)} />
      <Button id="ds-builder-focus-toggle" style="link" size="sm" label={on ? 'Show everything' : 'Use focus'} onClick={() => onToggle(!on)} />
    </div>
  );
}

/** One-tap shortcuts to each kind's own filters. The full set is still on the Filter screen. */
const QUICK: Record<LibraryKind, { facet: string; value: string }[]> = {
  dashboard: [{ facet: 'delivery', value: 'Native' }],
  widget: [],
  metric: [
    { facet: 'grain', value: 'Daily' },
    { facet: 'grain', value: 'Weekly' },
    { facet: 'certified', value: 'Certified' },
  ],
  report: [
    { facet: 'cadence', value: 'Monthly' },
    { facet: 'cadence', value: 'Weekly' },
  ],
  workflow: [
    { facet: 'assigned', value: 'Assigned to me' },
    { facet: 'overdue', value: 'Has overdue' },
  ],
};

/** Kinds with a filter of their own switched on — the rail marks them, so nothing hides results silently. */
export const kindsFiltered = (filters: FacetFilters) =>
  (Object.keys(KIND_META) as LibraryKind[]).filter((k) => FACET_DEFS.some((f) => f.appliesTo !== 'all' && f.appliesTo.includes(k) && filters[f.id]?.length));

/**
 * The library list — ALL kinds (the landing view) or one. "All" groups by kind
 * and shows the first few of each with a way to the rest; searching or
 * filtering shows every match. Once something is on the space, All leads with
 * what shares its SUBJECT — the dashboards, workflow and report that go with it.
 */
export function LibraryPanel({
  panel,
  entries,
  filters,
  onFiltersChange,
  onOpenFilters,
  related,
  onSeeAll,
  focus,
}: {
  panel: PanelId;
  entries: LibraryEntry[];
  filters: FacetFilters;
  onFiltersChange: (f: FacetFilters) => void;
  onOpenFilters: () => void;
  related: { anchor: string; entries: LibraryEntry[] } | null;
  onSeeAll: (panel: PanelId) => void;
  focus: FocusProps;
}) {
  const [q, setQ] = useState('');
  const kind = PANEL_KIND[panel];
  const term = q.trim().toLowerCase();
  const count = facetCount(filters, kind);
  const focused = focus.on && focus.subjects.length > 0;
  const matching = entries.filter(
    (e) =>
      (!kind || e.kind === kind) &&
      (!focused || focus.subjects.includes(e.subject)) &&
      (!term || `${e.title} ${e.description} ${e.subject}`.toLowerCase().includes(term)) &&
      matchesFacets(e, filters, kind),
  );
  const quick = kind ? QUICK[kind] : [];
  const toggleQuick = (facet: string, value: string) => {
    const now = filters[facet] ?? [];
    onFiltersChange({ ...filters, [facet]: now.includes(value) ? now.filter((v) => v !== value) : [...now, value] });
  };
  const narrowed = !!term || count > 0;
  const placeholder = kind ? `Search ${KIND_META[kind].plural.toLowerCase()}…` : 'Search everything…';

  return (
    <Stack level={3}>
      <FocusBar {...focus} />
      <Stack level={4} direction="horizontal" align="center">
        <div className="ds-builder-lib-search">
          <Input id="ds-builder-lib-search" aria-label={placeholder.replace('…', '')} placeholder={placeholder} IconLeft={Search} value={q} onValueChange={setQ} />
        </div>
        <Button
          id="ds-builder-lib-filters"
          style="outline"
          label="Filter"
          IconLeft={Filter}
          count={count || undefined}
          aria-label={count ? `Filter, ${count} applied` : 'Filter'}
          onClick={onOpenFilters}
        />
      </Stack>
      {quick.length > 0 && (
        <div className="ds-builder-quick" role="group" aria-label={`Quick ${KIND_META[kind!].label.toLowerCase()} filters`}>
          {quick.map((q) => (
            <Chip
              key={`${q.facet}-${q.value}`}
              id={`ds-builder-quick-${q.facet}-${q.value.replace(/\W+/g, '-')}`}
              size="sm"
              label={q.value}
              active={(filters[q.facet] ?? []).includes(q.value)}
              onClick={() => toggleQuick(q.facet, q.value)}
            />
          ))}
        </div>
      )}
      <AppliedFilters filters={filters} onChange={onFiltersChange} kind={kind} />
      {!kind && !narrowed && !focused && related && related.entries.length > 0 && (
        <Section id="ds-builder-lib-related" variant="group" heading={`Related to ${related.anchor}`}>
          <ItemGroup>
            {related.entries.map((e) => (
              <EntryRow key={`rel-${e.key}`} e={e} showKind />
            ))}
          </ItemGroup>
        </Section>
      )}
      {!matching.length ? (
        <NoMatch what={kind ? KIND_META[kind].plural.toLowerCase() : 'items'} />
      ) : kind ? (
        <ItemGroup>
          {matching.map((e) => (
            <EntryRow key={e.key} e={e} showKind={false} />
          ))}
        </ItemGroup>
      ) : (
        (Object.keys(KIND_META) as LibraryKind[]).map((k) => {
          const ofKind = matching.filter((e) => e.kind === k);
          if (!ofKind.length) return null;
          const shown = narrowed ? ofKind : ofKind.slice(0, PREVIEW_PER_KIND);
          const m = KIND_META[k];
          return (
            <Section
              key={k}
              id={`ds-builder-lib-${k}`}
              variant="group"
              heading={`${m.plural} · ${ofKind.length}`}
              actions={
                shown.length < ofKind.length ? (
                  <Button id={`ds-builder-lib-${k}-all`} style="link" size="sm" label={`Show all ${ofKind.length}`} onClick={() => onSeeAll(m.panel)} />
                ) : undefined
              }
            >
              <ItemGroup>
                {shown.map((e) => (
                  <EntryRow key={e.key} e={e} showKind={false} />
                ))}
              </ItemGroup>
            </Section>
          );
        })
      )}
    </Stack>
  );
}

/* ── Blocks ─────────────────────────────────────────────────────────────
   What a user adds to make a space theirs, as opposed to content from the
   library. Text box lives here now, as Section heading. */

export type BlockChoice = 'heading' | 'note' | 'divider' | 'filters' | 'freshness' | 'links' | 'summary' | 'kpis';

const BLOCKS: { id: BlockChoice; title: string; description: string; Icon: LucideIcon }[] = [
  { id: 'heading', title: 'Section heading', description: 'Group the selected card, and any you give the same heading, under a title.', Icon: Heading },
  { id: 'note', title: 'Note', description: 'Your words on the space — context, a caveat, what to look at first.', Icon: StickyNote },
  { id: 'divider', title: 'Divider', description: 'A rule between two runs of cards, with an optional label.', Icon: Minus },
  { id: 'filters', title: 'Filter bar', description: 'Period and product filters at the top. Every live chart in the space follows them.', Icon: SlidersHorizontal },
  { id: 'freshness', title: 'Data freshness', description: 'Whether every source behind this space loaded on time, with the late ones named.', Icon: Clock },
  { id: 'kpis', title: 'KPI strip', description: 'Several metrics in one compact row.', Icon: Gauge },
  { id: 'summary', title: 'What changed', description: 'Aiden reads the charts, metrics and workflows here and says what moved.', Icon: Sparkles },
  { id: 'links', title: 'Quick links', description: 'An IRM record, a SharePoint folder, a runbook — the team’s other places.', Icon: Link2 },
];

export function BlocksPanel({
  selected,
  headings,
  hasFilterBar,
  hasFreshness,
  onPick,
}: {
  selected: string | null;
  headings: string[];
  hasFilterBar: boolean;
  hasFreshness: boolean;
  onPick: (b: BlockChoice) => void;
}) {
  // Filter bar and Data freshness speak for the whole space, so a space has at most one of each.
  const note = (b: BlockChoice) =>
    b === 'heading' && !selected
      ? 'Select a card on the canvas first.'
      : (b === 'filters' && hasFilterBar) || (b === 'freshness' && hasFreshness)
        ? 'This space already has one.'
        : null;
  return (
    <Stack level={3}>
      <ItemGroup>
        {BLOCKS.map((b) => {
          const blocked = note(b.id);
          return (
            <Item key={b.id} size="sm">
              <ItemMedia variant="icon">
                <b.Icon />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>{b.id === 'heading' && selected ? `Section heading for “${selected}”` : b.title}</ItemTitle>
                <ItemDescription>{blocked ?? b.description}</ItemDescription>
              </ItemContent>
              <ItemActions>
                <Button
                  id={`ds-builder-block-${b.id}`}
                  style="ghost"
                  size="xs"
                  iconOnly
                  IconCenter={Plus}
                  disabled={!!blocked}
                  aria-label={`Add ${b.title}`}
                  onClick={() => onPick(b.id)}
                />
              </ItemActions>
            </Item>
          );
        })}
      </ItemGroup>
      {headings.length > 0 && (
        <Section id="ds-builder-blocks-headings" variant="group" heading="Headings on this space">
          <ItemGroup>
            {headings.map((h) => (
              <Item key={h} size="sm">
                <ItemMedia variant="icon">
                  <Heading />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>{h}</ItemTitle>
                </ItemContent>
              </Item>
            ))}
          </ItemGroup>
        </Section>
      )}
    </Stack>
  );
}

function NoMatch({ what }: { what: string }) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Search />
        </EmptyMedia>
        <EmptyTitle>No {what} match</EmptyTitle>
        <EmptyDescription>Try a different search, or clear the filters.</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

/* ── Filters: shared facets, then the kind's own ───────────────────────── */

export function FacetsPanel({
  entries,
  scope,
  filters,
  onChange,
  onBack,
}: {
  entries: LibraryEntry[];
  scope: LibraryKind | undefined;
  filters: FacetFilters;
  onChange: (f: FacetFilters) => void;
  onBack: () => void;
}) {
  const inScope = entries.filter((e) => !scope || e.kind === scope);
  const toggle = (id: string, v: string, on: boolean) => onChange({ ...filters, [id]: on ? [...(filters[id] ?? []), v] : (filters[id] ?? []).filter((x) => x !== v) });
  const facetBlock = (f: FacetDef) => {
    const counts = new Map<string, number>();
    for (const e of inScope) {
      // Count against every OTHER applied facet, so each number is what ticking it would leave.
      if (!matchesFacets(e, { ...filters, [f.id]: [] }, scope)) continue;
      for (const v of e.facets[f.id] ?? []) counts.set(v, (counts.get(v) ?? 0) + 1);
    }
    const values = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    if (!values.length) return null;
    return (
      <Section key={f.id} id={`ds-builder-facet-${f.id}`} variant="group" heading={f.label}>
        <Stack level={4}>
          {values.map(([v, n]) => (
            <Checkbox
              key={v}
              id={`ds-builder-facet-${f.id}-${v.replace(/\W+/g, '-')}`}
              label={`${v} (${n})`}
              checked={(filters[f.id] ?? []).includes(v)}
              onCheckedChange={(on) => toggle(f.id, v, on)}
            />
          ))}
        </Stack>
      </Section>
    );
  };
  const shared = FACET_DEFS.filter((f) => f.appliesTo === 'all');
  const own = scope ? FACET_DEFS.filter((f) => f.appliesTo !== 'all' && f.appliesTo.includes(scope)) : [];
  return (
    <Stack level={3}>
      <div>
        <Button
          id="ds-builder-back"
          style="link"
          size="sm"
          label={`Back to ${scope ? KIND_META[scope].plural.toLowerCase() : 'everything'}`}
          IconLeft={ChevronLeft}
          onClick={onBack}
        />
      </div>
      <Text tone="muted">
        {scope
          ? `Filters every ${KIND_META[scope].label.toLowerCase()} has, then the ones only ${KIND_META[scope].plural.toLowerCase()} have.`
          : 'Filters every kind shares. Pick a kind from the rail for its own filters too.'}
      </Text>
      {/* No footer: the count is live, and clearing is right here. */}
      <Stack level={4} direction="horizontal" justify="between" align="center">
        <span className="ds-builder-results" aria-live="polite">
          {inScope.filter((e) => matchesFacets(e, filters, scope)).length} of {inScope.length} match
        </span>
        <Button
          id="ds-builder-filters-clear"
          style="link"
          size="sm"
          label="Clear all"
          disabled={!facetCount(filters, scope)}
          onClick={() => onChange(Object.fromEntries(Object.entries(filters).filter(([id]) => !facetsFor(scope).some((f) => f.id === id))))}
        />
      </Stack>
      <Separator label="SHARED" />
      {shared.map(facetBlock)}
      {own.length > 0 && (
        <>
          <Separator label={`${KIND_META[scope!].label.toUpperCase()} ONLY`} />
          {own.map(facetBlock)}
        </>
      )}
    </Stack>
  );
}

/* ── BL4.6 · space settings ─────────────────────────────────────────────── */

const HUES: { value: Space['hue']; label: string }[] = [
  { value: 'violet', label: 'Violet' },
  { value: 'blue', label: 'Blue' },
  { value: 'cyan', label: 'Cyan' },
  { value: 'emerald', label: 'Emerald' },
  { value: 'amber', label: 'Amber' },
  { value: 'rose', label: 'Rose' },
];

/** Everything Settings applies in one step — the layout preset moved in here from its own rail panel. */
export type SettingsValue = { preset: LayoutPreset; layout: SpaceCardLayout; hue: Space['hue'] };

export function SettingsPanel({ value, onChange }: { value: SettingsValue; onChange: (v: SettingsValue) => void }) {
  return (
    <Stack level={3}>
      <Section id="ds-builder-settings-layout-preset" variant="group" heading="Layout">
        <ItemGroup className="ds-builder-presets">
          {LAYOUT_PRESETS.map((p) => (
            <Item
              key={p.value}
              size="sm"
              variant={p.value === value.preset ? 'muted' : 'outline'}
              onClick={() => onChange({ ...value, preset: p.value })}
              aria-pressed={p.value === value.preset}
            >
              <ItemContent>
                <ItemTitle>{p.label}</ItemTitle>
                <ItemDescription>{p.description}</ItemDescription>
              </ItemContent>
              {p.value === value.preset && (
                <ItemMedia variant="icon">
                  <Check />
                </ItemMedia>
              )}
            </Item>
          ))}
        </ItemGroup>
      </Section>
      <Stack level={4}>
        <Label id="ds-builder-settings-layout-label">
          Default dashboard card layout
        </Label>
        <ToggleGroup
          id="ds-builder-settings-layout"
          type="single"
          size="sm"
          variant="outline"
          value={value.layout}
          onValueChange={(v) => v && onChange({ ...value, layout: v as SpaceCardLayout })}
          aria-labelledby="ds-builder-settings-layout-label"
        >
          <ToggleGroupItem value="thumbnail" label="Thumbnail card" />
          <ToggleGroupItem value="card" label="Simple card" />
        </ToggleGroup>
      </Stack>
      <Stack level={4}>
        <Label id="ds-builder-settings-hue-label">
          Space icon color
        </Label>
        <Text tone="muted">{HUES.find((h) => h.value === value.hue)?.label}</Text>
        <ToggleGroup
          id="ds-builder-settings-hue"
          type="single"
          size="sm"
          variant="outline"
          value={value.hue}
          onValueChange={(v) => v && onChange({ ...value, hue: v as Space['hue'] })}
          aria-labelledby="ds-builder-settings-hue-label"
        >
          {HUES.map((h) => (
            <ToggleGroupItem
              key={h.value}
              value={h.value}
              aria-label={h.label}
              IconCenter={() => <Swatch color={h.value} aria-hidden="true" />}
            />
          ))}
        </ToggleGroup>
      </Stack>
    </Stack>
  );
}
