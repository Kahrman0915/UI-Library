import { createContext, useContext } from 'react';
import type { BandScale, LinearScale } from '#/utils/scale';
import type { ChartSeries, SeriesEmphasis } from './Chart.types';
import type { SeriesSlot } from '#/utils/series';

// `slot` is OMITTED then redeclared: on ChartSeries it is the optional pin a
// consumer may pass, here it is the resolved assignment, which is null for a
// series past the eighth. Intersecting the two would make null unassignable.
export type ResolvedSeries = Omit<ChartSeries, 'slot'> & {
  /** null = folded into "Other". */
  slot: SeriesSlot | null;
  /**
   * The colour to PAINT WITH — already resolved for emphasis, so it is
   * `--chart-muted` on a muted series rather than that series' own slot.
   *
   * Every consumer (marks, legend swatch, tooltip key) reads this one field, so
   * the chart and its chrome cannot disagree about which series is foregrounded.
   * The identity colour survives as `slotToken` for anything that needs the
   * series' own colour regardless of state.
   */
  token: string;
  /** This series' own slot colour, unaffected by emphasis. */
  slotToken: string;
  visible: boolean;
  emphasis: SeriesEmphasis;
};

/**
 * Muted series first, so the subject paints over its context rather than under
 * it. A no-op when nothing is emphasised.
 *
 * ONLY safe where marks overlap arbitrarily — lines, and unstacked areas. A
 * stack's order is semantic (each segment sits on the running total beneath it)
 * and reordering it would change what the chart claims, so stacked marks and
 * grouped bars keep declaration order and rely on not overlapping at all.
 */
export const byEmphasis = <T extends { emphasis: SeriesEmphasis }>(a: T, b: T): number =>
  (a.emphasis === 'off' ? 0 : 1) - (b.emphasis === 'off' ? 0 : 1);

export type ChartContextValue = {
  x: BandScale;
  y: LinearScale;
  plot: { left: number; top: number; width: number; height: number };
  /** ALL declared series, each carrying its own `visible` flag. */
  series: ResolvedSeries[];
  categories: string[];
  /** Resolved y ticks — chrome parts read them here rather than by prop. */
  ticks: number[];
  /** Formats a DATA value — tooltip, table, direct labels. */
  valueFormatter: (value: number) => string;
  /**
   * Formats an AXIS value, which is not always the same number.
   *
   * `stacked100` normalises the data to 0–1 to draw the bands, so the axis is
   * describing a share while the tooltip and table are still reporting the real
   * figures. Printing `0.2` there is not a cosmetic slip — the axis is making a
   * false claim about what the reader is looking at.
   */
  axisFormatter: (value: number) => string;
  activeIndex: number | null;
  setActiveIndex: (index: number | null) => void;
  /** Legend hover → transient emphasis. null when `emphasisOnHover` is off. */
  hoverSeries: ((key: string | null) => void) | null;
  /**
   * True while the emphasis came from pointing or focusing rather than the prop.
   *
   * The distinction is not cosmetic: legend buttons emphasise on FOCUS too, so
   * without it, arrowing along the legend would move a rendered "(highlighted)"
   * string from entry to entry and chatter the whole way down the accessibility
   * tree. A standing emphasis is authored intent and worth announcing once; an
   * exploratory one is the reader's own pointer and announces nothing.
   */
  emphasisTransient: boolean;
  ids: { title: string; desc: string; table: string; legend: string; readout: string };
};

export const ChartContext = createContext<ChartContextValue | null>(null);

/**
 * Non-throwing on purpose. Chart parts are rendered inside `<Chart>` in every
 * real use, but a story or a docs page may render one standalone to show its
 * anatomy; the transcript parts in `Chat/` made the same call for the same
 * reason. Returns null and the part renders nothing.
 */
export const useChartContext = (): ChartContextValue | null => useContext(ChartContext);
