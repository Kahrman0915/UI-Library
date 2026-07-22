import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: 'Foundations/Overview',
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj;

const font = 'var(--font-family)';
const mono = 'var(--font-family-mono)';

const H2 = ({ children }: { children: React.ReactNode }) => (
  <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', margin: '36px 0 8px', color: 'var(--foreground)' }}>
    {children}
  </h2>
);
const P = ({ children }: { children: React.ReactNode }) => (
  <p style={{ fontSize: 'var(--text-sm)', lineHeight: 1.7, color: 'var(--muted-foreground)', maxWidth: 720, margin: '0 0 12px' }}>
    {children}
  </p>
);
const C = ({ children }: { children: React.ReactNode }) => (
  <code style={{ fontFamily: mono, fontSize: '0.9em', background: 'var(--muted)', padding: '1px 5px', borderRadius: 'var(--rounded-sm)', color: 'var(--foreground)' }}>
    {children}
  </code>
);
const Pre = ({ children }: { children: string }) => (
  <pre style={{ margin: '0 0 12px', padding: 'var(--p-4)', background: 'var(--muted)', borderRadius: 'var(--rounded-md)', fontSize: 'var(--text-code)', fontFamily: mono, lineHeight: 1.6, overflow: 'auto', maxWidth: 720, color: 'var(--foreground)' }}>
    {children}
  </pre>
);
const Card = ({ children }: { children: React.ReactNode }) => (
  <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--rounded-lg)', padding: 'var(--p-4)', background: 'var(--card)' }}>{children}</div>
);

export const Overview: Story = {
  render: () => (
    <div style={{ padding: 40, maxWidth: 900, margin: '0 auto', background: 'var(--background)', color: 'var(--foreground)', fontFamily: font }}>
      <div style={{ fontFamily: mono, fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)', letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase' }}>
        @ui/lib · Foundations
      </div>
      <h1 style={{ fontSize: 'var(--text-4xl)', fontWeight: 'var(--font-bold)', margin: '4px 0 8px', letterSpacing: 'var(--tracking-tight)' }}>
        Start here
      </h1>
      <P>
        A React + SCSS component library — <strong>53 components</strong>, one shared token file, and{' '}
        <strong>zero third-party UI libraries</strong>. Every visual value comes from a design token; every
        component follows the same predictable API. This page is the whole system in one read; the other
        Foundations pages go deep on each layer.
      </P>

      <H2>What it is (and isn't)</H2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--p-3)', maxWidth: 720 }}>
        <Card>
          <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', marginBottom: 6 }}>✓ It is</div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 'var(--text-sm)', lineHeight: 1.7, color: 'var(--muted-foreground)' }}>
            <li>Vanilla <strong>SCSS</strong> in <C>.scss</C> files + <strong>React</strong></li>
            <li>Class names in <strong>BEM</strong> under a <C>ui-</C> prefix</li>
            <li>Driven entirely by tokens in <C>tokens.scss</C></li>
            <li>Accessible by default (WCAG AA, guardrailed)</li>
          </ul>
        </Card>
        <Card>
          <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', marginBottom: 6 }}>✗ It isn't</div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 'var(--text-sm)', lineHeight: 1.7, color: 'var(--muted-foreground)' }}>
            <li>No Tailwind, no CSS-in-JS</li>
            <li>No Radix, cva, clsx, or Framer Motion</li>
            <li>No CSS Modules — global BEM classes</li>
            <li>Only runtime dep: <C>lucide-react</C> (icons)</li>
          </ul>
        </Card>
      </div>

      <H2>Install &amp; import</H2>
      <P>Two imports: the compiled stylesheet (required) and, optionally, the self-hosted fonts.</P>
      <Pre>{`import '@ui/lib/styles.css';   // required — tokens + all component CSS
import '@ui/lib/fonts.css';    // optional — self-hosted Inter + JetBrains Mono

import { Button, Card, Dialog } from '@ui/lib';`}</Pre>

      <H2>Every component works the same way</H2>
      <P>
        Learn the API once and it holds across all 53. Each component takes a required{' '}
        <C>id</C> (it seeds child IDs like <C>{'${id}-error'}</C> so ARIA wires up cleanly), forwards its{' '}
        <C>ref</C>, merges a <C>className</C>, and spreads the remaining HTML props through.
      </P>
      <Pre>{`<Button
  id="save"              // required — seeds child ids, aria relationships
  variant="default"      // 6 variants × 5 styles × 4 sizes
  style="secondary"
  IconLeft={Save}
  onClick={…}
  className="my-override" // merged, never clobbered
/>`}</Pre>

      <H2>The three axes of theming</H2>
      <P>
        Colour moves on three <em>independent</em>, attribute-driven axes that compose freely. Full detail
        (and live demos) live in <strong>Foundations → Themes</strong>.
      </P>
      <div style={{ display: 'grid', gap: 'var(--p-2)', maxWidth: 720 }}>
        {[
          ['1 · Mode', <><C>data-mode="light|dark"</C> on <C>&lt;html&gt;</C> — flips every colour. The <C>ModeToggler</C> owns it.</>],
          ['2 · Theme', <><C>data-theme="{'{code}'}"</C> on any subtree — remaps just <C>--primary</C> to a sub-brand hue (8 codes). Absence = the neutral main brand.</>],
          ['3 · Surface', <><C>data-surface="aiden"</C> — the AI surface, a violet gradient identity that layers <em>inside</em> any brand.</>],
        ].map(([k, v]) => (
          <div key={k as string} style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: 'var(--p-3)', alignItems: 'baseline', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontFamily: mono, fontSize: 'var(--text-xs)', fontWeight: 'var(--font-semibold)', color: 'var(--foreground)' }}>{k}</div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)', lineHeight: 1.6 }}>{v}</div>
          </div>
        ))}
      </div>

      <H2>Two token layers</H2>
      <P>
        <strong>Primitives</strong> are the raw scales — spacing, sizing, radii, the type ramp, motion.{' '}
        <strong>Semantic</strong> tokens are the colours that move on the three axes (<C>--background</C>,{' '}
        <C>--primary</C>, <C>--error</C>…), each paired with a <C>-foreground</C> for text on it. See{' '}
        <strong>Typography</strong>, <strong>Spacing &amp; Sizing</strong>, <strong>Motion</strong>, and{' '}
        <strong>Tokens</strong> (colour).
      </P>

      <H2>Accessibility is built in</H2>
      <P>
        Every text-on-surface pairing the components use clears <strong>WCAG AA</strong>, enforced by a
        contrast script (<C>npm run test:contrast</C>) that fails CI below 4.5:1. Where a themed colour is
        used as <em>text</em> on a tint, a nudged <C>-text</C> token keeps it legible; reduced-motion is
        honoured globally.
      </P>

      <H2>Where to go next</H2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 'var(--p-3)', maxWidth: 720 }}>
        {[
          ['Typography', 'The type ramp, weights, leading, tracking.'],
          ['Spacing & Sizing', 'The spacing scale, radii, borders, max-widths.'],
          ['Motion', 'Durations, easings, reduced-motion.'],
          ['Tokens', 'The colour system + live contrast pairings.'],
          ['Themes', 'The three axes in depth + the Aiden surface.'],
          ['Components', '53 components, each with stories.'],
        ].map(([t, d]) => (
          <Card key={t as string}>
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--foreground)' }}>{t}</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)', marginTop: 3, lineHeight: 1.5 }}>{d}</div>
          </Card>
        ))}
      </div>
    </div>
  ),
};
