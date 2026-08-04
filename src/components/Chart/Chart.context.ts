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
  valueFormatter: (value: number) => string;
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
