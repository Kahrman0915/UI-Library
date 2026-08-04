import type { CSSProperties } from 'react';
import { forwardRef } from 'react';
import { useChartContext } from '../Chart/Chart.context';
import Chart from '../Chart/Chart';

const cx = (...parts: (string | false | undefined)[]) => parts.filter(Boolean).join(' ');

import { stackSeries } from '#/utils/stack';
import { barPath } from '#/utils/path';
import { BAR_RADIUS } from '../Chart/Chart.constants';
import type { BarChartProps, BarLayout } from '../Chart/Chart.types';

const ChartBars = ({ layout = 'grouped' }: { layout?: BarLayout }) => {
  const c = useChartContext();
  if (!c) return null;
  const visible = c.series.filter((s) => s.visible);
  if (!visible.length) return null;

  const isStacked = layout !== 'grouped';
  const stacks = isStacked
    ? stackSeries(visible.map((s) => s.data), { offset: layout === 'stacked100' ? 'expand' : 'zero' })
    : null;
  const groupWidth = c.x.bandwidth / (isStacked ? 1 : visible.length);
  const zero = c.y(0);

  return (
    <g className="ui-chart__marks ui-chart__marks--bars" aria-hidden="true">
      {visible.map((s, si) => (
        <g key={s.key} className="ui-chart__series" style={{ color: s.token } as CSSProperties}>
          {c.categories.map((_, ci) => {
            const raw = s.data[ci];
            if (raw === null || raw === undefined) return null;
            const bx = c.x(ci) + (isStacked ? 0 : si * groupWidth);
            let top: number, base: number;
            if (stacks) {
              const p = stacks[si][ci];
              top = c.y(p.y1); base = c.y(p.y0);
            } else {
              top = c.y(raw); base = zero;
            }

            // THE SURFACE GAP — a gap, never a drawn border.
            //
            // This is not decoration, it is what makes the chart conform. WCAG
            // 1.4.11 wants 3:1 between ADJACENT graphical objects, and no
            // categorical palette can deliver that between eight consecutive
            // slots: the requirement compounds, and a lightness band (which the
            // series ramp needs, so no mark dominates) forces neighbouring hues
            // to similar luminance. Measured on the shipped ramp, adjacent pairs
            // sit at 1.12–2.24:1. Separating the marks with the surface colour
            // converts "3:1 against your neighbour" into "3:1 against the
            // background", which the palette DOES satisfy — and it is what both
            // the W3C guidance and Chartability #6 prescribe.
            //
            // Clamped, not constant. The smallest real segment measured 9.2px;
            // a flat 2px eats a quarter of it, and a segment thinner than the
            // gap would invert into a negative height. Below ~3px the gap is
            // dropped entirely — a visible thin band beats a correctly-gapped
            // invisible one.
            const span = Math.abs(base - top);
            const gap = span < 3 ? 0 : Math.min(2, span * 0.25);
            const h = span - (isStacked ? gap : 0);
            const sign = top <= base ? 1 : -1;

            return (
              <path
                key={ci}
                className={cx('ui-chart__bar', c.activeIndex === ci && 'ui-chart__bar--active')}
                d={barPath(
                  bx + 1,
                  // Shrink from the value end so every segment stays anchored to
                  // the one below it and the stack keeps its cumulative meaning.
                  base,
                  Math.max(0, groupWidth - 2),
                  h <= 0 ? 0 : h * sign,
                  BAR_RADIUS,
                )}
                style={{ '--i': ci } as CSSProperties}
              />
            );
          })}
        </g>
      ))}
    </g>
  );
};
ChartBars.displayName = 'ChartBars';

/**
 * Grouped, stacked, or 100% stacked bars in the standard frame.
 *
 * `layout` decides two separate things and they are handled in different places:
 * the DRAWING (side by side vs. piled up) belongs to ChartBars, but the SCALE
 * (max vs. sum vs. share) belongs to the frame — hence `stacked` and `offset`
 * being forwarded to Chart rather than resolved here.
 */
const BarChart = forwardRef<HTMLElement, BarChartProps>(
  ({ layout = 'grouped', ...rest }, ref) => (
    <Chart
      {...rest}
      ref={ref}
      bandPadding
      stacked={layout !== 'grouped'}
      offset={layout === 'stacked100' ? 'expand' : 'zero'}
    >
      <ChartBars layout={layout} />
    </Chart>
  ),
);
BarChart.displayName = 'BarChart';

export { BarChart, ChartBars };
export default BarChart;
