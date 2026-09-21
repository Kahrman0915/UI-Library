import type { Meta, StoryObj } from '@storybook/react';
import Swatch from './Swatch';
import { CATEGORY_COLORS } from '../../types/GlobalTypes';
import type { UiDocsParameters } from '../../types/DocsTypes';

const meta: Meta<typeof Swatch> = {
  title: 'Components/Swatch',
  component: Swatch,
  parameters: {
    layout: 'centered',
    ui: {
      description:
        'A small color chip in one of the 15 category hues — the marker that gives a space, a ' +
        'tag or a board its identity color. Pair it with a visible name: the hue tells two ' +
        'things apart, it does not say what either one is.',
      tags: ['identity', 'category'],
      usage: {
        when: [
          'A user picks an identity color for something they own — a space, a board, a label.',
          'A list needs the same color repeated beside each name so rows are tellable apart at a glance.',
          'A color picker needs the option to show the color it names.',
        ],
        avoid: [
          'For one of the five semantic states (online, busy, away, offline, neutral) — that is ' +
            '{@link StatusDot}, where the color IS the meaning.',
          'As the only thing distinguishing two rows. Color alone fails for anyone who cannot ' +
            'separate the hues, and violet and purple are hard for everyone.',
          'As a status, a severity or a chart mark. A chart reads `--category-{hue}` directly.',
        ],
        notes:
          '`color` is required. A swatch with no color has nothing to say, so there is no default.' +
          '\n\n' +
          '`label` names the MEANING, not the hue — `label="Weekly Ops Review"`, not `label="violet"`. ' +
          'Without a label the swatch is `aria-hidden` decoration beside visible text, which is the ' +
          'common case.',
      },
      a11y: {
        notes:
          'With a `label` the chip is `role="img"` with that accessible name. Without one it is ' +
          '`aria-hidden`, so a screen reader never announces a bare color.' +
          '\n\n' +
          'The chip carries an inset ring of its own hue at `--category-{hue}-border`, so a pale ' +
          'color still has a boundary on a light page. This is decoration beside a name, not a ' +
          'control, so it is not gated by `test:contrast`.',
      },
      changelog: [
        {
          date: '2026-09-16',
          summary: 'Initial build complete.',
          detail:
            'Added because four screens in a row needed a color chip and nothing in the library ' +
            'rendered one: `StatusDot` carries only the five semantic statuses, `Badge` with a ' +
            '`category` needs a label, and `FeaturedIcon` is a 40px tile. Extending `StatusDot` with ' +
            'the 15 hues was rejected — it would have let `status="busy"` and `color="red"` coexist ' +
            'on one component meaning different things.',
        },
      ],
    } satisfies UiDocsParameters,
  },
  argTypes: {
    color: { control: 'select', options: CATEGORY_COLORS },
    size: { control: 'select', options: ['sm', 'default', 'lg'] },
    shape: { control: 'select', options: ['circle', 'square'] },
  },
  args: { color: 'violet', size: 'default', shape: 'circle' },
};

export default meta;

type Story = StoryObj<typeof Swatch>;

const Row = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      fontFamily: 'var(--font-family)',
      fontSize: 'var(--text-sm)',
      color: 'var(--foreground)',
    }}
  >
    {children}
  </div>
);

export const Playground: Story = {};

/** Every hue at the default size, each beside the name it stands for. */
export const AllHues: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, max-content)',
        gap: '12px 24px',
      }}
    >
      {CATEGORY_COLORS.map((c) => (
        <Row key={c}>
          <Swatch color={c} />
          <span>{c}</span>
        </Row>
      ))}
    </div>
  ),
};

/** Both shapes at all three sizes. */
export const ShapesAndSizes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      {(['circle', 'square'] as const).map((shape) => (
        <Row key={shape}>
          <span style={{ width: 64, color: 'var(--muted-foreground)' }}>{shape}</span>
          <Swatch color="indigo" shape={shape} size="sm" />
          <Swatch color="indigo" shape={shape} size="default" />
          <Swatch color="indigo" shape={shape} size="lg" />
        </Row>
      ))}
    </div>
  ),
};

/**
 * The shape this exists for: a list of spaces, each with the color its owner
 * chose. The name carries the meaning; the swatch only makes the rows scannable.
 */
export const InAList: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12, minWidth: 220 }}>
      {(
        [
          ['violet', 'Weekly Ops Review'],
          ['emerald', 'Phone analytics'],
          ['amber', 'Call center'],
          ['sky', 'Tableau internal'],
        ] as const
      ).map(([c, name]) => (
        <Row key={name}>
          <Swatch color={c} />
          <span>{name}</span>
        </Row>
      ))}
    </div>
  ),
};

/**
 * A palette grid, where the chips are the subject rather than a marker on
 * something else — so they take the `square` shape and a real accessible name.
 */
export const AsAPicker: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, maxWidth: 200 }}>
      {CATEGORY_COLORS.map((c) => (
        <Swatch key={c} color={c} shape="square" size="lg" label={c} />
      ))}
    </div>
  ),
};
