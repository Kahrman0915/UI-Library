import { createContext, useContext } from 'react';
import type { BandScale, LinearScale } from '#/utils/scale';
import type { ChartSeries } from './Chart.types';
import type { SeriesSlot } from '#/utils/series';

// `slot` is OMITTED then redeclared: on ChartSeries it is the optional pin a
// consumer may pass, here it is the resolved assignment, which is null for a
// series past the eighth. Intersecting the two would make null unassignable.
export type ResolvedSeries = Omit<ChartSeries, 'slot'> & {
  /** null = folded into "Other". */
  slot: SeriesSlot | null;
  token: string;
  visible: boolean;
};

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
