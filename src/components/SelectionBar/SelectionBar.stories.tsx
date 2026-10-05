import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import SelectionBar from './SelectionBar';
import Button from '../Button';
import Table, { TableBody, TableCell, TableHead, TableHeaderCell, TableRow, TableSelectionCell } from '../Table';
import type { UiDocsParameters } from '../../types/DocsTypes';

const meta: Meta<typeof SelectionBar> = {
  title: 'Components/SelectionBar',
  component: SelectionBar,
  parameters: {
    layout: 'padded',
    ui: {
      description:
        'The bar a page shows while items are selected: how many, a way to clear the selection, and the ' +
        'actions that apply to all of them. It composes `Toolbar` (so it is a `role="toolbar"` on the ' +
        'toolbar\'s spacing rungs) and adds the surface Toolbar deliberately has none of — a `--primary-light` ' +
        'tint that marks the page as being in a selection mode, and themes with it.',
      tags: ['selection', 'bulk actions', 'toolbar', 'table'],
      usage: {
        when: [
          'Bulk actions over a selectable `Table` or list — approve, deny, move, delete the selected rows.',
          'In place of the filter row while `count > 0`; put the filters back when the selection clears.',
        ],
        avoid: [
          'Actions on one item — those belong on its row or its menu.',
          'A permanent action row — that is a plain `Toolbar`. This bar exists only while something is selected.',
        ],
        notes:
          'Pass `summary` to name the items ("3 requests selected"); the default is "3 selected". The count is a ' +
          'polite live region, so a screen reader hears the selection change. A destructive bulk action stays ' +
          '`variant="error"`, and the confirm comes last.',
      },
      a11y: {
        notes:
          'Named by `label` (required), like every `Toolbar`. The count is `aria-live="polite"` with ' +
          '`aria-atomic`, so it is read whole when it changes. Selection itself stays on the row checkboxes, ' +
          'never `aria-selected` on a `<tr>`.',
      },
      changelog: [
        {
          date: '2026-10-03',
          summary: 'Initial build — the contextual bar shown while items are selected.',
          detail:
            'Composes `Toolbar` + `ToolbarGroup` + a link `Button` for "Clear selection". Surface `--primary-light` ' +
            'on `--rounded-lg`, padding level 4 / level 3. Count on `--foreground` at medium weight, tabular. ' +
            'Replaces the hand-rolled `.ds-admin-selbar` in the prototype\'s Approval queue. Four new pairings in ' +
            '`test:contrast` (foreground and primary-text on primary-light, over background and card).',
        },
      ],
    } satisfies UiDocsParameters,
  },
  args: { id: 'sel', label: 'Selected requests', count: 3 },
};
export default meta;
type Story = StoryObj<typeof SelectionBar>;

export const Playground: Story = {
  render: (args) => (
    <SelectionBar
      {...args}
      onClear={() => {}}
      actions={
        <>
          <Button id="sel-deny" style="outline" variant="error" size="sm" label="Deny" />
          <Button id="sel-approve" size="sm" label="Approve" />
        </>
      }
    />
  ),
};

/** Over a selectable table: the bar replaces the filter row while rows are picked. */
export const WithTable: Story = {
  render: () => {
    const rows = ['Promote Cure rate', 'Publish Collections Daily Flash', 'Unpublish Legacy Servicing Overview', 'Update listing: Churn Risk'];
    const [picked, setPicked] = useState<string[]>([rows[0], rows[2]]);
    const toggle = (r: string) => setPicked((p) => (p.includes(r) ? p.filter((x) => x !== r) : [...p, r]));
    const n = picked.length;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', maxWidth: 'var(--max-w-3xl)' }}>
        {n > 0 ? (
          <SelectionBar
            id="sel-table"
            label="Selected requests"
            count={n}
            summary={`${n} request${n === 1 ? '' : 's'} selected`}
            onClear={() => setPicked([])}
            actions={
              <>
                <Button id="sel-table-deny" style="outline" variant="error" size="sm" label="Deny" />
                <Button id="sel-table-approve" size="sm" label="Approve" />
              </>
            }
          />
        ) : (
          <p style={{ margin: 0, color: 'var(--muted-foreground)' }}>Select rows to act on them.</p>
        )}
        <Table id="sel-rows" label="Requests">
          <TableHead>
            <TableRow>
              <TableSelectionCell
                id="sel-all"
                checked={n === rows.length}
                indeterminate={n > 0 && n < rows.length}
                onCheckedChange={(v) => setPicked(v ? rows : [])}
                label="Select all requests"
              />
              <TableHeaderCell>Request</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((r, i) => (
              <TableRow key={r} selected={picked.includes(r)}>
                <TableSelectionCell id={`sel-r${i}`} checked={picked.includes(r)} onCheckedChange={() => toggle(r)} label={`Select ${r}`} />
                <TableCell>{r}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  },
};

/** Inside a theme: the tint follows the brand, like a selected row. */
export const Themed: Story = {
  render: () => (
    <div data-theme="rm">
      <SelectionBar
        id="sel-rm"
        label="Selected dashboards"
        count={2}
        summary="2 dashboards selected"
        onClear={() => {}}
        actions={<Button id="sel-rm-add" size="sm" label="Add to space" />}
      />
    </div>
  ),
};
