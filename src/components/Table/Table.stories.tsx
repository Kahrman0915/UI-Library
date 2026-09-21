import { useMemo, useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import type { Meta, StoryObj } from '@storybook/react';
import Table, {
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  TableSelectionCell,
} from './Table';
import type { TableDensity, TableSortDirection } from './Table.types';
import Badge from '../Badge';
import Button from '../Button';
import Avatar from '../Avatar';
import Skeleton from '../Skeleton';
import Empty, { EmptyDescription, EmptyMedia, EmptyTitle } from '../Empty';
import FeaturedIcon from '../FeaturedIcon';
import { LayoutDashboard } from 'lucide-react';
import Code from '../Code';
import type { UiDocsParameters } from '../../types/DocsTypes';

const meta: Meta<typeof Table> = {
  title: 'Components/Table',
  component: Table,
  parameters: {
    layout: 'padded',
    ui: {
      description:
        'A data table — semantic `<table>` chrome with a density axis, sortable ' +
        'headers, row selection and a hover-revealed action cell.\n\n' +
        '**The row carries the surface fill, never the cell.** An opaque cell ' +
        'paints over hover and selection and they silently stop working — which ' +
        'is also how CSS already behaves, since a `<td>` has no background of ' +
        'its own.\n\n' +
        '**Scope is the table, not the page furniture.** A toolbar, a footer ' +
        'with `Pagination`, an `Empty` body and `Skeleton` rows are compositions ' +
        'you assemble — see the examples below. They are not props, because the ' +
        'arrangement is the page’s decision and a prop would have to pick one.',
      tags: ['compound', 'data display', '7 parts'],
      usage: {
        when: [
          'Rows of records the user scans, compares, sorts or selects.',
          'Anything where a column of numbers has to line up — `numeric` gives tabular figures.',
        ],
        avoid: [
          'A list of things with one main line and a supporting line — that is `Item`, which reads better at narrow widths and needs no column convention.',
          'Layout. A table is for data with a real row/column relationship, not for arranging a page.',
        ],
        notes:
          'Density is `sm` · `default` · `lg`, and it lives on `Table` alone — one ' +
          'root class cascades padding and height to every cell, the way `Card` and ' +
          '`RadioGroup` do it. No part takes a density prop.',
      },
      a11y: {
        keyboard: [
          { keys: ['Tab'], description: 'Moves through the controls in the table — sort buttons, checkboxes, row actions. The rows themselves are not focusable, because a `<tr>` in a plain `<table>` is not a control.' },
          { keys: ['Enter', 'Space'], description: 'Activates the focused sort button, checkbox or row action.' },
        ],
        notes:
          '**Selection is conveyed by the checkbox, not by `aria-selected` on the ' +
          'row.** `aria-selected` is only valid on a `row` inside `role="grid"` or ' +
          '`treegrid`; on a `<tr>` in a plain `<table>` it is invalid ARIA that ' +
          'screen readers ignore. The selected tint is decoration on top of a real ' +
          'control with a real state — so selection is never signalled by colour ' +
          'alone.\n\n' +
          '`aria-sort` sits on the `<th>`, not on the button inside it, and the ' +
          'direction glyph is `aria-hidden` so it is not announced twice. The ' +
          'select-all uses the checkbox’s indeterminate state for a partial ' +
          'selection.\n\n' +
          'The row-actions cell is revealed with `opacity`, **never `display: ' +
          'none`** — the control stays in the tab order and `:focus-within` brings ' +
          'it into view for keyboard users. Same rule `TabBar`’s close button follows.',
      },
      changelog: [
        {
          date: '2026-09-20',
          summary: 'Initial build — Table ships in code.',
          detail:
            'Built from the approved design spec (`docs/superpowers/specs/2026-08-26-figma-table-design.md`), which had been Figma-only since August: the file documented a component no developer could import. The Admin Flow screens are ~36% `Table` instances, so this was the blocker for that whole flow.\n\n' +
            '**Colours are the spec’s, and two of them are load-bearing.** The header is `--secondary`, **not `--muted`** — header labels are `--muted-foreground`, and that pairing is 5.1:1, below AA; on `--secondary` it measures 6.15:1 light / 11.87:1 dark. In dark, `--secondary` and `--card` both resolve to `#1e293b`, so the header is the same colour as the body and its hairline alone separates them. That is accepted, and it cannot move to `--muted` for the reason above.\n\n' +
            '**`selected + hover` resolved to `--primary-soft`** (owner, 2026-09-20) — the open question the spec recorded as needing a decision before any code. It is the visible tint at 8% light / 10% dark, one clear step up from `--primary-light`’s 6%. This makes Table the second consumer of `--primary-soft` after the filled `secondary` button.\n\n' +
            'No zebra striping: a stripe fill would fight the selected tint. The wrapper owns the border and the horizontal scroll because a `<table>` cannot carry overflow itself.',
        },
      ],
    } satisfies UiDocsParameters,
  },
};

export default meta;

type Row = {
  id: string;
  name: string;
  owner: string;
  status: 'Live' | 'Draft' | 'Archived';
  views: number;
  slug: string;
};

const ROWS: Row[] = [
  { id: 'r1', name: 'Revenue by Region', owner: 'Dana Ruiz', status: 'Live', views: 4321, slug: 'revenue-region' },
  { id: 'r2', name: 'Collections Performance', owner: 'Sam Okoye', status: 'Live', views: 1290, slug: 'collections-perf' },
  { id: 'r3', name: 'Pipeline Health', owner: 'Ana Petrova', status: 'Draft', views: 86, slug: 'pipeline-health' },
  { id: 'r4', name: 'Servicing SLA', owner: 'Leo Marsh', status: 'Archived', views: 512, slug: 'servicing-sla' },
];

/** Avatar.fallback takes 1–2 characters, not a whole name. */
const initials = (name: string) =>
  name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

const STATUS: Record<Row['status'], 'success' | 'warning' | 'default'> = {
  Live: 'success',
  Draft: 'warning',
  Archived: 'default',
};

/** The whole thing working: sortable header, selection with indeterminate, row actions. */
export const Default: StoryObj = {
  render: function DefaultStory() {
    const [sort, setSort] = useState<{ key: 'name' | 'views'; dir: Exclude<TableSortDirection, null> }>({
      key: 'name',
      dir: 'asc',
    });
    const [picked, setPicked] = useState<string[]>(['r2']);

    const rows = useMemo(() => {
      const copy = [...ROWS];
      copy.sort((a, b) => {
        const av = sort.key === 'name' ? a.name : a.views;
        const bv = sort.key === 'name' ? b.name : b.views;
        const cmp = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv));
        return sort.dir === 'asc' ? cmp : -cmp;
      });
      return copy;
    }, [sort]);

    const all = picked.length === ROWS.length;
    const some = picked.length > 0 && !all;

    return (
      <Table id="tbl" label="Dashboards">
        <TableHead>
          <TableRow>
            <TableSelectionCell
              id="tbl-all"
              checked={all}
              indeterminate={some}
              onCheckedChange={(c) => setPicked(c ? ROWS.map((r) => r.id) : [])}
            />
            <TableHeaderCell
              sortDirection={sort.key === 'name' ? sort.dir : null}
              onSort={(dir) => setSort({ key: 'name', dir })}
            >
              Dashboard
            </TableHeaderCell>
            <TableHeaderCell>Owner</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell
              align="end"
              sortDirection={sort.key === 'views' ? sort.dir : null}
              onSort={(dir) => setSort({ key: 'views', dir })}
            >
              Views
            </TableHeaderCell>
            <TableHeaderCell align="end">
              <span className="ui-table__sr-only">Actions</span>
            </TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((r) => {
            const on = picked.includes(r.id);
            return (
              <TableRow key={r.id} selected={on}>
                <TableSelectionCell
                  id={`tbl-${r.id}`}
                  checked={on}
                  label={`Select ${r.name}`}
                  onCheckedChange={(c) =>
                    setPicked((p) => (c ? [...p, r.id] : p.filter((x) => x !== r.id)))
                  }
                />
                <TableCell>{r.name}</TableCell>
                <TableCell>
                  <Avatar id={`av-${r.id}`} size="xs" fallback={initials(r.owner)} /> {r.owner}
                </TableCell>
                <TableCell>
                  <Badge id={`st-${r.id}`} color={STATUS[r.status]} label={r.status} />
                </TableCell>
                <TableCell numeric>{r.views.toLocaleString()}</TableCell>
                <TableCell actions>
                  <Button
                    id={`act-${r.id}`}
                    style="ghost"
                    size="sm"
                    iconOnly
                    IconCenter={MoreHorizontal}
                    aria-label={`Actions for ${r.name}`}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    );
  },
};

/** The three rungs. Row height and cell padding move together. */
export const Density: StoryObj = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--p-8)' }}>
      {(['sm', 'default', 'lg'] as TableDensity[]).map((d) => (
        <div key={d} style={{ display: 'grid', gap: 'var(--p-2)' }}>
          <p style={{ margin: 0, font: 'var(--text-xs)/var(--leading-4) var(--font-family)', color: 'var(--muted-foreground)' }}>
            density {d}
          </p>
          <Table id={`den-${d}`} density={d} label={`Dashboards, ${d}`}>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Dashboard</TableHeaderCell>
                <TableHeaderCell>Owner</TableHeaderCell>
                <TableHeaderCell align="end">Views</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ROWS.slice(0, 2).map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.name}</TableCell>
                  <TableCell>{r.owner}</TableCell>
                  <TableCell numeric>{r.views.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ))}
    </div>
  ),
};

/**
 * Every row state. `selected + hover` is `--primary-soft` — hover the second row
 * to see it step up from `--primary-light`.
 */
export const RowStates: StoryObj = {
  render: () => (
    <Table id="states" label="Row states">
      <TableHead>
        <TableRow>
          <TableHeaderCell>State</TableHeaderCell>
          <TableHeaderCell>What it paints</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell>default</TableCell>
          <TableCell><Code>--card</Code> (from the wrapper)</TableCell>
        </TableRow>
        <TableRow selected>
          <TableCell>selected · hover me</TableCell>
          <TableCell><Code>--primary-light</Code> → <Code>--primary-soft</Code></TableCell>
        </TableRow>
        <TableRow disabled>
          <TableCell>disabled</TableCell>
          <TableCell>50% opacity, pointer events off</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};

/** Loading and empty are compositions, not props — `Skeleton` rows and `Empty` in the body. */
export const LoadingAndEmpty: StoryObj = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--p-8)' }}>
      <Table id="loading" label="Dashboards, loading">
        <TableHead>
          <TableRow>
            <TableHeaderCell>Dashboard</TableHeaderCell>
            <TableHeaderCell>Owner</TableHeaderCell>
            <TableHeaderCell align="end">Views</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {[0, 1, 2].map((i) => (
            <TableRow key={i}>
              <TableCell><Skeleton shape="text" style={{ width: '60%' }} /></TableCell>
              <TableCell><Skeleton shape="text" style={{ width: '40%' }} /></TableCell>
              <TableCell align="end"><Skeleton shape="text" style={{ width: 48, marginInlineStart: 'auto' }} /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Table id="empty" label="Dashboards, empty">
        <TableHead>
          <TableRow>
            <TableHeaderCell>Dashboard</TableHeaderCell>
            <TableHeaderCell>Owner</TableHeaderCell>
            <TableHeaderCell align="end">Views</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            {/* colSpan is the point: the empty state spans the table, it does not
                sit in the first column. */}
            <TableCell colSpan={3}>
              <Empty id="empty-state">
                <EmptyMedia>
                  <FeaturedIcon Icon={LayoutDashboard} />
                </EmptyMedia>
                <EmptyTitle>No dashboards yet</EmptyTitle>
                <EmptyDescription>Anything added to this space will show up here.</EmptyDescription>
              </Empty>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  ),
};
