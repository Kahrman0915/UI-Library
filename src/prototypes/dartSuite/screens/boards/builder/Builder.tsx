/* DartBoards · the Builder (Figma page "Builder", 2618:15730).

   THE BUILDER IS AN EDITABLE VIEW OF THE SPACE ITSELF. The canvas renders the
   same cards the space page renders, with edit chrome over them; the side panel
   floats over the canvas and never takes width from it; the tool rail on the
   right edge switches panels. Three ways in, one tool:

   - "+ New space"         → no spaceId                    BL1.1 · BL1.3 · BL1.4
   - "Add to new space"    → seedDashboardId               BL1.2
   - "Edit space"          → spaceId (loads first)         BL2.4 · BL2.1 · BL2.3 · BL2.5

   One commit, labeled by existence: "Create space" (needs a name) or "Done".
   Leaving with uncommitted work is guarded (BL3.3). */

import {
  ArrowDown,
  ArrowUp,
  Ellipsis,
  Eye,
  EyeOff,
  Filter,
  Heading,
  Inbox,
  LayoutGrid,
  LayoutTemplate,
  Plus,
  Settings,
  SquarePlus,
  Trash2,
  Undo2,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import Alert from '../../../../../components/Alert';
import AlertDialog, { AlertDialogBody, AlertDialogFooter, AlertDialogHeader } from '../../../../../components/AlertDialog';
import Button from '../../../../../components/Button';
import Canvas, { CanvasItem } from '../../../../../components/Canvas';
import ScrollArea from '../../../../../components/ScrollArea';
import Dialog, { DialogBody, DialogFooter, DialogHeader } from '../../../../../components/Dialog';
import DropdownMenu, {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../../../components/DropdownMenu';
import Empty, { EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '../../../../../components/Empty';
import Input from '../../../../../components/Input';
import PageContainer from '../../../../../components/PageContainer';
import Section from '../../../../../components/Section';
import Stack from '../../../../../components/Stack';
import { toast } from '../../../../../components/Toast';
import ToggleGroup, { ToggleGroupItem } from '../../../../../components/ToggleGroup';
import { DISCARD_BUILDER, useLeaveGuard, useNav } from '../../../nav';
import { useSuite } from '../../../store';
import type { Dashboard, Space, SpaceCardLayout, SpaceItem } from '../../../types';
import { useUi } from '../../../ui';
import { SpaceCard, SpaceCardSkeleton } from '../space/SpaceCards';
import { gridClass, groupBySection } from '../space/spaceLayout';
import type { LayoutPreset } from '../space/spaceLayout';
import {
  ComponentsPanel,
  DashboardsPanel,
  FiltersPanel,
  LayoutPanel,
  NO_FILTERS,
  PANEL_META,
  SettingsPanel,
} from './panels';
import type { ComponentKind, Filters, PanelId, SettingsValue } from './panels';
import '../space/Space.scss';
import './Builder.scss';

type Draft = {
  name: string;
  description: string;
  hue: Space['hue'];
  items: SpaceItem[];
  preset: LayoutPreset;
};

/* The panel + tool rail width, for the Aiden Fab (CLAUDE.md: Fab). Same calc as
   `--ds-builder-panel` + `--ds-builder-rail` in Builder.scss. */
const FAB_INSET_OPEN = 'calc(var(--p-6) + var(--w-96) + var(--w-9) + var(--w-14))';
const FAB_INSET_CLOSED = 'calc(var(--p-6) + var(--w-14))';

const RAIL: { id: PanelId; label: string; Icon: typeof Plus }[] = [
  { id: 'components', label: 'Add components', Icon: SquarePlus },
  { id: 'dashboards', label: 'Add dashboards', Icon: LayoutGrid },
  { id: 'filters', label: 'Configure filters', Icon: Filter },
  { id: 'layout', label: 'Layout presets', Icon: LayoutTemplate },
  { id: 'settings', label: 'Space settings', Icon: Settings },
];

export function Builder({ spaceId, seedDashboardId }: { spaceId?: string; seedDashboardId?: string }) {
  const { state, saveSpace } = useSuite();
  const nav = useNav();
  const { openAddToSpace, openGetAccess } = useUi();
  const existing = spaceId ? state.spaces.find((s) => s.id === spaceId) : undefined;
  const seed = seedDashboardId ? state.dashboards.find((d) => d.id === seedDashboardId) : undefined;

  const initial = useMemo<Draft>(
    () =>
      existing
        ? {
            name: existing.name,
            description: existing.description,
            hue: existing.hue,
            items: structuredClone(existing.items),
            preset: existing.layout ?? 'auto',
          }
        : {
            name: '',
            description: '',
            hue: 'blue',
            items: seed ? [{ dashboardId: seed.id, layout: 'thumbnail' }] : [],
            preset: 'auto',
          },
    // The draft starts from the space as it was when the builder opened.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const [draft, setDraft] = useState<Draft>(initial);
  const [history, setHistory] = useState<Draft[]>([]);
  const commit = (next: Draft | ((d: Draft) => Draft)) => {
    setHistory((h) => [...h, draft]);
    setDraft((d) => (typeof next === 'function' ? next(d) : next));
  };
  const undo = () => {
    const prev = history[history.length - 1];
    if (!prev) return;
    setHistory((h) => h.slice(0, -1));
    setDraft(prev);
  };

  const [loading, setLoading] = useState(!!spaceId);
  useEffect(() => {
    if (!spaceId) return;
    const t = window.setTimeout(() => setLoading(false), 700);
    return () => window.clearTimeout(t);
  }, [spaceId]);

  const [panel, setPanel] = useState<PanelId | null>('components');
  const [preview, setPreview] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const [seedAlert, setSeedAlert] = useState(!!seed);
  const [settings, setSettings] = useState<SettingsValue>({ layout: 'thumbnail', hue: initial.hue });
  const [headingFor, setHeadingFor] = useState<string | null>(null);
  const [heading, setHeading] = useState('');
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [committed, setCommitted] = useState(false);
  const dragging = useRef<string | null>(null);
  // Typing in the title is one undo step per edit session, not one per key.
  const focusSnap = useRef<Draft | null>(null);
  const textProps = {
    readOnly: preview,
    onFocus: () => void (focusSnap.current = draft),
    onBlur: () => {
      const snap = focusSnap.current;
      focusSnap.current = null;
      if (snap && (snap.name !== draft.name || snap.description !== draft.description)) setHistory((h) => [...h, snap]);
    },
  };

  const dirty = !leaving && !committed && (existing ? JSON.stringify(draft) !== JSON.stringify(initial) : !!(draft.name.trim() || draft.description.trim() || draft.items.length));
  useLeaveGuard(dirty ? DISCARD_BUILDER : null);

  // Cancel → back, once the guard above has been lifted by `leaving`.
  useEffect(() => {
    if (!leaving) return;
    if (existing) nav.replace({ page: 'space', id: existing.id });
    else if (nav.canGoBack) nav.back();
    else nav.replace({ page: 'browse' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leaving]);

  /* The Aiden Fab moves beside the floating panel while it is open — but only
     while this tab is the one on screen (inactive tabs stay mounted). */
  const rootRef = useRef<HTMLDivElement>(null);
  const myTab = useRef(nav.activeId).current;
  const onScreen = nav.activeId === myTab;
  useEffect(() => {
    const shell = rootRef.current?.closest<HTMLElement>('.ui-app-shell') ?? document.documentElement;
    if (!onScreen) return;
    shell.style.setProperty('--ui-fab-inset-x', panel && !preview ? FAB_INSET_OPEN : FAB_INSET_CLOSED);
    return () => {
      shell.style.removeProperty('--ui-fab-inset-x');
    };
  }, [onScreen, panel, preview]);

  const byId = (id: string) => state.dashboards.find((d) => d.id === id);
  const items = draft.items.filter((i) => byId(i.dashboardId));
  const onCanvas = items.map((i) => i.dashboardId);
  const named = !!draft.name.trim();

  /* ── item operations (the keyboard route to everything dragging does) ── */

  const move = (id: string, dir: -1 | 1) =>
    commit((d) => {
      const list = [...d.items];
      const i = list.findIndex((x) => x.dashboardId === id);
      // Step to the nearest neighbor in the same section, so an item never jumps groups.
      let j = i + dir;
      while (j >= 0 && j < list.length && list[j].section !== list[i].section) j += dir;
      if (i < 0 || j < 0 || j >= list.length) return d;
      [list[i], list[j]] = [list[j], list[i]];
      return { ...d, items: list };
    });

  const moveBefore = (id: string, before: string) =>
    commit((d) => {
      if (id === before) return d;
      const it = d.items.find((x) => x.dashboardId === id);
      if (!it) return d;
      const target = d.items.find((x) => x.dashboardId === before);
      const rest = d.items.filter((x) => x.dashboardId !== id);
      const at = rest.findIndex((x) => x.dashboardId === before);
      rest.splice(at, 0, { ...it, section: target?.section });
      return { ...d, items: rest };
    });

  const setLayout = (id: string, layout: SpaceCardLayout) =>
    commit((d) => ({ ...d, items: d.items.map((x) => (x.dashboardId === id ? { ...x, layout } : x)) }));

  const remove = (dash: Dashboard) => {
    commit((d) => ({ ...d, items: d.items.filter((x) => x.dashboardId !== dash.id) }));
    if (selected === dash.id) setSelected(null);
    toast(`${dash.name} removed from the canvas`, { action: { label: 'Undo', onClick: undo } });
  };

  const add = (dash: Dashboard) => {
    commit((d) => ({ ...d, items: [...d.items, { dashboardId: dash.id, layout: settings.layout }] }));
    setSelected(dash.id);
    toast.success(`${dash.name} added`, { description: 'It is at the end of the canvas. Drag it, or use its menu to move it.' });
  };

  const openHeading = (id: string | null) => {
    const target = id ?? selected;
    if (!target) {
      toast.info('Select a card first', { description: 'Click a card on the canvas, then add a heading to group it.' });
      return;
    }
    setHeading(draft.items.find((i) => i.dashboardId === target)?.section ?? '');
    setHeadingFor(target);
  };

  const applyHeading = (value: string | undefined) => {
    const id = headingFor;
    setHeadingFor(null);
    if (!id) return;
    commit((d) => ({ ...d, items: d.items.map((x) => (x.dashboardId === id ? { ...x, section: value || undefined } : x)) }));
  };

  const pickComponent = (kind: ComponentKind) => {
    if (kind === 'dashboard') return setPanel('dashboards');
    if (kind === 'text') return openHeading(null);
    const name = { metrics: 'Metrics', reports: 'Reports', workflow: 'Workflows', aiden: 'Aiden widgets' }[kind];
    toast.info(`${name} are not in this prototype yet`, { description: 'Dashboards and headings are. Pick Dashboard to add one.' });
  };

  /* ── commit / leave ── */

  const save = () => {
    if (!named) return;
    const saved = saveSpace({
      id: existing?.id,
      name: draft.name.trim(),
      description: draft.description.trim(),
      hue: draft.hue,
      items: draft.items,
      pinned: existing?.pinned,
      shared: existing?.shared,
      banners: existing?.banners,
      layout: draft.preset,
    });
    setCommitted(true);
    nav.replace({ page: 'space', id: saved.id });
    // S3.3 / S3.4 — fired here, since the Builder is the only thing that produces them.
    if (existing) toast.success('Changes saved', { description: `“${saved.name}” is up to date.` });
    else toast.success('Space created', { description: `“${saved.name}” is ready — open a dashboard, or edit the space to add more.` });
  };

  const cancel = () => (dirty ? setConfirmDiscard(true) : setLeaving(true));

  /* ── render ── */

  const renderItem = (item: SpaceItem, index: number, siblings: SpaceItem[]) => {
    const dash = byId(item.dashboardId)!;
    const cid = `ds-builder-item-${dash.id}`;
    const card = (
      <SpaceCard
        id={`${cid}-card`}
        dashboard={dash}
        layout={item.layout}
        onOpen={() => nav.go({ page: 'dashboard', id: dash.id })}
      />
    );
    if (preview) return <div key={dash.id}>{card}</div>;

    const menu = (
      <DropdownMenu id={`${cid}-menu`}>
        <DropdownMenuTrigger>
          <button type="button" className="ds-builder-item-menu" aria-label={`Edit ${dash.name}`}>
            <Ellipsis aria-hidden="true" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Card layout</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={item.layout} onValueChange={(v) => setLayout(dash.id, v as SpaceCardLayout)}>
            <DropdownMenuRadioItem value="thumbnail">Thumbnail card</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="card">Compact card</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled={index === 0} onClick={() => move(dash.id, -1)}>
            <ArrowUp aria-hidden="true" />
            Move earlier
          </DropdownMenuItem>
          <DropdownMenuItem disabled={index === siblings.length - 1} onClick={() => move(dash.id, 1)}>
            <ArrowDown aria-hidden="true" />
            Move later
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => openHeading(dash.id)}>
            <Heading aria-hidden="true" />
            {item.section ? 'Change section heading' : 'Add a section heading'}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => remove(dash)}>
            <Trash2 aria-hidden="true" />
            Remove from space
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    return (
      <CanvasItem
        key={dash.id}
        id={cid}
        className="ds-builder-item"
        grip
        gripLabel={`Move ${dash.name}. Arrow keys move it earlier or later.`}
        menu={menu}
        selected={selected === dash.id}
        draggable
        onClick={() => setSelected(dash.id)}
        onFocus={() => setSelected(dash.id)}
        onKeyDown={(e) => {
          const onGrip = (e.target as HTMLElement).classList.contains('ui-canvas-item__grip');
          if (onGrip && (e.key === 'ArrowUp' || e.key === 'ArrowLeft')) {
            e.preventDefault();
            move(dash.id, -1);
          }
          if (onGrip && (e.key === 'ArrowDown' || e.key === 'ArrowRight')) {
            e.preventDefault();
            move(dash.id, 1);
          }
          if (onGrip && (e.key === 'Delete' || e.key === 'Backspace')) remove(dash);
        }}
        onDragStart={(e) => {
          dragging.current = dash.id;
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', dash.id);
        }}
        onDragEnd={() => (dragging.current = null)}
        onDragOver={(e) => {
          if (dragging.current && dragging.current !== dash.id) e.preventDefault();
        }}
        onDrop={(e) => {
          e.preventDefault();
          if (dragging.current) moveBefore(dragging.current, dash.id);
          dragging.current = null;
        }}
      >
        {card}
      </CanvasItem>
    );
  };

  const grid = (list: SpaceItem[]) => <div className={gridClass(draft.preset)}>{list.map((it, i) => renderItem(it, i, list))}</div>;

  let body;
  if (loading) {
    // BL2.4 — the edit outlines wait until something is draggable.
    const shape: SpaceCardLayout[] = existing?.items.length ? existing.items.map((i) => i.layout) : ['thumbnail', 'card', 'card'];
    body = (
      <div className={gridClass(draft.preset)} aria-busy="true" aria-label="Loading the space">
        {shape.map((l, i) => (
          <SpaceCardSkeleton key={i} id={`ds-builder-skeleton-${i}`} layout={l} />
        ))}
      </div>
    );
  } else if (!items.length) {
    body = (
      <div className={`ds-builder-empty${panel && !preview ? ' ds-builder-empty--panel' : ''}`}>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Inbox />
            </EmptyMedia>
            <EmptyTitle>Nothing in this space yet</EmptyTitle>
            <EmptyDescription>
              {panel ? 'Pick a component from the panel to start building.' : 'Open the components panel from the rail to add your first dashboard, report or metric.'}
            </EmptyDescription>
          </EmptyHeader>
          {!panel && (
            <EmptyContent>
              <Button id="ds-builder-empty-add" style="outline" label="Add components" IconLeft={Plus} onClick={() => setPanel('components')} />
            </EmptyContent>
          )}
        </Empty>
      </div>
    );
  } else if (items.some((i) => i.section)) {
    body = (
      <Stack level={2}>
        {groupBySection(items).map((g, i) => (
          <Section key={g.section ?? `none-${i}`} id={`ds-builder-section-${i}`} heading={g.section ?? 'Other dashboards'}>
            {grid(g.items)}
          </Section>
        ))}
      </Stack>
    );
  } else {
    body = grid(items);
  }

  const showPanel = panel && !preview;

  return (
    <div ref={rootRef} className="ds-builder">
      <ScrollArea id="ds-builder-canvas-scroll" className="ds-builder__canvas">
      <Canvas
        id="ds-builder-canvas"
        className="ds-builder__ground"
        grid={!preview}
        aria-label={preview ? 'Space preview' : 'Space canvas'}
        onClick={(e) => {
          if (!(e.target as HTMLElement).closest('.ui-canvas-item')) setSelected(null);
        }}
      >
        <PageContainer>
          <header className="ds-builder-head">
            <div className="ds-builder-head__text">
              <p className="ds-builder-head__overline">{preview ? 'Preview' : existing ? 'Edit mode' : 'Create a space'}</p>
              <input
                id="ds-builder-name"
                className="ds-builder-head__title"
                aria-label="Space name"
                placeholder="Name your new space"
                value={draft.name}
                {...textProps}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              />
              <input
                id="ds-builder-description"
                className="ds-builder-head__description"
                aria-label="Space description"
                placeholder="Give your space a short description."
                value={draft.description}
                {...textProps}
                onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
              />
            </div>
            <div className="ds-builder-head__actions">
              <Button
                id="ds-builder-preview"
                style="ghost"
                label={preview ? 'Exit preview' : 'Preview'}
                IconLeft={preview ? EyeOff : Eye}
                aria-pressed={preview}
                disabled={!items.length && !preview}
                onClick={() => {
                  setPreview((p) => !p);
                  setSelected(null);
                }}
              />
              <Button id="ds-builder-undo" style="ghost" label="Undo" IconLeft={Undo2} disabled={!history.length || preview} onClick={undo} />
              <Button id="ds-builder-cancel" style="ghost" label="Cancel" onClick={cancel} />
              <Button
                id="ds-builder-commit"
                label={existing ? 'Done' : 'Create space'}
                disabled={!named}
                title={named ? undefined : 'Name the space first'}
                onClick={save}
              />
            </div>
          </header>

          {seed && seedAlert && !existing && (
            <Alert
              id="ds-builder-seed"
              variant="brand"
              title={`Adding “${seed.name}”`}
              description="You came here from Browse. Name this space and create it to finish adding the dashboard — it is already on the canvas below."
              action={
                <Button
                  id="ds-builder-seed-existing"
                  size="sm"
                  style="outline"
                  label="Add to an existing space instead"
                  onClick={() => openAddToSpace(seed.id)}
                />
              }
              onClose={() => setSeedAlert(false)}
            />
          )}

          {body}
        </PageContainer>
      </Canvas>
      </ScrollArea>

      {showPanel && (
        <aside className="ds-builder-panel" aria-labelledby="ds-builder-panel-title">
          <div className="ds-builder-panel__head">
            <h2 id="ds-builder-panel-title" className="ds-builder-panel__title">
              {PANEL_META[panel].title}
            </h2>
            <p className="ds-muted">{PANEL_META[panel].description}</p>
          </div>
          <ScrollArea id="ds-builder-panel-scroll" className="ds-builder-panel__body">
            <div className="ds-builder-panel__content">
            {panel === 'components' && <ComponentsPanel onPick={pickComponent} />}
            {panel === 'dashboards' && (
              <DashboardsPanel
                dashboards={state.dashboards}
                onCanvas={onCanvas}
                filters={filters}
                onFiltersChange={setFilters}
                onAdd={add}
                onRequestAccess={(d) => openGetAccess(d.id)}
                onBack={() => setPanel('components')}
              />
            )}
            {panel === 'filters' && (
              <FiltersPanel dashboards={state.dashboards.filter((d) => d.lifecycle !== 'draft')} filters={filters} onChange={setFilters} onBack={() => setPanel('components')} />
            )}
            {panel === 'layout' && (
              <LayoutPanel
                value={draft.preset}
                onChange={(preset) => commit((d) => ({ ...d, preset }))}
                onBack={() => setPanel('components')}
              />
            )}
            {panel === 'settings' && <SettingsPanel value={settings} onChange={setSettings} onBack={() => setPanel('components')} />}
            </div>
          </ScrollArea>
          <div className="ds-builder-panel__foot">
            {panel === 'filters' ? (
              <>
                <Button id="ds-builder-filters-clear" style="ghost" label="Clear all" disabled={!filters.category.length && !filters.source.length && !filters.tags.length} onClick={() => setFilters(NO_FILTERS)} />
                <Button id="ds-builder-filters-show" label="Show dashboards" onClick={() => setPanel('dashboards')} />
              </>
            ) : panel === 'settings' ? (
              <>
                <Button
                  id="ds-builder-settings-reset"
                  style="ghost"
                  label="Reset all"
                  onClick={() => setSettings({ layout: 'thumbnail', hue: initial.hue })}
                />
                <Button
                  id="ds-builder-settings-apply"
                  label="Apply settings"
                  onClick={() => {
                    commit((d) => ({ ...d, hue: settings.hue, items: d.items.map((x) => ({ ...x, layout: settings.layout })) }));
                    toast.success('Settings applied', { description: 'Every card uses the new layout, and the space icon has its new color.' });
                  }}
                />
              </>
            ) : (
              <Button id="ds-builder-panel-done" label="Done" onClick={() => setPanel(null)} />
            )}
          </div>
        </aside>
      )}

      <nav className="ds-builder-rail" aria-label="Builder panels">
        <ToggleGroup
          id="ds-builder-rail"
          type="single"
          orientation="vertical"
          variant="plain"
          value={showPanel ? panel : ''}
          onValueChange={(v) => {
            setPreview(false);
            setPanel((v || null) as PanelId | null);
          }}
        >
          {RAIL.map((r) => (
            <ToggleGroupItem key={r.id} value={r.id} aria-label={r.label} title={r.label} IconCenter={r.Icon} />
          ))}
        </ToggleGroup>
      </nav>

      {/* Section heading — what a Text box adds in this prototype. */}
      <Dialog id="ds-builder-heading" open={!!headingFor} onClose={() => setHeadingFor(null)}>
        <DialogHeader id="ds-builder-heading-header" title="Section heading" description="Group this card, and any you add to the same heading, under a title." onClose={() => setHeadingFor(null)} />
        <DialogBody>
          <Input
            id="ds-builder-heading-input"
            label="Heading"
            placeholder="For example, Revenue"
            value={heading}
            onValueChange={setHeading}
            list="ds-builder-heading-options"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && heading.trim() && applyHeading(heading.trim())}
          />
          <datalist id="ds-builder-heading-options">
            {[...new Set(draft.items.map((i) => i.section).filter(Boolean))].map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </DialogBody>
        <DialogFooter>
          {draft.items.find((i) => i.dashboardId === headingFor)?.section && (
            <Button id="ds-builder-heading-remove" style="ghost" variant="error" label="Remove heading" onClick={() => applyHeading(undefined)} />
          )}
          <Button id="ds-builder-heading-cancel" style="ghost" label="Cancel" onClick={() => setHeadingFor(null)} />
          <Button id="ds-builder-heading-save" label="Save heading" disabled={!heading.trim()} onClick={() => applyHeading(heading.trim())} />
        </DialogFooter>
      </Dialog>

      {/* BL3.3 */}
      <AlertDialog id="ds-builder-discard" open={confirmDiscard} onClose={() => setConfirmDiscard(false)}>
        <AlertDialogHeader id="ds-builder-discard-header" title="Discard your changes?" />
        <AlertDialogBody>
          {existing
            ? 'This space goes back to how it was when you opened it. You cannot undo this.'
            : 'This space has not been created. If you leave now, what you added is lost.'}
        </AlertDialogBody>
        <AlertDialogFooter>
          <Button id="ds-builder-discard-cancel" style="ghost" label="Cancel" onClick={() => setConfirmDiscard(false)} />
          <Button
            id="ds-builder-discard-confirm"
            variant="error"
            label="Discard changes"
            onClick={() => {
              setConfirmDiscard(false);
              setLeaving(true);
            }}
          />
        </AlertDialogFooter>
      </AlertDialog>
    </div>
  );
}
