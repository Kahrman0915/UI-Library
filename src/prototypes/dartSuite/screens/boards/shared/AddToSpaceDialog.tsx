/* Add to space — Browse B4.1–B4.5, Dashboard D2.2, Pattern/AddToSpace.
   Opened through useUi().openAddToSpace(id) from Browse, the Dashboard viewer
   and the Builder.

   - Rows are the person's own spaces. A space that already holds the dashboard
     is LOCKED: checked, disabled, "Already in this space" (B4.3).
   - Nothing newly selected disables Save (B4.2).
   - "Add to new space" closes and opens the Builder seeded with the dashboard.
   - Save adds, then a success toast offers View space and Undo (B4.4). */

import { useEffect, useMemo, useRef, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import Button from '../../../../../components/Button';
import Checkbox from '../../../../../components/Checkbox';
import Dialog, { DialogBody, DialogFooter, DialogHeader } from '../../../../../components/Dialog';
import Empty, { EmptyDescription, EmptyHeader, EmptyTitle } from '../../../../../components/Empty';
import Input from '../../../../../components/Input';
import Item, { ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '../../../../../components/Item';
import Textarea from '../../../../../components/Textarea';
import ScrollArea from '../../../../../components/ScrollArea';
import { toast } from '../../../../../components/Toast';
import { useNav } from '../../../nav';
import { useSuite } from '../../../store';
import { ownSpaces, spaceAudience } from './boardsShared';

export function AddToSpaceDialog({ open, dashboardId, onClose }: { open: boolean; dashboardId: string | null; onClose: () => void }) {
  // Keep the last dashboard through the exit animation, after the overlay clears its id.
  const last = useRef(dashboardId);
  if (dashboardId) last.current = dashboardId;
  const shownId = dashboardId ?? last.current;
  const { state, addToSpaces, removeFromSpace } = useSuite();
  const { go } = useNav();
  const dashboard = state.dashboards.find((d) => d.id === shownId) ?? null;

  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState<string[]>([]);
  const [note, setNote] = useState('');

  // A fresh dialog every time it opens, for whichever dashboard asked.
  useEffect(() => {
    if (open) {
      setQuery('');
      setPicked([]);
      setNote('');
    }
  }, [open, dashboardId]);

  const spaces = ownSpaces(state);
  const locked = useMemo(
    () => new Set(spaces.filter((s) => shownId && s.items.some((i) => i.dashboardId === shownId)).map((s) => s.id)),
    [spaces, shownId],
  );
  const q = query.trim().toLowerCase();
  const visible = spaces.filter((s) => !q || s.name.toLowerCase().includes(q));

  const toggle = (id: string) => {
    if (locked.has(id)) return;
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  };

  const save = () => {
    if (!dashboard || picked.length === 0) return;
    const ids = [...picked];
    addToSpaces(dashboard.id, ids);
    onClose();
    const first = spaces.find((s) => s.id === ids[0]);
    toast.success(ids.length === 1 ? `Added to ${first?.name ?? 'space'}` : `Added to ${ids.length} spaces`, {
      description: `“${dashboard.name}” is now in ${ids.length === 1 ? 'that space' : 'those spaces'}.${note.trim() ? ` Note: ${note.trim()}` : ''}`,
      action: { label: 'View space', onClick: () => go({ page: 'space', id: ids[0] }) },
      cancel: {
        label: 'Undo',
        onClick: () => {
          ids.forEach((sid) => removeFromSpace(sid, dashboard.id));
          toast('Removed again', { description: `“${dashboard.name}” is back where it was.` });
        },
      },
    });
  };

  const addToNew = () => {
    if (!dashboard) return;
    onClose();
    go({ page: 'builder', seedDashboardId: dashboard.id });
  };

  const count = picked.length;

  return (
    <Dialog id="ds-add-to-space" open={open && !!dashboard} onClose={onClose} closeOnOutsideClick>
      <DialogHeader
        id="ds-add-to-space-header"
        title="Add to space"
        description={dashboard ? `Choose the spaces that should include “${dashboard.name}”.` : 'Choose the spaces that should include this dashboard.'}
        onClose={onClose}
      />
      <DialogBody>
        <div className="ds-boards-dialog-stack">
          <Input
            id="ds-add-to-space-search"
            placeholder="Search spaces…"
            IconLeft={Search}
            value={query}
            onValueChange={setQuery}
            aria-label="Search spaces"
          />
          <Button id="ds-add-to-space-new" style="outline" label="Add to new space" IconLeft={Plus} onClick={addToNew} />
          {visible.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>No spaces match “{query}”</EmptyTitle>
                <EmptyDescription>Try another name, or add it to a new space.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <ScrollArea id="ds-add-to-space-scroll" className="ds-scroll-max ds-boards-space-scroll">
            <ul className="ds-boards-space-list" aria-label="Your spaces">
              {visible.map((s) => {
                const isLocked = locked.has(s.id);
                const checked = isLocked || picked.includes(s.id);
                return (
                  <li key={s.id}>
                    <div
                      className="ds-boards-space-row"
                      data-locked={isLocked ? '' : undefined}
                      onClick={(e) => {
                        // The checkbox handles its own clicks; the rest of the row toggles too.
                        if ((e.target as HTMLElement).closest('input, label')) return;
                        toggle(s.id);
                      }}
                    >
                      <Item variant="outline" size="sm">
                        <ItemMedia variant="bullet" className={`ds-boards-dot ds-boards-hue--${s.hue}`} />
                        <ItemContent>
                          <ItemTitle>{s.name}</ItemTitle>
                          <ItemDescription>{isLocked ? 'Already in this space' : spaceAudience(s)}</ItemDescription>
                        </ItemContent>
                        <ItemActions>
                          <Checkbox
                            id={`ds-add-to-space-${s.id}`}
                            checked={checked}
                            disabled={isLocked}
                            onCheckedChange={() => toggle(s.id)}
                            aria-label={isLocked ? `${s.name} (already in this space)` : s.name}
                          />
                        </ItemActions>
                      </Item>
                    </div>
                  </li>
                );
              })}
            </ul>
            </ScrollArea>
          )}
          <Textarea
            id="ds-add-to-space-note"
            label="Note (optional)"
            placeholder="Why this belongs in the space, for anyone who shares it"
            rows={2}
            value={note}
            onValueChange={setNote}
          />
        </div>
      </DialogBody>
      <DialogFooter>
        <span className="ds-boards-footer-status" aria-live="polite">
          {count === 0 ? 'No spaces selected' : `${count} ${count === 1 ? 'space' : 'spaces'} selected`}
        </span>
        <Button id="ds-add-to-space-cancel" style="ghost" label="Cancel" onClick={onClose} />
        <Button id="ds-add-to-space-save" label="Save changes" disabled={count === 0} onClick={save} />
      </DialogFooter>
    </Dialog>
  );
}
