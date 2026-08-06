import type { ReactNode, HTMLAttributes } from 'react';
import type { Curve } from '#/utils/path';
import type { SeriesSlot } from '#/utils/series';
import type { StackOffset } from '#/utils/stack';
import type { ColorScaleKind } from '#/utils/colorScale';

export type ChartCurve = Curve;

export type ChartSeries = {
  /**
   * Stable identity. The colour slot is derived from this, NOT from the array
   * index, so hiding one series never repaints the others.
   */
  key: string;
  /** Shown in the legend, the tooltip and the table twin. */
  label: string;
  /** One value per category. `null` is a GAP, not a zero — it breaks the line. */
  data: (number | null)[];
  /** Pin a slot (1-8) instead of taking the next free one. */
  slot?: SeriesSlot;
};

export type ChartView = 'chart' | 'table' | 'both';
export type BarLayout = 'grouped' | 'stacked' | 'stacked100';

export type ChartProps = Omit<HTMLAttributes<HTMLElement>, 'title'> & {
  /** Required. Seeds `-title`, `-desc`, `-table`, `-legend` and `-readout`. */
  id: string;
  /** The accessible name and the visible heading. */
  title: string;
  /** One line on what the reader is looking at. Wired to `aria-describedby`. */
  description?: string;
  /** X-axis band labels. Milestone 1 has no time scale — these are strings. */
  categories: string[];
  /** Max 8 keep a colour slot; the tail folds into a muted "Other". */
  series: ChartSeries[];
  /**
   * OUTER height in px, including the x-axis band and legend. Getting this
   * backwards is how a chart card ends up with a nested scrollbar.
   */
  height?: number;
  /** The width used for SSR and static markup, before measurement upgrades it. */
  width?: number;
  /** Formats values in the axis, tooltip, labels and table. */
  valueFormatter?: (value: number) => string;
  /** `auto` derives from the data and always includes zero. */
  yDomain?: [number, number] | 'auto';
  /**
   * Whether the y domain is the SUM of the series rather than the max.
   *
   * A mark cannot decide this for itself — it changes the scale, which the frame
   * owns and computes before any mark renders. Presets forward it.
   */
  stacked?: boolean;
  /** `expand` normalises each category to a share (100% stacked). */
  offset?: StackOffset;
  /** Bars want a gap between categories; line and area want vertices on centre. */
  bandPadding?: boolean;
  /** Defaults to true once there are 2+ series. */
  showLegend?: boolean;
  showGrid?: boolean;
  /** The table twin is ALWAYS in the DOM; this controls what is visible. */
  view?: ChartView;
  emptyLabel?: string;
  /** Controlled legend filtering. Keys listed here render de-emphasised. */
  hiddenSeries?: string[];
  onSeriesToggle?: (key: string, visible: boolean) => void;
  /**
   * Series to foreground. Everything else becomes muted context.
   *
   * The answer to a chart with more series than the eye can hold at once. Six
   * slots are tellable apart in SEQUENCE (a stack, a legend) but not
   * SIMULTANEOUSLY — the all-pairs worst case in the ramp is dE 7.8 and no
   * ordering can move it. Emphasis converts "tell six greys apart" into "tell
   * one from the rest", which always works.
   *
   * Keyed, never indexed, for the same reason slots are: the subject must not
   * change because someone filtered a different series.
   *
   * Ignored when no listed key is currently visible — a subject that is hidden
   * would otherwise mute the entire chart and leave nothing foregrounded.
   */
  /**
   * Colour each DATUM by its value instead of each series by its slot.
   *
   * Categorical is the default and stays the default: colour means identity.
   * Set this only for ORDERED data, where colour means quantity — and then one
   * series is usually the right shape, because the scale, not the series list,
   * is doing the distinguishing.
   */
  colorScale?: ColorScaleKind;
  /** Steps the scale spans; reads `--chart-1 … --chart-{scaleSteps}`. */
  scaleSteps?: number;
  /** The value pinned to the middle step. Diverging only. */
  scaleCenter?: number;

  emphasis?: string | string[];
  /**
   * Pointing at a legend entry emphasises that series for as long as you point.
   *
   * On by default wherever a legend renders: it is the cheapest fix for a dense
   * chart and it costs nothing when unused. Transient — it overrides `emphasis`
   * while active and restores it on leave, so a chart can have both a standing
   * subject and an exploratory one.
   */
  emphasisOnHover?: boolean;
  /** Compound tree. Omit for the automatic layout. */
  children?: ReactNode;
};

/** Nothing emphasised · the subject · the context behind it. */
export type SeriesEmphasis = 'none' | 'on' | 'off';

export type BarChartProps = Omit<ChartProps, 'stacked' | 'offset' | 'bandPadding' | 'children'> & { layout?: BarLayout };
export type LineChartProps = Omit<ChartProps, 'stacked' | 'offset' | 'bandPadding' | 'children'> & {
  curve?: ChartCurve;
  /** `auto` shows markers only when the category count is small enough to bear them. */
  showMarkers?: boolean | 'auto';
};
export type AreaChartProps = Omit<ChartProps, 'offset' | 'bandPadding' | 'children'> & { curve?: ChartCurve };

export type ChartPartProps = HTMLAttributes<SVGGElement>;
