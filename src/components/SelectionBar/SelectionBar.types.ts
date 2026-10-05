export type SelectionBarProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> & {
  /** Seeds `{id}-count` and `{id}-clear`. */
  id: string;
  /** The toolbar's accessible name — what is selected, e.g. "Selected requests". */
  label: string;
  /** How many items are selected. The bar is meant to render only while this is above 0. */
  count: number;
  /**
   * What the count reads as. Default `"{count} selected"`. Pass your own for a
   * noun — `` `${n} request${n === 1 ? '' : 's'} selected` ``. Announced politely
   * when it changes, so a screen reader hears the selection grow.
   */
  summary?: React.ReactNode;
  /** Renders a "Clear selection" link after the count. Omit to hide it. */
  onClear?: () => void;
  /** Default `"Clear selection"`. */
  clearLabel?: string;
  /** The bulk actions, trailing — usually `size="sm"` Buttons, the primary last. */
  actions?: React.ReactNode;
  className?: string;
};
