/* DartBoards · a NATIVE dashboard — the body the viewer renders in place of an
   embed when a dashboard carries a `native` spec (types.ts).

   Two things to see here that an embed cannot do:
   - THE SUITE'S FILTERS. The bar at the top is not this dashboard's — it is the
     suite's. Change the period here and every native dashboard in Collections &
     Recoveries, and every chart from one pinned in a space, shows the same
     period. The bar names the other dashboards it moves, so that is not a
     surprise.
   - WIDGETS, not a frame. Each chart can be added to a space on its own, linked
     to directly, and handed to Aiden with its numbers. */

import { useEffect, useState } from 'react';
import Button from '../../../../../components/Button';
import ToggleGroup, { ToggleGroupItem } from '../../../../../components/ToggleGroup';
import Toolbar, { ToolbarGroup } from '../../../../../components/Toolbar';
import { useNav } from '../../../nav';
import { useSuite } from '../../../store';
import type { Dashboard, NativeWidget } from '../../../types';
import { AddChartDialog } from './AddChartDialog';
import { PERIODS, PRODUCTS } from './nativeData';
import { useSuiteFilters } from './nativeShared';
import { WidgetCard } from './WidgetCard';
import './Native.scss';

export function NativeDashboard({ d, focusWidget }: { d: Dashboard; focusWidget?: string }) {
  const spec = d.native!;
  const { state } = useSuite();
  const { go } = useNav();
  const { filters, set } = useSuiteFilters(spec.suiteId);
  const [adding, setAdding] = useState<NativeWidget | null>(null);
  const [highlight, setHighlight] = useState(focusWidget);
  const suite = state.suites.find((s) => s.id === spec.suiteId);
  const siblings = state.dashboards.filter((x) => x.native?.suiteId === spec.suiteId && x.id !== d.id);
  const base = `ds-native-${d.id}`;

  // Arrived from a link to one chart: bring it into view and ring it briefly.
  useEffect(() => {
    if (!focusWidget) return;
    document.getElementById(`${base}-${focusWidget}`)?.scrollIntoView({ block: 'center' });
    const t = window.setTimeout(() => setHighlight(undefined), 2400);
    return () => window.clearTimeout(t);
  }, [focusWidget, base]);

  return (
    <div className="ds-native">
      <div className="ds-native-filters">
        <Toolbar id={`${base}-filters`} label={`${suite?.name ?? 'Suite'} filters`} justify="start">
          {spec.accepts.includes('period') && (
            <ToolbarGroup>
              <ToggleGroup
                id={`${base}-period`}
                type="single"
                size="sm"
                variant="outline"
                value={filters.period}
                onValueChange={(v) => v && set({ period: v as typeof filters.period })}
                aria-label="Period"
              >
                {PERIODS.map((p) => (
                  <ToggleGroupItem key={p.value} value={p.value} label={p.label} />
                ))}
              </ToggleGroup>
            </ToolbarGroup>
          )}
          {spec.accepts.includes('product') && (
            <ToolbarGroup>
              {/* Re-click clears back to all products, so there is no "All" button. */}
              <ToggleGroup
                id={`${base}-product`}
                type="single"
                size="sm"
                variant="outline"
                value={filters.product === 'all' ? '' : filters.product}
                onValueChange={(v) => set({ product: (v || 'all') as typeof filters.product })}
                aria-label="Product"
              >
                {PRODUCTS.map((p) => (
                  <ToggleGroupItem key={p.value} value={p.value} label={p.label} />
                ))}
              </ToggleGroup>
            </ToolbarGroup>
          )}
        </Toolbar>
        <p className="ds-native-filters__note">
          Suite filters · they also set{' '}
          {siblings.map((s, i) => (
            <span key={s.id}>
              {i > 0 && ', '}
              <Button id={`${base}-sibling-${s.id}`} style="link" size="xs" className="ds-native-inline-link" label={s.name} onClick={() => go({ page: 'dashboard', id: s.id })} />
            </span>
          ))}
          {siblings.length ? ' and ' : ''}any of these charts pinned in your spaces.
        </p>
      </div>

      <div className="ds-native-grid">
        {spec.widgets.map((w) => (
          <WidgetCard
            key={w.id}
            id={`${base}-${w.id}`}
            dashboard={d}
            widget={w}
            filters={filters}
            highlight={highlight === w.id}
            onAddToSpace={() => setAdding(w)}
          />
        ))}
      </div>

      <AddChartDialog open={adding !== null} dashboard={d} widget={adding} onClose={() => setAdding(null)} />
    </div>
  );
}
