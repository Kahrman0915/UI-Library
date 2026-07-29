import type { Meta, StoryObj } from '@storybook/react';
import type { UiDocsParameters } from '../../types/DocsTypes';

const meta: Meta = {
  title: 'Foundations/Typography',
  parameters: {
    layout: 'fullscreen',
    ui: {
      description:
        'The type ramp, weights and leading — one scale for the whole system. Every size, weight and line-height is a token; never write a raw `px` value.',
    } satisfies UiDocsParameters,
  },
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
const Meta_ = ({ children }: { children: React.ReactNode }) => (
  <span style={{ fontFamily: mono, fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>{children}</span>
);

// [token, px, sampleLabel]
const SIZES: [string, string][] = [
  ['--text-9xl', '128'], ['--text-8xl', '96'], ['--text-7xl', '72'], ['--text-6xl', '60'],
  ['--text-5xl', '48'], ['--text-4xl', '36'], ['--text-3xl', '30'], ['--text-2xl', '24'],
  ['--text-xl', '20'], ['--text-lg', '18'], ['--text-base', '16'], ['--text-sm', '14'],
  ['--text-code', '13'], ['--text-xs', '12'],
];
const WEIGHTS: [string, string][] = [
  ['--font-thin', '100'], ['--font-extralight', '200'], ['--font-light', '300'],
  ['--font-normal', '400'], ['--font-medium', '500'], ['--font-semibold', '600'],
  ['--font-bold', '700'], ['--font-extrabold', '800'], ['--font-black', '900'],
];
const LEADING: [string, string][] = [
  ['--leading-3', '12'], ['--leading-3-5', '14'], ['--leading-4', '16'], ['--leading-5', '20'],
  ['--leading-6', '24'], ['--leading-7', '28'], ['--leading-8', '32'], ['--leading-9', '36'],
  ['--leading-10', '40'], ['--leading-11', '44'],
];
const TRACKING: [string, string][] = [
  ['--tracking-tighter', '-0.05em'], ['--tracking-tight', '-0.025em'], ['--tracking-normal', '0'],
  ['--tracking-wide', '0.025em'], ['--tracking-wider', '0.05em'], ['--tracking-widest', '0.1em'],
];

export const Typography: Story = {
  render: () => (
    <>
      <P>
        Two families: <strong>Inter</strong> (<code style={{ fontFamily: mono }}>--font-family</code>) for
        everything, and <strong>JetBrains Mono</strong> (<code style={{ fontFamily: mono }}>--font-family-mono</code>)
        for code &amp; numeric labels. In Figma these map to the <code style={{ fontFamily: mono }}>size/weight</code>{' '}
        text styles. Never hardcode a size — use a <code style={{ fontFamily: mono }}>--text-*</code> token.
      </P>

      <div style={{ display: 'flex', gap: 'var(--p-4)', flexWrap: 'wrap', marginBottom: 8 }}>
        <div style={{ flex: '1 1 300px', border: '1px solid var(--border)', borderRadius: 'var(--rounded-lg)', padding: 'var(--p-4)' }}>
          <div style={{ fontFamily: font, fontSize: 40, fontWeight: 600 }}>Inter</div>
          <Meta_>--font-family · body, UI, headings</Meta_>
        </div>
        <div style={{ flex: '1 1 300px', border: '1px solid var(--border)', borderRadius: 'var(--rounded-lg)', padding: 'var(--p-4)' }}>
          <div style={{ fontFamily: mono, fontSize: 40, fontWeight: 600 }}>JetBrains</div>
          <Meta_>--font-family-mono · code, keycaps, values</Meta_>
        </div>
      </div>

      <H2>Type scale</H2>
      <P>14 steps, <code style={{ fontFamily: mono }}>--text-xs</code> (12px) → <code style={{ fontFamily: mono }}>--text-9xl</code> (128px), rendered live.</P>
      <div style={{ display: 'grid', gap: 4 }}>
        {SIZES.map(([tok, px]) => (
          <div key={tok} style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 'var(--p-4)', alignItems: 'baseline', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
            <div style={{ paddingTop: 6 }}><Meta_>{tok.replace('--text-', '')} · {px}px</Meta_></div>
            <div style={{ fontSize: `var(${tok})`, fontWeight: 600, lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: tok === '--text-code' ? mono : font }}>
              The spectral wolf jumps
            </div>
          </div>
        ))}
      </div>

      <H2>Weights</H2>
      <P>Inter ships 100–900. Body/label/heading text uses 400 / 500 / 600 most.</P>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 'var(--p-2)' }}>
        {WEIGHTS.map(([tok, w]) => (
          <div key={tok} style={{ padding: '8px 0' }}>
            <div style={{ fontSize: 'var(--text-2xl)', fontWeight: `var(${tok})` as unknown as number }}>Ag</div>
            <Meta_>{tok.replace('--font-', '')} · {w}</Meta_>
          </div>
        ))}
      </div>

      <H2>Line height &amp; tracking</H2>
      <P>Line-height (<code style={{ fontFamily: mono }}>--leading-*</code>) is a px scale; letter-spacing (<code style={{ fontFamily: mono }}>--tracking-*</code>) is em-relative. Pair a size with a leading of equal-or-greater value.</P>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--p-6)', maxWidth: 720 }}>
        <div>
          <div style={{ fontFamily: mono, fontSize: 'var(--text-xs)', fontWeight: 600, marginBottom: 6, color: 'var(--foreground)' }}>Leading</div>
          {LEADING.map(([tok, px]) => (
            <div key={tok} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid var(--border)' }}>
              <Meta_>{tok.replace('--leading-', '')}</Meta_><Meta_>{px}px</Meta_>
            </div>
          ))}
        </div>
        <div>
          <div style={{ fontFamily: mono, fontSize: 'var(--text-xs)', fontWeight: 600, marginBottom: 6, color: 'var(--foreground)' }}>Tracking</div>
          {TRACKING.map(([tok, em]) => (
            <div key={tok} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 'var(--text-sm)', letterSpacing: `var(${tok})` }}>{tok.replace('--tracking-', '')}</span><Meta_>{em}</Meta_>
            </div>
          ))}
        </div>
      </div>
    </>
  ),
};
