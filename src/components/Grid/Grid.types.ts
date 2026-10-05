import type { StackLevel } from '../Stack/Stack.types';

export type GridLevel = StackLevel;

type GridBaseProps = Omit<React.HTMLAttributes<HTMLElement>, 'children'> & {
  /**
   * Which level of the spacing ladder the gap between items sits at — the same vocabulary
   * as `Stack`. A grid of cards is level 3. Both the row and the column gap use it, so a
   * grid keeps one rhythm in both directions.
   */
  level: GridLevel;
  /**
   * The widest an item may grow — a CSS length, normally a token
   * (`'var(--w-96)'`). Without it a lone item in a row stretches to nearly twice
   * `minItemWidth` before a second one fits beside it. Setting it turns on a small
   * measurement (a ResizeObserver on the grid's parent): when the reflowed column would be
   * wider than this, the columns are pinned at this width and packed to the start. Leave it
   * off and the grid is pure CSS.
   */
  maxItemWidth?: string;
  /**
   * When there are fewer items than columns, stretch them to fill the row
   * (`auto-fit`) instead of leaving empty columns at the end (`auto-fill`, the default).
   * Right for a row of KPI tiles that should always span the page; wrong for a browse grid,
   * where a short last row should keep the same card width as the rows above it.
   */
  stretch?: boolean;
  /** The element to render. Default `div`; use `ul` or `ol` when the items are a list (then render `li` children). */
  as?: 'div' | 'section' | 'ul' | 'ol';
  children?: React.ReactNode;
  className?: string;
};

export type GridProps = GridBaseProps &
  (
    | {
        /**
         * The narrowest an item may be — a CSS length, normally a token (`'var(--w-72)'`).
         * The grid fits as many columns as this allows and reflows as its container
         * changes width, with no breakpoints. Never wider than the container: below it the
         * grid is one full-width column.
         */
        minItemWidth: string;
        /**
         * The most columns the grid will ever show. With `minItemWidth`, a cap: the grid
         * still drops columns as it narrows, but never adds past this many. Without it,
         * a fixed column count.
         */
        columns?: number;
      }
    | {
        minItemWidth?: undefined;
        /** A fixed number of equal columns, when the grid should not reflow. */
        columns: number;
      }
  );
