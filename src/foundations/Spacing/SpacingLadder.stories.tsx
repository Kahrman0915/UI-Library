import { useLayoutEffect, useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import type { UiDocsParameters } from '../../types/DocsTypes';
import { DENSITIES, FLUID, LADDER, LEVELS, type Density } from '../../styles/spacingRecipe';
import Button from '../../components/Button';

const meta: Meta = {
  title: 'Foundations/Spacing Ladder',
  parameters: {
    layout: 'fullscreen',
    ui: {
      description:
        'Five spacing LEVELS assigned by hierarchy — `--space-1` (page) down to `--space-5` (micro). ' +
        'A container\'s gap or padding is a level; each level down is one step down. The whole ladder ' +
        'slides with viewport width from 1440 to 1920px and reshapes per `data-density`. Resize the ' +
        'window and every bar moves together; switch density and the ladder changes shape.',
      tags: ['tokens', 'data-density', 'fluid'],
    } satisfies UiDocsParameters,
  },
};
export default meta;
type Story = StoryObj;

const mono = 'var(--font-family-mono)';
const H2 = ({ children }: { children: React.ReactNode }) => (
  <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', margin: '36px 0 4px', color: 'var(--foreground)' }}>{children}</h2>
);
const P = ({ children }: { children: React.ReactNode }) => (
  <p style={{ fontSize: 'var(--text-sm)', lineHeight: 1.7, color: 'var(--muted-foreground)', maxWidth: 720, margin: '0 0 16px' }}>{children}</p>
);
const M = ({ children }: { children: React.ReactNode }) => (
  <span style={{ fontFamily: mono, fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>{children}</span>
);

/** A bar whose width IS the token, plus the number the browser resolved it to right now. */
const Live = ({ token }: { token: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [px, setPx] = useState<number | null>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const read = () => setPx(Math.round(el.getBoundingClientRect().width * 10) / 10);
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <>
      <div ref={ref} style={{ height: 12, width: `var(${token})`, background: 'var(--primary)', borderRadius: 'var(--rounded-sm)' }} />
      <M>{px === null ? '' : `${px}px`}</M>
    </>
  );
};

const DensitySwitch = ({ density, onChange }: { density: Density; onChange: (d: Density) => void }) => (
  <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
    {DENSITIES.map((d) => (
      <Button key={d} id={`density-${d}`} label={d} size="sm" style={d === density ? 'default' : 'outline'} onClick={() => onChange(d)} />
    ))}
    <M>data-density=&quot;{density}&quot;{density === 'balanced' ? ' (attribute absent)' : ''}</M>
  </div>
);

const Ladder = () => {
  const [density, setDensity] = useState<Density>('balanced');
  return (
    <div data-density={density === 'balanced' ? undefined : density} style={{ padding: 'var(--space-1)' }}>
      <H2>The ladder <M>--space-1 … --space-5</M></H2>
      <P>
        The second column is the recipe at this density, small → large end; the third is what the browser
        resolved right now. Every level slides on the same width from {FLUID.min} to {FLUID.max}px, so the
        ladder stays in proportion at every size: the large end is the small end × 1.5.
      </P>
      <DensitySwitch density={density} onChange={setDensity} />
      <div style={{ display: 'grid', gap: 3 }}>
        {LEVELS.map((l) => {
          const [a, b] = LADDER[density][l.n];
          return (
            <div key={l.n} style={{ display: 'grid', gridTemplateColumns: '150px 90px 90px 1fr', gap: 'var(--p-3)', alignItems: 'center' }}>
              <M>--space-{l.n} · {l.name}</M>
              <M>{a === b ? `${a}` : `${a} → ${b}`}</M>
              <Live token={`--space-${l.n}`} />
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>{l.job}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const TheLadder: Story = { name: 'The ladder', render: () => <Ladder /> };

/** A whole page on the ladder: margin L1, sections L2, grid and card padding L3, inside a card L4, title→subtitle L5. */
const Page = () => {
  const [density, setDensity] = useState<Density>('balanced');
  return (
    <div data-density={density === 'balanced' ? undefined : density}>
      <div style={{ padding: 'var(--space-1)' }}>
        <H2>A page on the ladder</H2>
        <P>
          Nothing below chose a number. The margin is L1, the space between header and content is L1, sections
          are L2 apart, the grid gap and card padding are L3, rows inside a card are L4, title to subtitle is L5.
          Resize the window; switch density.
        </P>
        <DensitySwitch density={density} onChange={setDensity} />
      </div>
      <div style={{ padding: 'var(--space-1)', display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', background: 'var(--background)', border: 'var(--border-w-100) dashed var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <strong style={{ fontSize: 'var(--text-2xl)', color: 'var(--foreground)' }}>Browse Dashboards</strong>
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>Browse page description</span>
          </div>
          <Button id="ladder-cta" label="Request New Dashboard" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <strong style={{ fontSize: 'var(--text-base)', color: 'var(--foreground)' }}>All dashboards</strong>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 'var(--space-3)' }}>
            {['Executive Financial Summary', 'Executive Overview', 'Specialist Details', 'Servicing Overview', 'Originations Daily Volume', 'Collateral Health', 'Call Center Metrics', 'Data Explorer Usage'].map((t) => (
              <div key={t} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', padding: 'var(--space-3)', background: 'var(--card)', border: 'var(--border-w-100) solid var(--border)', borderRadius: 'var(--rounded-lg)' }}>
                <div style={{ height: 72, background: 'var(--accent)', borderRadius: 'var(--rounded-md)' }} />
                <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--foreground)' }}>{t}</strong>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>Short description of the dashboard.</span>
                <Button id={`add-${t}`} label="Add to a Space" size="sm" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const APageOnTheLadder: Story = { name: 'A page on the ladder', render: () => <Page /> };
