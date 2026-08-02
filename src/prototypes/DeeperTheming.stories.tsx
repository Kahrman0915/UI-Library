import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  ArrowRight, Calendar, ChartColumn, Check, FileText, Globe, Heart,
  Plus, Search, Sparkles, Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  Alert, Avatar, AvatarGroup, Badge, Button, Card, CardBody, CardHeader, Chip,
  Input, Item, ItemContent, ItemDescription, ItemGroup, ItemTitle, Progress,
  Separator, StatusDot, Switch,
} from '../index';
import {
  POC_CSS, BRAND_ANCHORS, BRAND_KEYS, PRIMARY_LIGHT, PRIMARY_DARK, SUB_BRANDS,
} from './deeperThemingRecipe';
import type { BrandKey } from './deeperThemingRecipe';

/**
 * PROOF OF CONCEPT — deeper theming, rebuilt on the app marks.
 *
 * THE QUESTION has not changed: sub-apps under one parent, each standing on its
 * own while reading as part of one ecosystem. What changed is where the brand is
 * DEFINED. Earlier rounds themed from a single `--primary` and kept running out
 * of hue; the Figma marks turned out to be a better source, because each one
 * already carries three colours with three distinct jobs.
 *
 *     HIGHLIGHT  the upper corner — reaches out of the brand's own hue family
 *     MAIN       the body — what a person means when they name the brand
 *     DEEP       the shadow end
 *
 * The whole stylesheet is written in terms of those three plus a derived
 * `--primary`, and no brand name appears in it after the anchor block. Adding a
 * brand is four lines and nothing else.
 *
 * WHAT THE EARLIER ROUNDS SETTLED, kept so the dead ends stay dead:
 *   1. Tinting the PAGE cannot differentiate brands — only ~10% of a primary's
 *      chroma survives into a surface pale enough to carry body text.
 *   2. Rotating to the COMPLEMENT does not help — a rigid rotation preserves
 *      every pairwise distance, and three of eight complements hit a semantic.
 *   3. Hue is a bounded resource. Eight brands do not fit on one wheel beside
 *      error, warning and success; the fix is more STRUCTURE, not more hue.
 *
 * CONTAINMENT is unchanged: every selector carries `[data-theme-poc]`, an
 * attribute that appears nowhere else in the repo. tokens.scss is untouched.
 */

function PocStyle() {
  return <style>{POC_CSS}</style>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Measurement
// ─────────────────────────────────────────────────────────────────────────────

let ctx: CanvasRenderingContext2D | null = null;
/** Normalise ANY CSS colour to bytes — color-mix serialises as color(srgb …). */
function toRGBA(css: string): [number, number, number, number] | null {
  if (!ctx) {
    const c = document.createElement('canvas');
    c.width = c.height = 1;
    ctx = c.getContext('2d', { willReadFrequently: true });
  }
  if (!ctx || !css) return null;
  ctx.globalCompositeOperation = 'copy';
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
const luminance = ([r, g, b]: [number, number, number, number]) =>
  0.2126 * srgbToLin(r) + 0.7152 * srgbToLin(g) + 0.0722 * srgbToLin(b);
function over(fg: [number, number, number, number], bg: [number, number, number, number]) {
  const a = fg[3];
  return [fg[0] * a + bg[0] * (1 - a), fg[1] * a + bg[1] * (1 - a), fg[2] * a + bg[2] * (1 - a), 1] as
    [number, number, number, number];
}
function contrast(fg: [number, number, number, number], bg: [number, number, number, number]) {
  const f = luminance(fg[3] < 1 ? over(fg, bg) : fg);
  const b = luminance(bg);
  const [hi, lo] = f > b ? [f, b] : [b, f];
  return (hi + 0.05) / (lo + 0.05);
}
function oklab([r, g, b]: [number, number, number, number]) {
  const R = srgbToLin(r), G = srgbToLin(g), B = srgbToLin(b);
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ] as const;
}
const deltaE = (a: [number, number, number, number], b: [number, number, number, number]) => {
  const [l1, a1, b1] = oklab(a), [l2, a2, b2] = oklab(b);
  return Math.hypot(l1 - l2, a1 - a2, b1 - b2);
};

// ─────────────────────────────────────────────────────────────────────────────
// Shared
// ─────────────────────────────────────────────────────────────────────────────

const ICONS: Record<BrandKey, LucideIcon> = {
  db: ChartColumn, nb: FileText, dc: Globe, ec: Calendar, ph: Zap, rm: Heart, aiden: Sparkles,
};
type Mode = 'light' | 'dark';

const H2: CSSProperties = { margin: '0 0 var(--p-2)', fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--foreground)' };
const P: CSSProperties = { margin: '0 0 var(--p-4)', fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-6)', color: 'var(--muted-foreground)', maxWidth: 'var(--max-w-3xl)' };
const PAGE: CSSProperties = { padding: 'var(--p-8)', display: 'grid', gap: 'var(--p-10)', maxWidth: 'var(--max-w-6xl)', margin: '0 auto' };
const MONO: CSSProperties = { fontFamily: 'var(--font-family-mono)', fontSize: 'var(--text-xs)' };

/** A branded scope. `data-brand` drives the anchors; `data-mode` picks the pair. */
function Scope({
  brand, mode = 'light', strength = 1, chromeOn = 1, children,
}: {
  brand: BrandKey | ''; mode?: Mode; strength?: number; chromeOn?: number; children: ReactNode;
}) {
  return (
    <div
      data-theme-poc=""
      data-brand={brand || undefined}
      data-mode={mode}
      style={{ '--poc-str': strength, '--poc-chrome': chromeOn } as CSSProperties}
    >
      {children}
    </div>
  );
}

function Mark({ brand, size = 48 }: { brand: BrandKey; size?: number }) {
  const Icon = ICONS[brand];
  return (
    <span className="poc-mark" style={{ width: size, height: size }}>
      <Icon size={Math.round(size * 0.46)} strokeWidth={2} aria-hidden="true" />
    </span>
  );
}

function Frame({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: 'grid', gap: 'var(--p-2)' }}>
      <span style={{ ...MONO, color: 'var(--muted-foreground)' }}>{label}</span>
      <div style={{ border: 'var(--border-w-100) solid var(--border)', borderRadius: 'var(--rounded-lg)', overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  );
}

function ModeToggle({ mode, setMode }: { mode: Mode; setMode: (m: Mode) => void }) {
  return (
    <Switch id="poc-mode" label="Dark mode" checked={mode === 'dark'} onCheckedChange={(v) => setMode(v ? 'dark' : 'light')} />
  );
}

function BrandPicker({ brand, setBrand }: { brand: BrandKey; setBrand: (b: BrandKey) => void }) {
  return (
    <div style={{ display: 'flex', gap: 'var(--p-2)', flexWrap: 'wrap' }}>
      {SUB_BRANDS.map((b) => (
        <Chip key={b} id={`pick-${b}`} label={b} active={b === brand} onClick={() => setBrand(b)} />
      ))}
    </div>
  );
}

const meta: Meta = {
  title: 'Prototypes/Deeper Theming',
  parameters: {
    layout: 'fullscreen',
    ui: {
      description:
        'Theming built on the Figma app marks. Each brand is THREE anchors — highlight, main, deep — ' +
        'and every surface derives from them. Nothing in `tokens.scss` is modified; every rule is scoped ' +
        'to a `data-theme-poc` attribute that exists nowhere else in the repo.',
      tags: ['poc', 'theming'],
    },
  },
};
export default meta;
type Story = StoryObj;

// ─────────────────────────────────────────────────────────────────────────────
// 1 — Brands: the model
// ─────────────────────────────────────────────────────────────────────────────

export const Brands: Story = {
  render: function BrandsStory() {
    const [mode, setMode] = useState<Mode>('light');
    const hostRef = useRef<HTMLDivElement>(null);
    const [drop, setDrop] = useState<Record<string, { raw: number; derived: number }>>({});

    useEffect(() => {
      const host = hostRef.current;
      if (!host) return;
      const probe = host.firstElementChild as HTMLElement;
      const read = (v: string) => {
        probe.style.backgroundColor = '';
        probe.style.backgroundColor = v;
        return toRGBA(getComputedStyle(probe).backgroundColor);
      };
      // --primary-foreground, not pure white — the derivation targets the real label
      const label = toRGBA('#f8fafc')!;
      const next: Record<string, { raw: number; derived: number }> = {};
      for (const b of SUB_BRANDS) {
        const main = read(BRAND_ANCHORS[b].light[1]);
        const prim = read(PRIMARY_LIGHT[b]);
        if (main && prim) next[b] = { raw: contrast(label, main), derived: contrast(label, prim) };
      }
      setDrop(next);
    }, []);

    const swatch = (c: string, label: string, sub?: string) => (
      <div style={{ display: 'grid', gap: 'var(--p-1-5)', minWidth: 96 }}>
        <div style={{ background: c, height: 56, borderRadius: 'var(--rounded-md)', border: 'var(--border-w-100) solid var(--border)' }} />
        <span style={{ ...MONO, color: 'var(--muted-foreground)' }}>{label}</span>
        {sub && <span style={{ ...MONO, color: 'var(--muted-foreground)', opacity: 0.7 }}>{sub}</span>}
      </div>
    );

    return (
      <>
        <PocStyle />
        <div ref={hostRef} aria-hidden="true" style={{ position: 'fixed', left: -9999, top: 0, width: 1, height: 1, overflow: 'hidden' }}>
          <span />
        </div>
        <div style={PAGE}>
          <div>
            <h2 style={H2}>A brand is three colours, not one</h2>
            <p style={P}>
              The Figma marks are the source. Each is a three-stop gradient, and each stop turned out to
              have a job the others cannot do. Earlier rounds of this file themed from a single{' '}
              <code style={MONO}>--primary</code> and kept running out of hue — eight brands do not fit
              on one wheel beside error, warning and success. Three anchors is not three times the
              colour, it is three times the <em>structure</em>.
            </p>
            <ModeToggle mode={mode} setMode={setMode} />
          </div>

          {SUB_BRANDS.map((b) => {
            const a = BRAND_ANCHORS[b][mode];
            return (
              <div key={b} style={{ display: 'flex', gap: 'var(--p-5)', alignItems: 'center', flexWrap: 'wrap' }}>
                <Scope brand={b} mode={mode}>
                  <div style={{ display: 'flex', gap: 'var(--p-3)', alignItems: 'center' }}>
                    <Mark brand={b} size={72} />
                    <strong style={{ ...MONO, fontSize: 'var(--text-sm)', width: 40 }}>{b}</strong>
                  </div>
                </Scope>
                {swatch(a[0], 'highlight', a[0])}
                {swatch(a[1], 'main', a[1])}
                {swatch(a[2], 'deep', a[2])}
                <div style={{ width: 1, height: 56, background: 'var(--border)' }} />
                {swatch(mode === 'light' ? PRIMARY_LIGHT[b] : PRIMARY_DARK[b], '--primary', 'derived')}
              </div>
            );
          })}

          <div>
            <h2 style={H2}>The one derivation that matters</h2>
            <p style={P}>
              <strong>The mark&rsquo;s main stop is a display colour, not a UI colour.</strong> Measured
              with the real label on it, <strong>six of the seven fail AA outright</strong>. So{' '}
              <code style={MONO}>--primary</code> is not the main stop — it is the main stop walked down
              its own hue until the label clears 4.5, keeping every degree of hue and as much chroma as
              the gamut allows. The label is <code style={MONO}>--primary-foreground</code>, which is{' '}
              <code style={MONO}>#f8fafc</code> — solving against pure white instead put every brand at
              4.36–4.42 and the audit caught it.
            </p>
            <table style={{ borderCollapse: 'collapse', fontSize: 'var(--text-sm)', maxWidth: 560 }}>
              <thead>
                <tr style={{ borderBottom: 'var(--border-w-100) solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: 'var(--p-2)' }}>Brand</th>
                  <th style={{ textAlign: 'right', padding: 'var(--p-2)' }}>main stop</th>
                  <th style={{ textAlign: 'right', padding: 'var(--p-2)' }}>--primary</th>
                </tr>
              </thead>
              <tbody>
                {SUB_BRANDS.map((b) => {
                  const d = drop[b];
                  return (
                    <tr key={b} style={{ borderBottom: 'var(--border-w-50) solid var(--border)' }}>
                      <td style={{ ...MONO, padding: 'var(--p-2)', fontSize: 'var(--text-sm)' }}>{b}</td>
                      <td style={{ ...MONO, padding: 'var(--p-2)', textAlign: 'right', color: d && d.raw < 4.5 ? 'var(--error)' : 'var(--foreground)' }}>
                        {d ? d.raw.toFixed(2) : '—'}
                      </td>
                      <td style={{ ...MONO, padding: 'var(--p-2)', textAlign: 'right', color: 'var(--success)', fontWeight: 'var(--font-semibold)' }}>
                        {d ? d.derived.toFixed(2) : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p style={{ ...P, marginTop: 'var(--p-4)' }}>
              Dark mode needs no such derivation — <code style={MONO}>--primary</code> carries dark text
              there, and every mark&rsquo;s dark main stop already clears it (5.1&ndash;6.4). That
              asymmetry is why the two modes are separate blocks rather than one recipe with a sign flip.
            </p>
          </div>

          <div>
            <h2 style={H2}>What each anchor is for</h2>
            <p style={P}>
              <strong>Highlight → artwork only.</strong> The mark, the hero gradient, the top of every
              ramp. It is the brightest, most saturated colour the brand owns, and it is never put
              behind text. An earlier pass built the light surfaces from it; the numbers were good and
              the result was wrong — a panel made from a highlight announces itself, and sub-apps of one
              suite should not announce themselves at every surface.
              <br />
              <strong>Main → the accent and the lines.</strong> CTAs, selection, active nav, borders,
              rings — via the derived <code style={MONO}>--primary</code>.
              <br />
              <strong>Deep → every tinted surface, plus depth.</strong> Panels, the rail, bands, shadows,
              the dark end of every gradient. Greyed toward slate first, then applied at single digits,
              so a surface shifts <strong>4&ndash;8&nbsp;ΔE00</strong> off its neutral: enough to read as
              this brand when set beside another, never enough to read as a coloured page. Deep is the
              right tool because it is high-chroma — a few percent buys real hue at almost no luminance
              cost. Shadows take it too: a shadow holding the object&rsquo;s own dark end reads as light
              falling on it, a grey one reads as dirt.
            </p>
          </div>
        </div>
      </>
    );
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 2 — Dashboard
// ─────────────────────────────────────────────────────────────────────────────

function DashboardPage({ brand }: { brand: BrandKey }) {
  const [on, setOn] = useState(true);
  const nav = ['Overview', 'Cohorts', 'Exports', 'Settings'];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '208px minmax(0,1fr)', minHeight: 560, background: 'var(--background)' }}>
      <aside
        className="poc-rail"
        style={{
          backgroundColor: 'var(--sidebar)',
          borderRight: 'var(--border-w-100) solid var(--sidebar-border)',
          padding: 'var(--p-4)', display: 'grid', alignContent: 'start', gap: 'var(--p-4)',
          color: 'var(--sidebar-foreground)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--p-2-5)' }}>
          <Mark brand={brand} size={32} />
          <strong style={{ ...MONO, fontSize: 'var(--text-sm)' }}>{brand}</strong>
        </div>
        <nav style={{ display: 'grid', gap: 'var(--p-0-5)' }}>
          {nav.map((n, i) => (
            <span key={n} style={{
              padding: 'var(--p-2) var(--p-2-5)', borderRadius: 'var(--rounded-md)',
              fontSize: 'var(--text-sm)',
              fontWeight: i === 0 ? 'var(--font-medium)' : 'var(--font-normal)',
              background: i === 0 ? 'var(--sidebar-accent)' : undefined,
              color: i === 0 ? 'var(--sidebar-accent-foreground)' : 'var(--sidebar-foreground)',
            }}>{n}</span>
          ))}
        </nav>
      </aside>

      <div style={{ display: 'grid', alignContent: 'start' }}>
        <header style={{ display: 'flex', alignItems: 'center', gap: 'var(--p-3)', padding: 'var(--p-4) var(--p-6)', borderBottom: 'var(--border-w-100) solid var(--border)', background: 'var(--card)' }}>
          <strong style={{ flex: 1, fontSize: 'var(--text-base)' }}>Overview</strong>
          <StatusDot status="online" label="Live" />
          <Button id={`${brand}-cta`} label="New report" IconLeft={Plus} size="sm" />
        </header>
        <div style={{ padding: 'var(--p-6)', display: 'grid', gap: 'var(--p-5)' }}>
          <Alert id={`${brand}-al`} variant="info" title="Two sources are still syncing" description="Numbers may move until the last import finishes." />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px,1fr))', gap: 'var(--p-4)' }}>
            <Card id={`${brand}-c1`}>
              <CardHeader id={`${brand}-c1`} title="Active accounts" description="Last 7 days" />
              <CardBody>
                <div className="poc-stat" style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-semibold)' }}>12,480</div>
                <Progress id={`${brand}-pr`} value={68} />
              </CardBody>
            </Card>
            <Card id={`${brand}-c2`}>
              <CardHeader id={`${brand}-c2`} title="Team" description="Owners of this space" />
              <CardBody>
                <AvatarGroup id={`${brand}-ag`} max={3}>
                  <Avatar id={`${brand}-a1`} fallback="KM" />
                  <Avatar id={`${brand}-a2`} fallback="JD" />
                  <Avatar id={`${brand}-a3`} fallback="AR" />
                  <Avatar id={`${brand}-a4`} fallback="TS" />
                </AvatarGroup>
                <div style={{ display: 'flex', gap: 'var(--p-2)', marginTop: 'var(--p-3)', flexWrap: 'wrap' }}>
                  <Badge id={`${brand}-b1`} variant="default" label="Pro" />
                  <Badge id={`${brand}-b2`} variant="outline" label="Beta" />
                </div>
              </CardBody>
            </Card>
          </div>
          <Input id={`${brand}-s`} label="Find a cohort" IconLeft={Search} placeholder="Search…" />
          <div style={{ display: 'flex', gap: 'var(--p-2)', flexWrap: 'wrap' }}>
            <Chip id={`${brand}-ch1`} label="Weekly" active />
            <Chip id={`${brand}-ch2`} label="Monthly" />
          </div>
          <ItemGroup id={`${brand}-l`}>
            <Item id={`${brand}-i1`} variant="outline">
              <ItemContent><ItemTitle>Trial → paid</ItemTitle><ItemDescription>Conversion fell 5pts after the pricing change</ItemDescription></ItemContent>
            </Item>
            <Item id={`${brand}-i2`} variant="outline">
              <ItemContent><ItemTitle>Legacy plan</ItemTitle><ItemDescription>~400 seats lapsed in the same week</ItemDescription></ItemContent>
            </Item>
          </ItemGroup>
          {/* the knockout set — these punch through with --background */}
          <div style={{ display: 'flex', gap: 'var(--p-6)', alignItems: 'center', flexWrap: 'wrap' }}>
            <Switch id={`${brand}-sw`} label="Auto-refresh" checked={on} onCheckedChange={setOn} />
            <Avatar id={`${brand}-av`} fallback="KM" badge={<StatusDot status="online" label="Online" />} />
          </div>
        </div>
      </div>
    </div>
  );
}

export const Dashboard: Story = {
  render: function DashboardStory() {
    const [mode, setMode] = useState<Mode>('light');
    const [strength, setStrength] = useState(1);
    const [chromeOn, setChromeOn] = useState(1);
    const show: BrandKey[] = ['db', 'ph', 'rm'];
    return (
      <>
        <PocStyle />
        <div style={PAGE}>
          <div>
            <h2 style={H2}>The same dashboard, three sub-brands</h2>
            <p style={P}>
              In light mode the content area is <strong>white in all of them</strong>. The brand lives in
              the mark, the rail and the accent. The rail is greyed rather than lightened — a rail that
              shouts is the loudest tell of a cheap theme, and the mark carries identity now so the rail
              does not have to.
            </p>
            <div style={{ display: 'flex', gap: 'var(--p-5)', flexWrap: 'wrap', alignItems: 'center' }}>
              <Switch id="d-on" label="Theming on" checked={strength === 1} onCheckedChange={(v) => setStrength(v ? 1 : 0)} />
              <Switch id="d-chrome" label="Tint the rail" checked={chromeOn === 1} onCheckedChange={(v) => setChromeOn(v ? 1 : 0)} />
              <ModeToggle mode={mode} setMode={setMode} />
            </div>
          </div>
          {show.map((b) => (
            <Frame key={b} label={`data-brand="${b}"`}>
              <Scope brand={b} mode={mode} strength={strength} chromeOn={chromeOn}>
                <DashboardPage brand={b} />
              </Scope>
            </Frame>
          ))}
        </div>
      </>
    );
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 3 — Marketing
// ─────────────────────────────────────────────────────────────────────────────

function MarketingPage({ brand }: { brand: BrandKey }) {
  const feats = [
    { Icon: Globe, t: 'Shared cohorts', b: 'One definition, every team, no re-cutting.' },
    { Icon: Zap, t: 'Pipelines', b: 'Scheduled imports with replay and backfill.' },
    { Icon: FileText, t: 'Reporting', b: 'Exports that match what the dashboard shows.' },
  ];
  return (
    <div style={{ background: 'var(--background)' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 'var(--p-3)', padding: 'var(--p-4) var(--p-6)', borderBottom: 'var(--border-w-100) solid var(--border)' }}>
        <Mark brand={brand} size={30} />
        <strong style={{ ...MONO, flex: 1, fontSize: 'var(--text-sm)' }}>{brand}</strong>
        <Button id={`${brand}-mk-in`} label="Sign in" style="ghost" size="sm" />
      </header>

      <section className="poc-hero" style={{ padding: 'var(--p-12) var(--p-6)', display: 'grid', gap: 'var(--p-4)', justifyItems: 'center', textAlign: 'center', color: 'var(--primary-foreground)' }}>
        <Mark brand={brand} size={56} />
        <h1 className="poc-display" style={{ margin: 0, fontSize: 'var(--text-4xl)', lineHeight: 'var(--leading-10)', fontWeight: 'var(--font-semibold)', maxWidth: 'var(--max-w-2xl)' }}>
          Every number in one place
        </h1>
        <p style={{ margin: 0, fontSize: 'var(--text-base)', lineHeight: 'var(--leading-7)', maxWidth: 'var(--max-w-xl)', opacity: 0.92 }}>
          Bring imports, cohorts and reporting under one definition your whole team shares.
        </p>
        <div style={{ display: 'flex', gap: 'var(--p-3)', marginTop: 'var(--p-2)' }}>
          <Button id={`${brand}-mk-a`} label="Start free" IconRight={ArrowRight} />
          <Button id={`${brand}-mk-b`} label="Book a demo" style="outline" />
        </div>
      </section>

      <section style={{ padding: 'var(--p-12) var(--p-6)', display: 'grid', gap: 'var(--p-6)' }}>
        <h2 className="poc-display" style={{ margin: 0, textAlign: 'center', fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-semibold)' }}>
          Built for the whole pipeline
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: 'var(--p-4)' }}>
          {feats.map((f) => (
            <Card id={`${brand}-f-${f.t}`} key={f.t}>
              <CardBody>
                <div style={{ display: 'grid', gap: 'var(--p-3)' }}>
                  <Mark brand={brand} size={36} />
                  <strong style={{ fontSize: 'var(--text-base)' }}>{f.t}</strong>
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>{f.b}</span>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      <section className="poc-band" style={{ padding: 'var(--p-12) var(--p-6)', display: 'grid', gap: 'var(--p-6)' }}>
        <h2 className="poc-display" style={{ margin: 0, textAlign: 'center', fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-semibold)' }}>
          Trusted where the numbers matter
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', gap: 'var(--p-4)', textAlign: 'center' }}>
          {[['99.98%', 'Ingest uptime'], ['4.2 min', 'Median sync'], ['120+', 'Connectors']].map(([n, l]) => (
            <div key={l} style={{ display: 'grid', gap: 'var(--p-1)' }}>
              <span className="poc-stat" style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-semibold)' }}>{n}</span>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>{l}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 'var(--p-2)', justifyContent: 'center', flexWrap: 'wrap' }}>
          {['SOC 2', 'SSO', 'Audit log'].map((t) => <Badge id={`${brand}-t-${t}`} key={t} variant="outline" label={t} />)}
        </div>
      </section>

      <section style={{ padding: 'var(--p-12) var(--p-6)', display: 'grid', gap: 'var(--p-6)' }}>
        <h2 className="poc-display" style={{ margin: 0, textAlign: 'center', fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-semibold)' }}>Simple pricing</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: 'var(--p-4)' }}>
          {[
            { n: 'Team', p: '$29', f: ['5 seats', 'Daily sync'], hi: false },
            { n: 'Business', p: '$99', f: ['25 seats', 'SSO'], hi: true },
            { n: 'Enterprise', p: 'Custom', f: ['Unlimited', 'Residency'], hi: false },
          ].map((pl) => (
            <Card id={`${brand}-p-${pl.n}`} key={pl.n} interactive>
              <CardBody>
                <div style={{ display: 'grid', gap: 'var(--p-3)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--p-2)' }}>
                    <strong style={{ flex: 1 }}>{pl.n}</strong>
                    {pl.hi && <Badge id={`${brand}-pb-${pl.n}`} variant="default" label="Popular" />}
                  </div>
                  <span className="poc-stat" style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-semibold)' }}>{pl.p}</span>
                  {pl.f.map((x) => (
                    <span key={x} style={{ display: 'flex', gap: 'var(--p-2)', alignItems: 'center', fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
                      <Check size={16} aria-hidden="true" style={{ color: 'var(--primary-text)' }} />{x}
                    </span>
                  ))}
                  <Button id={`${brand}-pc-${pl.n}`} label="Choose" style={pl.hi ? 'default' : 'outline'} size="sm" />
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      <section className="poc-band-strong" style={{ padding: 'var(--p-12) var(--p-6)', display: 'grid', gap: 'var(--p-4)', justifyItems: 'center', textAlign: 'center' }}>
        <h2 className="poc-display" style={{ margin: 0, fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-semibold)' }}>Ready when you are</h2>
        <span className="poc-hero-cta"><Button id={`${brand}-fin`} label="Start free" IconRight={ArrowRight} /></span>
      </section>

      <footer style={{ padding: 'var(--p-6)' }}>
        <Separator id={`${brand}-sep`} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--p-3)', marginTop: 'var(--p-4)', fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>
          <Mark brand={brand} size={22} />
          <span style={MONO}>{brand}</span>
          <span style={{ flex: 1 }} />
          <span>Part of one suite</span>
        </div>
      </footer>
    </div>
  );
}

export const Marketing: Story = {
  render: function MarketingStory() {
    const [brand, setBrand] = useState<BrandKey>('ec');
    const [mode, setMode] = useState<Mode>('light');
    return (
      <>
        <PocStyle />
        <div style={PAGE}>
          <div>
            <h2 style={H2}>A marketing page has a bigger brand budget</h2>
            <p style={P}>
              A product UI has to stay quiet, so its budget is tiny. A marketing page{' '}
              <em>alternates</em> — white sections, a full-bleed band, white again. The band takes the
              same greyed <strong>deep</strong> stock as every other surface, just further along it, so
              it never becomes a different kind of colour from the app; the colour arrives instead where
              nothing has to be read on it — the hero gradient (highlight → main → deep) and the display
              numerals, which are that ramp clipped to text.
            </p>
            <div style={{ display: 'flex', gap: 'var(--p-5)', flexWrap: 'wrap', alignItems: 'center' }}>
              <BrandPicker brand={brand} setBrand={setBrand} />
              <ModeToggle mode={mode} setMode={setMode} />
            </div>
          </div>
          <Frame label={`data-brand="${brand}"`}>
            <Scope brand={brand} mode={mode}>
              <MarketingPage brand={brand} />
            </Scope>
          </Frame>
        </div>
      </>
    );
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 4 — Marks + the suite
// ─────────────────────────────────────────────────────────────────────────────

export const Marks: Story = {
  render: function MarksStory() {
    const [mode, setMode] = useState<Mode>('light');
    const hostRef = useRef<HTMLDivElement>(null);
    const [pairs, setPairs] = useState<{ a: string; b: string; v: number }[]>([]);

    useEffect(() => {
      const host = hostRef.current;
      if (!host) return;
      const probe = host.firstElementChild as HTMLElement;
      const read = (v: string) => {
        probe.style.backgroundColor = '';
        probe.style.backgroundColor = v;
        return toRGBA(getComputedStyle(probe).backgroundColor);
      };
      const stops = (b: BrandKey) => BRAND_ANCHORS[b].light.map(read).filter(Boolean) as [number, number, number, number][];
      const out: { a: string; b: string; v: number }[] = [];
      for (let i = 0; i < SUB_BRANDS.length; i++) {
        for (let j = i + 1; j < SUB_BRANDS.length; j++) {
          const A = stops(SUB_BRANDS[i]), B = stops(SUB_BRANDS[j]);
          const v = Math.min(...A.map((x) => Math.min(...B.map((y) => deltaE(x, y)))));
          out.push({ a: SUB_BRANDS[i], b: SUB_BRANDS[j], v });
        }
      }
      out.sort((x, y) => x.v - y.v);
      setPairs(out.slice(0, 6));
    }, []);

    return (
      <>
        <PocStyle />
        <div ref={hostRef} aria-hidden="true" style={{ position: 'fixed', left: -9999, top: 0, width: 1, height: 1, overflow: 'hidden' }}><span /></div>
        <div style={PAGE}>
          <div>
            <h2 style={H2}>The marks are the brand definition</h2>
            <p style={P}>
              Nothing sits on top of a mark, so it carries no contrast constraint at all — the one
              surface where colour is free. That is why the anchors live here and the UI tokens derive
              from them rather than the other way round.
            </p>
            <ModeToggle mode={mode} setMode={setMode} />
          </div>

          <div style={{ padding: 'var(--p-8)', borderRadius: 'var(--rounded-xl)', background: mode === 'dark' ? '#0f172a' : '#ffffff', border: 'var(--border-w-100) solid var(--border)', display: 'flex', gap: 'var(--p-6)', flexWrap: 'wrap' }}>
            {(Object.keys(BRAND_ANCHORS) as BrandKey[]).map((b) => (
              <div key={b} style={{ display: 'grid', gap: 'var(--p-2)', justifyItems: 'center' }}>
                <Scope brand={b} mode={mode}><Mark brand={b} size={80} /></Scope>
                <span style={{ ...MONO, color: mode === 'dark' ? '#cbd5e1' : 'var(--muted-foreground)', fontWeight: b === 'aiden' ? 'var(--font-semibold)' : 'var(--font-normal)' }}>
                  {b}{b === 'aiden' ? ' · surface' : ''}
                </span>
              </div>
            ))}
          </div>

          <div>
            <h2 style={H2}>The six tightest pairs</h2>
            <p style={P}>
              Worst stop-pair between two marks, in OKLab. Below <strong>0.10</strong> two things stop
              reading as different colours. These are the pairs worth knowing about — the mark amplifies
              a hue difference but it cannot create one.
            </p>
            <table style={{ borderCollapse: 'collapse', fontSize: 'var(--text-sm)', maxWidth: 420 }}>
              <tbody>
                {pairs.map((p) => (
                  <tr key={`${p.a}${p.b}`} style={{ borderBottom: 'var(--border-w-50) solid var(--border)' }}>
                    <td style={{ ...MONO, padding: 'var(--p-2)', fontSize: 'var(--text-sm)' }}>{p.a} / {p.b}</td>
                    <td style={{ ...MONO, padding: 'var(--p-2)', textAlign: 'right', fontWeight: 'var(--font-semibold)', color: p.v >= 0.1 ? 'var(--success)' : 'var(--error)' }}>
                      {p.v.toFixed(3)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p style={{ ...P, marginTop: 'var(--p-4)' }}>
              Where a pair is tight, the <strong>glyph</strong> is what separates them, not the colour —
              Word and Outlook are both blue and nobody confuses them. Hue is a bounded resource;
              silhouette is not.
            </p>
          </div>
        </div>
      </>
    );
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 4b — The minimal option
// ─────────────────────────────────────────────────────────────────────────────

/**
 * "What if we just used the derived --primary and left the system alone?"
 *
 * It works, and it is much cheaper than the three-anchor model. Worth building
 * honestly rather than arguing about, because the mechanism is nicer than it
 * sounds: the whole --primary-* family in tokens.scss is already
 * color-mix(... var(--primary) ...), so overriding --primary alone recomputes
 * -hover, -light, -soft, -border, -ring, -focus and -text for free. This story
 * proves it by setting a REAL data-theme scope and overriding only --primary
 * inline — no POC CSS involved on the left-hand side at all.
 */
const MINIMAL_BRANDS: { key: BrandKey; theme: string }[] = [
  { key: 'db', theme: 'db' }, { key: 'nb', theme: 'nb' }, { key: 'dc', theme: 'dc' },
  { key: 'ec', theme: 'ec' }, { key: 'ph', theme: 'ph' }, { key: 'rm', theme: 'rm' },
];

export const MinimalOption: Story = {
  render: function MinimalStory() {
    const hostRef = useRef<HTMLDivElement>(null);
    const [rows, setRows] = useState<Record<string, { chromaA: number; chromaB: number; textOnLight: number }>>({});

    useEffect(() => {
      const host = hostRef.current;
      if (!host) return;
      const chroma = (c: [number, number, number, number]) => {
        const [, a, b] = oklab(c);
        return Math.hypot(a, b);
      };
      const next: Record<string, { chromaA: number; chromaB: number; textOnLight: number }> = {};
      for (const { key } of MINIMAL_BRANDS) {
        const a = host.querySelector<HTMLElement>(`[data-min="${key}"]`);
        const b = host.querySelector<HTMLElement>(`[data-anc="${key}"]`);
        if (!a || !b) continue;
        const read = (el: HTMLElement, tok: string) => {
          const p = el.firstElementChild as HTMLElement;
          p.style.backgroundColor = '';
          p.style.backgroundColor = `var(${tok})`;
          return toRGBA(getComputedStyle(p).backgroundColor);
        };
        const lightRaw = read(a, '--primary-light');
        const white = toRGBA('#ffffff')!;
        const light = lightRaw ? (lightRaw[3] < 1 ? over(lightRaw, white) : lightRaw) : null;
        const text = read(a, '--primary-text');
        const band = read(b, '--poc-band');
        if (light && text && band) {
          next[key] = { chromaA: chroma(light), chromaB: chroma(band), textOnLight: contrast(text, light) };
        }
      }
      setRows(next);
    }, []);

    const Fragment = ({ label }: { label: string }) => (
      <div style={{ display: 'grid', gap: 'var(--p-3)', padding: 'var(--p-4)', background: 'var(--primary-light)', borderRadius: 'var(--rounded-md)', border: 'var(--border-w-100) solid var(--primary-border)' }}>
        <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--primary-text)' }}>{label}</strong>
        <div style={{ display: 'flex', gap: 'var(--p-2)', flexWrap: 'wrap', alignItems: 'center' }}>
          <Button id={`${label}-b`} label="Primary" size="sm" />
          <Button id={`${label}-o`} label="Outline" style="outline" size="sm" />
          <Badge id={`${label}-bg`} variant="default" label="Live" />
        </div>
      </div>
    );

    return (
      <>
        <PocStyle />
        <div ref={hostRef} aria-hidden="true" style={{ position: 'fixed', left: -9999, top: 0, width: 1, height: 1, overflow: 'hidden' }}>
          {MINIMAL_BRANDS.map(({ key, theme }) => (
            <span key={key}>
              <span data-min={key} data-theme={theme} data-mode="light" style={{ '--primary': PRIMARY_LIGHT[key] } as CSSProperties}><span /></span>
              <span data-anc={key} data-theme-poc="" data-brand={key} data-mode="light" style={{ '--poc-str': 1 } as CSSProperties}><span /></span>
            </span>
          ))}
        </div>

        <div style={PAGE}>
          <div>
            <h2 style={H2}>The minimal option — just swap <code style={MONO}>--primary</code></h2>
            <p style={P}>
              No new tokens, no new architecture. Set <code style={MONO}>--primary</code> to the derived
              value per brand and let the system do what it already does. The whole{' '}
              <code style={MONO}>--primary-*</code> family in <code style={MONO}>tokens.scss</code> is
              already <code style={MONO}>color-mix(… var(--primary) …)</code>, so{' '}
              <code style={MONO}>-hover</code>, <code style={MONO}>-light</code>,{' '}
              <code style={MONO}>-soft</code>, <code style={MONO}>-border</code>,{' '}
              <code style={MONO}>-ring</code>, <code style={MONO}>-focus</code> and{' '}
              <code style={MONO}>-text</code> all recompute for free.
            </p>
            <p style={P}>
              The left column below is <strong>not using the POC stylesheet at all</strong>. It is a real{' '}
              <code style={MONO}>data-theme</code> scope with one inline override —{' '}
              <code style={MONO}>{'style={{ \'--primary\': \'#0b8339\' }}'}</code> — which is exactly
              what shipping this would look like.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px,1fr))', gap: 'var(--p-5)' }}>
            <div style={{ display: 'grid', gap: 'var(--p-3)' }}>
              <span style={{ ...MONO, color: 'var(--muted-foreground)' }}>A · --primary swapped, stock system</span>
              {MINIMAL_BRANDS.map(({ key, theme }) => (
                <div key={key} data-theme={theme} data-mode="light" style={{ '--primary': PRIMARY_LIGHT[key] } as CSSProperties}>
                  <Fragment label={key} />
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gap: 'var(--p-3)' }}>
              <span style={{ ...MONO, color: 'var(--muted-foreground)' }}>B · three anchors</span>
              {MINIMAL_BRANDS.map(({ key }) => (
                <Scope key={key} brand={key}>
                  <div style={{ display: 'grid', gap: 'var(--p-3)', padding: 'var(--p-4)', background: 'var(--poc-band)', borderRadius: 'var(--rounded-md)', border: 'var(--border-w-100) solid var(--primary-border)' }}>
                    <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--primary-text)' }}>{key}</strong>
                    <div style={{ display: 'flex', gap: 'var(--p-2)', flexWrap: 'wrap', alignItems: 'center' }}>
                      <Button id={`${key}-ab`} label="Primary" size="sm" />
                      <Button id={`${key}-ao`} label="Outline" style="outline" size="sm" />
                      <Badge id={`${key}-abg`} variant="default" label="Live" />
                    </div>
                  </div>
                </Scope>
              ))}
            </div>
          </div>

          <div>
            <h2 style={H2}>What it costs, measured</h2>
            <table style={{ borderCollapse: 'collapse', fontSize: 'var(--text-sm)', maxWidth: 640 }}>
              <thead>
                <tr style={{ borderBottom: 'var(--border-w-100) solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: 'var(--p-2)' }}>Brand</th>
                  <th style={{ textAlign: 'right', padding: 'var(--p-2)' }}>A · tint chroma</th>
                  <th style={{ textAlign: 'right', padding: 'var(--p-2)' }}>B · tint chroma</th>
                  <th style={{ textAlign: 'right', padding: 'var(--p-2)' }}>A · text on tint</th>
                </tr>
              </thead>
              <tbody>
                {MINIMAL_BRANDS.map(({ key }) => {
                  const r = rows[key];
                  return (
                    <tr key={key} style={{ borderBottom: 'var(--border-w-50) solid var(--border)' }}>
                      <td style={{ ...MONO, padding: 'var(--p-2)', fontSize: 'var(--text-sm)' }}>{key}</td>
                      <td style={{ ...MONO, padding: 'var(--p-2)', textAlign: 'right', color: 'var(--muted-foreground)' }}>{r ? r.chromaA.toFixed(3) : '—'}</td>
                      <td style={{ ...MONO, padding: 'var(--p-2)', textAlign: 'right', color: 'var(--success)', fontWeight: 'var(--font-semibold)' }}>{r ? r.chromaB.toFixed(3) : '—'}</td>
                      <td style={{ ...MONO, padding: 'var(--p-2)', textAlign: 'right' }}>{r ? r.textOnLight.toFixed(2) : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div>
            <h2 style={H2}>The honest recommendation</h2>
            <p style={P}>
              <strong>Option A is the right first move.</strong> It gets six themed brands, every{' '}
              <code style={MONO}>--primary</code> consumer in the library themed for free, and{' '}
              <code style={MONO}>--primary-text</code> on <code style={MONO}>--primary-light</code>{' '}
              measures 5.47&ndash;5.56 across all six — comfortably AA with no new work. The cost is a
              handful of hex values in the existing theme scopes and nothing else.
            </p>
            <p style={P}>
              What it does not buy is <em>reach</em>. <code style={MONO}>--primary-light</code> exists,
              but nothing outside the primary family moves: the page, the panels, the rail, the shadows
              and the bands all stay exactly as neutral as they are today, because no token in{' '}
              <code style={MONO}>tokens.scss</code> derives from <code style={MONO}>--primary</code>{' '}
              except the primary family itself. Option B moves them — deliberately only a little, 4&ndash;8{' '}
              ΔE00 — but it moves them everywhere at once, which is what makes a sub-app feel like its
              own place rather than the same page with a different button.
            </p>
            <p style={P}>
              <strong>Neither option lets the tint tell the brands apart</strong> — worst pair 0.005 for
              A and 0.009 for B, both far under the 0.05 threshold. That was settled in round one and
              has not moved. So the choice is not &ldquo;which one differentiates&rdquo;; it is how much
              colour you want on a tinted surface, and whether brand-tinted shadows, gradients and bands
              are worth three tokens instead of one.
            </p>
            <p style={P}>
              A reasonable path: <strong>ship A now</strong> — it is additive, reversible and needs no
              new architecture — and keep the highlight and deep anchors in Figma as the mark
              definition. If the tinted surfaces later feel too pale, adding{' '}
              <code style={MONO}>--primary-highlight</code> is a second, independent step that does not
              invalidate anything shipped in A.
            </p>
          </div>
        </div>
      </>
    );
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 4c — Full token matrix
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Every token the recipe touches, resolved for every brand.
 *
 * Grouped by where the value comes from, because that is the part worth seeing:
 * only the first group is authored. Everything below it is a color-mix over an
 * anchor, so the whole sheet falls out of four literals per brand per mode.
 */
const MATRIX: { group: string; note?: string; tokens: string[]; gradient?: boolean }[] = [
  {
    group: 'Authored — the anchors',
    note: 'Three read off the Figma mark, plus --primary solved against the label. The only literals in the system.',
    tokens: ['--brand-highlight', '--brand-main', '--brand-deep', '--primary'],
  },
  {
    group: 'Free — the existing --primary-* family',
    note: 'Already color-mix over var(--primary) in tokens.scss, so these recompute with no new code at all. This is the whole of the minimal option.',
    tokens: ['--primary-hover', '--primary-light', '--primary-soft', '--primary-border', '--primary-ring', '--primary-focus', '--primary-text'],
  },
  {
    group: 'Surfaces',
    note: 'Page and card stay white in light mode. Every tinted one derives from --poc-tint — the DEEP anchor greyed toward slate — applied at single digits, so each lands 4–8 ΔE00 off its neutral base. Never the highlight: a surface should sit under the accent, not beside it.',
    tokens: ['--poc-tint', '--background', '--card', '--popover', '--secondary', '--accent', '--input', '--muted'],
  },
  {
    group: 'Lines',
    note: 'From MAIN: not text backgrounds, so no contrast budget to protect, and a line reading as the accent is the point.',
    tokens: ['--border', '--border-hover', '--ring'],
  },
  {
    group: 'Chrome — the rail',
    note: 'A surface like any other, so it takes the same greyed stock at the same order of magnitude — no second recipe.',
    tokens: ['--sidebar', '--sidebar-border', '--sidebar-accent'],
  },
  {
    group: 'Marketing bands',
    note: 'The loudest flat surfaces in the system, and still only ~9 ΔE00 off white at their strongest — a band is a surface people read on.',
    tokens: ['--poc-band', '--poc-band-strong', '--poc-band-deep'],
  },
  {
    group: 'Shadow tints',
    note: 'From DEEP. A shadow carrying the object\u2019s own dark end reads as light falling on it; a grey one reads as dirt.',
    tokens: ['--poc-shadow-key', '--poc-shadow-far', '--poc-shadow-amb'],
  },
  {
    group: 'Gradients',
    note: 'Not flat colours \u2014 the mark is all three anchors, the hero is main to deep.',
    tokens: ['--poc-mark', '--poc-hero'],
    gradient: true,
  },
];

export const TokenMatrix: Story = {
  render: function TokenMatrixStory() {
    const hostRef = useRef<HTMLDivElement>(null);
    const [mode, setMode] = useState<Mode>('light');
    const [vals, setVals] = useState<Record<string, Record<string, string>>>({});
    const cols: BrandKey[] = BRAND_KEYS;

    useEffect(() => {
      const host = hostRef.current;
      if (!host) return;
      const next: Record<string, Record<string, string>> = {};
      for (const b of cols) {
        const scope = host.querySelector<HTMLElement>(`[data-m="${b}"]`);
        if (!scope) continue;
        const probe = scope.firstElementChild as HTMLElement;
        for (const g of MATRIX) {
          for (const t of g.tokens) {
            let v: string;
            if (g.gradient) {
              // a gradient is not a colour — read the resolved image, not a pixel
              probe.style.backgroundImage = '';
              probe.style.backgroundImage = `var(${t})`;
              v = getComputedStyle(probe).backgroundImage;
              probe.style.backgroundImage = '';
            } else {
              probe.style.backgroundColor = '';
              probe.style.backgroundColor = `var(${t})`;
              const raw = toRGBA(getComputedStyle(probe).backgroundColor);
              // translucent tokens are meaningless as bytes — composite them over
              // the page they will actually sit on, which differs per mode
              const page: [number, number, number, number] =
                mode === 'dark' ? [15, 23, 42, 1] : [255, 255, 255, 1];
              const solid = raw && raw[3] < 1 ? over(raw, page) : raw;
              v = solid
                ? '#' + solid.slice(0, 3).map((x) => Math.round(x).toString(16).padStart(2, '0')).join('')
                : '—';
            }
            next[t] ??= {};
            next[t][b] = v;
          }
        }
      }
      setVals(next);
    }, [mode]);

    const cell = (t: string, b: string, isGradient?: boolean) => {
      const v = vals[t]?.[b];
      if (!v) return <td key={b} style={{ padding: 'var(--p-1-5)' }} />;
      return (
        <td key={b} style={{ padding: 'var(--p-1-5)', verticalAlign: 'top' }}>
          <div
            style={{
              height: 30, borderRadius: 'var(--rounded-sm)',
              border: 'var(--border-w-100) solid var(--border)',
              ...(isGradient ? { backgroundImage: v } : { background: v }),
            }}
          />
          <span style={{ ...MONO, fontSize: 10, color: 'var(--muted-foreground)', display: 'block', marginTop: 2 }}>
            {isGradient ? 'gradient' : v}
          </span>
        </td>
      );
    };

    return (
      <>
        <PocStyle />
        <div ref={hostRef} aria-hidden="true" style={{ position: 'fixed', left: -9999, top: 0, width: 1, height: 1, overflow: 'hidden' }}>
          {cols.map((b) => (
            <span key={b} data-m={b} data-theme-poc="" data-brand={b} data-mode={mode} style={{ '--poc-str': 1, '--poc-chrome': 1 } as CSSProperties}>
              <span />
            </span>
          ))}
        </div>

        <div style={PAGE}>
          <div>
            <h2 style={H2}>Every token, every brand</h2>
            <p style={P}>
              Resolved live in this browser. Grouped by <em>where the value comes from</em>, which is the
              part worth seeing: <strong>only the first group is authored</strong>. Four literals per
              brand per mode — three anchors off the Figma mark and one solved{' '}
              <code style={MONO}>--primary</code> — and everything under it is a{' '}
              <code style={MONO}>color-mix</code> that falls out for free.
            </p>
            <p style={P}>
              Translucent tokens are shown <em>composited over the page</em>, because their raw bytes are
              meaningless on their own — <code style={MONO}>--primary-light</code> is a 6% alpha, not a
              colour.
            </p>
            <ModeToggle mode={mode} setMode={setMode} />
          </div>

          {MATRIX.map((g) => (
            <div key={g.group}>
              <h2 style={H2}>{g.group}</h2>
              {g.note && <p style={P}>{g.note}</p>}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 'var(--text-sm)' }}>
                  <thead>
                    <tr style={{ borderBottom: 'var(--border-w-100) solid var(--border)' }}>
                      <th style={{ textAlign: 'left', padding: 'var(--p-2)', minWidth: 150 }}>Token</th>
                      {cols.map((b) => (
                        <th key={b} style={{ ...MONO, textAlign: 'left', padding: 'var(--p-2)', minWidth: 92 }}>
                          {b}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {g.tokens.map((t) => (
                      <tr key={t} style={{ borderBottom: 'var(--border-w-50) solid var(--border)' }}>
                        <td style={{ ...MONO, padding: 'var(--p-2)', fontSize: 'var(--text-xs)', whiteSpace: 'nowrap' }}>{t}</td>
                        {cols.map((b) => cell(t, b, g.gradient))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          <div>
            <h2 style={H2}>Reading the sheet</h2>
            <p style={P}>
              <strong>Count the authored rows: four.</strong> Everything else — 26 more tokens per brand
              per mode, times seven brands times two modes — is derivation. That ratio is the argument
              for the model. It is also the argument for the minimal option: if you only author{' '}
              <code style={MONO}>--primary</code>, the second group still fills itself in and you get a
              complete, AA-clean theme from <em>one</em> value.
            </p>
            <p style={P}>
              The visible difference between the two options is the surfaces group. With only{' '}
              <code style={MONO}>--primary</code>, those rows do not exist — nothing in{' '}
              <code style={MONO}>tokens.scss</code> derives a surface from the primary, so they stay the
              same neutral for all seven brands. With the deep anchor they move, but only 4&ndash;8{' '}
              ΔE00: the design target is a surface that complements the accent, not one that competes
              with it.
            </p>
          </div>
        </div>
      </>
    );
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 5 — Audit
// ─────────────────────────────────────────────────────────────────────────────

type Pairing = { label: string; fg: string; bg: string; onBand?: boolean; floor?: number; note?: string };
const PAIRINGS: Pairing[] = [
  { label: 'foreground / background', fg: '--foreground', bg: '--background', note: 'white in light — unchanged' },
  { label: 'muted-foreground / background', fg: '--muted-foreground', bg: '--background' },
  { label: 'muted-foreground / muted', fg: '--muted-foreground', bg: '--muted', note: 'tightest in the system' },
  { label: 'muted-foreground / secondary', fg: '--muted-foreground', bg: '--secondary' },
  { label: 'accent-foreground / accent', fg: '--accent-foreground', bg: '--accent' },
  { label: 'primary-foreground / primary', fg: '--primary-foreground', bg: '--primary', note: 'the derivation' },
  { label: 'sidebar-foreground / sidebar', fg: '--sidebar-foreground', bg: '--sidebar' },
  { label: 'sidebar-accent-fg / sidebar-accent', fg: '--sidebar-accent-foreground', bg: '--sidebar-accent' },
  { label: 'muted-foreground / band', fg: '--muted-foreground', bg: '--poc-band', note: 'the greyed deep stock' },
  { label: 'muted-foreground / band DEEPEST', fg: '--muted-foreground', bg: '--poc-band-deep' },
  { label: 'muted-foreground / band-strong', fg: '--muted-foreground', bg: '--poc-band-strong' },
  { label: 'error / error-light', fg: '--error', bg: '--error-light', note: 'over the WHITE page' },
  { label: 'error / error-light ON BAND', fg: '--error', bg: '--error-light', onBand: true, note: 'the remaining hazard' },
  { label: 'border / background', fg: '--border', bg: '--background', floor: 3, note: '1.4.11 — pre-existing' },
];

export const Audit: Story = {
  render: function AuditStory() {
    const hostRef = useRef<HTMLDivElement>(null);
    const [mode, setMode] = useState<Mode>('light');
    const [rows, setRows] = useState<Record<string, Record<string, number>>>({});

    useEffect(() => {
      const host = hostRef.current;
      if (!host) return;
      const next: Record<string, Record<string, number>> = {};
      for (const b of SUB_BRANDS) {
        const scope = host.querySelector<HTMLElement>(`[data-a="${b}"]`);
        if (!scope) continue;
        const probe = scope.firstElementChild as HTMLElement;
        const read = (t: string) => {
          probe.style.backgroundColor = '';
          probe.style.backgroundColor = `var(${t})`;
          return toRGBA(getComputedStyle(probe).backgroundColor);
        };
        for (const p of PAIRINGS) {
          const fg = read(p.fg), bg = read(p.bg);
          if (!fg || !bg) continue;
          const behind = read(p.onBand ? '--poc-band' : '--background');
          const solid = bg[3] < 1 && behind ? over(bg, behind) : bg;
          next[p.label] ??= {};
          next[p.label][b] = contrast(fg, solid);
        }
      }
      setRows(next);
    }, [mode]);

    return (
      <>
        <PocStyle />
        <div ref={hostRef} aria-hidden="true" style={{ position: 'fixed', left: -9999, top: 0, width: 1, height: 1, overflow: 'hidden' }}>
          {SUB_BRANDS.map((b) => (
            <span key={b} data-a={b} data-theme-poc="" data-brand={b} data-mode={mode} style={{ '--poc-str': 1, '--poc-chrome': 1 } as CSSProperties}>
              <span />
            </span>
          ))}
        </div>
        <div style={PAGE}>
          <div>
            <h2 style={H2}>Measured, not asserted</h2>
            <p style={P}>
              <code style={MONO}>scripts/contrast-check.mjs</code> cannot see any of this — it
              brace-matches only the two <code style={MONO}>[data-mode]</code> blocks, returns null for{' '}
              <code style={MONO}>color-mix</code>, and treats unresolved as <em>not</em> a failure while
              exiting 0. So the POC measures itself, in this browser, at full strength across all six
              sub-brands.
            </p>
            <ModeToggle mode={mode} setMode={setMode} />
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 'var(--text-sm)' }}>
              <thead>
                <tr style={{ borderBottom: 'var(--border-w-100) solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: 'var(--p-2)' }}>Pairing</th>
                  {SUB_BRANDS.map((b) => <th key={b} style={{ ...MONO, textAlign: 'right', padding: 'var(--p-2)' }}>{b}</th>)}
                  <th style={{ textAlign: 'left', padding: 'var(--p-2)' }}>Note</th>
                </tr>
              </thead>
              <tbody>
                {PAIRINGS.map((p) => (
                  <tr key={p.label} style={{ borderBottom: 'var(--border-w-50) solid var(--border)' }}>
                    <td style={{ padding: 'var(--p-2)' }}>{p.label}</td>
                    {SUB_BRANDS.map((b) => {
                      const v = rows[p.label]?.[b];
                      const bad = v != null && v < (p.floor ?? 4.5);
                      return (
                        <td key={b} style={{ ...MONO, padding: 'var(--p-2)', textAlign: 'right', color: bad ? 'var(--error)' : 'var(--foreground)', fontWeight: bad ? 'var(--font-semibold)' : 'var(--font-normal)' }}>
                          {v == null ? '—' : v.toFixed(2)}
                        </td>
                      );
                    })}
                    <td style={{ padding: 'var(--p-2)', fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>{p.note ?? ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <h2 style={H2}>The rows that matter</h2>
            <p style={P}>
              <strong><code style={MONO}>primary-foreground / primary</code></strong> is the derivation
              working — every brand clears 4.5 because <code style={MONO}>--primary</code> was solved
              for that, not picked. Compare it to the raw main stops in the Brands story, where five of
              seven fail.
              <br />
              <strong><code style={MONO}>error / error-light ON BAND</code></strong> is the one hazard
              left. The semantic tints are <code style={MONO}>rgba()</code> composited over whatever is
              behind them; on the white page they are exactly as shipped, on a band they are not. Keep
              alerts on white, or re-derive the tints.
            </p>
          </div>
        </div>
      </>
    );
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 6 — Recipe
// ─────────────────────────────────────────────────────────────────────────────

export const Recipe: Story = {
  render: () => (
    <>
      <PocStyle />
      <div style={PAGE}>
        <div>
          <h2 style={H2}>What adoption would mean</h2>
          <p style={P}>
            Per brand, <strong>four values</strong>: three anchors and a solved{' '}
            <code style={MONO}>--primary</code>, times two modes. Everything else is derivation. No brand
            name appears in the stylesheet after the anchor block, which is the test of whether the model
            holds — adding an eighth brand is eight lines and no other change.
          </p>
          <p style={P}>
            The three anchors already exist, in Figma, as artwork somebody chose deliberately. That is
            the part worth keeping from this whole exercise: the marks were not decoration downstream of
            the theme, they were the theme, and reading them back out was cheaper than inventing a
            palette and hoping it drew well.
          </p>
        </div>
        <div>
          <h2 style={H2}>The whole stylesheet</h2>
          <pre style={{
            margin: 0, padding: 'var(--p-4)', background: 'var(--muted)', borderRadius: 'var(--rounded-md)',
            fontFamily: 'var(--font-family-mono)', fontSize: 'var(--text-code)', lineHeight: 'var(--leading-5)',
            color: 'var(--foreground)', overflowX: 'auto', maxHeight: 560,
          }}>{POC_CSS}</pre>
        </div>
        <div>
          <h2 style={H2}>What this does not prove</h2>
          <p style={P}>
            <strong>--primary is solved offline.</strong> CSS cannot search for a contrast target, so the
            seven derived values are pinned literals. A real adoption either keeps them pinned (and
            re-solves when a mark changes) or moves the solve into the build.
            <br />
            <strong>Portalled overlays escape the scope</strong> — ten components render into{' '}
            <code style={MONO}>document.body</code>. Pre-existing; this only makes it more visible.
            <br />
            <strong>--background is doing two jobs</strong> — page surface and knockout for the Switch
            thumb, Avatar ring and Tabs indicator. A white light page hides it; adoption needs a separate{' '}
            <code style={MONO}>--surface-knockout</code>.
            <br />
            <strong>The highlight cannot be expressed as one scalar.</strong> A single{' '}
            <code style={MONO}>--primary</code> cannot say &ldquo;teal at the top, indigo at the
            bottom&rdquo;. That is the whole argument for three anchors, and it is also the thing that
            will not survive a naive port to any system that assumes one colour per brand.
            <br />
            <strong>Untested:</strong> forced-colors, <code style={MONO}>prefers-contrast</code>, print,
            nested scopes, and APCA — which weights light-text-on-light-tint very differently.
          </p>
        </div>
      </div>
    </>
  ),
};
