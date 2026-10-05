import type { Meta, StoryObj } from '@storybook/react';
import DescriptionList, { DescriptionListItem } from './DescriptionList';
import Badge from '../Badge';
import Card, { CardBody, CardHeader } from '../Card';
import type { UiDocsParameters } from '../../types/DocsTypes';

const meta: Meta<typeof DescriptionList> = {
  title: 'Components/DescriptionList',
  component: DescriptionList,
  subcomponents: { DescriptionListItem },
  parameters: {
    layout: 'padded',
    ui: {
      description:
        'Label/value pairs with real `<dl>` semantics — request fields, dashboard info, record details. `horizontal` (the default) ' +
        'puts the terms in one column with every value lined up beside them; `vertical` stacks each term over its value for a narrow panel.',
      tags: ['data display', 'no id'],
      usage: {
        when: [
          'The details of one record: a request’s fields, a dashboard’s owner and source, an admin’s scope.',
          'Read-only facts. A pair whose value can be edited is a form `Field`, not a description.',
        ],
        avoid: [
          'Several records with the same fields — that is a `Table`, where the labels become column headers.',
          'A label and a control (`Switch`, `Select`) — that is a `Field`. A description list describes; it does not ask.',
        ],
        notes:
          'One `DescriptionListItem` per pair, with `term` for the label and children for the value. Rows sit at level 4 and the term ' +
          'column level 3 from the values. The term column is as wide as the longest term, and never narrower than --w-32.',
      },
      composition: [
        { name: 'DescriptionList', description: 'The `<dl>`. Holds the pairs and their layout.' },
        { name: 'DescriptionListItem', description: 'One pair: a `div` around a `dt` (`term`) and a `dd` (children).' },
      ],
      a11y: {
        notes:
          'Renders `dl` / `dt` / `dd`, so a screen reader announces it as a list of terms and their definitions. The `div` around each pair ' +
          'is allowed inside a `dl` and adds no role; in the horizontal layout it is `display: contents`, which changes only the layout. ' +
          'Muted terms are --muted-foreground, which clears AA on --background, --card and --secondary.',
      },
      changelog: [
        {
          date: '2026-10-03',
          summary: 'Initial build. Label/value pairs on a `dl`, in a term column or stacked.',
          detail:
            '`DescriptionList` (`orientation` horizontal | vertical) + `DescriptionListItem` (`term`, children). Horizontal is a two-column grid ' +
            '(`minmax(var(--w-32), max-content) minmax(0, 1fr)`) with the pair `div`s as `display: contents`; gaps --space-4 / --space-3. ' +
            'Replaces the `.ds-fields` dl in the DART Suite prototype.',
        },
      ],
    } satisfies UiDocsParameters,
  },
  argTypes: {
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
  },
  args: { orientation: 'horizontal' },
};
export default meta;
type Story = StoryObj<typeof DescriptionList>;

const rows = (
  <>
    <DescriptionListItem term="Request type">Promote dashboard</DescriptionListItem>
    <DescriptionListItem term="Dashboard">Collateral Health Dashboard</DescriptionListItem>
    <DescriptionListItem term="Submitted">08/22/2026, 9:41 AM</DescriptionListItem>
    <DescriptionListItem term="Status">
      <Badge id="dl-status" label="Needs review" color="info" appearance="soft" />
    </DescriptionListItem>
  </>
);

export const Playground: Story = {
  render: (args) => (
    <div style={{ maxWidth: 'var(--max-w-lg)' }}>
      <DescriptionList {...args}>{rows}</DescriptionList>
    </div>
  ),
};

/** The default: terms in one column, values lined up — however long any one term is. */
export const Horizontal: Story = {
  render: () => (
    <div style={{ maxWidth: 'var(--max-w-lg)' }}>
      <DescriptionList>{rows}</DescriptionList>
    </div>
  ),
};

/** `vertical` for a narrow panel: each term sits over its value. */
export const Vertical: Story = {
  render: () => (
    <div style={{ maxWidth: 'var(--max-w-xs)' }}>
      <DescriptionList orientation="vertical">{rows}</DescriptionList>
    </div>
  ),
};

/** In a card, with a long unbroken value that wraps instead of widening the card. */
export const InACard: Story = {
  render: () => (
    <Card id="dl-card" style={{ maxWidth: 'var(--max-w-md)' }}>
      <CardHeader id="dl-card-header" title="Dashboard info" />
      <CardBody>
        <DescriptionList>
          <DescriptionListItem term="Owner">Lena Ortiz</DescriptionListItem>
          <DescriptionListItem term="Data source">COLLATERAL_MART.daily_positions_snapshot_v2</DescriptionListItem>
          <DescriptionListItem term="Refreshed">Last updated today at 6:00 AM</DescriptionListItem>
          <DescriptionListItem term="Tags">
            <span style={{ display: 'inline-flex', gap: 'var(--space-5)', flexWrap: 'wrap' }}>
              <Badge id="dl-tag-1" label="Collateral" color="info" appearance="soft" />
              <Badge id="dl-tag-2" label="Daily" color="info" appearance="soft" />
            </span>
          </DescriptionListItem>
        </DescriptionList>
      </CardBody>
    </Card>
  ),
};
