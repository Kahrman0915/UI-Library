import type { Meta, StoryObj } from '@storybook/react';
import Text from './Text';
import Heading from '../Heading';
import Stack from '../Stack';
import type { UiDocsParameters } from '../../types/DocsTypes';

const meta: Meta<typeof Text> = {
  title: 'Components/Text',
  component: Text,
  parameters: {
    layout: 'padded',
    ui: {
      description:
        'Running text on the type ramp, with no margin: a `size`, a `tone` and a `weight`. It replaces the `.text` / `.muted` / ' +
        '`.meta` classes every app was writing for itself. `lines` clamps it with an ellipsis.',
      tags: ['typography', 'no id'],
      usage: {
        when: [
          'Body copy in a card or panel (`sm`, the default).',
          'A meta line — who and when — at `xs` and `tone="muted"`.',
          'Reading copy on a page meant to be read, at `base` or `lg`.',
        ],
        avoid: [
          'A heading. Use `Heading` — bold Text is invisible to anyone navigating by headings.',
          'Coloured status text. Meaning belongs to the component that knows it (`Badge`, `Alert`, a field’s error message), not to a tone.',
        ],
        notes:
          'Sizes are named after their token (`xs` 12/16, `sm` 14/20, `base` 16/24, `lg` 18/28). `as` is `p` by default; use `span` inside ' +
          'a line of other content and `div` when it holds blocks. Long unbroken strings wrap rather than widening the layout.',
      },
      a11y: {
        notes:
          '`muted` is --muted-foreground, which clears AA on --background, --card and --secondary; never put muted Text on --muted. A clamped ' +
          'line hides text from sighted users only — a screen reader still reads it all — so when the hidden part matters, give a way to reach it.',
      },
      changelog: [
        {
          date: '2026-10-03',
          summary: 'Initial build. Margin-free running text with a size, a tone and a weight.',
          detail:
            '`size` xs | sm | base | lg (default sm), `tone` default | muted, `weight` normal | medium | semibold, `as` p | span | div, `lines` ' +
            'clamps through `--ui-text-lines` (the CardDescription mechanism). Defaults emit no modifier class.',
        },
      ],
    } satisfies UiDocsParameters,
  },
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm', 'base', 'lg'] },
    tone: { control: 'select', options: ['default', 'muted'] },
    weight: { control: 'select', options: ['normal', 'medium', 'semibold'] },
    as: { control: 'select', options: ['p', 'span', 'div'] },
    lines: { control: 'select', options: [undefined, 1, 2, 3] },
  },
  args: { children: 'Balances in arrears, cures and roll rates for yesterday, refreshed every morning at six.' },
};
export default meta;
type Story = StoryObj<typeof Text>;

export const Playground: Story = {};

/** The four sizes, each in both tones. */
export const SizesAndTones: Story = {
  render: () => (
    <Stack level={3}>
      {(['lg', 'base', 'sm', 'xs'] as const).map((s) => (
        <Stack key={s} level={5}>
          <Text size={s}>{s} — Balances in arrears, cures and roll rates.</Text>
          <Text size={s} tone="muted">
            {s} muted — refreshed every morning at six.
          </Text>
        </Stack>
      ))}
    </Stack>
  ),
};

/** The commonest composition: a title, a meta line, and the copy. */
export const MetaLine: Story = {
  render: () => (
    <Stack level={4} style={{ maxWidth: 'var(--max-w-md)' }}>
      <Heading level={3} size="base">
        Can Aiden summarize a dashboard?
      </Heading>
      <Text size="xs" tone="muted">
        Lena Ortiz · 08/30/2026
      </Text>
      <Text>Asking whether summaries can be triggered per dashboard, or only from the Aiden panel.</Text>
    </Stack>
  ),
};

/** `lines` clamps with an ellipsis — two lines here. */
export const Clamped: Story = {
  render: () => (
    <div style={{ maxWidth: 'var(--max-w-xs)' }}>
      <Text lines={2}>
        Balances in arrears, cures and roll rates for yesterday, broken out by region and segment, refreshed every morning at
        six so the collections stand-up starts from the same numbers.
      </Text>
    </div>
  ),
};
