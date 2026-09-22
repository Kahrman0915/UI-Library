/* DART Central · Admin · 5 MANAGE — the estate.

   Figma: Admin Flow 5.1 Dashboards (+ a row menu, b edit drawer, c saved with
   Undo, d loading, e no results, f save failed) · 5.2 Banners (+ a edit drawer)
   · 5.3 Promotions (+ a menu, b drawer) · 5.4 URL Redirects (+ a menu, b drawer)
   · 5.5 Usage Analytics (read-only) · 5.6 Activity · all (read-only log).

   Each editable page carries one KPI, one Add and an edit path. An Add opens
   the same drawer empty, titled "New …", with a Create verb. A state change in
   a menu (Decommission, End promotion early) stays plain; only a true removal
   is red. */

import { useEffect, useMemo, useState } from 'react';
import { Link2, MoreHorizontal, Pencil, Plus, Search, SearchX, Trash2 } from 'lucide-react';
import Alert from '../../../../components/Alert';
import Badge from '../../../../components/Badge';
import Button from '../../../../components/Button';
import Card, { CardBody } from '../../../../components/Card';
import Drawer, { DrawerBody, DrawerFooter, DrawerHeader } from '../../../../components/Drawer';
import DropdownMenu, { DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../../../../components/DropdownMenu';
import Empty, { EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '../../../../components/Empty';
import Input from '../../../../components/Input';
import NativeSelect, { NativeSelectOption } from '../../../../components/NativeSelect';
import PageContainer from '../../../../components/PageContainer';
import PageHeader from '../../../../components/PageHeader';
import Section from '../../../../components/Section';
import Skeleton from '../../../../components/Skeleton';
import Stack from '../../../../components/Stack';
import Switch from '../../../../components/Switch';
import Table, { TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../../../../components/Table';
import Textarea from '../../../../components/Textarea';
import ToggleGroup, { ToggleGroupItem } from '../../../../components/ToggleGroup';
import Toolbar, { ToolbarGroup } from '../../../../components/Toolbar';
import { toast } from '../../../../components/Toast';
import { seriesFor } from '../../data';
import { useNav } from '../../nav';
import { scopeProducts, today, useSuite } from '../../store';
import type { Tone } from '../../store';
import type { Banner, Dashboard, Promotion, Redirect } from '../../types';
import { ConfirmDialog, eventOf, Kpi, parseDate, PRODUCT_LABEL, RefCode, splitTarget, ToneBadge, useFirstLoad, ViewsByProduct, ViewsOverTime } from './shared';
import './Admin.scss';

const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 7)}`;

/* ── Shared pieces ───────────────────────────────────────────────────────── */

function SearchField({ id, placeholder, value, onChange }: { id: string; placeholder: string; value: string; onChange: (v: string) => void }) {
  return <Input id={id} size="sm" aria-label={placeholder} placeholder={placeholder} IconLeft={Search} value={value} onValueChange={onChange} className="ds-admin-search" />;
}

function Filter({ id, value, onChange, options }: { id: string; value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <ToggleGroup id={id} type="single" variant="plain" size="sm" value={value} onValueChange={(v) => onChange(v || 'all')}>
      {options.map(([v, l]) => (
        <ToggleGroupItem key={v} value={v} label={l} />
      ))}
    </ToggleGroup>
  );
}

function NoResults({ id, term, noun, onClear }: { id: string; term: string; noun: string; onClear: () => void }) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <SearchX />
        </EmptyMedia>
        <EmptyTitle>No {noun} match these filters</EmptyTitle>
        <EmptyDescription>{term ? `Nothing matches “${term}”. Check the spelling, or clear the search.` : 'Nothing in this state. Clear the filters to see everything.'}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button id={`${id}-clear`} style="outline" label={term ? 'Clear search' : 'Clear filters'} onClick={onClear} />
      </EmptyContent>
    </Empty>
  );
}

/** 5.1d — header stays, the body is skeleton rows. */
function SkeletonRows({ cols, rows = 5 }: { cols: number; rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }, (_, i) => (
        <TableRow key={i}>
          {Array.from({ length: cols }, (__, j) => (
            <TableCell key={j}>
              <Skeleton shape="text" width={j === 0 ? '70%' : '50%'} />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

function RowMenu({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <DropdownMenu id={id}>
      <DropdownMenuTrigger>
        <Button id={`${id}-trigger`} style="ghost" size="sm" iconOnly IconCenter={MoreHorizontal} aria-label={label} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">{children}</DropdownMenuContent>
    </DropdownMenu>
  );
}

function Select({ id, label, value, onChange, options }: { id: string; label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <NativeSelect id={id} label={label} value={value} onValueChange={onChange}>
      {options.map((o) => (
        <NativeSelectOption key={o} value={o}>
          {o}
        </NativeSelectOption>
      ))}
    </NativeSelect>
  );
}

const req = (v: string, label: string, tried: boolean) => ({
  error: tried && !v.trim(),
  errorMessage: tried && !v.trim() ? `${label} is required.` : undefined,
});

/* ── 5.1 Dashboards ──────────────────────────────────────────────────────── */

const LIFECYCLE_TONE: Record<Dashboard['lifecycle'], Tone> = { draft: 'neutral', 'under-review': 'warning', published: 'success', archived: 'neutral' };
const HEALTH_TONE: Record<Dashboard['health'], Tone> = { ok: 'success', decommissioning: 'warning', unreachable: 'error' };
const inventoryOf = (id: string) => `AST-${4000 + ([...id].reduce((a, c) => a + c.charCodeAt(0), 0) % 900)}`;

type DashDraft = Pick<Dashboard, 'name' | 'owner' | 'category' | 'lifecycle' | 'health' | 'description'>;
const EMPTY_DASH: DashDraft = { name: '', owner: '', category: 'Operations', lifecycle: 'draft', health: 'ok', description: '' };

export function AdminDashboards() {
  const { state, update, logActivity } = useSuite();
  const { go } = useNav();
  const loading = useFirstLoad();
  const [phase, setPhase] = useState('all');
  const [query, setQuery] = useState('');
  const [drawer, setDrawer] = useState<{ id: string | null } | null>(null);
  const [draft, setDraft] = useState<DashDraft>(EMPTY_DASH);
  const [tried, setTried] = useState(false);
  const [failed, setFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [decom, setDecom] = useState<Dashboard | null>(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return state.dashboards
      .filter((d) => phase === 'all' || d.lifecycle === phase)
      .filter((d) => !q || [d.name, d.category, inventoryOf(d.id), d.owner].some((s) => s.toLowerCase().includes(q)));
  }, [state.dashboards, phase, query]);

  const promoted = (id: string) => state.promotions.some((p) => p.dashboardId === id && p.state !== 'ended');
  const live = state.dashboards.filter((d) => d.lifecycle === 'published').length;

  const openEdit = (d: Dashboard | null) => {
    setDraft(d ? { name: d.name, owner: d.owner, category: d.category, lifecycle: d.lifecycle, health: d.health, description: d.description } : EMPTY_DASH);
    setTried(false);
    setFailed(false);
    setDrawer({ id: d?.id ?? null });
  };

  /* 5.1f is reachable on purpose: a name containing "fail" simulates a save
     that does not land. The drawer stays open with the edits intact and the
     error carries Try again. */
  const save = () => {
    if (!draft.name.trim() || !draft.owner.trim()) return setTried(true);
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      if (/fail/i.test(draft.name)) return setFailed(true);
      const editingId = drawer?.id;
      if (editingId) {
        const before = state.dashboards.find((d) => d.id === editingId);
        update((s) => {
          const d = s.dashboards.find((x) => x.id === editingId);
          if (d) Object.assign(d, draft, { updatedAt: today() });
        });
        logActivity('edited', `${draft.name} (direct edit, no request)`);
        toast.success('Changes saved', {
          description: `${draft.name} is updated. Activity records the old values.`,
          action: before ? { label: 'Undo', onClick: () => update((s) => void Object.assign(s.dashboards.find((x) => x.id === editingId) ?? {}, before)) } : undefined,
        });
      } else {
        const id = uid('dash');
        update((s) =>
          void s.dashboards.unshift({
            ...draft,
            id,
            source: 'Tableau',
            tags: ['New'],
            updatedAt: today(),
            views: 0,
            hasAccess: true,
            hue: 'blue',
          }),
        );
        logActivity('created', `${draft.name} (direct, no request)`);
        toast.success('Dashboard created', {
          description: `${draft.name} is a ${draft.lifecycle} dashboard.`,
          action: { label: 'Undo', onClick: () => update((s) => void (s.dashboards = s.dashboards.filter((d) => d.id !== id))) },
        });
      }
      setDrawer(null);
    }, 500);
  };

  const promote = (d: Dashboard) => {
    update((s) =>
      void s.promotions.unshift({ id: uid('pr'), dashboardId: d.id, placement: 'Browse · featured row', starts: today(), ends: '10/31/2026', state: 'active' }),
    );
    logActivity('promoted', d.name);
    toast.success(`${d.name} promoted`, { description: 'On the browse page until 10/31/2026.', action: { label: 'View promotions', onClick: () => go({ page: 'admin-promotions' }) } });
  };

  return (
    <PageContainer>
      <PageHeader
        id="ds-md-header"
        title="Dashboards"
        description="Every dashboard across the products you administer. Lifecycle is where a dashboard is in its life; Health is whether it still works."
        actions={<Kpi id="ds-md-kpi" value={live} label="Published dashboards" hint="Live" tone="info" />}
      />
      <Stack level={4}>
        <Toolbar id="ds-md-toolbar" label="Filter dashboards" justify="between">
          <ToolbarGroup>
            <Filter
              id="ds-md-phase"
              value={phase}
              onChange={setPhase}
              options={[
                ['all', 'All'],
                ['published', 'Published'],
                ['under-review', 'Under review'],
                ['draft', 'Draft'],
                ['archived', 'Archived'],
              ]}
            />
          </ToolbarGroup>
          <ToolbarGroup>
            <SearchField id="ds-md-search" placeholder="Search name, project or inventory number…" value={query} onChange={setQuery} />
            <Button id="ds-md-new" label="New dashboard" IconLeft={Plus} size="sm" onClick={() => openEdit(null)} />
          </ToolbarGroup>
        </Toolbar>

        {!loading && rows.length === 0 ? (
          <NoResults
            id="ds-md-empty"
            term={query.trim()}
            noun="dashboards"
            onClear={() => {
              setQuery('');
              setPhase('all');
            }}
          />
        ) : (
          <Table id="ds-md-table" label="Dashboards">
            <TableHead>
              <TableRow>
                <TableHeaderCell>Name</TableHeaderCell>
                <TableHeaderCell>Project</TableHeaderCell>
                <TableHeaderCell>Inventory</TableHeaderCell>
                <TableHeaderCell>Lifecycle</TableHeaderCell>
                <TableHeaderCell>Health</TableHeaderCell>
                <TableHeaderCell>Promoted</TableHeaderCell>
                <TableHeaderCell>Updated</TableHeaderCell>
                <TableHeaderCell align="end">
                  <span className="ui-table__sr-only">Actions</span>
                </TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <SkeletonRows cols={8} />
              ) : (
                rows.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell>
                      <Button id={`ds-md-open-${d.id}`} style="link" size="sm" label={d.name} className="ds-admin-rowlink" onClick={() => go({ page: 'dashboard', id: d.id })} />
                    </TableCell>
                    <TableCell>{d.category}</TableCell>
                    <TableCell>
                      <RefCode>{inventoryOf(d.id)}</RefCode>
                    </TableCell>
                    <TableCell>
                      <ToneBadge id={`ds-md-lc-${d.id}`} label={d.lifecycle.replace('-', ' ')} tone={LIFECYCLE_TONE[d.lifecycle]} />
                    </TableCell>
                    <TableCell>
                      <ToneBadge id={`ds-md-h-${d.id}`} label={d.health === 'ok' ? 'OK' : d.health} tone={HEALTH_TONE[d.health]} />
                    </TableCell>
                    <TableCell>{promoted(d.id) ? <Badge id={`ds-md-pr-${d.id}`} label="Promoted" color="violet" appearance="soft" /> : <span className="ds-muted">—</span>}</TableCell>
                    <TableCell>{d.updatedAt}</TableCell>
                    <TableCell actions>
                      <RowMenu id={`ds-md-menu-${d.id}`} label={`Actions for ${d.name}`}>
                        <DropdownMenuItem onClick={() => openEdit(d)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem disabled={promoted(d.id) || d.lifecycle !== 'published'} onClick={() => promote(d)}>
                          Promote
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => go({ page: 'admin-usage' })}>View usage</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {d.lifecycle === 'archived' ? (
                          <DropdownMenuItem
                            onClick={() => {
                              update((s) => void Object.assign(s.dashboards.find((x) => x.id === d.id) ?? {}, { lifecycle: 'published', health: 'ok' }));
                              logActivity('published again', d.name);
                              toast.success(`${d.name} is published again`);
                            }}
                          >
                            Publish again
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => setDecom(d)}>Decommission</DropdownMenuItem>
                        )}
                      </RowMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </Stack>

      <Drawer id="ds-md-drawer" open={!!drawer} onClose={() => setDrawer(null)}>
        <DrawerHeader
          id="ds-md-drawer-header"
          title={drawer?.id ? 'Edit dashboard' : 'New dashboard'}
          description="Direct edit, no request. Recorded in Activity under your name."
          onClose={() => setDrawer(null)}
        />
        <DrawerBody>
          <Stack level={3}>
            {failed && (
              <Alert
                id="ds-md-failed"
                variant="error"
                title="Could not save"
                description="The connection dropped before your changes were saved. Nothing has changed yet, and your edits are still here."
                action={<Button id="ds-md-retry" size="sm" style="outline" label="Try again" isLoading={saving} onClick={save} />}
              />
            )}
            <Input id="ds-md-f-name" label="Name" required value={draft.name} onValueChange={(v) => setDraft({ ...draft, name: v })} {...req(draft.name, 'Name', tried)} />
            <Input id="ds-md-f-owner" label="Owner" required value={draft.owner} onValueChange={(v) => setDraft({ ...draft, owner: v })} {...req(draft.owner, 'Owner', tried)} />
            <Select id="ds-md-f-cat" label="Project" value={draft.category} onChange={(v) => setDraft({ ...draft, category: v as Dashboard['category'] })} options={['Operations', 'Finance', 'Sales', 'Customer', 'Risk']} />
            <Select id="ds-md-f-lc" label="Lifecycle" value={draft.lifecycle} onChange={(v) => setDraft({ ...draft, lifecycle: v as Dashboard['lifecycle'] })} options={['draft', 'under-review', 'published', 'archived']} />
            <Select id="ds-md-f-h" label="Health" value={draft.health} onChange={(v) => setDraft({ ...draft, health: v as Dashboard['health'] })} options={['ok', 'decommissioning', 'unreachable']} />
            <Textarea id="ds-md-f-desc" label="Description" rows={3} value={draft.description} onValueChange={(v) => setDraft({ ...draft, description: v })} />
            <p className="ds-muted">
              {failed
                ? 'Nothing was saved, so there’s nothing to undo. Closing this drawer discards the edits above, so use Try again.'
                : 'Nobody asked for this change, so nothing links back to a request. Activity is the only record, and it shows your name, the field and the old value.'}
            </p>
          </Stack>
        </DrawerBody>
        <DrawerFooter>
          <Button id="ds-md-cancel" style="ghost" label="Cancel" onClick={() => setDrawer(null)} />
          <Button id="ds-md-save" label={drawer?.id ? 'Save changes' : 'Create'} isLoading={saving} onClick={save} />
        </DrawerFooter>
      </Drawer>

      <ConfirmDialog
        id="ds-md-decom"
        open={!!decom}
        title="Decommission this dashboard?"
        body={`${decom?.name ?? ''} moves to Archived. It stops appearing in the library and in search, and anyone opening a saved link gets the redirect instead. Nothing is deleted. You can publish it again from this page.`}
        verb="Decommission"
        onClose={() => setDecom(null)}
        onConfirm={() => {
          if (!decom) return;
          update((s) => void Object.assign(s.dashboards.find((x) => x.id === decom.id) ?? {}, { lifecycle: 'archived', health: 'decommissioning' }));
          logActivity('decommissioned', decom.name);
          toast(`${decom.name} decommissioned`, { description: 'Moved to Archived.' });
          setDecom(null);
        }}
      />
    </PageContainer>
  );
}

/* ── 5.2 Banners ─────────────────────────────────────────────────────────── */

const bannerProduct = (b: Banner) => (b.scope.some((s) => /aiden/i.test(s)) ? 'Aiden' : 'DARTBoards');
const SEVERITY_TONE: Record<Banner['variant'], Tone> = { info: 'info', warning: 'warning', success: 'success', error: 'error' };
const STATE_TONE: Record<Banner['state'], Tone> = { draft: 'neutral', scheduled: 'info', active: 'success', expired: 'neutral' };

type BannerDraft = Omit<Banner, 'id' | 'scope'> & { scope: string };
const EMPTY_BANNER: BannerDraft = { title: '', message: '', variant: 'info', scope: '', starts: today(), ends: '', state: 'draft', visible: false };

export function AdminBanners() {
  const { state, update, logActivity } = useSuite();
  const [product, setProduct] = useState('all');
  const [phase, setPhase] = useState('all');
  const [query, setQuery] = useState('');
  const [drawer, setDrawer] = useState<{ id: string | null } | null>(null);
  const [draft, setDraft] = useState<BannerDraft>(EMPTY_BANNER);
  const [tried, setTried] = useState(false);
  const [del, setDel] = useState<Banner | null>(null);

  const rows = state.banners
    .filter((b) => product === 'all' || bannerProduct(b) === product)
    .filter((b) => phase === 'all' || b.state === phase)
    .filter((b) => {
      const q = query.trim().toLowerCase();
      return !q || [b.title, b.message, b.scope.join(' ')].some((s) => s.toLowerCase().includes(q));
    });
  const activeCount = state.banners.filter((b) => b.state === 'active' && b.visible).length;

  const openEdit = (b: Banner | null) => {
    setDraft(b ? { ...b, scope: b.scope.join(', ') } : EMPTY_BANNER);
    setTried(false);
    setDrawer({ id: b?.id ?? null });
  };

  const save = () => {
    if (!draft.title.trim() || !draft.message.trim()) return setTried(true);
    const scope = draft.scope.split(',').map((s) => s.trim()).filter(Boolean);
    const editingId = drawer?.id;
    update((s) => {
      if (editingId) Object.assign(s.banners.find((b) => b.id === editingId) ?? {}, { ...draft, scope });
      else s.banners.unshift({ ...draft, scope, id: uid('bn') });
    });
    logActivity(editingId ? 'edited banner' : 'created banner', draft.title);
    toast.success(editingId ? 'Banner saved' : 'Banner created', { description: draft.title });
    setDrawer(null);
  };

  const products = scopeProducts(state.adminScope);

  return (
    <PageContainer width="narrow">
      <PageHeader
        id="ds-mb-header"
        title="Banners & Notices"
        description="Every banner across the products you administer. A banner displays only when its switch is on and today falls inside its dates."
        actions={<Kpi id="ds-mb-kpi" value={activeCount} label="Active banners" hint={`of ${state.banners.length}`} tone="info" />}
      />
      <Stack level={3}>
        <Toolbar id="ds-mb-toolbar" label="Filter banners" justify="between">
          <ToolbarGroup>
            <Filter id="ds-mb-product" value={product} onChange={setProduct} options={[['all', 'All'], ...products.map((p) => [p, PRODUCT_LABEL[p]] as [string, string])]} />
            <Filter
              id="ds-mb-phase"
              value={phase}
              onChange={setPhase}
              options={[
                ['all', 'All'],
                ['draft', 'Draft'],
                ['scheduled', 'Scheduled'],
                ['active', 'Active'],
                ['expired', 'Expired'],
              ]}
            />
          </ToolbarGroup>
          <ToolbarGroup>
            <Button id="ds-mb-new" size="sm" label="New banner" IconLeft={Plus} onClick={() => openEdit(null)} />
          </ToolbarGroup>
        </Toolbar>
        <SearchField id="ds-mb-search" placeholder="Search banners by title, scope or message…" value={query} onChange={setQuery} />

        {rows.length === 0 ? (
          <NoResults
            id="ds-mb-empty"
            term={query.trim()}
            noun="banners"
            onClear={() => {
              setQuery('');
              setPhase('all');
              setProduct('all');
            }}
          />
        ) : (
          rows.map((b) => (
            <Card key={b.id} id={`ds-mb-card-${b.id}`}>
              <CardBody>
                <div className="ds-admin-banner">
                  <div className="ds-admin-banner__badges">
                    <ToneBadge id={`ds-mb-sev-${b.id}`} label={b.variant} tone={SEVERITY_TONE[b.variant]} />
                    <ToneBadge id={`ds-mb-st-${b.id}`} label={b.state} tone={STATE_TONE[b.state]} />
                    {b.scope.map((s) => (
                      <Badge key={s} id={`ds-mb-sc-${b.id}-${s.replace(/\W+/g, '')}`} label={s} color="default" appearance="soft" />
                    ))}
                  </div>
                  <div className="ds-admin-banner__actions">
                    <Switch
                      id={`ds-mb-vis-${b.id}`}
                      size="sm"
                      label="Displaying"
                      checked={b.visible}
                      onCheckedChange={(on) => {
                        update((s) => void Object.assign(s.banners.find((x) => x.id === b.id) ?? {}, { visible: on }));
                        logActivity(on ? 'switched on banner' : 'switched off banner', b.title);
                        toast(on ? 'Banner switched on' : 'Banner switched off', { description: b.title });
                      }}
                    />
                    <Button id={`ds-mb-edit-${b.id}`} style="ghost" size="sm" iconOnly IconCenter={Pencil} aria-label={`Edit ${b.title}`} onClick={() => openEdit(b)} />
                    <Button id={`ds-mb-del-${b.id}`} style="ghost" size="sm" iconOnly IconCenter={Trash2} aria-label={`Delete ${b.title}`} onClick={() => setDel(b)} />
                  </div>
                </div>
                <p className="ds-admin-banner__title">{b.title}</p>
                <p className="ds-muted">{b.message}</p>
                <p className="ds-admin-banner__meta">
                  {b.starts && `Starts ${b.starts}`}
                  {b.ends ? `  ·  Ends ${b.ends}` : '  ·  No end date'}
                </p>
                {b.state === 'expired' && b.visible && (
                  <Alert
                    id={`ds-mb-expired-${b.id}`}
                    variant="warning"
                    title="Expired, but still displaying"
                    description={`It ended ${b.ends}, and its switch is still on, so users still see it. Switch it off to take it down.`}
                  />
                )}
              </CardBody>
            </Card>
          ))
        )}
      </Stack>

      <Drawer id="ds-mb-drawer" open={!!drawer} onClose={() => setDrawer(null)}>
        <DrawerHeader id="ds-mb-drawer-header" title={drawer?.id ? 'Edit banner' : 'New banner'} description="Direct edit, no request. Recorded in Activity under your name." onClose={() => setDrawer(null)} />
        <DrawerBody>
          <Stack level={3}>
            <Input id="ds-mb-f-title" label="Title" required value={draft.title} onValueChange={(v) => setDraft({ ...draft, title: v })} {...req(draft.title, 'Title', tried)} />
            <Select id="ds-mb-f-sev" label="Severity" value={draft.variant} onChange={(v) => setDraft({ ...draft, variant: v as Banner['variant'] })} options={['info', 'warning', 'success', 'error']} />
            <Input id="ds-mb-f-scope" label="Scope" description="Comma separated: dashboards, or a whole product." value={draft.scope} onValueChange={(v) => setDraft({ ...draft, scope: v })} />
            <Textarea id="ds-mb-f-msg" label="Message" required rows={3} value={draft.message} onValueChange={(v) => setDraft({ ...draft, message: v })} {...req(draft.message, 'Message', tried)} />
            <Input id="ds-mb-f-start" label="Starts" placeholder="MM/DD/YYYY" value={draft.starts} onValueChange={(v) => setDraft({ ...draft, starts: v })} />
            <Input id="ds-mb-f-end" label="Ends" placeholder="No end date" value={draft.ends} onValueChange={(v) => setDraft({ ...draft, ends: v })} />
            <Select id="ds-mb-f-state" label="State" value={draft.state} onChange={(v) => setDraft({ ...draft, state: v as Banner['state'] })} options={['draft', 'scheduled', 'active', 'expired']} />
            <Switch id="ds-mb-f-vis" label="Displaying" checked={draft.visible} onCheckedChange={(v) => setDraft({ ...draft, visible: v })} />
          </Stack>
        </DrawerBody>
        <DrawerFooter>
          <Button id="ds-mb-cancel" style="ghost" label="Cancel" onClick={() => setDrawer(null)} />
          <Button id="ds-mb-save" label={drawer?.id ? 'Save changes' : 'Create'} onClick={save} />
        </DrawerFooter>
      </Drawer>

      <ConfirmDialog
        id="ds-mb-delete"
        open={!!del}
        destructive
        title="Delete this banner?"
        body={`“${del?.title ?? ''}” is removed permanently${del?.visible ? ', and it is currently displaying, so it disappears straight away' : ''}. If you only want it off screen, switch it off instead: that keeps the banner and its dates.`}
        verb="Delete banner"
        onClose={() => setDel(null)}
        onConfirm={() => {
          if (!del) return;
          update((s) => void (s.banners = s.banners.filter((b) => b.id !== del.id)));
          logActivity('deleted banner', del.title);
          toast(`Banner deleted`, { description: del.title });
          setDel(null);
        }}
      />
    </PageContainer>
  );
}

/* ── 5.3 Promotions ──────────────────────────────────────────────────────── */

const PROMO_TONE: Record<Promotion['state'], Tone> = { active: 'success', scheduled: 'info', ended: 'neutral' };
const PROMO_LABEL: Record<Promotion['state'], string> = { active: 'Live', scheduled: 'Scheduled', ended: 'Ended' };
const PLACEMENTS = ['Browse · featured row', 'Home · pinned'];

export function AdminPromotions() {
  const { state, update, logActivity } = useSuite();
  const { go } = useNav();
  const loading = useFirstLoad();
  const [phase, setPhase] = useState('all');
  const [query, setQuery] = useState('');
  const [drawer, setDrawer] = useState<{ id: string | null } | null>(null);
  const [draft, setDraft] = useState<Omit<Promotion, 'id' | 'state'>>({ dashboardId: '', placement: PLACEMENTS[0], starts: today(), ends: '' });
  const [tried, setTried] = useState(false);
  const [ending, setEnding] = useState<Promotion | null>(null);

  const nameOf = (id: string) => state.dashboards.find((d) => d.id === id)?.name ?? id;
  const rows = state.promotions
    .filter((p) => phase === 'all' || p.state === phase)
    .filter((p) => !query.trim() || [nameOf(p.dashboardId), p.placement].some((s) => s.toLowerCase().includes(query.trim().toLowerCase())));
  const liveCount = state.promotions.filter((p) => p.state === 'active').length;

  const openEdit = (p: Promotion | null) => {
    setDraft(p ? { dashboardId: p.dashboardId, placement: p.placement, starts: p.starts, ends: p.ends } : { dashboardId: state.dashboards[0]?.id ?? '', placement: PLACEMENTS[0], starts: today(), ends: '' });
    setTried(false);
    setDrawer({ id: p?.id ?? null });
  };

  const save = () => {
    if (!draft.dashboardId || !draft.starts.trim() || !draft.ends.trim()) return setTried(true);
    const stateOf: Promotion['state'] =
      parseDate(draft.ends) < parseDate(today()) ? 'ended' : parseDate(draft.starts) > parseDate(today()) ? 'scheduled' : 'active';
    const editingId = drawer?.id;
    update((s) => {
      if (editingId) Object.assign(s.promotions.find((p) => p.id === editingId) ?? {}, { ...draft, state: stateOf });
      else s.promotions.unshift({ ...draft, id: uid('pr'), state: stateOf });
    });
    logActivity(editingId ? 'edited promotion' : 'promoted', nameOf(draft.dashboardId));
    toast.success(editingId ? 'Promotion saved' : 'Dashboard promoted', { description: `${nameOf(draft.dashboardId)} · ${draft.starts} – ${draft.ends}` });
    setDrawer(null);
  };

  return (
    <PageContainer>
      <PageHeader
        id="ds-mp-header"
        title="Promotions"
        description="Most promotions come from an approved Promote request; a platform admin can also promote a dashboard directly. Every promotion ends on its own date without anyone doing anything."
        actions={<Kpi id="ds-mp-kpi" value={liveCount} label="Live promotions" hint="ending on their own dates" tone="violet" />}
      />
      <Stack level={4}>
        <Toolbar id="ds-mp-toolbar" label="Filter promotions" justify="between">
          <ToolbarGroup>
            <Filter
              id="ds-mp-phase"
              value={phase}
              onChange={setPhase}
              options={[
                ['all', 'All'],
                ['active', 'Live'],
                ['scheduled', 'Scheduled'],
                ['ended', 'Ended'],
              ]}
            />
          </ToolbarGroup>
          <ToolbarGroup>
            <SearchField id="ds-mp-search" placeholder="Search promotions by dashboard…" value={query} onChange={setQuery} />
            <Button id="ds-mp-new" size="sm" label="Promote a dashboard" IconLeft={Plus} onClick={() => openEdit(null)} />
          </ToolbarGroup>
        </Toolbar>
        {!loading && rows.length === 0 ? (
          <NoResults
            id="ds-mp-empty"
            term={query.trim()}
            noun="promotions"
            onClear={() => {
              setQuery('');
              setPhase('all');
            }}
          />
        ) : (
          <Table id="ds-mp-table" label="Promotions">
            <TableHead>
              <TableRow>
                <TableHeaderCell>Dashboard</TableHeaderCell>
                <TableHeaderCell>Placement</TableHeaderCell>
                <TableHeaderCell>Starts</TableHeaderCell>
                <TableHeaderCell>Ends</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell align="end">
                  <span className="ui-table__sr-only">Actions</span>
                </TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <SkeletonRows cols={6} rows={3} />
              ) : (
                rows.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{nameOf(p.dashboardId)}</TableCell>
                    <TableCell>{p.placement}</TableCell>
                    <TableCell>{p.starts}</TableCell>
                    <TableCell>{p.ends}</TableCell>
                    <TableCell>
                      <ToneBadge id={`ds-mp-st-${p.id}`} label={PROMO_LABEL[p.state]} tone={PROMO_TONE[p.state]} />
                    </TableCell>
                    <TableCell actions>
                      <RowMenu id={`ds-mp-menu-${p.id}`} label={`Actions for ${nameOf(p.dashboardId)}`}>
                        <DropdownMenuItem disabled={p.state === 'ended'} onClick={() => openEdit(p)}>
                          Edit dates
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => go({ page: 'dashboard', id: p.dashboardId })}>Open dashboard</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem disabled={p.state === 'ended'} onClick={() => setEnding(p)}>
                          End promotion early
                        </DropdownMenuItem>
                      </RowMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
        <p className="ds-muted">A promotion is a window, not a switch. It ends on its date whether or not anyone remembers it. The ⋯ menu can end one early.</p>
      </Stack>

      <Drawer id="ds-mp-drawer" open={!!drawer} onClose={() => setDrawer(null)}>
        <DrawerHeader id="ds-mp-drawer-header" title={drawer?.id ? 'Edit promotion' : 'Promote a dashboard'} description="Direct edit, no request. Recorded in Activity under your name." onClose={() => setDrawer(null)} />
        <DrawerBody>
          <Stack level={3}>
            <NativeSelect id="ds-mp-f-dash" label="Dashboard" value={draft.dashboardId} disabled={!!drawer?.id} onValueChange={(v) => setDraft({ ...draft, dashboardId: v })}>
              {state.dashboards.map((d) => (
                <NativeSelectOption key={d.id} value={d.id}>
                  {d.name}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            <Select id="ds-mp-f-place" label="Placement" value={draft.placement} onChange={(v) => setDraft({ ...draft, placement: v })} options={PLACEMENTS} />
            <Input id="ds-mp-f-start" label="Starts" required placeholder="MM/DD/YYYY" value={draft.starts} onValueChange={(v) => setDraft({ ...draft, starts: v })} {...req(draft.starts, 'Start date', tried)} />
            <Input id="ds-mp-f-end" label="Ends" required placeholder="MM/DD/YYYY" value={draft.ends} onValueChange={(v) => setDraft({ ...draft, ends: v })} {...req(draft.ends, 'End date', tried)} />
            <p className="ds-muted">A promotion ends on its own date. Editing the window here doesn’t touch the request it came from.</p>
          </Stack>
        </DrawerBody>
        <DrawerFooter>
          <Button id="ds-mp-cancel" style="ghost" label="Cancel" onClick={() => setDrawer(null)} />
          <Button id="ds-mp-save" label={drawer?.id ? 'Save changes' : 'Create'} onClick={save} />
        </DrawerFooter>
      </Drawer>

      <ConfirmDialog
        id="ds-mp-end"
        open={!!ending}
        title="End this promotion early?"
        body={`${ending ? nameOf(ending.dashboardId) : ''} stops being promoted today instead of ${ending?.ends ?? ''}. It loses its Promoted marker. The dashboard itself is untouched, and you can promote it again from this page.`}
        verb="End promotion"
        onClose={() => setEnding(null)}
        onConfirm={() => {
          if (!ending) return;
          update((s) => void Object.assign(s.promotions.find((p) => p.id === ending.id) ?? {}, { state: 'ended', ends: today() }));
          logActivity('ended promotion early', nameOf(ending.dashboardId));
          toast(`Promotion ended`, { description: nameOf(ending.dashboardId) });
          setEnding(null);
        }}
      />
    </PageContainer>
  );
}

/* ── 5.4 URL Redirects ───────────────────────────────────────────────────── */

/** `Redirect` has no reason or status; both ride on the record (see the area report). */
type RedirectX = Redirect & { reason?: string; inactive?: boolean };

export function AdminRedirects() {
  const { state, update, logActivity } = useSuite();
  const loading = useFirstLoad();
  const [phase, setPhase] = useState('all');
  const [query, setQuery] = useState('');
  const [drawer, setDrawer] = useState<{ id: string | null } | null>(null);
  const [draft, setDraft] = useState({ from: '', to: '', reason: '', status: 'active' });
  const [tried, setTried] = useState(false);
  const [removing, setRemoving] = useState<RedirectX | null>(null);

  const all = state.redirects as RedirectX[];
  const rows = all
    .filter((r) => phase === 'all' || (phase === 'active') === !r.inactive)
    .filter((r) => !query.trim() || [r.from, r.to, r.reason ?? ''].some((s) => s.toLowerCase().includes(query.trim().toLowerCase())));
  const active = all.filter((r) => !r.inactive);
  const hits = active.reduce((a, r) => a + r.hits, 0);

  const openEdit = (r: RedirectX | null) => {
    setDraft(r ? { from: r.from, to: r.to, reason: r.reason ?? '', status: r.inactive ? 'inactive' : 'active' } : { from: '', to: '', reason: '', status: 'active' });
    setTried(false);
    setDrawer({ id: r?.id ?? null });
  };

  const save = () => {
    if (!draft.from.trim().startsWith('/') || !draft.to.trim().startsWith('/')) return setTried(true);
    const editingId = drawer?.id;
    update((s) => {
      const list = s.redirects as RedirectX[];
      const patch = { from: draft.from.trim(), to: draft.to.trim(), reason: draft.reason, inactive: draft.status === 'inactive', updatedAt: today() };
      if (editingId) Object.assign(list.find((r) => r.id === editingId) ?? {}, patch);
      else list.unshift({ ...patch, id: uid('rd'), hits: 0 });
    });
    logActivity(editingId ? 'edited redirect' : 'created redirect', draft.from);
    toast.success(editingId ? 'Redirect saved' : 'Redirect created', { description: `${draft.from} → ${draft.to}` });
    setDrawer(null);
  };

  const pathErr = (v: string, label: string) => ({
    error: tried && !v.trim().startsWith('/'),
    errorMessage: tried && !v.trim().startsWith('/') ? `${label} must be a path starting with /.` : undefined,
  });

  return (
    <PageContainer>
      <PageHeader
        id="ds-mr-header"
        title="URL Redirects"
        description="Keeps old links working after a dashboard is renamed, moved or removed. A link someone pasted into an email two years ago should still land somewhere useful."
        actions={<Kpi id="ds-mr-kpi" value={active.length} label="Active redirects" hint={`${hits.toLocaleString()} hits`} tone="info" />}
      />
      <Stack level={4}>
        <Toolbar id="ds-mr-toolbar" label="Filter redirects" justify="between">
          <ToolbarGroup>
            <Filter
              id="ds-mr-phase"
              value={phase}
              onChange={setPhase}
              options={[
                ['all', 'All'],
                ['active', 'Active'],
                ['inactive', 'Inactive'],
              ]}
            />
          </ToolbarGroup>
          <ToolbarGroup>
            <SearchField id="ds-mr-search" placeholder="Search redirects by path or reason…" value={query} onChange={setQuery} />
            <Button id="ds-mr-new" size="sm" label="New redirect" IconLeft={Plus} onClick={() => openEdit(null)} />
          </ToolbarGroup>
        </Toolbar>
        {!loading && rows.length === 0 ? (
          <NoResults
            id="ds-mr-empty"
            term={query.trim()}
            noun="redirects"
            onClear={() => {
              setQuery('');
              setPhase('all');
            }}
          />
        ) : (
          <Table id="ds-mr-table" label="URL redirects">
            <TableHead>
              <TableRow>
                <TableHeaderCell>From</TableHeaderCell>
                <TableHeaderCell>To</TableHeaderCell>
                <TableHeaderCell>Reason</TableHeaderCell>
                <TableHeaderCell align="end">Hits</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell align="end">
                  <span className="ui-table__sr-only">Actions</span>
                </TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <SkeletonRows cols={6} rows={3} />
              ) : (
                rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <RefCode>{r.from}</RefCode>
                    </TableCell>
                    <TableCell>
                      <RefCode>{r.to}</RefCode>
                    </TableCell>
                    <TableCell>{r.reason || <span className="ds-muted">—</span>}</TableCell>
                    <TableCell numeric>{r.hits.toLocaleString()}</TableCell>
                    <TableCell>
                      <ToneBadge id={`ds-mr-st-${r.id}`} label={r.inactive ? 'Inactive' : 'Active'} tone={r.inactive ? 'neutral' : 'success'} />
                    </TableCell>
                    <TableCell actions>
                      <RowMenu id={`ds-mr-menu-${r.id}`} label={`Actions for ${r.from}`}>
                        <DropdownMenuItem onClick={() => openEdit(r)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            r.inactive
                              ? toast.warning(`${r.from} does not forward`, { description: 'The redirect is inactive, so the old link 404s.' })
                              : toast.success(`${r.from} forwards`, { description: `301 → ${r.to}`, Icon: Link2 })
                          }
                        >
                          Test link
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive" onClick={() => setRemoving(r)}>
                          Remove redirect
                        </DropdownMenuItem>
                      </RowMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
        <p className="ds-muted">Hits is the column that tells you most. A redirect with thousands of hits is load-bearing; one at zero after a year is safe to retire.</p>
      </Stack>

      <Drawer id="ds-mr-drawer" open={!!drawer} onClose={() => setDrawer(null)}>
        <DrawerHeader id="ds-mr-drawer-header" title={drawer?.id ? 'Edit redirect' : 'New redirect'} description="Direct edit, no request. Recorded in Activity under your name." onClose={() => setDrawer(null)} />
        <DrawerBody>
          <Stack level={3}>
            <Input id="ds-mr-f-from" label="From" required placeholder="/dashboards/old-path" value={draft.from} onValueChange={(v) => setDraft({ ...draft, from: v })} {...pathErr(draft.from, 'From')} />
            <Input id="ds-mr-f-to" label="To" required placeholder="/dashboards/new-path" value={draft.to} onValueChange={(v) => setDraft({ ...draft, to: v })} {...pathErr(draft.to, 'To')} />
            <Input id="ds-mr-f-reason" label="Reason" value={draft.reason} onValueChange={(v) => setDraft({ ...draft, reason: v })} />
            <Select id="ds-mr-f-status" label="Status" value={draft.status} onChange={(v) => setDraft({ ...draft, status: v })} options={['active', 'inactive']} />
            <p className="ds-muted">Editing the From path breaks any link already pasted into an email, so add a second redirect instead of repointing this one.</p>
          </Stack>
        </DrawerBody>
        <DrawerFooter>
          <Button id="ds-mr-cancel" style="ghost" label="Cancel" onClick={() => setDrawer(null)} />
          <Button id="ds-mr-save" label={drawer?.id ? 'Save changes' : 'Create'} onClick={save} />
        </DrawerFooter>
      </Drawer>

      <ConfirmDialog
        id="ds-mr-remove"
        open={!!removing}
        destructive
        title="Remove this redirect?"
        body={`${removing?.from ?? ''} stops forwarding. It has taken ${removing?.hits.toLocaleString() ?? 0} hits, and every one of those links 404s from now on. If the old path is still in circulation, set the redirect to Inactive instead: that keeps the record and the hit count.`}
        verb="Remove redirect"
        onClose={() => setRemoving(null)}
        onConfirm={() => {
          if (!removing) return;
          update((s) => void (s.redirects = s.redirects.filter((r) => r.id !== removing.id)));
          logActivity('removed redirect', removing.from);
          toast(`Redirect removed`, { description: removing.from });
          setRemoving(null);
        }}
      />
    </PageContainer>
  );
}

/* ── 5.5 Usage Analytics (read-only) ─────────────────────────────────────── */

const RANGES: Record<string, { label: string; scale: number; months: string[] }> = {
  '30d': { label: 'last 30 days', scale: 1, months: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'] },
  '90d': { label: 'last 90 days', scale: 2.8, months: ['Jul', 'Aug', 'Sep'] },
  '6m': { label: 'last 6 months', scale: 5.6, months: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'] },
};

export function AdminUsage() {
  const { state } = useSuite();
  const { go } = useNav();
  const [range, setRange] = useState('30d');
  const r = RANGES[range];
  const total = state.dashboards.reduce((a, d) => a + d.views, 0);
  const views = Math.round(total * 4.3 * r.scale);
  const never = state.dashboards.filter((d) => d.views === 0);
  const top = [...state.dashboards].sort((a, b) => b.views - a.views);
  const ends = [...top.slice(0, 4), ...top.slice(-2)];
  const byProduct = [0.22, 0.64, 0.14].map((f) => Math.round((views * f) / 1000));

  return (
    <PageContainer>
      <PageHeader
        id="ds-mu-header"
        title="Usage Analytics"
        description="What people actually open, across the products you administer. Use it to decide what to promote, what to decommission, and whether a new dashboard found its audience."
        actions={
          <ToggleGroup id="ds-mu-range" type="single" variant="outline" size="sm" value={range} onValueChange={(v) => setRange(v || '30d')}>
            <ToggleGroupItem value="30d" label="30 days" />
            <ToggleGroupItem value="90d" label="90 days" />
            <ToggleGroupItem value="6m" label="6 months" />
          </ToggleGroup>
        }
      />
      <Stack level={2}>
        <div className="ds-admin-kpis">
          <Kpi id="ds-mu-k1" value={views.toLocaleString()} label="Dashboard views" hint={r.label} tone="info" />
          <Kpi id="ds-mu-k2" value={Math.round(1847 * Math.sqrt(r.scale)).toLocaleString()} label="Active people" hint={r.label} tone="success" />
          <Kpi id="ds-mu-k3" value="6m 12s" label="Median session" hint="across all products" tone="violet" />
          <Kpi id="ds-mu-k4" value={never.length} label="Never opened" hint="live 90+ days, 0 views" tone="error" />
        </div>
        <div className="ds-admin-grid2">
          <ViewsOverTime id="ds-mu-over-time" months={r.months} totals={r.months.map((_, i) => Math.round((views / r.months.length / 1000) * (0.8 + 0.1 * i)))} />
          <ViewsByProduct id="ds-mu-by-product" totals={byProduct as [number, number, number]} />
        </div>
        <Section id="ds-mu-sec-table" heading="Most opened, and least" variant="group">
          <Table id="ds-mu-table" label="Most and least opened dashboards">
            <TableHead>
              <TableRow>
                <TableHeaderCell>Dashboard</TableHeaderCell>
                <TableHeaderCell>Owner</TableHeaderCell>
                <TableHeaderCell align="end">Views</TableHeaderCell>
                <TableHeaderCell>Trend</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ends.map((d) => {
                const s = seriesFor(d.id, 2);
                const delta = d.views === 0 ? null : Math.round(((s[1] - s[0]) / s[0]) * 100);
                return (
                  <TableRow key={d.id}>
                    <TableCell>
                      <Button id={`ds-mu-open-${d.id}`} style="link" size="sm" label={d.name} className="ds-admin-rowlink" onClick={() => go({ page: 'dashboard', id: d.id })} />
                    </TableCell>
                    <TableCell>{d.owner}</TableCell>
                    <TableCell numeric>{Math.round(d.views * r.scale).toLocaleString()}</TableCell>
                    <TableCell>
                      {delta === null ? (
                        <span className="ds-muted">No data</span>
                      ) : (
                        <ToneBadge id={`ds-mu-tr-${d.id}`} label={`${delta >= 0 ? '▲' : '▼'} ${Math.abs(delta)}%`} tone={delta >= 0 ? 'success' : 'error'} />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Section>
        <p className="ds-muted">The bottom of this table is the useful end: a dashboard nobody has looked at in 90 days is a decommission candidate.</p>
      </Stack>
    </PageContainer>
  );
}

/* ── 5.6 Activity · all (read-only log) ──────────────────────────────────── */

export function AdminActivity() {
  const { state } = useSuite();
  const { go } = useNav();
  const loading = useFirstLoad();
  const products = scopeProducts(state.adminScope);
  const [product, setProduct] = useState('all');
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(25);
  useEffect(() => setLimit(25), [product, query]);

  const rows = state.activity
    .filter((a) => products.includes(a.product))
    .filter((a) => product === 'all' || a.product === product)
    .filter((a) => {
      const q = query.trim().toLowerCase();
      return !q || [a.target, a.who, a.action].some((s) => s.toLowerCase().includes(q));
    });

  return (
    <PageContainer>
      <PageHeader id="ds-ma-header" title="Activity" description="Every decision and submission across the products you administer, newest first." />
      <Stack level={4}>
        <Toolbar id="ds-ma-toolbar" label="Filter activity" justify="between">
          <ToolbarGroup>
            <Filter id="ds-ma-product" value={product} onChange={setProduct} options={[['all', 'All'], ...products.map((p) => [p, PRODUCT_LABEL[p]] as [string, string])]} />
          </ToolbarGroup>
          <ToolbarGroup>
            <SearchField id="ds-ma-search" placeholder="Search by reference, request or person…" value={query} onChange={setQuery} />
          </ToolbarGroup>
        </Toolbar>
        {!loading && rows.length === 0 ? (
          <NoResults
            id="ds-ma-empty"
            term={query.trim()}
            noun="events"
            onClear={() => {
              setQuery('');
              setProduct('all');
            }}
          />
        ) : (
          <Table id="ds-ma-table" label="Activity">
            <TableHead>
              <TableRow>
                <TableHeaderCell>When</TableHeaderCell>
                <TableHeaderCell>Event</TableHeaderCell>
                <TableHeaderCell>Reference</TableHeaderCell>
                <TableHeaderCell>Request</TableHeaderCell>
                <TableHeaderCell>Product</TableHeaderCell>
                <TableHeaderCell>By</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <SkeletonRows cols={6} />
              ) : (
                rows.slice(0, limit).map((a) => {
                  const [ref, what] = splitTarget(a.target);
                  const e = eventOf(a);
                  const exists = ref && state.requests.some((r) => r.id === ref);
                  return (
                    <TableRow key={a.id}>
                      <TableCell>{a.at}</TableCell>
                      <TableCell>
                        <ToneBadge id={`ds-ma-ev-${a.id}`} label={e.label} tone={e.tone} />
                      </TableCell>
                      <TableCell>
                        {ref && exists ? (
                          <Button id={`ds-ma-ref-${a.id}`} style="link" size="sm" label={ref} onClick={() => go({ page: 'admin-review', id: ref })} />
                        ) : ref ? (
                          <RefCode>{ref}</RefCode>
                        ) : (
                          <span className="ds-muted">—</span>
                        )}
                      </TableCell>
                      <TableCell>{what}</TableCell>
                      <TableCell>{PRODUCT_LABEL[a.product]}</TableCell>
                      <TableCell>{a.who}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}
        {!loading && rows.length > limit && (
          <div>
            <Button id="ds-ma-more" style="outline" size="sm" label={`Show ${Math.min(25, rows.length - limit)} more`} onClick={() => setLimit((l) => l + 25)} />
          </div>
        )}
      </Stack>
    </PageContainer>
  );
}
