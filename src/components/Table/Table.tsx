import { createContext, forwardRef, useContext } from 'react';
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';
import Checkbox from '../Checkbox';
import type {
  TableBodyProps,
  TableCellProps,
  TableHeadProps,
  TableHeaderCellProps,
  TableProps,
  TableRowProps,
  TableSelectionCellProps,
} from './Table.types';
import './Table.scss';

/**
 * Head-vs-body is the ONLY thing that needs context here. Density deliberately
 * does not: it cascades from one root class through descendant selectors, the
 * way Card and RadioGroup do it, so no part takes a density prop.
 */
const TableSectionContext = createContext<{ isHeader: boolean }>({
  isHeader: false,
});

const Table = forwardRef<HTMLTableElement, TableProps>(
  (
    { id, density = 'default', label, showCaption, className, children, ...rest },
    ref,
  ) => (
    // The wrapper owns the surface, the border and the horizontal scroll. A
    // <table> cannot carry overflow itself, and a table wider than its column
    // must scroll rather than push the page sideways.
    <div className="ui-table-wrap">
      <table
        {...rest}
        ref={ref}
        id={id}
        className={`ui-table ui-table--sz-${density}${className ? ' ' + className : ''}`}
      >
        {label && (
          <caption
            id={`${id}-caption`}
            className={`ui-table__caption${showCaption ? '' : ' ui-table__caption--hidden'}`}
          >
            {label}
          </caption>
        )}
        {children}
      </table>
    </div>
  ),
);
Table.displayName = 'Table';

const TableHead = forwardRef<HTMLTableSectionElement, TableHeadProps>(
  ({ className, children, ...rest }, ref) => (
    <TableSectionContext.Provider value={{ isHeader: true }}>
      <thead
        {...rest}
        ref={ref}
        className={`ui-table__head${className ? ' ' + className : ''}`}
      >
        {children}
      </thead>
    </TableSectionContext.Provider>
  ),
);
TableHead.displayName = 'TableHead';

const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className, children, ...rest }, ref) => (
    <tbody
      {...rest}
      ref={ref}
      className={`ui-table__body${className ? ' ' + className : ''}`}
    >
      {children}
    </tbody>
  ),
);
TableBody.displayName = 'TableBody';

const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ selected, disabled, className, children, ...rest }, ref) => (
    <tr
      {...rest}
      ref={ref}
      // NOT aria-selected — see TableRowProps. data-selected is the styling
      // hook; the checkbox carries the semantics.
      data-selected={selected || undefined}
      data-disabled={disabled || undefined}
      className={`ui-table__row${selected ? ' ui-table__row--selected' : ''}${
        disabled ? ' ui-table__row--disabled' : ''
      }${className ? ' ' + className : ''}`}
    >
      {children}
    </tr>
  ),
);
TableRow.displayName = 'TableRow';

/** What a click on the sort button moves to. Unsorted and desc both go to asc. */
const nextDirection = (current: TableHeaderCellProps['sortDirection']) =>
  current === 'asc' ? ('desc' as const) : ('asc' as const);

const TableHeaderCell = forwardRef<HTMLTableCellElement, TableHeaderCellProps>(
  (
    { align = 'start', sortDirection = null, onSort, className, children, ...rest },
    ref,
  ) => {
    const sortable = typeof onSort === 'function';
    return (
      <th
        {...rest}
        ref={ref}
        scope="col"
        // aria-sort belongs on the cell, not on the button inside it.
        aria-sort={
          !sortable
            ? undefined
            : sortDirection === 'asc'
              ? 'ascending'
              : sortDirection === 'desc'
                ? 'descending'
                : 'none'
        }
        data-align={align}
        className={`ui-table__th ui-table__th--${align}${
          sortable ? ' ui-table__th--sortable' : ''
        }${className ? ' ' + className : ''}`}
      >
        {sortable ? (
          <button
            type="button"
            className="ui-table__sort"
            onClick={() => onSort!(nextDirection(sortDirection))}
          >
            <span className="ui-table__sort-label">{children}</span>
            {/* The glyph states the direction; aria-sort on the th states it to
                AT, so the icon is decorative and must not be announced twice. */}
            {sortDirection === 'asc' ? (
              <ArrowUp className="ui-table__sort-icon" aria-hidden="true" />
            ) : sortDirection === 'desc' ? (
              <ArrowDown className="ui-table__sort-icon" aria-hidden="true" />
            ) : (
              <ChevronsUpDown
                className="ui-table__sort-icon ui-table__sort-icon--idle"
                aria-hidden="true"
              />
            )}
          </button>
        ) : (
          children
        )}
      </th>
    );
  },
);
TableHeaderCell.displayName = 'TableHeaderCell';

const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ align, numeric, actions, className, children, ...rest }, ref) => {
    const resolved = align ?? (numeric ? 'end' : 'start');
    return (
      <td
        {...rest}
        ref={ref}
        data-align={resolved}
        className={`ui-table__cell ui-table__cell--${resolved}${
          numeric ? ' ui-table__cell--numeric' : ''
        }${actions ? ' ui-table__cell--actions' : ''}${className ? ' ' + className : ''}`}
      >
        {children}
      </td>
    );
  },
);
TableCell.displayName = 'TableCell';

const TableSelectionCell = forwardRef<HTMLTableCellElement, TableSelectionCellProps>(
  ({ id, checked, indeterminate, onCheckedChange, disabled, label, className }, ref) => {
    const { isHeader } = useContext(TableSectionContext);
    const Cell = isHeader ? 'th' : 'td';
    return (
      <Cell
        ref={ref as never}
        scope={isHeader ? 'col' : undefined}
        className={`ui-table__cell ui-table__cell--select${className ? ' ' + className : ''}`}
      >
        <Checkbox
          id={id}
          checked={checked}
          indeterminate={indeterminate}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
          // No visible label: the column is a checkbox column, and a label
          // beside each box would repeat down every row. The accessible name
          // still has to exist, so it goes on the input.
          aria-label={label ?? (isHeader ? 'Select all rows' : 'Select row')}
        />
      </Cell>
    );
  },
);
TableSelectionCell.displayName = 'TableSelectionCell';

export default Table;
export {
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  TableSelectionCell,
};
