/* DartBoards · native dashboards — one widget.

   Every widget carries the same three abilities, and each exists only because
   DartBoards renders the chart itself rather than framing it:

   - Add to a space   — this chart alone, not the whole dashboard
   - Copy link        — to this chart, with the filters it is showing
   - Ask Aiden        — Aiden reads the chart's numbers, not a screenshot

   The same card renders on the dashboard and, as a single chart, in a space;
   `inSpace` swaps the menu for the space's own actions. */

import { ArrowUpRight, Ellipsis, LayoutDashboard, Link2, Plus, Sparkles, Trash2 } from 'lucide-react';
import Button from '../../../../../components/Button';
import Card, { CardBody, CardDescription, CardTitle } from '../../../../../components/Card';
import DropdownMenu, { DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../../../../../components/DropdownMenu';
import Table, { TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../../../../../components/Table';
import { toast } from '../../../../../components/Toast';
import { BarChart, LineChart } from '../../../../../charts';
import type { Dashboard, NativeFilters, NativeWidget } from '../../../types';
import { useUi } from '../../../ui';
import { explain, filterSummary, widgetData } from './nativeData';
import { copyWidgetLink } from './nativeShared';

type Props = {
  id: string;
  dashboard: Dashboard;
  widget: NativeWidget;
  filters: NativeFilters;
  /** Briefly ringed — arrived here from a link to this chart. */
  highlight?: boolean;
  onAddToSpace?: () => void;
  /** In a space: the way back to the whole dashboard, and removal. */
  inSpace?: { onOpenDashboard: () => void; onRemove: () => void };
};

export function WidgetCard({ id, dashboard, widget, filters, highlight, onAddToSpace, inSpace }: Props) {
  const { askAiden } = useUi();
  const data = widgetData(widget, filters);
  const ask = () => askAiden(`What does “${widget.title}” on ${dashboard.name} show?`, explain(widget, dashboard.name, filters));

  const controls = (
    <div className="ds-native-widget__controls">
      <Button
        id={`${id}-ask`}
        style="ghost"
        size="xs"
        label="Ask Aiden"
        IconLeft={Sparkles}
        aria-label={`Ask Aiden about ${widget.title}`}
        onClick={ask}
      />
      <DropdownMenu id={`${id}-menu`}>
        <DropdownMenuTrigger>
          <Button id={`${id}-menu-trigger`} style="ghost" size="xs" iconOnly IconCenter={Ellipsis} aria-label={`More actions for ${widget.title}`} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {inSpace ? (
            <DropdownMenuItem onClick={inSpace.onOpenDashboard}>
              <LayoutDashboard aria-hidden="true" />
              Open {dashboard.name}
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={onAddToSpace}>
              <Plus aria-hidden="true" />
              Add this chart to a space…
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => copyWidgetLink(dashboard, widget, filters)}>
            <Link2 aria-hidden="true" />
            Copy link to this chart
          </DropdownMenuItem>
          {inSpace && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={inSpace.onRemove}>
                <Trash2 aria-hidden="true" />
                Remove from space
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  // Charts carry their own title (it is their accessible name); the other kinds get the same header by hand.
  const heading = (
    <div className="ds-native-widget__heading">
      <CardTitle as="h3" scale="sm">
        {widget.title}
      </CardTitle>
      <CardDescription>{inSpace ? `${dashboard.name} · ${filterSummary(filters)}` : widget.description}</CardDescription>
    </div>
  );
  const chartDescription = inSpace ? `${dashboard.name} · ${filterSummary(filters)}` : widget.description;

  let body;
  if (data.kind === 'kpis') {
    body = (
      <>
        {heading}
        <dl className="ds-native-kpis">
          {data.kpis.map((k) => (
            <div key={k.label} className="ds-native-kpi">
              <dt className="ds-native-kpi__label">{k.label}</dt>
              <dd className="ds-native-kpi__value">{k.value}</dd>
              <dd className={`ds-native-kpi__delta ds-native-kpi__delta--${k.good ? 'good' : 'bad'}`}>{k.delta}</dd>
            </div>
          ))}
        </dl>
      </>
    );
  } else if (data.kind === 'table') {
    body = (
      <>
        {heading}
        <Table id={`${id}-table`} density="sm" label={widget.title}>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Queue</TableHeaderCell>
              <TableHeaderCell align="end">Waiting</TableHeaderCell>
              <TableHeaderCell>Oldest</TableHeaderCell>
              <TableHeaderCell>
                <span className="ui-table__sr-only">Actions</span>
              </TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.queue}</TableCell>
                <TableCell align="end">{r.waiting.toLocaleString('en-US')}</TableCell>
                <TableCell>{r.oldest}</TableCell>
                <TableCell align="end">
                  {/* A report that leads somewhere: the queue opens in the app that works it. */}
                  <Button
                    id={`${id}-${r.id}-irm`}
                    style="link"
                    size="sm"
                    label="Work in IRM"
                    IconRight={ArrowUpRight}
                    aria-label={`Work ${r.queue} in IRM`}
                    onClick={() => toast(`Opening ${r.queue} in IRM`, { description: 'IRM opens in a new tab, filtered to this queue.' })}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </>
    );
  } else {
    const Chart = data.kind === 'line' ? LineChart : BarChart;
    body = (
      <Chart
        id={`${id}-chart`}
        title={widget.title}
        description={chartDescription}
        categories={data.categories}
        series={data.series}
        valueFormatter={data.format}
        height={260}
      />
    );
  }

  return (
    <Card
      id={id}
      className={`ds-native-widget ds-native-widget--span-${widget.span ?? 1}${highlight ? ' ds-native-widget--highlight' : ''}`}
    >
      <CardBody>
        {controls}
        {body}
      </CardBody>
    </Card>
  );
}
