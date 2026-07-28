import type { Meta, StoryObj } from '@storybook/react';
import Button from '../../components/Button';

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
  ['--duration-entrance', '220ms', 'overlay entrances (dialog/menu/popover)'],
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
  ['--ease-premium', 'cubic-bezier(.32,.72,0,1) — signature: interactive state changes'],
  ['--ease-entrance', 'cubic-bezier(.34,1.35,.5,1) — surfaces landing (gentle overshoot)'],
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
      <P>
        Same duration (600ms), different curve — watch the acceleration. Spring-strong overshoots and settles back.{' '}
        <strong>
          <code style={{ fontFamily: mono }}>--ease-premium</code> is now the house easing
        </strong>{' '}
        for interactive state changes — hover, focus, press, toggle, and disclosure across the whole library read on it instead of
        bare <code style={{ fontFamily: mono }}>ease-out</code>. Only continuous loops (spinner, shimmer, pulses), the ripple, the
        Progress fill and Drawer's slide keep <code style={{ fontFamily: mono }}>--ease-out</code>.
      </P>
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

      <H2>Interactive feel — Button</H2>
      <P>
        Hover, then <strong>press and hold</strong> each button below. Every touchable state change now eases on{' '}
        <code style={{ fontFamily: mono }}>--ease-premium</code> instead of snapping, and pressing scales the button to{' '}
        <code style={{ fontFamily: mono }}>0.97</code> for a tactile "pushed" feel. Focus one with the keyboard (Tab) to watch the
        ring settle in rather than blink. This is the foundation the rest of the motion work layers on — the most-touched
        component in the system should feel considered.
      </P>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--p-3)', alignItems: 'center' }}>
        <Button id="mo-1" label="Primary" />
        <Button id="mo-2" label="Secondary" style="secondary" />
        <Button id="mo-3" label="Outline" style="outline" />
        <Button id="mo-4" label="Ghost" style="ghost" />
        <Button id="mo-5" label="Destructive" variant="error" />
        <div data-surface="aiden"><Button id="mo-6" label="Ask Aiden" /></div>
      </div>
      <P>
        <strong>Try before/after:</strong> the whole upgrade is two token references and a <M>:active</M> rule on{' '}
        <M>.ui-button</M> — no new dependency, no JS. Reduced-motion users get the press state instantly and skip the easing.
      </P>
      <P>
        The same <M>:active</M> press now lives on every pressable control — <strong>Button, Chip, Toggle / ToggleGroup, Fab,
        and every icon button</strong> (CloseButton, Attachment actions, Chat composer tools) scale to{' '}
        <code style={{ fontFamily: mono }}>--motion-scale-press</code> (0.97); interactive <strong>Card</strong> uses the gentler{' '}
        <code style={{ fontFamily: mono }}>--motion-scale-press-subtle</code> (0.99), since a big surface at 0.97 would move too much.
        Try pressing a Chip or a Toggle — the pill physically depresses.
      </P>

      <H2>Shared-element motion — Tabs</H2>
      <P>
        The active-tab pill is now a single <M>.ui-tabs__indicator</M> that <strong>slides</strong> between triggers instead of
        cross-fading two separate pills. It's positioned imperatively from the active trigger's offset box (behind the triggers, so
        their transparent background shows it through), transitions <M>transform</M> + <M>width</M> + <M>height</M> on{' '}
        <code style={{ fontFamily: mono }}>--ease-premium</code>, and works in both orientations. First paint lands instantly (no
        slide-in from the edge); a <M>ResizeObserver</M> re-measures on reflow without sliding. <strong>Open Tabs and click between
        them</strong> to watch the pill travel — the signature "expensive" continuity move.
      </P>

      <H2>Staggered lists</H2>
      <P>
        List-row families — <strong>ItemGroup and AttachmentGroup</strong> — now carry <M>.ui-stagger</M>, so their rows rise +
        fade in one after another (<code style={{ fontFamily: mono }}>--stagger-step</code>, 25ms apart) and read as one orchestrated
        motion. Pure CSS via <M>:nth-child</M> — the first 12 rows stagger, the rest just appear (a long list shouldn't cascade for
        seconds), and it plays once on mount. Reload an Item or Attachment list story to watch it. The utility is reusable — add{' '}
        <M>.ui-stagger</M> to any container.
      </P>
      <P>
        <strong>Deliberately not staggered:</strong> menu items (the surface already scales + fades in from{' '}
        <a href="#">Overlay entrances</a> — cascading items inside a scaling surface reads busy and makes menus feel <em>slower</em>,
        which is the opposite of premium) and Toast stacks (toasts arrive asynchronously, so each animates in on its own).
      </P>

      <H2>Overlay entrances</H2>
      <P>
        Every floating surface now shares one entrance choreography (
        <code style={{ fontFamily: mono }}>src/styles/overlay-entrance.scss</code>) — fade + scale from{' '}
        <code style={{ fontFamily: mono }}>--motion-scale-in</code> + a few px slide <em>from the trigger</em>, with{' '}
        <code style={{ fontFamily: mono }}>transform-origin</code> pinned toward it so the surface reads as growing out of it.
        Positioned menus (Popover, DropdownMenu, Menubar, Select, HoverCard, Combobox, ContextMenu) key off{' '}
        <M>data-side</M> and use <code style={{ fontFamily: mono }}>--ease-premium</code> (crisp, no bounce); Dialog and
        Command scale in from center with a hint of arrival (<code style={{ fontFamily: mono }}>--ease-entrance</code>) and their
        backdrop blooms. <strong>Open any of those components to feel it</strong> — this is what replaced eight surfaces that used
        to blink into existence.
      </P>
      <P>
        <strong>Exit:</strong> Dialog and Command now animate <em>out</em> too — a <code style={{ fontFamily: mono }}>closed → open → closing</code>{' '}
        state machine (mirroring Drawer) keeps the panel mounted through the close so it can scale down + fade while the backdrop
        clears, then unmounts on <M>animationend</M> (with a duration timer as the reduced-motion / backgrounded-tab safety net) and
        restores focus to the trigger. Positioned menus still exit instantly — extending the closing-state machine to them is the next pass.
      </P>

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
