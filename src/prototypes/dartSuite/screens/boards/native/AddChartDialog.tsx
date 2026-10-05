/* DartBoards · native dashboards — add ONE chart to a space.

   The whole-dashboard "Add to space" dialog, narrowed to a chart. Possible only
   because DartBoards renders the chart itself: an embed is one opaque frame, so
   the smallest thing you can put in a space from Tableau is the whole dashboard. */

import { useEffect, useState } from 'react';
import Button from '../../../../../components/Button';
import Checkbox from '../../../../../components/Checkbox';
import Dialog, { DialogBody, DialogFooter, DialogHeader } from '../../../../../components/Dialog';
import { toast } from '../../../../../components/Toast';
import { useNav } from '../../../nav';
import { useSuite } from '../../../store';
import type { Dashboard, NativeWidget } from '../../../types';
import { ownSpaces } from '../shared/boardsShared';
import { spacesWithWidget } from './nativeShared';

type Props = { open: boolean; dashboard: Dashboard; widget: NativeWidget | null; onClose: () => void };

export function AddChartDialog({ open, dashboard, widget, onClose }: Props) {
  const { state, update } = useSuite();
  const { go } = useNav();
  const [picked, setPicked] = useState<string[]>([]);
  const base = `ds-native-${dashboard.id}-add`;

  useEffect(() => {
    if (open) setPicked([]);
  }, [open]);

  if (!widget) return null;
  const spaces = ownSpaces(state);
  const already = new Set(spacesWithWidget(spaces, dashboard, widget));

  const save = () => {
    update((d) => {
      for (const s of d.spaces) {
        if (picked.includes(s.id)) s.items.push({ dashboardId: dashboard.id, widgetId: widget.id, layout: 'card' });
      }
    });
    const names = spaces.filter((s) => picked.includes(s.id)).map((s) => s.name);
    const first = picked[0];
    onClose();
    toast.success('Chart added', {
      description: `“${widget.title}” is in ${names.join(' and ')}. It follows the suite’s filters there too.`,
      action: { label: 'Open space', onClick: () => go({ page: 'space', id: first }) },
    });
  };

  return (
    <Dialog id={base} open={open} onClose={onClose} closeOnOutsideClick>
      <DialogHeader
        id={`${base}-header`}
        title="Add this chart to a space"
        description={`Just “${widget.title}”, not all of ${dashboard.name}. It stays live and follows the suite’s filters.`}
        onClose={onClose}
      />
      <DialogBody>
        <div className="ds-native-add-list">
          {spaces.map((s) => (
            <Checkbox
              key={s.id}
              id={`${base}-${s.id}`}
              label={s.name}
              description={already.has(s.id) ? 'Already has this chart' : undefined}
              checked={already.has(s.id) || picked.includes(s.id)}
              disabled={already.has(s.id)}
              onCheckedChange={(c) => setPicked((p) => (c ? [...p, s.id] : p.filter((x) => x !== s.id)))}
            />
          ))}
        </div>
      </DialogBody>
      <DialogFooter>
        <Button id={`${base}-cancel`} style="ghost" label="Cancel" onClick={onClose} />
        <Button id={`${base}-save`} label="Add chart" disabled={picked.length === 0} onClick={save} />
      </DialogFooter>
    </Dialog>
  );
}
