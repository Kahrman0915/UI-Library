import type { Meta, StoryObj } from '@storybook/react';
import Heading from './Heading';
import Text from '../Text';
import Stack from '../Stack';
import type { UiDocsParameters } from '../../types/DocsTypes';

const meta: Meta<typeof Heading> = {
  title: 'Components/Heading',
  component: Heading,
  parameters: {
    layout: 'padded',
    ui: {
      description:
        'A heading on the library’s type ramp, with no margin. `level` picks the element (`h1`–`h6`, the document outline); ' +
        '`size` picks the look, and defaults from the level so the common case needs neither. The two are separate on purpose: ' +
        'a panel’s `h2` can be small and a hero’s `h1` large without lying to the outline.',
      tags: ['typography', 'no id'],
      usage: {
        when: [
          'Any heading a component does not already render — a card body’s section, an empty state you are composing, a hero.',
          'Instead of `<h2 style={{ margin: 0, fontSize: … }}>`. That is the pattern this replaces.',
        ],
        avoid: [
          'A page title — that is `PageHeader`, which also owns the description and actions.',
          'A heading over a section of a page — that is `Section`, which ties the heading to its content with `aria-labelledby`.',
          'Bold `Text` as a heading. Screen-reader users navigate by headings; a styled paragraph is invisible to them.',
        ],
        notes:
          'Sizes are named after their font-size token (`base`, `lg`, `xl`, `2xl`, `3xl`, `4xl`) and every one is a size a component ' +
          'already uses for its own title, so a Heading beside a Card or a PageHeader matches it. No `id` prop of its own — pass one when ' +
          'something points at the heading with `aria-labelledby`.',
      },
      a11y: {
        notes:
          'Choose `level` by the outline, never by the look: one `h1` per page, and no skipped levels inside a region. If the design wants ' +
          'an `h3` to look like an `h2`, keep `level={3}` and set `size`. The heading has no role beyond its element.',
      },
      changelog: [
        {
          date: '2026-10-03',
          summary: 'Initial build. A margin-free heading whose level and size are set separately.',
          detail:
            '`level` 1–6 renders `h1`–`h6`; `size` base | lg | xl | 2xl | 3xl | 4xl, defaulting from the level (h1 2xl, h2 xl, h3 lg, h4–h6 base). ' +
            'Semibold on --foreground, `text-wrap: balance`, tracking tightened at 3xl/4xl as PageHeader’s `lg` title does.',
        },
      ],
    } satisfies UiDocsParameters,
  },
  argTypes: {
    level: { control: 'select', options: [1, 2, 3, 4, 5, 6] },
    size: { control: 'select', options: [undefined, 'base', 'lg', 'xl', '2xl', '3xl', '4xl'] },
  },
  args: { level: 2, children: 'Collections performance' },
};
export default meta;
type Story = StoryObj<typeof Heading>;

export const Playground: Story = {};

/** The six sizes, largest first. Each is a title size some component already uses. */
export const Sizes: Story = {
  render: () => (
    <Stack level={3}>
      {(['4xl', '3xl', '2xl', 'xl', 'lg', 'base'] as const).map((s) => (
        <Heading key={s} level={2} size={s}>
          {s} — Collections performance
        </Heading>
      ))}
    </Stack>
  ),
};

/** With no `size`, each level takes its default — the common case needs no size at all. */
export const LevelDefaults: Story = {
  render: () => (
    <Stack level={3}>
      {([1, 2, 3, 4] as const).map((l) => (
        <Heading key={l} level={l}>
          h{l} — Collections performance
        </Heading>
      ))}
    </Stack>
  ),
};

/** The outline and the look differ: an `h2` set small in a side panel. */
export const LevelAndSizeIndependent: Story = {
  render: () => (
    <Stack level={4} style={{ maxWidth: 'var(--max-w-xs)' }}>
      <Heading level={2} size="base">
        Recent activity
      </Heading>
      <Text tone="muted">An h2 in the outline, at the base size the panel wants.</Text>
    </Stack>
  ),
};
