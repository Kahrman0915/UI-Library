import type { Meta, StoryObj } from '@storybook/react';
import Grid from './Grid';
import Card, { CardBody, CardHeader } from '../Card';
import type { UiDocsParameters } from '../../types/DocsTypes';

const meta: Meta<typeof Grid> = {
  title: 'Components/Grid',
  component: Grid,
  parameters: {
    layout: 'padded',
    ui: {
      description:
        'Equal items in columns that **reflow from a minimum width**, with the gap on the spacing ladder. ' +
        '`minItemWidth` fits as many columns as the container allows — no breakpoints, and it answers to its container, ' +
        'not the window. `columns` caps the count, or fixes it when there is no minimum. `stretch` lets a short row fill the width (a row of KPI tiles) instead of keeping empty columns. `maxItemWidth` stops a lone ' +
        'item stretching to nearly twice the minimum: the tracks are pinned at that width and packed to the start.',
      tags: ['layout', 'ladder', 'no id', 'reflow'],
      usage: {
        when: [
          'A grid of equal objects — cards in a browse page, KPI tiles, option cards. Level 3, the ladder’s grid gap.',
          'Anything that should drop columns as its container narrows, without breakpoints.',
        ],
        avoid: [
          'Unequal content in a row. A grid makes every cell the same width; a run of mixed things is a `Stack`.',
          'Two-dimensional layout with spans. Grid deliberately takes no `span` or `area` props — that is page layout, not a grid of items.',
        ],
        notes:
          '`maxItemWidth` is the only prop that runs JavaScript: a ResizeObserver on the grid’s parent. Without it the grid is ' +
          'pure CSS. Pass lengths as tokens (`var(--w-72)`), so the minimum is a design-system value and not a number at the call site.',
      },
      a11y: {
        notes:
          'A Grid is layout only: it adds no role. Use `as="ul"` with `li` children when the items are a list a screen reader ' +
          'should count. The two measuring probes `maxItemWidth` adds are `aria-hidden`, and are `li`s inside a list so the markup stays valid.',
      },
      changelog: [
        {
          date: '2026-10-03',
          summary: 'Initial build. A grid that reflows from a minimum item width, with an optional maximum.',
          detail:
            '`repeat(auto-fill, minmax(min(100%, var(--ui-grid-min)), 1fr))`; `columns` caps the count through a `max()` on the track ' +
            'minimum, or fixes it when there is no minimum. `maxItemWidth` measures the grid against its parent (a ResizeObserver in a plain ' +
            'effect, StrictMode-safe) and pins `repeat(n, max)` through `--ui-grid-template`, computing `n` from the measured width every ' +
            'time so a column dropped at one width comes back at the next. Replaces the hand-rolled auto-fit grids and the ResizeObserver ' +
            'hook in the DART Suite prototype.',
        },
      ],
    } satisfies UiDocsParameters,
  },
  argTypes: {
    level: { control: 'select', options: [1, 2, 3, 4, 5] },
    minItemWidth: { control: 'select', options: ['var(--w-48)', 'var(--w-64)', 'var(--w-72)', 'var(--w-80)'] },
    maxItemWidth: { control: 'select', options: [undefined, 'var(--w-80)', 'var(--w-96)'] },
    columns: { control: 'select', options: [undefined, 2, 3, 4, 5] },
    stretch: { control: 'boolean' },
    as: { control: 'select', options: ['div', 'section', 'ul', 'ol'] },
  },
  args: { level: 3, minItemWidth: 'var(--w-64)' },
};
export default meta;
type Story = StoryObj<typeof Grid>;

const Tile = ({ n }: { n: number }) => (
  <div
    style={{
      height: 'var(--h-20)',
      background: 'var(--accent)',
      borderRadius: 'var(--rounded-lg)',
      display: 'grid',
      placeItems: 'center',
      fontSize: 'var(--text-sm)',
      color: 'var(--muted-foreground)',
    }}
  >
    {n}
  </div>
);

/** Drag the frame's bottom-right corner to resize it and watch the columns drop and return. */
const Resizable = ({ children, width = '100%' }: { children: React.ReactNode; width?: string }) => (
  <div
    style={{
      resize: 'horizontal',
      overflow: 'auto',
      width,
      maxWidth: '100%',
      minWidth: 'var(--w-48)',
      padding: 'var(--p-4)',
      border: 'var(--border-w-100) dashed var(--border)',
      borderRadius: 'var(--rounded-lg)',
    }}
  >
    {children}
  </div>
);

export const Playground: Story = {
  render: (args) => (
    <Resizable>
      <Grid {...args}>
        {Array.from({ length: 7 }, (_, i) => (
          <Tile key={i} n={i + 1} />
        ))}
      </Grid>
    </Resizable>
  ),
};

/** `minItemWidth` alone: as many columns as fit. Resize the frame — there are no breakpoints. */
export const Reflow: Story = {
  render: () => (
    <Resizable>
      <Grid level={3} minItemWidth="var(--w-64)">
        {Array.from({ length: 8 }, (_, i) => (
          <Tile key={i} n={i + 1} />
        ))}
      </Grid>
    </Resizable>
  ),
};

/** `columns` with a minimum is a cap: never more than three, still fewer when it narrows. */
export const CappedColumns: Story = {
  render: () => (
    <Resizable>
      <Grid level={3} minItemWidth="var(--w-48)" columns={3}>
        {Array.from({ length: 6 }, (_, i) => (
          <Tile key={i} n={i + 1} />
        ))}
      </Grid>
    </Resizable>
  ),
};

/**
 * Without `maxItemWidth` (top) a lone card stretches to nearly twice its minimum before a second
 * fits. With it (bottom) the columns stop at the maximum and the spare width collects at the end.
 */
export const MaxItemWidth: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      {[undefined, 'var(--w-96)'].map((max) => (
        <Resizable key={String(max)} width="var(--max-w-3xl)">
          <Grid level={3} minItemWidth="var(--w-72)" maxItemWidth={max}>
            {['Revenue by Region', 'Pipeline Health', 'Support Backlog'].map((t, i) => (
              <Card key={t} id={`grid-max-${String(max)}-${i}`}>
                <CardHeader id={`grid-max-${String(max)}-${i}-h`} title={t} description={max ? 'Capped at --w-96' : 'Stretches with the track'} />
                <CardBody>Bookings, pipeline and win rate.</CardBody>
              </Card>
            ))}
          </Grid>
        </Resizable>
      ))}
    </div>
  ),
};

/**
 * The same three tiles without and with `stretch`. Without it (top) the row keeps empty columns, so
 * a short row matches the rows above it. With it (bottom) the tiles fill the row — a row of KPIs.
 */
export const Stretch: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      {[false, true].map((stretch) => (
        <Grid key={String(stretch)} level={3} minItemWidth="var(--w-48)" stretch={stretch}>
          {[1, 2, 3].map((n) => (
            <Tile key={n} n={n} />
          ))}
        </Grid>
      ))}
    </div>
  ),
};

/** `columns` without a minimum: a fixed count that never reflows. */
export const FixedColumns: Story = {
  render: () => (
    <Grid level={3} columns={4}>
      {Array.from({ length: 8 }, (_, i) => (
        <Tile key={i} n={i + 1} />
      ))}
    </Grid>
  ),
};

/** `as="ul"` when the items are a list: a screen reader then counts them. Children are `li`s. */
export const AsList: Story = {
  render: () => (
    <Grid level={3} minItemWidth="var(--w-48)" as="ul" aria-label="Dashboards">
      {['Revenue', 'Pipeline', 'Backlog', 'Churn'].map((t, i) => (
        <li key={t}>
          <Tile n={i + 1} />
        </li>
      ))}
    </Grid>
  ),
};
