/**
 * Row height and cell padding, moving together.
 *
 * The owner's original phrasing was compact / default / comfortable; that would
 * be a second size vocabulary, and the 2026-07-30 hard break deleted the last of
 * those. These are the library's own rungs.
 *
 * | | Row height | Cell padding (block / inline) |
 * |---|---|---|
 * | `sm` | 36 (`--h-9`) | `--p-2` / `--p-3` |
 * | `default` | 44 (`--h-11`) | `--p-3` / `--p-4` |
 * | `lg` | 56 (`--h-14`) | `--p-4` / `--p-4` |
 */
export type TableDensity = 'sm' | 'default' | 'lg';

/** Which way a sortable column is currently ordered. `null` is unsorted. */
export type TableSortDirection = 'asc' | 'desc' | null;

/** Logical alignment, so the table mirrors under `dir="rtl"` for free. */
export type TableAlign = 'start' | 'end';

/**
 * A data table — semantic `<table>` chrome with density, sortable headers, row
 * selection and a hover-revealed action cell.
 *
 * **Density lives here and nowhere else.** One root class cascades padding and
 * height to every cell through descendant selectors, the way `Card` and
 * `RadioGroup` do it, so no part takes a `density` prop and nothing has to be
 * threaded through context.
 *
 * **Scope:** this is the table, not the page furniture around it. A toolbar,
 * a footer with `Pagination`, an `Empty` body and `Skeleton` rows are all
 * compositions you assemble — the same call the Figma page makes, and the
 * reason those are Examples there rather than props here.
 */
export type TableProps = Omit<
  React.TableHTMLAttributes<HTMLTableElement>,
  'summary'
> & {
  /** Seeds child ids — `${id}-caption` among them. */
  id: string;
  /** Default `default`. See {@link TableDensity}. */
  density?: TableDensity;
  /**
   * The table's accessible name. Rendered as a visually-hidden `<caption>`
   * rather than an `aria-label`, because a caption is the element the spec
   * gives a table for this and it survives with CSS disabled.
   */
  label?: React.ReactNode;
  /** Shows the caption instead of hiding it. */
  showCaption?: boolean;
  className?: string;
};

/** `<thead>`. Tells the selection cell inside it to render a `<th>`. */
export type TableHeadProps = React.HTMLAttributes<HTMLTableSectionElement> & {
  className?: string;
};

/** `<tbody>`. */
export type TableBodyProps = React.HTMLAttributes<HTMLTableSectionElement> & {
  className?: string;
};

/**
 * One row.
 *
 * **`selected` does not set `aria-selected`, and that is deliberate.**
 * `aria-selected` is only valid on a `row` inside `role="grid"` or `treegrid`;
 * on a `<tr>` in a plain `<table>` it is invalid ARIA that screen readers
 * ignore. Selection is conveyed by the checkbox in the row, which is a real
 * control with a real state — the tint is decoration on top of it.
 */
export type TableRowProps = React.HTMLAttributes<HTMLTableRowElement> & {
  /** Paints the selected tint. Pair with a checked `TableSelectionCell`. */
  selected?: boolean;
  /** Dims the row and blocks pointer input on it. */
  disabled?: boolean;
  className?: string;
};

/**
 * A `<th scope="col">`.
 *
 * Passing `onSort` makes it sortable: the label becomes a `<button>` inside the
 * `th` — the cell itself never becomes the control, because a focusable `<th>`
 * is not a thing — and the `th` carries `aria-sort`.
 */
export type TableHeaderCellProps = Omit<
  React.ThHTMLAttributes<HTMLTableCellElement>,
  'align' | 'onClick'
> & {
  /** Default `start`. See {@link TableAlign}. */
  align?: TableAlign;
  /**
   * Current direction for THIS column. `null` means sortable but unsorted;
   * omit `onSort` entirely for a column that cannot be sorted.
   */
  sortDirection?: TableSortDirection;
  /** Makes the header sortable. Called with the direction to move to. */
  onSort?: (next: Exclude<TableSortDirection, null>) => void;
  className?: string;
};

/** A `<td>`. */
export type TableCellProps = Omit<
  React.TdHTMLAttributes<HTMLTableCellElement>,
  'align'
> & {
  /** Default `start`, or `end` when `numeric`. See {@link TableAlign}. */
  align?: TableAlign;
  /**
   * Tabular figures and end alignment — so a column of numbers lines up and
   * does not jitter as the digits change.
   */
  numeric?: boolean;
  /**
   * The trailing row-actions cell. Its content is revealed on row hover or
   * focus-within via `opacity`, **never `display: none`** — the control has to
   * stay in the tab order, the same rule `TabBar`'s close button follows.
   */
  actions?: boolean;
  className?: string;
};

/**
 * The leading checkbox cell. Renders a `<th scope="col">` inside `TableHead`
 * and a `<td>` inside `TableBody`, so the select-all sits in the header row
 * without the caller restating where it is.
 */
export type TableSelectionCellProps = {
  /** Seeds the checkbox id. */
  id: string;
  checked?: boolean;
  /** Partial selection — the select-all's third state. */
  indeterminate?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  /** The checkbox's accessible name. It has no visible label by design. */
  label?: string;
  className?: string;
};
