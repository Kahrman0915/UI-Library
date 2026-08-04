import type { CSSProperties } from 'react';
import { forwardRef } from 'react';
import { byEmphasis, useChartContext } from '../Chart/Chart.context';
import Chart from '../Chart/Chart';

const cx = (...parts: (string | false | undefined)[]) => parts.filter(Boolean).join(' ');

import { areaPath, linePath, type MaybePoint } from '#/utils/path';
import { stackSeries } from '#/utils/stack';
import { pointsOf } from '../Line/Line';
import type { AreaChartProps, ChartCurve } from '../Chart/Chart.types';

const ChartArea = ({ curve = 'linear', stacked = false }: { curve?: ChartCurve; stacked?: boolean }) => {
  const c = useChartContext();
  if (!c) return null;
  const visible = c.series.filter((s) => s.visible);
  const stacks = stacked ? stackSeries(visible.map((s) => s.data)) : null;

  // Unstacked areas overlap and are reordered so the subject paints on top; a
  // STACK may not be — its order is the running total it is drawn from. The
  // original index is carried either way, because it is the key into `stacks`
  // and sorting the pairs must not decouple a band from its own baseline.
  const order = visible.map((s, si) => ({ s, si }));
  if (!stacks) order.sort((a, b) => byEmphasis(a.s, b.s));

  return (
    <g className="ui-chart__marks ui-chart__marks--area" aria-hidden="true">
      {order.map(({ s, si }) => {
        const top: MaybePoint[] = stacks
          ? c.categories.map((_, i) => stacks[si][i].value === null ? null : { x: c.x.center(i), y: c.y(stacks[si][i].y1) })
          : pointsOf(s.data, c);
        const base = stacks
          ? c.categories.map((_, i) => ({ x: c.x.center(i), y: c.y(stacks[si][i].y0) }))
          : c.y(0);
        return (
          <g key={s.key}
            className={cx('ui-chart__series', s.emphasis === 'off' && 'ui-chart__series--muted')}
            style={{ color: s.token } as CSSProperties}>
            <path className="ui-chart__area" d={areaPath(top, base, curve)} />
            <path className="ui-chart__line" d={linePath(top, curve)} pathLength={1} />
          </g>
        );
      })}
    </g>
  );
};
ChartArea.displayName = 'ChartArea';

const AreaChart = forwardRef<HTMLElement, AreaChartProps>(
  ({ curve = 'linear', stacked = false, ...rest }, ref) => (
    <Chart {...rest} ref={ref} stacked={stacked}>
      <ChartArea curve={curve} stacked={stacked} />
    </Chart>
  ),
);
AreaChart.displayName = 'AreaChart';

export { AreaChart, ChartArea };
export default AreaChart;
