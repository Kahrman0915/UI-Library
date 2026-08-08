import { forwardRef, useCallback, useMemo, useRef, useState } from 'react';
import type { CSSProperties, KeyboardEvent, PointerEvent } from 'react';
import { bandScale, linearScale } from '#/utils/scale';
import { formatTick, niceTicks, thinLabels } from '#/utils/ticks';
import { seriesExtent } from '#/utils/stack';
import { assignSlots } from '#/utils/series';
import { ChartContext, useChartContext, type ResolvedSeries } from './Chart.context';
import {
  DEFAULT_HEIGHT, DEFAULT_WIDTH, LEGEND_HEIGHT, MARGIN, MAX_X_LABELS, Y_TICK_COUNT,
} from './Chart.constants';
import { dataDomain } from '#/utils/colorScale';
import type { ChartProps, SeriesEmphasis } from './Chart.types';
import { useMeasuredWidth } from '#/hooks/useMeasuredWidth';
import './Chart.scss';

const cx = (...parts: (string | false | undefined)[]) => parts.filter(Boolean).join(' ');

// ─────────────────────────────────────────────────────────────────────────────
// Root
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The frame. Owns sizing, scales, the series registry and every piece of chrome;
 * knows nothing about what marks get drawn inside it.
 *
 * That ignorance is the point of this file. The root used to switch on a `mark`
 * discriminated union, which meant adding a chart type edited the frame — so
 * Bar, Line and Area could not own their own folders. Now a preset composes
 * `<Chart>` with mark children and the frame never learns their names.
 *
 * Two things the marks cannot decide for themselves, because they change the
 * SCALE rather than the drawing, stay as root props: `stacked` and `offset`.
 * A stacked bar's y domain is the sum, not the max.
 */
const Chart = forwardRef<HTMLElement, ChartProps>(
  (
    {
      id, title, description, categories, series,
      stacked = false, offset = 'zero', bandPadding = false,
      height = DEFAULT_HEIGHT, width = DEFAULT_WIDTH,
      valueFormatter = (v) => formatTick(v),
      yDomain = 'auto', showLegend, showGrid = true, view = 'chart', endLabels = false,
      emptyLabel = 'No data to display', hiddenSeries, onSeriesToggle,
      emphasis, emphasisOnHover = true,
      colorScale, scaleSteps = 7, scaleCenter = 0,
      className, children, ...rest
    },
    ref,
  ) => {
    const wrapRef = useRef<HTMLDivElement>(null);
    const measured = useMeasuredWidth(wrapRef);
    const w = measured ?? width;
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [hovered, setHovered] = useState<string | null>(null);
    const ids = useMemo(() => ({
      title: `${id}-title`, desc: `${id}-desc`, table: `${id}-table`,
      legend: `${id}-legend`, readout: `${id}-readout`,
    }), [id]);

    // Slots come from the FULL declared list. Filtering first is the bug that
    // repaints survivors when a legend entry is switched off.
    const resolved: ResolvedSeries[] = useMemo(() => {
      const assigned = assignSlots(series, (s) => s.key, (s) => s.slot);
      const isVisible = (key: string) => !hiddenSeries?.includes(key);

      // Hover wins over the standing subject while it lasts, so a chart can
      // carry an authored emphasis AND still be explored.
      const wanted = hovered !== null
        ? [hovered]
        : emphasis === undefined ? [] : Array.isArray(emphasis) ? emphasis : [emphasis];

      // A subject that is hidden, or simply misspelled, would mute every series
      // and foreground none — worse than no emphasis at all. Drop back to plain.
      const subject = new Set(wanted.filter((k) =>
        isVisible(k) && series.some((s) => s.key === k)));
      const active = subject.size > 0;

      return assigned.map((a) => {
        const state: SeriesEmphasis = !active ? 'none' : subject.has(a.item.key) ? 'on' : 'off';
        return {
          ...a.item,
          slot: a.slot,
          slotToken: a.token,
          // Emphasis is resolved HERE, once, rather than at each mark — the
          // legend swatch and the tooltip key read the same field the mark does,
          // so they cannot end up disagreeing about who is foregrounded.
          token: state === 'off' ? 'var(--chart-muted)' : a.token,
          visible: isVisible(a.item.key),
          emphasis: state,
        };
      });
    }, [series, hiddenSeries, emphasis, hovered]);

    const visible = resolved.filter((s) => s.visible);
    const isEmpty = categories.length === 0 || series.length === 0
      || visible.every((s) => s.data.every((v) => v === null || v === undefined));

    const domain = useMemo<[number, number]>(() => {
      if (yDomain !== 'auto') return yDomain;
      return seriesExtent(visible.map((s) => s.data), stacked ? 'stacked' : 'grouped', offset);
    }, [yDomain, visible, stacked, offset]);

    const ticks = useMemo(() => niceTicks(domain[0], domain[1], Y_TICK_COUNT), [domain]);

    // A 100% stack rescales the data to 0–1 to lay the bands out, so the axis is
    // reporting a SHARE while the tooltip and table still report real figures.
    // They need different formatters or the axis says "0.2" where it means 20%.
    const isPercentAxis = offset === 'expand';
    const axisFormatter = useMemo(
      () => (isPercentAxis ? (v: number) => `${Math.round(v * 100)}%` : valueFormatter),
      [isPercentAxis, valueFormatter],
    );

    // Widen the y gutter for the widest formatted tick, or long numbers clip.
    const leftMargin = Math.max(
      MARGIN.left,
      ticks.reduce((m, t) => Math.max(m, axisFormatter(t).length), 0) * 7 + 12,
    );

    // An ordered chart is usually ONE series, so the "two or more" default would
    // hide the scale — and the scale legend is the only thing that says what the
    // colours mean. A categorical chart with one series still needs no key.
    // End labels REPLACE the legend rather than joining it. Printing both says
    // the same thing twice and spends the vertical room the labels just earned.
    const legendOn = showLegend ?? (endLabels ? false : colorScale ? true : resolved.length >= 2);
    // The labels live OUTSIDE the plot, so the plot has to give the room back —
    // sized from the longest label, exactly as the y gutter is sized from its
    // widest tick. Without this the last line runs to the frame edge and its
    // own label is clipped by the viewBox.
    const rightMargin = endLabels
      ? Math.max(MARGIN.right, resolved.reduce((m, s) => Math.max(m, s.label.length), 0) * 6.5 + 14)
      : MARGIN.right;
    const plot = {
      left: leftMargin,
      top: MARGIN.top,
      width: Math.max(0, w - leftMargin - rightMargin),
      height: Math.max(0, height - MARGIN.top - MARGIN.bottom - (legendOn ? LEGEND_HEIGHT : 0)),
    };

    const x = useMemo(
      // Bars need a padded band (a gap between categories); line and area want
      // vertices on the band centre with no inner padding at all.
      () => bandScale(categories.length, [0, plot.width], {
        paddingInner: bandPadding ? 0.28 : 0,
        paddingOuter: bandPadding ? 0.14 : 0.5,
      }),
      [categories.length, plot.width, bandPadding],
    );
    const y = useMemo(
      () => linearScale(domain, [plot.height, 0], { clamp: true }),
      [domain, plot.height],
    );

    const hoverSeries = emphasisOnHover ? setHovered : null;
    const emphasisTransient = hovered !== null;

    // Resolved once here rather than in each mark, so a chart with two mark
    // types cannot end up with two different domains for the same scale.
    const scale = useMemo(
      () => (colorScale
        ? { kind: colorScale, domain: dataDomain(series), steps: scaleSteps, center: scaleCenter }
        : null),
      [colorScale, series, scaleSteps, scaleCenter],
    );

    const ctx = useMemo(() => ({
      x, y, plot, series: resolved, categories, valueFormatter, axisFormatter,
      ticks, activeIndex, setActiveIndex, hoverSeries, emphasisTransient, colorScale: scale, ids,
      endLabels,
    }), [x, y, plot.left, plot.top, plot.width, plot.height, resolved, categories,
        valueFormatter, axisFormatter, ticks, activeIndex, hoverSeries,
        emphasisTransient, scale, ids, endLabels]);

    const onPointerMove = useCallback((e: PointerEvent<SVGRectElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      // Same normalise-then-map idiom as Slider.tsx's pointer handling.
      const i = x.invert(((e.clientX - rect.left) / (rect.width || 1)) * plot.width);
      setActiveIndex(i < 0 ? null : i);
    }, [x, plot.width]);

    const onKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
      const last = categories.length - 1;
      const cur = activeIndex ?? -1;
      let next: number | null = null;
      if (e.key === 'ArrowRight') next = Math.min(last, cur + 1);
      else if (e.key === 'ArrowLeft') next = cur <= 0 ? 0 : cur - 1;
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = last;
      else if (e.key === 'Escape') { setActiveIndex(null); return; }
      else return;
      e.preventDefault();
      setActiveIndex(next);
    }, [activeIndex, categories.length]);

    const active = activeIndex !== null && activeIndex < categories.length ? activeIndex : null;

    return (
      <ChartContext.Provider value={ctx}>
        <figure
          {...rest}
          ref={ref as React.Ref<HTMLElement>}
          id={id}
          className={cx('ui-chart', `ui-chart--view-${view}`, className)}
          role="group"
          aria-labelledby={ids.title}
          aria-describedby={description ? ids.desc : undefined}
        >
          <figcaption className="ui-chart__header">
            <span className="ui-chart__title" id={ids.title}>{title}</span>
            {description && (
              <span className="ui-chart__description" id={ids.desc}>{description}</span>
            )}
          </figcaption>

          <div className="ui-chart__frame" ref={wrapRef} style={{ height }}>
            {isEmpty ? (
              <ChartEmpty label={emptyLabel} />
            ) : (
              <>
                {/* The plot is ONE tab stop, on the wrapper rather than the
                    <svg> — Safari + VoiceOver handle a focusable <svg> poorly.
                    Focus renders exactly what hover renders. */}
                <div
                  className="ui-chart__plot"
                  tabIndex={0}
                  role="application"
                  aria-labelledby={ids.title}
                  aria-describedby={ids.readout}
                  onKeyDown={onKeyDown}
                  onBlur={() => setActiveIndex(null)}
                >
                  <svg
                    className="ui-chart__svg"
                    width={w}
                    height={height - (legendOn ? LEGEND_HEIGHT : 0)}
                    viewBox={`0 0 ${w} ${height - (legendOn ? LEGEND_HEIGHT : 0)}`}
                    role="img"
                    aria-labelledby={ids.title}
                    focusable="false"
                  >
                    <g transform={`translate(${plot.left},${plot.top})`}>
                      {showGrid && <ChartGrid />}
                      <ChartYAxis />
                      <ChartXAxis />
                      {children}
                      {active !== null && (
                        <line
                          className="ui-chart__crosshair"
                          x1={x.center(active)} x2={x.center(active)}
                          y1={0} y2={plot.height}
                        />
                      )}
                      {/* Hit layer LAST so it sits above every mark. Transparent
                          and full height: the pointer only has to be closest,
                          never dead-centre on a 2px line. */}
                      <rect
                        className="ui-chart__hit"
                        x={0} y={0} width={plot.width} height={plot.height}
                        onPointerMove={onPointerMove}
                        onPointerLeave={() => setActiveIndex(null)}
                      />
                    </g>
                  </svg>

                  {active !== null && <ChartTooltip index={active} />}
                </div>

                {/* Tooltips enhance but never gate: the same content a sighted
                    user gets on hover is announced here on keyboard focus. */}
                <span className="ui-chart__sr-only" id={ids.readout} aria-live="polite">
                  {active === null ? '' : `${categories[active]}: ${visible
                    .map((s) => `${s.label} ${s.data[active] === null ? 'no data' : valueFormatter(s.data[active] as number)}`)
                    .join(', ')}`}
                </span>
              </>
            )}
          </div>

          {legendOn && !isEmpty && <ChartLegend onToggle={onSeriesToggle} />}

          {/* ALWAYS in the DOM — the table twin is structural, not a prop a
              consumer can forget. `view` only decides whether it is visible. */}
          <ChartTable id={ids.table} caption={title} />
        </figure>
      </ChartContext.Provider>
    );
  },
);
Chart.displayName = 'Chart';

// ─────────────────────────────────────────────────────────────────────────────
// Chrome
// ─────────────────────────────────────────────────────────────────────────────

const ChartGrid = () => {
  const c = useChartContext();
  if (!c) return null;
  const { ticks } = c;
  return (
    <g className="ui-chart__grid" aria-hidden="true">
      {ticks.map((t) => (
        <line key={t} x1={0} x2={c.plot.width} y1={c.y(t)} y2={c.y(t)}
          className={cx('ui-chart__gridline', t === 0 && 'ui-chart__gridline--zero')} />
      ))}
    </g>
  );
};
ChartGrid.displayName = 'ChartGrid';

const ChartYAxis = () => {
  const c = useChartContext();
  if (!c) return null;
  const { ticks } = c;
  return (
    <g className="ui-chart__axis ui-chart__axis--y" aria-hidden="true">
      {ticks.map((t) => (
        <text key={t} x={-8} y={c.y(t)} dy="0.32em" className="ui-chart__tick">
          {c.axisFormatter(t)}
        </text>
      ))}
    </g>
  );
};
ChartYAxis.displayName = 'ChartYAxis';

const ChartXAxis = () => {
  const c = useChartContext();
  if (!c) return null;
  const labels = thinLabels(c.categories, MAX_X_LABELS);
  return (
    <g className="ui-chart__axis ui-chart__axis--x" aria-hidden="true">
      <line x1={0} x2={c.plot.width} y1={c.plot.height} y2={c.plot.height}
        className="ui-chart__axis-line" />
      {labels.map((label, i) => label === null ? null : (
        <text key={i} x={c.x.center(i)} y={c.plot.height + 18}
          className="ui-chart__tick" textAnchor="middle">{label}</text>
      ))}
    </g>
  );
};
ChartXAxis.displayName = 'ChartXAxis';

const ChartEmpty = ({ label }: { label: string }) => (
  <p className="ui-chart__empty">{label}</p>
);
ChartEmpty.displayName = 'ChartEmpty';

// ─────────────────────────────────────────────────────────────────────────────
// Marks
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// Legend · tooltip · table
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A SCALE legend, for ordered charts. Series swatches would be a lie here —
 * there is one series and seven colours, so a per-series key describes nothing
 * a reader needs. What they need is the ramp and the two ends of the domain.
 */
const ChartScaleLegend = () => {
  const c = useChartContext();
  if (!c || !c.colorScale) return null;
  const { domain, steps, kind, center } = c.colorScale;
  const fmt = c.valueFormatter;
  return (
    <div className="ui-chart__scale-legend" id={c.ids.legend}>
      <span className="ui-chart__scale-end">{fmt(domain[0])}</span>
      <span className="ui-chart__scale-ramp" aria-hidden="true">
        {Array.from({ length: steps }, (_, i) => (
          <span key={i} className="ui-chart__scale-step" style={{ background: `var(--chart-${i + 1})` } as CSSProperties} />
        ))}
      </span>
      <span className="ui-chart__scale-end">{fmt(domain[1])}</span>
      {/* The midpoint is the whole claim of a diverging scale, so it is stated
          rather than left to be inferred from the colours. */}
      {kind === 'diverging' && (
        <span className="ui-chart__scale-note">{`centred on ${fmt(center)}`}</span>
      )}
    </div>
  );
};
ChartScaleLegend.displayName = 'ChartScaleLegend';

const ChartLegend = ({ onToggle }: { onToggle?: (key: string, visible: boolean) => void }) => {
  const c = useChartContext();
  if (!c) return null;
  if (c.colorScale) return <ChartScaleLegend />;
  const hover = c.hoverSeries;
  return (
    <ul className="ui-chart__legend" id={c.ids.legend}>
      {c.series.map((s) => {
        const content = (
          <>
            <span className="ui-chart__swatch" style={{ background: s.token } as CSSProperties} aria-hidden="true" />
            <span className="ui-chart__legend-label">{s.label}</span>
            {/* Which series the author foregrounded is authored INTENT, not
                decoration — a reader who never sees the colours still needs it.
                A STANDING emphasis only: the same state is reached by pointing
                and by focusing a legend button, and moving this string on every
                focus step would chatter down the accessibility tree as a
                keyboard user arrows along the legend. */}
            {s.emphasis === 'on' && !c.emphasisTransient && (
              <span className="ui-chart__sr-only">(highlighted)</span>
            )}
          </>
        );
        return (
          <li
            key={s.key}
            className="ui-chart__legend-item"
            // Pointer emphasis hangs off the <li> so it works whether or not the
            // legend is interactive. Keyboard emphasis can only hang off the
            // button, since giving a static <li> a tabindex would add a second
            // tab stop to a widget that deliberately has exactly one.
            onMouseEnter={hover ? () => hover(s.key) : undefined}
            onMouseLeave={hover ? () => hover(null) : undefined}
          >
            {onToggle ? (
              <button type="button" className="ui-chart__legend-button"
                aria-pressed={s.visible}
                onFocus={hover ? () => hover(s.key) : undefined}
                onBlur={hover ? () => hover(null) : undefined}
                onClick={() => onToggle(s.key, !s.visible)}>
                {content}
              </button>
            ) : content}
          </li>
        );
      })}
    </ul>
  );
};
ChartLegend.displayName = 'ChartLegend';

const ChartTooltip = ({ index }: { index: number }) => {
  const c = useChartContext();
  if (!c) return null;
  const visible = c.series.filter((s) => s.visible);
  // Positioned in the chart's OWN coordinate space rather than through
  // computePosition + a portal. A chart tooltip is not a floating surface that
  // can come unanchored — it lives inside the plot and moves with it, so the
  // portal machinery would add a virtual anchor and a reposition listener to
  // solve a problem this arrangement does not have.
  const left = c.plot.left + c.x.center(index);
  const flip = left > c.plot.left + c.plot.width * 0.6;

  return (
    <div className={cx('ui-chart__tooltip', flip && 'ui-chart__tooltip--flip')}
      style={{ left, top: c.plot.top }} role="presentation">
      <span className="ui-chart__tooltip-category">{c.categories[index]}</span>
      {/* One tooltip lists EVERY series at this x — the pointer never has to
          land on a specific line to read its value. */}
      {visible.map((s) => (
        <span key={s.key} className="ui-chart__tooltip-row">
          <span className="ui-chart__tooltip-key" style={{ background: s.token } as CSSProperties} aria-hidden="true" />
          {/* Value leads, label follows: the reader already has the series. */}
          <span className="ui-chart__tooltip-value">
            {s.data[index] === null || s.data[index] === undefined ? '—' : c.valueFormatter(s.data[index] as number)}
          </span>
          <span className="ui-chart__tooltip-label">{s.label}</span>
        </span>
      ))}
    </div>
  );
};
ChartTooltip.displayName = 'ChartTooltip';

const ChartTable = ({ id, caption }: { id: string; caption: string }) => {
  const c = useChartContext();
  if (!c) return null;
  return (
    <div className="ui-chart__table-wrap">
      <table className="ui-chart__table" id={id}>
        <caption className="ui-chart__sr-only">{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Series</th>
            {c.categories.map((cat) => <th key={cat} scope="col">{cat}</th>)}
          </tr>
        </thead>
        <tbody>
          {c.series.map((s) => (
            <tr key={s.key}>
              <th scope="row">{s.label}</th>
              {c.categories.map((_, i) => (
                <td key={i}>
                  {s.data[i] === null || s.data[i] === undefined ? '—' : c.valueFormatter(s.data[i] as number)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
ChartTable.displayName = 'ChartTable';

export {
  Chart,
  ChartGrid, ChartXAxis, ChartYAxis,
  ChartLegend, ChartTooltip, ChartTable, ChartEmpty,
};
export default Chart;
