/** Which half of the split a tab was dropped on. Logical, so it follows `dir`. */
export type SplitViewSide = 'start' | 'end';

/** A tab dropped on the view: its `value`, and the half it should open in. */
export type SplitViewDrop = {
  value: string;
  side: SplitViewSide;
};

export type SplitViewProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Seeds the drop-zone label ids (`${id}-drop-start`, `${id}-drop-end`). */
  id: string;
  /**
   * Accepts tabs dragged from a `TabBar` and fires with the half they were dropped
   * on. With one pane, dropping opens the split; with two, it replaces that half.
   * The view opens nothing itself. Omit it and the view accepts no drops.
   */
  onTabDrop?: (drop: SplitViewDrop) => void;
  /** Text on the start drop zone. Defaults to `Open here`. */
  startDropLabel?: string;
  /** Text on the end drop zone. Defaults to `Open here`. */
  endDropLabel?: string;
  /** One `SplitViewPane`, or two for a split. */
  children?: React.ReactNode;
  className?: string;
};

export type SplitViewPaneProps = React.HTMLAttributes<HTMLDivElement> & {
  /**
   * Marks the pane whose tab is selected in the bar. Only drawn while the view is
   * split — with one pane there is nothing to tell apart.
   */
  active?: boolean;
  children?: React.ReactNode;
  className?: string;
};
