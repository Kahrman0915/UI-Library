/* DartBoards · BLOCKS — what a user adds to make a space theirs (Builder ›
   Blocks), as opposed to content from the library. Rendered the same on the
   Builder canvas and on the space, so "the canvas IS the space" holds.

   - Filter bar  one per space. While it is there, ITS filters drive every live
                 chart in the space, in place of the suite's.
   - Quick links a titled list of links: an IRM record, a SharePoint folder, a runbook.
   - What changed Aiden reads the space's own charts, metrics and workflows and
                 says what moved. Native data is what makes this honest.
   - KPI strip   several metrics in one compact row instead of a card each.
   - Note        the owner's words, in an Alert tone (plain, info, warning).
   - Divider     a rule, optionally labelled, between two runs of cards.
   - Data freshness  whether every source behind the space loaded on time. */

import { ArrowUpRight, ExternalLink, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';
import Alert from '../../../../../components/Alert';
import Button from '../../../../../components/Button';
import Card, { CardBody, CardHeader } from '../../../../../components/Card';
import FeaturedIcon from '../../../../../components/FeaturedIcon';
import Item, { ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from '../../../../../components/Item';
import Separator from '../../../../../components/Separator';
import StatusDot from '../../../../../components/StatusDot';
import { toast } from '../../../../../components/Toast';
import ToggleGroup, { ToggleGroupItem } from '../../../../../components/ToggleGroup';
import Toolbar, { ToolbarGroup } from '../../../../../components/Toolbar';
import Text from '../../../../../components/Text';
import type { SuiteState } from '../../../store';
import type { Asset, NativeFilters, SpaceBlock, SpaceItem } from '../../../types';
import { useUi } from '../../../ui';
import { DEFAULT_NATIVE_FILTERS, PERIODS, PRODUCTS, explain } from '../native/nativeData';
import './SpaceBlocks.scss';

/* ── Which filters a live chart in a space follows ──────────────────────── */

/** The space's own filters when it has a filter bar block; otherwise the chart follows its suite. */
export const filtersInSpace = (state: SuiteState, items: SpaceItem[], spaceFilters: NativeFilters | undefined, suiteId: string): NativeFilters =>
  items.some((i) => i.block?.type === 'filters') ? spaceFilters ?? DEFAULT_NATIVE_FILTERS : state.suiteFilters[suiteId] ?? DEFAULT_NATIVE_FILTERS;

/* ── Filter bar ─────────────────────────────────────────────────────────── */

export function FilterBarBlock({ id, filters, onChange, action }: { id: string; filters: NativeFilters; onChange: (f: NativeFilters) => void; action?: ReactNode }) {
  return (
    <Card id={id} size="sm" className="ds-block ds-block--filters">
      <CardBody>
        <div className="ds-block-filters">
          <Toolbar id={`${id}-toolbar`} label="Space filters" justify="start">
            <ToolbarGroup>
              <ToggleGroup
                id={`${id}-period`}
                type="single"
                size="sm"
                variant="outline"
                value={filters.period}
                onValueChange={(v) => v && onChange({ ...filters, period: v as NativeFilters['period'] })}
                aria-label="Period"
              >
                {PERIODS.map((p) => (
                  <ToggleGroupItem key={p.value} value={p.value} label={p.label} />
                ))}
              </ToggleGroup>
            </ToolbarGroup>
            <ToolbarGroup>
              {/* Re-click clears back to all products. */}
              <ToggleGroup
                id={`${id}-product`}
                type="single"
                size="sm"
                variant="outline"
                value={filters.product === 'all' ? '' : filters.product}
                onValueChange={(v) => onChange({ ...filters, product: (v || 'all') as NativeFilters['product'] })}
                aria-label="Product"
              >
                {PRODUCTS.map((p) => (
                  <ToggleGroupItem key={p.value} value={p.value} label={p.label} />
                ))}
              </ToggleGroup>
            </ToolbarGroup>
          </Toolbar>
          {action}
        </div>
        <Text tone="muted" className="ds-block-note">Space filters · every live chart in this space follows them, in place of its suite’s.</Text>
      </CardBody>
    </Card>
  );
}

/* ── Quick links ────────────────────────────────────────────────────────── */

const hostOf = (url: string) => {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
};

export function LinksBlock({ id, block, action }: { id: string; block: Extract<SpaceBlock, { type: 'links' }>; action?: ReactNode }) {
  return (
    <Card id={id} className="ds-block">
      <CardHeader id={`${id}-header`} title={block.title} description={`${block.links.length} ${block.links.length === 1 ? 'link' : 'links'} · open in a new tab`} action={action} />
      <CardBody>
        {block.links.length ? (
          <ItemGroup className="ds-block-links">
            {block.links.map((l) => (
              <Item
                key={l.id}
                size="sm"
                variant="outline"
                className="ds-block-link"
                onClick={() => toast(`Opening ${l.label}`, { description: `${hostOf(l.url)} opens in a new tab.` })}
              >
                <ItemMedia variant="icon">
                  <ExternalLink />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>{l.label}</ItemTitle>
                  <ItemDescription>{hostOf(l.url)}</ItemDescription>
                </ItemContent>
              </Item>
            ))}
          </ItemGroup>
        ) : (
          <Text tone="muted">No links yet. Use the menu to add some.</Text>
        )}
      </CardBody>
    </Card>
  );
}

/* ── What changed (Aiden) ───────────────────────────────────────────────── */

/** What moved, read from the space's own content. Charts explain themselves; metrics and workflows give their glance. */
export function summarize(state: SuiteState, items: SpaceItem[], filtersFor: (suiteId: string) => NativeFilters): string[] {
  const out: string[] = [];
  for (const i of items) {
    if (i.widgetId) {
      const d = state.dashboards.find((x) => x.id === i.dashboardId);
      const w = d?.native?.widgets.find((x) => x.id === i.widgetId);
      if (d && w) out.push(`${w.title}: ${explain(w, d.name, filtersFor(d.native!.suiteId)).split('. ')[0]}.`);
    } else if (i.assetId) {
      const a = state.assets.find((x) => x.id === i.assetId);
      if (a && a.kind !== 'report') out.push(`${a.name}: ${a.glance}.`);
    } else if (i.block?.type === 'kpis') {
      for (const m of i.block.metricIds) {
        const a = state.assets.find((x) => x.id === m);
        if (a) out.push(`${a.name}: ${a.glance}.`);
      }
    }
  }
  return [...new Set(out)].slice(0, 5);
}

export function SummaryBlock({ id, bullets, action }: { id: string; bullets: string[]; action?: ReactNode }) {
  const { askAiden } = useUi();
  const answer = bullets.length ? bullets.join(' ') : 'Nothing in this space has a number I can read yet.';
  return (
    <Card id={id} className="ds-block ds-block--summary">
      <CardHeader
        id={`${id}-header`}
        title="What changed"
        description="Aiden · read from the charts, metrics and workflows in this space"
        media={
          <span data-surface="aiden">
            <FeaturedIcon Icon={Sparkles} size="sm" appearance="solid" />
          </span>
        }
        action={action}
      />
      <CardBody>
        {bullets.length ? (
          <ul className="ds-block-summary">
            {bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        ) : (
          <Text tone="muted">Add a live chart, a metric or a workflow and Aiden will say what moved.</Text>
        )}
        <div>
          <Button
            id={`${id}-ask`}
            style="link"
            size="sm"
            label="Ask a follow-up"
            IconRight={ArrowUpRight}
            onClick={() => askAiden('What changed in this space?', answer)}
          />
        </div>
      </CardBody>
    </Card>
  );
}

/* ── KPI strip ──────────────────────────────────────────────────────────── */

export function KpiStripBlock({ id, metrics, action }: { id: string; metrics: Asset[]; action?: ReactNode }) {
  return (
    <Card id={id} className="ds-block">
      <CardHeader id={`${id}-header`} title="Key metrics" description={`${metrics.length} ${metrics.length === 1 ? 'metric' : 'metrics'}`} action={action} />
      <CardBody>
        {metrics.length ? (
          <dl className="ds-block-kpis">
            {metrics.map((m) => {
              const [value, change] = m.glance.split(' · ');
              return (
                <div key={m.id} className="ds-block-kpi">
                  <dt className="ds-block-kpi__label">{m.name}</dt>
                  <dd className="ds-block-kpi__value">{value}</dd>
                  {change && <dd className="ds-block-kpi__change">{change}</dd>}
                </div>
              );
            })}
          </dl>
        ) : (
          <Text tone="muted">No metrics chosen. Use the menu to pick some.</Text>
        )}
      </CardBody>
    </Card>
  );
}

/* ── Note ───────────────────────────────────────────────────────────────── */

export function NoteBlock({ id, block }: { id: string; block: Extract<SpaceBlock, { type: 'note' }> }) {
  return <Alert id={id} variant={block.tone} title={block.title || undefined} description={block.text} />;
}

/* ── Divider ────────────────────────────────────────────────────────────── */

export function DividerBlock({ id, block }: { id: string; block: Extract<SpaceBlock, { type: 'divider' }> }) {
  return (
    <div id={id} className="ds-block-divider">
      <Separator label={block.label.trim() ? block.label.trim().toUpperCase() : undefined} />
    </div>
  );
}

/* ── Data freshness ─────────────────────────────────────────────────────────
   Every source behind the space, and whether it loaded on time. A dashboard
   carrying a notice or an unhealthy status counts as late; the rest loaded at
   the morning run. One line when all is well, the late ones named when not. */

type Source = { key: string; name: string; source: string; late: boolean; why?: string };

export function sourcesOf(state: SuiteState, items: SpaceItem[]): Source[] {
  const out = new Map<string, Source>();
  for (const i of items) {
    if (i.assetId) {
      const a = state.assets.find((x) => x.id === i.assetId);
      if (a && a.kind !== 'report') out.set(a.id, { key: a.id, name: a.name, source: a.source, late: false });
      continue;
    }
    if (i.block?.type === 'kpis') {
      for (const m of i.block.metricIds) {
        const a = state.assets.find((x) => x.id === m);
        if (a) out.set(a.id, { key: a.id, name: a.name, source: a.source, late: false });
      }
      continue;
    }
    if (!i.dashboardId) continue;
    const d = state.dashboards.find((x) => x.id === i.dashboardId);
    if (!d || d.external) continue; // an external chart's data is its BI tool's to report
    const late = !!d.notice || d.health !== 'ok';
    out.set(d.id, {
      key: d.id,
      name: d.name,
      source: d.source,
      late,
      why: d.notice ?? (d.health === 'decommissioning' ? 'Being decommissioned — it will stop refreshing.' : d.health === 'unreachable' ? 'The source could not be reached this morning.' : undefined),
    });
  }
  return [...out.values()];
}

export function FreshnessBlock({ id, sources }: { id: string; sources: Source[] }) {
  const late = sources.filter((s) => s.late);
  const headline = !sources.length
    ? 'Nothing here has a data source yet'
    : late.length
      ? `${late.length} of ${sources.length} ${sources.length === 1 ? 'source' : 'sources'} ${late.length === 1 ? 'is' : 'are'} running late`
      : `All ${sources.length} ${sources.length === 1 ? 'source' : 'sources'} loaded on time`;
  return (
    <Card id={id} size="sm" className="ds-block ds-block--freshness">
      <CardBody>
        <div className="ds-block-fresh__head">
          {/* Unlabelled: the headline beside it already says it, so a label would be read twice. */}
          <StatusDot status={!sources.length ? 'offline' : late.length ? 'away' : 'online'} />
          <span className="ds-block-fresh__title">{headline}</span>
          <Text as="span" tone="muted" className="ds-block-fresh__when">Morning run · 6:00 AM ET</Text>
        </div>
        {late.length > 0 && (
          <ul className="ds-block-fresh__late">
            {late.map((s) => (
              <li key={s.key}>
                <strong>{s.name}</strong> · {s.source}
                {s.why ? ` — ${s.why}` : ''}
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}

/* ── One block, whichever it is ─────────────────────────────────────────── */

export function SpaceBlockView({
  id,
  block,
  state,
  items,
  filters,
  onFiltersChange,
  filtersFor,
  action,
}: {
  id: string;
  block: SpaceBlock;
  state: SuiteState;
  items: SpaceItem[];
  filters: NativeFilters;
  onFiltersChange: (f: NativeFilters) => void;
  filtersFor: (suiteId: string) => NativeFilters;
  action?: ReactNode;
}) {
  switch (block.type) {
    case 'filters':
      return <FilterBarBlock id={id} filters={filters} onChange={onFiltersChange} action={action} />;
    case 'links':
      return <LinksBlock id={id} block={block} action={action} />;
    case 'summary':
      return <SummaryBlock id={id} bullets={summarize(state, items, filtersFor)} action={action} />;
    case 'kpis':
      return <KpiStripBlock id={id} metrics={block.metricIds.map((m) => state.assets.find((a) => a.id === m)).filter((a): a is Asset => !!a)} action={action} />;
    case 'note':
      return <NoteBlock id={id} block={block} />;
    case 'divider':
      return <DividerBlock id={id} block={block} />;
    case 'freshness':
      return <FreshnessBlock id={id} sources={sourcesOf(state, items)} />;
  }
}

export const BLOCK_TITLE: Record<SpaceBlock['type'], string> = {
  filters: 'Filter bar',
  links: 'Quick links',
  summary: 'What changed',
  kpis: 'KPI strip',
  note: 'Note',
  divider: 'Divider',
  freshness: 'Data freshness',
};

