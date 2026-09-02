import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import type { UiDocsParameters } from '../../types/DocsTypes';
import Button from '../../components/Button';
import Skeleton from '../../components/Skeleton';

// Skeleton → content reveal: toggle to watch real content materialize (fade +
// rise via .ui-reveal) instead of hard-swapping in.
function RevealDemo() {
  const [loaded, setLoaded] = useState(false);
  return (
    <div style={{ display: 'grid', gap: 12, maxWidth: 360 }}>
      <Button
        id="reveal-toggle"
        label={loaded ? 'Reset to skeleton' : 'Load content'}
        size="sm"
        style="outline"
        onClick={() => setLoaded((l) => !l)}
      />
      {loaded ? (
        <div
          className="ui-reveal"
          style={{
            display: 'grid',
            gap: 6,
            padding: 16,
            background: 'var(--card)',
            border: 'var(--border-w-100) solid var(--border)',
            borderRadius: 'var(--rounded-lg)',
          }}
        >
          <strong style={{ fontSize: 'var(--text-sm)' }}>Monthly revenue</strong>
          <span style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)' }}>$48,210</span>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>+12.4% vs last month</span>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 8, padding: 16, border: 'var(--border-w-100) solid var(--border)', borderRadius: 'var(--rounded-lg)' }}>
          <Skeleton shape="text" style={{ width: '40%' }} />
          <Skeleton style={{ width: '60%', height: 28 }} />
          <Skeleton shape="text" style={{ width: '50%' }} />
        </div>
      )}
    </div>
  );
}

const meta: Meta = {
  title: 'Foundations/Motion',
  parameters: {
    layout: 'fullscreen',
    ui: {
      description:
        'Durations, easings and the motion patterns built on them. Every transition in the library reads from these tokens, so timing stays consistent and `prefers-reduced-motion` can collapse all of it in one place.',
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
    <>
      <style>{`
        @keyframes ui-fnd-run { 0%,15% { transform: translateX(0) } 85%,100% { transform: translateX(var(--run,220px)) } }
      `}</style>
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
          <code style={{ fontFamily: mono }}>--ease-premium</code> is the house easing
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
        Hover, then <strong>press and hold</strong> each button below. Every touchable state change eases on{' '}
        <code style={{ fontFamily: mono }}>--ease-premium</code> rather than snapping, and pressing scales the button to{' '}
        <code style={{ fontFamily: mono }}>0.97</code> for a tactile "pushed" feel. Focus one with the keyboard (Tab) to watch the
        ring settle in rather than blink. Button is the base the rest of this page builds on — the most-touched component in the
        system is where considered motion pays off most.
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
        The whole effect is two token references and a <M>:active</M> rule on <M>.ui-button</M> — no dependency, no JavaScript.
        Under <M>prefers-reduced-motion</M> the press state still applies, instantly, without the easing.
      </P>
      <P>
        The same <M>:active</M> press applies to every pressable control — <strong>Button, Chip, Toggle / ToggleGroup, Fab,
        and every icon button</strong> (CloseButton, Attachment actions, Chat composer tools) scale to{' '}
        <code style={{ fontFamily: mono }}>--motion-scale-press</code> (0.97); interactive <strong>Card</strong> uses the gentler{' '}
        <code style={{ fontFamily: mono }}>--motion-scale-press-subtle</code> (0.99), since a big surface at 0.97 would move too much.
        Try pressing a Chip or a Toggle — the pill physically depresses.
      </P>

      <H2>Shared-element motion — Tabs</H2>
      <P>
        The active-tab pill is a single <M>.ui-tabs__indicator</M> that <strong>slides</strong> between triggers rather than
        cross-fading two separate pills. It's positioned imperatively from the active trigger's offset box (behind the triggers, so
        their transparent background shows it through), transitions <M>transform</M> + <M>width</M> + <M>height</M> on{' '}
        <code style={{ fontFamily: mono }}>--ease-premium</code>, and works in both orientations. First paint lands instantly (no
        slide-in from the edge); a <M>ResizeObserver</M> re-measures on reflow without sliding. <strong>Open Tabs and click between
        them</strong> to watch the pill travel — the signature "expensive" continuity move.
      </P>

      <H2>Staggered lists</H2>
      <P>
        Rows rise + fade in one after another (<code style={{ fontFamily: mono }}>--stagger-step</code>, 25ms apart) so a list reads
        as one orchestrated motion. <strong>AttachmentGroup</strong> carries <M>.ui-stagger</M> by default;{' '}
        <strong>ItemGroup</strong> takes it as an <strong>opt-in</strong> — pass <M>className="ui-stagger"</M> — because a settings
        list or a bulleted list is read rather than watched, and an entrance it cannot refuse is wrong there. Pure CSS via{' '}
        <M>:nth-child</M> — the first 12 rows stagger, the rest just appear (a long list shouldn't cascade for seconds), and it plays
        once on mount. Reload an Attachment list story to watch it. The utility is reusable — add <M>.ui-stagger</M> to any
        container.
      </P>
      <P>
        <strong>Deliberately not staggered:</strong> menu items (the surface already scales + fades in from{' '}
        <a href="#">Overlay entrances</a> — cascading items inside a scaling surface reads busy and makes menus feel <em>slower</em>,
        which is the opposite of premium) and Toast stacks (toasts arrive asynchronously, so each animates in on its own).
      </P>

      <H2>Exit &amp; reveal</H2>
      <P>
        <strong>Toast</strong> animates <em>out</em> as well as in: dismissing one flags it{' '}
        <M>ui-toast--leaving</M>, the Toaster keeps it mounted ~260ms to play a fade + shrink exit, then removes it (mirrors the
        Dialog / Drawer close machine; <M>onDismiss</M> still fires once). Fire and dismiss a toast to see it recede rather than
        vanish.
      </P>
      <P>
        <strong>Skeleton → content:</strong> when real content replaces a skeleton, wrap it in <M>.ui-reveal</M> and it materializes
        (fade + rise) instead of hard-swapping. Toggle below:
      </P>
      <div style={{ marginTop: 16 }}>
        <RevealDemo />
      </div>
      <P>
        A true overlapping crossfade (skeleton fading out <em>under</em> content) needs both mounted at once — a wrapper component,
        i.e. an API decision — so this reveal is the tasteful dependency-free 90%.
      </P>

      <H2>Overlay entrances</H2>
      <P>
        Every floating surface shares one entrance choreography (
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
        <strong>Exit:</strong> every overlay animates <em>out</em> as well as in. A shared{' '}
        <M>usePresence</M> hook runs the <code style={{ fontFamily: mono }}>closed → open → closing</code> machine — the surface
        stays mounted through the close to play its exit (positioned menus reverse their enter via <M>.ui-overlay-exit</M>; Dialog /
        Command scale down while the backdrop clears), then unmounts on <M>animationend</M> (with a duration timer as the
        reduced-motion / backgrounded-tab safety net); focus still returns to the trigger. <strong>Popover, DropdownMenu, Menubar,
        Select, Combobox, ContextMenu, Dialog, Command, and Drawer</strong> all animate both directions now. Drawer's entrance was
        harmonized onto <code style={{ fontFamily: mono }}>--ease-premium</code> (its exit keeps <M>--ease-in</M> — a big panel reads
        better accelerating away).
      </P>

      <H2>Reduced motion</H2>
      <P>
        The library honours <code style={{ fontFamily: mono }}>prefers-reduced-motion: reduce</code> globally — all durations
        collapse to ~0 (near-instant, not <code style={{ fontFamily: mono }}>none</code>, so exit-animation state machines
        still fire). <strong>Spinner is the one exception</strong> — a functional status indicator that keeps spinning.
        Turn the preference on in your OS to see this page's demos go still.
      </P>
    </>
  ),
};
