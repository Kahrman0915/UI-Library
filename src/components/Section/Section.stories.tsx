import type { Meta, StoryObj } from '@storybook/react';
import Section from './Section';
import Stack from '../Stack';
import Button from '../Button';
import type { UiDocsParameters } from '../../types/DocsTypes';

const meta: Meta<typeof Section> = {
  title: 'Components/Section',
  component: Section,
  parameters: {
    layout: 'padded',
    ui: {
      description:
        'A heading with its content under it, at the level the ladder gives that relationship: ' +
        '`default` puts a section heading level 2 above its content; `group` is a small uppercase label ' +
        'level 4 above a labelled group. The space *between* sections is the `Stack level={2}` they sit in.',
      tags: ['layout', 'ladder', 'section'],
      usage: {
        when: ['Every titled region of a page. Put sections in a `Stack level={2}`; put the section\'s own rows in a `Stack level={3}` inside it.', '`variant="group"` for the status groups on a list page — a label over a run of cards.'],
        avoid: ['Choosing the heading → content gap yourself. If level 2 or 4 is wrong, the region is not a section.'],
        notes: 'Renders a `<section aria-labelledby>` with an `h2` by default.',
      },
      changelog: [{ date: '2026-09-07', summary: 'Initial build. A heading and its content, on the ladder.', detail: '`default` (L2) and `group` (L4) variants; optional `actions` on the heading row. docs/spacing.md.' }],
    } satisfies UiDocsParameters,
  },
  argTypes: { variant: { control: 'select', options: ['default', 'group'] } },
  args: { id: 'sec', heading: 'All dashboards', variant: 'default' },
};
export default meta;
type Story = StoryObj<typeof Section>;

const Row = () => <div style={{ height: 48, background: 'var(--accent)', borderRadius: 'var(--rounded-md)' }} />;

export const Playground: Story = {
  render: (args) => (
    <Section {...args} actions={<Button id="sec-all" label="View all" style="link" size="sm" />}>
      <Stack level={3}>
        <Row />
        <Row />
      </Stack>
    </Section>
  ),
};

export const Group: Story = {
  render: () => (
    <Stack level={2} style={{ maxWidth: 560 }}>
      <Section id="g1" heading="Needs your reply" variant="group">
        <Stack level={3}>
          <Row />
        </Stack>
      </Section>
      <Section id="g2" heading="In review" variant="group">
        <Stack level={3}>
          <Row />
          <Row />
        </Stack>
      </Section>
    </Stack>
  ),
};
