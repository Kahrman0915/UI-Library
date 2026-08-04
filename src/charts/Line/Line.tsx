import type { CSSProperties } from 'react';
import { forwardRef } from 'react';
import { useChartContext } from '../Chart/Chart.context';
import Chart from '../Chart/Chart';

const cx = (...parts: (string | false | undefined)[]) => parts.filter(Boolean).join(' ');

import { linePath, type MaybePoint } from '#/utils/path';
import { MARKER_LIMIT, MARKER_RADIUS } from '../Chart/Chart.constants';
import type { LineChartProps, ChartCurve } from '../Chart/Chart.types';

const pointsOf = (data: (number | null)[], c: NonNullable<ReturnType<typeof useChartContext>>): MaybePoint[] =>
  c.categories.map((_, i) => {
    const v = data[i];
    return v === null || v === undefined ? null : { x: c.x.center(i), y: c.y(v) };
  });

const ChartLine = ({ curve = 'linear', markers = 'auto' }: { curve?: ChartCurve; markers?: boolean | 'auto' }) => {
  const c = useChartContext();
  if (!c) return null;
  const visible = c.series.filter((s) => s.visible);
  const showMarkers = markers === 'auto' ? c.categories.length <= MARKER_LIMIT : markers;

  return (
    <g className="ui-chart__marks ui-chart__marks--line" aria-hidden="true">
      {visible.map((s) => {
        const pts = pointsOf(s.data, c);
        return (
          <g key={s.key} className="ui-chart__series" style={{ color: s.token } as CSSProperties}>
            {/* pathLength="1" rescales all dash arithmetic to a declared total,
                so the draw-on is `dashoffset: 1 → 0` with NO getTotalLength()
                call. That is what keeps it working in static preview HTML. */}
            <path className="ui-chart__line" d={linePath(pts, curve)} pathLength={1} />
            {showMarkers && pts.map((p, i) => p && (
              <circle key={i} cx={p.x} cy={p.y} r={MARKER_RADIUS}
                className={cx('ui-chart__marker', c.activeIndex === i && 'ui-chart__marker--active')} />
            ))}
          </g>
        );
      })}
    </g>
  );
};
ChartLine.displayName = 'ChartLine';

const LineChart = forwardRef<HTMLElement, LineChartProps>(
  ({ curve = 'linear', showMarkers = 'auto', ...rest }, ref) => (
    <Chart {...rest} ref={ref}>
      <ChartLine curve={curve} markers={showMarkers} />
    </Chart>
  ),
);
LineChart.displayName = 'LineChart';

export { LineChart, ChartLine, pointsOf };
export default LineChart;
