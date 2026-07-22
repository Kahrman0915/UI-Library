import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: 'Foundations/Spacing & Sizing',
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj;

const font = 'var(--font-family)';
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

// spacing scale (Tailwind-like; token key -> px)
const SPACE: [string, string][] = [
  ['0', '0'], ['0-5', '2'], ['1', '4'], ['1-5', '6'], ['2', '8'], ['2-5', '10'], ['3', '12'],
  ['3-5', '14'], ['4', '16'], ['5', '20'], ['6', '24'], ['7', '28'], ['8', '32'], ['9', '36'],
  ['10', '40'], ['11', '44'], ['12', '48'], ['14', '56'], ['16', '64'], ['20', '80'], ['24', '96'],
  ['28', '112'], ['32', '128'], ['40', '160'], ['48', '192'], ['64', '256'], ['96', '384'],
];
const RADII: [string, string][] = [
  ['sm', '2'], ['(base)', '4'], ['md', '6'], ['lg', '8'], ['xl', '12'], ['2xl', '16'], ['3xl', '24'], ['full', '9999'],
];
const BORDERS: [string, string][] = [
  ['50', '0.5'], ['100', '1'], ['200', '1.33'], ['300', '2'], ['400', '4'],
];
const MAXW: [string, string][] = [
  ['xs', '320'], ['sm', '384'], ['md', '448'], ['lg', '512'], ['xl', '576'], ['2xl', '672'],
  ['3xl', '768'], ['4xl', '896'], ['5xl', '1024'], ['6xl', '1152'], ['7xl', '1280'],
];

export const SpacingAndSizing: Story = {
  name: 'Spacing & Sizing',
  render: () => (
    <div style={{ padding: 40, maxWidth: 1000, margin: '0 auto', background: 'var(--background)', color: 'var(--foreground)', fontFamily: font }}>
      <h1 style={{ fontSize: 'var(--text-4xl)', fontWeight: 'var(--font-bold)', margin: '0 0 8px', letterSpacing: 'var(--tracking-tight)' }}>Spacing &amp; Sizing</h1>
      <P>
        One Tailwind-like scale in px. It's mirrored across three token families — <code style={{ fontFamily: mono }}>--p-*</code> (padding/gap/margin),{' '}
        <code style={{ fontFamily: mono }}>--w-*</code> (width), <code style={{ fontFamily: mono }}>--h-*</code> (height) — plus radii, border
        widths, and max-widths. Never write a raw px value; reach for a token.
      </P>

      <H2>Spacing scale <M>--p-* / --w-* / --h-*</M></H2>
      <div style={{ display: 'grid', gap: 3 }}>
        {SPACE.map(([k, px]) => (
          <div key={k} style={{ display: 'grid', gridTemplateColumns: '96px 60px 1fr', gap: 'var(--p-3)', alignItems: 'center' }}>
            <M>--p-{k}</M>
            <M>{px}px</M>
            <div style={{ height: 12, width: `var(--p-${k})`, background: 'var(--primary)', borderRadius: 'var(--rounded-sm)', minWidth: 1 }} />
          </div>
        ))}
      </div>

      <H2>Border radius <M>--rounded-*</M></H2>
      <div style={{ display: 'flex', gap: 'var(--p-4)', flexWrap: 'wrap' }}>
        {RADII.map(([k, px]) => (
          <div key={k} style={{ textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: k === '(base)' ? 'var(--rounded)' : `var(--rounded-${k})` }} />
            <div style={{ marginTop: 4 }}><M>{k}</M></div>
            <M>{px === '9999' ? 'full' : px + 'px'}</M>
          </div>
        ))}
      </div>

      <H2>Border width <M>--border-w-*</M></H2>
      <div style={{ display: 'flex', gap: 'var(--p-5)', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        {BORDERS.map(([k, px]) => (
          <div key={k} style={{ textAlign: 'center' }}>
            <div style={{ width: 80, height: 48, borderRadius: 'var(--rounded-md)', border: `var(--border-w-${k}) solid var(--foreground)` }} />
            <div style={{ marginTop: 4 }}><M>{k}</M></div>
            <M>{px}px</M>
          </div>
        ))}
      </div>

      <H2>Max width <M>--max-w-*</M></H2>
      <P>Container caps for reading measure and layout. (Screen breakpoints <code style={{ fontFamily: mono }}>--max-w-screen-*</code> also exist.)</P>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 'var(--p-2)', maxWidth: 640 }}>
        {MAXW.map(([k, px]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--border)' }}>
            <M>{k}</M><M>{px}px</M>
          </div>
        ))}
      </div>
    </div>
  ),
};
