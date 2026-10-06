/* IRM · table set-up — which columns a table shows, and views kept under a name.

   Shared by the Inventory and Requests pages. The button names the view on screen
   and says when it has been changed since it was saved; the menu switches views,
   saves the current set-up as a new one, and updates, renames or deletes the one
   that is open. Each page owns its own view shape and storage; this only needs to
   know how to compare two views (`essence`) and where to keep them. */

import { useState } from 'react';
import { ArrowDown, ArrowUp, Bookmark, Check, Columns3, Pencil, Save, Trash2 } from 'lucide-react';
import Button from '../../../../components/Button';
import Checkbox from '../../../../components/Checkbox';
import Dialog, { DialogBody, DialogFooter, DialogHeader } from '../../../../components/Dialog';
import DropdownMenu, { DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../../../../components/DropdownMenu';
import Input from '../../../../components/Input';
import Popover, { PopoverContent, PopoverTrigger } from '../../../../components/Popover';
import Section from '../../../../components/Section';
import Stack from '../../../../components/Stack';
import { toast } from '../../../../components/Toast';
import type { SavedView } from '../../store';

export function SavedViewsMenu<V extends { savedId?: string }>({
  id,
  view,
  defaults,
  saved,
  essence,
  keeps,
  placeholder,
  setView,
  setSaved,
}: {
  id: string;
  /** The view on screen. */
  view: V;
  /** The view the page starts on — "Default view". */
  defaults: V;
  saved: SavedView<V>[];
  /** What makes two views the same, as a string. */
  essence: (v: V) => string;
  /** What a saved view keeps, in the save dialog's words. */
  keeps: string;
  placeholder: string;
  /** `null` goes back to the default view. */
  setView: (v: V | null) => void;
  setSaved: (list: SavedView<V>[]) => void;
}) {
  const active = saved.find((v) => v.id === view.savedId);
  const edited = essence(active ? active.view : defaults) !== essence(view);
  const [naming, setNaming] = useState<{ mode: 'new' | 'rename'; name: string } | null>(null);

  const strip = (v: V): V => {
    const { savedId: _drop, ...rest } = v;
    return rest as V;
  };
  const open = (v: SavedView<V> | null) => setView(v ? { ...v.view, savedId: v.id } : null);
  const nameTaken = (name: string) => saved.some((v) => v.name.toLowerCase() === name.trim().toLowerCase() && (naming?.mode === 'new' || v.id !== active?.id));

  const commit = () => {
    if (!naming) return;
    const name = naming.name.trim();
    if (!name || nameTaken(name)) return;
    if (naming.mode === 'new') {
      const vid = `v${Date.now().toString(36)}`;
      setSaved([...saved, { id: vid, name, view: strip(view) }]);
      setView({ ...strip(view), savedId: vid });
      toast(`View “${name}” saved`);
    } else if (active) {
      setSaved(saved.map((v) => (v.id === active.id ? { ...v, name } : v)));
      toast(`View renamed to “${name}”`);
    }
    setNaming(null);
  };

  const label = `${active?.name ?? 'Default view'}${edited ? ' · edited' : ''}`;
  const trimmed = naming?.name.trim() ?? '';
  const error = naming && trimmed && nameTaken(trimmed) ? 'You already have a view with that name.' : undefined;
  const tick = (on: boolean) => (on ? <Check aria-hidden="true" /> : <span className="ds-inv__menu-gap" aria-hidden="true" />);

  return (
    <>
      <DropdownMenu id={id}>
        <DropdownMenuTrigger>
          <Button id={`${id}-btn`} size="sm" style="outline" label={label} IconLeft={Bookmark} className="ds-inv__views" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Views</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => open(null)}>
            {tick(!active)}
            Default view
          </DropdownMenuItem>
          {saved.map((v) => (
            <DropdownMenuItem key={v.id} onClick={() => open(v)}>
              {tick(active?.id === v.id)}
              {v.name}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          {active && edited && (
            <DropdownMenuItem
              onClick={() => {
                setSaved(saved.map((v) => (v.id === active.id ? { ...v, view: strip(view) } : v)));
                toast(`View “${active.name}” updated`);
              }}
            >
              <Save aria-hidden="true" />
              {`Save changes to “${active.name}”`}
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => setNaming({ mode: 'new', name: '' })}>
            <Bookmark aria-hidden="true" />
            Save as new view…
          </DropdownMenuItem>
          {active && (
            <>
              <DropdownMenuItem onClick={() => setNaming({ mode: 'rename', name: active.name })}>
                <Pencil aria-hidden="true" />
                Rename view…
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => {
                  setSaved(saved.filter((v) => v.id !== active.id));
                  setView(strip(view));
                  toast(`View “${active.name}” deleted`);
                }}
              >
                <Trash2 aria-hidden="true" />
                Delete view
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog id={`${id}-name`} open={!!naming} onClose={() => setNaming(null)}>
        <DialogHeader
          id={`${id}-name-header`}
          title={naming?.mode === 'rename' ? 'Rename view' : 'Save view'}
          description={naming?.mode === 'rename' ? undefined : `Keeps ${keeps} under a name.`}
          onClose={() => setNaming(null)}
        />
        <DialogBody>
          <form
            id={`${id}-name-form`}
            onSubmit={(e) => {
              e.preventDefault();
              commit();
            }}
          >
            <Input
              id={`${id}-name-input`}
              label="Name"
              placeholder={placeholder}
              value={naming?.name ?? ''}
              onValueChange={(name) => naming && setNaming({ ...naming, name })}
              error={!!error}
              errorMessage={error}
              autoFocus
            />
          </form>
        </DialogBody>
        <DialogFooter>
          <Button id={`${id}-name-cancel`} style="ghost" label="Cancel" onClick={() => setNaming(null)} />
          <Button id={`${id}-name-save`} label={naming?.mode === 'rename' ? 'Rename' : 'Save view'} disabled={!trimmed || !!error} onClick={commit} />
        </DialogFooter>
      </Dialog>
    </>
  );
}

/**
 * Which columns a table shows, and in what order. A `locked` column always shows and keeps its place
 * (a table makes no sense without the thing that names each row); the rest can be hidden, shown and
 * moved left or right. "Reset view" puts the whole table back to its default.
 */
export function ColumnsMenu({
  id,
  all,
  shown,
  onChange,
  onReset,
}: {
  id: string;
  all: { key: string; label: string; locked?: boolean }[];
  shown: string[];
  onChange: (columns: string[]) => void;
  onReset: () => void;
}) {
  const byKey = (k: string) => all.find((c) => c.key === k);
  const hidden = all.filter((c) => !shown.includes(c.key));
  const toggle = (key: string, on: boolean) => onChange(on ? [...shown, key] : shown.filter((k) => k !== key));
  // A column can move past other movable columns, never past a locked one.
  const canMove = (i: number, by: number) => {
    const j = i + by;
    return j >= 0 && j < shown.length && !byKey(shown[j])?.locked;
  };
  const move = (i: number, by: number) => {
    if (!canMove(i, by)) return;
    const next = [...shown];
    [next[i], next[i + by]] = [next[i + by], next[i]];
    onChange(next);
  };
  return (
    <Popover id={id}>
      <PopoverTrigger>
        <Button id={`${id}-btn`} size="sm" style="outline" label="Columns" IconLeft={Columns3} />
      </PopoverTrigger>
      <PopoverContent align="end" className="ds-inv__panel">
        <Stack level={3}>
          <Section id={`${id}-shown`} heading="Showing, in order" variant="group" headingLevel="h3">
            <ol className="ds-inv__cols">
              {shown.map((key, i) => {
                const c = byKey(key);
                if (!c) return null;
                return (
                  <li key={key} className="ds-inv__col">
                    <Checkbox id={`${id}-col-${key}`} label={c.label} checked disabled={c.locked} onCheckedChange={(on) => toggle(key, on)} />
                    {!c.locked && (
                      <Stack level={5} direction="horizontal">
                        <Button id={`${id}-col-${key}-up`} style="ghost" size="xs" iconOnly IconCenter={ArrowUp} aria-label={`Move ${c.label} left`} disabled={!canMove(i, -1)} onClick={() => move(i, -1)} />
                        <Button id={`${id}-col-${key}-down`} style="ghost" size="xs" iconOnly IconCenter={ArrowDown} aria-label={`Move ${c.label} right`} disabled={!canMove(i, 1)} onClick={() => move(i, 1)} />
                      </Stack>
                    )}
                  </li>
                );
              })}
            </ol>
          </Section>
          {hidden.length > 0 && (
            <Section id={`${id}-more`} heading="More columns" variant="group" headingLevel="h3">
              <Stack level={4}>
                {hidden.map((c) => (
                  <Checkbox key={c.key} id={`${id}-col-${c.key}`} label={c.label} checked={false} onCheckedChange={(on) => toggle(c.key, on)} />
                ))}
              </Stack>
            </Section>
          )}
          <div>
            <Button id={`${id}-reset`} style="ghost" size="sm" label="Reset view" onClick={onReset} />
          </div>
        </Stack>
      </PopoverContent>
    </Popover>
  );
}
