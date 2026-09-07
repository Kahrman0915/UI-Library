import type { Meta, StoryObj } from '@storybook/react';
import Stack from './Stack';
import type { UiDocsParameters } from '../../types/DocsTypes';

const meta: Meta<typeof Stack> = {
  title: 'Components/Stack',
  component: Stack,
  parameters: {
    layout: 'padded',
    ui: {
      description:
        'A flex run whose gap is a **level on the spacing ladder**, never a number. `level` is the ' +
        'only spacing input: 1 page · 2 section · 3 block · 4 element · 5 micro. The pixels come from ' +
        '`--space-N`, which slides with viewport width and reshapes per `data-density`, so a Stack ' +
        'never knows about either. `wrap` turns a horizontal Stack into a grid.',
      tags: ['layout', 'ladder', 'no id'],
      usage: {
        when: [
          'Any run of things one above another or side by side. Ask where it sits in the hierarchy and give it that level.',
          'A grid of equal objects (cards, KPI tiles): `direction="horizontal" wrap` at level 3.',
        ],
        avoid: [
          'Giving a Stack padding or a background. Space *between* things is its job; the inside edge of a surface belongs to the surface (`Card`, `Dialog`, `PageContainer`).',
          'Reaching for a raw `gap: var(--p-4)` in a page. If no level fits, the hierarchy is wrong, not the ladder.',
        ],
        notes:
          'No `id`: a layout primitive, like `AspectRatio`. Renders a `div` by default; pass `as` when the run is a `section`, `nav` or a list.',
      },
      changelog: [
        {
          date: '2026-09-07',
          summary: 'Initial build. The first layout primitive on the spacing ladder.',
          detail:
            'Five `--level-N` modifiers read `--space-1` … `--space-5`; `direction`, `wrap`, `align`, `justify` and `as`. ' +
            'Built to make the ladder hold across a team: a screen composed from Stacks makes one decision per container, which level, and none about pixels. See docs/spacing.md.',
        },
      ],
    } satisfies UiDocsParameters,
  },
  argTypes: {
    level: { control: 'select', options: [1, 2, 3, 4, 5] },
    direction: { control: 'select', options: ['vertical', 'horizontal'] },
    align: { control: 'select', options: ['start', 'center', 'end', 'stretch'] },
    justify: { control: 'select', options: ['start', 'center', 'end', 'between'] },
    wrap: { control: 'boolean' },
  },
  args: { level: 3, direction: 'vertical', wrap: false },
};
export default meta;
type Story = StoryObj<typeof Stack>;

const Block = ({ h = 40, w }: { h?: number; w?: number }) => (
  <div style={{ height: h, width: w, background: 'var(--accent)', borderRadius: 'var(--rounded-md)', minWidth: w ? undefined : 0 }} />
);
const Label = ({ children }: { children: React.ReactNode }) => (
  <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>{children}</span>
);

export const Playground: Story = {
  render: (args) => (
    <Stack {...args} style={{ width: 360 }}>
      <Block />
      <Block />
      <Block />
    </Stack>
  ),
};

/** One Stack per level. Resize the window and every gap moves together; the shape never changes. */
export const Levels: Story = {
  render: () => (
    <Stack level={2} direction="horizontal" align="start">
      {([1, 2, 3, 4, 5] as const).map((n) => (
        <Stack key={n} level={5} style={{ width: 160 }}>
          <Label>level {n} · --space-{n}</Label>
          <Stack level={n}>
            <Block h={24} />
            <Block h={24} />
            <Block h={24} />
          </Stack>
        </Stack>
      ))}
    </Stack>
  ),
};

export const Horizontal: Story = {
  render: () => (
    <Stack level={4} direction="horizontal" align="center">
      <Block h={36} w={96} />
      <Block h={36} w={96} />
      <Block h={36} w={96} />
    </Stack>
  ),
};

/** A grid is a horizontal Stack that wraps; the row gap is the same level. */
export const Grid: Story = {
  render: () => (
    <Stack level={3} direction="horizontal" wrap style={{ maxWidth: 720 }}>
      {Array.from({ length: 8 }, (_, i) => (
        <Block key={i} h={96} w={160} />
      ))}
    </Stack>
  ),
};

export const Between: Story = {
  render: () => (
    <Stack level={3} direction="horizontal" justify="between" align="center" style={{ width: 480 }}>
      <Block h={36} w={140} />
      <Block h={36} w={96} />
    </Stack>
  ),
};
