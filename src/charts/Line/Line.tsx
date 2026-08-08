import type { CSSProperties } from 'react';
import { forwardRef } from 'react';
import { byEmphasis, useChartContext } from '../Chart/Chart.context';
import Chart from '../Chart/Chart';

const cx = (...parts: (string | false | undefined)[]) => parts.filter(Boolean).join(' ');

import { linePath, type MaybePoint } from '#/utils/path';
import { END_LABEL_GAP, END_LABEL_MIN_GAP, MARKER_LIMIT, MARKER_RADIUS } from '../Chart/Chart.constants';
import type { LineChartProps, ChartCurve } from '../Chart/Chart.types';

const pointsOf = (data: (number | null)[], c: NonNullable<ReturnType<typeof useChartContext>>): MaybePoint[] =>
  c.categories.map((_, i) => {
    const v = data[i];
    return v === null || v === undefined ? null : { x: c.x.center(i), y: c.y(v) };
  });

/**
 * MARKER SHAPES ARE REDUNDANT ENCODING, not decoration.
 *
 * A line's identity is otherwise carried by colour alone, which is the one
 * channel that fails for a colour-blind reader and the one a crossing makes
 * ambiguous for everybody. Shape is the cheapest second channel: it survives
 * every vision type, greyscale printing and a photocopier.
 *
 * Cycled by SERIES INDEX rather than by slot, so the shapes stay distinct even
 * when a consumer assigns non-consecutive slots. Drawn as paths at the same
 * radius the circle used, so `.ui-chart__marker` styling is unchanged.
 */
const MARKER_SHAPES = ['circle', 'square', 'triangle', 'diamond'] as const;

const markerShape = (i: number, x: number, y: number, r: number) => {
  switch (MARKER_SHAPES[i % MARKER_SHAPES.length]) {
    case 'square':   return `M${x - r},${y - r}h${r * 2}v${r * 2}h${-r * 2}Z`;
    // Triangle sits on a slightly larger radius: an equilateral triangle covers
    // less area than a circle of the same r, so matching r would read smaller.
    case 'triangle': { const t = r * 1.2; return `M${x},${y - t}L${x + t},${y + t * 0.75}L${x - t},${y + t * 0.75}Z`; }
    case 'diamond':  { const d = r * 1.25; return `M${x},${y - d}L${x + d},${y}L${x},${y + d}L${x - d},${y}Z`; }
    default:         return `M${x - r},${y}a${r},${r} 0 1,0 ${r * 2},0a${r},${r} 0 1,0 ${-r * 2},0Z`;
  }
};

const ChartLine = ({ curve = 'linear', markers = 'auto' }: { curve?: ChartCurve; markers?: boolean | 'auto' }) => {
  const c = useChartContext();
  if (!c) return null;
  const visible = c.series.filter((s) => s.visible);
  const showMarkers = markers === 'auto' ? c.categories.length <= MARKER_LIMIT : markers;

  /*
    END LABELS HAVE TO BE PLACED TOGETHER, not one per series in isolation.

    Two lines finishing at similar values put their labels on top of each other,
    which is the obvious failure mode of the whole pattern — and it happens
    exactly when the series are hardest to tell apart, since converging lines
    are also the ones sharing screen space. Series that end far apart never
    notice this code runs.

    The fix is the standard one-pass declutter: sort by y, then walk downward
    pushing any label that would sit within END_LABEL_MIN_GAP of the one above it. It
    settles in a single pass because the list is sorted — each label only ever
    moves away from the one before it. Deliberately NOT a force simulation:
    a label a few pixels off its line still points at it unambiguously once the
    lines are this far apart, and the alternative is animation jitter.
  */
  const endLabelY = new Map<string, number>();
  if (c.endLabels) {
    const ends = visible
      .filter((s) => s.emphasis !== 'off')
      .map((s) => {
        const pts = pointsOf(s.data, c);
        const last = [...pts].reverse().find(Boolean);
        return last ? { key: s.key, y: last.y } : null;
      })
      .filter(Boolean) as { key: string; y: number }[];
    ends.sort((a, b) => a.y - b.y);
    ends.forEach((e, i) => {
      if (i > 0) e.y = Math.max(e.y, ends[i - 1].y + END_LABEL_MIN_GAP);
      endLabelY.set(e.key, e.y);
    });
  }

  return (
    <g className="ui-chart__marks ui-chart__marks--line" aria-hidden="true">
      {/* Lines cross, so paint order is legibility, not just taste: the subject
          has to run OVER its context or the muting is undone wherever they
          intersect. No-op while nothing is emphasised. */}
      {[...visible].sort(byEmphasis).map((s) => {
        const pts = pointsOf(s.data, c);
        const muted = s.emphasis === 'off';
        const shapeIndex = c.series.findIndex((o) => o.key === s.key);
        // The LAST point that exists, not the last slot — a series ending in a
        // gap would otherwise hang its label in empty space, or nowhere.
        const lastPt = c.endLabels ? [...pts].reverse().find(Boolean) : undefined;
        return (
          <g key={s.key}
            className={cx('ui-chart__series', muted && 'ui-chart__series--muted')}
            style={{ color: s.token } as CSSProperties}>
            {/* pathLength="1" rescales all dash arithmetic to a declared total,
                so the draw-on is `dashoffset: 1 → 0` with NO getTotalLength()
                call. That is what keeps it working in static preview HTML. */}
            <path className="ui-chart__line" d={linePath(pts, curve)} pathLength={1} />
            {/* Markers come off a muted line entirely rather than shrinking. At
                context weight they read as data points on a series nobody is
                being asked to read, and they are the thing most likely to be
                mistaken for the subject's. */}
            {showMarkers && !muted && pts.map((p, i) => p && (
              <path key={i} d={markerShape(shapeIndex, p.x, p.y, MARKER_RADIUS)}
                className={cx('ui-chart__marker', c.activeIndex === i && 'ui-chart__marker--active')} />
            ))}
            {/* The label is NOT aria-hidden's problem — the whole marks group
                already is, and the series name reaches assistive tech through
                the data table twin. This is purely the sighted shortcut. */}
            {lastPt && !muted && (
              <text className="ui-chart__end-label" x={lastPt.x + MARKER_RADIUS + END_LABEL_GAP}
                y={endLabelY.get(s.key) ?? lastPt.y}
                dominantBaseline="middle">{s.label}</text>
            )}
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
