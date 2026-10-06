/* DART Central · Home — the fixed first tab, and the hub's front page.

   Three things, top to bottom: the greeting, TODAY (the numbers this person
   chose, a section of its own), and their BOARD of widgets.

   The board is Apple's widget model in fixed pixels. Four columns of 240px
   cells, 24px apart — 1032px across — centred on the page. A widget is one of a
   few sizes (Small, Medium, Large, Wide, Extra large) and never stretches with
   the window: a wider screen leaves margin around the board, it does not make
   every widget bigger. Below 872px the board drops to two columns, with its OWN
   arrangement (owner's call, 2026-10-06), so a narrow screen never disturbs the
   desktop one.

   Customize unlocks the board: drag a widget by its grip, or use its Arrange
   menu (size, move, choose actions, remove) — the board is react-grid-layout
   (owner-approved for the prototype, 2026-10-06), which has no keyboard route.
   The layout is kept per person (`homeLayouts`); absent one, the role's default. */

import { useEffect, useMemo, useRef, useState } from 'react';
import { GridLayout } from 'react-grid-layout';
import type { Layout } from 'react-grid-layout';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, ChevronRight, CircleCheck, GripVertical, LayoutGrid, Maximize2, MoreHorizontal, Plus, Search, SquarePen, Trash2, Zap } from 'lucide-react';
import Badge from '../../../../components/Badge';
import Button from '../../../../components/Button';
import Card, { CardBody } from '../../../../components/Card';
import DropdownMenu, { DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../../../../components/DropdownMenu';
import FeaturedIcon from '../../../../components/FeaturedIcon';
import Kbd from '../../../../components/Kbd';
import PageContainer from '../../../../components/PageContainer';
import PageHeader from '../../../../components/PageHeader';
import Input from '../../../../components/Input';
import Section from '../../../../components/Section';
import Separator from '../../../../components/Separator';
import Stack from '../../../../components/Stack';
import Text from '../../../../components/Text';
import { toast } from '../../../../components/Toast';
import { useIsMobile } from '../../../../hooks/useIsMobile';
import { useSidebar } from '../../../../components/Sidebar';
import { audienceOf, waitingOn } from '../../hub';
import type { Audience } from '../../hub';
import { useNav } from '../../nav';
import { useSignedIn, useSuite } from '../../store';
import type { HomeGridPos, HomeSize, HomeTile, HomeTileId } from '../../types';
import { useUi } from '../../ui';
import { AidenSparkles } from '../../../AidenSparkles';
import { AddWidget } from './AddWidget';
import type { AddRequest } from './AddWidget';
import { openItems } from '../../openItems';
import { NextUp, needsCount } from './NextUp';
import { Today } from './Today';
import type { BoardBp } from './widgets';
import { APP_LABEL, APP_TAG, BOARD_COLS, CELL, CELL_ROWS, boardBp, onBoard, GROUP_COLOR, ROW, appGroup, HomeCtx, SIZE_LABEL, WIDGETS, WidgetBody, defaultLayout, geometry, layoutFits, placeTile, tileKey, widgetApp, widgetPulse, widgetSubtitle, widgetTitle } from './widgets';
import './Home.scss';

type Bp = BoardBp;

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
};

export function Home() {
  const { state, setHomeLayout } = useSuite();
  const { person } = useSignedIn();
  const { openNewTab } = useUi();
  const mobile = useIsMobile();
  /* Customize is one session, like the Builder: a docked panel to add from, beside the board you arrange
     — add, drag, resize, add more, then Done. (It was a modal drawer: add, close, drag, reopen…) The
     sidebar folds away while it is open, so the board keeps its real column count beside the panel. */
  const [editing, setEditing] = useState(false);
  const [panel, setPanel] = useState<AddRequest>({ mode: 'add' });
  const startEditing = (request: AddRequest = { mode: 'add' }) => {
    setPanel(request);
    setEditing(true);
  };
  const sidebar = useSidebar();
  const sidebarWasOpen = useRef<boolean | null>(null);
  useEffect(() => {
    if (editing) {
      sidebarWasOpen.current = sidebar.open;
      if (sidebar.open) sidebar.setOpen(false);
    } else if (sidebarWasOpen.current !== null) {
      if (sidebarWasOpen.current) sidebar.setOpen(true);
      sidebarWasOpen.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing]);
  // The Aiden Fab moves beside the panel while it is open (the Builder does the same).
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!editing) return;
    const shell = rootRef.current?.closest<HTMLElement>('.ui-app-shell') ?? document.documentElement;
    shell.style.setProperty('--ui-fab-inset-x', 'calc(var(--p-6) + var(--ds-home-panel))');
    return () => void shell.style.removeProperty('--ui-fab-inset-x');
  }, [editing]);
  const [aidenChat, setAidenChat] = useState<string | null>(null);
  const audience = audienceOf(state, person.id);
  const saved = state.homeLayouts[person.id];
  const layout = saved && layoutFits(saved) ? saved : defaultLayout(audience, state, person.id);
  const save = (next: HomeTile[]) => setHomeLayout(person.id, next);

  const remove = (key: string) => {
    const before = layout;
    const t = layout.find((x) => x.key === key);
    save(layout.filter((x) => x.key !== key));
    if (t) toast(`${widgetTitle(t, state)} removed from your home`, { action: { label: 'Undo', onClick: () => save(before) } });
  };
  const add = (id: HomeTileId, ref: string | undefined, size: HomeSize, actions?: string[], name?: string) => {
    // Quick actions, headings and separators can be added as often as you like: each gets its own key.
    const r = id === 'quick' || WIDGETS[id].block ? `${id[0]}${Date.now().toString(36)}` : ref;
    if (layout.some((t) => t.key === tileKey(id, r))) return;
    const t = placeTile(id, r, layout, size, actions, name);
    save([...layout, t]);
    toast(`${widgetTitle(t, state)} added to your home`);
    // New widgets go to the end of the board: bring it into view so you see where it landed.
    // After the board has drawn it (a frame is too soon: the grid places it on its next render).
    setTimeout(() => document.getElementById(`ds-home-${t.key.replace(/[^a-z0-9-]/gi, '-')}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 250);
  };
  const setActions = (key: string, actions: string[], name?: string) => save(layout.map((t) => (t.key === key ? { ...t, actions, name } : t)));
  const rename = (key: string, name: string) => save(layout.map((t) => (t.key === key ? { ...t, name } : t)));

  /* ── The board ── */
  const containerRef = useRef<HTMLDivElement>(null);
  const [measured, setMeasured] = useState(0);
  const measuredRef = useRef(0);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      measuredRef.current = el.clientWidth;
      setMeasured(el.clientWidth);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  // Starting or finishing Customize folds or unfolds the sidebar and docks the panel; while that animates
  // the page is briefly narrower, and the board would reflow to two columns and back. Hold its width
  // through the change so the board stays still.
  const [held, setHeld] = useState<number | null>(null);
  const firstEditing = useRef(true);
  useEffect(() => {
    if (firstEditing.current) {
      firstEditing.current = false;
      return;
    }
    setHeld(measuredRef.current);
    const t = setTimeout(() => setHeld(null), 500);
    return () => clearTimeout(t);
  }, [editing]);
  const width = held ?? measured;
  // The page is My work's reading column; the board holds as many fixed cells as fit it.
  const bp: Bp = width ? (mobile ? 'sm' : boardBp(width)) : 'lg';
  const cols = BOARD_COLS[bp];
  // Cells are at most 240 wide; they give down to 190 to keep an even column count, never grow.
  const cell = bp === 'sm' ? (width - CELL.gap) / 2 : Math.min(CELL.w, (width - (cols - 1) * CELL.gap) / cols);
  const boardWidth = Math.floor(cols * cell + (cols - 1) * CELL.gap);
  // This board's arrangement: kept if the person made one, otherwise reflowed from the four-column one.
  const here = useMemo(() => onBoard(layout, bp), [layout, bp]);

  const items = useMemo<Layout>(() => here.map((t) => ({ i: t.key, x: t[bp]!.x, y: t[bp]!.y, ...geometry(bp, t[bp]!, t.id) })), [here, bp]);

  /** The board reports every arrangement it settles on (after a drag, a compaction). Keep it. */
  const onLayoutChange = (next: Layout) => {
    const moved = here.map((t) => {
      const it = next.find((x) => x.i === t.key);
      return it ? { ...t, [bp]: { x: it.x, y: it.y, size: t[bp]!.size } } : t;
    });
    if (moved.some((t, i) => t[bp]!.x !== here[i][bp]!.x || t[bp]!.y !== here[i][bp]!.y)) save(moved);
  };

  /** The Arrange menu: pick a size, or move a step — the keyboard route to everything dragging does. */
  const arrange = (key: string, change: (p: HomeGridPos) => HomeGridPos) =>
    save(
      here.map((t) => {
        if (t.key !== key) return t;
        const p = change(t[bp]!);
        const { w } = geometry(bp, p, t.id);
        return { ...t, [bp]: { size: p.size, x: Math.max(0, Math.min(cols - w, p.x)), y: Math.max(0, p.y) } };
      }),
    );

  const summary = useMemo(() => {
    // Asks from others plus the person's own late work — the same count Next up stands on.
    const n = needsCount(state, person.id);
    return n ? `${n} ${n === 1 ? 'thing needs' : 'things need'} your attention today.` : 'Nothing needs your attention today.';
  }, [state, person.id]);

  return (
    <HomeCtx.Provider value={{ aidenChat, setAidenChat }}>
      <div ref={rootRef} className={`ds-home-root${editing ? ' ds-home-root--editing' : ''}`}>
      <PageContainer width="narrow">
        {/* The frame takes the page's whole width and is measured; the board inside it is centred at its fixed width. */}
        <div ref={containerRef} className="ds-home-frame">
        <div className={`ds-home-board${cell < CELL.w ? ' ds-home-compact' : ''}`} style={{ maxWidth: width ? boardWidth : undefined }}>
          <PageHeader
            id="ds-home-header"
            title={`${greeting()}, ${person.name.split(' ')[0]}`}
            description={editing ? 'Add widgets from the panel; drag one by its grip, or use its menu to resize, move or remove it.' : summary}
            actions={
              editing ? (
                <>
                  <Button id="ds-home-reset" style="ghost" label="Reset" onClick={() => setHomeLayout(person.id, null)} />
                  <Button id="ds-home-done" label="Done" onClick={() => setEditing(false)} />
                </>
              ) : (
                <>
                  {mobile ? (
                    <Button id="ds-home-search" style="outline" iconOnly IconCenter={Search} aria-label="Search spaces, dashboards and requests" onClick={openNewTab} />
                  ) : (
                    <button type="button" className="ds-home-search" onClick={openNewTab} aria-label="Search spaces, dashboards and requests">
                      <Search aria-hidden="true" />
                      <span>Search</span>
                      <Kbd size="sm">⌘K</Kbd>
                    </button>
                  )}
                  <Button
                    id="ds-home-customize"
                    style="outline"
                    label={mobile ? undefined : 'Customize'}
                    iconOnly={mobile}
                    IconLeft={mobile ? undefined : LayoutGrid}
                    IconCenter={mobile ? LayoutGrid : undefined}
                    aria-label="Customize your home"
                    onClick={() => startEditing()}
                  />
                </>
              )
            }
          />

          {!editing && <NextUp />}

          <Today />

          <Section
            id="ds-home-widgets"
            heading="Keep an eye on"
            className="ds-home-widgets"
            actions={!editing && <Button id="ds-home-add-quick" style="ghost" size="sm" label="Add widget" IconLeft={Plus} onClick={() => startEditing()} />}
          >
            <div className={`ds-home-grid${editing ? ' ds-home-grid--editing' : ''}`}>
              {width > 0 && (
                <GridLayout
                  key={bp}
                  width={boardWidth}
                  layout={items}
                  // 8px rows, no vertical margin: a widget's slot pads the 24px gap under it, a block brings its own.
                  gridConfig={{ cols, rowHeight: ROW, margin: [CELL.gap, 0], containerPadding: [0, 0] }}
                  dragConfig={{ enabled: editing, handle: '.ds-home-grip' }}
                  resizeConfig={{ enabled: false }}
                  onLayoutChange={onLayoutChange}
                >
                  {here.map((t) => (
                    <div key={t.key} className={`ds-home-cell-slot${WIDGETS[t.id].block ? ' ds-home-cell-slot--block' : ''}`}>
                      {WIDGETS[t.id].block ? (
                        <Block tile={t} editing={editing} onRename={(name) => rename(t.key, name)} onArrange={(change) => arrange(t.key, change)} onRemove={() => remove(t.key)} />
                      ) : (
                      <Widget
                        tile={t}
                        editing={editing}
                        bp={bp}
                        audience={audience}
                        onArrange={(change) => arrange(t.key, change)}
                        onEditActions={() => startEditing({ mode: 'actions', key: t.key, actions: t.actions ?? [], name: t.name })}
                        onRemove={() => remove(t.key)}
                      />
                      )}
                    </div>
                  ))}
                </GridLayout>
              )}
            </div>
            {!layout.length && <Text tone="muted">Your board is empty. Use Add widget, or Customize › Reset.</Text>}
          </Section>
        </div>
        </div>

      </PageContainer>
      </div>
      <AddWidget request={editing ? panel : null} docked onClose={() => setEditing(false)} audience={audience} layout={layout} onAdd={add} onSetActions={setActions} onRemove={remove} cell={cell} />
    </HomeCtx.Provider>
  );
}

/** One placed widget: a card the size of its cell — a header that opens its page, and the body for its size. */
function Widget({
  tile: t,
  editing,
  bp,
  audience,
  onArrange,
  onEditActions,
  onRemove,
}: {
  tile: HomeTile;
  editing: boolean;
  bp: Bp;
  audience: Audience;
  onArrange: (change: (p: HomeGridPos) => HomeGridPos) => void;
  onEditActions: () => void;
  onRemove: () => void;
}) {
  const { state } = useSuite();
  const { person } = useSignedIn();
  const { go } = useNav();
  const title = widgetTitle(t, state);
  const subtitle = widgetSubtitle(t, state);
  // Loud when it holds something overdue or blocked, quiet when it holds nothing (widgets.tsx widgetPulse).
  const pulse = editing ? { level: 'normal' as const } : widgetPulse(t, state, person.id);
  const id = `ds-home-${t.key.replace(/[^a-z0-9-]/gi, '-')}`;
  const def = WIDGETS[t.id];
  const size = (t[bp] ?? t.lg).size;
  const app = widgetApp(t);
  const to = def.to?.(t, audience);

  // The count rides in the header only in the detailed view; smaller sizes put the number in the body.
  const count = size === 'L' || size === 'XL' ? (t.id === 'waiting' ? waitingOn(state, person.id).length : t.id === 'requests' ? openItems(state, person.id).filter((m) => m.section === 'progress' || m.section === 'waiting').length : 0) : 0;
  // A widget from one application wears that application's mark — the rail's icon, in its colour — so every
  // IRM widget looks like IRM. The mark already says which app, so no tag repeats it.
  const appMark = APP_TAG[app]?.Icon;
  const mark =
    t.id === 'aiden' ? (
      <span className="ds-home-aiden-mark" aria-hidden="true">
        <AidenSparkles size={20} gradient />
      </span>
    ) : (
      <FeaturedIcon Icon={appMark ?? (t.id === 'quick' ? Zap : def.Icon)} size="sm" color={GROUP_COLOR[appGroup(app)]} />
    );

  const controls = (
    <DropdownMenu id={`${id}-arrange-menu`}>
      <DropdownMenuTrigger>
        <Button id={`${id}-arrange`} style="ghost" size="xs" iconOnly IconCenter={MoreHorizontal} aria-label={`Arrange ${title}`} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Size</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={size} onValueChange={(v) => onArrange((p) => ({ ...p, size: v as HomeSize }))}>
          {def.sizes.map((s) => (
            <DropdownMenuRadioItem key={s} value={s}>
              {SIZE_LABEL[s]}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
        {t.id === 'quick' && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onEditActions}>
              <Zap aria-hidden="true" /> Edit name and actions…
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Move</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => onArrange((p) => ({ ...p, y: p.y - CELL_ROWS }))}>
          <ArrowUp aria-hidden="true" /> Up
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onArrange((p) => ({ ...p, y: p.y + geometry(bp, p, t.id).h }))}>
          <ArrowDown aria-hidden="true" /> Down
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onArrange((p) => ({ ...p, x: p.x - 1 }))}>
          <ArrowLeft aria-hidden="true" /> Left
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onArrange((p) => ({ ...p, x: p.x + 1 }))}>
          <ArrowRight aria-hidden="true" /> Right
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={onRemove}>
          <Trash2 aria-hidden="true" /> Remove
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const heading = (
    <>
      {mark}
      <span className="ds-home-head__text">
        <span className="ds-home-head__title">{title}</span>
        {subtitle && <span className="ds-home-head__sub">{subtitle}</span>}
      </span>
    </>
  );

  return (
    <Card id={id} size="sm" className={`ds-home-widget ds-home-widget--${t.id} ds-home-widget--size-${size}${pulse.level !== 'normal' ? ` ds-home-widget--${pulse.level}` : ''}`} aria-labelledby={`${id}-title`}>
      <div className="ds-home-head">
        {editing && <GripVertical aria-label={`Drag ${title}`} className="ds-home-grip" />}
        <h3 id={`${id}-title`} className="ds-home-head__h">
          {(to || def.open) && !editing ? (
            <button type="button" className="ds-home-head__link" onClick={() => (def.open ? def.open() : go(to!))} title={def.open ? `Open ${title} in ${APP_LABEL[app]}` : `Open ${title}`}>
              {heading}
              <ChevronRight aria-hidden="true" className="ds-home-head__chevron" />
            </button>
          ) : (
            <span className="ds-home-head__link">{heading}</span>
          )}
        </h3>
        <span className="ds-home-head__actions">
          {editing ? (
            controls
          ) : t.id === 'aiden' ? (
            <AidenActions />
          ) : (
            <>
              {pulse.label && size !== 'S' && <Badge id={`${id}-pulse`} label={pulse.label} color="error" appearance="soft" />}
              {count > 0 && <Badge id={`${id}-count`} label={String(count)} color={pulse.level === 'urgent' ? 'error' : 'default'} appearance={pulse.level === 'urgent' ? 'solid' : 'soft'} />}
            </>
          )}
        </span>
      </div>
      <CardBody className="ds-home-widget__body">
        {pulse.level === 'quiet' ? (
          // Nothing here for you: say so once, calmly, instead of drawing an empty list.
          <div className="ds-home-quiet">
            <CircleCheck aria-hidden="true" className="ds-home-quiet__icon" />
            <span className="ds-home-quiet__title">All caught up</span>
            {size !== 'S' && pulse.caughtUp && <span className="ds-home-quiet__text">{pulse.caughtUp}</span>}
          </div>
        ) : (
          <WidgetBody tile={t} size={size} />
        )}
      </CardBody>
    </Card>
  );
}

/** Aiden's header: start over, or carry the conversation into Aiden's own tab. */
function AidenActions() {
  const { go } = useNav();
  return (
    <HomeCtx.Consumer>
      {({ aidenChat, setAidenChat }) => (
        <Stack level={5} direction="horizontal" align="center">
          <Button id="ds-home-aiden-new" style="ghost" size="xs" iconOnly IconCenter={SquarePen} aria-label="New chat" disabled={!aidenChat} onClick={() => setAidenChat(null)} />
          <Button id="ds-home-aiden-open" style="ghost" size="xs" iconOnly IconCenter={Maximize2} aria-label="Open in Aiden" onClick={() => go(aidenChat ? { page: 'aiden-chat', chatId: aidenChat } : { page: 'aiden-launcher' })} />
        </Stack>
      )}
    </HomeCtx.Consumer>
  );
}

/**
 * A block: structure on the board, not a widget. A heading names the section under it — typed in place while
 * customizing; a separator is a line across the board. Both span the whole board and carry no card.
 */
function Block({
  tile: t,
  editing,
  onRename,
  onArrange,
  onRemove,
}: {
  tile: HomeTile;
  editing: boolean;
  onRename: (name: string) => void;
  onArrange: (change: (p: HomeGridPos) => HomeGridPos) => void;
  onRemove: () => void;
}) {
  const id = `ds-home-${t.key.replace(/[^a-z0-9-]/gi, '-')}`;
  const label = t.id === 'heading' ? t.name?.trim() || 'Untitled section' : 'Separator';
  const menu = (
    <DropdownMenu id={`${id}-arrange-menu`}>
      <DropdownMenuTrigger>
        <Button id={`${id}-arrange`} style="ghost" size="xs" iconOnly IconCenter={MoreHorizontal} aria-label={`Arrange ${label}`} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onArrange((p) => ({ ...p, y: p.y - CELL_ROWS }))}>
          <ArrowUp aria-hidden="true" /> Up
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onArrange((p) => ({ ...p, y: p.y + CELL_ROWS }))}>
          <ArrowDown aria-hidden="true" /> Down
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={onRemove}>
          <Trash2 aria-hidden="true" /> Remove
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  if (t.id === 'divider')
    return (
      <div className={`ds-home-block ds-home-block--divider${editing ? ' ds-home-block--editing' : ''}`}>
        {editing && <GripVertical aria-label="Drag separator" className="ds-home-grip" />}
        <Separator className="ds-home-block__line" />
        {editing && menu}
      </div>
    );
  return (
    <div className={`ds-home-block ds-home-block--heading${editing ? ' ds-home-block--editing' : ''}`}>
      {editing ? (
        <>
          <GripVertical aria-label={`Drag ${label}`} className="ds-home-grip" />
          <Input id={`${id}-name`} size="sm" aria-label="Section name" placeholder="Name this section" value={t.name ?? ''} onValueChange={onRename} className="ds-home-block__input" />
          {menu}
        </>
      ) : (
        <h2 id={`${id}-title`} className="ds-home-block__title">
          {label}
        </h2>
      )}
    </div>
  );
}
