/* DART Central · Admin · 1 LAND — the Admin Overview.

   Figma: Admin Flow 1.1 overview · 1.2 customize mode (edit IN PLACE, the page
   does not navigate) · 1.3 widget picker (a Drawer) · 1.4 customized ·
   1.6 widget removed, with Undo in the toast · 1.5 empty (every widget removed).

   The arrangement is per-admin and lives in `state.widgets`. The store's
   `AdminWidget` union names six widgets; the picker in 1.3 lists more, so the
   extra ids below are stored through a cast (see the area report). */

import { useState } from 'react';
import { ArrowDown, ArrowUp, LayoutGrid, Plus, X } from 'lucide-react';
import Badge from '../../../../components/Badge';
import Button from '../../../../components/Button';
import Card, { CardBody } from '../../../../components/Card';
import Drawer, { DrawerBody, DrawerFooter, DrawerHeader } from '../../../../components/Drawer';
import Empty, { EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '../../../../components/Empty';
import FeaturedIcon from '../../../../components/FeaturedIcon';
import PageContainer from '../../../../components/PageContainer';
import PageHeader from '../../../../components/PageHeader';
import Section from '../../../../components/Section';
import Stack from '../../../../components/Stack';
import Table, { TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../../../../components/Table';
import Alert from '../../../../components/Alert';
import { toast } from '../../../../components/Toast';
import { DEFAULT_WIDGETS } from '../../data';
import { useNav } from '../../nav';
import { adminStatus, scopeProducts, typeLabel, useSuite } from '../../store';
import type { SuiteState } from '../../store';
import type { ActivityEntry, AdminWidget } from '../../types';
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

type WidgetDef = { id: WidgetId; label: string; group: string; kpi?: boolean };

const CATALOG: WidgetDef[] = [
  { id: 'queue', label: 'Approval queue · top 3', group: 'From Approval Queue' },
  { id: 'queue-5', label: 'Approval queue · top 5', group: 'From Approval Queue' },
  { id: 'kpi-pending', label: 'KPI · Pending approvals', group: 'From Approval Queue', kpi: true },
  { id: 'kpi-approved', label: 'KPI · Approved, not applied', group: 'From Approval Queue', kpi: true },
  { id: 'dash-most-opened', label: 'Dashboards · most opened', group: 'From Dashboards' },
  { id: 'kpi-dashboards', label: 'KPI · Dashboards live', group: 'From Dashboards', kpi: true },
  { id: 'kpi-never-opened', label: 'KPI · Never opened in 90 days', group: 'From Dashboards', kpi: true },
  { id: 'banners-displaying', label: 'Banners · currently displaying', group: 'From Banners' },
  { id: 'kpi-banners', label: 'KPI · Active banners', group: 'From Banners', kpi: true },
  { id: 'promotions-live', label: 'Promotions · live and scheduled', group: 'From Promotions' },
  { id: 'kpi-promoted', label: 'KPI · Live promotions', group: 'From Promotions', kpi: true },
  { id: 'usage', label: 'Chart · Views over time', group: 'From Usage Analytics' },
  { id: 'views-by-product', label: 'Chart · Views by product', group: 'From Usage Analytics' },
  { id: 'access-recent', label: 'Recent access changes', group: 'From Access Control' },
  { id: 'redirects-top', label: 'Redirects · top by hits', group: 'From URL Redirects' },
  { id: 'activity', label: 'Recent activity · 5 rows', group: 'Activity' },
  { id: 'activity-10', label: 'Recent activity · 10 rows', group: 'Activity' },
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
  if (!rows.length) return <p className="ds-muted">Nothing is waiting. Every request is decided.</p>;
  return (
    <Stack level={4}>
      {rows.slice(0, n).map((r) => {
        const key = r.id.replace('#', '');
        const open = () => go({ page: 'admin-review', id: r.id });
        return (
          <Card key={r.id} id={`ds-ov-q-${key}`} interactive size="sm" onClick={open}>
            <CardBody>
              <div className="ds-admin-qcard">
                <FeaturedIcon Icon={TYPE_ICON[r.type]} color={r.type.startsWith('banner') ? 'warning' : r.type.startsWith('dashboard') ? 'info' : 'default'} />
                <div className="ds-admin-qcard__text">
                  <p className="ds-muted">
                    {r.id}  ·  {typeLabel[r.type]}  ·  {requesterOf(r).name}
                  </p>
                  <Button
                    id={`ds-ov-q-open-${key}`}
                    style="link"
                    label={r.title}
                    className="ds-admin-rowlink ds-admin-qcard__title"
                    onClick={open}
                  />
                  <p className="ds-muted">{r.summary}</p>
                </div>
                <div className="ds-admin-status">
                  <StatusBadge id={`ds-ov-q-st-${key}`} request={r} />
                  <span className="ds-muted">{r.submittedAt}</span>
                </div>
              </div>
            </CardBody>
          </Card>
        );
      })}
    </Stack>
  );
}

function kpiFor(id: WidgetId, s: SuiteState): { value: string | number; label: string; hint: string; tone: KpiTone } {
  const products = scopeProducts(s.adminScope);
  const reqs = s.requests.filter((r) => products.includes(r.product));
  switch (id) {
    case 'kpi-pending':
      return { value: reqs.filter((r) => r.status === 'new' || r.status === 'needs-review').length, label: 'Pending approvals', hint: 'awaiting your review', tone: 'error' };
    case 'kpi-approved':
      return { value: reqs.filter((r) => r.status === 'approved-not-applied').length, label: 'Approved, not applied', hint: 'staged changes to apply', tone: 'warning' };
    case 'kpi-dashboards':
      return { value: s.dashboards.filter((d) => d.lifecycle === 'published').length, label: 'Dashboards live', hint: 'in Dart Central', tone: 'success' };
    case 'kpi-never-opened':
      return { value: s.dashboards.filter((d) => d.views === 0).length, label: 'Never opened', hint: 'in 90 days', tone: 'violet' };
    case 'kpi-banners':
      return { value: s.banners.filter((b) => b.state === 'active' && b.visible).length, label: 'Active banners', hint: 'across all products', tone: 'info' };
    default:
      return { value: s.promotions.filter((p) => p.state === 'active').length, label: 'Dashboards promoted', hint: 'in Dart Central', tone: 'violet' };
  }
}

/** Widgets that are charts, and the run-grouping that sets them side by side. */
const CHART_WIDGETS: WidgetId[] = ['usage', 'views-by-product'];
function groupCharts(list: WidgetId[]): (WidgetId | WidgetId[])[] {
  const out: (WidgetId | WidgetId[])[] = [];
  for (const w of list) {
    const last = out[out.length - 1];
    if (CHART_WIDGETS.includes(w)) Array.isArray(last) ? last.push(w) : out.push([w]);
    else out.push(w);
  }
  return out;
}

function WidgetBody({ id, state }: { id: WidgetId; state: SuiteState }) {
  const { go } = useNav();
  switch (id) {
    case 'queue':
    case 'queue-5':
      return <QueuePreview n={id === 'queue' ? 3 : 5} state={state} />;
    case 'activity':
    case 'activity-10':
      return <ActivityTable id={`ds-ov-act-${id}`} rows={state.activity.slice(0, id === 'activity' ? 5 : 10)} />;
    case 'usage':
      return <ViewsOverTime id="ds-ov-usage" months={['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep']} totals={[31, 36, 40, 38, 44, 48]} />;
    case 'views-by-product':
      return <ViewsByProduct id="ds-ov-byprod" totals={[12, 29, 7]} />;
    case 'dash-most-opened':
      return (
        <ul className="ds-admin-list">
          {[...state.dashboards]
            .sort((a, b) => b.views - a.views)
            .slice(0, 5)
            .map((d) => (
              <li key={d.id}>
                <Button id={`ds-ov-mo-${d.id}`} style="link" size="sm" label={d.name} onClick={() => go({ page: 'dashboard', id: d.id })} />
                <span className="ds-muted">{d.views.toLocaleString()} views</span>
              </li>
            ))}
        </ul>
      );
    case 'banners-displaying':
      return (
        <ul className="ds-admin-list">
          {state.banners
            .filter((b) => b.visible && b.state !== 'draft')
            .map((b) => (
              <li key={b.id}>
                <span className="ds-text">{b.title}</span>
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
                <span className="ds-text">{state.dashboards.find((d) => d.id === p.dashboardId)?.name ?? p.dashboardId}</span>
                <span className="ds-muted">
                  {p.starts} – {p.ends}
                </span>
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
                <span className="ds-text">
                  {a.who} {a.action} {a.target}
                </span>
                <span className="ds-muted">{a.at}</span>
              </li>
            ))}
          {!state.activity.some((a) => /admin|access/i.test(a.action)) && <li className="ds-muted">No access changes yet.</li>}
        </ul>
      );
    case 'redirects-top':
      return (
        <ul className="ds-admin-list">
          {[...state.redirects]
            .sort((a, b) => b.hits - a.hits)
            .map((r) => (
              <li key={r.id}>
                <span className="ds-text">{r.from}</span>
                <span className="ds-muted">{r.hits.toLocaleString()} hits</span>
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
  const { state, setWidgets } = useSuite();
  const { go } = useNav();
  const [editing, setEditing] = useState(false);
  const [picker, setPicker] = useState(false);

  const widgets = state.widgets as WidgetId[];
  const save = (next: WidgetId[]) => setWidgets(next as AdminWidget[]);

  const kpis = widgets.filter((w) => defOf(w)?.kpi);
  const blocks = widgets.filter((w) => defOf(w) && !defOf(w)?.kpi);

  const remove = (w: WidgetId) => {
    const before = widgets;
    const next = widgets.filter((x) => x !== w);
    save(next);
    const label = defOf(w)?.label ?? 'Widget';
    toast(`${label} removed`, {
      description: 'It’s still available in Add widget.',
      action: { label: 'Undo', onClick: () => save(before) },
      cancel: { label: 'Dismiss' },
    });
  };

  const move = (w: WidgetId, dir: -1 | 1) => {
    const list = defOf(w)?.kpi ? kpis : blocks;
    const i = list.indexOf(w);
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    const swapWith = list[j];
    const next = [...widgets];
    const a = next.indexOf(w);
    const b = next.indexOf(swapWith);
    [next[a], next[b]] = [next[b], next[a]];
    save(next);
  };

  const reset = () => {
    save([...DEFAULT_WIDGETS]);
    toast('Layout reset', { description: 'The original overview is back.' });
  };

  const controls = (w: WidgetId, list: WidgetId[]) =>
    editing && (
      <div className="ds-admin-wctl">
        <Button id={`ds-ov-up-${w}`} style="ghost" size="xs" iconOnly IconCenter={ArrowUp} aria-label={`Move ${defOf(w)?.label} earlier`} disabled={list.indexOf(w) === 0} onClick={() => move(w, -1)} />
        <Button id={`ds-ov-down-${w}`} style="ghost" size="xs" iconOnly IconCenter={ArrowDown} aria-label={`Move ${defOf(w)?.label} later`} disabled={list.indexOf(w) === list.length - 1} onClick={() => move(w, 1)} />
        <Button id={`ds-ov-rm-${w}`} style="ghost" size="xs" iconOnly IconCenter={X} aria-label={`Remove ${defOf(w)?.label}`} onClick={() => remove(w)} />
      </div>
    );

  const isEmpty = widgets.filter((w) => defOf(w)).length === 0;

  return (
    <PageContainer>
      <PageHeader
        id="ds-ov-header"
        title="Admin Overview"
        description={isEmpty ? 'Nothing is on your overview right now. This is your layout, so it doesn’t change what anyone else sees.' : 'Platform-wide health across all DART products.'}
        actions={
          editing ? (
            <>
              <Button id="ds-ov-reset" style="ghost" label="Reset to default" onClick={reset} />
              <Button id="ds-ov-done" label="Done" onClick={() => setEditing(false)} />
            </>
          ) : (
            <Button id="ds-ov-customize" style="outline" label="Customize" onClick={() => setEditing(true)} />
          )
        }
      />

      {isEmpty ? (
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
        <Stack level={2}>
          {editing && (
            <Alert
              id="ds-ov-editing"
              variant="info"
              title="Editing your layout"
              description="Reorder a card with its arrows, or remove what you don’t use. Removing is undoable, and Reset to default puts the original layout back. Only you see this layout."
            />
          )}
          {kpis.length > 0 && (
            <div className="ds-admin-kpis">
              {kpis.map((w) => {
                const k = kpiFor(w, state);
                return (
                  <div key={w} className={editing ? 'ds-admin-widget ds-admin-widget--editing' : 'ds-admin-widget'}>
                    {controls(w, kpis)}
                    <Kpi id={`ds-ov-kpi-${w}`} {...k} />
                  </div>
                );
              })}
            </div>
          )}
          {groupCharts(blocks).map((w) => {
            // Charts title themselves (Figma's Chart is card + title), so they take no
            // Section heading; a run of them shares a row, as in Figma's 1.4.
            if (Array.isArray(w))
              return (
                <div key={w.join('+')} className="ds-admin-grid2">
                  {w.map((c) => (
                    <div key={c} className={editing ? 'ds-admin-widget ds-admin-widget--editing' : 'ds-admin-widget'}>
                      {controls(c, blocks)}
                      <WidgetBody id={c} state={state} />
                    </div>
                  ))}
                </div>
              );
            const def = defOf(w)!;
            const viewAll =
              w === 'queue' || w === 'queue-5' ? (
                <Button id={`ds-ov-all-${w}`} style="link" size="sm" label="View all" onClick={() => go({ page: 'admin-queue' })} />
              ) : w === 'activity' || w === 'activity-10' ? (
                <Button id={`ds-ov-all-${w}`} style="link" size="sm" label="View all" onClick={() => go({ page: 'admin-activity' })} />
              ) : undefined;
            const heading = editing ? def.label : def.label.replace(/ · .*$/, '');
            return (
              <div key={w} className={editing ? 'ds-admin-widget ds-admin-widget--editing' : 'ds-admin-widget'}>
                <Section
                  id={`ds-ov-sec-${w}`}
                  heading={heading}
                  variant="group"
                  actions={
                    <>
                      {viewAll}
                      {controls(w, blocks)}
                    </>
                  }
                >
                  <WidgetBody id={w} state={state} />
                </Section>
              </div>
            );
          })}
          {editing && (
            <div>
              <Button id="ds-ov-add" style="outline" label="Add widget" IconLeft={Plus} onClick={() => setPicker(true)} />
            </div>
          )}
        </Stack>
      )}

      {/* 1.3 — the widget picker */}
      <Drawer id="ds-ov-picker" open={picker} onClose={() => setPicker(false)}>
        <DrawerHeader
          id="ds-ov-picker-header"
          title="Add a widget"
          description="Anything you can manage, you can watch here. New widgets are added to the bottom of the page."
          onClose={() => setPicker(false)}
        />
        <DrawerBody>
          <Stack level={3}>
            {[...new Set(CATALOG.map((c) => c.group))].map((g) => (
              <Section key={g} id={`ds-ov-pick-${g.replace(/\W+/g, '-').toLowerCase()}`} heading={g} variant="group" headingLevel="h3">
                <ul className="ds-admin-list">
                  {CATALOG.filter((c) => c.group === g).map((c) => {
                    const added = widgets.includes(c.id);
                    return (
                      <li key={c.id}>
                        <span className="ds-text">{c.label}</span>
                        <Button
                          id={`ds-ov-pick-${c.id}`}
                          size="xs"
                          style={added ? 'ghost' : 'outline'}
                          label={added ? 'Added' : 'Add'}
                          onClick={() => {
                            if (added) save(widgets.filter((w) => w !== c.id));
                            else {
                              save([...widgets, c.id]);
                              setEditing(true);
                            }
                          }}
                        />
                      </li>
                    );
                  })}
                </ul>
              </Section>
            ))}
          </Stack>
        </DrawerBody>
        <DrawerFooter>
          <Button id="ds-ov-picker-done" label="Done" onClick={() => setPicker(false)} />
        </DrawerFooter>
      </Drawer>
    </PageContainer>
  );
}
