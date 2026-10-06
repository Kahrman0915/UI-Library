/* DART Central · Home — "Add to Home", Apple's widget gallery.

   Every widget this person can have, grouped by the application it comes from.
   Choosing one opens its page in the gallery: its sizes, and a LIVE preview of
   it at each — your real numbers, not a picture — at the size it will be.
   "Space" and "Dashboard" pin one thing each, so they ask which first. "Quick
   actions" asks which shortcuts it holds, grouped by application — build one of
   IRM actions to sit beside your IRM reports, another for DartBoards. The same
   picker edits a placed quick-actions widget (its menu › Choose actions). */

import { useEffect, useState } from 'react';
import { ArrowLeft, ChevronRight, MoreHorizontal, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import Badge from '../../../../components/Badge';
import Button from '../../../../components/Button';
import Card, { CardBody } from '../../../../components/Card';
import Checkbox from '../../../../components/Checkbox';
import Drawer, { DrawerBody, DrawerFooter, DrawerHeader } from '../../../../components/Drawer';
import DropdownMenu, { DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../../../components/DropdownMenu';
import FeaturedIcon from '../../../../components/FeaturedIcon';
import Input from '../../../../components/Input';
import Item, { ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from '../../../../components/Item';
import Section from '../../../../components/Section';
import Stack from '../../../../components/Stack';
import Text from '../../../../components/Text';
import { toast } from '../../../../components/Toast';
import ToggleGroup, { ToggleGroupItem } from '../../../../components/ToggleGroup';
import type { Audience } from '../../hub';
import { useSignedIn, useSuite } from '../../store';
import type { TabSet } from '../../store';
import { useNav } from '../../nav';
import type { HomeSize, HomeTile, HomeTileId } from '../../types';
import { AidenSparkles } from '../../../AidenSparkles';
import { useBox } from './fit';
import { QUICK_APPS, QUICK_CAPACITY, availableActions, isTabSetAction, quickAction, quickTitle, tabSetActionId } from './quickActions';
import { APP_TAG, CELL, GROUP_COLOR, appGroup, SIZE_GEOMETRY, SIZE_HINT, SIZE_LABEL, WIDGET_GROUPS, WIDGETS, WidgetBody, tileKey, widgetApp, widgetSubtitle, widgetTitle } from './widgets';

/** What the drawer was opened for: the gallery, or the actions of one quick-actions widget. */
export type AddRequest = { mode: 'add' } | { mode: 'actions'; key: string; actions: string[]; name?: string };

type Step = { kind: 'list' } | { kind: 'pick'; what: 'space' | 'dashboard' | 'metric' } | { kind: 'actions' } | { kind: 'detail'; id: HomeTileId; ref?: string };

export function AddWidget({
  request,
  onClose,
  audience,
  layout,
  onAdd,
  onSetActions,
  onRemove,
  cell = CELL.w,
  docked = false,
}: {
  request: AddRequest | null;
  onClose: () => void;
  audience: Audience;
  layout: HomeTile[];
  onAdd: (id: HomeTileId, ref: string | undefined, size: HomeSize, actions?: string[], name?: string) => void;
  onSetActions: (key: string, actions: string[], name?: string) => void;
  onRemove: (key: string) => void;
  /** The board's cell width right now, so the preview is the widget as it will be drawn (190–240). */
  cell?: number;
  /**
   * Customize's panel: docked beside the board instead of over it, so adding, arranging and adding more
   * is one session. Finishing a step returns to the list rather than closing; Done (or ×) ends it.
   */
  docked?: boolean;
}) {
  const { state } = useSuite();
  const [step, setStep] = useState<Step>({ kind: 'list' });
  const [query, setQuery] = useState('');
  const [size, setSize] = useState<HomeSize>('M');
  const [actions, setActions] = useState<string[]>([]);
  const [name, setName] = useState('');
  // The quick-actions widget being edited, if any. Kept locally so that, docked, finishing the edit and
  // returning to the list really ends it — a new Quick actions widget must not save over the old one.
  const [editing, setEditing] = useState<Extract<AddRequest, { mode: 'actions' }> | null>(null);

  // Each opening starts where it was asked to.
  useEffect(() => {
    if (!request) return;
    setQuery('');
    setEditing(request.mode === 'actions' ? request : null);
    if (request.mode === 'actions') {
      setActions(request.actions);
      setName(request.name ?? '');
      setStep({ kind: 'actions' });
    } else setStep({ kind: 'list' });
  }, [request]);

  const toDetail = (id: HomeTileId, ref?: string) => {
    setStep({ kind: 'detail', id, ref });
    setSize(WIDGETS[id].size);
    setQuery('');
  };
  const has = (key: string) => layout.some((t) => t.key === key);
  const available = (Object.keys(WIDGETS) as HomeTileId[]).filter((id) => (!WIDGETS[id].for || WIDGETS[id].for!.includes(audience)) && (!WIDGETS[id].admin || !!state.adminScope));
  const back = <Button id="ds-home-add-back" style="ghost" size="sm" label="All widgets" IconLeft={ArrowLeft} onClick={() => setStep({ kind: 'list' })} />;

  let title = docked ? 'Customize your home' : 'Add to Home';
  let description = docked
    ? 'Add widgets here — each goes to the end of your board. Drag them on the board to arrange them, then Done.'
    : 'Choose a widget, then its size. New widgets go to the end of your board.';
  let body: React.ReactNode;
  // Docked, the page header's Done ends the session — a second Done here would be the same button twice.
  let footer: React.ReactNode = docked ? null : <Button id="ds-home-add-done" label="Done" onClick={onClose} />;

  if (step.kind === 'actions') {
    title = editing ? 'Edit quick actions' : 'Quick actions';
    description = 'Pick the shortcuts this widget holds, in the order you tick them. You can add as many quick-actions widgets as you like.';
    body = (
      <Stack level={3}>
        {!editing && <div>{back}</div>}
        <Input
          id="ds-home-actions-name"
          label="Widget title"
          placeholder={quickTitle(actions)}
          description={`Optional — the heading on the widget. Leave it empty to use “${quickTitle(actions)}”.`}
          value={name}
          onValueChange={setName}
        />
        <ActionPicker audience={audience} isAdmin={!!state.adminScope} value={actions} onChange={setActions} />
      </Stack>
    );
    footer = editing ? (
      <>
        <Button id="ds-home-add-cancel" style="ghost" label="Cancel" onClick={() => (docked ? (setEditing(null), setStep({ kind: 'list' })) : onClose())} />
        <Button id="ds-home-add-save" label="Save" disabled={!actions.length} onClick={() => (onSetActions(editing.key, actions, name.trim() || undefined), docked ? (setEditing(null), setStep({ kind: 'list' })) : onClose())} />
      </>
    ) : (
      <Button id="ds-home-add-next" label="Next: choose a size" IconRight={ChevronRight} disabled={!actions.length} onClick={() => toDetail('quick')} />
    );
  } else if (step.kind === 'pick') {
    title = step.what === 'space' ? 'Pin a space' : step.what === 'metric' ? 'Pin a metric' : 'Pin a dashboard';
    description =
      step.what === 'space' ? 'Its dashboards show on your home, each with its number and trend.' : step.what === 'metric' ? 'Its value and change show on your home.' : 'Its headline number and trend show on your home.';
    const list =
      step.what === 'space'
        ? state.spaces.map((s) => ({ ref: s.id, title: s.name, detail: `${s.items.length} items${s.shared ? ' · shared with you' : ''}` }))
        : step.what === 'metric'
          ? state.assets.filter((a) => a.kind === 'metric').map((a) => ({ ref: a.id, title: a.name, detail: `${a.glance} · ${a.subject}` }))
          : state.dashboards.filter((d) => d.lifecycle === 'published' && d.hasAccess !== false).map((d) => ({ ref: d.id, title: d.name, detail: d.category }));
    const q = query.trim().toLowerCase();
    const picks = list.filter((p) => !q || p.title.toLowerCase().includes(q));
    body = (
      <Stack level={3}>
        <div>{back}</div>
        <Input id="ds-home-add-search" aria-label={`Find a ${step.what}`} placeholder={`Find a ${step.what}…`} IconLeft={Search} value={query} onValueChange={setQuery} />
        <ItemGroup className="ds-home-add__list">
          {picks.map((p) => {
            const added = has(tileKey(step.what, p.ref));
            return (
              <Item key={p.ref} variant="outline" size="sm" className={`ds-home-add__row${added ? ' ds-home-add__row--added' : ''}`} onClick={added ? undefined : () => toDetail(step.what, p.ref)}>
                <ItemContent>
                  <ItemTitle>{p.title}</ItemTitle>
                  <ItemDescription>{p.detail}</ItemDescription>
                </ItemContent>
                <ItemActions>{added ? <Badge id={`ds-home-add-${p.ref}-added`} label="Added" color="success" appearance="soft" /> : <Plus aria-hidden="true" className="ds-home-add__go" />}</ItemActions>
              </Item>
            );
          })}
          {!picks.length && <Text size="sm" tone="muted">Nothing matches.</Text>}
        </ItemGroup>
      </Stack>
    );
  } else if (step.kind === 'detail') {
    const def = WIDGETS[step.id];
    const tile: HomeTile = { key: 'preview', id: step.id, ref: step.ref, actions: step.id === 'quick' ? actions : undefined, name: step.id === 'quick' ? name.trim() || undefined : undefined, lg: { x: 0, y: 0, size }, sm: { x: 0, y: 0, size } };
    title = widgetTitle(tile, state);
    description = def.description;
    const added = step.id !== 'quick' && has(tileKey(step.id, step.ref));
    body = (
      <Stack level={3}>
        <div>
          <Button id="ds-home-add-back" style="ghost" size="sm" label={step.id === 'quick' ? 'Back to actions' : 'All widgets'} IconLeft={ArrowLeft} onClick={() => setStep(step.id === 'quick' ? { kind: 'actions' } : { kind: 'list' })} />
        </div>
        <ToggleGroup id="ds-home-add-size" type="single" value={size} aria-label="Size" onValueChange={(v) => v && setSize(v as HomeSize)}>
          {def.sizes.map((s) => (
            <ToggleGroupItem key={s} value={s} label={SIZE_LABEL[s]} />
          ))}
        </ToggleGroup>
        <Text size="sm" tone="muted">
          {step.id === 'quick'
            ? `${SIZE_LABEL[size]}: holds ${QUICK_CAPACITY[size]} actions.${actions.length > QUICK_CAPACITY[size] ? ` You picked ${actions.length} — choose a bigger size to show them all.` : ''}`
            : `${SIZE_LABEL[size]}: ${SIZE_HINT[size].toLowerCase()}.`}
        </Text>
        <Preview tile={tile} cell={cell} />
      </Stack>
    );
    footer = added ? (
      <Button id="ds-home-add-confirm" label="Already on your home" disabled />
    ) : (
      <Button id="ds-home-add-confirm" label={`Add ${SIZE_LABEL[size].toLowerCase()} widget`} IconLeft={Plus} onClick={() => (onAdd(step.id, step.ref, size, step.id === 'quick' ? actions : undefined, step.id === 'quick' ? name.trim() || undefined : undefined), setStep({ kind: 'list' }))} />
    );
  } else {
    body = (
      <Stack level={2}>
        {WIDGET_GROUPS.map((g) => {
          const ids = available.filter((id) => WIDGETS[id].group === g);
          if (!ids.length) return null;
          return (
            <Section key={g} id={`ds-home-add-${g.toLowerCase()}`} heading={g} variant="group" headingLevel="h3">
              <ItemGroup className="ds-home-add__list">
                {ids.map((id) => {
                  const w = WIDGETS[id];
                  const placed = layout.filter((t) => t.id === id).length;
                  const single = !w.pick && !w.block && has(id);
                  // A new quick-actions widget starts empty: nothing is chosen for you.
                  const open = () => (w.block ? onAdd(id, undefined, 'W', undefined, id === 'heading' ? 'New section' : undefined) : id === 'quick' ? (setActions([]), setName(''), setStep({ kind: 'actions' })) : w.pick === 'space' || w.pick === 'dashboard' || w.pick === 'metric' ? setStep({ kind: 'pick', what: w.pick }) : toDetail(id));
                  return (
                    <Item key={id} variant="outline" className={`ds-home-add__row${single ? ' ds-home-add__row--added' : ''}`} onClick={single ? undefined : open}>
                      <ItemMedia>
                        <FeaturedIcon Icon={w.Icon} size="sm" color={GROUP_COLOR[g]} />
                      </ItemMedia>
                      <ItemContent>
                        <ItemTitle>
                          <span className="ds-home-add__name">
                            {w.title}
                            {single ? <Badge id={`ds-home-add-${id}-added`} label="Added" color="success" appearance="soft" /> : placed > 0 && <Badge id={`ds-home-add-${id}-n`} label={`${placed} on your home`} color="default" appearance="soft" />}
                          </span>
                        </ItemTitle>
                        <ItemDescription>{w.block ? `${w.description} Rename and move it in Customize.` : `${w.description} · ${w.sizes.map((s) => SIZE_LABEL[s]).join(', ')}`}</ItemDescription>
                      </ItemContent>
                      <ItemActions>
                        {single ? (
                          <Button id={`ds-home-add-${id}-remove`} style="ghost" size="xs" iconOnly IconCenter={X} aria-label={`Remove ${w.title} from your home`} onClick={() => onRemove(id)} />
                        ) : w.block ? (
                          <Plus aria-hidden="true" className="ds-home-add__go" />
                        ) : (
                          <ChevronRight aria-hidden="true" className="ds-home-add__go" />
                        )}
                      </ItemActions>
                    </Item>
                  );
                })}
              </ItemGroup>
            </Section>
          );
        })}
      </Stack>
    );
  }

  return (
    <Drawer id="ds-home-add" open={!!request} onClose={onClose} modal={!docked} className={`ds-home-add${docked ? ' ds-home-add--docked' : ''}`}>
      <DrawerHeader id="ds-home-add-header" title={title} description={description} onClose={onClose} />
      <DrawerBody>{body}</DrawerBody>
      {footer && <DrawerFooter>{footer}</DrawerFooter>}
    </Drawer>
  );
}

/** Pick quick actions, grouped by application. The order picked is the order shown. */
function ActionPicker({ audience, isAdmin, value, onChange }: { audience: Audience; isAdmin: boolean; value: string[]; onChange: (ids: string[]) => void }) {
  const all = availableActions(audience, isAdmin);
  const { state } = useSuite();
  const { person } = useSignedIn();
  const sets = state.tabSets[person.id] ?? [];
  const labelOf = (id: string) => (isTabSetAction(id) ? sets.find((x) => tabSetActionId(x.id) === id)?.name : quickAction(id)?.label);
  const toggle = (id: string, on: boolean) => onChange(on ? [...value, id] : value.filter((x) => x !== id));
  return (
    <Stack level={2}>
      {value.length > 0 && (
        <Text size="sm" tone="muted">
          {`In this widget, in order: ${value.map(labelOf).filter(Boolean).join(' · ')}`}
        </Text>
      )}
      {/* Saved tab sets: one click reopens every tab in the set, as a tab group of that name. */}
      <Section id="ds-home-actions-tabsets" heading="Your saved tabs" variant="group" headingLevel="h3">
        <Stack level={4}>
          {sets.map((set) => (
            <TabSetRow key={set.id} set={set} others={sets.filter((x) => x.id !== set.id)} checked={value.includes(tabSetActionId(set.id))} onToggle={(on) => toggle(tabSetActionId(set.id), on)} onDeleted={() => onChange(value.filter((x) => x !== tabSetActionId(set.id)))} />
          ))}
          <Text size="sm" tone="muted">
            {sets.length ? 'Save more from any tab: right-click it › Save these tabs…' : 'None yet. Right-click any tab › Save these tabs… to save the tabs you have open.'}
          </Text>
        </Stack>
      </Section>
      {QUICK_APPS.map((app) => {
        const acts = all.filter((a) => a.app === app.id);
        if (!acts.length) return null;
        return (
          <Section key={app.id} id={`ds-home-actions-${app.id}`} heading={app.label} variant="group" headingLevel="h3">
            <Stack level={4}>
              {acts.map((a) => (
                <Checkbox
                  key={a.id}
                  id={`ds-home-action-${a.id}`}
                  label={a.label}
                  description={a.hint}
                  checked={value.includes(a.id)}
                  onCheckedChange={(on) => onChange(on ? [...value, a.id] : value.filter((x) => x !== a.id))}
                />
              ))}
            </Stack>
          </Section>
        );
      })}
    </Stack>
  );
}

/**
 * One saved tab set in the picker: tick it to put it in the widget, or rename or delete it from its menu.
 * Rename edits in place and also renames the set's tab group if it is open (one click finds a set by
 * its name, so the two must not drift). Delete offers Undo; any widget holding the set just drops it.
 */
function TabSetRow({ set, others, checked, onToggle, onDeleted }: { set: TabSet; others: TabSet[]; checked: boolean; onToggle: (on: boolean) => void; onDeleted: () => void }) {
  const { saveTabSet, removeTabSet } = useSuite();
  const { person } = useSignedIn();
  const nav = useNav();
  const [renaming, setRenaming] = useState<string | null>(null);
  const id = `ds-home-action-tabset-${set.id}`;
  const draft = (renaming ?? '').trim();
  const taken = others.some((x) => x.name.toLowerCase() === draft.toLowerCase());
  const commit = () => {
    if (!draft || taken) return;
    const group = nav.groups.find((g) => g.label === set.name);
    saveTabSet(person.id, { ...set, name: draft });
    if (group) nav.renameGroup(group.id, draft);
    setRenaming(null);
  };
  const remove = () => {
    removeTabSet(person.id, set.id);
    onDeleted();
    toast(`Deleted “${set.name}”`, { action: { label: 'Undo', onClick: () => saveTabSet(person.id, set) } });
  };

  if (renaming !== null)
    return (
      <form
        id={`${id}-rename`}
        className="ds-home-tabset ds-home-tabset--renaming"
        onSubmit={(e) => {
          e.preventDefault();
          commit();
        }}
      >
        <Input
          id={`${id}-name`}
          label="Name"
          value={renaming}
          onValueChange={setRenaming}
          error={taken}
          errorMessage="You already have a set with this name."
          autoFocus
          onKeyDown={(e) => e.key === 'Escape' && setRenaming(null)}
        />
        <Stack level={5} direction="horizontal" justify="end">
          <Button id={`${id}-rename-cancel`} style="ghost" size="sm" label="Cancel" onClick={() => setRenaming(null)} />
          <Button id={`${id}-rename-save`} size="sm" label="Save" disabled={!draft || taken} onClick={commit} />
        </Stack>
      </form>
    );

  return (
    <div className="ds-home-tabset">
      <Checkbox id={id} label={set.name} description={`Opens ${set.routes.length} ${set.routes.length === 1 ? 'tab' : 'tabs'} in one click`} checked={checked} onCheckedChange={onToggle} />
      <DropdownMenu id={`${id}-menu`}>
        <DropdownMenuTrigger>
          <Button id={`${id}-menu-btn`} style="ghost" size="xs" iconOnly IconCenter={MoreHorizontal} aria-label={`Rename or delete ${set.name}`} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setRenaming(set.name)}>
            <Pencil aria-hidden="true" /> Rename…
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={remove}>
            <Trash2 aria-hidden="true" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

/* The live preview: the real widget at its real size, scaled down only if the drawer is narrower.
   Not interactive — it is a picture of what you get. */
function Preview({ tile, cell }: { tile: HomeTile; cell: number }) {
  const { state } = useSuite();
  const [ref, box] = useBox<HTMLDivElement>();
  const g = SIZE_GEOMETRY.lg[tile.lg.size];
  const w = g.w * cell + (g.w - 1) * CELL.gap;
  const h = g.h * CELL.h + (g.h - 1) * CELL.gap;
  const scale = box.w ? Math.min(1, box.w / w) : 0;
  const def = WIDGETS[tile.id];
  const app = widgetApp(tile);
  return (
    <div ref={ref} className={`ds-home-preview${cell < CELL.w ? ' ds-home-compact' : ''}`} style={{ height: h * scale }}>
      {scale > 0 && (
        <div className="ds-home-preview__stage" style={{ width: w, height: h, left: (box.w - w * scale) / 2, transform: `scale(${scale})` }} {...({ inert: '' } as object)} aria-hidden="true">
          <Card id="ds-home-preview-card" size="sm" className={`ds-home-widget ds-home-widget--${tile.id} ds-home-widget--size-${tile.lg.size}`}>
            <div className="ds-home-head">
              <span className="ds-home-head__link">
                {tile.id === 'aiden' ? (
                  <span className="ds-home-aiden-mark">
                    <AidenSparkles size={20} gradient />
                  </span>
                ) : (
                  <FeaturedIcon Icon={APP_TAG[app]?.Icon ?? def.Icon} size="sm" color={GROUP_COLOR[appGroup(app)]} />
                )}
                <span className="ds-home-head__text">
                  <span className="ds-home-head__title">{widgetTitle(tile, state)}</span>
                  <span className="ds-home-head__sub">{widgetSubtitle(tile, state)}</span>
                </span>
              </span>
            </div>
            <CardBody className="ds-home-widget__body">
              <WidgetBody tile={tile} size={tile.lg.size} />
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}
