/* DART Central · Admin · 1 LAND — the Admin Overview.

   Figma: Admin Flow 1.1 overview · 1.2 customize mode (edit IN PLACE, the page
   does not navigate) · 1.3 widget picker (a Drawer) · 1.4 customized ·
   1.6 widget removed, with Undo in the toast · 1.5 empty (every widget removed).

   The arrangement is per-admin and lives in `state.widgets`. The store's
   `AdminWidget` union names six widgets; the picker in 1.3 lists more, so the
   extra ids below are stored through a cast (see the area report). */

import { useState } from 'react';
import { ChevronRight, LayoutGrid, Plus } from 'lucide-react';
import { Sparkline } from '../../../../charts';
import Badge from '../../../../components/Badge';
import Button from '../../../../components/Button';
import Item, { ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from '../../../../components/Item';
import Empty, { EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '../../../../components/Empty';
import FeaturedIcon from '../../../../components/FeaturedIcon';
import PageContainer from '../../../../components/PageContainer';
import PageHeader from '../../../../components/PageHeader';
import Table, { TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../../../../components/Table';
import { toast } from '../../../../components/Toast';
import Text from '../../../../components/Text';
import { Bento, BentoPicker, BentoTile } from '../../bento';
import { DEFAULT_WIDGETS, seriesFor } from '../../data';
import { fmtIso } from '../../irm';
import { useNav } from '../../nav';
import { adminStatus, scopeProducts, typeLabel, useSuite } from '../../store';
import type { SuiteState } from '../../store';
import type { ActivityEntry, AdminWidget, BentoSize } from '../../types';
import { byQueueOrder, eventOf, Kpi, PRODUCT_LABEL, RefCode, requesterOf, splitTarget, StatusBadge, ToneBadge, TYPE_ICON, ViewsByProduct, ViewsOverTime } from './shared';
import type { KpiTone } from './shared';
import './Admin.scss';

/* ── The widget catalog (1.3) ─────────────────────────────────────────────── */

type WidgetId =
  | AdminWidget
  | 'kpi-banners'
  | 'kpi-promoted'
  | 'kpi-never-opened'
  | 'queue-5'
  | 'activity-10'
  | 'dash-most-opened'
  | 'banners-displaying'
  | 'promotions-live'
  | 'views-by-product'
  | 'access-recent'
  | 'redirects-top';

type WidgetDef = { id: WidgetId; label: string; group: string; kpi?: boolean; size: BentoSize; sizes: readonly BentoSize[]; bare?: boolean };

const KPI = { kpi: true, size: 3, sizes: [3, 4, 6], bare: true } as const;
const CHART = { size: 6, sizes: [6, 8, 12], bare: true } as const;
const LIST = { size: 4, sizes: [4, 6, 8] } as const;
const TABLE = { size: 12, sizes: [8, 12] } as const;

const CATALOG: WidgetDef[] = [
  { id: 'queue', label: 'Approval queue · top 3', group: 'From Approval Queue', size: 8, sizes: [6, 8, 12] },
  { id: 'queue-5', label: 'Approval queue · top 5', group: 'From Approval Queue', size: 8, sizes: [6, 8, 12] },
  { id: 'kpi-pending', label: 'KPI · Pending approvals', group: 'From Approval Queue', ...KPI },
  { id: 'kpi-approved', label: 'KPI · Approved, not applied', group: 'From Approval Queue', ...KPI },
  { id: 'dash-most-opened', label: 'Dashboards · most opened', group: 'From Dashboards', ...LIST },
  { id: 'kpi-dashboards', label: 'KPI · Dashboards live', group: 'From Dashboards', ...KPI },
  { id: 'kpi-never-opened', label: 'KPI · Never opened in 90 days', group: 'From Dashboards', ...KPI },
  { id: 'banners-displaying', label: 'Banners · currently displaying', group: 'From Banners', ...LIST },
  { id: 'kpi-banners', label: 'KPI · Active banners', group: 'From Banners', ...KPI },
  { id: 'promotions-live', label: 'Promotions · live and scheduled', group: 'From Promotions', ...LIST },
  { id: 'kpi-promoted', label: 'KPI · Live promotions', group: 'From Promotions', ...KPI },
  { id: 'usage', label: 'Chart · Views over time', group: 'From Usage Analytics', ...CHART },
  { id: 'views-by-product', label: 'Chart · Views by product', group: 'From Usage Analytics', ...CHART },
  { id: 'access-recent', label: 'Recent access changes', group: 'From Access Control', ...LIST },
  { id: 'redirects-top', label: 'Redirects · top by hits', group: 'From URL Redirects', ...LIST },
  { id: 'irm-catalog', label: 'What IRM is changing in DartBoards', group: 'From IRM', ...TABLE },
  { id: 'activity', label: 'Recent activity · 5 rows', group: 'Activity', ...TABLE },
  { id: 'activity-10', label: 'Recent activity · 10 rows', group: 'Activity', ...TABLE },
];

const defOf = (id: WidgetId) => CATALOG.find((w) => w.id === id);

export function ActivityTable({ id, rows }: { id: string; rows: ActivityEntry[] }) {
  const { go } = useNav();
  const { state } = useSuite();
  return (
    <Table id={id} label="Recent activity">
      <TableHead>
        <TableRow>
          <TableHeaderCell>Request #</TableHeaderCell>
          <TableHeaderCell>Event</TableHeaderCell>
          <TableHeaderCell>Request</TableHeaderCell>
          <TableHeaderCell>Product</TableHeaderCell>
          <TableHeaderCell>When</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((a) => {
          const [ref, what] = splitTarget(a.target);
          const e = eventOf(a);
          const exists = ref && state.requests.some((r) => r.id === ref);
          return (
            <TableRow key={a.id}>
              <TableCell>
                {ref && exists ? (
                  <Button id={`${id}-ref-${a.id}`} style="link" size="sm" label={ref} onClick={() => go({ page: 'admin-review', id: ref })} />
                ) : ref ? (
                  <RefCode>{ref}</RefCode>
                ) : (
                  '—'
                )}
              </TableCell>
              <TableCell>
                <ToneBadge id={`${id}-ev-${a.id}`} label={e.label} tone={e.tone} />
              </TableCell>
              <TableCell>{what}</TableCell>
              <TableCell>{PRODUCT_LABEL[a.product]}</TableCell>
              <TableCell>{a.at}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

/* ── Widget renderers ────────────────────────────────────────────────────── */

function QueuePreview({ n, state }: { n: number; state: SuiteState }) {
  const { go } = useNav();
  const products = scopeProducts(state.adminScope);
  const rows = state.requests.filter((r) => products.includes(r.product) && adminStatus(r.status).active).sort(byQueueOrder);
  if (!rows.length) return <Text tone="muted">Nothing is waiting. Every request is decided.</Text>;
  // Rows, not cards: a tile of cards inside a card is the stack this layout is meant to escape.
  return (
    <ItemGroup>
      {rows.slice(0, n).map((r) => {
        const key = r.id.replace('#', '');
        return (
          <Item key={r.id} size="sm" onClick={() => go({ page: 'admin-review', id: r.id })}>
            <ItemMedia variant="icon">
              <FeaturedIcon Icon={TYPE_ICON[r.type]} size="sm" color={r.type.startsWith('banner') ? 'warning' : r.type.startsWith('dashboard') ? 'info' : 'default'} />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>{r.title}</ItemTitle>
              <ItemDescription>{`${r.id} · ${typeLabel[r.type]} · ${requesterOf(r).name} · ${r.submittedAt}`}</ItemDescription>
            </ItemContent>
            <ItemActions>
              <StatusBadge id={`ds-ov-q-st-${key}`} request={r} />
            </ItemActions>
          </Item>
        );
      })}
    </ItemGroup>
  );
}

/** A deterministic recent history that ends on today's value — the prototype has no time series for these counts. */
const trendTo = (seed: string, value: number) => {
  // seriesFor ranges 30–100; mapped to ±15% of today's value so the history is plausible for a count.
  const s = seriesFor(seed, 8).map((v) => Math.max(0, Math.round(value * (0.85 + (0.3 * (v - 30)) / 70))));
  s[s.length - 1] = value;
  return s;
};

function kpiFor(id: WidgetId, s: SuiteState): { value: number; label: string; hint: string; tone: KpiTone; good: 'up' | 'down' } {
  const products = scopeProducts(s.adminScope);
  const reqs = s.requests.filter((r) => products.includes(r.product));
  switch (id) {
    case 'kpi-pending':
      return { value: reqs.filter((r) => r.status === 'new' || r.status === 'needs-review').length, label: 'Pending approvals', hint: 'awaiting your review', tone: 'warning', good: 'down' };
    case 'kpi-approved':
      return { value: reqs.filter((r) => r.status === 'approved-not-applied').length, label: 'Approved, not applied', hint: 'staged changes to apply', tone: 'neutral', good: 'down' };
    case 'kpi-dashboards':
      return { value: s.dashboards.filter((d) => d.lifecycle === 'published').length, label: 'Dashboards live', hint: 'in DartBoards', tone: 'neutral', good: 'up' };
    case 'kpi-never-opened':
      return { value: s.dashboards.filter((d) => d.views === 0).length, label: 'Never opened', hint: 'in 90 days', tone: 'neutral', good: 'down' };
    case 'kpi-banners':
      return { value: s.banners.filter((b) => b.state === 'active' && b.visible).length, label: 'Active banners', hint: 'across all products', tone: 'neutral', good: 'up' };
    default:
      return { value: s.promotions.filter((p) => p.state === 'active').length, label: 'Dashboards promoted', hint: 'in DartBoards', tone: 'neutral', good: 'up' };
  }
}

function WidgetBody({ id, state }: { id: WidgetId; state: SuiteState }) {
  const { go } = useNav();
  switch (id) {
    case 'queue':
    case 'queue-5':
      return <QueuePreview n={id === 'queue' ? 3 : 5} state={state} />;
    case 'irm-catalog':
      return <IrmCatalog state={state} />;
    case 'activity':
    case 'activity-10':
      return <ActivityTable id={`ds-ov-act-${id}`} rows={state.activity.slice(0, id === 'activity' ? 5 : 10)} />;
    case 'usage':
      return <ViewsOverTime id="ds-ov-usage" months={['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep']} totals={[31, 36, 40, 38, 44, 48]} />;
    case 'views-by-product':
      return <ViewsByProduct id="ds-ov-byprod" totals={[12, 29, 7]} />;
    case 'dash-most-opened':
      return (
        <ItemGroup>
          {[...state.dashboards]
            .sort((a, b) => b.views - a.views)
            .slice(0, 5)
            .map((d) => (
              <Item key={d.id} size="xs" onClick={() => go({ page: 'dashboard', id: d.id })}>
                <ItemContent>
                  <ItemTitle>{d.name}</ItemTitle>
                  <ItemDescription>{`${d.views.toLocaleString()} views`}</ItemDescription>
                </ItemContent>
                <ItemActions className="ds-ov-trend">
                  <Sparkline id={`ds-ov-mo-${d.id}`} label={`${d.name} views`} data={seriesFor(d.id, 12)} height={24} />
                </ItemActions>
              </Item>
            ))}
        </ItemGroup>
      );
    case 'banners-displaying':
      return (
        <ul className="ds-admin-list">
          {state.banners
            .filter((b) => b.visible && b.state !== 'draft')
            .map((b) => (
              <li key={b.id}>
                <Text as="span">{b.title}</Text>
                <Badge id={`ds-ov-bn-${b.id}`} label={b.state} color={b.state === 'expired' ? 'warning' : 'success'} appearance="soft" />
              </li>
            ))}
        </ul>
      );
    case 'promotions-live':
      return (
        <ul className="ds-admin-list">
          {state.promotions
            .filter((p) => p.state !== 'ended')
            .map((p) => (
              <li key={p.id}>
                <Text as="span">{state.dashboards.find((d) => d.id === p.dashboardId)?.name ?? p.dashboardId}</Text>
                <Text as="span" tone="muted">
                  {p.starts} – {p.ends}
                </Text>
              </li>
            ))}
        </ul>
      );
    case 'access-recent':
      return (
        <ul className="ds-admin-list">
          {state.activity
            .filter((a) => /admin|access/i.test(a.action))
            .slice(0, 5)
            .map((a) => (
              <li key={a.id}>
                <Text as="span">
                  {a.who} {a.action} {a.target}
                </Text>
                <Text as="span" tone="muted">{a.at}</Text>
              </li>
            ))}
          {!state.activity.some((a) => /admin|access/i.test(a.action)) && <li><Text as="span" tone="muted">No access changes yet.</Text></li>}
        </ul>
      );
    case 'redirects-top':
      return (
        <ul className="ds-admin-list">
          {[...state.redirects]
            .sort((a, b) => b.hits - a.hits)
            .map((r) => (
              <li key={r.id}>
                <Text as="span">{r.from}</Text>
                <Text as="span" tone="muted">{r.hits.toLocaleString()} hits</Text>
              </li>
            ))}
        </ul>
      );
    default:
      return null;
  }
}

/* ── The page ────────────────────────────────────────────────────────────── */

export function AdminOverview() {
  const { state, setWidgets, update } = useSuite();
  const { go } = useNav();
  const [editing, setEditing] = useState(false);
  const [picker, setPicker] = useState(false);

  const widgets = (state.widgets as WidgetId[]).filter((w) => defOf(w));
  const save = (next: WidgetId[]) => setWidgets(next as AdminWidget[]);
  const sizeOf = (w: WidgetId) => (state.widgetSizes[w] as BentoSize | undefined) ?? defOf(w)!.size;
  const resize = (w: WidgetId, size: BentoSize) => update((d) => void (d.widgetSizes[w] = size));

  const remove = (w: WidgetId) => {
    const before = widgets;
    save(widgets.filter((x) => x !== w));
    toast(`${defOf(w)?.label ?? 'Widget'} removed`, {
      description: 'It’s still available in Add widget.',
      action: { label: 'Undo', onClick: () => save(before) },
      cancel: { label: 'Dismiss' },
    });
  };
  const move = (i: number, by: -1 | 1) => {
    const next = [...widgets];
    [next[i], next[i + by]] = [next[i + by], next[i]];
    save(next);
  };
  const reset = () => {
    save([...DEFAULT_WIDGETS]);
    update((d) => void (d.widgetSizes = {}));
    toast('Layout reset', { description: 'The original overview is back.' });
  };

  const viewAll = (w: WidgetId) =>
    w === 'queue' || w === 'queue-5' ? (
      <Button id={`ds-ov-all-${w}`} style="link" size="sm" label="View all" IconRight={ChevronRight} onClick={() => go({ page: 'admin-queue' })} />
    ) : w === 'activity' || w === 'activity-10' ? (
      <Button id={`ds-ov-all-${w}`} style="link" size="sm" label="View all" IconRight={ChevronRight} onClick={() => go({ page: 'admin-activity' })} />
    ) : undefined;

  return (
    <PageContainer>
      <PageHeader
        id="ds-ov-header"
        title="Admin Overview"
        description={
          !widgets.length
            ? 'Nothing is on your overview right now. This is your layout, so it doesn’t change what anyone else sees.'
            : editing
              ? 'Arrange your overview: resize, move or remove a widget, or add one. Only you see this layout.'
              : 'Platform-wide health across all DART products.'
        }
        actions={
          editing ? (
            <>
              <Button id="ds-ov-add" style="outline" label="Add widget" IconLeft={Plus} onClick={() => setPicker(true)} />
              <Button id="ds-ov-reset" style="ghost" label="Reset to default" onClick={reset} />
              <Button id="ds-ov-done" label="Done" onClick={() => setEditing(false)} />
            </>
          ) : (
            <Button id="ds-ov-customize" style="outline" label="Customize" IconLeft={LayoutGrid} onClick={() => setEditing(true)} />
          )
        }
      />

      {!widgets.length ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <LayoutGrid />
            </EmptyMedia>
            <EmptyTitle>Your overview is empty</EmptyTitle>
            <EmptyDescription>You have removed every widget. Add one from any admin area, or put the original layout back.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <div className="ds-admin-bar ds-admin-bar--center">
              <Button id="ds-ov-empty-reset" style="ghost" label="Reset to default" onClick={reset} />
              <Button id="ds-ov-empty-add" label="Add widgets" IconLeft={Plus} onClick={() => setPicker(true)} />
            </div>
          </EmptyContent>
        </Empty>
      ) : (
        <Bento editing={editing}>
          {widgets.map((w, i) => {
            const def = defOf(w)!;
            const k = def.kpi ? kpiFor(w, state) : null;
            const trend = k ? trendTo(w, k.value) : [];
            const prev = trend[trend.length - 2];
            return (
              <BentoTile
                key={w}
                id={`ds-ov-${w}`}
                title={editing ? def.label : def.label.replace(/ · .*$/, '')}
                size={sizeOf(w)}
                sizes={def.sizes}
                editing={editing}
                index={i}
                count={widgets.length}
                onResize={(size) => resize(w, size)}
                onMove={(by) => move(i, by)}
                onRemove={() => remove(w)}
                link={viewAll(w)}
                bare={def.bare}
              >
                {k ? (
                  <Kpi
                    id={`ds-ov-kpi-${w}`}
                    value={k.value}
                    label={k.label}
                    hint={k.hint}
                    tone={k.value > 0 ? k.tone : 'neutral'}
                    goodDirection={k.good}
                    change={prev ? Math.round(((k.value - prev) / prev) * 100) : undefined}
                    changeLabel="vs last week"
                    trend={trend}
                  />
                ) : (
                  <WidgetBody id={w} state={state} />
                )}
              </BentoTile>
            );
          })}
        </Bento>
      )}

      {/* 1.3 — the widget picker */}
      <BentoPicker
        id="ds-ov-picker"
        open={picker}
        onClose={() => setPicker(false)}
        description="Anything you can manage, you can watch here. New widgets are added to the end of the page."
        items={CATALOG.map((c) => ({ id: c.id, label: c.label, group: c.group, added: widgets.includes(c.id) }))}
        onToggle={(id, add) => {
          const w = id as WidgetId;
          save(add ? [...widgets, w] : widgets.filter((x) => x !== w));
          if (add) setEditing(true);
        }}
      />
    </PageContainer>
  );
}

/**
 * What IRM is doing to the catalog right now: listings retiring, known issues
 * from open breaks, controls overdue. IRM drives these listings, so an admin
 * should see it coming here rather than stumble on it in Manage.
 */
function IrmCatalog({ state }: { state: SuiteState }) {
  const { go } = useNav();
  const rows = state.dashboards
    .filter((d) => d.lifecycle === 'published' && (d.retiring || d.irmFlags))
    .map((d) => ({
      d,
      what: d.retiring ? `Retiring ${fmtIso(d.retiring.on)}` : d.irmFlags?.incident ? 'Known issue' : 'Controls overdue',
      detail: d.retiring ? 'Hidden from Browse; archives itself on the day' : d.irmFlags?.incident ?? 'Viewers see a notice that figures are not certified',
      tone: (d.retiring ? 'warning' : 'error') as 'warning' | 'error',
    }));
  if (!rows.length) return <Text tone="muted">IRM is not changing any listing right now.</Text>;
  return (
    <Table id="ds-ov-irm" label="What IRM is changing in DartBoards">
      <TableHead>
        <TableRow>
          <TableHeaderCell>Dashboard</TableHeaderCell>
          <TableHeaderCell>From IRM</TableHeaderCell>
          <TableHeaderCell>What it means</TableHeaderCell>
          <TableHeaderCell align="end">
            <span className="ui-table__sr-only">Actions</span>
          </TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map(({ d, what, detail, tone }) => (
          <TableRow key={d.id}>
            <TableCell>
              <Button id={`ds-ov-irm-${d.id}`} style="link" size="sm" className="ds-admin-rowlink" label={d.name} onClick={() => go({ page: 'dashboard', id: d.id })} />
            </TableCell>
            <TableCell>
              <Badge id={`ds-ov-irm-${d.id}-what`} label={what} color={tone} appearance="soft" />
            </TableCell>
            <TableCell>
              <Text as="span" size="sm" tone="muted">{detail}</Text>
            </TableCell>
            <TableCell align="end">
              {d.irm && <Button id={`ds-ov-irm-${d.id}-rec`} size="sm" style="ghost" label="Open in IRM" onClick={() => go({ page: 'irm-record', number: d.irm! })} />}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
