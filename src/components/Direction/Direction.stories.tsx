import { useState } from 'react';
import { ChevronRight, Search, Star } from 'lucide-react';
import type { Meta, StoryObj } from '@storybook/react';
import DirectionProvider, { useDirection } from './Direction';
import type { Direction } from './Direction.types';
import Button from '../Button/Button';
import Input from '../Input/Input';
import Chip from '../Chip/Chip';
import type { UiDocsParameters } from '../../types/DocsTypes';

/**
 * `DirectionProvider` sets the `dir` attribute on a layout-neutral wrapper and
 * shares the direction via `useDirection`. Components styled with CSS logical
 * properties (and flex rows) mirror automatically under `dir="rtl"` — note how
 * the icons, input affordances and text alignment all flip.
 */
const meta: Meta<typeof DirectionProvider> = {
  title: 'Components/Direction',
  component: DirectionProvider,
  parameters: {
    layout: 'padded',
    ui: {
      description:
        'Sets `dir` on a subtree and shares it through context so RTL layouts mirror. ' +
        'The wrapper is `display: contents`, so it adds no box of its own — and ' +
        'because the library is built on CSS logical properties, most components ' +
        'mirror without any change.',
      tags: ['provider'],
      changelog: [
        {
          date: '2026-07-29',
          summary: 'Initial build complete.',
          detail:
            'Component shipped: tokenised styles, full prop surface, stories, and documented API.',
        },
      ],
    } satisfies UiDocsParameters,
  },
  argTypes: {
    dir: { control: 'inline-radio', options: ['ltr', 'rtl'] },
  },
};

export default meta;

type Story = StoryObj<typeof DirectionProvider>;

// A small set of components that mirror under RTL.
const Panel = ({ k }: { k: string }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--p-3)',
      width: 300,
      fontFamily: 'var(--font-family)',
    }}
  >
    <p
      style={{
        margin: 0,
        fontSize: 'var(--text-sm)',
        color: 'var(--foreground)',
      }}
    >
      Text and controls follow the reading direction.
    </p>
    <Button id={`${k}-btn`} label="Search" IconLeft={Search} />
    <Input id={`${k}-input`} placeholder="Search…" IconLeft={Search} IconRight={ChevronRight} />
    <div style={{ display: 'flex', gap: 'var(--p-2)' }}>
      <Chip id={`${k}-chip-1`} label="Recent" active IconLeft={Star} />
      <Chip id={`${k}-chip-2`} label="Starred" />
    </div>
  </div>
);

const heading = (children: React.ReactNode) => (
  <div
    style={{
      fontFamily: 'var(--font-family-mono)',
      fontSize: 'var(--text-xs)',
      color: 'var(--muted-foreground)',
      marginBottom: 'var(--p-2)',
    }}
  >
    {children}
  </div>
);

export const Playground: Story = {
  args: { dir: 'rtl' },
  render: (args) => (
    <DirectionProvider dir={args.dir}>
      <Panel k="pg" />
    </DirectionProvider>
  ),
};

export const LtrVsRtl: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--p-10)', flexWrap: 'wrap' }}>
      <div>
        {heading('dir="ltr"')}
        <DirectionProvider dir="ltr">
          <Panel k="ltr" />
        </DirectionProvider>
      </div>
      <div>
        {heading('dir="rtl"')}
        <DirectionProvider dir="rtl">
          <Panel k="rtl" />
        </DirectionProvider>
      </div>
    </div>
  ),
};

// useDirection lets JS-positioned components read the current direction.
const Readout = () => {
  const dir = useDirection();
  return (
    <code
      style={{
        fontFamily: 'var(--font-family-mono)',
        fontSize: 'var(--text-sm)',
        color: 'var(--primary-text)',
      }}
    >
      useDirection() → "{dir}"
    </code>
  );
};

export const Interactive: Story = {
  render: () => {
    const [dir, setDir] = useState<Direction>('ltr');
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--p-4)', width: 320 }}>
        <button
          type="button"
          onClick={() => setDir((d) => (d === 'ltr' ? 'rtl' : 'ltr'))}
          className="ui-button ui-button--default ui-button--default-outline ui-button--sz-small"
        >
          Toggle direction (now {dir})
        </button>
        <DirectionProvider dir={dir}>
          <Panel k="int" />
          <div style={{ marginTop: 'var(--p-3)' }}>
            <Readout />
          </div>
        </DirectionProvider>
      </div>
    );
  },
};
