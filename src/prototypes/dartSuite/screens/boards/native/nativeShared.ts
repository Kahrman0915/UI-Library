/* DartBoards · native dashboards — shared state helpers. */

import { toast } from '../../../../../components/Toast';
import { useSuite } from '../../../store';
import type { Dashboard, NativeFilters, NativeWidget } from '../../../types';
import { DEFAULT_NATIVE_FILTERS, filterSummary } from './nativeData';

/**
 * The filters a suite's native dashboards SHARE. Set on one dashboard, they hold
 * on every other in the suite and on every chart from it in a space — which is
 * the first thing an embedded dashboard cannot do.
 */
export function useSuiteFilters(suiteId: string) {
  const { state, update } = useSuite();
  const filters = state.suiteFilters[suiteId] ?? DEFAULT_NATIVE_FILTERS;
  const set = (patch: Partial<NativeFilters>) =>
    update((d) => {
      d.suiteFilters[suiteId] = { ...(d.suiteFilters[suiteId] ?? DEFAULT_NATIVE_FILTERS), ...patch };
    });
  return { filters, set };
}

/** A link to one chart, with the filters it was showing. The prototype has no real URL, so it names the parts. */
export const widgetLink = (d: Dashboard, w: NativeWidget, f: NativeFilters) =>
  `https://dartcentral.example.com/boards/dashboards/${d.id}?chart=${w.id}&period=${f.period}&product=${f.product}`;

export function copyWidgetLink(d: Dashboard, w: NativeWidget, f: NativeFilters) {
  try {
    void navigator.clipboard?.writeText(widgetLink(d, w, f));
  } catch {
    /* clipboard blocked — the toast still says what the link opens */
  }
  toast.success('Link copied', { description: `Opens “${w.title}” on ${d.name}, showing ${filterSummary(f)}.` });
}

/** Spaces that already hold this chart. */
export const spacesWithWidget = (spaces: { id: string; items: { dashboardId: string; widgetId?: string }[] }[], d: Dashboard, w: NativeWidget) =>
  spaces.filter((s) => s.items.some((i) => i.dashboardId === d.id && i.widgetId === w.id)).map((s) => s.id);
