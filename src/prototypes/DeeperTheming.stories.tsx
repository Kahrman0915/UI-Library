import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { POC_CSS } from './deeperThemingRecipe';
import {
  ArrowRight,
  Calendar,
  ChartColumn,
  Check,
  FileText,
  Plus,
  Search,
  Settings,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
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
  Input,
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
  Progress,
  Separator,
  StatusDot,
  Switch,
} from '../index';

/**
 * PROOF OF CONCEPT — deeper theming.  Round 4.
 *
 * THE QUESTION: eight sub-apps under one parent, like Office or the Apple
 * suite. Each has to stand on its own AND read as part of one ecosystem.
 * Today a `data-theme` scope reaches 9 of ~452 tokens and all nine are
 * `--primary`, so the apps read as "the same app with a different button".
 *
 * WHAT THE EARLIER ROUNDS SETTLED (kept here so the dead ends stay dead):
 *
 *  1. Tinting the PAGE cannot differentiate brands. Only ~10% of a primary's
 *     chroma survives into a surface pale enough to carry body text. Pushing
 *     the tint from 22% to 70% moved the closest pair from ΔE 0.004 to 0.014 —
 *     still three times under "tellable apart" — while dragging error-on-tint
 *     from 4.72 to 2.89. The page can be pushed into unreadable, not into
 *     carrying identity.
 *  2. Rotating to the COMPLEMENT does not help: a rigid rotation of the hue
 *     wheel preserves every pairwise distance, and three of eight complements
 *     landed on a semantic hue.
 *  3. Identity belongs in the MARK. Nothing sits on top of a mark, so it has no
 *     contrast constraint at all — the one surface where colour is free. Same
 *     pair, 0.010 as pages vs 0.128 as marks.
 *
 * ROUND 4, and the owner's call that shapes it: **in light mode the main
 * background stays WHITE.** That is not a compromise, it is the fix. It keeps
 * every semantic tint composited over the surface the system was designed
 * against, which deletes the entire class of failure round 1 found. The tint
 * moves to the surfaces that can actually afford it — the rail, section bands,
 * and the secondary/accent panels.
 *
 * Scope is deliberately narrowed to **db, dc and ec**. dc and ec are the
 * CLOSEST pair in the palette (37 degrees apart) and therefore the hardest
 * case; db sits well away from both, so it shows what the model looks like when
 * the hues are not fighting. Three brands is also the smallest set that shows a
 * FAMILY rather than a comparison — two things look like a before and after,
 * three start to look like a system.
 *
 * CONTAINMENT — unchanged and still the point. Every selector contains
 * `[data-theme-poc]`, an attribute that appears nowhere else in the repo, and
 * mode is stamped on the SAME element (`[data-theme-poc][data-mode='light']`)
 * so an inner dark block inside a light page cannot inherit the wrong rule.
 * Nothing outside this file is modified: no token, no component, no story.
 */

// ─────────────────────────────────────────────────────────────────────────────
// The POC stylesheet
// ─────────────────────────────────────────────────────────────────────────────

/** Injected once. Every rule is scoped to `[data-theme-poc]`. */
function PocStyle() {
  return <style>{POC_CSS}</style>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Colour measurement
// ─────────────────────────────────────────────────────────────────────────────

/**
 * `scripts/contrast-check.mjs` cannot see any of this — it brace-matches only
 * the two `[data-mode]` blocks, returns null for `color-mix`, and treats
 * unresolved as NOT a failure while still exiting 0. So the POC measures itself.
 */

let ctx: CanvasRenderingContext2D | null = null;
/**
 * Normalise ANY CSS colour string to bytes.
 *
 * Chrome serialises a color-mix result as `color(srgb …)` and a relative-colour
 * result as `oklch(…)`. Rather than write a parser per serialisation, hand the
 * string to a 1x1 canvas and read the pixel back. `globalCompositeOperation =
 * 'copy'` keeps source alpha instead of compositing onto what was there.
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
  // so reset to a known colour first.
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

/**
 * OKLab — used for "are these two brands the same colour", which WCAG has no
 * opinion about. Contrast answers "can I read it", not "can I tell these apart".
 *   < 0.02  invisible except as a gradient
 *   < 0.05  effectively the same colour
 *   < 0.10  distinguishable side by side, not from memory
 *   >= 0.10 reads as a different colour
 */
function oklab([r, g, b]: [number, number, number, number]) {
  const R = srgbToLin(r);
  const G = srgbToLin(g);
  const B = srgbToLin(b);
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ] as const;
}

function deltaE(
  a: [number, number, number, number],
  b: [number, number, number, number],
) {
  const [l1, a1, b1] = oklab(a);
  const [l2, a2, b2] = oklab(b);
  return Math.hypot(l1 - l2, a1 - a2, b1 - b2);
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared data + UI
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Narrowed to two brands on purpose.
 *
 * dc and ec are the CLOSEST pair in the palette — 37 degrees apart as primaries,
 * and the pair that round 1 measured at ΔE 0.006 as tinted pages, i.e. the same
 * colour. They are the hardest case, so they are the honest test. db is the
 * control: far enough from both that it shows the model working when the hues
 * are not fighting each other.
 *
 * Labelled by CODE, never by product name — CLAUDE.md records that expanding
 * these codes was undone once already. The icons are illustrative.
 */
const APPS = [
  { brand: 'db', Icon: ChartColumn },
  { brand: 'dc', Icon: FileText },
  { brand: 'ec', Icon: Calendar },
] as const;
type Brand = (typeof APPS)[number]['brand'];
const BRANDS: Brand[] = ['db', 'dc', 'ec'];

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
const MONO: CSSProperties = {
  fontFamily: 'var(--font-family-mono)',
  fontSize: 'var(--text-xs)',
};

/** A themed scope, optionally with the POC layered on. */
function Scope({
  brand,
  poc,
  strength = 1,
  chromeOn = 1,
  mode,
  children,
}: {
  brand: Brand | '';
  poc?: boolean;
  strength?: number;
  chromeOn?: number;
  mode?: 'light' | 'dark';
  children: ReactNode;
}) {
  return (
    <div
      data-theme={brand || undefined}
      data-mode={mode}
      {...(poc ? { 'data-theme-poc': '' } : {})}
      style={
        poc
          ? ({ '--poc-str': strength, '--poc-chrome': chromeOn } as CSSProperties)
          : undefined
      }
    >
      {children}
    </div>
  );
}

function Mark({ Icon, size = 40 }: { Icon: LucideIcon; size?: number }) {
  return (
    <span className="poc-mark" style={{ width: size, height: size }}>
      <Icon size={Math.round(size * 0.5)} strokeWidth={2} aria-hidden="true" />
    </span>
  );
}

/** Wraps each specimen so it reads as a device rather than a loose fragment. */
function Frame({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: 'grid', gap: 'var(--p-2)' }}>
      <span style={{ ...MONO, color: 'var(--muted-foreground)' }}>{label}</span>
      <div
        style={{
          border: 'var(--border-w-100) solid var(--border)',
          borderRadius: 'var(--rounded-lg)',
          overflow: 'hidden',
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Specimen 1 — a dashboard with a sidebar
// ─────────────────────────────────────────────────────────────────────────────

function DashboardPage({ brand, Icon }: { brand: Brand; Icon: LucideIcon }) {
  const [on, setOn] = useState(true);
  const nav = [
    { label: 'Overview', active: true },
    { label: 'Cohorts', active: false },
    { label: 'Exports', active: false },
    { label: 'Settings', active: false },
  ];
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '200px minmax(0,1fr)',
        minHeight: 560,
        background: 'var(--background)',
      }}
    >
      {/* The rail is the brand surface. It uses its OWN foreground tokens
          throughout — --muted-foreground on a tinted rail measures 2.92. */}
      <aside
        className="poc-rail"
        style={{
          // backgroundColor, NOT the `background` shorthand. Inline styles beat
          // the stylesheet, and the shorthand resets background-image to none —
          // which silently deleted .poc-rail's gradient while the inset edge
          // from the same rule kept working, so the rule looked healthy.
          backgroundColor: 'var(--sidebar)',
          borderRight: 'var(--border-w-100) solid var(--sidebar-border)',
          padding: 'var(--p-4)',
          display: 'grid',
          alignContent: 'start',
          gap: 'var(--p-4)',
          color: 'var(--sidebar-foreground)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--p-2-5)' }}>
          <Mark Icon={Icon} size={32} />
          <strong style={{ ...MONO, fontSize: 'var(--text-sm)' }}>{brand}</strong>
        </div>
        <nav style={{ display: 'grid', gap: 'var(--p-0-5)' }}>
          {nav.map((n) => (
            <span
              key={n.label}
              style={{
                padding: 'var(--p-2) var(--p-2-5)',
                borderRadius: 'var(--rounded-md)',
                fontSize: 'var(--text-sm)',
                fontWeight: n.active ? 'var(--font-medium)' : 'var(--font-normal)',
                background: n.active ? 'var(--sidebar-accent)' : undefined,
                color: n.active
                  ? 'var(--sidebar-accent-foreground)'
                  : 'var(--sidebar-foreground)',
              }}
            >
              {n.label}
            </span>
          ))}
        </nav>
      </aside>

      <div style={{ display: 'grid', alignContent: 'start' }}>
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--p-3)',
            padding: 'var(--p-4) var(--p-6)',
            borderBottom: 'var(--border-w-100) solid var(--border)',
            background: 'var(--card)',
          }}
        >
          <strong style={{ flex: 1, fontSize: 'var(--text-base)' }}>Overview</strong>
          <StatusDot status="online" label="Live" />
          <Button id={`${brand}-dash-cta`} label="New report" IconLeft={Plus} size="sm" />
        </header>

        <div style={{ padding: 'var(--p-6)', display: 'grid', gap: 'var(--p-5)' }}>
          <Alert
            id={`${brand}-dash-alert`}
            variant="info"
            title="Two sources are still syncing"
            description="Numbers may move until the last import finishes."
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 'var(--p-4)',
            }}
          >
            <Card id={`${brand}-c1`}>
              <CardHeader id={`${brand}-c1`} title="Active accounts" description="Last 7 days" />
              <CardBody>
                <div
                  className="poc-stat"
                  style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-semibold)' }}
                >
                  12,480
                </div>
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
                <div
                  style={{
                    display: 'flex',
                    gap: 'var(--p-2)',
                    marginTop: 'var(--p-3)',
                    flexWrap: 'wrap',
                  }}
                >
                  <Badge id={`${brand}-b1`} variant="default" label="Pro" />
                  <Badge id={`${brand}-b2`} variant="outline" label="Beta" />
                </div>
              </CardBody>
            </Card>
          </div>

          <Input
            id={`${brand}-search`}
            label="Find a cohort"
            IconLeft={Search}
            placeholder="Search…"
          />

          <div style={{ display: 'flex', gap: 'var(--p-2)', flexWrap: 'wrap' }}>
            <Chip id={`${brand}-ch1`} label="Weekly" active />
            <Chip id={`${brand}-ch2`} label="Monthly" />
            <Chip id={`${brand}-ch3`} label="Quarterly" />
          </div>

          <ItemGroup id={`${brand}-list`}>
            <Item id={`${brand}-i1`} variant="outline">
              <ItemContent>
                <ItemTitle>Trial → paid</ItemTitle>
                <ItemDescription>Conversion fell 5pts after the pricing change</ItemDescription>
              </ItemContent>
            </Item>
            <Item id={`${brand}-i2`} variant="outline">
              <ItemContent>
                <ItemTitle>Legacy plan</ItemTitle>
                <ItemDescription>~400 seats lapsed in the same week</ItemDescription>
              </ItemContent>
            </Item>
          </ItemGroup>

          {/* The knockout set — Switch thumb, Avatar ring and the Slider thumb
              all use --background as a KNOCKOUT rather than as a page colour.
              Keeping the page white means they stay correct for free; a tinted
              page is exactly what breaks them, and is why adoption would need a
              separate --surface-knockout token. */}
          <div style={{ display: 'flex', gap: 'var(--p-6)', alignItems: 'center', flexWrap: 'wrap' }}>
            <Switch id={`${brand}-sw`} label="Auto-refresh" checked={on} onCheckedChange={setOn} />
            <Avatar
              id={`${brand}-av`}
              fallback="KM"
              badge={<StatusDot status="online" label="Online" />}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Specimen 2 — a marketing page
// ─────────────────────────────────────────────────────────────────────────────

function MarketingPage({ brand, Icon }: { brand: Brand; Icon: LucideIcon }) {
  const features = [
    { Icon: Users, title: 'Shared cohorts', body: 'One definition, every team, no re-cutting.' },
    { Icon: Settings, title: 'Pipelines', body: 'Scheduled imports with replay and backfill.' },
    { Icon: FileText, title: 'Reporting', body: 'Exports that match what the dashboard shows.' },
  ];
  return (
    <div style={{ background: 'var(--background)' }}>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--p-3)',
          padding: 'var(--p-4) var(--p-6)',
          borderBottom: 'var(--border-w-100) solid var(--border)',
        }}
      >
        <Mark Icon={Icon} size={30} />
        <strong style={{ ...MONO, flex: 1, fontSize: 'var(--text-sm)' }}>{brand}</strong>
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>Pricing</span>
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>Docs</span>
        <Button id={`${brand}-mk-signin`} label="Sign in" style="ghost" size="sm" />
      </header>

      {/* HERO — the gradient, at the one moment the brand should be loudest. */}
      <section
        className="poc-hero"
        style={{
          padding: 'var(--p-12) var(--p-6)',
          display: 'grid',
          gap: 'var(--p-4)',
          justifyItems: 'center',
          textAlign: 'center',
          color: 'var(--primary-foreground)',
        }}
      >
        <Mark Icon={Icon} size={56} />
        <h1
          className="poc-display"
          style={{
            margin: 0,
            fontSize: 'var(--text-4xl)',
            lineHeight: 'var(--leading-10)',
            fontWeight: 'var(--font-semibold)',
            maxWidth: 'var(--max-w-2xl)',
          }}
        >
          Every number in one place
        </h1>
        <p
          style={{
            margin: 0,
            fontSize: 'var(--text-base)',
            lineHeight: 'var(--leading-7)',
            maxWidth: 'var(--max-w-xl)',
            opacity: 0.92,
          }}
        >
          Bring imports, cohorts and reporting under a single definition your whole team shares.
        </p>
        <div style={{ display: 'flex', gap: 'var(--p-3)', marginTop: 'var(--p-2)' }}>
          <Button id={`${brand}-mk-cta`} label="Start free" IconRight={ArrowRight} />
          <Button id={`${brand}-mk-cta2`} label="Book a demo" style="outline" />
        </div>
      </section>

      {/* WHITE section — the page's default state. */}
      <section style={{ padding: 'var(--p-12) var(--p-6)', display: 'grid', gap: 'var(--p-6)' }}>
        <div style={{ textAlign: 'center', display: 'grid', gap: 'var(--p-2)' }}>
          <h2 className="poc-display" style={{ margin: 0, fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-semibold)' }}>
            Built for the whole pipeline
          </h2>
          <p style={{ ...P, margin: '0 auto' }}>From ingest to the number on the slide.</p>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 'var(--p-4)',
          }}
        >
          {features.map((f) => (
            <Card id={`${brand}-f-${f.title}`} key={f.title}>
              <CardBody>
                <div style={{ display: 'grid', gap: 'var(--p-3)' }}>
                  <Mark Icon={f.Icon} size={36} />
                  <strong style={{ fontSize: 'var(--text-base)' }}>{f.title}</strong>
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
                    {f.body}
                  </span>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      {/* BAND — the tinted strip. On a white page this is where a large area of
          brand colour can live, because it reads as a deliberate break in the
          page rather than as the page itself. */}
      <section
        className="poc-band"
        style={{ padding: 'var(--p-12) var(--p-6)', display: 'grid', gap: 'var(--p-6)' }}
      >
        <div style={{ textAlign: 'center', display: 'grid', gap: 'var(--p-2)' }}>
          <h2 className="poc-display" style={{ margin: 0, fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-semibold)' }}>
            Trusted where the numbers matter
          </h2>
          <p style={{ ...P, margin: '0 auto' }}>
            The tinted band is the same component set on a brand surface.
          </p>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 'var(--p-4)',
            textAlign: 'center',
          }}
        >
          {[
            ['99.98%', 'Ingest uptime'],
            ['4.2 min', 'Median sync'],
            ['120+', 'Connectors'],
          ].map(([n, l]) => (
            <div key={l} style={{ display: 'grid', gap: 'var(--p-1)' }}>
              <span
                className="poc-stat"
                style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-semibold)' }}
              >
                {n}
              </span>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
                {l}
              </span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 'var(--p-2)', justifyContent: 'center', flexWrap: 'wrap' }}>
          {['SOC 2', 'SSO', 'Audit log', 'Residency'].map((t) => (
            <Badge id={`${brand}-t-${t}`} key={t} variant="outline" label={t} />
          ))}
        </div>
      </section>

      {/* Pricing on white again, so the band reads as a break rather than a mode. */}
      <section style={{ padding: 'var(--p-12) var(--p-6)', display: 'grid', gap: 'var(--p-6)' }}>
        <h2
          className="poc-display"
          style={{
            margin: 0,
            textAlign: 'center',
            fontSize: 'var(--text-2xl)',
            fontWeight: 'var(--font-semibold)',
          }}
        >
          Simple pricing
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 'var(--p-4)',
          }}
        >
          {[
            { name: 'Team', price: '$29', feats: ['5 seats', 'Daily sync', 'Email support'], hi: false },
            { name: 'Business', price: '$99', feats: ['25 seats', 'Hourly sync', 'SSO'], hi: true },
            { name: 'Enterprise', price: 'Custom', feats: ['Unlimited', 'Realtime', 'Residency'], hi: false },
          ].map((p) => (
            <Card id={`${brand}-p-${p.name}`} key={p.name} interactive>
              <CardBody>
                <div style={{ display: 'grid', gap: 'var(--p-3)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--p-2)' }}>
                    <strong style={{ flex: 1 }}>{p.name}</strong>
                    {p.hi && <Badge id={`${brand}-p-b-${p.name}`} variant="default" label="Popular" />}
                  </div>
                  <span
                    className="poc-stat"
                    style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-semibold)' }}
                  >
                    {p.price}
                  </span>
                  <div style={{ display: 'grid', gap: 'var(--p-2)' }}>
                    {p.feats.map((f) => (
                      <span
                        key={f}
                        style={{
                          display: 'flex',
                          gap: 'var(--p-2)',
                          alignItems: 'center',
                          fontSize: 'var(--text-sm)',
                          color: 'var(--muted-foreground)',
                        }}
                      >
                        <Check size={16} aria-hidden="true" style={{ color: 'var(--primary-text)' }} />
                        {f}
                      </span>
                    ))}
                  </div>
                  <Button
                    id={`${brand}-p-cta-${p.name}`}
                    label="Choose"
                    style={p.hi ? 'default' : 'outline'}
                    size="sm"
                  />
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      {/* Closing CTA on the STRONG band — the loudest flat surface on the page. */}
      <section
        className="poc-band-strong"
        style={{ padding: 'var(--p-12) var(--p-6)', display: 'grid', gap: 'var(--p-4)', justifyItems: 'center', textAlign: 'center' }}
      >
        <h2 className="poc-display" style={{ margin: 0, fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-semibold)' }}>
          Ready when you are
        </h2>
        <p style={{ ...P, margin: 0 }}>No card required for the first 30 days.</p>
        <span className="poc-hero-cta">
          <Button id={`${brand}-mk-final`} label="Start free" IconRight={ArrowRight} />
        </span>
      </section>

      <footer style={{ padding: 'var(--p-6)' }}>
        <Separator id={`${brand}-sep`} />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--p-3)',
            marginTop: 'var(--p-4)',
            fontSize: 'var(--text-xs)',
            color: 'var(--muted-foreground)',
          }}
        >
          <Mark Icon={Icon} size={22} />
          <span style={MONO}>{brand}</span>
          <span style={{ flex: 1 }} />
          <span>Part of one suite</span>
        </div>
      </footer>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Controls shared by the two page stories
// ─────────────────────────────────────────────────────────────────────────────

function Controls({
  strength,
  setStrength,
  chromeOn,
  setChromeOn,
  mode,
  setMode,
  showChrome = true,
}: {
  strength: number;
  setStrength: (n: number) => void;
  chromeOn: number;
  setChromeOn: (n: number) => void;
  mode: 'light' | 'dark';
  setMode: (m: 'light' | 'dark') => void;
  showChrome?: boolean;
}) {
  return (
    <div style={{ display: 'flex', gap: 'var(--p-5)', flexWrap: 'wrap', alignItems: 'center' }}>
      <Switch
        id="poc-on"
        label="Theming on"
        checked={strength === 1}
        onCheckedChange={(v) => setStrength(v ? 1 : 0)}
      />
      {showChrome && (
        <Switch
          id="poc-chrome"
          label="Tint the rail"
          checked={chromeOn === 1}
          onCheckedChange={(v) => setChromeOn(v ? 1 : 0)}
        />
      )}
      <Switch
        id="poc-mode"
        label="Dark mode"
        checked={mode === 'dark'}
        onCheckedChange={(v) => setMode(v ? 'dark' : 'light')}
      />
    </div>
  );
}

const meta: Meta = {
  title: 'Prototypes/Deeper Theming',
  parameters: {
    layout: 'fullscreen',
    ui: {
      description:
        'A proof of concept for themes that reach past `--primary`. Scoped to two brands, `dc` ' +
        'and `ec` — the closest pair in the palette, and therefore the hardest case. In light ' +
        'mode the page stays white; the tint lives on the rail, on marketing bands, and on the ' +
        'secondary surfaces. It modifies nothing: every rule is scoped to a `data-theme-poc` ' +
        'attribute that exists nowhere else in the repo.',
      tags: ['poc', 'theming'],
    },
  },
};
export default meta;
type Story = StoryObj;

// ─────────────────────────────────────────────────────────────────────────────
// 1 — Dashboard
// ─────────────────────────────────────────────────────────────────────────────

export const Dashboard: Story = {
  render: function DashboardStory() {
    const [strength, setStrength] = useState(1);
    const [chromeOn, setChromeOn] = useState(1);
    const [mode, setMode] = useState<'light' | 'dark'>('light');
    return (
      <>
        <PocStyle />
        <div style={PAGE}>
          <div>
            <h2 style={H2}>The same dashboard, two sub-brands</h2>
            <p style={P}>
              In light mode the content area is <strong>white in both</strong>. The brand lives in
              the rail, the mark, and the accent — the three places that can carry it without
              costing legibility. Turn <em>Tint the rail</em> off to see how much of the identity
              the rail alone is holding.
            </p>
            <Controls
              strength={strength}
              setStrength={setStrength}
              chromeOn={chromeOn}
              setChromeOn={setChromeOn}
              mode={mode}
              setMode={setMode}
            />
          </div>

          {APPS.map(({ brand, Icon }) => (
            <Frame key={brand} label={`data-theme="${brand}"`}>
              <Scope brand={brand} poc strength={strength} chromeOn={chromeOn} mode={mode}>
                <DashboardPage brand={brand} Icon={Icon} />
              </Scope>
            </Frame>
          ))}

          <div>
            <h2 style={H2}>What to look at</h2>
            <p style={P}>
              <strong>The rail deliberately stopped doing the work.</strong> Earlier rounds pushed
              it to 55% raw primary because it was the only surface with headroom to carry identity.
              The mark carries it now — 0.10+ separation at every gradient stop — so the rail was
              greyed back to a chroma of ~0.015 against the loud version&rsquo;s 0.103. It reads as
              grey that leans the brand&rsquo;s way, which is what expensive software does; a rail
              that shouts is the loudest tell of a cheap theme.
            </p>
            <p style={P}>
              Two things fell out of that, both measured after the change rather than predicted
              before it. <strong>The guard rail disappeared:</strong>{' '}
              <code style={MONO}>--muted-foreground</code> on the rail was 3.98 and failing, and now
              measures <strong>5.64</strong> — so the &ldquo;everything inside the rail must use{' '}
              <code style={MONO}>--sidebar-*</code> foregrounds&rdquo; constraint is simply gone. And{' '}
              <strong>the rail no longer differentiates the brands at all</strong> — separation
              across the three collapses to 0.003–0.014. That is the trade, and it is only
              affordable because the mark is holding identity by itself. Turn the marks off and this
              rail says nothing about which app you are in.
            </p>
            <p style={P}>
              Note the knockouts stay correct — the Switch thumb, the Avatar ring and the status dot
              punch through with <code style={MONO}>--background</code>. That is a direct dividend
              of keeping the page white; a tinted page is exactly what breaks them, and fixing it
              would need a separate <code style={MONO}>--surface-knockout</code> token that this POC
              cannot add.
            </p>
          </div>
        </div>
      </>
    );
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 2 — Marketing
// ─────────────────────────────────────────────────────────────────────────────

export const Marketing: Story = {
  render: function MarketingStory() {
    const [strength, setStrength] = useState(1);
    const [mode, setMode] = useState<'light' | 'dark'>('light');
    return (
      <>
        <PocStyle />
        <div style={PAGE}>
          <div>
            <h2 style={H2}>The same marketing page, two sub-brands</h2>
            <p style={P}>
              A marketing page is where the earlier rounds were wrong in an interesting way. A
              product UI has to stay quiet, so its brand budget is tiny — but a marketing page{' '}
              <em>alternates</em>. White sections, then a full-bleed tinted band, then white again.
              The band can be far louder than any app surface because it is a deliberate break in
              the page rather than the page itself, and nothing has to stay readable across it for
              hours.
            </p>
            <Controls
              strength={strength}
              setStrength={setStrength}
              chromeOn={1}
              setChromeOn={() => {}}
              mode={mode}
              setMode={setMode}
              showChrome={false}
            />
          </div>

          {APPS.map(({ brand, Icon }) => (
            <Frame key={brand} label={`data-theme="${brand}"`}>
              <Scope brand={brand} poc strength={strength} mode={mode}>
                <MarketingPage brand={brand} Icon={Icon} />
              </Scope>
            </Frame>
          ))}

          <div>
            <h2 style={H2}>Three intensities, on purpose</h2>
            <p style={P}>
              <strong>Hero — the gradient.</strong> Provably AA-safe: every stop lies on the segment{' '}
              <code style={MONO}>--primary</code> → <code style={MONO}>--foreground</code>, and{' '}
              <code style={MONO}>--primary-foreground</code> is by construction the opposite pole to{' '}
              <code style={MONO}>--foreground</code>, so contrast against the label only ever
              increases. No per-brand tuning, no measurement needed.
              <br />
              <strong>Band — the tinted strip.</strong> Body copy still sits on it, so it is capped
              by <code style={MONO}>--muted-foreground</code>; see the Audit story for the measured
              ceiling.
              <br />
              <strong>White — the default.</strong> Most of the page, and the reason the band reads
              as an event.
            </p>
            <p style={P}>
              One honest caveat: an <code style={MONO}>Alert</code> dropped onto a band would hit
              round 1&rsquo;s bug again, because the semantic <code style={MONO}>-light</code> tints
              are <code style={MONO}>rgba()</code> composited over whatever is behind them. Keep
              alerts on white, or re-derive the tints. The Audit story measures both cases.
            </p>
          </div>
        </div>
      </>
    );
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 3 — Marks
// ─────────────────────────────────────────────────────────────────────────────

export const Marks: Story = {
  render: function MarksStory() {
    const hostRef = useRef<HTMLDivElement>(null);
    const [d, setD] = useState<Record<string, number[]>>({});

    /** Every unordered pair of the three brands. */
    const PAIRS: [Brand, Brand][] = [
      ['db', 'dc'],
      ['db', 'ec'],
      ['dc', 'ec'],
    ];
    const SURFACES: [string, string, string][] = [
      ['Marketing band', 'var(--poc-band)', 'large area, capped by the body text on it'],
      ['Sidebar rail', 'var(--sidebar)', 'own foreground tokens, so more headroom'],
      // All three stops, because a uniform hue arc should preserve the pairwise
      // gap at EVERY point of the gradient, not just at the anchor. If the arc
      // were per-brand these rows would diverge — that is the check.
      ['Mark — light stop', 'oklch(from var(--primary) 0.80 0.17 calc(h - 12))', 'the arc opens one neighbour back'],
      ['Mark — mid stop', 'oklch(from var(--primary) 0.63 0.21 h)', 'sits exactly on the brand hue'],
      ['Mark — dark stop', 'oklch(from var(--primary) 0.47 0.19 calc(h + 26))', 'and lands forward of it'],
    ];

    useEffect(() => {
      const host = hostRef.current;
      if (!host) return;
      const read = (brand: Brand, css: string) => {
        const scope = host.querySelector<HTMLElement>(`[data-m="${brand}"]`);
        const probe = scope?.firstElementChild as HTMLElement | undefined;
        if (!probe) return null;
        probe.style.backgroundColor = '';
        probe.style.backgroundColor = css;
        return toRGBA(getComputedStyle(probe).backgroundColor);
      };
      const next: Record<string, number[]> = {};
      for (const [label, css] of SURFACES) {
        next[label] = PAIRS.map(([x, y]) => {
          const a = read(x, css);
          const b = read(y, css);
          return a && b ? deltaE(a, b) : NaN;
        });
      }
      setD(next);
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
            <span
              key={b}
              data-m={b}
              data-theme={b}
              data-theme-poc=""
              data-mode="light"
              style={{ '--poc-str': 1, '--poc-chrome': 1 } as CSSProperties}
            >
              <span />
            </span>
          ))}
        </div>

        <div style={PAGE}>
          <div>
            <h2 style={H2}>Where the identity actually lives</h2>
            <p style={P}>
              Nothing sits on top of a mark, so it carries no contrast constraint at all — the one
              surface in the UI where colour is free.
            </p>
            <p style={P}>
              <strong>The hue travels; it does not sit still.</strong> The first version held one hue
              and moved only lightness, which is why it read as a tinted chip. Each mark now moves
              through an <em>arc</em> — the light end one neighbour back, the dark end a good way
              forward — plus a brighter counter-rotated bloom in the top corner standing in for a
              second overlapping plane. So <code style={MONO}>dc</code> runs green-teal → teal →
              blue, <code style={MONO}>ec</code> runs sky → blue → indigo, and{' '}
              <code style={MONO}>db</code> runs blue → indigo → violet.
            </p>
            <p style={P}>
              The family guarantee survives, and is worth stating exactly: every mark uses{' '}
              <strong>identical lightness values, identical chroma values, and an identical hue arc</strong>{' '}
              (−12, 0, +26 relative to the brand). Only the anchor moves. The marks are the same
              object rendered at different points on the wheel — which is the relationship the
              reference set has. The mid stop stays exactly on the brand hue, so the dominant colour
              is still the brand&rsquo;s own; the arc is decoration around it, not a redefinition.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 'var(--p-8)', flexWrap: 'wrap' }}>
            {APPS.map(({ brand, Icon }) => (
              <div key={brand} style={{ display: 'grid', gap: 'var(--p-3)', justifyItems: 'center' }}>
                <Scope brand={brand} poc strength={1}>
                  <div style={{ display: 'flex', gap: 'var(--p-3)', alignItems: 'flex-end' }}>
                    <Mark Icon={Icon} size={88} />
                    <Mark Icon={Icon} size={48} />
                    <Mark Icon={Icon} size={28} />
                  </div>
                </Scope>
                <span style={{ ...MONO, color: 'var(--muted-foreground)' }}>{brand}</span>
              </div>
            ))}
          </div>

          <div>
            <h2 style={H2}>Every pair, per surface</h2>
            <p style={P}>
              OKLab ΔE between each pair of brands, measured live. Below <strong>0.05</strong> is
              &ldquo;effectively the same colour&rdquo;; <strong>0.10</strong> is where two things
              read as different colours. Green marks a cell that clears 0.10.
            </p>
            <table style={{ borderCollapse: 'collapse', fontSize: 'var(--text-sm)', width: '100%', maxWidth: 720 }}>
              <thead>
                <tr style={{ borderBottom: 'var(--border-w-100) solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: 'var(--p-2)' }}>Surface</th>
                  {PAIRS.map(([x, y]) => (
                    <th key={`${x}${y}`} style={{ ...MONO, textAlign: 'right', padding: 'var(--p-2)' }}>
                      {x}/{y}
                    </th>
                  ))}
                  <th style={{ textAlign: 'left', padding: 'var(--p-2)' }} />
                </tr>
              </thead>
              <tbody>
                {SURFACES.map(([label, , note]) => (
                  <tr key={label} style={{ borderBottom: 'var(--border-w-50) solid var(--border)' }}>
                    <td style={{ padding: 'var(--p-2)' }}>{label}</td>
                    {(d[label] ?? PAIRS.map(() => NaN)).map((v, i) => (
                      <td
                        key={i}
                        style={{
                          ...MONO,
                          padding: 'var(--p-2)',
                          textAlign: 'right',
                          fontWeight: 'var(--font-semibold)',
                          color: v >= 0.1 ? 'var(--success)' : 'var(--muted-foreground)',
                        }}
                      >
                        {Number.isFinite(v) ? v.toFixed(3) : '—'}
                      </td>
                    ))}
                    <td
                      style={{
                        padding: 'var(--p-2)',
                        fontSize: 'var(--text-xs)',
                        color: 'var(--muted-foreground)',
                      }}
                    >
                      {note}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <h2 style={H2}>The limit worth knowing</h2>
            <p style={P}>
              A uniform arc preserves the gap at every stop — the three mark rows above stay
              separated all the way along the gradient, which is precisely what a{' '}
              <em>per-brand</em> arc would not do. The one honest wrinkle: at the extremes the ramps
              do pass through each other&rsquo;s hue territory (dc&rsquo;s dark stop lands at 210°,
              ec&rsquo;s light stop at 209°). They never collide visually because they sit at
              opposite ends of the lightness range, and the reference set has the same overlap.
            </p>
            <p style={P}>
              The mark <em>amplifies</em> a hue difference; it cannot <em>create</em> one. dc and ec
              are 37 degrees apart, which is enough. Two brands 14 degrees apart stay similar at any
              saturation — and that is the useful half of the Office comparison, because{' '}
              <strong>Word and Outlook are both blue</strong> and nobody confuses them. The glyph
              carries the identity and the colour only supports it. Hue is a bounded resource; a
              silhouette is not.
            </p>
          </div>
        </div>
      </>
    );
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 4 — Hue budget
// ─────────────────────────────────────────────────────────────────────────────

/** Every brand, plus the Aiden surface, which is not a brand but competes for room. */
const WHEEL = ['db', 'dc', 'dr', 'ec', 'ir', 'nb', 'ph', 'rm'] as const;

/**
 * The mark's mid stop is `oklch(0.63 0.21 h)` — fixed lightness and chroma, hue
 * inherited. So at the mark level EVERY brand is reduced to a single number,
 * its hue, and the only thing that can separate two marks is the angle between
 * them. This story works out how much angle there is to go around.
 */
export const HueBudget: Story = {
  render: function HueBudgetStory() {
    const hostRef = useRef<HTMLDivElement>(null);
    const [data, setData] = useState<{
      brands: { code: string; hue: number; chroma: number; hex: string }[];
      aiden: { hue: number; hex: string }[];
      pairs: { a: string; b: string; gap: number; dE: number }[];
      viable: string[];
    } | null>(null);

    useEffect(() => {
      const host = hostRef.current;
      if (!host) return;
      const read = (code: string, css: string) => {
        const scope = host.querySelector<HTMLElement>(`[data-w="${code}"]`);
        const probe = scope?.firstElementChild as HTMLElement | undefined;
        if (!probe) return null;
        probe.style.backgroundColor = '';
        probe.style.backgroundColor = css;
        return toRGBA(getComputedStyle(probe).backgroundColor);
      };
      const hueOf = (c: [number, number, number, number]) => {
        const [, a, b] = oklab(c);
        return ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360;
      };
      const chromaOf = (c: [number, number, number, number]) => {
        const [, a, b] = oklab(c);
        return Math.hypot(a, b);
      };
      const hex = (c: [number, number, number, number]) =>
        '#' + c.slice(0, 3).map((x) => Math.round(x).toString(16).padStart(2, '0')).join('');

      const brands = WHEEL.map((code) => {
        const p = read(code, 'var(--primary)');
        return p
          ? { code, hue: hueOf(p), chroma: chromaOf(p), hex: hex(p) }
          : { code, hue: 0, chroma: 0, hex: '#000' };
      });

      // Aiden's three gradient stops, read from the real token.
      const aidenProbe = host.querySelector<HTMLElement>('[data-w="db"]');
      const ap = aidenProbe?.firstElementChild as HTMLElement | undefined;
      const aiden: { hue: number; hex: string }[] = [];
      if (ap) {
        for (const stop of ['#8455f0', '#5a37e6', '#2c6dea']) {
          const v = toRGBA(stop);
          if (v) aiden.push({ hue: hueOf(v), hex: stop });
        }
      }

      // Pairwise at the MARK MID stop — the level where chroma is equalised.
      const mid = (h: number) => toRGBA(`oklch(0.63 0.21 ${h})`);
      const pairs: { a: string; b: string; gap: number; dE: number }[] = [];
      for (let i = 0; i < brands.length; i++) {
        for (let j = i + 1; j < brands.length; j++) {
          const A = mid(brands[i].hue);
          const B = mid(brands[j].hue);
          let gap = Math.abs(brands[i].hue - brands[j].hue);
          if (gap > 180) gap = 360 - gap;
          if (A && B) pairs.push({ a: brands[i].code, b: brands[j].code, gap, dE: deltaE(A, B) });
        }
      }
      pairs.sort((x, y) => x.dE - y.dE);

      // Sweep: which hues would clear 0.10 from EVERY brand and every Aiden stop?
      const viableRuns: string[] = [];
      const okHues: number[] = [];
      for (let h = 0; h < 360; h += 1) {
        const m = mid(h);
        if (!m) continue;
        // No self-exclusion escape here. An earlier version let a candidate skip
        // the check against a brand sitting at its own hue, which made each
        // existing brand's own hue report as "viable" — ec turned up as a
        // one-degree run at 221. A hue occupied by a brand is the definition of
        // not viable.
        const clearsBrands = brands.every((b) => {
          const o = mid(b.hue);
          return !o || deltaE(m, o) >= 0.1;
        });
        const clearsAiden = aiden.every((a) => {
          const o = toRGBA(a.hex);
          return !o || deltaE(m, o) >= 0.1;
        });
        if (clearsBrands && clearsAiden) okHues.push(h);
      }
      let s: number | null = null;
      let p: number | null = null;
      okHues.forEach((h) => {
        if (s === null) s = h;
        else if (p !== null && h !== p + 1) {
          viableRuns.push(`${s}°–${p}°`);
          s = h;
        }
        p = h;
      });
      if (s !== null && p !== null) viableRuns.push(`${s}°–${p}°`);

      setData({ brands, aiden, pairs, viable: viableRuns });
    }, []);

    const R = 150;
    const CX = 190;
    const CY = 190;
    const pos = (hue: number, r: number) => ({
      x: CX + r * Math.cos((hue * Math.PI) / 180),
      y: CY - r * Math.sin((hue * Math.PI) / 180),
    });

    return (
      <>
        <PocStyle />
        <div
          ref={hostRef}
          aria-hidden="true"
          style={{ position: 'fixed', left: -9999, top: 0, width: 1, height: 1, overflow: 'hidden' }}
        >
          {WHEEL.map((b) => (
            <span key={b} data-w={b} data-theme={b} data-mode="light" data-theme-poc="">
              <span />
            </span>
          ))}
        </div>

        <div style={PAGE}>
          <div>
            <h2 style={H2}>The wheel is oversubscribed</h2>
            <p style={P}>
              The mark&rsquo;s mid stop is <code style={MONO}>oklch(0.63 0.21 h)</code> — fixed
              lightness, fixed chroma, hue inherited. That is deliberate: it is what makes the eight
              marks a family. But it also means that <strong>at the mark level every brand collapses
              to a single number</strong>, its hue, and the only thing that can separate two marks
              is the angle between them.
            </p>
            <p style={P}>
              At that chroma, clearing ΔE 0.10 — the point where two things read as different
              colours — needs about <strong>27.5° of separation</strong>. Eight brands need roughly
              220° of the 360 available, which fits in principle. The problem is where they actually
              sit.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 'var(--p-8)', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <svg width={380} height={380} role="img" aria-label="Brand hues on the colour wheel">
              <circle cx={CX} cy={CY} r={R} fill="none" stroke="var(--border)" strokeWidth={1} />
              {/* the ±27.5° exclusion wedge around each brand */}
              {data?.brands.map((b) => {
                const a1 = pos(b.hue - 27.5, R);
                const a2 = pos(b.hue + 27.5, R);
                return (
                  <path
                    key={`w-${b.code}`}
                    d={`M ${CX} ${CY} L ${a1.x} ${a1.y} A ${R} ${R} 0 0 0 ${a2.x} ${a2.y} Z`}
                    fill={b.hex}
                    opacity={0.13}
                  />
                );
              })}
              {/* Aiden's gradient span */}
              {data?.aiden.map((a) => {
                const q = pos(a.hue, R + 16);
                return <circle key={a.hex} cx={q.x} cy={q.y} r={5} fill={a.hex} stroke="var(--card)" strokeWidth={1.5} />;
              })}
              {data?.brands.map((b) => {
                const q = pos(b.hue, R * (0.35 + b.chroma * 2.4));
                const lbl = pos(b.hue, R + 34);
                return (
                  <g key={b.code}>
                    <line x1={CX} y1={CY} x2={q.x} y2={q.y} stroke={b.hex} strokeWidth={2} opacity={0.5} />
                    <circle cx={q.x} cy={q.y} r={9} fill={b.hex} stroke="var(--card)" strokeWidth={2} />
                    <text
                      x={lbl.x}
                      y={lbl.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      style={{ fontFamily: 'var(--font-family-mono)', fontSize: 12, fill: 'var(--foreground)' }}
                    >
                      {b.code}
                    </text>
                  </g>
                );
              })}
            </svg>

            <div style={{ minWidth: 280, flex: 1 }}>
              <p style={{ ...P, marginTop: 0 }}>
                Distance from the centre is the brand&rsquo;s <strong>chroma</strong>; the pale wedge
                is its ±27.5° exclusion zone. Small dots outside the ring are the Aiden
                surface&rsquo;s three gradient stops — not a brand, but competing for the same room.
              </p>
              <p style={P}>
                Wherever two wedges overlap, those two marks cannot be told apart by colour. Note how
                much of the blue-violet quadrant is double-covered, and how much of the wheel — the
                warm half — is empty.
              </p>
              {data && (
                <p style={{ ...P, marginBottom: 0 }}>
                  Hues that would clear 0.10 from <em>every</em> existing brand and every Aiden stop:{' '}
                  <strong style={{ color: 'var(--primary-text)' }}>
                    {data.viable.length ? data.viable.join(', ') : 'none'}
                  </strong>
                  .
                </p>
              )}
            </div>
          </div>

          <div>
            <h2 style={H2}>The five tightest pairs, at the mark</h2>
            <p style={P}>
              Measured at <code style={MONO}>oklch(0.63 0.21 h)</code> per brand, so chroma is
              equalised and only hue is doing the work.
            </p>
            <table style={{ borderCollapse: 'collapse', fontSize: 'var(--text-sm)', maxWidth: 560 }}>
              <thead>
                <tr style={{ borderBottom: 'var(--border-w-100) solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: 'var(--p-2)' }}>Pair</th>
                  <th style={{ textAlign: 'right', padding: 'var(--p-2)' }}>hue gap</th>
                  <th style={{ textAlign: 'right', padding: 'var(--p-2)' }}>ΔE</th>
                </tr>
              </thead>
              <tbody>
                {data?.pairs.slice(0, 6).map((p) => (
                  <tr key={`${p.a}${p.b}`} style={{ borderBottom: 'var(--border-w-50) solid var(--border)' }}>
                    <td style={{ ...MONO, padding: 'var(--p-2)', fontSize: 'var(--text-sm)' }}>
                      {p.a} / {p.b}
                    </td>
                    <td style={{ ...MONO, padding: 'var(--p-2)', textAlign: 'right' }}>
                      {p.gap.toFixed(0)}°
                    </td>
                    <td
                      style={{
                        ...MONO,
                        padding: 'var(--p-2)',
                        textAlign: 'right',
                        fontWeight: 'var(--font-semibold)',
                        color: p.dE < 0.1 ? 'var(--error)' : 'var(--success)',
                      }}
                    >
                      {p.dE.toFixed(3)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <h2 style={H2}>Why the reverse arc was tested and rejected</h2>
            <p style={P}>
              The obvious fix for db running into the Aiden surface was to flip its hue arc — send
              the mark toward blue instead of violet. Measured, it does nothing:{' '}
              <strong>0.061 against Aiden either way</strong>. The collision is at the{' '}
              <em>mid</em> stop, and the arc does not move the mid stop — the mid is pinned to the
              brand hue by design. Flipping the sign rotates the two ends and leaves the problem
              exactly where it was.
            </p>
            <p style={P}>
              It also swung db&rsquo;s dark end onto ec&rsquo;s dark end at{' '}
              <strong style={{ color: 'var(--error)' }}>0.017</strong> — the two would have been
              indistinguishable. Raising the whole lightness ramp instead peaked at 0.089, still
              short, and cost dc/ec. Neither lever reaches the mid stop, which is the only thing
              that matters.
            </p>
          </div>

          <div>
            <h2 style={H2}>What this leaves</h2>
            <p style={P}>
              <strong>1. Let the glyph carry the close pairs.</strong> Word and Outlook are both
              blue and nobody confuses them, because silhouette does the work and colour only
              supports it. Cheapest, and it is what the reference set actually does. The sweep above
              turns this from a preference into the default: there is no hue assignment that
              separates eight marks by colour alone without moving most of the palette.
              <br />
              <strong>2. Re-space the palette.</strong> 8 × 27.5° fits inside 360°, so it is
              genuinely achievable — but it means moving most brand hues into the empty warm half,
              not adjusting one. Large, and outward-facing into Figma.
              <br />
              <strong>3. Per-brand mark chroma.</strong> Tested: it fixes db and pushes dc/ec back
              to 0.066, because the primaries were darkened for AA and have little chroma to scale.
            </p>
          </div>
        </div>
      </>
    );
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 5 — A clean-slate palette for four sub-apps
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Designed from scratch for FOUR sub-apps rather than eight, with Aiden kept.
 *
 * Four brands need ~110 degrees of the 360 available, so the crowding that
 * makes the current eight collide simply is not present. What binds instead is
 * GAMUT: at a lightness dark enough to carry white text, different hues can
 * hold wildly different amounts of chroma, and that decides which hues are
 * usable as a brand at all.
 *
 * All four are tuned to white-text contrast ~5.0 rather than to a fixed
 * lightness. Equal contrast is what makes them read as peers — a set tuned to
 * fixed lightness has the yellow shouting and the blue whispering.
 */
const PALETTE4 = [
  { name: 'Blue', hue: 248, light: '#2f73ae', dark: '#368cd6', use: 'the default, most-used app' },
  { name: 'Green', hue: 150, light: '#12803c', dark: '#229b4d', use: 'anything about health or completion' },
  { name: 'Amber', hue: 75, light: '#96660f', dark: '#b47d1f', use: 'the warm one; clears warning at 38°' },
  { name: 'Rose', hue: 352, light: '#b4497e', dark: '#dc579a', use: 'the loudest slot — give it the app that needs presence' },
];

/** Today's Aiden, verbatim from tokens.scss, and the rotated proposal. */
const AIDEN_TODAY = ['#8455f0', '#5a37e6', '#2c6dea'];
const AIDEN_PROPOSED = ['#c51cdd', '#8919ec', '#502df7'];

/** Chroma ceiling per hue at white-text-safe lightness — measured, not guessed. */
const GAMUT_CEILING: [number, string, number][] = [
  [75, 'amber', 0.124],
  [150, 'green', 0.139],
  [196, 'teal', 0.087],
  [248, 'blue', 0.14],
  [290, 'violet', 0.245],
  [342, 'magenta', 0.237],
];

export const FourBrands: Story = {
  render: function FourBrandsStory() {
    const [aiden, setAiden] = useState<'today' | 'proposed'>('proposed');
    const stops = aiden === 'today' ? AIDEN_TODAY : AIDEN_PROPOSED;
    const grad = `linear-gradient(135deg, ${stops[0]} 0%, ${stops[1]} 50%, ${stops[2]} 100%)`;

    const Swatch = ({ c, label, sub }: { c: string; label: string; sub?: string }) => (
      <div style={{ display: 'grid', gap: 'var(--p-2)' }}>
        <div
          style={{
            background: c,
            height: 96,
            borderRadius: 'var(--rounded-lg)',
            display: 'grid',
            placeItems: 'center',
            color: '#ffffff',
            fontWeight: 'var(--font-semibold)',
            fontSize: 'var(--text-sm)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          {label}
        </div>
        <span style={{ ...MONO, color: 'var(--muted-foreground)' }}>{sub ?? c}</span>
      </div>
    );

    return (
      <div style={PAGE}>
        <div>
          <h2 style={H2}>Four sub-apps, designed from scratch</h2>
          <p style={P}>
            Aiden keeps violet. The parent brand stays neutral slate — the{' '}
            <em>absence</em> of a theme is what makes these read as sub-apps of one thing rather
            than four unrelated products.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px,1fr))', gap: 'var(--p-4)' }}>
            {PALETTE4.map((b) => (
              <Swatch key={b.name} c={b.light} label={b.name} sub={`${b.light} · ${b.hue}°`} />
            ))}
          </div>
          <p style={{ ...P, marginTop: 'var(--p-4)' }}>
            Worst pair is <strong>Green/Amber at ΔE 0.155</strong> — every pair comfortably past the
            0.10 line, against 0.043 for the tightest pair in the current eight. All four sit at
            white-text contrast ≈ 5.0, so none is louder than another and all clear AA by the same
            margin.
          </p>
        </div>

        <div>
          <h2 style={H2}>Aiden: rotated, not narrowed</h2>
          <p style={P}>
            My first instinct was to narrow Aiden to pure violet so the blue sub-brand had room.
            That was wrong — <strong>shrinking the hue travel is exactly what would kill the
            magic</strong>, because the travel is the effect. Rotating the arc keeps it and still
            frees blue.
          </p>
          <div style={{ display: 'flex', gap: 'var(--p-3)', marginBottom: 'var(--p-5)', flexWrap: 'wrap' }}>
            <Chip id="a4-today" label="Aiden today" active={aiden === 'today'} onClick={() => setAiden('today')} />
            <Chip id="a4-prop" label="Aiden rotated" active={aiden === 'proposed'} onClick={() => setAiden('proposed')} />
          </div>
          <div
            style={{
              background: grad,
              height: 150,
              borderRadius: 'var(--rounded-xl)',
              display: 'grid',
              placeItems: 'center',
              color: '#ffffff',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <div style={{ textAlign: 'center', display: 'grid', gap: 'var(--p-1)' }}>
              <strong style={{ fontSize: 'var(--text-xl)' }}>Ask Aiden</strong>
              <span style={{ ...MONO, opacity: 0.9 }}>{stops.join('  →  ')}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 'var(--p-6)', marginTop: 'var(--p-4)', flexWrap: 'wrap' }}>
            <div>
              <div style={{ ...MONO, color: 'var(--muted-foreground)' }}>hue travel</div>
              <strong style={{ fontSize: 'var(--text-2xl)' }}>{aiden === 'today' ? '30°' : '44°'}</strong>
            </div>
            <div>
              <div style={{ ...MONO, color: 'var(--muted-foreground)' }}>worst stop, white text</div>
              <strong style={{ fontSize: 'var(--text-2xl)' }}>{aiden === 'today' ? '4.63' : '4.58'}</strong>
            </div>
            <div>
              <div style={{ ...MONO, color: 'var(--muted-foreground)' }}>Blue sub-brand clearance</div>
              <strong
                style={{
                  fontSize: 'var(--text-2xl)',
                  color: aiden === 'today' ? 'var(--error)' : 'var(--success)',
                }}
              >
                {aiden === 'today' ? '0.086' : '0.186'}
              </strong>
            </div>
          </div>
          <p style={{ ...P, marginTop: 'var(--p-4)' }}>
            The rotated version runs <strong>magenta → violet → blurple</strong> instead of violet →
            blue. It has <em>more</em> travel than today, not less, and it moves into the two
            richest hues in sRGB, so it is more saturated and more iridescent rather than less. It
            gives up only the blue end — which is the one stop that was costing a sub-brand.
          </p>
        </div>

        <div>
          <h2 style={H2}>Every brand against both Aidens</h2>
          <table style={{ borderCollapse: 'collapse', fontSize: 'var(--text-sm)', maxWidth: 560 }}>
            <thead>
              <tr style={{ borderBottom: 'var(--border-w-100) solid var(--border)' }}>
                <th style={{ textAlign: 'left', padding: 'var(--p-2)' }}>Brand</th>
                <th style={{ textAlign: 'right', padding: 'var(--p-2)' }}>vs Aiden today</th>
                <th style={{ textAlign: 'right', padding: 'var(--p-2)' }}>vs Aiden rotated</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Blue', 0.086, 0.186],
                ['Green', 0.286, 0.374],
                ['Amber', 0.312, 0.336],
                ['Rose', 0.196, 0.141],
              ].map(([n, a, b]) => (
                <tr key={String(n)} style={{ borderBottom: 'var(--border-w-50) solid var(--border)' }}>
                  <td style={{ padding: 'var(--p-2)' }}>{n}</td>
                  {[a, b].map((v, i) => (
                    <td
                      key={i}
                      style={{
                        ...MONO,
                        padding: 'var(--p-2)',
                        textAlign: 'right',
                        fontWeight: 'var(--font-semibold)',
                        color: (v as number) >= 0.1 ? 'var(--success)' : 'var(--error)',
                      }}
                    >
                      {(v as number).toFixed(3)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ ...P, marginTop: 'var(--p-4)' }}>
            Blue more than doubles, from failing to clear. Rose drops but stays clear — it is the
            price of Aiden moving toward magenta, and it is why the fourth brand sits at 352° rather
            than the 342° I first picked.
          </p>
        </div>

        <div>
          <h2 style={H2}>Why not teal, and why not yellow</h2>
          <p style={P}>
            The binding constraint on a four-brand palette is not crowding, it is{' '}
            <strong>gamut</strong>. Measured — the most chroma each hue can hold while still dark
            enough for white text at ≈5.0:
          </p>
          <div style={{ display: 'grid', gap: 'var(--p-2)', maxWidth: 460 }}>
            {GAMUT_CEILING.map(([h, name, c]) => (
              <div key={h} style={{ display: 'flex', alignItems: 'center', gap: 'var(--p-3)' }}>
                <span style={{ ...MONO, width: 84, color: 'var(--muted-foreground)' }}>
                  {name} {h}°
                </span>
                <div style={{ flex: 1, height: 10, background: 'var(--muted)', borderRadius: 'var(--rounded-full)' }}>
                  <div
                    style={{
                      width: `${(c / 0.245) * 100}%`,
                      height: '100%',
                      borderRadius: 'var(--rounded-full)',
                      background: 'var(--primary)',
                    }}
                  />
                </div>
                <span style={{ ...MONO, width: 48, textAlign: 'right' }}>{c.toFixed(3)}</span>
              </div>
            ))}
          </div>
          <p style={{ ...P, marginTop: 'var(--p-4)' }}>
            <strong>Teal is the trap.</strong> It looks like an obvious brand colour and can only
            carry <strong>0.087</strong> — a third of what violet can. Every teal brand fill at
            AA-safe lightness looks washed out, and two muted cool brands cannot separate from each
            other: an earlier attempt at blue + teal measured 0.081 apart. Yellow and olive have the
            same ceiling and go muddy rather than pale, which is why the amber here is pushed to 75°
            where more chroma is available while still clearing the warning hue at 38°.
          </p>
          <p style={P}>
            Violet and magenta are the two richest hues sRGB offers. Aiden already owns violet,
            which is a good use of the best slot — and an argument for giving Rose to whichever
            sub-app most needs to be noticed.
          </p>
        </div>
      </div>
    );
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 6 — Audit
// ─────────────────────────────────────────────────────────────────────────────

type Pairing = { label: string; fg: string; bg: string; onBand?: boolean; note?: string };

const PAIRINGS: Pairing[] = [
  { label: 'foreground / background', fg: '--foreground', bg: '--background', note: 'white in light — unchanged' },
  { label: 'muted-foreground / background', fg: '--muted-foreground', bg: '--background' },
  { label: 'foreground / card', fg: '--foreground', bg: '--card' },
  { label: 'muted-foreground / muted', fg: '--muted-foreground', bg: '--muted', note: 'tightest in the system' },
  { label: 'muted-foreground / secondary', fg: '--muted-foreground', bg: '--secondary' },
  { label: 'accent-foreground / accent', fg: '--accent-foreground', bg: '--accent' },
  { label: 'primary-foreground / primary', fg: '--primary-foreground', bg: '--primary' },
  { label: 'sidebar-foreground / sidebar', fg: '--sidebar-foreground', bg: '--sidebar', note: 'the tinted rail' },
  { label: 'sidebar-accent-fg / sidebar-accent', fg: '--sidebar-accent-foreground', bg: '--sidebar-accent', note: 'the rail ceiling' },
  { label: 'muted-foreground / sidebar', fg: '--muted-foreground', bg: '--sidebar', note: 'now PASSES — was 3.98 at the loud rail' },
  { label: 'foreground / band', fg: '--foreground', bg: '--poc-band' },
  { label: 'muted-foreground / band', fg: '--muted-foreground', bg: '--poc-band', note: 'caps the band tint' },
  { label: 'muted-foreground / band DEEPEST', fg: '--muted-foreground', bg: '--poc-band-deep', note: 'the gradient bloom — worst point' },
  { label: 'muted-foreground / band-strong', fg: '--muted-foreground', bg: '--poc-band-strong' },
  { label: 'stat gradient (lightest stop) / band', fg: '--primary', bg: '--poc-band', note: 'large text — 3:1 floor' },
  { label: 'error / error-light', fg: '--error', bg: '--error-light', note: 'over the WHITE page' },
  { label: 'error / error-light ON BAND', fg: '--error', bg: '--error-light', onBand: true, note: 'the remaining hazard' },
  { label: 'info / info-light', fg: '--info', bg: '--info-light' },
  { label: 'border / background', fg: '--border', bg: '--background', note: '1.4.11 wants 3:1 — pre-existing' },
];

export const Audit: Story = {
  render: function AuditStory() {
    const hostRef = useRef<HTMLDivElement>(null);
    const [mode, setMode] = useState<'light' | 'dark'>('light');
    const [rows, setRows] = useState<Record<string, Record<Brand, number>>>({});

    useEffect(() => {
      const host = hostRef.current;
      if (!host) return;
      const next: Record<string, Record<Brand, number>> = {};
      for (const brand of BRANDS) {
        const scope = host.querySelector<HTMLElement>(`[data-a="${brand}"]`);
        if (!scope) continue;
        const probe = scope.firstElementChild as HTMLElement;
        const read = (token: string) => {
          probe.style.backgroundColor = '';
          probe.style.backgroundColor = `var(${token})`;
          return toRGBA(getComputedStyle(probe).backgroundColor);
        };
        for (const p of PAIRINGS) {
          const fg = read(p.fg);
          const bg = read(p.bg);
          if (!fg || !bg) continue;
          // A translucent surface sits over whatever is behind it — which is the
          // whole point of the "ON BAND" row: same token, different backdrop.
          const behind = read(p.onBand ? '--poc-band' : '--background');
          const solid = bg[3] < 1 && behind ? over(bg, behind) : bg;
          next[p.label] ??= {} as Record<Brand, number>;
          next[p.label][brand] = contrast(fg, solid);
        }
      }
      setRows(next);
    }, [mode]);

    // WCAG 1.4.11 wants 3:1 for UI boundaries, and 1.4.3 allows 3:1 for large
    // text — the display numerals are --text-3xl, comfortably over the 24px
    // threshold, so they are held to 3 rather than 4.5.
    const floor = (label: string) =>
      label.startsWith('border') || label.startsWith('stat gradient') ? 3 : 4.5;

    return (
      <>
        <PocStyle />
        <div
          ref={hostRef}
          aria-hidden="true"
          style={{ position: 'fixed', left: -9999, top: 0, width: 1, height: 1, overflow: 'hidden' }}
        >
          {BRANDS.map((b) => (
            <span
              key={b}
              data-a={b}
              data-theme={b}
              data-theme-poc=""
              data-mode={mode}
              style={{ '--poc-str': 1, '--poc-chrome': 1 } as CSSProperties}
            >
              <span />
            </span>
          ))}
        </div>

        <div style={PAGE}>
          <div>
            <h2 style={H2}>Measured, not asserted</h2>
            <p style={P}>
              <code style={MONO}>scripts/contrast-check.mjs</code> cannot see any of this: it
              brace-matches only the two <code style={MONO}>[data-mode]</code> blocks, returns null
              for <code style={MONO}>color-mix</code>, and treats unresolved as <em>not</em> a
              failure while still exiting 0. So the POC measures itself, in this browser, at full
              strength.
            </p>
            <Switch
              id="audit-mode"
              label="Dark mode"
              checked={mode === 'dark'}
              onCheckedChange={(v) => setMode(v ? 'dark' : 'light')}
            />
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 'var(--text-sm)' }}>
              <thead>
                <tr style={{ borderBottom: 'var(--border-w-100) solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: 'var(--p-2)' }}>Pairing</th>
                  {BRANDS.map((b) => (
                    <th key={b} style={{ ...MONO, textAlign: 'right', padding: 'var(--p-2)' }}>
                      {b}
                    </th>
                  ))}
                  <th style={{ textAlign: 'left', padding: 'var(--p-2)' }}>Note</th>
                </tr>
              </thead>
              <tbody>
                {PAIRINGS.map((p) => {
                  const r = rows[p.label];
                  return (
                    <tr key={p.label} style={{ borderBottom: 'var(--border-w-50) solid var(--border)' }}>
                      <td style={{ padding: 'var(--p-2)' }}>{p.label}</td>
                      {BRANDS.map((b) => {
                        const v = r?.[b];
                        const bad = v != null && v < floor(p.label);
                        return (
                          <td
                            key={b}
                            style={{
                              ...MONO,
                              padding: 'var(--p-2)',
                              textAlign: 'right',
                              color: bad ? 'var(--error)' : 'var(--foreground)',
                              fontWeight: bad ? 'var(--font-semibold)' : 'var(--font-normal)',
                            }}
                          >
                            {v == null ? '—' : v.toFixed(2)}
                          </td>
                        );
                      })}
                      <td
                        style={{
                          padding: 'var(--p-2)',
                          fontSize: 'var(--text-xs)',
                          color: 'var(--muted-foreground)',
                        }}
                      >
                        {p.note ?? ''}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div>
            <h2 style={H2}>The two rows that matter</h2>
            <p style={P}>
              <strong>
                <code style={MONO}>muted-foreground / sidebar</code>
              </strong>{' '}
              now passes at <strong>5.64</strong>, and the row is kept because of what it used to
              say. At the loud 55% rail it measured 3.98 and failed, which forced a rule: every
              component inside the rail had to use the <code style={MONO}>--sidebar-*</code>{' '}
              foregrounds. Greying the rail dissolved that rule rather than satisfying it. Quieting
              a surface does not just make it calmer — it makes it less demanding of everything
              placed on it, which is a cost that never appears in a colour picker.
            </p>
            <p style={P}>
              <strong>
                <code style={MONO}>error / error-light ON BAND</code>
              </strong>{' '}
              is round 1&rsquo;s bug, reproduced deliberately. The same token passes on white and
              fails on the band, because the tint is <code style={MONO}>rgba()</code> and composites
              over whatever is behind it. Keeping the page white is what makes every other semantic
              row safe; the band is the one place the hazard survives.
            </p>
          </div>
        </div>
      </>
    );
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 5 — Recipe + what this does not prove
// ─────────────────────────────────────────────────────────────────────────────

export const Recipe: Story = {
  render: () => (
    <>
      <PocStyle />
      <div style={PAGE}>
        <div>
          <h2 style={H2}>The model, in three tiers</h2>
          <p style={P}>
            The original question had two halves that pull in opposite directions — each app should
            stand on its own, and the whole thing should feel like one ecosystem. They are not in
            conflict once you notice they live in <em>different tiers</em>.
          </p>
          <p style={P}>
            <strong>Tier 1 — the mark.</strong> Maximum chroma, a fraction of a percent of the
            pixels, no contrast constraint at all. This is where an app earns the right to stand on
            its own.
            <br />
            <strong>Tier 2 — the accent and the chrome.</strong>{' '}
            <code style={MONO}>--primary</code> on CTAs, selection and active nav; the rail; the
            marketing band. Medium chroma, medium area, real constraints.
            <br />
            <strong>Tier 3 — the page.</strong> Most of the pixels. Stays white, and stays{' '}
            <em>identical across every app</em>.
          </p>
          <p style={P}>
            Tier 3 does the ecosystem work <strong>by being the same</strong>, not by being themed.
            That is why the earlier rounds got worse the harder they pushed: every increment spent
            making the pages differ was an increment spent making the suite look less like a suite.
          </p>
        </div>

        <div>
          <h2 style={H2}>The whole stylesheet</h2>
          <p style={P}>
            Every selector contains <code style={MONO}>[data-theme-poc]</code>, an attribute that
            appears nowhere else in the repo. At <code style={MONO}>--poc-str: 0</code> every mix
            resolves to its literal base, so the recipe degrades to today exactly.
          </p>
          <pre
            style={{
              margin: 0,
              padding: 'var(--p-4)',
              background: 'var(--muted)',
              borderRadius: 'var(--rounded-md)',
              fontFamily: 'var(--font-family-mono)',
              fontSize: 'var(--text-code)',
              lineHeight: 'var(--leading-5)',
              color: 'var(--foreground)',
              overflowX: 'auto',
              maxHeight: 520,
            }}
          >
            {POC_CSS}
          </pre>
        </div>

        <div>
          <h2 style={H2}>What this does not prove</h2>
          <p style={P}>
            <strong>Portalled overlays escape the scope.</strong> Ten components — Dialog, Drawer,
            Popover, Tooltip, DropdownMenu, ContextMenu, Select, Combobox, HoverCard, Toaster —
            render into <code style={MONO}>document.body</code>, outside any themed subtree. That is
            pre-existing with today&rsquo;s scoping; the POC only exposes it.
            <br />
            <strong>Adoption needs raw neutral tokens.</strong> A custom property cannot reference
            itself, so the bases here are hardcoded literals. Real adoption needs a
            <code style={MONO}> --surface-* </code>layer with the semantic tokens derived from it.
            <br />
            <strong>The contrast gate would need rewriting</strong> — theme-aware, with a{' '}
            <code style={MONO}>var()</code> resolver and a <code style={MONO}>color-mix</code>{' '}
            evaluator. Until then it prints a green pass over all of this.
            <br />
            <strong>Only three brands are exercised.</strong> dc and ec are the hardest pair and db
            is the control, which makes them a good test and a poor sample. The other five are not
            re-verified here.
            <br />
            <strong>The depth layer is not free at scale.</strong> Every card carries two shadow
            layers and a gradient wash, every band two background layers plus insets. That is fine
            on these pages and unmeasured on a real one — gradients and large blurred shadows are
            paint-bound, and a long list of them is the usual cause of scroll jank.
            <br />
            <strong>Untested:</strong> forced-colors, <code style={MONO}>prefers-contrast</code>,
            print, nested POC scopes, and APCA — which weights light-text-on-light-tint very
            differently, and that is half of what this changes.
            <br />
            <strong>No designer or user validation.</strong> This shows what is possible, not what
            is wanted.
          </p>
        </div>
      </div>
    </>
  ),
};
