/* Dashboard · the three export dialogs (Figma section 3 · EXPORT).

   D3.1 PDF — Includes, Scaling, Page size, Orientation.
   D3.2 PowerPoint — Includes.
   D3.3 Data — Includes, then Summary / Full data set with a preview table.
   D3.4/D3.5 — the expand control (tooltip "Expand view") grows the data dialog
   into a wide one so the whole table is readable; it collapses back the same way.

   Every export confirms with "Export started". */

import { useEffect, useState } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import Button from '../../../../../components/Button';
import Dialog, { DialogBody, DialogFooter, DialogHeader } from '../../../../../components/Dialog';
import NativeSelect, { NativeSelectOption } from '../../../../../components/NativeSelect';
import ScrollArea from '../../../../../components/ScrollArea';
import Table, { TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../../../../../components/Table';
import Tabs, { TabsContent, TabsList, TabsTrigger } from '../../../../../components/Tabs';
import { toast } from '../../../../../components/Toast';
import Tooltip, { TooltipContent, TooltipTrigger } from '../../../../../components/Tooltip';
import { seriesFor } from '../../../data';
import type { Dashboard } from '../../../types';

export type ExportKind = 'pdf' | 'ppt' | 'data';

const MONTHS = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];

const COPY: Record<ExportKind, { title: string; description: string; cta: string; file: string }> = {
  pdf: { title: 'Download PDF', description: 'Export this dashboard as a PDF file.', cta: 'Download PDF', file: 'PDF' },
  ppt: { title: 'Download PowerPoint', description: 'Export this dashboard as a PowerPoint file.', cta: 'Download PPT', file: 'PowerPoint' },
  data: { title: 'Download Data', description: 'Export data from this dashboard as a csv file.', cta: 'Download CSV', file: 'CSV' },
};

export function ExportDialog({ open, kind, dashboard, onClose }: { open: boolean; kind: ExportKind; dashboard: Dashboard; onClose: () => void }) {
  const [includes, setIncludes] = useState('view');
  const [scaling, setScaling] = useState('auto');
  const [pageSize, setPageSize] = useState('letter');
  const [orientation, setOrientation] = useState('portrait');
  const [dataset, setDataset] = useState('summary');
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (open) {
      setExpanded(false);
      setDataset('summary');
    }
  }, [open, kind]);

  const c = COPY[kind];
  const s = seriesFor(dashboard.id, 12);
  const total = s.reduce((a, b) => a + b, 0);
  const summary: [string, string][] = [
    ['Page views', (total * 97).toLocaleString('en-US')],
    ['Unique visitors', (total * 61).toLocaleString('en-US')],
    ['Bounce rate', `${(20 + (s[0] % 30)).toFixed(1)}%`],
    ['Avg. session', `${2 + (s[1] % 5)}m ${10 + (s[2] % 50)}s`],
    ['Peak month', MONTHS[s.indexOf(Math.max(...s))]],
    ['Rows in full set', (s.length * 214).toLocaleString('en-US')],
  ];
  const full = MONTHS.map((m, i) => ({ month: m, value: s[i], target: 60, delta: s[i] - 60 }));

  const run = () => {
    const scope = includes === 'view' ? 'this view' : 'the whole dashboard';
    toast.success('Export started', {
      description: `${dashboard.name} (${scope}) is being prepared as a ${c.file}${kind === 'data' ? `, ${dataset} data set` : ''}. It downloads when it is ready.`,
    });
    onClose();
  };

  const includesField = (
    <NativeSelect id={`ds-export-${dashboard.id}-${kind}-includes`} label="Includes" value={includes} onValueChange={setIncludes}>
      <NativeSelectOption value="view">This view only</NativeSelectOption>
      <NativeSelectOption value="all">Entire dashboard (all views)</NativeSelectOption>
    </NativeSelect>
  );

  return (
    <Dialog
      id={`ds-export-${dashboard.id}-${kind}`}
      open={open}
      onClose={onClose}
      className={`ds-dash-export${expanded ? ' ds-dash-export--expanded' : ''}`}
    >
      <DialogHeader id={`ds-export-${dashboard.id}-${kind}-header`} title={c.title} description={c.description} onClose={onClose} />
      <DialogBody>
        <div className="ds-dash-export__body">
          <div className="ds-dash-export__fields">{includesField}</div>

          {kind === 'pdf' && (
            <div className="ds-dash-export__fields">
              <NativeSelect id={`ds-export-${dashboard.id}-pdf-scaling`} label="Scaling" value={scaling} onValueChange={setScaling}>
                <NativeSelectOption value="auto">Automatic</NativeSelectOption>
                <NativeSelectOption value="fit">Fit to page width</NativeSelectOption>
                <NativeSelectOption value="100">100%</NativeSelectOption>
              </NativeSelect>
              <NativeSelect id={`ds-export-${dashboard.id}-pdf-size`} label="Page size" value={pageSize} onValueChange={setPageSize}>
                <NativeSelectOption value="letter">Letter</NativeSelectOption>
                <NativeSelectOption value="legal">Legal</NativeSelectOption>
                <NativeSelectOption value="a4">A4</NativeSelectOption>
                <NativeSelectOption value="a3">A3</NativeSelectOption>
              </NativeSelect>
              <NativeSelect id={`ds-export-${dashboard.id}-pdf-orientation`} label="Orientation" value={orientation} onValueChange={setOrientation}>
                <NativeSelectOption value="portrait">Portrait</NativeSelectOption>
                <NativeSelectOption value="landscape">Landscape</NativeSelectOption>
              </NativeSelect>
            </div>
          )}

          {kind === 'data' && (
            <Tabs id={`ds-export-${dashboard.id}-data-set`} value={dataset} onValueChange={setDataset}>
              <TabsList aria-label="Data set">
                <TabsTrigger value="summary">Summary data set</TabsTrigger>
                <TabsTrigger value="full">Full data set</TabsTrigger>
              </TabsList>
              <TabsContent value="summary">
                <p className="ds-muted ds-dash-export__hint">Download a summary of this data set.</p>
                <ScrollArea id={`ds-export-${dashboard.id}-summary-scroll`} className="ds-scroll-max ds-dash-export__table">
                  <Table id={`ds-export-${dashboard.id}-summary`} density="sm" label="Summary data set">
                    <TableHead>
                      <TableRow>
                        <TableHeaderCell>Metric</TableHeaderCell>
                        <TableHeaderCell>Value</TableHeaderCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {summary.map(([k, v]) => (
                        <TableRow key={k}>
                          <TableCell>{k}</TableCell>
                          <TableCell>{v}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </TabsContent>
              <TabsContent value="full">
                <p className="ds-muted ds-dash-export__hint">Download every row behind this view, one per month.</p>
                <ScrollArea id={`ds-export-${dashboard.id}-full-scroll`} className="ds-scroll-max ds-dash-export__table">
                  <Table id={`ds-export-${dashboard.id}-full`} density="sm" label="Full data set">
                    <TableHead>
                      <TableRow>
                        <TableHeaderCell>Month</TableHeaderCell>
                        <TableHeaderCell align="end">Value</TableHeaderCell>
                        <TableHeaderCell align="end">Target</TableHeaderCell>
                        <TableHeaderCell align="end">Delta</TableHeaderCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {full.map((r) => (
                        <TableRow key={r.month}>
                          <TableCell>{r.month}</TableCell>
                          <TableCell numeric>{r.value}</TableCell>
                          <TableCell numeric>{r.target}</TableCell>
                          <TableCell numeric>{r.delta > 0 ? `+${r.delta}` : r.delta}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          )}

          {kind === 'data' && (
            <div className="ds-dash-export__expand">
              <Tooltip id={`ds-export-${dashboard.id}-expand-tip`} side="left">
                <TooltipTrigger>
                  <Button
                    id={`ds-export-${dashboard.id}-expand`}
                    style="outline"
                    size="sm"
                    iconOnly
                    IconCenter={expanded ? Minimize2 : Maximize2}
                    aria-label={expanded ? 'Collapse view' : 'Expand view'}
                    aria-pressed={expanded}
                    onClick={() => setExpanded((e) => !e)}
                  />
                </TooltipTrigger>
                <TooltipContent>{expanded ? 'Collapse view' : 'Expand view'}</TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>
      </DialogBody>
      <DialogFooter>
        <Button id={`ds-export-${dashboard.id}-${kind}-cancel`} style="ghost" label="Cancel" onClick={onClose} />
        <Button id={`ds-export-${dashboard.id}-${kind}-go`} label={c.cta} onClick={run} />
      </DialogFooter>
    </Dialog>
  );
}
