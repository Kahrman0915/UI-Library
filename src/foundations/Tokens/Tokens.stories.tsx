import { useEffect, useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: 'Foundations/Tokens',
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj;

// ── Contrast helpers (computed live from the resolved token values) ───────────
function parse(v: string): [number, number, number, number] | null {
  v = v.trim();
  if (v.startsWith('#')) {
    const h = v.slice(1);
    const hh = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
    const n = parseInt(hh, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 1];
  }
  const m = v.match(/rgba?\(([^)]+)\)/);
  if (m) {
    const p = m[1].split(',').map((s) => parseFloat(s));
    return [p[0], p[1], p[2], p[3] === undefined ? 1 : p[3]];
  }
  return null; // color-mix / gradient — not directly parseable
}
const lin = (c: number) => {
  c /= 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
};
const lum = ([r, g, b]: number[]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
function contrast(fgVar: string, bgVar: string): number | null {
  const root = getComputedStyle(document.documentElement);
  const fg = parse(root.getPropertyValue(fgVar));
  const bg = parse(root.getPropertyValue(bgVar));
  if (!fg || !bg) return null;
  const bgRgb: [number, number, number, number] = [bg[0], bg[1], bg[2], 1];
  // composite fg over bg if translucent
  const f: number[] =
    fg[3] >= 1
      ? [fg[0], fg[1], fg[2]]
      : [0, 1, 2].map((i) => fg[i] * fg[3] + bgRgb[i] * (1 - fg[3]));
  const l1 = lum(f);
  const l2 = lum([bg[0], bg[1], bg[2]]);
  const hi = Math.max(l1, l2);
  const lo = Math.min(l1, l2);
  return Math.round(((hi + 0.05) / (lo + 0.05)) * 100) / 100;
}
function resolve(varName: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
}

const font = 'var(--font-family)';
const mono = 'var(--font-family-mono)';

function Swatch({ token, use }: { token: string; use: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [val, setVal] = useState('');
  useEffect(() => setVal(resolve(`--${token}`)), []);
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '6px 0' }}>
      <div
        ref={ref}
        style={{
          width: 44,
          height: 44,
          flexShrink: 0,
          borderRadius: 'var(--rounded-md)',
          background: `var(--${token})`,
          border: '1px solid var(--border)',
        }}
      />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: mono, fontSize: 13, color: 'var(--foreground)' }}>
          --{token}
        </div>
        <div style={{ fontFamily: mono, fontSize: 11, color: 'var(--muted-foreground)' }}>
          {val || '…'}
        </div>
        <div style={{ fontFamily: font, fontSize: 13, color: 'var(--muted-foreground)', marginTop: 2 }}>
          {use}
        </div>
      </div>
    </div>
  );
}

function Group({ title, tokens }: { title: string; tokens: [string, string][] }) {
  return (
    <section style={{ marginBottom: 28 }}>
      <h3 style={{ margin: '0 0 6px', fontFamily: font, fontSize: 15, fontWeight: 600, color: 'var(--foreground)' }}>
        {title}
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '4px 24px' }}>
        {tokens.map(([t, u]) => (
          <Swatch key={t} token={t} use={u} />
        ))}
      </div>
    </section>
  );
}

const PAIRS: [string, string][] = [
  ['--foreground', '--background'],
  ['--muted-foreground', '--background'],
  ['--muted-foreground', '--card'],
  ['--foreground', '--muted'],
  ['--muted-foreground', '--muted'],
  ['--muted-foreground', '--secondary'],
  ['--muted-foreground', '--popover'],
  ['--accent-foreground', '--accent'],
  ['--primary-foreground', '--primary'],
  ['--error-foreground', '--error'],
  ['--success-foreground', '--success'],
  ['--warning-foreground', '--warning'],
  ['--info-foreground', '--info'],
];

function PairingsTable() {
  const [rows, setRows] = useState<{ pair: string; ratio: number | null }[]>([]);
  useEffect(() => {
    setRows(PAIRS.map(([fg, bg]) => ({ pair: `${fg} on ${bg}`, ratio: contrast(fg, bg) })));
  }, []);
  const badge = (r: number | null) => {
    if (r == null) return { label: '—', bg: 'var(--muted)', fg: 'var(--muted-foreground)' };
    if (r < 4.5) return { label: `${r} · FAILS AA`, bg: 'var(--error-light)', fg: 'var(--error)' };
    if (r < 7) return { label: `${r} · AA`, bg: 'var(--warning-light)', fg: 'var(--warning)' };
    return { label: `${r} · AAA`, bg: 'var(--success-light)', fg: 'var(--success)' };
  };
  return (
    <table style={{ borderCollapse: 'collapse', fontFamily: mono, fontSize: 12, width: '100%', maxWidth: 620 }}>
      <tbody>
        {rows.map(({ pair, ratio }) => {
          const b = badge(ratio);
          return (
            <tr key={pair} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '6px 12px 6px 0', color: 'var(--foreground)', whiteSpace: 'nowrap' }}>{pair}</td>
              <td style={{ padding: '6px 0', textAlign: 'right' }}>
                <span style={{ background: b.bg, color: b.fg, padding: '2px 8px', borderRadius: 'var(--rounded-full)', fontSize: 11, whiteSpace: 'nowrap' }}>
                  {b.label}
                </span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export const Tokens: Story = {
  render: () => (
    <div
      style={{
        padding: 40,
        maxWidth: 1100,
        margin: '0 auto',
        background: 'var(--background)',
        color: 'var(--foreground)',
        fontFamily: font,
      }}
    >
      <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>Design tokens</h1>
      <p style={{ maxWidth: 720, lineHeight: 1.6, color: 'var(--muted-foreground)', fontSize: 14 }}>
        Three layers: <strong>Primitives</strong> (raw scales — spacing, radii, type),{' '}
        <strong>Mode</strong> (semantic colours that flip on <code>data-mode</code> light/dark),
        and <strong>Theme</strong> (only <code>--primary</code> and its family, remapped by{' '}
        <code>data-theme</code>). Toggle the <em>Mode</em> and <em>Theme</em> toolbar controls to
        see everything below re-resolve. Colours use shadcn's <code>surface / surface-foreground</code>{' '}
        naming — a base token sets the surface, the <code>-foreground</code> token sets text/icons on it.
      </p>

      <Group
        title="Surfaces — resting backgrounds"
        tokens={[
          ['background', 'The page base. Everything sits on this.'],
          ['card', 'Raised in-flow surfaces: Card, Dialog panel.'],
          ['popover', 'Floating overlays: Popover, Dropdown, Select, Combobox, Toast.'],
          ['muted', 'Quiet resting surfaces: Skeleton, Switch track, Kbd, inline Code, Alert/Banner default.'],
          ['secondary', 'The filled secondary Button surface.'],
          ['sidebar', 'Sidebar chrome. Neutral — never remapped by a theme.'],
        ]}
      />

      <Group
        title="Accent — interaction state (NOT a resting surface)"
        tokens={[
          ['accent', 'Hover / active / highlight for interactive elements: ghost-button hover, menu-item hover, Toggle pressed. Applied on elements that are transparent at rest.'],
          ['accent-foreground', 'Text/icon shown on the accent hover surface.'],
        ]}
      />

      <Group
        title="Text"
        tokens={[
          ['foreground', 'Primary text + icons. Readable on every surface (≥10:1).'],
          ['muted-foreground', 'De-emphasized text: captions, descriptions, placeholders. Tuned for --background / --card; drops toward the AA floor on darker surfaces (see pairings).'],
        ]}
      />

      <Group
        title="Borders & focus"
        tokens={[
          ['border', 'Default hairline borders and dividers.'],
          ['input', 'Form-control borders (Input, Select, Textarea).'],
          ['ring', 'Resting ring on some controls.'],
          ['focus', 'The 3px focus-visible ring (--focus-ring-width).'],
        ]}
      />

      <Group
        title="Primary — the themed accent (follows data-theme)"
        tokens={[
          ['primary', 'The theme colour: solid CTA fill, checked controls, active states. Slate on the main brand; a sub-brand hue under data-theme.'],
          ['primary-foreground', 'Text/icons on the solid --primary fill.'],
          ['primary-light', '6% tint — subtle themed surfaces.'],
          ['primary-soft', '8% (light) / 10% (dark) tint — the filled secondary button.'],
          ['primary-border', '40% — themed borders.'],
          ['primary-hover', 'Darker/lighter blend for hover.'],
        ]}
      />

      <Group
        title="Semantic status (each: base + foreground + light / soft / border / hover / ring / focus)"
        tokens={[
          ['error', 'Destructive / error. base = solid fill + text; -light backs Alerts; -border, -hover, -ring, -focus derived.'],
          ['success', 'Positive confirmation.'],
          ['warning', 'Caution.'],
          ['info', 'Neutral-informational.'],
        ]}
      />

      <section style={{ marginBottom: 28 }}>
        <h3 style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 600 }}>Also in the system</h3>
        <p style={{ maxWidth: 720, fontSize: 13, color: 'var(--muted-foreground)', lineHeight: 1.6 }}>
          <strong>Category</strong> (17 hues × base/-bg/-hover) for tags & charts · <strong>Chart</strong>{' '}
          (1–5, a neutral ramp) · <strong>Code-block</strong> syntax colours · <strong>Tooltip</strong>{' '}
          (inverse slate, never themed) · <strong>Aiden</strong> (the AI gradient).
        </p>
      </section>

      <section>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: '8px 0 4px' }}>Pairings & contrast</h2>
        <p style={{ maxWidth: 720, fontSize: 14, color: 'var(--muted-foreground)', lineHeight: 1.6 }}>
          Live WCAG ratios for the text-on-surface combinations the components actually use. Everything
          clears <strong>AA</strong> (4.5:1). The <strong>AA-but-not-AAA</strong> band is where{' '}
          <code>--muted-foreground</code> sits on a darker surface, and where{' '}
          <code>-foreground</code> sits on a solid semantic fill.
        </p>
        <PairingsTable />
      </section>

      <section style={{ marginTop: 28, maxWidth: 720 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 8px' }}>Usage rules</h2>
        <ul style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--foreground)', paddingLeft: 20 }}>
          <li><strong>Pair a surface with its <code>-foreground</code>.</strong> Put <code>--card-foreground</code> on <code>--card</code>, <code>--primary-foreground</code> on <code>--primary</code>, etc.</li>
          <li><strong><code>--muted-foreground</code> is for text on <code>--background</code> / <code>--card</code></strong> (AAA there). On <code>--muted</code> it's only ~5:1 — fine for AA, but prefer <code>--foreground</code> for anything that must be effortless to read.</li>
          <li><strong>Never use <code>--accent</code> as a resting surface.</strong> It means "hovered." Use <code>--muted</code> / <code>--secondary</code> / <code>--card</code> for resting content.</li>
          <li><strong>Semantic <code>-foreground</code> on the solid base is tuned to AA (~5:1), not AAA</strong> — deliberate, so the hues stay vivid. Use the <code>-light</code> tint + coloured text for higher-contrast informational surfaces (Alerts do this).</li>
        </ul>
      </section>
    </div>
  ),
};
