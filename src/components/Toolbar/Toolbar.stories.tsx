import type { Meta, StoryObj } from '@storybook/react';
import { Search } from 'lucide-react';
import Toolbar, { ToolbarGroup } from './Toolbar';
import Button from '../Button';
import Input from '../Input';
import type { UiDocsParameters } from '../../types/DocsTypes';

const meta: Meta<typeof Toolbar> = {
  title: 'Components/Toolbar',
  component: Toolbar,
  subcomponents: { ToolbarGroup },
  parameters: {
    layout: 'padded',
    ui: {
      description:
        'A row of controls with two rungs of the ladder baked in: level 3 between `ToolbarGroup`s (the ' +
        'filter axes, the search) and level 4 between the controls inside a group. `role="toolbar"` with a ' +
        'required `label`.',
      tags: ['layout', 'ladder', 'toolbar'],
      usage: {
        when: ['Filter bars above a table or a list; the row of actions above a form. Put each axis of controls in its own `ToolbarGroup`.'],
        avoid: ['A single flat row with one gap for everything — two filter groups then read as one, which is what the screens had.'],
        notes: 'Goes in `PageHeader`\'s `toolbar` slot when it belongs to the page, or at the top of a `Section` when it belongs to one table.',
      },
      changelog: [{ date: '2026-09-07', summary: 'Initial build. Filter and action rows on the ladder.', detail: '`Toolbar` (L3 between groups, `justify`) and `ToolbarGroup` (L4 inside). docs/spacing.md.' }],
    } satisfies UiDocsParameters,
  },
  argTypes: { justify: { control: 'select', options: ['start', 'between', 'end'] } },
  args: { id: 'tb', label: 'Filters', justify: 'between' },
};
export default meta;
type Story = StoryObj<typeof Toolbar>;

export const Playground: Story = {
  render: (args) => (
    <Toolbar {...args}>
      <ToolbarGroup>
        <Button id="tb-all" label="All" size="sm" style="secondary" />
        <Button id="tb-dc" label="DART Central" size="sm" style="ghost" />
        <Button id="tb-db" label="Dartboards" size="sm" style="ghost" />
      </ToolbarGroup>
      <ToolbarGroup>
        <Input id="tb-search" placeholder="Search by reference, request or requester…" aria-label="Search" IconLeft={Search} size="sm" />
      </ToolbarGroup>
    </Toolbar>
  ),
};

export const TwoAxes: Story = {
  render: () => (
    <Toolbar id="tb2" label="Filters" justify="start">
      <ToolbarGroup>
        <Button id="a1" label="All" size="sm" style="secondary" />
        <Button id="a2" label="Active" size="sm" style="ghost" />
        <Button id="a3" label="Inactive" size="sm" style="ghost" />
      </ToolbarGroup>
      <ToolbarGroup>
        <Button id="b1" label="All" size="sm" style="secondary" />
        <Button id="b2" label="Dashboards" size="sm" style="ghost" />
        <Button id="b3" label="Banners" size="sm" style="ghost" />
      </ToolbarGroup>
    </Toolbar>
  ),
};
