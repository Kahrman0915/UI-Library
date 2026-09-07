import { useLayoutEffect, useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import type { UiDocsParameters } from '../../types/DocsTypes';
import { DENSITIES, FLUID, ROLES, valueOf, type Density, type Role } from '../../styles/spacingRecipe';
import Button from '../../components/Button';

const meta: Meta = {
  title: 'Foundations/Semantic Spacing',
  parameters: {
    layout: 'fullscreen',
    ui: {
      description:
        'Named spacing roles over the primitive ramp — `inline`, `stack`, `inset` — with a ' +
        '`data-density` switch and six fluid roles that breathe between 1024 and 1920px. ' +
        'Every bar below is live: resize the window and the fluid rows move; switch density and ' +
        'the inset and inline rows move. Rules in `docs/spacing.md`.',
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

/** A bar whose width IS the token, plus the number the browser actually resolved it to. */
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

const describe = (role: Role, density: Density) => {
  const v = valueOf(role, density);
  return Array.isArray(v) ? `${v[0]} → ${v[1]} (${role.unit})` : `${v}`;
};

const Table = ({ density }: { density: Density }) => (
  <div style={{ display: 'grid', gap: 3 }}>
    {ROLES.map((r) => (
      <div key={r.name} style={{ display: 'grid', gridTemplateColumns: '160px 110px 90px 1fr', gap: 'var(--p-3)', alignItems: 'center' }}>
        <M>--space-{r.name}</M>
        <M>{describe(r, density)}</M>
        <Live token={`--space-${r.name}`} />
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>{r.job}</span>
      </div>
    ))}
  </div>
);

const Roles = () => {
  const [density, setDensity] = useState<Density>('balanced');
  return (
    <div data-density={density === 'balanced' ? undefined : density} style={{ padding: 'var(--space-inset-lg)' }}>
      <H2>Roles <M>--space-*</M></H2>
      <P>
        A role names what the space is between. The second column is the recipe; the third is what
        the browser resolved it to right now. Fluid rows slide between their two rungs from {FLUID.min} to{' '}
        {FLUID.max}px of width; resize the window to watch them. Density moves inset and inline one rung
        and never moves stack.
      </P>
      <div style={{ display: 'flex', gap: 'var(--space-inline-sm)', marginBottom: 'var(--space-stack)' }}>
        {DENSITIES.map((d) => (
          <Button key={d} id={`density-${d}`} label={d} size="sm" style={d === density ? 'default' : 'outline'} onClick={() => setDensity(d)} />
        ))}
        <M>data-density=&quot;{density}&quot;{density === 'balanced' ? ' (attribute absent)' : ''}</M>
      </div>
      <Table density={density} />
    </div>
  );
};

export const SemanticSpacing: Story = { name: 'Roles & density', render: () => <Roles /> };

/** The two container-relative roles respond to the box they are in, not the window. */
const Container = () => (
  <div style={{ padding: 'var(--space-inset-lg)' }}>
    <H2>Container roles <M>cqi</M></H2>
    <P>
      <code>inline-lg</code> and <code>gutter</code> follow the nearest container, so a card grid beside a
      sidebar gets the gap for the room it actually has. Drag the corner of this box to resize it and watch
      the gap between the cards; the wrapper declares <code>container-type: inline-size</code>.
    </P>
    <div style={{ containerType: 'inline-size', resize: 'horizontal', overflow: 'hidden', width: 'min(100%, 1200px)', minWidth: 320, border: 'var(--border-w-100) dashed var(--border)', padding: 'var(--space-inset)', borderRadius: 'var(--rounded-lg)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-inline-lg)' }}>
        {[1, 2, 3].map((n) => (
          <div key={n} style={{ height: 96, background: 'var(--accent)', borderRadius: 'var(--rounded-md)', display: 'grid', placeItems: 'center' }}>
            <M>card {n}</M>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 'var(--space-stack-sm)', display: 'grid', gridTemplateColumns: '160px 90px', gap: 'var(--p-3)', alignItems: 'center' }}>
        <M>--space-inline-lg</M>
        <Live token="--space-inline-lg" />
      </div>
    </div>
  </div>
);

export const ContainerRoles: Story = { name: 'Container roles', render: () => <Container /> };
