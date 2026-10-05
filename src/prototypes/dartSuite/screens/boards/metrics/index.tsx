/* DartBoards · Marketplace › Metrics.

   Kept CONSISTENT with Dashboards (owner, 2026-10-02): metrics live inside DART
   Central, so a metric card behaves exactly like a dashboard card —

   - the CARD (and its title) opens the metric's own page;
   - ONE button: "Add to space", disabled only when every one of your spaces has it;
   - "View metric details" opens the details dialog, like "View dashboard details".

   Web reports are the deliberate exception — they carry a second "Open report"
   button only because they live outside DART Central for now.

   The metric page shows the metric the ways a space can: a number, a trend, and
   each breakdown it has, over a timeframe and product the reader picks. */

import { Check, ChevronDown, Clock, LayoutGrid, List, Plus, Search, SearchX, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import Badge from '../../../../../components/Badge';
import Breadcrumb, { BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../../../../../components/Breadcrumb';
import Button from '../../../../../components/Button';
import Card, { CardBody, CardDescription, CardMedia, CardOverline, CardTitle } from '../../../../../components/Card';
import Combobox from '../../../../../components/Combobox';
import DropdownMenu, { DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from '../../../../../components/DropdownMenu';
import Empty, { EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '../../../../../components/Empty';
import Input from '../../../../../components/Input';
import Item, { ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '../../../../../components/Item';
import PageContainer from '../../../../../components/PageContainer';
import PageHeader from '../../../../../components/PageHeader';
import Section from '../../../../../components/Section';
import ToggleGroup, { ToggleGroupItem } from '../../../../../components/ToggleGroup';
import Toolbar, { ToolbarGroup } from '../../../../../components/Toolbar';
import Grid from '../../../../../components/Grid';
import { useNav } from '../../../nav';
import { useSuite } from '../../../store';
import type { Asset, MetricView, NativeFilters } from '../../../types';
import { useUi } from '../../../ui';
import { PRODUCTS } from '../native/nativeData';
import { BREAKDOWN_LABEL, MetricViewCard, TIMEFRAME_LABEL } from '../space/MetricViewCard';
import { KindLabel } from '../shared/boardsShared';
import { ASSET_SORTS, sortAssets } from '../reports';
import type { AssetSort } from '../reports';
import '../browse/Browse.scss';
import '../native/Native.scss';
import '../space/Space.scss';
import '../reports/Reports.scss';
import './Metrics.scss';

export type Metric = Asset & { metric: NonNullable<Asset['metric']> };
export const isMetric = (a: Asset): a is Metric => a.kind === 'metric' && !!a.metric;

const GRAIN = { day: 'Daily', week: 'Weekly', month: 'Monthly' } as const;
const GRAIN_TO_TIMEFRAME = { day: 'day', week: 'week', month: 'mtd' } as const;
const HUES = ['violet', 'blue', 'emerald', 'amber', 'rose', 'cyan'] as const;
const hueOf = (id: string) => HUES[[...id].reduce((h, c) => h + c.charCodeAt(0), 0) % HUES.length];
const spark = (id: string) => Array.from({ length: 12 }, (_, i) => 35 + Math.round(((Math.sin([...id].reduce((h, c) => h + c.charCodeAt(0), 0) + i * 1.7) + 1) / 2) * 55));

/** A metric's tile: its latest value over a small trend, so it reads as one number, not a dashboard. */
function MetricThumb({ m }: { m: Metric }) {
  const [value, change] = m.glance.split(' · ');
  return (
    <div className={`ds-metric-thumb ds-boards-hue--${hueOf(m.id)}`} aria-hidden="true">
      <div className="ds-metric-thumb__value">
        <span className="ds-metric-thumb__number">{value}</span>
        {change && <span className="ds-metric-thumb__change">{change}</span>}
      </div>
      <div className="ds-metric-thumb__bars">
        {spark(m.id).map((h, i) => (
          <span key={i} style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  );
}

function useSpaces(id: string) {
  const { state } = useSuite();
  const own = state.spaces.filter((s) => !s.shared);
  const n = own.filter((s) => s.items.some((i) => i.assetId === id)).length;
  // Never unavailable: a space can hold several views of one metric.
  return { n, unavailable: false };
}

/* ── Marketplace › Metrics ─────────────────────────────────────────────────── */

/** One metric as a card — shared by Metrics and Marketplace › All. */
export function MetricCard({ m, showKind = false }: { m: Metric; showKind?: boolean }) {
  const { go } = useNav();
  const ui = useUi();
  const { n, unavailable } = useSpaces(m.id);
  const open = () => go({ page: 'metric', id: m.id });
  return (
    <Card id={`ds-metric-card-${m.id}`} interactive className="ds-browse-card" onClick={open}>
      <CardMedia
        ratio={8 / 3}
        overlay={
          <>
            {m.metric.certified && (
              <Badge id={`ds-metric-cert-${m.id}`} className="ds-browse-flag ds-browse-flag--start" label="Certified" IconLeft={Check} color="success" appearance="solid" />
            )}
            {n > 0 && <Badge id={`ds-metric-in-${m.id}`} className="ds-browse-flag ds-browse-flag--end" label={`In ${n} ${n === 1 ? 'space' : 'spaces'}`} color="info" appearance="soft" />}
          </>
        }
      >
        <MetricThumb m={m} />
      </CardMedia>
      <CardBody>
        <div className="ds-browse-card__text">
          {showKind && <KindLabel kind="metric" />}
          <CardOverline>{m.subject}</CardOverline>
          <CardTitle>
            <Button id={`ds-metric-title-${m.id}`} style="link" className="ds-browse-title-link" label={m.name} onClick={open} />
          </CardTitle>
          <CardDescription>{m.description}</CardDescription>
        </div>
        <span className="ds-browse-meta">
          <span className="ds-browse-meta__item">
            <Clock aria-hidden="true" />
            {m.metric.grains.map((g) => GRAIN[g]).join(' · ')}
          </span>
          <span className="ds-browse-meta__item">{m.source}</span>
        </span>
        <div className="ds-browse-card__actions" onClick={(e) => e.stopPropagation()}>
          <Button
            id={`ds-metric-add-${m.id}`}
            label="Add to space"
            disabled={unavailable}
            title={unavailable ? 'Already in every one of your spaces' : undefined}
            onClick={() => ui.openAddAssetToSpace(m.id)}
          />
          <Button id={`ds-metric-info-${m.id}`} style="link" size="sm" label="View metric details" onClick={() => ui.openAssetInfo(m.id)} />
        </div>
      </CardBody>
    </Card>
  );
}

function MetricRow({ m }: { m: Metric }) {
  const { go } = useNav();
  const ui = useUi();
  const { n, unavailable } = useSpaces(m.id);
  const open = () => go({ page: 'metric', id: m.id });
  return (
    <div className="ds-browse-row" onClick={open}>
      <Item variant="outline">
        <ItemMedia variant="icon">
          <TrendingUp />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>
            <Button id={`ds-metric-row-title-${m.id}`} style="link" className="ds-browse-title-link" label={m.name} onClick={open} />
            {m.metric.certified && <Badge id={`ds-metric-row-cert-${m.id}`} label="Certified" color="success" appearance="soft" />}
            {n > 0 && <Badge id={`ds-metric-row-in-${m.id}`} label={`In ${n} ${n === 1 ? 'space' : 'spaces'}`} color="info" appearance="soft" />}
          </ItemTitle>
          <ItemDescription>
            {m.glance} · {m.description}
          </ItemDescription>
          <span className="ds-browse-meta">
            <span className="ds-browse-meta__item">
              <Clock aria-hidden="true" />
              {m.metric.grains.map((g) => GRAIN[g]).join(' · ')} · {m.subject}
            </span>
          </span>
        </ItemContent>
        <ItemActions className="ds-browse-row__actions" onClick={(e) => e.stopPropagation()}>
          <Button
            id={`ds-metric-row-add-${m.id}`}
            size="sm"
            label="Add to space"
            disabled={unavailable}
            title={unavailable ? 'Already in every one of your spaces' : undefined}
            onClick={() => ui.openAddAssetToSpace(m.id)}
          />
          <Button id={`ds-metric-row-info-${m.id}`} style="link" size="sm" label="View metric details" onClick={() => ui.openAssetInfo(m.id)} />
        </ItemActions>
      </Item>
    </div>
  );
}

export function MetricsBrowse() {
  const { state } = useSuite();
  const metrics = state.assets.filter(isMetric);
  const [query, setQuery] = useState('');
  const [view, setView] = useState<'grid' | 'rows'>('grid');
  const [subject, setSubject] = useState('');
  const [sort, setSort] = useState<AssetSort>('name-asc');

  const q = query.trim().toLowerCase();
  const subjects = [...new Set(metrics.map((m) => m.subject))].sort();
  // The same header as Reports and Dashboards (owner, 2026-10-02): search · Subject ·
  // Sort · layout. Grain and "Certified only" filters were dropped with it; a
  // certified metric still says so on its card.
  const list = sortAssets(
    metrics.filter((m) => (!q || `${m.name} ${m.description} ${m.owner} ${m.subject}`.toLowerCase().includes(q)) && (!subject || m.subject === subject)),
    sort,
  );
  const narrowed = !!q || !!subject;

  return (
    <PageContainer className="ds-browse ds-metrics">
      <PageHeader
        id="ds-metrics-header"
        title="Metrics"
        description={narrowed ? `${list.length} of ${metrics.length} metrics match.` : 'Single numbers the teams stand behind, ready to add to a space.'}
        showDivider
        actions={
          <div className="ds-browse-actions">
            <Input id="ds-metrics-search" size="sm" type="search" className="ds-browse-search" placeholder="Search metrics…" IconLeft={Search} value={query} onValueChange={setQuery} aria-label="Search metrics" />
            <Combobox
              id="ds-metrics-subject"
              size="sm"
              label="Subject"
              className="ds-reports-subject ds-reports-subject--bare"
              options={subjects.map((s) => ({ value: s, label: s }))}
              value={subject || undefined}
              onValueChange={setSubject}
              placeholder="Any subject"
              searchPlaceholder="Search subjects…"
              clearable
              clearLabel="Clear subject"
            />
            <DropdownMenu id="ds-metrics-sort">
              <DropdownMenuTrigger>
                <Button id="ds-metrics-sort-trigger" style="outline" size="sm" label={`Sort: ${ASSET_SORTS.find((x) => x.id === sort)!.short}`} IconRight={ChevronDown} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuRadioGroup value={sort} onValueChange={(v) => setSort(v as AssetSort)}>
                  {ASSET_SORTS.map((x) => (
                    <DropdownMenuRadioItem key={x.id} value={x.id}>
                      {x.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <ToggleGroup id="ds-metrics-view" type="single" size="sm" variant="outline" value={view} onValueChange={(v) => v && setView(v as 'grid' | 'rows')} aria-label="View">
              <ToggleGroupItem value="grid" IconCenter={LayoutGrid} aria-label="Grid view" />
              <ToggleGroupItem value="rows" IconCenter={List} aria-label="List view" />
            </ToggleGroup>
          </div>
        }
      />

      {!list.length ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SearchX />
            </EmptyMedia>
            <EmptyTitle>No metrics match</EmptyTitle>
            <EmptyDescription>Try a shorter search, or clear the filters.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button
              id="ds-metrics-clear"
              style="outline"
              label="Clear search and filters"
              onClick={() => {
                setQuery('');
                setSubject('');
              }}
            />
          </EmptyContent>
        </Empty>
      ) : view === 'grid' ? (
        <Grid level={3} minItemWidth="var(--w-64)">
          {list.map((m) => (
            <MetricCard key={m.id} m={m} />
          ))}
        </Grid>
      ) : (
        <div className="ds-browse-rows">
          {list.map((m) => (
            <MetricRow key={m.id} m={m} />
          ))}
        </div>
      )}
    </PageContainer>
  );
}

/* ── A metric's page ───────────────────────────────────────────────────────── */

export function MetricPage({ id }: { id: string }) {
  const { state } = useSuite();
  const { go } = useNav();
  const ui = useUi();
  const m = state.assets.find((a) => a.id === id);
  const [timeframe, setTimeframe] = useState<MetricView['timeframe'] | ''>('');
  const [product, setProduct] = useState('');
  const { unavailable } = useSpaces(id);

  if (!m || !isMetric(m)) {
    return (
      <PageContainer>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SearchX />
            </EmptyMedia>
            <EmptyTitle>This metric is no longer listed</EmptyTitle>
            <EmptyDescription>It may have been retired. Other metrics are still in the Marketplace.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button id="ds-metric-gone" style="outline" label="Back to metrics" onClick={() => go({ page: 'metrics' })} />
          </EmptyContent>
        </Empty>
      </PageContainer>
    );
  }

  const base = `ds-metric-${m.id}`;
  const timeframes = m.metric.grains.map((g) => GRAIN_TO_TIMEFRAME[g]) as MetricView['timeframe'][];
  const tf = (timeframe || timeframes[timeframes.length - 1]) as MetricView['timeframe'];
  const scope: NativeFilters = { period: '13w', product: (product || 'all') as NativeFilters['product'] };

  return (
    <PageContainer className="ds-metric-page">
      <Breadcrumb aria-label="Breadcrumb">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink
              href="#"
              onClick={(e) => {
                e.preventDefault();
                go({ page: 'metrics' });
              }}
            >
              Metrics
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{m.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <PageHeader
        id={`${base}-header`}
        overline={m.subject}
        title={m.name}
        description={m.description}
        meta={
          m.metric.certified ? <Badge id={`${base}-cert`} label="Certified" IconLeft={Check} color="success" appearance="solid" /> : <Badge id={`${base}-src`} label={m.source} color="info" appearance="soft" />
        }
        actions={
          <Button
            id={`${base}-add`}
            label="Add to space"
            IconLeft={Plus}
            disabled={unavailable}
            title={unavailable ? 'Already in every one of your spaces' : undefined}
            onClick={() => ui.openAddAssetToSpace(m.id)}
          />
        }
        toolbar={
          <Toolbar id={`${base}-controls`} label={`Show ${m.name}`} justify="start">
            <ToolbarGroup>
              <ToggleGroup id={`${base}-time`} type="single" size="sm" variant="outline" value={tf} onValueChange={(v) => v && setTimeframe(v as MetricView['timeframe'])} aria-label="Timeframe">
                {timeframes.map((t) => (
                  <ToggleGroupItem key={t} value={t} label={TIMEFRAME_LABEL[t]} />
                ))}
              </ToggleGroup>
            </ToolbarGroup>
            <ToolbarGroup>
              <ToggleGroup id={`${base}-product`} type="single" size="sm" variant="outline" value={product} onValueChange={setProduct} aria-label="Product">
                {PRODUCTS.map((p) => (
                  <ToggleGroupItem key={p.value} value={p.value} label={p.label} />
                ))}
              </ToggleGroup>
            </ToolbarGroup>
          </Toolbar>
        }
      />

      {/* The metric the ways a space can show it. */}
      <div className="ds-native-grid">
        <MetricViewCard id={`${base}-number`} asset={m} view={{ display: 'number', timeframe: tf, breakdown: 'org' }} space={scope} origin={null} />
        <MetricViewCard id={`${base}-trend`} asset={m} view={{ display: 'trend', timeframe: tf, breakdown: 'org' }} space={scope} origin={null} />
        {m.metric.breakdowns.map((b) => (
          <MetricViewCard key={b} id={`${base}-by-${b}`} asset={m} view={{ display: 'breakdown', timeframe: tf, breakdown: b }} space={scope} origin={null} />
        ))}
      </div>

      <Section id={`${base}-about`} heading="About this metric">
        <dl className="ds-report-facts ds-metric-facts">
          <div>
            <dt>Owner</dt>
            <dd>{m.owner}</dd>
          </div>
          <div>
            <dt>Data source</dt>
            <dd>{m.source}</dd>
          </div>
          <div>
            <dt>Grain</dt>
            <dd>{m.metric.grains.map((g) => GRAIN[g]).join(', ')}</dd>
          </div>
          <div>
            <dt>Break down by</dt>
            <dd>{m.metric.breakdowns.map((b) => BREAKDOWN_LABEL[b]).join(', ')}</dd>
          </div>
          <div>
            <dt>Certification</dt>
            <dd>{m.metric.certified ? 'Certified — the definition is agreed and owned' : 'Not certified yet'}</dd>
          </div>
          <div>
            <dt>Updated</dt>
            <dd>{m.updatedAt}</dd>
          </div>
        </dl>
      </Section>
    </PageContainer>
  );
}
