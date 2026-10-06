/* DartBoards · the Builder (Figma page "Builder", 2618:15730).

   THE BUILDER IS AN EDITABLE VIEW OF THE SPACE ITSELF. The canvas renders the
   same cards the space page renders, with edit chrome over them; the side panel
   floats over the canvas and never takes width from it; the tool rail on the
   right edge switches panels. Three ways in, one tool:

   - "+ New space"         → no spaceId                    BL1.1 · BL1.3 · BL1.4
   - "Add to new space"    → seedDashboardId / seedAssetId  BL1.2 (a report can start a space too)
   - "Edit space"          → spaceId (loads first)         BL2.4 · BL2.1 · BL2.3 · BL2.5

   One commit, labeled by existence: "Create space" (needs a name) or "Done".
   Leaving with uncommitted work is guarded (BL3.3).

   THE RAIL IS THE PICKER (owner, 2026-10-01): it lands on ALL — dashboards,
   widgets, metrics, workflows and reports in one list — and each kind has its
   own rail icon, then Text box, then Settings (which now holds Layout). A space
   item is a dashboard, one widget from a native dashboard, or an asset
   (metric / workflow / report); `itemKey` tells them apart everywhere. */

import {
  ArrowDown,
  ArrowUp,
  Check,
  Ellipsis,
  Eye,
  EyeOff,
  Inbox,
  Library,
  Plus,
  Settings,
  Trash2,
  Shapes,
  Undo2,
  SlidersHorizontal,
  CopyPlus,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import Alert from '../../../../../components/Alert';
import AlertDialog, { AlertDialogBody, AlertDialogFooter, AlertDialogHeader } from '../../../../../components/AlertDialog';
import Button from '../../../../../components/Button';
import Canvas, { CanvasItem } from '../../../../../components/Canvas';
import ScrollArea from '../../../../../components/ScrollArea';
import Drawer from '../../../../../components/Drawer';
import DropdownMenu, {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../../../components/DropdownMenu';
import Empty, { EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '../../../../../components/Empty';
import PageContainer from '../../../../../components/PageContainer';
import PageHeader from '../../../../../components/PageHeader';
import Section from '../../../../../components/Section';
import Stack from '../../../../../components/Stack';
import { toast } from '../../../../../components/Toast';
import ToggleGroup, { ToggleGroupItem } from '../../../../../components/ToggleGroup';
import Text from '../../../../../components/Text';
import { DISCARD_BUILDER, useLeaveGuard, useNav } from '../../../nav';
import { useSuite, discoverable } from '../../../store';
import type { Asset, Dashboard, MetricView, NativeFilters, NativeWidget, Space, SpaceBlock, SpaceCardLayout, SpaceItem } from '../../../types';
import { useUi } from '../../../ui';
import { ASSET_META, AssetCard, SpaceCard, SpaceCardSkeleton } from '../space/SpaceCards';
import { WidgetCard } from '../native/WidgetCard';
import { DEFAULT_NATIVE_FILTERS } from '../native/nativeData';
import { BLOCK_TITLE, SpaceBlockView, filtersInSpace } from '../space/SpaceBlocks';
import '../space/SpaceBlocks.scss';
import { ItemPanel } from './ItemPanel';
import '../native/Native.scss';
import { gridClass, groupBySection } from '../space/spaceLayout';
import type { LayoutPreset } from '../space/spaceLayout';
import { LAYOUT_PRESETS } from '../space/spaceLayout';
import {
  FacetsPanel,
  KIND_META,
  LibraryPanel,
  PANEL_KIND,
  PANEL_META,
  SettingsPanel,
  BlocksPanel,
  kindsFiltered,
} from './panels';
import type { BlockChoice, LibraryEntry, LibraryKind, PanelId, SettingsValue } from './panels';
import { subjectOf } from './facets';
import type { FacetFilters } from './facets';
import { DEFAULT_METRIC_VIEW, MetricViewCard } from '../space/MetricViewCard';
import '../space/Space.scss';
import './Builder.scss';

type Draft = {
  name: string;
  description: string;
  hue: Space['hue'];
  items: SpaceItem[];
  preset: LayoutPreset;
  /** The filter bar block's filters. */
  filters: NativeFilters;
  /** What the space is about — every library screen starts from it. */
  focus: string[];
};

/* The panel + tool rail width, for the Aiden Fab (CLAUDE.md: Fab). Same calc as
   `--ds-builder-panel` + `--ds-builder-rail` in Builder.scss. */
const FAB_INSET = 'calc(var(--p-6) + var(--w-80) + var(--w-10) + var(--w-14))';

/* What can be added, then the one thing that is not content. Settings sits
   apart at the foot of the rail so it never reads as another kind to add. */
const RAIL: { id: PanelId; label: string; Icon: typeof Plus }[] = [
  { id: 'all', label: 'All', Icon: Library },
  ...(Object.keys(KIND_META) as LibraryKind[]).map((k) => ({ id: KIND_META[k].panel, label: KIND_META[k].plural, Icon: KIND_META[k].Icon })),
  { id: 'blocks', label: 'Blocks', Icon: Shapes },
];
const RAIL_FOOT: { id: PanelId; label: string; Icon: typeof Plus }[] = [{ id: 'settings', label: 'Space settings', Icon: Settings }];

/** One identity per canvas item, whichever of the three shapes it is. */
export const itemKey = (i: SpaceItem) =>
  i.blockId ? `b:${i.blockId}` : i.assetId ? `a:${i.assetId}${i.viewId ? `:${i.viewId}` : ''}` : i.widgetId ? `w:${i.dashboardId}:${i.widgetId}` : i.dashboardId;
let blockSeq = 1;

export function Builder({ spaceId, seedDashboardId, seedAssetId }: { spaceId?: string; seedDashboardId?: string; seedAssetId?: string }) {
  const { state, saveSpace } = useSuite();
  const nav = useNav();
  const { openAddToSpace, openAddAssetToSpace, openGetAccess } = useUi();
  const existing = spaceId ? state.spaces.find((s) => s.id === spaceId) : undefined;
  const seedAsset = seedAssetId ? state.assets.find((a) => a.id === seedAssetId) : undefined;
  const seed: { id: string; name: string } | undefined = seedAsset ?? (seedDashboardId ? state.dashboards.find((d) => d.id === seedDashboardId) : undefined);

  const initial = useMemo<Draft>(
    () =>
      existing
        ? {
            name: existing.name,
            description: existing.description,
            hue: existing.hue,
            items: structuredClone(existing.items),
            preset: existing.layout ?? 'auto',
            filters: existing.filters ?? DEFAULT_NATIVE_FILTERS,
            focus: existing.focus ?? [],
          }
        : {
            name: '',
            description: '',
            hue: 'blue',
            items: seedAsset
              ? [
                  seedAsset.kind === 'metric'
                    ? { dashboardId: '', assetId: seedAsset.id, layout: 'card', viewId: 'seed', metric: DEFAULT_METRIC_VIEW }
                    : { dashboardId: '', assetId: seedAsset.id, layout: 'card' },
                ]
              : seed
                ? [{ dashboardId: seed.id, layout: 'thumbnail' }]
                : [],
            preset: 'auto',
            filters: DEFAULT_NATIVE_FILTERS,
            focus: [],
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

  // The Builder lands on ALL — every kind it can add, in one list.
  /* The panel is DOCKED for as long as the Builder is open (owner, 2026-10-02): there is
     no closing it — the rail moves it from screen to screen, and the canvas sits beside it. */
  const [panel, setPanel] = useState<PanelId>('all');
  const [preview, setPreview] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  // The library's filters — one set across every kind (facets.ts), and the panel Filters was opened from.
  const [filters, setFilters] = useState<FacetFilters>({});
  const [filtersFrom, setFiltersFrom] = useState<PanelId>('all');
  const [seedAlert, setSeedAlert] = useState(!!seed);
  // The card style new dashboards are added with (Settings changes it, and every dashboard card with it).
  const [cardStyle, setCardStyle] = useState<SpaceCardLayout>('thumbnail');
  /* What just happened, said INSIDE the panel instead of in a toast (owner, 2026-10-01).
     `undo` offers to take it back; the line stays until the next thing happens. */
  const [notice, setNotice] = useState<{ text: string; undo?: boolean; n: number } | null>(null);
  const say = (text: string, undoable = true) => setNotice((p) => ({ text, undo: undoable, n: (p?.n ?? 0) + 1 }));
  // The panel the item settings were opened over, so "Back to the library" returns there.
  const [libraryPanel, setLibraryPanel] = useState<PanelId>('all');
  // "Show everything" turns the focus off without forgetting it.
  const [focusOn, setFocusOn] = useState(true);
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
    shell.style.setProperty('--ui-fab-inset-x', FAB_INSET);
    return () => {
      shell.style.removeProperty('--ui-fab-inset-x');
    };
  }, [onScreen]);

  const byId = (id: string) => state.dashboards.find((d) => d.id === id);
  const assetById = (id: string) => state.assets.find((a) => a.id === id);
  const widgetOf = (i: SpaceItem) => byId(i.dashboardId)?.native?.widgets.find((w) => w.id === i.widgetId);
  const valid = (i: SpaceItem) => (i.block ? true : i.assetId ? !!assetById(i.assetId) : i.widgetId ? !!widgetOf(i) : !!byId(i.dashboardId));
  const items = draft.items.filter(valid);
  const onCanvas = new Set(items.map(itemKey));
  /** What the item is called, for menus, toasts and accessible names. */
  const titleOf = (i: SpaceItem) =>
    i.block ? (i.block.type === 'links' ? i.block.title : BLOCK_TITLE[i.block.type]) : i.assetId ? assetById(i.assetId)!.name : i.widgetId ? widgetOf(i)!.title : byId(i.dashboardId)!.name;
  const selectedItem = selected ? items.find((i) => itemKey(i) === selected) : undefined;
  /** What kind of thing the selected card is, for the panel's subtitle. */
  const itemKindLabel = (i: SpaceItem) =>
    i.block ? 'Block' : i.metric ? 'Metric · how it shows on this space' : i.assetId ? ASSET_META[assetById(i.assetId)!.kind].label : i.widgetId ? 'Live chart' : 'Dashboard';
  /** A live chart follows the space's filter bar when there is one, else its suite. */
  const filtersFor = (suiteId: string) => filtersInSpace(state, items, draft.filters, suiteId);
  const hasFilterBar = items.some((i) => i.block?.type === 'filters');
  const hasFreshness = items.some((i) => i.block?.type === 'freshness');
  const named = !!draft.name.trim();

  /* ── item operations (the keyboard route to everything dragging does) ── */

  const move = (id: string, dir: -1 | 1) =>
    commit((d) => {
      const list = [...d.items];
      const i = list.findIndex((x) => itemKey(x) === id);
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
      const it = d.items.find((x) => itemKey(x) === id);
      if (!it) return d;
      const target = d.items.find((x) => itemKey(x) === before);
      const rest = d.items.filter((x) => itemKey(x) !== id);
      const at = rest.findIndex((x) => itemKey(x) === before);
      rest.splice(at, 0, { ...it, section: target?.section });
      return { ...d, items: rest };
    });

  const remove = (key: string, title: string) => {
    commit((d) => ({ ...d, items: d.items.filter((x) => itemKey(x) !== key) }));
    if (selected === key) setSelected(null);
    say(`Removed ${title}`);
  };

  const addItem = (item: SpaceItem, title: string) => {
    commit((d) => ({ ...d, items: [...d.items, item] }));
    setSelected(itemKey(item));
    say(`Added ${title} — at the end of the canvas`);
  };
  const add = (dash: Dashboard) => addItem({ dashboardId: dash.id, layout: cardStyle }, dash.name);
  const addWidget = (dash: Dashboard, w: NativeWidget) => addItem({ dashboardId: dash.id, widgetId: w.id, layout: 'card' }, w.title);
  let viewSeq = Date.now();
  /** A metric is added with a view, and its settings open straight away; adding it again adds a SECOND view. */
  const addAsset = (a: Asset, view: MetricView = DEFAULT_METRIC_VIEW) => {
    if (a.kind !== 'metric') return addItem({ dashboardId: '', assetId: a.id, layout: 'card' }, a.name);
    const item: SpaceItem = { dashboardId: '', assetId: a.id, viewId: (viewSeq++).toString(36), metric: view, layout: 'card' };
    commit((d) => ({ ...d, items: [...d.items, item] }));
    // A metric needs shaping, so its settings take over the panel — no dialog.
    openItem(itemKey(item));
    say(`Added ${a.name} — choose how to show it`);
  };
  const assetOnCanvas = (id: string) => items.some((i) => i.assetId === id);

  /* Blocks. The filter bar goes to the TOP of the space — it governs everything below it. */
  const addBlock = (block: SpaceBlock) => {
    const item: SpaceItem = { dashboardId: '', blockId: `blk-${blockSeq++}-${Date.now().toString(36)}`, block, layout: 'card' };
    if (block.type === 'filters') {
      commit((d) => ({ ...d, items: [item, ...d.items] }));
      setSelected(itemKey(item));
      say('Added a filter bar — at the top; every live chart follows it');
    } else addItem(item, block.type === 'links' ? block.title : BLOCK_TITLE[block.type]);
  };
  const pickBlock = (b: BlockChoice) => {
    if (b === 'heading') return openHeading(null);
    if (b === 'filters') return addBlock({ type: 'filters' });
    if (b === 'summary') return addBlock({ type: 'summary' });
    if (b === 'freshness') return addBlock({ type: 'freshness' });
    if (b === 'divider') return addBlock({ type: 'divider', label: '' });
    if (b === 'note')
      return addBlock({
        type: 'note',
        title: '',
        text: 'Write a note for everyone who opens this space — use its menu to edit it.',
        tone: 'default',
      });
    if (b === 'kpis') return addBlock({ type: 'kpis', metricIds: state.assets.filter((a) => a.kind === 'metric').map((a) => a.id) });
    addBlock({
      type: 'links',
      title: 'Team links',
      links: [
        { id: 'l-irm', label: 'IRM record · IRM-20512', url: 'https://irm.example.com/records/IRM-20512' },
        { id: 'l-sp', label: 'Collections SharePoint', url: 'https://sharepoint.example.com/sites/collections' },
        { id: 'l-runbook', label: 'Month-end runbook', url: 'https://confluence.example.com/collections/runbook' },
      ],
    });
  };

  /* The library: every kind the rail lists, as one set of rows, each carrying
     the facet values the filters read (facets.ts). */
  const delivery = (d: Dashboard) => (d.native ? 'Native' : d.external ? 'External link' : 'Embedded');
  const GRAIN = { day: 'Daily', week: 'Weekly', month: 'Monthly' } as const;
  const BY = { org: 'Org', region: 'Region', product: 'Product' } as const;
  const library: LibraryEntry[] = [
    ...state.dashboards
      .filter((d) => discoverable(d) && !d.external)
      .map<LibraryEntry>((d) => {
        const subject = subjectOf(state, d);
        return {
          key: d.id,
          kind: 'dashboard',
          title: d.name,
          description: d.description.split(/,| — /)[0],
          subject,
          facets: { subject: [subject], owner: [d.owner], source: [d.source], delivery: [delivery(d)] },
          status: !d.hasAccess ? 'locked' : onCanvas.has(d.id) ? 'added' : 'add',
          onAdd: () => add(d),
          onLocked: () => openGetAccess(d.id),
        };
      }),
    ...state.dashboards
      .filter((d) => d.native && discoverable(d))
      .flatMap((d) => {
        const subject = subjectOf(state, d);
        return d.native!.widgets.map<LibraryEntry>((w) => ({
          key: `w:${d.id}:${w.id}`,
          kind: 'widget',
          title: w.title,
          description: `From ${d.name}`,
          subject,
          facets: { subject: [subject], owner: [d.owner], source: ['DART'], from: [d.name] },
          status: onCanvas.has(`w:${d.id}:${w.id}`) ? 'added' : 'add',
          onAdd: () => addWidget(d, w),
        }));
      }),
    ...state.assets.map<LibraryEntry>((a) => ({
      key: `a:${a.id}`,
      kind: a.kind,
      title: a.name,
      description: a.description,
      subject: a.subject,
      facets: {
        subject: [a.subject],
        owner: [a.owner],
        source: [a.source],
        ...(a.metric
          ? {
              grain: a.metric.grains.map((g) => GRAIN[g]),
              breakdown: a.metric.breakdowns.map((b) => BY[b]),
              certified: [a.metric.certified ? 'Certified' : 'Not certified'],
            }
          : {}),
        ...(a.report ? { cadence: [a.report.cadence], audience: [a.report.audience] } : {}),
        ...(a.workflow
          ? { assigned: [a.workflow.assignedToMe ? 'Assigned to me' : 'Team only'], overdue: [a.workflow.overdue ? 'Has overdue' : 'Nothing overdue'] }
          : {}),
      },
      // A metric can be on a space more than once, shown differently each time.
      status: assetOnCanvas(a.id) ? (a.kind === 'metric' ? 'again' : 'added') : 'add',
      onAdd: () => addAsset(a),
    })),
  ];

  /* "Related to …": once something is on the space, what shares its subject leads All. */
  const subjectOfItem = (i: SpaceItem) =>
    i.assetId ? assetById(i.assetId)?.subject : i.dashboardId && byId(i.dashboardId) ? subjectOf(state, byId(i.dashboardId)!) : undefined;
  const anchorItem = [...items].reverse().find((i) => !i.block && subjectOfItem(i));
  const related = anchorItem
    ? {
        anchor: titleOf(anchorItem),
        // A couple of each kind, so the workflow and report that go with it are not pushed out by dashboards.
        entries: (['dashboard', 'workflow', 'report', 'metric', 'widget'] as LibraryKind[]).flatMap((k) =>
          library
            .filter((e) => e.kind === k && e.subject === subjectOfItem(anchorItem) && e.status === 'add')
            .slice(0, 2),
        ),
      }
    : null;

  /* The space's focus: the suggestion is the subject of the first thing on the canvas. */
  const firstSubject = items.map(subjectOfItem).find((x): x is string => !!x) ?? null;
  const focus = {
    subjects: draft.focus,
    on: focusOn,
    all: [...new Set(library.map((e) => e.subject))].sort(),
    suggestion: draft.focus.length ? null : firstSubject,
    onChange: (subjects: string[]) => {
      commit((d) => ({ ...d, focus: subjects }));
      say(subjects.length ? `Focused on ${subjects.join(', ')} — every screen starts from it` : 'Focus cleared — everything shows');
    },
    onToggle: (on: boolean) => {
      setFocusOn(on);
      say(on ? 'Using the focus again' : 'Showing everything — the focus is kept', false);
    },
  };
  const filteredKinds = kindsFiltered(filters);

  /** Show one item's settings in the panel — the Builder's only way to edit something. */
  const openItem = (key: string) => {
    setSelected(key);
    if (panel !== 'item') setLibraryPanel(panel);
    setPreview(false);
    setPanel('item');
  };
  // A section heading is a setting of the card, so it is set in the card's panel.
  const openHeading = (id: string | null) => {
    const target = id ?? selected;
    if (!target) return say('Select a card on the canvas first, then give it a heading', false);
    openItem(target);
  };
  const changeItem = (key: string, patch: Partial<SpaceItem>, said: string) => {
    commit((d) => ({ ...d, items: d.items.map((x) => (itemKey(x) === key ? { ...x, ...patch } : x)) }));
    say(said);
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
      filters: draft.filters,
      focus: draft.focus,
      fromSuite: existing?.fromSuite,
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
    const key = itemKey(item);
    const title = titleOf(item);
    const cid = `ds-builder-item-${key.replace(/[^a-z0-9]+/gi, '-')}`;
    const isWidget = !!item.widgetId;
    const isBlock = !!item.block;
    let card;
    if (item.block) {
      card = (
        <SpaceBlockView
          id={`${cid}-card`}
          block={item.block}
          state={state}
          items={items}
          filters={draft.filters}
          onFiltersChange={(f) => commit((d) => ({ ...d, filters: f }))}
          filtersFor={filtersFor}
        />
      );
    } else if (item.assetId && item.metric) {
      // A metric is shown the way this card says — and the caption says what drives it.
      card = <MetricViewCard id={`${cid}-card`} asset={assetById(item.assetId)!} view={item.metric} space={hasFilterBar ? draft.filters : null} />;
    } else if (item.assetId) {
      const asset = assetById(item.assetId)!;
      card = (
        <AssetCard
          id={`${cid}-card`}
          asset={asset}
          onOpen={() => say(`${asset.name} is not built in this prototype`, false)}
        />
      );
    } else if (isWidget) {
      const dash = byId(item.dashboardId)!;
      card = (
        <WidgetCard
          id={`${cid}-card`}
          dashboard={dash}
          widget={widgetOf(item)!}
          filters={filtersFor(dash.native!.suiteId)}
          inSpace={{ onOpenDashboard: () => nav.go({ page: 'dashboard', id: dash.id, widget: item.widgetId }), onRemove: () => remove(key, title) }}
        />
      );
    } else {
      const dash = byId(item.dashboardId)!;
      card = <SpaceCard id={`${cid}-card`} dashboard={dash} layout={item.layout} onOpen={() => nav.go({ page: 'dashboard', id: dash.id })} />;
    }
    // A single chart takes the full row, exactly as it will on the space.
    const wide = isWidget
      ? ' ds-space-cell--widget'
      : isBlock
        ? ' ds-space-cell--block'
        : item.metric && item.metric.display !== 'number'
          ? ' ds-space-cell--metric-wide'
          : '';
    /* What the space filter bar does to this card — said, so a space never silently mixes periods.
       Metrics and live charts say it themselves; everything else gets a line under the card. */
    const follows = !hasFilterBar || isBlock || isWidget || item.metric
      ? null
      : item.assetId
        ? assetById(item.assetId)!.kind === 'report'
          ? 'Not filtered — a report is a published edition'
          : 'Not filtered — shows what is open right now'
        : byId(item.dashboardId)?.native
          ? 'Not filtered here — it opens with its suite’s filters'
          : `Not filtered here — opens in ${byId(item.dashboardId)?.source}`;
    if (follows) card = (
      <div className="ds-builder-follows">
        {card}
        <Text tone="muted" className="ds-builder-follows__note">{follows}</Text>
      </div>
    );
    if (preview) return <div key={key} className={wide.trim() || undefined}>{card}</div>;

    const menu = (
      <DropdownMenu id={`${cid}-menu`}>
        <DropdownMenuTrigger>
          <Button id={`${cid}-menu-trigger`} style="ghost" size="xs" iconOnly IconCenter={Ellipsis} aria-label={`Edit ${title}`} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {/* Every setting lives in the panel — the menu only points there, and moves or removes. */}
          <DropdownMenuItem onClick={() => openItem(key)}>
            <SlidersHorizontal aria-hidden="true" />
            Edit…
          </DropdownMenuItem>
          {item.metric && (
            <DropdownMenuItem onClick={() => addAsset(assetById(item.assetId!)!, { ...item.metric! })}>
              <CopyPlus aria-hidden="true" />
              Add another view
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled={index === 0} onClick={() => move(key, -1)}>
            <ArrowUp aria-hidden="true" />
            Move earlier
          </DropdownMenuItem>
          <DropdownMenuItem disabled={index === siblings.length - 1} onClick={() => move(key, 1)}>
            <ArrowDown aria-hidden="true" />
            Move later
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => remove(key, title)}>
            <Trash2 aria-hidden="true" />
            Remove from space
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    return (
      <CanvasItem
        key={key}
        id={cid}
        className={`ds-builder-item${wide}`}
        grip
        gripLabel={`Move ${title}. Arrow keys move it earlier or later.`}
        menu={menu}
        selected={selected === key}
        draggable
        onClick={() => openItem(key)}
        onFocus={() => setSelected(key)}
        onKeyDown={(e) => {
          const onGrip = (e.target as HTMLElement).classList.contains('ui-canvas-item__grip');
          if (onGrip && (e.key === 'ArrowUp' || e.key === 'ArrowLeft')) {
            e.preventDefault();
            move(key, -1);
          }
          if (onGrip && (e.key === 'ArrowDown' || e.key === 'ArrowRight')) {
            e.preventDefault();
            move(key, 1);
          }
          if (onGrip && (e.key === 'Delete' || e.key === 'Backspace')) remove(key, title);
        }}
        onDragStart={(e) => {
          dragging.current = key;
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', key);
        }}
        onDragEnd={() => (dragging.current = null)}
        onDragOver={(e) => {
          if (dragging.current && dragging.current !== key) e.preventDefault();
        }}
        onDrop={(e) => {
          e.preventDefault();
          if (dragging.current) moveBefore(dragging.current, key);
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
      <div className="ds-builder-empty">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Inbox />
            </EmptyMedia>
            <EmptyTitle>Nothing in this space yet</EmptyTitle>
            <EmptyDescription>Add anything from the panel — a dashboard, a single chart, a metric, a workflow or a report.</EmptyDescription>
          </EmptyHeader>
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

  const shownPanel = panel;

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
              description={`You came here from ${seedAsset ? (seedAsset.kind === 'metric' ? 'Metrics' : 'Reports') : 'Browse'}. Name this space and create it to finish adding the ${seedAsset ? seedAsset.kind : 'dashboard'} — it is already on the canvas below.`}
              action={
                <Button
                  id="ds-builder-seed-existing"
                  size="sm"
                  style="outline"
                  label="Add to an existing space instead"
                  onClick={() => (seedAsset ? openAddAssetToSpace(seedAsset.id) : openAddToSpace(seed.id))}
                />
              }
              onClose={() => setSeedAlert(false)}
            />
          )}

          {body}
        </PageContainer>
      </Canvas>
      </ScrollArea>

      {/* A docked, non-modal Drawer: the canvas beside it stays live while you add
          components or change settings. Header is PageHeader (sm), as Figma draws it. */}
      <Drawer
        id="ds-builder-panel"
        modal={false}
        side="right"
        open
        // Docked for the life of the Builder: Escape does not close it.
        onClose={() => undefined}
        className="ds-builder-panel"
        aria-labelledby="ds-builder-panel-head-title"
        aria-describedby="ds-builder-panel-head-description"
      >
        <PageHeader
          id="ds-builder-panel-head"
          size="sm"
          headingLevel="h2"
          className="ds-builder-panel__head"
          title={shownPanel === 'item' && selectedItem ? titleOf(selectedItem) : PANEL_META[shownPanel].title}
          description={shownPanel === 'item' && selectedItem ? itemKindLabel(selectedItem) : PANEL_META[shownPanel].description}
        />
          <ScrollArea id="ds-builder-panel-scroll" className="ds-builder-panel__body">
            <div className="ds-builder-panel__content">
            {/* What just happened — said here, where you are working, not in a toast. */}
            {notice && (
              <div key={notice.n} className="ds-builder-notice" role="status">
                <Check aria-hidden="true" className="ds-builder-notice__icon" />
                <span className="ds-builder-notice__text">{notice.text}</span>
                {notice.undo && history.length > 0 && (
                  <Button
                    id="ds-builder-notice-undo"
                    style="link"
                    size="sm"
                    label="Undo"
                    onClick={() => {
                      undo();
                      say('Undone', false);
                    }}
                  />
                )}
              </div>
            )}
            {shownPanel === 'item' && selectedItem && (
              <ItemPanel
                key={selected!}
                item={selectedItem}
                itemKey={selected!}
                state={state}
                hasFilterBar={hasFilterBar}
                headings={[...new Set(items.map((i) => i.section).filter((x): x is string => !!x))]}
                onChange={(patch, said) => changeItem(selected!, patch, said)}
                onAddView={() => addAsset(assetById(selectedItem.assetId!)!, { ...selectedItem.metric! })}
                onRemove={() => {
                  remove(selected!, titleOf(selectedItem));
                  setPanel(libraryPanel);
                }}
                onBack={() => setPanel(libraryPanel)}
              />
            )}
            {shownPanel === 'item' && !selectedItem && <Text tone="muted">Select a card on the canvas to change it here.</Text>}
            {(shownPanel === 'all' || PANEL_KIND[shownPanel]) && (
              <LibraryPanel
                key={shownPanel}
                panel={shownPanel}
                entries={library}
                filters={filters}
                onFiltersChange={setFilters}
                onOpenFilters={() => {
                  setFiltersFrom(shownPanel);
                  setPanel('filters');
                }}
                related={related}
                onSeeAll={setPanel}
                focus={focus}
              />
            )}
            {shownPanel === 'blocks' && (
              <BlocksPanel
                selected={selected && items.some((i) => itemKey(i) === selected) ? titleOf(items.find((i) => itemKey(i) === selected)!) : null}
                headings={[...new Set(items.map((i) => i.section).filter((x): x is string => !!x))]}
                hasFilterBar={hasFilterBar}
                hasFreshness={hasFreshness}
                onPick={pickBlock}
              />
            )}
            {shownPanel === 'filters' && (
              <FacetsPanel entries={library} scope={PANEL_KIND[filtersFrom]} filters={filters} onChange={setFilters} onBack={() => setPanel(filtersFrom)} />
            )}
            {shownPanel === 'settings' && (
              <SettingsPanel
                value={{ preset: draft.preset, layout: cardStyle, hue: draft.hue }}
                onChange={(v: SettingsValue) => {
                  // Settings apply the moment they are picked — there is no Apply button to miss.
                  if (v.preset !== draft.preset) {
                    commit((d) => ({ ...d, preset: v.preset }));
                    say(`Layout set to ${LAYOUT_PRESETS.find((p) => p.value === v.preset)?.label}`);
                  } else if (v.layout !== cardStyle) {
                    setCardStyle(v.layout);
                    commit((d) => ({ ...d, items: d.items.map((x) => (x.assetId || x.widgetId || x.block ? x : { ...x, layout: v.layout })) }));
                    say(`Every dashboard card is now ${v.layout === 'card' ? 'compact' : 'a thumbnail'}`);
                  } else if (v.hue !== draft.hue) {
                    commit((d) => ({ ...d, hue: v.hue }));
                    say(`Space icon color set to ${v.hue}`);
                  }
                }}
              />
            )}
            </div>
          </ScrollArea>
      </Drawer>

      <nav className="ds-builder-rail" aria-label="Builder panels">
        {[RAIL, RAIL_FOOT].map((group, gi) => (
          <ToggleGroup
            key={gi}
            id={gi ? 'ds-builder-rail-settings' : 'ds-builder-rail'}
            className={gi ? 'ds-builder-rail__foot' : undefined}
            type="single"
            orientation="vertical"
            variant="plain"
            value={group.some((r) => r.id === panel) ? panel : ''}
            onValueChange={(v) => {
              setPreview(false);
              // Clicking the open screen again keeps it open — the panel never closes.
              if (v) setPanel(v as PanelId);
            }}
            aria-label={gi ? 'Settings' : 'Add to the space'}
          >
            {group.map((r) => (
              <ToggleGroupItem
                key={r.id}
                value={r.id}
                // A dot when this kind has a filter of its own on — results are narrowed there.
                className={PANEL_KIND[r.id] && filteredKinds.includes(PANEL_KIND[r.id]!) ? 'ds-builder-rail__item--filtered' : undefined}
                aria-label={PANEL_KIND[r.id] && filteredKinds.includes(PANEL_KIND[r.id]!) ? `${r.label} (filtered)` : r.label}
                title={r.label}
                IconCenter={r.Icon}
              />
            ))}
          </ToggleGroup>
        ))}
      </nav>

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
