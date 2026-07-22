import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: 'Foundations/Motion',
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

const DUR: [string, string, string][] = [
  ['--duration-fast', '100ms', 'quick micro-interactions'],
  ['--duration-instant', '150ms', 'hover colour shifts'],
  ['--duration-normal', '200ms', 'default UI transitions'],
  ['--duration-slow', '300ms', 'larger surfaces'],
  ['--duration-reveal', '500ms', 'view-transition reveal (ModeToggler)'],
  ['--duration-ripple', '600ms', 'Button ripple expand'],
  ['--duration-spin', '900ms', 'Spinner rotation (loop)'],
  ['--duration-shimmer', '1400ms', 'Skeleton / Progress shimmer (loop)'],
];
const EASE: [string, string][] = [
  ['--ease-linear', 'linear'],
  ['--ease-default', 'ease'],
  ['--ease-in', 'ease-in'],
  ['--ease-out', 'ease-out'],
  ['--ease-in-out', 'ease-in-out'],
  ['--ease-spring', 'cubic-bezier(.16,1,.3,1) — smooth, no overshoot'],
  ['--ease-spring-strong', 'cubic-bezier(.34,1.56,.64,1) — pop / overshoot'],
];

export const Motion: Story = {
  render: () => (
    <div style={{ padding: 40, maxWidth: 1000, margin: '0 auto', background: 'var(--background)', color: 'var(--foreground)', fontFamily: font }}>
      <style>{`
        @keyframes ui-fnd-run { 0%,15% { transform: translateX(0) } 85%,100% { transform: translateX(var(--run,220px)) } }
      `}</style>
      <h1 style={{ fontSize: 'var(--text-4xl)', fontWeight: 'var(--font-bold)', margin: '0 0 8px', letterSpacing: 'var(--tracking-tight)' }}>Motion</h1>
      <P>
        Two token families: <code style={{ fontFamily: mono }}>--duration-*</code> (how long) and{' '}
        <code style={{ fontFamily: mono }}>--ease-*</code> (the curve). Plus <code style={{ fontFamily: mono }}>--motion-slide-sm/md/lg</code>{' '}
        (4/8/12px enter-exit travel) and <code style={{ fontFamily: mono }}>--motion-scale-in</code> (0.97 pop-in). Reach for a token,
        never a raw ms/curve.
      </P>

      <H2>Durations</H2>
      <P>Each dot below runs the same distance at its duration — longer bars = slower. (Constant easing.)</P>
      <div style={{ display: 'grid', gap: 6 }}>
        {DUR.map(([tok, ms, use]) => (
          <div key={tok} style={{ display: 'grid', gridTemplateColumns: '190px 64px 210px 1fr', gap: 'var(--p-3)', alignItems: 'center' }}>
            <M>{tok}</M>
            <M>{ms}</M>
            <M>{use}</M>
            <div style={{ position: 'relative', height: 16 }}>
              <div style={{ width: 16, height: 16, borderRadius: 'var(--rounded-full)', background: 'var(--primary)', animation: `ui-fnd-run var(${tok}) var(--ease-in-out) infinite alternate` }} />
            </div>
          </div>
        ))}
      </div>

      <H2>Easings</H2>
      <P>Same duration (600ms), different curve — watch the acceleration. Spring-strong overshoots and settles back.</P>
      <div style={{ display: 'grid', gap: 6 }}>
        {EASE.map(([tok, desc]) => (
          <div key={tok} style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 'var(--p-3)', alignItems: 'center' }}>
            <div><M>{tok}</M></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2 }}>
              <div style={{ position: 'relative', height: 16 }}>
                <div style={{ width: 16, height: 16, borderRadius: 'var(--rounded-full)', background: 'var(--primary)', animation: `ui-fnd-run 600ms var(${tok}) infinite alternate` }} />
              </div>
              <M>{desc}</M>
            </div>
          </div>
        ))}
      </div>

      <H2>Reduced motion</H2>
      <P>
        The library honours <code style={{ fontFamily: mono }}>prefers-reduced-motion: reduce</code> globally — all durations
        collapse to ~0 (near-instant, not <code style={{ fontFamily: mono }}>none</code>, so exit-animation state machines
        still fire). <strong>Spinner is the one exception</strong> — a functional status indicator that keeps spinning.
        Turn the preference on in your OS to see this page's demos go still.
      </P>
    </div>
  ),
};
