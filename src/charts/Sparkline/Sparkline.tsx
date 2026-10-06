/**
 * A trend with no chrome — no axes, no title row, no legend — small enough for
 * a stat tile or a table cell. Read for its SHAPE: is it going up, is it
 * steady, did something happen at the end. When the reader needs to read
 * values off it, it wants a real chart.
 *
 * It fills its container's width without measuring: the SVG draws in a 0–100
 * box stretched with `preserveAspectRatio="none"`, and the stroke stays a true
 * 1.5px through `vector-effect: non-scaling-stroke`. A circle would stretch
 * into an ellipse in that box, so the end dot is an HTML span placed by
 * percentage instead.
 *
 * Like every chart it keeps a data table twin in the DOM for assistive tech,
 * and names itself with the first and last value so the trend is heard, not
 * just seen.
 */
import { forwardRef } from 'react';
import type { SparklineProps } from './Sparkline.types';
import './Sparkline.scss';

const W = 100;

const Sparkline = forwardRef<HTMLDivElement, SparklineProps>(
  (
    { id, label, data, categories, variant = 'line', tone = 'default', height = 32, showEnd = true, valueFormatter = (v) => String(v), className, ...rest },
    ref,
  ) => {
    const values = data.filter((v): v is number => v !== null);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = max - min || 1;
    // A 2px inset top and bottom so the stroke and the end dot are never clipped.
    const pad = 2;
    const y = (v: number) => pad + (1 - (v - min) / span) * (height - pad * 2);
    const x = (i: number) => (data.length === 1 ? W / 2 : (i / (data.length - 1)) * W);

    // One path per unbroken run: a null breaks the line rather than bridging it.
    const runs: { i: number; v: number }[][] = [];
    data.forEach((v, i) => {
      if (v === null) return void runs.push([]);
      if (!runs.length) runs.push([]);
      runs[runs.length - 1].push({ i, v });
    });
    const lines = runs.filter((r) => r.length).map((r) => r.map((p, k) => `${k ? 'L' : 'M'}${x(p.i)},${y(p.v)}`).join(''));
    const areas =
      variant === 'area'
        ? runs.filter((r) => r.length > 1).map((r) => `M${x(r[0].i)},${height}` + r.map((p) => `L${x(p.i)},${y(p.v)}`).join('') + `L${x(r[r.length - 1].i)},${height}Z`)
        : [];

    let lastIndex = data.length - 1;
    while (lastIndex >= 0 && data[lastIndex] === null) lastIndex--;
    const last = lastIndex >= 0 ? (data[lastIndex] as number) : null;
    const first = values[0];
    const name = values.length ? `${label}: ${valueFormatter(first)} to ${valueFormatter(last as number)}` : `${label}: no data`;
    const cats = categories ?? data.map((_, i) => String(i + 1));

    return (
      <div
        {...rest}
        ref={ref}
        id={id}
        className={`ui-sparkline ui-sparkline--${tone}${className ? ' ' + className : ''}`}
        style={{ ...rest.style, height }}
        role="img"
        aria-label={name}
      >
        {values.length > 0 && (
          <svg className="ui-sparkline__svg" viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="none" aria-hidden="true" focusable="false">
            {areas.map((d, i) => (
              <path key={`a${i}`} className="ui-sparkline__area" d={d} />
            ))}
            {lines.map((d, i) => (
              <path key={`l${i}`} className="ui-sparkline__line" d={d} />
            ))}
          </svg>
        )}
        {showEnd && last !== null && (
          <span className="ui-sparkline__end" style={{ left: `${x(lastIndex)}%`, top: `${(y(last) / height) * 100}%` }} aria-hidden="true" />
        )}
        {/* Hidden in a div, not on the table: a table ignores a 1px box and would still push its container to scroll. */}
        <div className="ui-sparkline__sr">
        <table className="ui-sparkline__table" id={`${id}-table`}>
          <caption>{label}</caption>
          <tbody>
            {data.map((v, i) => (
              <tr key={i}>
                <th scope="row">{cats[i]}</th>
                <td>{v === null ? 'No data' : valueFormatter(v)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    );
  },
);

Sparkline.displayName = 'Sparkline';

export { Sparkline };
