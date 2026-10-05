/* Add to space — Browse B4.1–B4.5, Dashboard D2.2, Pattern/AddToSpace.
   Opened through useUi().openAddToSpace(id) from Browse, the Dashboard viewer
   and the Builder.

   - Rows are the person's own spaces. A space that already holds the dashboard
     is LOCKED: checked, disabled, "Already in this space" (B4.3).
   - Nothing newly selected disables Save (B4.2).
   - "Add to new space" closes and opens the Builder seeded with the dashboard.
   - Save adds, then a success toast offers View space and Undo (B4.4).
   - It also takes a REPORT (`assetId`) — the same dialog for anything a space can
     hold from the Marketplace, "Add to new space" included (the Builder seeds from either).
   - A METRIC is chosen BEFORE it is placed (2026-10-02): "Show it as" (number,
     trend, breakdown) and a timeframe, with a preview of the card it becomes —
     the same choices the Builder's item panel offers, so nothing lands blind.
     And a metric is NEVER locked: a space can hold several views of one metric,
     so a space that has it reads "In this space · 1 view" and can take another.
   - The Marketplace is for DISCOVERY, not assembly: one item, then either an
     existing space or "Start a new space with this", which hands off to the Builder. */

import { useEffect, useMemo, useRef, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import Button from '../../../../../components/Button';
import Checkbox from '../../../../../components/Checkbox';
import Label from '../../../../../components/Label';
import Stack from '../../../../../components/Stack';
import ToggleGroup, { ToggleGroupItem } from '../../../../../components/ToggleGroup';
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
import type { MetricView } from '../../../types';
import { BREAKDOWN_LABEL, DEFAULT_METRIC_VIEW, MetricViewCard, TIMEFRAME_LABEL } from '../space/MetricViewCard';

const GRAIN_TO_TIMEFRAME = { day: 'day', week: 'week', month: 'mtd' } as const;

export function AddToSpaceDialog({
  open,
  dashboardId,
  assetId = null,
  onClose,
}: {
  open: boolean;
  dashboardId: string | null;
  assetId?: string | null;
  onClose: () => void;
}) {
  // Keep the last item through the exit animation, after the overlay clears its id.
  const last = useRef<{ d: string | null; a: string | null }>({ d: dashboardId, a: assetId });
  if (dashboardId || assetId) last.current = { d: dashboardId, a: assetId };
  const shownId = dashboardId ?? (assetId ? null : last.current.d);
  const shownAsset = assetId ?? (dashboardId ? null : last.current.a);
  const { state, addToSpaces, removeFromSpace, update } = useSuite();
  const { go } = useNav();
  const asset = shownAsset ? state.assets.find((a) => a.id === shownAsset) ?? null : null;
  const dashboard: { id: string; name: string } | null = asset ?? state.dashboards.find((d) => d.id === shownId) ?? null;

  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [view, setView] = useState<MetricView>(DEFAULT_METRIC_VIEW);
  const isMetric = asset?.kind === 'metric';

  // A fresh dialog every time it opens, for whichever dashboard asked.
  useEffect(() => {
    if (open) {
      setQuery('');
      setPicked([]);
      setNote('');
      setView({ ...DEFAULT_METRIC_VIEW, breakdown: asset?.metric?.breakdowns[0] ?? 'org' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, dashboardId, assetId]);

  const spaces = ownSpaces(state);
  const locked = useMemo(
    () =>
      new Set(
        spaces
          .filter((s) => (isMetric ? false : asset ? s.items.some((i) => i.assetId === asset.id) : shownId && s.items.some((i) => i.dashboardId === shownId && !i.widgetId)))
          .map((s) => s.id),
      ),
    [spaces, shownId, asset, isMetric],
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
    if (asset)
      update((d) => {
        for (const sp of d.spaces)
          if (ids.includes(sp.id))
            sp.items.push(
              asset.kind === 'metric'
                ? { dashboardId: '', assetId: asset.id, layout: 'card', viewId: `${Date.now().toString(36)}-${sp.id}`, metric: { ...view } }
                : { dashboardId: '', assetId: asset.id, layout: 'card' },
            );
      });
    else addToSpaces(dashboard.id, ids);
    onClose();
    const first = spaces.find((s) => s.id === ids[0]);
    toast.success(ids.length === 1 ? `Added to ${first?.name ?? 'space'}` : `Added to ${ids.length} spaces`, {
      description: `${isMetric ? `A ${view.display === 'breakdown' ? `breakdown by ${BREAKDOWN_LABEL[view.breakdown].toLowerCase()}` : view.display} of ` : ''}“${dashboard.name}” is now in ${ids.length === 1 ? 'that space' : 'those spaces'}.${note.trim() ? ` Note: ${note.trim()}` : ''}`,
      action: { label: 'View space', onClick: () => go({ page: 'space', id: ids[0] }) },
      cancel: {
        label: 'Undo',
        onClick: () => {
          if (asset)
            update((d) => {
              // Remove only what this add put there — a metric's earlier views stay.
              for (const sp of d.spaces)
                if (ids.includes(sp.id)) {
                  const at = sp.items.map((i) => i.assetId).lastIndexOf(asset.id);
                  if (at >= 0) sp.items.splice(at, 1);
                }
            });
          else ids.forEach((sid) => removeFromSpace(sid, dashboard.id));
          toast('Removed again', { description: `“${dashboard.name}” is back where it was.` });
        },
      },
    });
  };

  const addToNew = () => {
    if (!dashboard) return;
    onClose();
    go(asset ? { page: 'builder', seedAssetId: asset.id } : { page: 'builder', seedDashboardId: dashboard.id });
  };

  const count = picked.length;

  return (
    <Dialog id="ds-add-to-space" className={isMetric ? 'ds-add-dialog--metric' : undefined} open={open && !!dashboard} onClose={onClose} closeOnOutsideClick>
      <DialogHeader
        id="ds-add-to-space-header"
        title="Add to space"
        description={
          !dashboard
            ? 'Choose the spaces that should include this dashboard.'
            : isMetric
              ? `Choose how “${dashboard.name}” shows, then where it goes.`
              : asset
                ? `Choose the spaces that should include “${dashboard.name}”. It appears as a link card that opens the report in a new tab.`
                : `Choose the spaces that should include “${dashboard.name}”.`
        }
        onClose={onClose}
      />
      <DialogBody>
        {/* A metric splits in two — how it shows | where it goes — so the spaces stay in view beside a tall preview. */}
        <div className={isMetric ? 'ds-add-split' : 'ds-boards-dialog-stack'}>
          {isMetric && asset?.metric && (
            <div className="ds-add-view">
              <Stack level={4}>
                <Stack level={5}>
                  <Label id="ds-add-view-display-label">Show it as</Label>
                  <ToggleGroup
                    id="ds-add-view-display"
                    type="single"
                    size="sm"
                    variant="outline"
                    value={view.display}
                    onValueChange={(x) => x && setView((v) => ({ ...v, display: x as MetricView['display'] }))}
                    aria-labelledby="ds-add-view-display-label"
                  >
                    <ToggleGroupItem value="number" label="Number" />
                    <ToggleGroupItem value="trend" label="Trend" />
                    <ToggleGroupItem value="breakdown" label="Breakdown" disabled={!asset.metric.breakdowns.length} />
                  </ToggleGroup>
                </Stack>
                {view.display === 'breakdown' && (
                  <Stack level={5}>
                    <Label id="ds-add-view-by-label">Break down by</Label>
                    <ToggleGroup
                      id="ds-add-view-by"
                      type="single"
                      size="sm"
                      variant="outline"
                      value={view.breakdown}
                      onValueChange={(x) => x && setView((v) => ({ ...v, breakdown: x as MetricView['breakdown'] }))}
                      aria-labelledby="ds-add-view-by-label"
                    >
                      {asset.metric.breakdowns.map((b) => (
                        <ToggleGroupItem key={b} value={b} label={BREAKDOWN_LABEL[b]} />
                      ))}
                    </ToggleGroup>
                  </Stack>
                )}
                <Stack level={5}>
                  <Label id="ds-add-view-time-label" description="“Follows the space” takes each space’s own period and product. Anything else is pinned.">
                    Timeframe
                  </Label>
                  <ToggleGroup
                    id="ds-add-view-time"
                    type="single"
                    size="sm"
                    variant="outline"
                    value={view.timeframe}
                    onValueChange={(x) => x && setView((v) => ({ ...v, timeframe: x as MetricView['timeframe'] }))}
                    aria-labelledby="ds-add-view-time-label"
                  >
                    {(['follow', ...asset.metric.grains.map((g) => GRAIN_TO_TIMEFRAME[g])] as MetricView['timeframe'][]).map((t) => (
                      <ToggleGroupItem key={t} value={t} label={TIMEFRAME_LABEL[t]} />
                    ))}
                  </ToggleGroup>
                </Stack>
                {/* The card it becomes — the same component the space renders. */}
                <div className="ds-add-view__preview" aria-label="Preview">
                  <MetricViewCard id="ds-add-view-preview" asset={asset} view={view} space={null} origin="in each space" />
                </div>
              </Stack>
            </div>
          )}
          <div className="ds-boards-dialog-stack">
          {isMetric && <Label id="ds-add-to-space-where">Add it to</Label>}
          <Input
            id="ds-add-to-space-search"
            placeholder="Search spaces…"
            IconLeft={Search}
            value={query}
            onValueChange={setQuery}
            aria-label="Search spaces"
          />
          <Button id="ds-add-to-space-new" style="outline" label="Start a new space with this" IconLeft={Plus} onClick={addToNew} />
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
                const views = isMetric && asset ? s.items.filter((i) => i.assetId === asset.id).length : 0;
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
                          <ItemDescription>
                            {isLocked
                              ? 'Already in this space'
                              : views
                                ? `In this space · ${views} ${views === 1 ? 'view' : 'views'} · adds another`
                                : spaceAudience(s)}
                          </ItemDescription>
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
        </div>
      </DialogBody>
      <DialogFooter>
        <span className="ds-boards-footer-status" aria-live="polite">
          {count === 0 ? 'No spaces selected' : `${count} ${count === 1 ? 'space' : 'spaces'} selected`}
        </span>
        <Button id="ds-add-to-space-cancel" style="ghost" label="Cancel" onClick={onClose} />
        <Button id="ds-add-to-space-save" label={count === 0 ? 'Add' : `Add to ${count} ${count === 1 ? 'space' : 'spaces'}`} disabled={count === 0} onClick={save} />
      </DialogFooter>
    </Dialog>
  );
}
