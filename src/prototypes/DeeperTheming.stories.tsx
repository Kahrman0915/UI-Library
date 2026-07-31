import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Plus, Search, Sparkles } from 'lucide-react';
import {
  Alert,
  Avatar,
  AvatarGroup,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  FeaturedIcon,
  Input,
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
  Progress,
  Slider,
  StatusDot,
  Switch,
} from '../index';

/**
 * PROOF OF CONCEPT — deeper theming.
 *
 * Today a `data-theme` scope reaches 9 of the library's ~452 tokens, and all nine
 * are `--primary`. Surfaces, elevation and chrome are out of reach, which is why
 * eight sub-brands read as "the same app with a different button".
 *
 * This story asks what happens if a theme also tints the neutral SURFACES, and
 * adds one bold per-brand treatment at entry points. It is exploratory: it
 * modifies nothing. No token, no component, no existing story.
 *
 * CONTAINMENT — two mechanisms, both deliberate:
 *
 *   1. Every selector below contains `[data-theme-poc]`. That attribute appears
 *      nowhere else in the repo, so nothing outside this story can be reached.
 *   2. Mode is stamped on the SAME element, never inherited:
 *      `[data-theme-poc][data-mode='light']`. Both rules are (0,2,0) and mutually
 *      exclusive on one element, so source order decides nothing. This avoids the
 *      descendant form tokens.scss uses (`[data-mode='light'] [data-theme]`),
 *      which has a latent bug: an inner `data-mode="dark"` block inside a light
 *      page still matches the LIGHT rule, because the ancestor is light.
 */

// ─────────────────────────────────────────────────────────────────────────────
// The POC stylesheet
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Two things about `color-mix` that shaped this recipe:
 *
 * A custom property CANNOT reference itself. `--background: color-mix(…,
 * var(--background))` is a cycle: the declaration is invalid at computed-value
 * time and resolves to `unset`. So the base values below are hardcoded literals
 * copied from tokens.scss. That is fine for a POC and it is the single biggest
 * ADOPTION cost — real adoption needs a layer of raw neutral tokens
 * (`--surface-base` / `--surface-raised` / …) with the semantic tokens derived
 * from them.
 *
 * `color-mix` AVERAGES alpha. Mixing into an existing `rgba()` inflates opacity
 * (12% of an opaque colour into a 0.06 alpha yields 0.17, ~3x intended), so any
 * translucent token has to be rebuilt against `transparent`, not mixed into.
 */
const POC_CSS = `
/* Tint STOCK — the brand pre-mixed with the mode's extreme.
   Mixing raw --primary into a light surface only darkens it, and darkening a
   surface under dark text COSTS contrast. The tightest pairing in the system,
   --muted-foreground on --muted, sits at ~5.0:1. A plain 8% raw mix takes the
   nb (emerald) brand to 4.64 — one nudge off failing. Pre-mixing with white
   carries the hue but brings its own lift, which cancels most of the loss. */

[data-theme-poc][data-mode='light'] {
  --poc-tint: color-mix(in srgb, var(--primary) 45%, #ffffff);

  /* The page takes the tint. Cards do NOT — that is what makes them float.
     Light mode currently collapses background/card/popover all to #ffffff and
     separates them with a hairline alone; this gives it the elevation model
     dark mode already has. */
  --background: color-mix(in srgb, var(--poc-tint) calc(22% * var(--poc-str)), #ffffff);
  --card:    #ffffff;
  --popover: #ffffff;

  /* --accent is near-white and is the row/menu hover surface, so it takes the
     most tint — it is where the hue reads best without touching text. */
  --accent:    color-mix(in srgb, var(--poc-tint) calc(30% * var(--poc-str)), #f1f5f9);
  --secondary: color-mix(in srgb, var(--poc-tint) calc(22% * var(--poc-str)), #e2e8f0);
  --input:     color-mix(in srgb, var(--poc-tint) calc(22% * var(--poc-str)), #e2e8f0);
  /* Most conservative number in the table — --muted carries the tightest pairing. */
  --muted:     color-mix(in srgb, var(--poc-tint) calc(12% * var(--poc-str)), #cbd5e1);

  /* Borders use RAW --primary, not the stock: they are not text backgrounds so
     there is no contrast budget to protect, and the stock would wash the hue out
     exactly where it needs to be legible. */
  --border:       color-mix(in srgb, var(--primary) calc(18% * var(--poc-str)), #cbd5e1);
  --border-hover: color-mix(in srgb, var(--primary) calc(24% * var(--poc-str)), #64748b);
  --ring:         color-mix(in srgb, var(--primary) calc(30% * var(--poc-str)), #94a3b8);
}

[data-theme-poc][data-mode='dark'] {
  /* Stock anchored to the dark page, so the mix moves CHROMA without moving
     luminance — otherwise tinting would lift every surface and flatten the
     existing background -> card -> popover ramp. Dark tolerates far more tint
     (30-40% vs 12-30%) because --muted-foreground on --muted is 8.3:1 there. */
  --poc-tint: color-mix(in srgb, var(--primary) 30%, #0f172a);

  --background: color-mix(in srgb, var(--poc-tint) calc(40% * var(--poc-str)), #0f172a);
  --card:       color-mix(in srgb, var(--poc-tint) calc(35% * var(--poc-str)), #1e293b);
  --popover:    color-mix(in srgb, var(--poc-tint) calc(30% * var(--poc-str)), #475569);
  --secondary:  color-mix(in srgb, var(--poc-tint) calc(35% * var(--poc-str)), #1e293b);
  --accent:     color-mix(in srgb, var(--poc-tint) calc(35% * var(--poc-str)), #334155);
  --muted:      color-mix(in srgb, var(--poc-tint) calc(30% * var(--poc-str)), #334155);
  --input:      color-mix(in srgb, var(--poc-tint) calc(30% * var(--poc-str)), #475569);

  --border:       color-mix(in srgb, var(--primary) calc(22% * var(--poc-str)), #64748b);
  --border-hover: color-mix(in srgb, var(--primary) calc(28% * var(--poc-str)), #cbd5e1);
  --ring:         color-mix(in srgb, var(--primary) calc(30% * var(--poc-str)), #94a3b8);
}

/* ── Hero surface ───────────────────────────────────────────────────────────
   Derived from --primary, so it costs zero per-brand tokens.

   PROVABLY AA-SAFE. The obvious Aiden-style "bright open, deep close" shape
   BREAKS: lightening db (#6063f1) by 15% white gives white-text contrast 3.56:1,
   a hard fail — db was darkened specifically to clear 4.5 and has no headroom.
   Aiden survives only because its three stops were hand-tuned over several
   rounds; doing that eight times is the namespace explosion we are avoiding.

   Instead every stop lies on the segment --primary -> --foreground.
   --primary-foreground is by construction the OPPOSITE pole to --foreground, so
   moving along that segment changes every channel monotonically and contrast
   against the label only ever INCREASES. If the label clears AA on --primary
   (already audited — all eight do), it clears at every stop, both modes, every
   brand. No measurement required. It is also a direct extension of the system's
   own idiom: --primary-hover is color-mix(… 85%, var(--foreground)). */
[data-theme-poc] {
  --poc-hero-far:   color-mix(in srgb, var(--primary) 76%, var(--foreground));
  --poc-hero:       linear-gradient(135deg, var(--primary) 0%, var(--poc-hero-far) 100%);
  --poc-hero-hover: linear-gradient(135deg, var(--primary-hover) 0%,
                      color-mix(in srgb, var(--primary) 62%, var(--foreground)) 100%);

  /* Variant B — real hue movement, the thing that makes Aiden feel like an
     identity rather than a tint. Needs CSS Color 5 relative colour syntax, which
     is a NEWER browser floor than color-mix (a deliberate decision, not a
     freebie). It is NOT provable: OKLCH lightness is not WCAG luminance, so a
     rotation at fixed l still moves contrast and every stop must be measured.
     On the main brand (neutral slate, chroma ~0) hue is undefined and it
     degrades to grey — arguably correct, worth seeing. */
  --poc-hero-b: linear-gradient(135deg,
    oklch(from var(--primary) l c calc(h - 18)) 0%,
    var(--primary) 50%,
    oklch(from var(--primary) calc(l - 0.07) c calc(h + 18)) 100%);
}

/* background-image, not background: the component's own background-color
   survives underneath as a fallback, so no modifier class needs to be known and
   the hover rule cannot fight the component's own hover (different properties,
   they layer). */
[data-theme-poc] .poc-hero-band { background-image: var(--poc-hero); }
[data-theme-poc] .poc-hero-band-b { background-image: var(--poc-hero-b); }
[data-theme-poc] .poc-hero-cta > .ui-button { background-image: var(--poc-hero); }
[data-theme-poc] .poc-hero-cta > .ui-button:hover { background-image: var(--poc-hero-hover); }
[data-theme-poc] .poc-hero-icon .ui-featured-icon { background-image: var(--poc-hero); border-color: transparent; }
`.trim();

/** Injected once. Every rule is scoped to `[data-theme-poc]`. */
function PocStyle() {
  return <style>{POC_CSS}</style>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Colour measurement
// ─────────────────────────────────────────────────────────────────────────────

/**
 * `scripts/contrast-check.mjs` cannot see any of this — it brace-matches only
 * the two `[data-mode]` blocks (excluding theme scopes deliberately), returns
 * null for `color-mix`, and treats unresolved as NOT a failure while still
 * exiting 0. So the POC measures itself.
 */

let ctx: CanvasRenderingContext2D | null = null;
/**
 * Normalise ANY CSS colour string to bytes.
 *
 * Chrome serialises a color-mix result as `color(srgb 0.37 0.38 0.94 / 0.08)`
 * and a relative-colour result as `oklch(…)`. Rather than write a parser per
 * serialisation, hand the string to a 1x1 canvas and read the pixel back —
 * bulletproof against every present and future form. `globalCompositeOperation
 * = 'copy'` keeps source alpha instead of compositing onto what was there.
 */
function toRGBA(css: string): [number, number, number, number] | null {
  if (!ctx) {
    const c = document.createElement('canvas');
    c.width = c.height = 1;
    ctx = c.getContext('2d', { willReadFrequently: true });
  }
  if (!ctx || !css) return null;
  ctx.globalCompositeOperation = 'copy';
  // An invalid fillStyle is silently IGNORED and the previous value persists,
  // so reset to a known colour first and treat "unchanged" as a parse failure.
  ctx.fillStyle = '#000000';
  ctx.fillStyle = css;
  ctx.fillRect(0, 0, 1, 1);
  const d = ctx.getImageData(0, 0, 1, 1).data;
  return [d[0], d[1], d[2], d[3] / 255];
}

const srgbToLin = (c: number) => {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};

function luminance([r, g, b]: [number, number, number, number]) {
  return 0.2126 * srgbToLin(r) + 0.7152 * srgbToLin(g) + 0.0722 * srgbToLin(b);
}

/** Composite a translucent colour over an opaque base. */
function over(
  fg: [number, number, number, number],
  bg: [number, number, number, number],
): [number, number, number, number] {
  const a = fg[3];
  return [
    fg[0] * a + bg[0] * (1 - a),
    fg[1] * a + bg[1] * (1 - a),
    fg[2] * a + bg[2] * (1 - a),
    1,
  ];
}

function contrast(
  fg: [number, number, number, number],
  bg: [number, number, number, number],
) {
  const f = luminance(fg[3] < 1 ? over(fg, bg) : fg);
  const b = luminance(bg);
  const [hi, lo] = f > b ? [f, b] : [b, f];
  return (hi + 0.05) / (lo + 0.05);
}

/** CIE L* — used for the "do cards float" delta, which is not a WCAG rule. */
function lstar(rgba: [number, number, number, number]) {
  const y = luminance(rgba);
  return y <= 216 / 24389 ? y * (24389 / 27) : Math.cbrt(y) * 116 - 16;
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared data
// ─────────────────────────────────────────────────────────────────────────────

const BRANDS = ['db', 'dc', 'dr', 'ec', 'ir', 'nb', 'ph', 'rm'] as const;
type Brand = (typeof BRANDS)[number];

/** Ranked by how much this POC moves them. */
const PAIRINGS: { label: string; fg: string; bg: string; note?: string }[] = [
  { label: 'muted-foreground / muted', fg: '--muted-foreground', bg: '--muted', note: 'tightest in the system' },
  { label: 'muted-foreground / secondary', fg: '--muted-foreground', bg: '--secondary' },
  { label: 'foreground / background', fg: '--foreground', bg: '--background' },
  { label: 'muted-foreground / background', fg: '--muted-foreground', bg: '--background' },
  { label: 'foreground / card', fg: '--foreground', bg: '--card', note: 'must be UNCHANGED' },
  { label: 'muted-foreground / card', fg: '--muted-foreground', bg: '--card', note: 'must be UNCHANGED' },
  { label: 'accent-foreground / accent', fg: '--accent-foreground', bg: '--accent' },
  { label: 'primary-foreground / primary', fg: '--primary-foreground', bg: '--primary' },
  { label: 'primary-text / primary-soft', fg: '--primary-text', bg: '--primary-soft', note: 'over the tinted page' },
  // The semantic tints are rgba composited over --background. Tinting the page
  // silently changes every one of them, and the real gate models them as
  // "over --background" — an assumption this POC breaks.
  { label: 'error / error-light', fg: '--error', bg: '--error-light', note: 'now over a tinted page' },
  { label: 'success / success-light', fg: '--success', bg: '--success-light', note: 'now over a tinted page' },
  { label: 'warning / warning-light', fg: '--warning', bg: '--warning-light', note: 'now over a tinted page' },
  { label: 'info / info-light', fg: '--info', bg: '--info-light', note: 'now over a tinted page' },
  { label: 'muted-foreground / sidebar', fg: '--muted-foreground', bg: '--sidebar', note: 'carve-out, unchanged' },
];

/** WCAG 1.4.11 wants 3:1 for UI boundaries — borders are not text. */
const BORDER_PAIRS: { label: string; fg: string; bg: string; note?: string }[] = [
  { label: 'border / background', fg: '--border', bg: '--background' },
  { label: 'border / card', fg: '--border', bg: '--card' },
];

type Cell = { ratio: number; base: number };

/**
 * Reads real computed colours out of off-screen probe scopes.
 *
 * `getComputedStyle(el).getPropertyValue('--x')` is NOT enough — unregistered
 * custom properties compute to a substituted token stream, so it returns the
 * literal text `color-mix(in srgb, …)`. Set a REAL property and read that back,
 * so the engine has actually evaluated the mix.
 */
function useAudit(strength: number) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [rows, setRows] = useState<Record<string, Record<Brand, Cell>>>({});
  const [float, setFloat] = useState<Record<Brand, { base: number; poc: number }>>(
    {} as Record<Brand, { base: number; poc: number }>,
  );
  const [mode, setMode] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const read = (scope: HTMLElement, token: string) => {
      const probe = scope.firstElementChild as HTMLElement;
      probe.style.backgroundColor = '';
      probe.style.backgroundColor = `var(${token})`;
      const v = getComputedStyle(probe).backgroundColor;
      return toRGBA(v);
    };

    const next: Record<string, Record<Brand, Cell>> = {};
    const nextFloat = {} as Record<Brand, { base: number; poc: number }>;

    for (const brand of BRANDS) {
      const basescope = host.querySelector<HTMLElement>(`[data-scope="${brand}-base"]`);
      const pocScope = host.querySelector<HTMLElement>(`[data-scope="${brand}-poc"]`);
      if (!basescope || !pocScope) continue;

      for (const p of [...PAIRINGS, ...BORDER_PAIRS]) {
        const measure = (scope: HTMLElement) => {
          const fg = read(scope, p.fg);
          const bg = read(scope, p.bg);
          if (!fg || !bg) return null;
          // A translucent surface (the semantic -light tints) sits over the page.
          const page = bg[3] < 1 ? read(scope, '--background') : null;
          const solidBg = page ? over(bg, page) : bg;
          return contrast(fg, solidBg);
        };
        const b = measure(basescope);
        const q = measure(pocScope);
        if (b == null || q == null) continue;
        next[p.label] ??= {} as Record<Brand, Cell>;
        next[p.label][brand] = { ratio: q, base: b };
      }

      const cardB = read(basescope, '--card');
      const bgB = read(basescope, '--background');
      const cardP = read(pocScope, '--card');
      const bgP = read(pocScope, '--background');
      if (cardB && bgB && cardP && bgP) {
        nextFloat[brand] = {
          base: Math.abs(lstar(cardB) - lstar(bgB)),
          poc: Math.abs(lstar(cardP) - lstar(bgP)),
        };
      }
    }
    setRows(next);
    setFloat(nextFloat);
  }, [strength, mode]);

  const probes = (
    <div
      ref={hostRef}
      aria-hidden="true"
      style={{ position: 'fixed', left: -9999, top: 0, width: 1, height: 1, overflow: 'hidden' }}
    >
      {BRANDS.map((b) => (
        <span key={b}>
          <span data-scope={`${b}-base`} data-theme={b} data-mode={mode}>
            <span />
          </span>
          <span
            data-scope={`${b}-poc`}
            data-theme={b}
            data-mode={mode}
            data-theme-poc=""
            style={{ '--poc-str': strength } as CSSProperties}
          >
            <span />
          </span>
        </span>
      ))}
    </div>
  );

  return { probes, rows, float, mode, setMode };
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared UI bits
// ─────────────────────────────────────────────────────────────────────────────

const H2: CSSProperties = {
  margin: '0 0 var(--p-2)',
  fontSize: 'var(--text-lg)',
  fontWeight: 'var(--font-semibold)',
  color: 'var(--foreground)',
};
const P: CSSProperties = {
  margin: '0 0 var(--p-4)',
  fontSize: 'var(--text-sm)',
  lineHeight: 'var(--leading-6)',
  color: 'var(--muted-foreground)',
  maxWidth: 'var(--max-w-3xl)',
};
const PAGE: CSSProperties = {
  padding: 'var(--p-8)',
  display: 'grid',
  gap: 'var(--p-10)',
  maxWidth: 'var(--max-w-6xl)',
  margin: '0 auto',
};
const MONO: CSSProperties = { fontFamily: 'var(--font-family-mono)', fontSize: 'var(--text-xs)' };

/** The composition every comparison renders. Exercises every touched token. */
function Composition({ p, hero }: { p: string; hero?: boolean }) {
  const [on, setOn] = useState(true);
  return (
    <div style={{ background: 'var(--background)', minHeight: 520 }}>
      <div
        className={hero ? 'poc-hero-band' : undefined}
        style={{
          padding: 'var(--p-5) var(--p-6)',
          background: hero ? undefined : 'var(--card)',
          borderBottom: 'var(--border-w-100) solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--p-3)',
          color: hero ? 'var(--primary-foreground)' : 'var(--foreground)',
        }}
      >
        <strong style={{ flex: 1, fontSize: 'var(--text-base)' }}>Reporting</strong>
        <StatusDot status="online" label="Live" />
        <span className={hero ? 'poc-hero-cta' : undefined}>
          <Button id={`${p}-cta`} label="New report" IconLeft={Plus} size="sm" />
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '180px minmax(0,1fr)', minHeight: 460 }}>
        {/* --sidebar is a deliberate un-themed carve-out. Included on purpose:
            on a tinted page it either reads as chrome or as forgotten. */}
        <aside
          style={{
            background: 'var(--sidebar)',
            borderRight: 'var(--border-w-100) solid var(--sidebar-border)',
            padding: 'var(--p-4)',
            display: 'grid',
            gap: 'var(--p-2)',
            alignContent: 'start',
            fontSize: 'var(--text-sm)',
            color: 'var(--sidebar-foreground)',
          }}
        >
          <span style={{ fontWeight: 'var(--font-medium)' }}>Overview</span>
          <span style={{ color: 'var(--muted-foreground)' }}>Cohorts</span>
          <span style={{ color: 'var(--muted-foreground)' }}>Exports</span>
        </aside>

        <div style={{ padding: 'var(--p-6)', display: 'grid', gap: 'var(--p-5)', alignContent: 'start' }}>
          <Alert
            id={`${p}-alert`}
            variant="info"
            title="Two sources are still syncing"
            description="Numbers may move until the last import finishes."
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 'var(--p-4)' }}>
            <Card id={`${p}-c1`}>
              <CardHeader id={`${p}-c1`} title="Active accounts" description="Last 7 days" />
              <CardBody>
                <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-semibold)' }}>12,480</div>
                <Progress id={`${p}-pr`} value={68} />
              </CardBody>
            </Card>
            <Card id={`${p}-c2`}>
              <CardHeader id={`${p}-c2`} title="Team" description="Owners of this space" />
              <CardBody>
                <AvatarGroup id={`${p}-ag`} max={3}>
                  <Avatar id={`${p}-a1`} fallback="KM" />
                  <Avatar id={`${p}-a2`} fallback="JD" />
                  <Avatar id={`${p}-a3`} fallback="AR" />
                  <Avatar id={`${p}-a4`} fallback="TS" />
                </AvatarGroup>
                <div style={{ display: 'flex', gap: 'var(--p-2)', marginTop: 'var(--p-3)', flexWrap: 'wrap' }}>
                  <Badge id={`${p}-b1`} variant="default" label="Pro" />
                  <Badge id={`${p}-b2`} variant="outline" label="Beta" />
                  <Chip id={`${p}-ch`} label="Weekly" active />
                </div>
              </CardBody>
            </Card>
          </div>

          <Input id={`${p}-search`} label="Find a cohort" IconLeft={Search} placeholder="Search…" />

          <ItemGroup id={`${p}-list`}>
            <Item id={`${p}-i1`} variant="outline">
              <ItemContent>
                <ItemTitle>Trial → paid</ItemTitle>
                <ItemDescription>Conversion fell 5pts after the pricing change</ItemDescription>
              </ItemContent>
            </Item>
            <Item id={`${p}-i2`} variant="outline">
              <ItemContent>
                <ItemTitle>Legacy plan</ItemTitle>
                <ItemDescription>~400 seats lapsed in the same week</ItemDescription>
              </ItemContent>
            </Item>
          </ItemGroup>

          {/* The knockout set — all four use --background as a knockout, NOT as a
              page colour, so a tinted page changes what they look like. */}
          <div style={{ display: 'flex', gap: 'var(--p-6)', alignItems: 'center', flexWrap: 'wrap' }}>
            <Switch id={`${p}-sw`} label="Auto-refresh" checked={on} onCheckedChange={setOn} />
            <div style={{ minWidth: 180 }}>
              <Slider id={`${p}-sl`} defaultValue={40} />
            </div>
            <Avatar id={`${p}-av`} fallback="KM" badge={<StatusDot status="online" label="Online" />} />
          </div>
        </div>
      </div>
    </div>
  );
}

/** A themed scope, optionally with the POC layered on. */
function Scope({
  brand,
  poc,
  strength = 1,
  mode,
  children,
}: {
  brand: Brand | '';
  poc?: boolean;
  strength?: number;
  mode?: 'light' | 'dark';
  children: ReactNode;
}) {
  return (
    <div
      data-theme={brand || undefined}
      data-mode={mode}
      {...(poc ? { 'data-theme-poc': '' } : {})}
      style={poc ? ({ '--poc-str': strength } as CSSProperties) : undefined}
    >
      {children}
    </div>
  );
}

const meta: Meta = {
  title: 'Prototypes/Deeper Theming',
  parameters: {
    layout: 'fullscreen',
    ui: {
      description:
        'A proof of concept for themes that reach past `--primary` — tinted surfaces plus a ' +
        'per-brand hero treatment. It modifies nothing: every rule is scoped to a ' +
        '`data-theme-poc` attribute that exists nowhere else in the repo.',
      tags: ['poc', 'theming'],
    },
  },
};
export default meta;
type Story = StoryObj;

// ─────────────────────────────────────────────────────────────────────────────
// 1 — Proposal
// ─────────────────────────────────────────────────────────────────────────────

export const Proposal: Story = {
  render: () => (
    <>
      <PocStyle />
      <div style={PAGE}>
        <div>
          <h2 style={H2}>What this is</h2>
          <p style={P}>
            Today a <code>data-theme</code> scope reaches <strong>9 of ~452 tokens</strong>, and
            all nine are <code>--primary</code>. Surfaces, elevation and chrome are out of reach
            by construction — which is why eight sub-brands read as “the same app with a
            different button”.
          </p>
          <p style={P}>
            This POC asks what happens if a theme also tints the neutral <em>surfaces</em>, and
            adds one bold treatment at entry points. In light mode it tints the <strong>page</strong>{' '}
            and leaves cards white, so cards float — light mode currently collapses{' '}
            <code>--background</code>, <code>--card</code> and <code>--popover</code> all to{' '}
            <code>#ffffff</code> and separates them with a hairline alone.
          </p>
        </div>

        <div>
          <h2 style={H2}>Containment</h2>
          <p style={P}>
            Nothing existing is modified. Every selector below contains{' '}
            <code>[data-theme-poc]</code>, an attribute that appears nowhere else in the repo, so
            no other story can be reached. Mode is stamped on the <em>same</em> element rather
            than inherited, so source order never decides anything.
          </p>
          <p style={P}>
            At <code>--poc-str: 0</code> every mix is 0% and resolves to the literal base value —
            so the recipe degrades to exactly today’s colours. That is checked in{' '}
            <strong>Contrast audit</strong>.
          </p>
        </div>

        <div>
          <h2 style={H2}>The whole mechanism</h2>
          <pre
            style={{
              ...MONO,
              margin: 0,
              padding: 'var(--p-4)',
              background: 'var(--muted)',
              borderRadius: 'var(--rounded-md)',
              overflowX: 'auto',
              lineHeight: 'var(--leading-5)',
              color: 'var(--foreground)',
            }}
          >
            {POC_CSS}
          </pre>
        </div>
      </div>
    </>
  ),
};

// ─────────────────────────────────────────────────────────────────────────────
// 2 — Before / after
// ─────────────────────────────────────────────────────────────────────────────

export const BeforeAfter: Story = {
  render: () => {
    const [brand, setBrand] = useState<Brand>('db');
    const [strength, setStrength] = useState(1);
    const [swapped, setSwapped] = useState(false);
    const [hero, setHero] = useState(true);

    const before = (
      <div key="before">
        <Caption>Today — <code>data-theme=&quot;{brand}&quot;</code></Caption>
        <Scope brand={brand}>
          <Composition p={`b-${brand}`} />
        </Scope>
      </div>
    );
    const after = (
      <div key="after">
        <Caption>
          POC — tinted surfaces{hero ? ' + hero' : ''} · strength {strength.toFixed(2)}
        </Caption>
        <Scope brand={brand} poc strength={strength}>
          <Composition p={`a-${brand}`} hero={hero} />
        </Scope>
      </div>
    );

    return (
      <>
        <PocStyle />
        <div style={{ ...PAGE, gap: 'var(--p-6)' }}>
          <div>
            <h2 style={H2}>Before / after</h2>
            <p style={P}>
              The same composition twice. Drag strength to <strong>0</strong> and the right side
              becomes byte-identical to the left — the recipe is a continuum, not a switch.
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              gap: 'var(--p-4)',
              alignItems: 'center',
              flexWrap: 'wrap',
              padding: 'var(--p-4)',
              background: 'var(--card)',
              border: 'var(--border-w-100) solid var(--border)',
              borderRadius: 'var(--rounded-lg)',
            }}
          >
            <div style={{ display: 'flex', gap: 'var(--p-2)', flexWrap: 'wrap' }}>
              {BRANDS.map((b) => (
                <Chip
                  key={b}
                  id={`pick-${b}`}
                  label={b}
                  active={brand === b}
                  onClick={() => setBrand(b)}
                />
              ))}
            </div>
            <div style={{ minWidth: 220 }}>
              <Slider
                id="poc-strength"
                label="Tint strength"
                min={0}
                max={1.6}
                step={0.05}
                value={strength}
                onValueChange={setStrength}
                showValue
              />
            </div>
            <Switch id="poc-hero" label="Hero surface" checked={hero} onCheckedChange={setHero} />
            <Button
              id="poc-swap"
              label="Swap sides"
              style="outline"
              size="sm"
              onClick={() => setSwapped((s) => !s)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 'var(--p-4)' }}>
            {swapped ? [after, before] : [before, after]}
          </div>
        </div>
      </>
    );
  },
};

function Caption({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        ...MONO,
        marginBottom: 'var(--p-2)',
        color: 'var(--muted-foreground)',
      }}
    >
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3 — All eight brands
// ─────────────────────────────────────────────────────────────────────────────

export const AllEightBrands: Story = {
  render: () => {
    const [strength, setStrength] = useState(1);
    return (
      <>
        <PocStyle />
        <div style={{ ...PAGE, gap: 'var(--p-6)' }}>
          <div>
            <h2 style={H2}>Does the family hold?</h2>
            <p style={P}>
              Eight tinted pages side by side. The question is not whether any one looks good —
              it is whether they read as <em>eight</em> things or as four blues and a couple of
              others.
            </p>
            <div style={{ maxWidth: 260 }}>
              <Slider
                id="all-strength"
                label="Tint strength"
                min={0}
                max={1.6}
                step={0.05}
                value={strength}
                onValueChange={setStrength}
                showValue
              />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 'var(--p-3)' }}>
            {BRANDS.map((b) => (
              <Scope key={b} brand={b} poc strength={strength}>
                <div
                  style={{
                    background: 'var(--background)',
                    border: 'var(--border-w-100) solid var(--border)',
                    borderRadius: 'var(--rounded-lg)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    className="poc-hero-band"
                    style={{
                      padding: 'var(--p-3) var(--p-4)',
                      color: 'var(--primary-foreground)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-medium)',
                    }}
                  >
                    {b}
                  </div>
                  <div style={{ padding: 'var(--p-4)', display: 'grid', gap: 'var(--p-3)' }}>
                    <div
                      style={{
                        background: 'var(--card)',
                        border: 'var(--border-w-100) solid var(--border)',
                        borderRadius: 'var(--rounded-md)',
                        padding: 'var(--p-3)',
                        fontSize: 'var(--text-xs)',
                        color: 'var(--muted-foreground)',
                      }}
                    >
                      A card, floating
                    </div>
                    <Button id={`all-${b}`} label="Primary" size="sm" />
                  </div>
                </div>
              </Scope>
            ))}
          </div>
        </div>
      </>
    );
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 4 — Hero surface
// ─────────────────────────────────────────────────────────────────────────────

export const HeroSurface: Story = {
  render: () => (
    <>
      <PocStyle />
      <div style={PAGE}>
        <div>
          <h2 style={H2}>Hero surface</h2>
          <p style={P}>
            Three derivations per brand. <strong>A (tonal)</strong> keeps every stop on the
            segment <code>--primary → --foreground</code>, so contrast against the label only
            ever increases — provably AA-safe with zero measurement.{' '}
            <strong>B (hue-rotating)</strong> moves the hue for a richer read, but needs relative
            colour syntax and every stop must be measured. <strong>Flat</strong> is the control.
          </p>
        </div>
        {BRANDS.map((b) => (
          <Scope key={b} brand={b} poc>
            <div style={{ display: 'grid', gap: 'var(--p-2)' }}>
              <Caption>{b}</Caption>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 'var(--p-3)' }}>
                {(['poc-hero-band', 'poc-hero-band-b', ''] as const).map((cls, i) => (
                  <div
                    key={i}
                    className={cls || undefined}
                    style={{
                      background: cls ? undefined : 'var(--primary)',
                      color: 'var(--primary-foreground)',
                      padding: 'var(--p-5)',
                      borderRadius: 'var(--rounded-lg)',
                      display: 'grid',
                      gap: 'var(--p-2)',
                    }}
                  >
                    <strong style={{ fontSize: 'var(--text-base)' }}>
                      {['A — tonal', 'B — hue-rotating', 'Flat (control)'][i]}
                    </strong>
                    <span style={{ fontSize: 'var(--text-sm)', opacity: 0.9 }}>
                      Ask about this workspace
                    </span>
                  </div>
                ))}
              </div>
              <div className="poc-hero-icon" style={{ display: 'flex', gap: 'var(--p-3)', alignItems: 'center' }}>
                <FeaturedIcon Icon={Sparkles} size="lg" shape="circle" />
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
                  Entry points only — header band, its CTA, an empty-state icon. Body buttons stay
                  flat <code>--primary</code>.
                </span>
              </div>
            </div>
          </Scope>
        ))}
      </div>
    </>
  ),
};

// ─────────────────────────────────────────────────────────────────────────────
// 5 — Contrast audit
// ─────────────────────────────────────────────────────────────────────────────

export const ContrastAudit: Story = {
  render: () => {
    const [strength, setStrength] = useState(1);
    const { probes, rows, float, mode, setMode } = useAudit(strength);

    const all = useMemo(() => {
      const out: { label: string; brand: Brand; ratio: number; base: number; isText: boolean }[] = [];
      for (const [label, byBrand] of Object.entries(rows)) {
        const isText = !BORDER_PAIRS.some((b) => b.label === label);
        for (const [brand, cell] of Object.entries(byBrand)) {
          out.push({ label, brand: brand as Brand, ...cell, isText });
        }
      }
      return out;
    }, [rows]);

    const floor = (isText: boolean) => (isText ? 4.5 : 3);
    const fails = all.filter((r) => r.ratio < floor(r.isText));
    const worst = all.length ? all.reduce((a, b) => (a.ratio < b.ratio ? a : b)) : null;
    // `base` is the same pairing measured in a plain data-theme scope, so
    // "cleared before, fails now" isolates what this POC actually broke.
    const caused = fails.filter((r) => r.base >= floor(r.isText));
    const preExisting = fails.filter((r) => r.base < floor(r.isText));

    return (
      <>
        <PocStyle />
        {probes}
        <div style={{ ...PAGE, gap: 'var(--p-6)' }}>
          <div>
            <h2 style={H2}>Contrast audit — measured live</h2>
            <p style={P}>
              <code>scripts/contrast-check.mjs</code> cannot see any of this: it brace-matches
              only the two <code>[data-mode]</code> blocks, returns null for{' '}
              <code>color-mix</code>, and treats unresolved as <em>not</em> a failure while still
              exiting 0. So this measures itself — real computed colours, read back through a 1×1
              canvas so every serialisation form normalises.
            </p>
            <div style={{ display: 'flex', gap: 'var(--p-4)', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ minWidth: 240 }}>
                <Slider
                  id="audit-strength"
                  label="Tint strength"
                  min={0}
                  max={1.6}
                  step={0.05}
                  value={strength}
                  onValueChange={setStrength}
                  showValue
                />
              </div>
              <Switch
                id="audit-mode"
                label="Dark mode"
                checked={mode === 'dark'}
                onCheckedChange={(v) => setMode(v ? 'dark' : 'light')}
              />
            </div>
          </div>

          <div
            style={{
              padding: 'var(--p-4)',
              borderRadius: 'var(--rounded-lg)',
              border: 'var(--border-w-100) solid var(--border)',
              background: fails.length ? 'var(--error-light)' : 'var(--success-light)',
              color: 'var(--foreground)',
              fontSize: 'var(--text-sm)',
            }}
          >
            <strong>
              {fails.length} of {all.length} pairings below their floor
            </strong>
            {worst ? (
              <>
                {' '}
                · worst {worst.ratio.toFixed(2)} ({worst.brand} — {worst.label})
              </>
            ) : null}
            {strength === 0 ? (
              <div style={{ marginTop: 'var(--p-2)', color: 'var(--muted-foreground)' }}>
                At strength 0 every delta below should read ±0.00 — that is the proof the recipe
                degrades to today exactly.
              </div>
            ) : null}
          </div>

          {/* Split the failures honestly. A raw count conflates two very different
              things: pairings this POC pushed under the floor, and pairings that
              already fail today and are only visible because this audit measures
              more than scripts/contrast-check.mjs does. */}
          <div style={{ display: 'grid', gap: 'var(--p-3)' }}>
            <div>
              <h2 style={{ ...H2, fontSize: 'var(--text-base)' }}>
                Caused by the tint — {caused.length}
              </h2>
              <p style={P}>
                These cleared their floor before and do not now. This is the POC's real cost.
              </p>
              <ul style={{ ...MONO, margin: 0, paddingLeft: 'var(--p-5)', color: 'var(--foreground)' }}>
                {Object.entries(
                  caused.reduce<Record<string, number>>((acc, r) => {
                    acc[r.label] = (acc[r.label] ?? 0) + 1;
                    return acc;
                  }, {}),
                ).map(([label, n]) => (
                  <li key={label}>
                    {label} — {n} of {BRANDS.length} brands
                  </li>
                ))}
                {caused.length === 0 ? <li>none</li> : null}
              </ul>
            </div>

            <div>
              <h2 style={{ ...H2, fontSize: 'var(--text-base)' }}>
                Already failing today — {preExisting.length}
              </h2>
              <p style={P}>
                Not a regression. <code>--border</code> against <code>--background</code> is
                ~1.5:1 in the current system, well under the 3:1 WCAG 1.4.11 asks of a meaningful
                UI boundary. The tint actually <em>improves</em> it. Listed because this audit
                measures pairings the real gate never has.
              </p>
              <ul style={{ ...MONO, margin: 0, paddingLeft: 'var(--p-5)', color: 'var(--muted-foreground)' }}>
                {[...new Set(preExisting.map((r) => r.label))].map((l) => (
                  <li key={l}>{l}</li>
                ))}
                {preExisting.length === 0 ? <li>none</li> : null}
              </ul>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ borderCollapse: 'collapse', width: '100%', ...MONO }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: 'var(--p-2)', color: 'var(--muted-foreground)' }}>
                    pairing
                  </th>
                  {BRANDS.map((b) => (
                    <th key={b} style={{ padding: 'var(--p-2)', color: 'var(--muted-foreground)' }}>
                      {b}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...PAIRINGS, ...BORDER_PAIRS].map((p) => {
                  const byBrand = rows[p.label];
                  if (!byBrand) return null;
                  const isText = !BORDER_PAIRS.some((b) => b.label === p.label);
                  return (
                    <tr key={p.label} style={{ borderTop: 'var(--border-w-100) solid var(--border)' }}>
                      <td style={{ padding: 'var(--p-2)', whiteSpace: 'nowrap' }}>
                        {p.label}
                        {p.note ? (
                          <span style={{ color: 'var(--muted-foreground)' }}> · {p.note}</span>
                        ) : null}
                      </td>
                      {BRANDS.map((b) => {
                        const c = byBrand[b];
                        if (!c) return <td key={b} style={{ padding: 'var(--p-2)' }}>—</td>;
                        const d = c.ratio - c.base;
                        const bad = c.ratio < floor(isText);
                        return (
                          <td
                            key={b}
                            style={{
                              padding: 'var(--p-2)',
                              textAlign: 'right',
                              color: bad ? 'var(--error)' : 'var(--foreground)',
                              fontWeight: bad ? 'var(--font-semibold)' : 'var(--font-normal)',
                            }}
                          >
                            {c.ratio.toFixed(2)}
                            <span style={{ color: 'var(--muted-foreground)' }}>
                              {' '}
                              {d >= 0 ? '+' : ''}
                              {d.toFixed(2)}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div>
            <h2 style={H2}>Do cards float?</h2>
            <p style={P}>
              ΔL* between <code>--card</code> and <code>--background</code>. Not a WCAG rule — the
              number that says whether a card reads as raised. Dark mode’s existing ramp is{' '}
              <strong>≈4.5</strong>; light mode today is <strong>0</strong>, because both are{' '}
              <code>#ffffff</code>.
            </p>
            <div style={{ display: 'flex', gap: 'var(--p-4)', flexWrap: 'wrap', ...MONO }}>
              {BRANDS.map((b) => {
                const f = float[b];
                if (!f) return null;
                return (
                  <div
                    key={b}
                    style={{
                      padding: 'var(--p-3)',
                      border: 'var(--border-w-100) solid var(--border)',
                      borderRadius: 'var(--rounded-md)',
                      minWidth: 96,
                    }}
                  >
                    <div style={{ color: 'var(--muted-foreground)' }}>{b}</div>
                    <div style={{ fontSize: 'var(--text-base)' }}>{f.poc.toFixed(1)}</div>
                    <div style={{ color: 'var(--muted-foreground)' }}>was {f.base.toFixed(1)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </>
    );
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 6 — Palette collision
// ─────────────────────────────────────────────────────────────────────────────

/** sRGB → OKLab, ~20 lines, no dependency. ΔE-OK is Euclidean in this space. */
function oklab([r, g, b]: [number, number, number, number]) {
  const f = (v: number) => srgbToLin(v);
  const [R, G, B] = [f(r), f(g), f(b)];
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ] as [number, number, number];
}
const deltaOK = (a: [number, number, number], b: [number, number, number]) =>
  Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

export const PaletteCollision: Story = {
  render: () => {
    const hostRef = useRef<HTMLDivElement>(null);
    const [reveal, setReveal] = useState(false);
    const [squint, setSquint] = useState(false);
    const [d, setD] = useState<{ primary: Record<string, number>; page: Record<string, number> }>({
      primary: {},
      page: {},
    });

    useEffect(() => {
      const host = hostRef.current;
      if (!host) return;
      const read = (brand: Brand, token: string, poc: boolean) => {
        const scope = host.querySelector<HTMLElement>(`[data-c="${brand}-${poc ? 'p' : 'b'}"]`);
        const probe = scope?.firstElementChild as HTMLElement | undefined;
        if (!probe) return null;
        probe.style.backgroundColor = `var(${token})`;
        return toRGBA(getComputedStyle(probe).backgroundColor);
      };
      const primary: Record<string, number> = {};
      const page: Record<string, number> = {};
      for (const pair of [
        ['dc', 'ec'],
        ['db', 'ir'],
        ['nb', 'dc'],
        ['rm', 'db'],
      ] as [Brand, Brand][]) {
        const [a, b] = pair;
        const pa = read(a, '--primary', false);
        const pb = read(b, '--primary', false);
        const ga = read(a, '--background', true);
        const gb = read(b, '--background', true);
        const key = `${a} / ${b}`;
        if (pa && pb) primary[key] = deltaOK(oklab(pa), oklab(pb));
        if (ga && gb) page[key] = deltaOK(oklab(ga), oklab(gb));
      }
      setD({ primary, page });
    }, []);

    return (
      <>
        <PocStyle />
        <div
          ref={hostRef}
          aria-hidden="true"
          style={{ position: 'fixed', left: -9999, top: 0, width: 1, height: 1, overflow: 'hidden' }}
        >
          {BRANDS.map((b) => (
            <span key={b}>
              <span data-c={`${b}-b`} data-theme={b} data-mode="light">
                <span />
              </span>
              <span
                data-c={`${b}-p`}
                data-theme={b}
                data-mode="light"
                data-theme-poc=""
                style={{ '--poc-str': 1 } as CSSProperties}
              >
                <span />
              </span>
            </span>
          ))}
        </div>

        <div style={{ ...PAGE, gap: 'var(--p-6)' }}>
          <div>
            <h2 style={H2}>Where this argues against itself</h2>
            <p style={P}>
              The palette is cool-heavy: six of eight sit between 160° and 265°.{' '}
              <code>dc</code>/<code>ec</code> are 17° apart, <code>db</code>/<code>ir</code> 22°.
              A tinted page is only ~10% primary in white, so its chroma is about a{' '}
              <em>tenth</em> of the primary’s — and the perceptual distance between two tinted
              pages shrinks by roughly the same factor.
            </p>
            <p style={P}>
              If that holds, the tint is atmosphere and the <strong>hero is doing all the
              differentiating</strong> — which would invert the priority of the two halves of
              this proposal. The numbers below are measured, not asserted.
            </p>
          </div>

          <div style={{ ...MONO, display: 'grid', gap: 'var(--p-2)', maxWidth: 560 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px', color: 'var(--muted-foreground)' }}>
              <span>pair</span>
              <span style={{ textAlign: 'right' }}>ΔE primary</span>
              <span style={{ textAlign: 'right' }}>ΔE page</span>
            </div>
            {Object.keys(d.primary).map((k) => (
              <div
                key={k}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 100px 100px',
                  borderTop: 'var(--border-w-100) solid var(--border)',
                  paddingTop: 'var(--p-2)',
                }}
              >
                <span>{k}</span>
                <span style={{ textAlign: 'right' }}>{d.primary[k]?.toFixed(3)}</span>
                <span
                  style={{
                    textAlign: 'right',
                    color: (d.page[k] ?? 1) < 0.05 ? 'var(--error)' : 'var(--foreground)',
                  }}
                >
                  {d.page[k]?.toFixed(3)}
                </span>
              </div>
            ))}
            <p style={{ ...P, marginTop: 'var(--p-2)' }}>
              ≥0.10 distinct at a glance · 0.05–0.10 distinguishable side by side · &lt;0.05
              effectively the same.
            </p>
          </div>

          <div>
            <h2 style={H2}>Blind test — which is which?</h2>
            <p style={P}>
              Two tinted pages, labels hidden. A number can be argued with; failing to pick which
              is which cannot.
            </p>
            <div style={{ display: 'flex', gap: 'var(--p-3)', marginBottom: 'var(--p-3)' }}>
              <Button id="reveal" label={reveal ? 'Hide labels' : 'Reveal'} style="outline" size="sm" onClick={() => setReveal((r) => !r)} />
              <Switch id="squint" label="Squint" checked={squint} onCheckedChange={setSquint} />
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0,1fr))',
                gap: 'var(--p-4)',
                filter: squint ? 'blur(6px)' : undefined,
              }}
            >
              {(['dc', 'ec'] as Brand[]).map((b) => (
                <Scope key={b} brand={b} poc>
                  <div
                    style={{
                      background: 'var(--background)',
                      border: 'var(--border-w-100) solid var(--border)',
                      borderRadius: 'var(--rounded-lg)',
                      padding: 'var(--p-5)',
                      display: 'grid',
                      gap: 'var(--p-3)',
                      minHeight: 200,
                    }}
                  >
                    <div style={{ ...MONO, color: 'var(--muted-foreground)' }}>
                      {reveal ? b : '???'}
                    </div>
                    <div
                      style={{
                        background: 'var(--card)',
                        border: 'var(--border-w-100) solid var(--border)',
                        borderRadius: 'var(--rounded-md)',
                        padding: 'var(--p-4)',
                        fontSize: 'var(--text-sm)',
                        color: 'var(--muted-foreground)',
                      }}
                    >
                      A card on a tinted page
                    </div>
                  </div>
                </Scope>
              ))}
            </div>
          </div>

          <div>
            <h2 style={H2}>The same pair as hero</h2>
            <p style={P}>
              Saturated and full-bleed — the only element with enough chroma to carry 17°.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 'var(--p-4)' }}>
              {(['dc', 'ec'] as Brand[]).map((b) => (
                <Scope key={b} brand={b} poc>
                  <div
                    className="poc-hero-band"
                    style={{
                      padding: 'var(--p-6)',
                      borderRadius: 'var(--rounded-lg)',
                      color: 'var(--primary-foreground)',
                      fontSize: 'var(--text-base)',
                      fontWeight: 'var(--font-medium)',
                    }}
                  >
                    {reveal ? b : '???'}
                  </div>
                </Scope>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 7 — Limits
// ─────────────────────────────────────────────────────────────────────────────

export const Limits: Story = {
  render: () => (
    <div style={PAGE}>
      <div>
        <h2 style={H2}>What this does not prove</h2>
        <p style={P}>
          A POC earns its keep by being explicit about its own edges. None of the below is
          demonstrated here, and each is real work if this is adopted.
        </p>
      </div>
      {[
        [
          'Portalled overlays escape the scope entirely',
          'Dialog, Drawer, Popover, Tooltip, DropdownMenu, ContextMenu, Select, Combobox, HoverCard and Toaster all render into document.body — outside this subtree — so none of them inherit these tokens. That is already true of today’s data-theme subtree scoping; the POC only exposes it. The --popover surface here is a plain div for exactly that reason.',
        ],
        [
          '--background is doing two jobs',
          'It is the page surface AND the knockout white: the Switch thumb, the Slider thumb, Avatar’s status-dot and group rings, and the Tabs active indicator all use it as a cut-out, not as a page colour. Tinting it turns a white puck into a coloured one. Adoption needs a separate --surface-knockout token — a tokens.scss change this POC deliberately cannot make.',
        ],
        [
          'The clean derivation needs new raw tokens',
          'A custom property cannot reference itself, so every base value here is a hardcoded literal copied from tokens.scss. Real adoption needs a layer of raw neutrals with the semantic tokens derived from them — a refactor the POC sidesteps and cannot justify on its own.',
        ],
        [
          'The contrast gate cannot cover this',
          'scripts/contrast-check.mjs is a static regex parser. Theme scopes, var() indirection, color-mix evaluation and tints composited over a variable base all need either a browser or a real colour library. Until it is rewritten it prints a green pass on every one of these values — 49 pairings would become roughly 441.',
        ],
        [
          'Light mode gains an elevation model it never had',
          'Every component authored on the assumption that --card equals --background may show a seam. This story exercises about fifteen of fifty-nine.',
        ],
        [
          'Charts stay unthemed',
          '--chart-* is a neutral slate ramp and will read as un-branded sitting on a hued page.',
        ],
        [
          'Untested conditions',
          'forced-colors mode, prefers-contrast: more, print, nested POC scopes, and APCA — which weights light-text-on-light-tint very differently, and that is half of what this changes.',
        ],
        [
          'Nobody has validated that this is wanted',
          'The POC shows what is possible, not what is right. The strength slider is the closest it comes to asking.',
        ],
      ].map(([title, body]) => (
        <div key={title}>
          <h2 style={{ ...H2, fontSize: 'var(--text-base)' }}>{title}</h2>
          <p style={P}>{body}</p>
        </div>
      ))}
    </div>
  ),
};
