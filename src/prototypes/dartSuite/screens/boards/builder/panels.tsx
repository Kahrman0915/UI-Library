/* The Builder's side panels (Figma: Builder BL4.1–BL4.7). Each is a plain
   column of library parts; Builder.tsx owns the state and the panel chrome. */

import {
  Bot,
  ChartLine,
  Check,
  ChevronLeft,
  FileText,
  LayoutDashboard,
  LayoutGrid,
  List,
  Lock,
  Plus,
  Search,
  Type,
  Workflow,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState } from 'react';
import Badge from '../../../../../components/Badge';
import Button from '../../../../../components/Button';
import Card, { CardBody, CardTitle } from '../../../../../components/Card';
import Checkbox from '../../../../../components/Checkbox';
import Empty, { EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '../../../../../components/Empty';
import FeaturedIcon from '../../../../../components/FeaturedIcon';
import type { FeaturedIconColor } from '../../../../../components/FeaturedIcon';
import FilterTag, { FilterTagGroup } from '../../../../../components/FilterTag';
import Input from '../../../../../components/Input';
import Item, { ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from '../../../../../components/Item';
import Label from '../../../../../components/Label';
import Section from '../../../../../components/Section';
import Stack from '../../../../../components/Stack';
import ToggleGroup, { ToggleGroupItem } from '../../../../../components/ToggleGroup';
import type { Dashboard, Space, SpaceCardLayout } from '../../../types';
import { LAYOUT_PRESETS } from '../space/spaceLayout';
import type { LayoutPreset } from '../space/spaceLayout';

export type PanelId = 'components' | 'dashboards' | 'filters' | 'layout' | 'settings';

export const PANEL_META: Record<PanelId, { title: string; description: string }> = {
  components: { title: 'Add components', description: 'Choose what to add to your space.' },
  dashboards: { title: 'Add dashboards', description: 'Choose what dashboard to add to your space.' },
  filters: { title: 'Configure filters', description: 'Narrow the dashboards you can add.' },
  layout: { title: 'Layout', description: 'Reorganize every component with a preset layout.' },
  settings: { title: 'Space settings', description: 'These settings apply to this space only.' },
};

export function BackToComponents({ onBack }: { onBack: () => void }) {
  return (
    <div>
      <Button id="ds-builder-back" style="link" size="sm" label="Back to add components" IconLeft={ChevronLeft} onClick={onBack} />
    </div>
  );
}

/* ── BL4.1 / BL4.2 · add components ─────────────────────────────────────── */

export type ComponentKind = 'dashboard' | 'metrics' | 'reports' | 'workflow' | 'aiden' | 'text';

const COMPONENTS: { kind: ComponentKind; title: string; description: string; Icon: LucideIcon; color: FeaturedIconColor }[] = [
  { kind: 'dashboard', title: 'Dashboard', description: 'From Tableau', Icon: LayoutDashboard, color: 'default' },
  { kind: 'metrics', title: 'Metrics', description: 'Charts and KPIs', Icon: ChartLine, color: 'success' },
  { kind: 'reports', title: 'Reports', description: 'Reports and docs', Icon: FileText, color: 'error' },
  { kind: 'workflow', title: 'Workflow', description: 'Automations', Icon: Workflow, color: 'teal' },
  { kind: 'aiden', title: 'Aiden widget', description: 'AI-powered', Icon: Bot, color: 'violet' },
  { kind: 'text', title: 'Text box', description: 'Heading or note', Icon: Type, color: 'warning' },
];

export function ComponentsPanel({ onPick }: { onPick: (kind: ComponentKind) => void }) {
  const [q, setQ] = useState('');
  const list = COMPONENTS.filter((c) => `${c.title} ${c.description}`.toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <Stack level={3}>
      <Input id="ds-builder-components-search" aria-label="Search components" placeholder="Search components…" IconLeft={Search} value={q} onValueChange={setQ} />
      {list.length ? (
        <div className="ds-builder-tiles">
          {list.map((c) => (
            <Card
              key={c.kind}
              id={`ds-builder-component-${c.kind}`}
              size="sm"
              interactive
              role="button"
              tabIndex={0}
              aria-label={`Add ${c.title}`}
              onClick={() => onPick(c.kind)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onPick(c.kind);
                }
              }}
            >
              <CardBody>
                <Stack level={4} direction="horizontal" align="start">
                  <FeaturedIcon Icon={c.Icon} size="sm" color={c.color} />
                  <div>
                    <CardTitle as="p" scale="sm">
                      {c.title}
                    </CardTitle>
                    <p className="ds-muted">{c.description}</p>
                  </div>
                </Stack>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        <NoMatch what="components" />
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

/* ── Filters shared by BL4.3–BL4.5 ──────────────────────────────────────── */

export type Filters = { category: string[]; source: string[]; tags: string[] };
export const NO_FILTERS: Filters = { category: [], source: [], tags: [] };

const FACETS: { key: keyof Filters; label: string; of: (d: Dashboard) => string[] }[] = [
  { key: 'category', label: 'Category', of: (d) => [d.category] },
  { key: 'source', label: 'Data sources', of: (d) => [d.source] },
  { key: 'tags', label: 'Tags', of: (d) => d.tags },
];

export const applyFilters = (list: Dashboard[], f: Filters) =>
  list.filter((d) => FACETS.every((facet) => !f[facet.key].length || facet.of(d).some((v) => f[facet.key].includes(v))));

const activeCount = (f: Filters) => f.category.length + f.source.length + f.tags.length;

function ActiveFilters({ filters, onChange }: { filters: Filters; onChange: (f: Filters) => void }) {
  if (!activeCount(filters)) return null;
  return (
    <FilterTagGroup id="ds-builder-active-filters" label="Active filters" onClearAll={() => onChange(NO_FILTERS)}>
      {FACETS.flatMap((facet) =>
        filters[facet.key].map((v) => (
          <FilterTag
            key={`${facet.key}-${v}`}
            id={`ds-builder-filter-tag-${facet.key}-${v.replace(/\W+/g, '-')}`}
            label={`${facet.label}: ${v}`}
            onRemove={() => onChange({ ...filters, [facet.key]: filters[facet.key].filter((x) => x !== v) })}
          />
        )),
      )}
    </FilterTagGroup>
  );
}

/* ── BL4.3 / BL4.4 · add dashboards (list or grid) ──────────────────────── */

export function DashboardsPanel({
  dashboards,
  onCanvas,
  filters,
  onFiltersChange,
  onAdd,
  onRequestAccess,
  onBack,
}: {
  dashboards: Dashboard[];
  onCanvas: string[];
  filters: Filters;
  onFiltersChange: (f: Filters) => void;
  onAdd: (d: Dashboard) => void;
  onRequestAccess: (d: Dashboard) => void;
  onBack: () => void;
}) {
  const [q, setQ] = useState('');
  const [view, setView] = useState<'list' | 'grid'>('list');
  const term = q.trim().toLowerCase();
  const list = applyFilters(dashboards, filters).filter(
    (d) => d.lifecycle !== 'draft' && (!term || `${d.name} ${d.description}`.toLowerCase().includes(term)),
  );

  const addButton = (d: Dashboard) => {
    const added = onCanvas.includes(d.id);
    if (!d.hasAccess)
      return (
        <Button
          id={`ds-builder-dash-${d.id}-access`}
          style="ghost"
          size="xs"
          iconOnly
          IconCenter={Lock}
          aria-label={`Request access to ${d.name}`}
          onClick={() => onRequestAccess(d)}
        />
      );
    return (
      <Button
        id={`ds-builder-dash-${d.id}-add`}
        style="ghost"
        size="xs"
        iconOnly
        IconCenter={added ? Check : Plus}
        disabled={added}
        aria-label={added ? `${d.name} is on the canvas` : `Add ${d.name}`}
        onClick={() => onAdd(d)}
      />
    );
  };

  return (
    <Stack level={3}>
      <Input id="ds-builder-dash-search" aria-label="Search dashboards" placeholder="Search dashboards…" IconLeft={Search} value={q} onValueChange={setQ} />
      <Stack level={4} direction="horizontal" justify="between" align="center">
        <BackToComponents onBack={onBack} />
        <ToggleGroup id="ds-builder-dash-view" type="single" size="sm" value={view} onValueChange={(v) => v && setView(v as 'list' | 'grid')} aria-label="View">
          <ToggleGroupItem value="list" aria-label="List view" IconCenter={List} />
          <ToggleGroupItem value="grid" aria-label="Grid view" IconCenter={LayoutGrid} />
        </ToggleGroup>
      </Stack>
      <ActiveFilters filters={filters} onChange={onFiltersChange} />
      {!list.length ? (
        <NoMatch what="dashboards" />
      ) : view === 'list' ? (
        <ItemGroup>
          {list.map((d) => (
            <Item key={d.id} size="sm">
              <ItemMedia variant="icon">{d.hasAccess ? <LayoutDashboard /> : <Lock />}</ItemMedia>
              <ItemContent>
                <ItemTitle>{d.name}</ItemTitle>
                <ItemDescription>{d.hasAccess ? d.description.split(/,| — /)[0] : 'Restricted — request access to add'}</ItemDescription>
              </ItemContent>
              <ItemActions>
                <Badge id={`ds-builder-dash-${d.id}-badge`} label="Dashboard" color="info" appearance="outline" />
                {addButton(d)}
              </ItemActions>
            </Item>
          ))}
        </ItemGroup>
      ) : (
        <div className="ds-builder-tiles">
          {list.map((d) => (
            <Card key={d.id} id={`ds-builder-dash-tile-${d.id}`} size="sm">
              <CardBody>
                <div className="ds-space-thumb" aria-hidden="true">
                  {d.hasAccess ? <LayoutDashboard /> : <Lock />}
                </div>
                <Stack level={5} direction="horizontal" justify="between" align="center">
                  <CardTitle as="p" scale="sm">
                    {d.name}
                  </CardTitle>
                  {addButton(d)}
                </Stack>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </Stack>
  );
}

/* ── BL4.5 · configure filters ──────────────────────────────────────────── */

export function FiltersPanel({
  dashboards,
  filters,
  onChange,
  onBack,
}: {
  dashboards: Dashboard[];
  filters: Filters;
  onChange: (f: Filters) => void;
  onBack: () => void;
}) {
  const [q, setQ] = useState('');
  const term = q.trim().toLowerCase();
  return (
    <Stack level={3}>
      <p className="ds-muted">
        {activeCount(filters)} applied · {applyFilters(dashboards, filters).length} of {dashboards.length} dashboards
      </p>
      <Input id="ds-builder-filter-search" aria-label="Search all filters" placeholder="Search all filters…" IconLeft={Search} value={q} onValueChange={setQ} />
      <BackToComponents onBack={onBack} />
      <ActiveFilters filters={filters} onChange={onChange} />
      {FACETS.map((facet) => {
        const counts = new Map<string, number>();
        for (const d of dashboards) for (const v of facet.of(d)) counts.set(v, (counts.get(v) ?? 0) + 1);
        const values = [...counts.entries()].filter(([v]) => !term || v.toLowerCase().includes(term)).sort((a, b) => b[1] - a[1]);
        if (!values.length) return null;
        return (
          <Section key={facet.key} id={`ds-builder-facet-${facet.key}`} variant="group" heading={facet.label}>
            <Stack level={4}>
              {values.map(([v, n]) => (
                <Checkbox
                  key={v}
                  id={`ds-builder-facet-${facet.key}-${v.replace(/\W+/g, '-')}`}
                  label={`${v} (${n})`}
                  checked={filters[facet.key].includes(v)}
                  onCheckedChange={(on) =>
                    onChange({ ...filters, [facet.key]: on ? [...filters[facet.key], v] : filters[facet.key].filter((x) => x !== v) })
                  }
                />
              ))}
            </Stack>
          </Section>
        );
      })}
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

export type SettingsValue = { layout: SpaceCardLayout; hue: Space['hue'] };

export function SettingsPanel({ value, onChange, onBack }: { value: SettingsValue; onChange: (v: SettingsValue) => void; onBack: () => void }) {
  return (
    <Stack level={3}>
      <BackToComponents onBack={onBack} />
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
        <p className="ds-muted">{HUES.find((h) => h.value === value.hue)?.label}</p>
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
              IconCenter={() => <span className="ds-builder-swatch" data-hue={h.value} aria-hidden="true" />}
            />
          ))}
        </ToggleGroup>
      </Stack>
    </Stack>
  );
}

/* ── BL4.7 · layout presets ─────────────────────────────────────────────── */

export function LayoutPanel({ value, onChange, onBack }: { value: LayoutPreset; onChange: (v: LayoutPreset) => void; onBack: () => void }) {
  return (
    <Stack level={3}>
      <BackToComponents onBack={onBack} />
      <ItemGroup>
        {LAYOUT_PRESETS.map((p) => (
          <Item
            key={p.value}
            size="sm"
            variant={p.value === value ? 'muted' : 'outline'}
            onClick={() => onChange(p.value)}
            aria-pressed={p.value === value}
          >
            <ItemContent>
              <ItemTitle>{p.label}</ItemTitle>
              <ItemDescription>{p.description}</ItemDescription>
            </ItemContent>
            {p.value === value && (
              <ItemMedia variant="icon">
                <Check />
              </ItemMedia>
            )}
          </Item>
        ))}
      </ItemGroup>
    </Stack>
  );
}
