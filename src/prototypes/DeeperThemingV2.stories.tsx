import { Fragment, useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  ArrowRight, Calendar, ChartColumn, Check, FileText, Globe, Heart,
  Plus, Search, Sparkles, Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  Alert, Avatar, AvatarGroup, Badge, Banner, BarChart, Button, Card, CardBody, CardHeader,
  Chip, Fab, LineChart,
  Input, Item, ItemContent, ItemDescription, ItemGroup, ItemTitle, Progress,
  Separator, Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarHeader,
  SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider,
  StatusDot, Switch,
} from '../index';
import {
  POC_CSS, BRAND_ANCHORS, BRAND_KEYS, PRIMARY_LIGHT, PRIMARY_DARK, PRIMARY_IS_AUTHORED, SUB_BRANDS,
} from './deeperThemingRecipeV2';
import type { BrandKey } from './deeperThemingRecipeV2';
import SuitePageV2 from './SuitePageV2';
import { usePointerTilt } from './usePointerTilt';
import { AuditPanel, NewTokensPanel, TokenDiffPanel } from './DeeperThemingPartsV2';

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
 * CONTAINMENT is unchanged: every selector carries `[data-theme-poc2]`, an
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

// ─────────────────────────────────────────────────────────────────────────────
// Shared
// ─────────────────────────────────────────────────────────────────────────────

const ICONS: Record<BrandKey, LucideIcon> = {
  db: ChartColumn, nb: FileText, dc: Globe, ec: Calendar, ph: Zap, rm: Heart, aiden: Sparkles,
};
type Mode = 'light' | 'dark';

const H2: CSSProperties = { margin: '0 0 var(--p-2)', fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--foreground)' };
const P: CSSProperties = { margin: '0 0 var(--p-4)', fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-6)', color: 'var(--muted-foreground)', maxWidth: 'var(--max-w-3xl)' };
/**
 * The story page. FULL-BLEED on purpose: it paints --background, and a box that
 * is `maxWidth + margin: auto` leaves unpainted gutters either side, so dark
 * mode showed white rails down the edges. The measure is held by the inline
 * padding instead, which centres the content identically without narrowing the
 * painted box. Pair it with data-mode on the same element — see the Mode note.
 */
const PAGE: CSSProperties = {
  display: 'grid',
  gap: 'var(--p-10)',
  paddingBlock: 'var(--p-8)',
  paddingInline: 'max(var(--p-8), calc((100% - var(--max-w-6xl)) / 2))',
  background: 'var(--background)',
  color: 'var(--foreground)',
  minHeight: '100vh',
};
const MONO: CSSProperties = { fontFamily: 'var(--font-family-mono)', fontSize: 'var(--text-xs)' };

/**
 * Follow Storybook's own light/dark toolbar.
 *
 * These stories used to own a local "Dark mode" Switch, and every POC element
 * stamped that local state as `data-mode` on itself. Storybook's global mode
 * writes `data-mode` on <html> — so the local attribute, being closer, WON, and
 * flipping the toolbar darkened the page chrome while every frame, card and
 * swatch stayed light. Two controls for one axis, one of them silently
 * overriding the other.
 *
 * There is one control now, and it is the toolbar. The scopes still have to
 * carry the attribute themselves — the recipe selects on
 * `[data-theme-poc2][data-mode='x']`, a COMPOUND selector, so an inherited mode
 * does not match — but the value is mirrored from <html> rather than invented.
 */
function useGlobalMode(): Mode {
  const read = () => (document.documentElement.getAttribute('data-mode') === 'dark' ? 'dark' : 'light');
  const [mode, setMode] = useState<Mode>(read);
  useEffect(() => {
    setMode(read());
    const obs = new MutationObserver(() => setMode(read()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-mode'] });
    return () => obs.disconnect();
  }, []);
  return mode;
}

/**
 * A branded scope. `data-brand` drives the anchors; `data-mode` picks the pair.
 *
 * `mode` DEFAULTS TO THE TOOLBAR, not to 'light'. It used to default to light,
 * and every caller that forgot to pass it pinned its subtree light forever —
 * which is how a whole column of the MinimalOption story stayed white under a
 * dark toolbar while the page around it went dark. A default of "whatever the
 * rest of the page is doing" cannot fail that way.
 */
function Scope({
  brand, mode, strength = 1, chromeOn = 1, children,
}: {
  brand: BrandKey | ''; mode?: Mode; strength?: number; chromeOn?: number; children: ReactNode;
}) {
  const global = useGlobalMode();
  mode ??= global;
  // aiden is reached by data-surface, never data-brand — it is not one of the
  // six rooms, it is the thing that walks into them
  const attrs = brand === 'aiden'
    ? { 'data-surface': 'aiden' }
    : { 'data-brand': brand || undefined };
  return (
    <div
      data-theme-poc2=""
      {...attrs}
      data-mode={mode}
      style={{ '--poc2-str': strength, '--poc2-chrome': chromeOn } as CSSProperties}
    >
      {children}
    </div>
  );
}

/**
 * `--poc2-mark-px` is set inline because two of the mark's layers cannot be
 * expressed as a percentage — a blur radius and the shadow offsets. Everything
 * else in the CSS scales on its own.
 *
 * `tilt` opts into the pointer parallax. The hook is called unconditionally and
 * takes `enabled` as an argument rather than being called behind a branch —
 * hooks cannot be conditional, and a Mark that toggles would otherwise change
 * its hook count between renders.
 */
function Mark({
  brand, size = 48, live = false, tilt = false,
}: { brand: BrandKey; size?: number; live?: boolean; tilt?: boolean }) {
  const Icon = ICONS[brand];
  const ref = usePointerTilt<HTMLSpanElement>(tilt);
  return (
    <span
      ref={ref}
      className={`poc2-mark${live ? ' poc2-mark--live' : ''}${tilt ? ' poc2-mark--tilt' : ''}`}
      style={{ width: size, height: size, '--poc2-mark-px': `${size}px` } as CSSProperties}
    >
      {live && (
        <>
          <span className="poc2-mark__bloom" aria-hidden="true" />
          <span className="poc2-mark__flare" aria-hidden="true">
            <span className="poc2-mark__spark" />
          </span>
          <span className="poc2-mark__sweep" aria-hidden="true" />
        </>
      )}
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

/** --primary per mode, so a story can index it by the toolbar's current mode. */
const PRIMARY: Record<Mode, Record<string, string>> = { light: PRIMARY_LIGHT, dark: PRIMARY_DARK };

const meta: Meta = {
  title: 'Prototypes/Deeper Theming V2',
  parameters: {
    layout: 'fullscreen',
    ui: {
      description:
        'Sub-applications that stand on their own while still reading as one suite. Each brand is ' +
        'THREE anchors — **highlight, primary, deep** — and every surface derives from them, so a ' +
        'theme reaches past the accent into the page itself. `--primary` IS the middle anchor, which ' +
        'means the whole existing `--primary-*` family re-derives for free.\n\n' +
        'Read it in order: **Brands** is the model, **Mark Anatomy** and **Aiden Surface** are the ' +
        'identity, **Tokens** is what it costs, **Audit** is whether it holds up, and the last three ' +
        'are the thing itself at full size.\n\n' +
        'Nothing in `tokens.scss` is modified. Every rule is scoped to a `data-theme-poc2` attribute ' +
        'that exists nowhere else in the repo, so none of this can leak into another story. ' +
        'Light/dark follows the Storybook toolbar — these stories have no mode switch of their own.',
      tags: ['poc', 'theming'],
    },
  },
};
export default meta;
type Story = StoryObj;

/** The six layers, bottom to top, as the Figma component stacks them. */
const LAYERS: { n: string; what: string; how: string }[] = [
  { n: '1 · brand ramp', what: 'The three anchors on a 135° axis.',
    how: 'Figma stores a gradientTransform, not an angle. Solved back: the axis runs (0.5,−0.31) to (1.31,0.5) in unit space, and the 0/0.52/1 stops land at 9.7/51.6/90.3% on the CSS gradient line. 0/52/100% — the obvious guess — compresses the ramp and loses the deep corner.' },
  { n: '2 · radial highlight', what: 'A soft white lift, just above centre.',
    how: '35% radius at 45%/40%. Figma layers it at 40% opacity over stops of 0.7/0.3/0; CSS has no layer opacity on a background, so the product is folded into each stop.' },
  { n: '3 · bloom', what: 'A pale blue glow hanging off the top-left.',
    how: 'A 129px ellipse pinned at (−39,−37) in Figma. As a background layer that is a 25% glow centred at 20%/22% — same light, no extra element.' },
  { n: '4 · sheen', what: 'A white band down the top half.',
    how: '128×67 in Figma, so 52.3% of the height, on ::before. Vertical, three stops, fading out by 70%.' },
  { n: '5 · sparkle', what: 'One small point of light, upper left.',
    how: '12px at (20,20) with a 4px layer blur in Figma — 12% wide at 14.4%/14.4% on ::after here. Figma\u2019s is a flat disc at alpha 0.32 under a heavy blur, which vanishes into the sheen at small sizes; this is a radial with a bright core and a soft falloff instead. A blurred disc reads as a smudge, a core with falloff reads as light, and it survives being scaled down. The blur is the only value that has to know the pixel size.' },
  { n: '6 · icon', what: 'Centred at 46% of the box, always white.',
    how: 'It has to sit ABOVE the sheen, and a grid child with no z-index does not: ::before paints after it in the same stacking context. The glyph briefly tracked --primary-foreground so it would match a button in the same mode; that is wrong for a mark, because the mark does not change between modes either.' },
];

/** A db page with Aiden arriving in it — the scenario the whole decision rests on. */
function AidenInHost({ mode }: { mode: Mode }) {
  return (
    <Scope brand="db" mode={mode}>
      <div style={{ background: 'var(--background)', minHeight: 340, position: 'relative', contain: 'layout', display: 'grid', gap: 'var(--p-4)', padding: 'var(--p-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--p-3)' }}>
          <Mark brand="db" size={30} />
          <strong style={{ ...MONO, fontSize: 'var(--text-sm)', flex: 1 }}>db</strong>
          <Button id="ah-new" label="New report" size="sm" IconLeft={Plus} />
        </div>
        <div style={{ background: 'var(--card)', border: 'var(--border-w-100) solid var(--border)', borderRadius: 'var(--rounded-lg)', padding: 'var(--p-4)', display: 'grid', gap: 'var(--p-2)' }}>
          <strong style={{ fontSize: 'var(--text-sm)' }}>Active accounts</strong>
          <span className="poc2-stat" style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-semibold)' }}>12,480</span>
          <Progress id="ah-p" value={62} />
        </div>

        {/* the FAB is the whole argument: an aiden SURFACE inside a db theme */}
        <AidenFab mode={mode} id="ah-fab" />
      </div>
    </Scope>
  );
}

/**
 * The Aiden launcher, pinned to a host page.
 *
 * Its own `data-surface` scope INSIDE whatever theme it lands in — that
 * composition is the whole argument for Aiden being a surface rather than a
 * seventh brand, and it only shows up when the two are on screen together.
 *
 * THE SCOPE WRAPPER IS `display: contents`. Without it the wrapper is a real
 * box, and dropping one into a grid shell hands it a grid cell — the dashboard
 * layout collapsed the first time for exactly that reason. `display: contents`
 * removes the box while leaving the custom properties inheriting normally,
 * which is the same trick `DirectionProvider` uses for its `dir` wrapper.
 *
 * The host gets `contain: layout` as well as `position: relative`. Relative
 * alone does NOT create a containing block for a FIXED child — only transform /
 * filter / perspective / contain do — and containment is what keeps every FAB
 * inside its own dashboard instead of stacking them in the viewport corner.
 */
function AidenFab({ mode, id }: { mode: Mode; id: string }) {
  return (
    /* display: contents so the scope wrapper takes no layout box — a plain div
       here becomes a grid/flex item and shifts everything around it. The Fab
       carries the Aiden gradient itself; the surface attribute is what switches
       it on, and it is declared here rather than on the page so the FAB reads as
       Aiden inside whichever brand it is sitting in. */
    <div data-theme-poc2="" data-surface="aiden" data-mode={mode} style={{ display: 'contents' }}>
      <Fab id={id} aria-label="Ask Aiden" size="default" pulse>
        <Sparkles size={22} aria-hidden="true" />
      </Fab>
    </div>
  );
}

function DashboardPage({ brand, mode }: { brand: BrandKey; mode: Mode }) {
  const [on, setOn] = useState(true);
  const nav = ['Overview', 'Cohorts', 'Exports', 'Settings'];
  return (
    /* `contain: layout` — NOT `position: relative` — is what keeps the Sidebar's
       viewport-fixed panel and the Fab inside this frame instead of escaping to
       the iframe corner and stacking six deep. Only transform / filter /
       perspective / contain create a containing block for a fixed child. */
    <div className="poc2-dash" style={{ minHeight: 560, background: 'var(--background)', position: 'relative', contain: 'layout' }}>
      <SidebarProvider>
        {/* The real Sidebar, not a hand-drawn rail. It is the only thing that
            exercises the --sidebar-* surface, which is the chrome a theme has to
            reach for "deeper" to mean anything. */}
        <Sidebar collapsible="none">
          <SidebarHeader>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--p-2-5)', padding: 'var(--p-1)' }}>
              <Mark brand={brand} size={32} />
              <strong style={{ ...MONO, fontSize: 'var(--text-sm)' }}>{brand}</strong>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {nav.map((n, i) => (
                    <SidebarMenuItem key={n}>
                      <SidebarMenuButton isActive={i === 0}>
                        <span>{n}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

      <SidebarInset>
        <AidenFab mode={mode} id={`${brand}-fab`} />
      <div style={{ display: 'grid', alignContent: 'start' }}>
        {/* THE THEMED-SURFACE SET. These three are the only places a --primary
            derived TINT carries text, and they were the pairing that blocked
            adoption: colour on a tint has to hold for every brand at once, and
            with the POC anchors it did not. Text here is neutral; the brand is
            in the tint, the icon and the border. Read them against the semantic
            info Alert below, which keeps coloured text because its hue is one
            audited value rather than eight. */}
        <Banner
          id={`${brand}-bn`}
          variant="brand"
          Icon={Sparkles}
          title="Q3 planning workspaces are open."
          action={<Button id={`${brand}-bn-a`} label="Take a look" style="link" size="sm" />}
        />
        <header style={{ display: 'flex', alignItems: 'center', gap: 'var(--p-3)', padding: 'var(--p-4) var(--p-6)', borderBottom: 'var(--border-w-100) solid var(--border)', background: 'var(--card)' }}>
          <strong style={{ flex: 1, fontSize: 'var(--text-base)' }}>Overview</strong>
          <StatusDot status="online" label="Live" />
          <Button id={`${brand}-cta2`} label="Export" style="secondary" size="sm" />
          <Button id={`${brand}-cta`} label="New report" IconLeft={Plus} size="sm" />
        </header>
        <div style={{ padding: 'var(--p-6)', display: 'grid', gap: 'var(--p-5)' }}>
          <Alert id={`${brand}-al-b`} variant="brand" Icon={Zap} title="You are on the new cohort engine" description="Definitions now resolve at query time, so saved reports pick up edits immediately." />
          <Alert id={`${brand}-al`} variant="info" title="Two sources are still syncing" description="Numbers may move until the last import finishes." />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px,1fr))', gap: 'var(--p-4)' }}>
            <Card id={`${brand}-c1`}>
              <CardHeader id={`${brand}-c1`} title="Active accounts" description="Last 7 days" />
              <CardBody>
                <div className="poc2-stat" style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-semibold)' }}>12,480</div>
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
          {/* THE CHART — the surface theming previously did not reach. Series
              colours come from --chart-1..6, authored per brand, so slot 1
              carries the brand's own hue. Everything structural around it
              (radius, type, spacing, shadows) is deliberately identical across
              all six, which is what keeps them reading as one product family. */}
          <Card id={`${brand}-ch`}>
            <CardBody>
              <BarChart
                id={`${brand}-chart`}
                title="Sessions by channel"
                description="Slot 1 is this brand's hue; slots 2-6 are its own validated companions."
                categories={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']}
                height={220}
                series={[
                  { key: 'direct', label: 'Direct', data: [420, 512, 486, 640, 712, 690] },
                  { key: 'referral', label: 'Referral', data: [280, 310, 402, 380, 460, 520] },
                  { key: 'organic', label: 'Organic', data: [180, 240, 220, 300, 340, 410] },
                ]}
              />
            </CardBody>
          </Card>
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
      </SidebarInset>
      </SidebarProvider>
    </div>
  );
}

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

      {/* THE BUBBLE FIELD — the highlight's home. Two soft radial washes over the
          page surface, not a fill: text sits on --background plus a tint, so it
          keeps the page's own contrast while the corner glows carry the brand as
          brightly as the mark does. This is the one place the highlight is free,
          because nothing is read ON a bubble. */}
      <section
        className="poc2-bubble-field"
        style={{ padding: 'var(--p-12) var(--p-6)', display: 'grid', gap: 'var(--p-4)', justifyItems: 'center', textAlign: 'center' }}
      >
        <Mark brand={brand} size={56} />
        <h1 className="poc2-display" style={{ margin: 0, fontSize: 'var(--text-4xl)', lineHeight: 'var(--leading-10)', fontWeight: 'var(--font-semibold)', maxWidth: 'var(--max-w-2xl)' }}>
          Every number in one place
        </h1>
        <p style={{ margin: 0, fontSize: 'var(--text-base)', lineHeight: 'var(--leading-7)', maxWidth: 'var(--max-w-xl)', color: 'var(--muted-foreground)' }}>
          Bring imports, cohorts and reporting under one definition your whole team shares.
        </p>
        <div style={{ display: 'flex', gap: 'var(--p-3)', marginTop: 'var(--p-2)' }}>
          <Button id={`${brand}-mk-a`} label="Start free" IconRight={ArrowRight} />
          <Button id={`${brand}-mk-b`} label="Book a demo" style="outline" />
        </div>
      </section>

      <section style={{ padding: 'var(--p-12) var(--p-6)', display: 'grid', gap: 'var(--p-6)' }}>
        <h2 className="poc2-display" style={{ margin: 0, textAlign: 'center', fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-semibold)' }}>
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

      <section className="poc2-band" style={{ padding: 'var(--p-12) var(--p-6)', display: 'grid', gap: 'var(--p-6)' }}>
        <h2 className="poc2-display" style={{ margin: 0, textAlign: 'center', fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-semibold)' }}>
          Trusted where the numbers matter
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', gap: 'var(--p-4)', textAlign: 'center' }}>
          {[['99.98%', 'Ingest uptime'], ['4.2 min', 'Median sync'], ['120+', 'Connectors']].map(([n, l]) => (
            <div key={l} style={{ display: 'grid', gap: 'var(--p-1)' }}>
              <span className="poc2-stat" style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-semibold)' }}>{n}</span>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>{l}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 'var(--p-2)', justifyContent: 'center', flexWrap: 'wrap' }}>
          {['SOC 2', 'SSO', 'Audit log'].map((t) => <Badge id={`${brand}-t-${t}`} key={t} variant="outline" label={t} />)}
        </div>
        {/* A chart ON THE BAND, not on a card. The harder contrast case: marks
            are measured against --poc2-band here rather than --card, and the band
            is the one surface that carries a real brand tint. If a series is
            going to disappear anywhere, it is here. */}
        <div style={{ maxWidth: 'var(--max-w-3xl)', margin: '0 auto', width: '100%' }}>
          <LineChart
            id={`${brand}-mk-chart`}
            title="Ingest volume"
            categories={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']}
            curve="monotone"
            height={200}
            series={[
              { key: 'events', label: 'Events', data: [3.2, 4.1, 3.8, 5.6, 6.4, 7.1] },
              { key: 'errors', label: 'Retries', data: [0.9, 0.7, 1.2, 0.6, 0.5, 0.4] },
            ]}
            valueFormatter={(v) => `${v}M`}
          />
        </div>
      </section>

      <section style={{ padding: 'var(--p-12) var(--p-6)', display: 'grid', gap: 'var(--p-6)' }}>
        <h2 className="poc2-display" style={{ margin: 0, textAlign: 'center', fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-semibold)' }}>Simple pricing</h2>
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
                  <span className="poc2-stat" style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-semibold)' }}>{pl.p}</span>
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

      <section className="poc2-band-strong" style={{ padding: 'var(--p-12) var(--p-6)', display: 'grid', gap: 'var(--p-4)', justifyItems: 'center', textAlign: 'center' }}>
        <h2 className="poc2-display" style={{ margin: 0, fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-semibold)' }}>Ready when you are</h2>
        <span className="poc2-hero-cta"><Button id={`${brand}-fin`} label="Start free" IconRight={ArrowRight} /></span>
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
    tokens: ['--primary-highlight', '--primary', '--primary-deep', '--primary-foreground'],
  },
  {
    group: 'Free — the existing --primary-* family',
    note: 'Already color-mix over var(--primary) in tokens.scss, so setting the middle anchor re-derives all seven with no new code. This is the whole of the minimal option, and it now comes free with the anchor model too.',
    tokens: ['--primary-hover', '--primary-light', '--primary-soft', '--primary-border', '--primary-ring', '--primary-focus', '--primary-text'],
  },
  {
    group: 'Surfaces',
    note: 'Page and card stay white in light mode. Every tinted one derives from --surface-tint — the DEEP anchor greyed toward slate — applied at single digits, so each lands 4–8 ΔE00 off its neutral base. Never the highlight: a surface should sit under the accent, not beside it.',
    tokens: ['--surface-tint', '--background', '--card', '--popover', '--secondary', '--accent', '--input', '--muted'],
  },
  {
    group: 'Lines',
    note: 'Mostly slate. Borders take half the --primary they used to \u2014 a hairline should read as the system, with the brand only just visible in it. --ring is left at full strength on purpose: it is the focus indicator, and WCAG 1.4.11 wants it to stand out rather than agree with the border beside it.',
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
    tokens: ['--poc2-band', '--poc2-band-strong', '--poc2-band-deep'],
  },
  {
    group: 'Shadow tints',
    note: 'From DEEP, pre-mixed into slate-700 so the brand direction survives without a coloured wash under every card. Same weight as the raw deep \u2014 the stock sits at almost the same lightness, so only chroma drops (25\u2013107 to 11\u201355).',
    tokens: ['--poc2-shadow-stock', '--poc2-shadow-key', '--poc2-shadow-far', '--poc2-shadow-amb'],
  },
  {
    group: 'Gradients',
    note: 'Not flat colours \u2014 the mark is all three anchors, the hero is main to deep.',
    tokens: ['--poc2-mark', '--poc2-hero', '--poc2-bubble'],
    gradient: true,
  },
];

type Pairing = { label: string; fg: string; bg: string; onBand?: boolean; floor?: number; note?: string };
const PAIRINGS: Pairing[] = [
  { label: 'foreground / background', fg: '--foreground', bg: '--background', note: 'white in light — unchanged' },
  { label: 'muted-foreground / background', fg: '--muted-foreground', bg: '--background' },
  { label: 'muted-foreground / muted', fg: '--muted-foreground', bg: '--muted', note: 'tightest in the system' },
  { label: 'muted-foreground / secondary', fg: '--muted-foreground', bg: '--secondary' },
  { label: 'accent-foreground / accent', fg: '--accent-foreground', bg: '--accent' },
  { label: 'primary-foreground / primary', fg: '--primary-foreground', bg: '--primary', note: 'pure white on every brand — the marks moved, not the label' },
  { label: 'sidebar-foreground / sidebar', fg: '--sidebar-foreground', bg: '--sidebar' },
  { label: 'sidebar-accent-fg / sidebar-accent', fg: '--sidebar-accent-foreground', bg: '--sidebar-accent' },
  { label: 'muted-foreground / band', fg: '--muted-foreground', bg: '--poc2-band', note: 'the greyed deep stock' },
  { label: 'muted-foreground / band DEEPEST', fg: '--muted-foreground', bg: '--poc2-band-deep' },
  { label: 'muted-foreground / band-strong', fg: '--muted-foreground', bg: '--poc2-band-strong' },
  { label: 'error / error-light', fg: '--error', bg: '--error-light', note: 'over the WHITE page' },
  { label: 'error / error-light ON BAND', fg: '--error', bg: '--error-light', onBand: true, note: 'the remaining hazard' },
  { label: 'border / background', fg: '--border', bg: '--background', floor: 3, note: '1.4.11 — pre-existing' },
];

// ─────────────────────────────────────────────────────────────────────────────
// STORIES — sidebar order is declaration order, so this list IS the running order
// ─────────────────────────────────────────────────────────────────────────────
/*
 *   1  Brands        the model: three anchors, and what each one is for
 *   2  Mark Anatomy  one mark taken apart, plus its motion
 *   3  Aiden Surface the third axis — layered inside a brand, not beside it
 *   4  Tokens        what changes, and what is new
 *   5  Audit         every pairing measured live, in both modes
 *   6  Dashboard     all six as product UI
 *   7  Marketing     all six as marketing pages
 *   8  Suite         the parent page the six sit under
 *
 * Tokens and Audit each end in a panel imported from ./DeeperThemingParts —
 * those were a separate "— Adoption" section until 2026-08-02, which split one
 * argument across two places in the sidebar and buried the measurement that
 * decides it.
 */

export const Brands: Story = {
  render: function BrandsStory() {
    const mode = useGlobalMode();
    const hostRef = useRef<HTMLDivElement>(null);
    const [drop, setDrop] = useState<Record<string, { onLight: number; onDark: number }>>({});

    useEffect(() => {
      const host = hostRef.current;
      if (!host) return;
      const probe = host.firstElementChild as HTMLElement;
      const read = (v: string) => {
        probe.style.backgroundColor = '';
        probe.style.backgroundColor = v;
        return toRGBA(getComputedStyle(probe).backgroundColor);
      };
      // PURE WHITE is the light label. Every theme scope in tokens.scss sets its
      // --{code}-primary-foreground to #ffffff; #f8fafc is only the un-themed base,
      // which no branded button ever renders. An earlier solve used the base and
      // came out over-darkened by ~1 L*.
      const lightLabel = toRGBA('#ffffff')!;
      const darkLabel = toRGBA('#0f172a')!;
      const next: Record<string, { onLight: number; onDark: number }> = {};
      for (const b of SUB_BRANDS) {
        const fill = read(PRIMARY_LIGHT[b]);   // the authored primary — nb's differs from its mark
        if (fill) next[b] = { onLight: contrast(lightLabel, fill), onDark: contrast(darkLabel, fill) };
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
                {swatch(a[0], '--primary-highlight', a[0])}
                {swatch(a[1], PRIMARY_IS_AUTHORED[b] ? 'mark middle' : '--primary', a[1])}
                {swatch(a[2], '--primary-deep', a[2])}
                {PRIMARY_IS_AUTHORED[b] && (
                  <>
                    <div style={{ width: 1, height: 56, background: 'var(--border)' }} />
                    {swatch(PRIMARY[mode][b], '--primary', 'authored apart')}
                  </>
                )}
              </div>
            );
          })}

          <div>
            <h2 style={H2}>One colour, one label</h2>
            <p style={P}>
              The middle anchor used to be called <em>main</em>, and{' '}
              <code style={MONO}>--primary</code> was a second value derived from it — a few percent
              darker, because a mark&rsquo;s mid stop is a display colour and did not clear AA under a
              label. Two colours a hair apart is a smell, so it is gone:{' '}
              <strong><code style={MONO}>--primary</code> is the middle anchor.</strong>
            </p>
            <p style={P}>
              An intermediate pass paid the contrast on the <em>label</em> side — six brands got a dark{' '}
              <code style={MONO}>--primary-foreground</code>, <code style={MONO}>db</code> a light one.
              It measured fine and it was a worse system: the CTA&rsquo;s label flipped colour depending
              on which sub-app you were in, for a reason no consumer could see. So{' '}
              <strong>the marks moved instead.</strong> Every light middle came down its own hue —
              chroma and hue untouched — to the lightest value where pure white clears 4.5, and every
              brand now carries <code style={MONO}>#ffffff</code>.
            </p>
            <table style={{ borderCollapse: 'collapse', fontSize: 'var(--text-sm)', maxWidth: 640 }}>
              <thead>
                <tr style={{ borderBottom: 'var(--border-w-100) solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: 'var(--p-2)' }}>Brand</th>
                  <th style={{ textAlign: 'left', padding: 'var(--p-2)' }}>--primary</th>
                  <th style={{ textAlign: 'right', padding: 'var(--p-2)' }}>white on it</th>
                  <th style={{ textAlign: 'right', padding: 'var(--p-2)' }}>ink on it</th>
                </tr>
              </thead>
              <tbody>
                {SUB_BRANDS.map((b) => {
                  const d = drop[b];
                  const cell = (v: number | undefined, live: boolean) => (
                    <td style={{
                      ...MONO, padding: 'var(--p-2)', textAlign: 'right',
                      color: !live ? 'var(--muted-foreground)' : v && v >= 4.5 ? 'var(--success)' : 'var(--error)',
                      fontWeight: live ? 'var(--font-semibold)' : 'var(--font-normal)',
                    }}>{v ? v.toFixed(2) : '—'}</td>
                  );
                  return (
                    <tr key={b} style={{ borderBottom: 'var(--border-w-50) solid var(--border)' }}>
                      <td style={{ ...MONO, padding: 'var(--p-2)', fontSize: 'var(--text-sm)' }}>{b}</td>
                      <td style={{ ...MONO, padding: 'var(--p-2)' }}>{PRIMARY_LIGHT[b]}</td>
                      {cell(d?.onLight, true)}
                      {cell(d?.onDark, false)}
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p style={{ ...P, marginTop: 'var(--p-4)' }}>
              <strong>Solve against <code style={MONO}>#ffffff</code>, not{' '}
              <code style={MONO}>#f8fafc</code>.</strong> Every theme scope in{' '}
              <code style={MONO}>tokens.scss</code> sets its{' '}
              <code style={MONO}>--&#123;code&#125;-primary-foreground</code> to pure white;{' '}
              <code style={MONO}>#f8fafc</code> is only the un-themed base, which no branded button ever
              renders. An earlier solve used the base and came out over-darkened. And solve against the{' '}
              <strong>rounded hex</strong> — stepping L* down until the float cleared 4.5 produced two
              values that fail once written as 8-bit.
            </p>
            <p style={P}>
              <code style={MONO}>nb</code> and <code style={MONO}>dc</code> gave up about 10&nbsp;L*
              to earn the white label. <code style={MONO}>db</code> has since been set to the shipped
              indigo <code style={MONO}>#6063f1</code>, which clears at 4.61 without a solve. The <strong>deep</strong> stops were
              then re-cut by hand so the marks kept their depth — those are a design judgement, not a
              derivation, and they are safe: deep only reaches the surfaces through a 60%-slate stock
              applied at single digits, so the re-cut moves every tinted surface by{' '}
              <strong>0.0–0.6&nbsp;ΔE00</strong> and muted-text contrast by at most 0.05.
            </p>
            <p style={P}>
              Dark mode is untouched and still takes the <strong>ink</strong> label: its middles are
              light by construction, white on them reads 2.66–3.34, and{' '}
              <code style={MONO}>#0f172a</code> clears at 5.1–6.4. Light carries white, dark carries ink
              — which is what every other token in the system already does.
            </p>
          </div>

          <div>
            <h2 style={H2}>What each anchor is for</h2>
            <p style={P}>
              <strong>Highlight → its own token, and nothing with text on it.</strong>{' '}
              <code style={MONO}>--primary-highlight</code> drives the mark, the hero gradient, the
              marketing bubble field, and small non-text accents like a status dot. It is the brightest,
              most saturated colour the brand owns, so the test for reaching for it is simply whether
              anything is read on top; if something is, it is the wrong token. An earlier pass built the light surfaces from it; the numbers were good and
              the result was wrong — a panel made from a highlight announces itself, and sub-apps of one
              suite should not announce themselves at every surface.
              <br />
              <strong>Primary → the accent and the lines.</strong> CTAs, selection, active nav,
              borders, rings. It is <code style={MONO}>--primary</code> itself, so the whole existing
              family in <code style={MONO}>tokens.scss</code> — <code style={MONO}>-hover</code>,{' '}
              <code style={MONO}>-light</code>, <code style={MONO}>-soft</code>,{' '}
              <code style={MONO}>-border</code>, <code style={MONO}>-ring</code>,{' '}
              <code style={MONO}>-focus</code>, <code style={MONO}>-text</code> — re-derives from it for
              free. Setting one value themes all eight.
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

export const MarkAnatomy: Story = {
  render: function MarkAnatomyStory() {
    const mode = useGlobalMode();
    const [brand, setBrand] = useState<BrandKey>('aiden');
    const [live, setLive] = useState(true);
    const [tilt, setTilt] = useState(true);
    const swatch = (label: string, value: string) => (
      <div key={label} style={{ display: 'grid', gap: 'var(--p-1)' }}>
        <div style={{ background: value, width: 64, height: 40, borderRadius: 'var(--rounded-md)', border: 'var(--border-w-100) solid var(--border)' }} />
        <span style={{ ...MONO, color: 'var(--muted-foreground)' }}>{label}</span>
        <span style={{ ...MONO, color: 'var(--muted-foreground)', opacity: 0.7 }}>{value}</span>
      </div>
    );
    const a = BRAND_ANCHORS[brand][mode];
    return (
      <>
        <PocStyle />
        <div style={PAGE}>
          <div>
            <h2 style={H2}>One mark, layer by layer</h2>
            <p style={P}>
              The marks elsewhere in this POC were a brand ramp and a flat white wash — two of the six
              layers the Figma component actually has, which is why they read as a coloured tile rather
              than as glass. This is the full stack, rebuilt from the component&rsquo;s own geometry
              rather than by eye.
            </p>
            <p style={P}>
              <strong>The STATIC mark does not change between modes.</strong> It reads{' '}
              <code style={MONO}>--mark-a/b/c</code>, which carry the light anchors in both — an app
              icon is artwork, and an iOS icon is the same object whatever the system theme is doing.
              Treating it as a themed component is what broke it: dark&rsquo;s anchors are lighter by
              construction, so the marks came out <strong>8–14&nbsp;L* brighter in dark than in light</strong>,
              on a page 87 points darker. They stopped being objects and became lamps. Every layer of
              the glass — the sheen, the inner highlights, the bloom — assumes a mid-dark tile and does
              nothing on a pale one.
              {'\n\n'}
              <strong>The LIVE mark does — and that is an unresolved inconsistency, not a feature.</strong>{' '}
              Turn Motion on (it is on by default) and the tile switches to{' '}
              <code style={MONO}>--primary-highlight / --mark-mid / --mark-deep</code>, every one of
              which is mode-aware. So the rule above holds for the mark this POC documents and NOT for
              the mark it renders in the roster, the marketing heroes or the Figma pages, all of which
              use the live variant. The swatches below follow whichever mark is on screen. Deciding
              which behaviour is correct is an open question for the owner; until then, do not quote
              the paragraph above as though it covered both.
            </p>
            <div style={{ display: 'flex', gap: 'var(--p-4)', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 'var(--p-2)', flexWrap: 'wrap' }}>
                {BRAND_KEYS.map((b) => (
                  <Chip key={b} id={`ma-${b}`} label={b} active={b === brand} onClick={() => setBrand(b)} />
                ))}
              </div>
              <Switch id="ma-live" label="Motion" checked={live} onCheckedChange={setLive} />
              <Switch id="ma-tilt" label="Pointer tilt" checked={tilt} onCheckedChange={setTilt} />
            </div>
          </div>

          {/* the hero: one mark, large */}
          <Scope brand={brand} mode={mode}>
            <div style={{ display: 'flex', gap: 'var(--p-10)', alignItems: 'center', flexWrap: 'wrap', padding: 'var(--p-10)', background: 'var(--secondary)', borderRadius: 'var(--rounded-2xl)' }}>
              <Mark brand={brand} size={168} live={live} tilt={tilt} />
              <div style={{ display: 'grid', gap: 'var(--p-4)' }}>
                <div style={{ display: 'flex', gap: 'var(--p-4)', alignItems: 'flex-end' }}>
                  {[96, 64, 48, 32, 24].map((s) => <Mark key={s} brand={brand} size={s} live={live} tilt={tilt} />)}
                </div>
                <p style={{ ...P, margin: 0 }}>
                  Every layer is in <strong>percent</strong>, so one rule serves 24px and 168px. The two
                  that cannot be — the sparkle&rsquo;s blur and the shadow offsets — read{' '}
                  <code style={MONO}>--poc2-mark-px</code>, which the component sets inline.
                </p>
                <div style={{ display: 'flex', gap: 'var(--p-4)', flexWrap: 'wrap' }}>
                  {/*
                    THE SWATCHES MUST FOLLOW THE MARK THAT IS ACTUALLY RENDERED,
                    and which one that is depends on the Motion toggle — this row
                    got it wrong twice in the same session, so it is spelled out.

                    STATIC mark  reads --mark-a/b/c, which carry the LIGHT anchors
                                 in both modes. Mode-independent artwork.
                    LIVE mark    reads --primary-highlight / --mark-mid /
                                 --mark-deep, every one of which IS mode-aware.

                    Motion defaults ON, so the default view is the live mark and
                    the swatches have to be mode-aware with it. Hardcoding
                    markDeep.light here made the third swatch disagree with both
                    the tile above it and its own two neighbours in dark mode.
                  */}
                  {swatch('highlight', live ? a[0] : BRAND_ANCHORS[brand].light[0])}
                  {swatch(PRIMARY_IS_AUTHORED[brand] ? 'mark middle' : 'middle', live ? a[1] : BRAND_ANCHORS[brand].light[1])}
                  {swatch('mark deep', BRAND_ANCHORS[brand].markDeep[live ? mode : 'light'])}
                </div>
              </div>
            </div>
          </Scope>

          {/* the exploded view */}
          <div>
            <h2 style={H2}>What each layer is doing</h2>
            <div style={{ display: 'grid', gap: 'var(--p-3)' }}>
              {LAYERS.map((l) => (
                <div key={l.n} style={{ display: 'flex', gap: 'var(--p-5)', alignItems: 'flex-start', padding: 'var(--p-4)', border: 'var(--border-w-100) solid var(--border)', borderRadius: 'var(--rounded-lg)', background: 'var(--card)' }}>
                  <strong style={{ ...MONO, fontSize: 'var(--text-sm)', width: 150, flex: 'none', color: 'var(--foreground)' }}>{l.n}</strong>
                  <div style={{ display: 'grid', gap: 'var(--p-1)' }}>
                    <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)' }}>{l.what}</span>
                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)', lineHeight: 'var(--leading-6)' }}>{l.how}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* the whole set, live */}
          <div>
            <h2 style={H2}>The set</h2>
            <p style={P}>
              Hover any of them. Motion is <strong>opt-in</strong> — a mark that animates unprompted in
              a grid of seven is noise, one that answers a hover is an affordance.
              <br />
              Three ambient layers. The <strong>bloom</strong> drifts on an 11s orbit; the{' '}
              <strong>sheen</strong> and the <strong>sparkle</strong> share 7.3s{' '}
              <em>deliberately in phase</em> — they are the same light on the same glass, and running
              them on different clocks makes the tile look like it has two light sources. The bloom
              shares no factor with either, so the set never quite repeats.
              <br />
              The sparkle is a <strong>lens flare</strong>: it holds Figma&rsquo;s corner and wanders
              by at most 4% of the tile while its intensity swells and falls. It does not tour the
              corners — a highlight comes from one fixed light on one fixed surface, and a version that
              hopped between three of them read as three different sparkles rather than one piece of
              glass. The drift is biased up and left so it can never reach the glyph.
              <br />
              <strong>Pointer tilt is the tvOS parallax.</strong> The tile turns to follow the pointer
              and its layers separate in depth: the bloom drifts <em>with</em> the turn and least,
              because it is furthest back; the flare sweeps <em>against</em> it hardest, because a
              specular does not sit still on a turning surface; the icon moves against it too, so it
              floats above the face; and the shadow swings opposite and deepens, because the light did
              not move — only the object did.
              <br />
              The whole thing is three numbers. A pointer handler writes{' '}
              <code style={MONO}>--mx</code>, <code style={MONO}>--my</code> and{' '}
              <code style={MONO}>--on</code>; every rule is a <code style={MONO}>calc</code> off those,
              so React never re-renders and nothing is written per frame but the variables. Tracking
              transitions at 110ms so the tile feels attached to the pointer; the return is the long
              460ms ease-out. One duration for both would either lag under the finger or snap on
              release.
            </p>
            <div style={{ display: 'flex', gap: 'var(--p-6)', flexWrap: 'wrap' }}>
              {BRAND_KEYS.map((b) => (
                <Scope key={b} brand={b} mode={mode}>
                  <div style={{ display: 'grid', gap: 'var(--p-2)', justifyItems: 'center' }}>
                    <Mark brand={b} size={88} live={live} tilt={tilt} />
                    <span style={{ ...MONO, color: 'var(--muted-foreground)' }}>{b}</span>
                  </div>
                </Scope>
              ))}
            </div>
          </div>

          <div>
            <h2 style={H2}>What is not reproduced</h2>
            <p style={P}>
              The component carries <strong>three further drop shadows that are switched off</strong>{' '}
              (32/−4 at y16, 20/−2 at y8, and 4/0 at y−2). They are in the file, they are not in the
              render, and they are not here either. Worth knowing they exist before anyone
              &ldquo;restores&rdquo; them.
              <br />
              A fourth fill is off too — a magenta radial at 30%. On the aiden mark in particular it
              would change the identity, not just the finish.
            </p>
          </div>
        </div>
      </>
    );
  },
};

export const AidenSurface: Story = {
  render: function AidenSurfaceStory() {
    const mode = useGlobalMode();
    return (
      <>
        <PocStyle />
        <div style={PAGE}>
          <div>
            <h2 style={H2}>Aiden is a surface, not a seventh brand</h2>
            <p style={P}>
              The six sub-apps are siblings, and a theme says <em>which room you are in</em>. Aiden is
              the assistant that walks into whichever room you are already in — so it is selected by{' '}
              <code style={MONO}>data-surface</code>, it never appears in the brand picker, and it
              composes <em>inside</em> any theme rather than replacing it.
            </p>
            <p style={P}>
              <strong>It takes the main brand&rsquo;s neutrals.</strong> An Aiden panel inside{' '}
              <code style={MONO}>db</code> keeps db&rsquo;s page; Aiden&rsquo;s own app sits on plain
              white. That is the right answer twice: a panel that repainted its host&rsquo;s surfaces
              would tear a hole in the page, and Aiden&rsquo;s own product is a <strong>chat</strong> —
              a reading surface, where a tint is a liability. Claude and ChatGPT are near-neutral for
              the same reason.
            </p>
            <p style={P}>
              <strong>The gradient carries the identity instead.</strong> A gradient FAB in a db page
              does not read as another brand&rsquo;s button; it reads as <em>not part of the page</em>.
              That is a categorical difference, where a surface tint is only ever a matter of degree.
            </p>
            <p style={P}>
              <strong>The button fill is two stops; the mark stays three.</strong> They are not the same
              object. A mark is 48px of artwork with nothing on it, so a third stop reads as depth; a
              button is a wide flat shape with a label across it, and the third stop only ever shows up
              as a band the eye has to cross.
              <br />
              Both ends have to clear the label, which the mark&rsquo;s stops do not, so the fill is
              authored rather than derived: <code style={MONO}>#0060ba → #8244ff</code> in light on
              white (worst point across the ramp <strong>4.99</strong>) and{' '}
              <code style={MONO}>#47a6ff → #aa75ff</code> in dark on ink (<strong>5.69</strong>). The
              violet end holds across modes (308/308); the blue end does not — 282 in light against 271
              in dark. That is a real 11° split, taken deliberately: dark needs the extra lightness to
              carry ink, and the hue moved with it. The hovers move in <em>opposite</em> directions: light deepens because it
              carries white, dark lightens because it carries ink.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px,1fr))', gap: 'var(--p-5)' }}>
            <Frame label='data-theme="db" + data-surface="aiden"'>
              <AidenInHost mode={mode} />
            </Frame>
            <Frame label='data-surface="aiden" — its own app'>
              <Scope brand="aiden" mode={mode}>
                <div style={{ background: 'var(--background)', minHeight: 340, display: 'grid', gap: 'var(--p-4)', padding: 'var(--p-6)', alignContent: 'start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--p-3)' }}>
                    <Mark brand="aiden" size={30} />
                    <strong style={{ ...MONO, fontSize: 'var(--text-sm)', flex: 1 }}>aiden</strong>
                    <Badge id="as-b" variant="default" label="Beta" />
                  </div>
                  <p style={{ margin: 0, fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-6)', color: 'var(--muted-foreground)' }}>
                    Neutral page, neutral cards. The chrome gets out of the way and the gradient does
                    the identifying.
                  </p>
                  <div style={{ background: 'var(--secondary)', borderRadius: 'var(--rounded-lg)', padding: 'var(--p-3)', fontSize: 'var(--text-sm)' }}>
                    How do I split this cohort by plan?
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--p-2)', flexWrap: 'wrap' }}>
                    <Chip id="as-c1" label="Summarise" active />
                    <Chip id="as-c2" label="Explain" />
                    <Chip id="as-c3" label="Chart it" />
                  </div>
                  <span style={{ marginTop: 'auto' }}>
                    <Button id="as-send" label="Ask Aiden" IconRight={ArrowRight} />
                  </span>
                </div>
              </Scope>
            </Frame>
          </div>

          <div>
            <h2 style={H2}>Where this currently does not work</h2>
            <p style={P}>
              <strong>Aiden&rsquo;s flat accent is 5.9&nbsp;ΔE from db&rsquo;s.</strong>{' '}
              <code style={MONO}>#5a56d3</code> against <code style={MONO}>#6063f1</code> — the
              tightest pair in the set, between the two apps that overlap most. It was 20.7 before db
              moved to the shipped indigo. That accent paints Aiden&rsquo;s text, borders, chips and
              its own app&rsquo;s buttons, so it matters more than the gradient does, and nothing about
              the gradient fixes it.
            </p>
            <p style={P}>
              <strong>The gradient&rsquo;s closest approach to db is 6.6&nbsp;ΔE</strong>, and it is now
              the <em>violet</em> end rather than the middle — db is violet too. Weighting the ramp no
              longer helps, because you cannot move an endpoint by changing where it starts. The only
              lever is rotating the violet away from db&rsquo;s hue 299:{' '}
              <code style={MONO}>#9a2ff0</code> (h314) reaches 9.3,{' '}
              <code style={MONO}>#b31fd4</code> (h322) reaches 11.0.
            </p>
            <p style={P}>
              <strong>The old &ldquo;db and aiden share a deep&rdquo; rule is moot, not broken.</strong>{' '}
              It existed so their surfaces would match; Aiden takes the main neutrals now, so it never
              derives a surface from its deep at all and they match by construction whatever the deeps
              do. Aiden&rsquo;s deep is mark artwork only.
            </p>
          </div>

          <div>
            <h2 style={H2}>The rule that protects it</h2>
            <p style={P}>
              <strong>Gradient fill = Aiden. Flat fill = a sub-app.</strong> Every mark in this system
              is a three-stop gradient, so it is tempting to push that into the six brands&rsquo;
              buttons too. Don&rsquo;t — the second gradient in the system is the one that kills the
              first. Below, the same button in all seven scopes: six flat, one gradient.
            </p>
            <div style={{ display: 'flex', gap: 'var(--p-4)', flexWrap: 'wrap' }}>
              {[...SUB_BRANDS, 'aiden' as BrandKey].map((b) => (
                <Scope key={b} brand={b} mode={mode}>
                  <div style={{ display: 'grid', gap: 'var(--p-2)', justifyItems: 'center' }}>
                    <Button id={`rule-${b}`} label="Continue" size="sm" />
                    <span style={{ ...MONO, color: 'var(--muted-foreground)' }}>{b}</span>
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

export const Tokens: Story = {
  render: function TokensStory() {
    const hostRef = useRef<HTMLDivElement>(null);
    const mode = useGlobalMode();
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
            <span key={b} data-m={b} data-theme-poc2="" data-brand={b} data-mode={mode} style={{ '--poc2-str': 1, '--poc2-chrome': 1 } as CSSProperties}>
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

          {/* What is NEW, then what CHANGES — the same two questions in one place.
              These were their own sidebar section; splitting the token story from
              the token diff meant nobody read both. */}
          <NewTokensPanel />
          <TokenDiffPanel />
        </div>
      </>
    );
  },
};

export const Audit: Story = {
  render: function AuditStory() {
    const hostRef = useRef<HTMLDivElement>(null);
    const mode = useGlobalMode();
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
          const behind = read(p.onBand ? '--poc2-band' : '--background');
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
            <span key={b} data-a={b} data-theme-poc2="" data-brand={b} data-mode={mode} style={{ '--poc2-str': 1, '--poc2-chrome': 1 } as CSSProperties}>
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
              <strong><code style={MONO}>primary-foreground / primary</code></strong> is the one-colour
              model working. Every brand clears 4.5 with the same{' '}
              <code style={MONO}>#ffffff</code> label on the mark&rsquo;s own middle stop. The marks
              moved to earn that: each light middle came down its own hue to the lightest value where
              white passes, rather than the label changing colour per sub-app.
              <br />
              <strong>The bubble field is not in this table</strong> — it is a{' '}
              <code style={MONO}>background-image</code>, and the probe reads computed{' '}
              <code style={MONO}>background-color</code>, so it would silently report the surface
              underneath. Composited by hand at its worst overlap point it measures{' '}
              <strong>4.97&ndash;5.82</strong> for muted text in light and{' '}
              <strong>6.68&ndash;8.58</strong> in dark. That gap between &ldquo;what the probe can see&rdquo;
              and &ldquo;what is on screen&rdquo; is worth remembering: every gradient in this file is
              invisible to it.
              <br />
              <strong><code style={MONO}>error / error-light ON BAND</code></strong> is the one hazard
              left. The semantic tints are <code style={MONO}>rgba()</code> composited over whatever is
              behind them; on the white page they are exactly as shipped, on a band they are not. Keep
              alerts on white, or re-derive the tints.
            </p>
          </div>

          {/* The adoption audit: shipped vs POC through two live cascades, with a
              guard that withholds every number if the POC scope is not actually
              in force. Both of this measurement's earlier bugs were silent and
              plausible, which is why it now refuses to guess. */}
          <AuditPanel />
        </div>
      </>
    );
  },
};

export const Dashboard: Story = {
  render: function DashboardStory() {
    const mode = useGlobalMode();
    const [strength, setStrength] = useState(1);
    const [chromeOn, setChromeOn] = useState(1);
    // EVERY application, not a sample. Three brands was enough to show the
    // mechanism and not enough to answer the real question — whether six of them
    // still read as one suite when you scroll past them in a row.
    const show: BrandKey[] = SUB_BRANDS;
    return (
      <>
        <PocStyle />
        <div style={PAGE}>
          <div>
            <h2 style={H2}>The same dashboard, every application</h2>
            <p style={P}>
              In light mode the content area is <strong>white in all of them</strong>. The brand lives in
              the mark, the rail and the accent. Borders and shadows are held near the system&rsquo;s
              slate on purpose — a hairline or a card shadow that carries the brand is the loudest tell
              of a cheap theme, and the mark carries identity now so the chrome does not have to.
            </p>
            <p style={P}>
              Scroll the whole set rather than comparing two. The question this story exists to answer is
              not &ldquo;can you tell them apart&rdquo; — you can — but whether six of them in a row still
              read as one product family. <code style={MONO}>aiden</code> is last because it is the
              surface, not an application.
            </p>
            <div style={{ display: 'flex', gap: 'var(--p-5)', flexWrap: 'wrap', alignItems: 'center' }}>
              <Switch id="d-on" label="Theming on" checked={strength === 1} onCheckedChange={(v) => setStrength(v ? 1 : 0)} />
              <Switch id="d-chrome" label="Tint the rail" checked={chromeOn === 1} onCheckedChange={(v) => setChromeOn(v ? 1 : 0)} />
              </div>
          </div>
          {show.map((b) => (
            <Frame key={b} label={`data-brand="${b}"`}>
              <Scope brand={b} mode={mode} strength={strength} chromeOn={chromeOn}>
                <DashboardPage brand={b} mode={mode} />
              </Scope>
            </Frame>
          ))}
        </div>
      </>
    );
  },
};

export const Marketing: Story = {
  render: function MarketingStory() {
    const mode = useGlobalMode();
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
          </div>
          {SUB_BRANDS.map((b) => (
            <Frame key={b} label={`data-brand="${b}"`}>
              <Scope brand={b} mode={mode}>
                <MarketingPage brand={b} />
              </Scope>
            </Frame>
          ))}
        </div>
      </>
    );
  },
};

export const Suite: Story = {
  render: function SuiteStory() {
    const mode = useGlobalMode();
    return (
      <>
        <PocStyle />
        <div style={PAGE}>
          <div>
            <h2 style={H2}>The suite page — all six at once</h2>
            <p style={P}>
              Every other view here shows one brand. This one shows the parent, and it is the harder
              test: six sub-apps on a single page, in a single scroll, each carrying its own mark,
              accent, border and tinted card. If they read as six unrelated products, the model has
              failed however good any one of them looks alone.
            </p>
            <p style={P}>
              It is also the only page allowed to use <strong>every brand at once</strong>. The
              headline ramp and the six-corner bubble field are the parent&rsquo;s identity — the
              parent is not a colour, it is the set — and both are scoped to{' '}
              <code style={MONO}>.poc2-suite-*</code> so they cannot appear inside a branded page,
              where the whole point is that one brand is in charge.
            </p>
          </div>
          <Frame label="the suite">
            <Scope brand="" mode={mode}>
              <SuitePageV2 mode={mode} />
            </Scope>
          </Frame>
        </div>
      </>
    );
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Side by side — v1 (the hand-tuned POC) against v2 (the solver-derived set)
// ─────────────────────────────────────────────────────────────────────────────

import { POC_CSS as POC_CSS_V1, BRAND_ANCHORS as ANCHORS_V1 } from './deeperThemingRecipe';

/**
 * The comparison the parallel-POC decision exists for: the same brand row
 * rendered under `[data-theme-poc]` (v1) and `[data-theme-poc2]` (v2), one
 * frame, both modes driven by the global toggle. It is also the regression
 * check that v1 still renders untouched — its column must look exactly as it
 * did before this round.
 */
export const SideBySide: Story = {
  name: 'v1 vs v2 — side by side',
  render: function SideBySideStory() {
    const mode = useGlobalMode();

    const row = (
      version: 'v1' | 'v2',
      b: BrandKey,
      anchors: { light: readonly [string, string, string]; dark: readonly [string, string, string] },
    ) => {
      const [hl, mid, deep] = anchors.light;
      // aiden is a SURFACE, not a brand — its anchor selector keys on
      // data-surface, and a data-brand="aiden" wrapper matches nothing.
      const brandAttr = b === ('aiden' as BrandKey)
        ? { 'data-surface': 'aiden' }
        : { 'data-brand': b };
      const scope =
        version === 'v1'
          ? { 'data-theme-poc': '', ...brandAttr, 'data-mode': mode }
          : { 'data-theme-poc2': '', ...brandAttr, 'data-mode': mode };
      const markCls = version === 'v1' ? 'poc-mark' : 'poc2-mark';
      const heroCls = version === 'v1' ? 'poc-hero' : 'poc2-hero';
      return (
        <div
          key={`${version}-${b}`}
          {...(scope as unknown as Record<string, string>)}
          style={{
            display: 'flex', alignItems: 'center', gap: 'var(--p-3)',
            padding: 'var(--p-2-5) var(--p-3)', borderRadius: 'var(--rounded-lg)',
            background: 'var(--card)', border: 'var(--border-w-100) solid var(--border)',
          }}
        >
          <span className={markCls} style={{ width: 40, height: 40 }} aria-hidden="true" />
          <span style={{ ...MONO, width: 44 }}>{b}</span>
          {[hl, mid, deep].map((c, i) => (
            <span key={i} title={c} style={{ width: 26, height: 26, borderRadius: 'var(--rounded-md)', background: c, border: 'var(--border-w-100) solid var(--border)' }} />
          ))}
          <span className={heroCls} style={{ flex: 1, height: 10, borderRadius: 'var(--rounded-full)' }} />
          <Button id={`sbs-${version}-${b}`} size="sm" label="Primary" />
        </div>
      );
    };

    const col = (version: 'v1' | 'v2', title: string, anchors: typeof ANCHORS_V1 | typeof BRAND_ANCHORS) => (
      <div style={{ display: 'grid', gap: 'var(--p-2)', alignContent: 'start' }}>
        <h3 style={{ margin: 0, fontSize: 'var(--text-base)', fontWeight: 'var(--font-semibold)' }}>{title}</h3>
        {SUB_BRANDS.map((b) => row(version, b, anchors[b]))}
        {row(version, 'aiden' as BrandKey, anchors.aiden)}
      </div>
    );

    return (
      <>
        {/* both stylesheets, one document — the whole point of the poc2 scope */}
        <style>{POC_CSS_V1}</style>
        <PocStyle />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--p-6)', maxWidth: 1200 }}>
          {col('v1', 'v1 — hand-tuned', ANCHORS_V1)}
          {col('v2', 'v2 — solver-derived', BRAND_ANCHORS)}
        </div>
        <p style={{ maxWidth: 720, marginTop: 'var(--p-6)', fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
          Same machinery, different values. The ramp strip is each brand&rsquo;s hero
          gradient (primary → deep); the three chips are highlight / primary / deep;
          the button shows accent duty on the brand&rsquo;s own tinted card. Flip the
          global mode toggle to compare dark.
        </p>
      </>
    );
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// THE SUITE
// ─────────────────────────────────────────────────────────────────────────────
/**
 * THE CHOSEN SET (owner, 2026-08-06). The comparison round is over: ec is the
 * v1 azure, ph is the burnt orange, nb stays as it was but draws its mark
 * brighter than its primary. Those are not alternates layered on top any more —
 * they ARE `ec`, `ph` and `nb` in BRAND_ANCHORS, so every story on this page
 * shows them, not just these two views.
 */
const SUITE: BrandKey[] = ['db', 'nb', 'dc', 'ec', 'ph', 'rm', 'aiden'];

/** What each brand is, in one line — the roster reads as a suite, not a list. */
const BRAND_NOTES: Record<BrandKey, string> = {
  db: 'indigo — the flagship',
  nb: 'deep chartreuse — the darkest primary in the set, which is what keeps it apart from the orange under a red-green anomaly; its MARK is drawn brighter, because a logo pays no such debt',
  dc: 'teal',
  ec: "the v1 azure — crowds --info by design, waived on the icon+label rule",
  ph: 'burnt orange — crowds --warning on the same terms',
  rm: 'magenta',
  aiden: 'blurple — the AI surface, not a sub-app',
};

type AnchorShape = {
  light: readonly string[]; dark: readonly string[];
  accent: { light: string; dark: string }; markDeep: { light: string; dark: string };
  label?: string;
};
/**
 * The FUNCTIONAL primary — what the buttons, charts and tints use.
 *
 * It is not always the mark's middle stop. aiden has always authored the two
 * apart, and nb now does too (its mark is brighter than its primary, because
 * the primary carries a colour-blindness constraint the logo does not). A
 * swatch labelled "primary" must show the colour that actually is one.
 */
function primaryOf(key: string, m: Mode): string {
  const a = anchorsOf(key) as AnchorShape & { primary?: { light: string; dark: string } };
  if (a.primary) return a.primary[m];
  return m === 'light' ? a.light[1] : a.dark[1];
}
/** True where the mark's middle stop is authored apart from the primary. */
function markSplits(key: string): boolean {
  return !!(anchorsOf(key) as AnchorShape & { primary?: unknown }).primary;
}

function anchorsOf(key: string): AnchorShape {
  return (BRAND_ANCHORS as unknown as Record<string, AnchorShape>)[key];
}

/**
 * ROSTER — the whole suite as one list, the layout the owner sketched: mark,
 * name, the three anchors, the hero rail, and the primary button that proves
 * accent duty. Rendered in BOTH modes rather than following the toolbar,
 * because the point of this view is to see the family hold together, and half
 * a family is not a comparison.
 */
export const Roster: Story = {
  render: function RosterStory() {
    const row = (key: BrandKey, m: Mode) => {
      const a = anchorsOf(key);
      const trio = m === 'light' ? a.light : a.dark;
      return (
        <Scope key={`${key}-${m}`} brand={key} mode={m}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'auto minmax(118px, auto) auto 1fr auto',
            alignItems: 'center', gap: 'var(--p-4)',
            padding: 'var(--p-3) var(--p-4)',
          }}
          >
            <Mark brand={key} size={52} live tilt />

            <div style={{ display: 'grid', gap: 2 }}>
              <span style={{ ...MONO, fontSize: 'var(--text-sm)' }}>{key}</span>
            </div>

            <div style={{ display: 'flex', gap: 'var(--p-2)' }}>
              {[trio[0], primaryOf(key, m), trio[2]].map((c, i) => (
                <span
                  key={c}
                  title={`${['highlight', 'primary', 'deep'][i]} ${c}`}
                  style={{
                    width: 46, height: 46, background: c, borderRadius: 'var(--rounded-lg)',
                    border: '1px solid rgba(128,138,157,0.45)',
                  }}
                />
              ))}
            </div>

            {/* the hero rail: highlight → primary → deep, the gradient every
                marketing surface is built from */}
            <span style={{
              height: 10, borderRadius: 'var(--rounded-full)',
              background: `linear-gradient(90deg, ${trio[0]}, ${primaryOf(key, m)} 55%, ${trio[2]})`,
            }}
            />

            <Button id={`roster-${key}-${m}`} label="Primary" />
          </div>
        </Scope>
      );
    };

    // The panel is CHROME AROUND the brands, not a branded surface, so it paints
    // the main app's neutral page directly. It cannot borrow --background from a
    // brandless scope: in dark mode that token is a color-mix on --primary-deep,
    // which only a brand block sets, so with no brand it resolves to nothing and
    // the panel renders transparent over Storybook's white.
    const NEUTRAL: Record<Mode, { bg: string; fg: string; border: string }> = {
      dark: { bg: '#0f172a', fg: '#f8fafc', border: '#334155' },
      light: { bg: '#ffffff', fg: '#0f172a', border: '#e2e8f0' },
    };
    const panel = (m: Mode) => (
      <Scope brand="" mode={m}>
        <div style={{
          background: NEUTRAL[m].bg, color: NEUTRAL[m].fg,
          border: `1px solid ${NEUTRAL[m].border}`, borderRadius: 'var(--rounded-xl)',
          padding: 'var(--p-4)', display: 'grid', gap: 'var(--p-1)',
        }}
        >
          <span style={{ ...MONO, opacity: 0.6, padding: '0 var(--p-4) var(--p-2)' }}>{m}</span>
          {SUITE.filter((k) => k !== 'aiden').map((k) => row(k, m))}
          {/* aiden is fenced because it is a SURFACE — it layers inside any of
              the six above rather than sitting beside them */}
          <div style={{
            marginTop: 'var(--p-2)', border: `1px solid ${NEUTRAL[m].border}`,
            borderRadius: 'var(--rounded-lg)', padding: 'var(--p-1)',
          }}
          >
            {row('aiden', m)}
          </div>
        </div>
      </Scope>
    );

    return (
      <>
        <PocStyle />
        <div style={{ display: 'grid', gap: 'var(--p-6)', maxWidth: 1280 }}>
          <div style={{ display: 'grid', gap: 'var(--p-2)', maxWidth: 760 }}>
            <h2 style={H2}>The suite</h2>
            <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
              The six sub-apps and the Aiden surface, as chosen. Each row is the mark, the
              three anchors (highlight · primary · deep), the hero rail those anchors build,
              and the primary button that proves the accent carries a label — in both modes,
              so the family can be judged whole rather than half at a time.
            </p>
          </div>
          <div style={{ display: 'grid', gap: 'var(--p-6)' }}>
            {panel('dark')}
            {panel('light')}
          </div>

          {/* With nothing assigned to a slot, the only thing that still binds is
              which options can be used TOGETHER — so it belongs on this page. */}
          <div style={{ display: 'grid', gap: 'var(--p-2)', maxWidth: 760 }}>
            <h3 style={{ ...H2, fontSize: 'var(--text-base)', margin: 0 }}>What this set costs</h3>
            <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
              Two brands here buy their character from a sector a semantic already occupies,
              and both were waived deliberately rather than solved away. <strong>ec</strong>{' '}
              is hue 240, which <em>is</em> <code>--info</code>&rsquo;s hue — ΔE 6.0 in light,
              6.9 in dark, against an 8.5 impersonation line. <strong>ph</strong> sits 6.5
              from <code>--warning</code>. The condition on both is the icon+label rule:
              neither may plot a series against its waived semantic without a glyph and a
              label carrying the distinction. Everything else clears on its own —{' '}
              <strong>nb</strong> is the one to leave alone, since its darkness is what holds
              it apart from the orange under a red-green anomaly (colour-blind ΔE 5.0).
            </p>
          </div>
        </div>
      </>
    );
  },
};

/**
 * ROSTER DETAIL — the same selected suite in the card layout the owner liked
 * from Alternates: every brand in both modes at once, with swatches, mark,
 * accent duty and a three-series chart, so the whole system can be judged in
 * one scroll rather than by flipping between stories.
 */
export const RosterDetail: Story = {
  render: function RosterDetailStory() {
    const card = (key: BrandKey, m: Mode) => {
      const a = anchorsOf(key);
      const trio = m === 'light' ? a.light : a.dark;
      const chip = (c: string, label: string) => (
        <div style={{ display: 'grid', gap: 4, minWidth: 62 }}>
          <div style={{ background: c, height: 32, borderRadius: 'var(--rounded-md)', border: 'var(--border-w-100) solid var(--border)' }} />
          <span style={{ ...MONO, color: 'var(--muted-foreground)' }}>{label}</span>
          <span style={{ ...MONO, color: 'var(--muted-foreground)', opacity: 0.65 }}>{c}</span>
        </div>
      );
      return (
        <Scope key={`${key}-${m}`} brand={key} mode={m}>
          <div style={{
            background: 'var(--background)', color: 'var(--foreground)',
            border: 'var(--border-w-100) solid var(--border)', borderRadius: 'var(--rounded-xl)',
            padding: 'var(--p-4)', display: 'grid', gap: 'var(--p-3)', height: '100%',
          }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--p-3)' }}>
              <Mark brand={key} size={44} live />
              <div style={{ display: 'grid', gap: 2 }}>
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)' }}>{key}</span>
                <span style={{ ...MONO, color: 'var(--muted-foreground)' }}>{m}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--p-2)', flexWrap: 'wrap' }}>
              {chip(trio[0], 'highlight')}
              {chip(primaryOf(key, m), 'primary')}
              {chip(trio[2], 'deep')}
              {chip(a.accent[m], 'accent')}
              {/* Only nb and aiden draw their mark in a different colour from
                  their primary, so the extra chip appears only where there is
                  actually a second value to see. */}
              {markSplits(key) && chip(trio[1], 'mark mid')}
              {chip(a.markDeep[m], 'mark deep')}
            </div>

            <div style={{ display: 'flex', gap: 'var(--p-2)', alignItems: 'center', flexWrap: 'wrap' }}>
              <Button id={`rd-${key}-${m}-cta`} size="sm" label="Primary action" />
              <Button id={`rd-${key}-${m}-out`} size="sm" style="outline" label="Outline" />
              <Badge id={`rd-${key}-${m}-badge`}>Badge</Badge>
            </div>

            <BarChart
              id={`rd-${key}-${m}-chart`}
              title="Sessions by channel"
              categories={['Q1', 'Q2', 'Q3', 'Q4']}
              height={128}
              series={[
                { key: 'a', label: 'Direct', data: [420, 512, 486, 640] },
                { key: 'b', label: 'Referral', data: [280, 310, 402, 380] },
                { key: 'c', label: 'Organic', data: [180, 240, 220, 300] },
              ]}
            />
          </div>
        </Scope>
      );
    };

    return (
      <>
        <PocStyle />
        <div style={{ display: 'grid', gap: 'var(--p-6)', maxWidth: 1280 }}>
          <div style={{ display: 'grid', gap: 'var(--p-2)', maxWidth: 760 }}>
            <h2 style={H2}>The suite, in detail</h2>
            <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
              Every brand in both modes side by side: the anchors, the mark, accent duty on
              a real button pair, and a three-series chart — primary, deep and accent, which
              is exactly where a brand&rsquo;s colour stops and the neutrals take over. A
              &ldquo;mark mid&rdquo; chip appears only on the two brands that draw their logo
              in a different colour from their primary. Aiden closes the list as the surface
              it is.
            </p>
          </div>

          {SUITE.map((key) => (
            <div key={key} style={{ display: 'grid', gap: 'var(--p-2)' }}>
              <span style={{ ...MONO, color: 'var(--muted-foreground)' }}>
                {key} — {BRAND_NOTES[key]}
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(280px, 1fr))', gap: 'var(--p-3)' }}>
                {card(key, 'dark')}
                {card(key, 'light')}
              </div>
            </div>
          ))}
        </div>
      </>
    );
  },
};

/**
 * CHART PALETTES — three jobs, three ramps, one attribute.
 *
 * The categorical set answers "which series is this"; sequential answers "how
 * much"; diverging answers "which side of the line, and how far". They are not
 * interchangeable, and the commonest charting mistake is using one for another
 * job — a categorical ramp on ordered data invents differences that are not in
 * the numbers, and a sequential ramp on unordered data implies a rank that does
 * not exist.
 *
 * A consumer states the JOB and the colours follow:
 *   <div data-chart-palette="sequential"> … </div>
 */
export const ChartPalettes: Story = {
  render: function ChartPalettesStory() {
    const ORDER: BrandKey[] = ['db', 'nb', 'dc', 'ec', 'ph', 'rm', 'aiden'];
    const KINDS: { key: string; attr?: string; title: string; blurb: string; n: number }[] = [
      { key: 'cat', title: 'Categorical', n: 6,
        blurb: 'Unordered series — “which one is this”. Brand primary, deep and accent, then the brand-tinted neutrals. Every adjacent pair holds ΔE 15 so no two series can be mistaken for each other.' },
      { key: 'seq', attr: 'sequential', title: 'Sequential', n: 7,
        blurb: 'Magnitude — “how much”. One hue, seven even steps. The pale end is meant to recede into the card; the legibility budget is spent at the deep end.' },
      { key: 'div', attr: 'diverging', title: 'Diverging', n: 7,
        blurb: 'Signed data — “which side of the baseline”. The HIGH arm is the brand’s own primary hue; the low arm is its opposite, chosen by colour-blind separation rather than by a naive 180°. The midpoint is the brand-tinted neutral.' },
    ];

    const swatchRow = (n: number) => (
      <div style={{ display: 'flex', gap: 2, borderRadius: 'var(--rounded-md)', overflow: 'hidden' }}>
        {Array.from({ length: n }, (_, i) => (
          <div key={i} style={{ background: `var(--chart-${i + 1})`, height: 34, flex: 1 }} />
        ))}
      </div>
    );

    return (
      <>
        <PocStyle />
        <div style={{ display: 'grid', gap: 'var(--p-8)', maxWidth: 1180 }}>
          <div style={{ display: 'grid', gap: 'var(--p-2)', maxWidth: 820 }}>
            <h2 style={H2}>Three palettes, picked by intent</h2>
            <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
              The consumer names the job, not the colours — <code style={MONO}>data-chart-palette</code>{' '}
              re-points <code style={MONO}>--chart-1..N</code> at a different family, so the chart
              component is unchanged and a chart nested in a brand scope still picks up that brand.
            </p>
          </div>

          {KINDS.map((kind) => (
            <div key={kind.key} style={{ display: 'grid', gap: 'var(--p-3)' }}>
              <div style={{ display: 'grid', gap: 4, maxWidth: 820 }}>
                <h3 style={{ ...H2, fontSize: 'var(--text-base)', margin: 0 }}>
                  {kind.title}{' '}
                  <span style={{ ...MONO, fontWeight: 'var(--font-normal)', color: 'var(--muted-foreground)' }}>
                    {kind.attr ? `data-chart-palette="${kind.attr}"` : '(default)'}
                  </span>
                </h3>
                <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>{kind.blurb}</p>
              </div>
              {(['dark', 'light'] as Mode[]).map((m) => (
                <div
                  key={m}
                  style={{
                    background: m === 'dark' ? '#0f172a' : '#f1f5f9',
                    border: `1px solid ${m === 'dark' ? '#334155' : '#e2e8f0'}`,
                    borderRadius: 'var(--rounded-xl)', padding: 'var(--p-4)',
                    display: 'grid', gap: 'var(--p-2)',
                  }}
                >
                  <span style={{ ...MONO, color: m === 'dark' ? '#f8fafc' : '#0f172a', opacity: 0.55 }}>{m}</span>
                  <div style={{ display: 'grid', gridTemplateColumns: '68px 1fr', gap: 'var(--p-2)', alignItems: 'center' }}>
                    {ORDER.map((b) => (
                      <Fragment key={b}>
                        <span style={{ ...MONO, color: m === 'dark' ? '#f8fafc' : '#0f172a', opacity: 0.7 }}>{b}</span>
                        <Scope brand={b} mode={m}>
                          <div {...(kind.attr ? { 'data-chart-palette': kind.attr } : {})}>{swatchRow(kind.n)}</div>
                        </Scope>
                      </Fragment>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}

          <div style={{ display: 'grid', gap: 'var(--p-2)', maxWidth: 820 }}>
            <h3 style={{ ...H2, fontSize: 'var(--text-base)', margin: 0 }}>How the diverging arms were chosen</h3>
            <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
              The high arm is the brand&rsquo;s own primary hue. The low arm is <em>not</em> its naive
              180° complement — that works for four brands and fails two, because dc&rsquo;s true
              opposite is teal-vs-red and rm&rsquo;s is magenta-vs-green, which are red–green axes and
              collapse under a colour-blind anomaly (CVD ΔE 5.1 and 3.8). So the opposing arm is
              searched across 100–260° for the hue that <strong>maximises colour-blind separation</strong>{' '}
              while clearing every semantic by 10.
              {'\n\n'}
              This replaced a red/green build, which was the textbook deuteranopia trap: its arms
              measured CVD ΔE 5.9–8.5, meaning the scale collapsed for red–green anomalous readers and
              the <strong>sign</strong> — the one thing a diverging ramp exists to carry — was lost. The
              brand-anchored arms measure 8.1–27.7. <strong>rm is the weakest at 8.1</strong> and the one
              to watch: its primary is magenta, so every opposition available leans green-ish once{' '}
              <code style={MONO}>--success</code> is cleared.
            </p>
          </div>
        </div>
      </>
    );
  },
};

/**
 * THREE REAL CHARTS — one per palette, built the way a consumer would build
 * them: the shipped BarChart / LineChart, every relevant prop, every slot in
 * the palette used, and a title that states the FINDING rather than the topic.
 *
 * This is the acceptance test the swatch rows cannot be. A palette that reads
 * well as seven rectangles can still fail the moment it carries real marks at
 * real sizes against a real grid.
 */
export const ChartsInUse: Story = {
  render: function ChartsInUseStory() {
    const mode = useGlobalMode();
    const [brand, setBrand] = useState<BrandKey>('db');

    const money = (v: number) => `$${v}M`;
    const delta = (v: number) => `${v > 0 ? '+' : ''}${v}%`;

    const frame = (children: ReactNode, label: string, attr?: string) => (
      <div style={{ display: 'grid', gap: 'var(--p-2)' }}>
        <span style={{ ...MONO, color: 'var(--muted-foreground)' }}>{label}</span>
        <Scope brand={brand} mode={mode}>
          <div
            {...(attr ? { 'data-chart-palette': attr } : {})}
            style={{
              background: 'var(--card)', border: 'var(--border-w-100) solid var(--border)',
              borderRadius: 'var(--rounded-xl)', padding: 'var(--p-5)',
            }}
          >
            {children}
          </div>
        </Scope>
      </div>
    );

    return (
      <>
        <PocStyle />
        <div style={{ display: 'grid', gap: 'var(--p-8)', maxWidth: 900 }}>
          <div style={{ display: 'grid', gap: 'var(--p-3)' }}>
            <h2 style={H2}>The palettes carrying real data</h2>
            <div style={{ display: 'flex', gap: 'var(--p-2)', flexWrap: 'wrap' }}>
              {BRAND_KEYS.filter((b) => b !== 'aiden').map((b) => (
                <Chip key={b} id={`ciu-${b}`} label={b} active={b === brand} onClick={() => setBrand(b)} />
              ))}
            </div>
          </div>

          {/* ── CATEGORICAL — six unordered series, trend over time ── */}
          {frame(
            <BarChart
              id="ciu-cat"
              layout="grouped"
              title="Direct overtook paid search in Q3"
              description="Quarterly signups by acquisition channel — all six slots painting at once. Paid search fell every quarter while direct compounded; hover any series to lift it out of the set."
              categories={['Q1', 'Q2', 'Q3', 'Q4']}
              valueFormatter={(v) => `${v}k`}
              height={260}
              showLegend
              showGrid
              /* GROUPED BARS, not lines. Six categorical series is at the limit
                 of what ANY palette can separate — the best all-pairs minimum
                 available here is 7.9 dE, against the 15 two colours need to be
                 unmistakable. Lines make that worse by CROSSING, so the pair a
                 reader must separate is exactly where they overlap. Bars sit
                 side by side and never occlude, so position carries what colour
                 alone cannot. This is the honest way to show six at once.

                 NO `emphasis` HERE, deliberately. It is the right tool for a
                 real dashboard — it is also why this chart showed THREE colours
                 for six series, because emphasis resolves every de-emphasised
                 series to a single --chart-muted grey. That is correct focus
                 behaviour and wrong for the one chart whose job is to show the
                 categorical palette. Hover still lifts a single series. */
              emphasisOnHover
              series={[
                /* SLOT ORDER IS RENDER ORDER, and that is load-bearing rather
                   than tidy. A categorical palette is authored so that
                   CONSECUTIVE slots alternate light and dark — that alternation
                   is what separates two bars standing shoulder to shoulder, and
                   it is the first thing the eye uses before it gets to hue.
                   Re-slotting a series to solve some other problem scrambles
                   the alternation and puts two neighbouring bars on adjacent
                   rungs of the same family.
                   This chart previously ran 1,3,2,4,5,6 — the two leading
                   series were pulled onto slots 1 and 3 so the pair the story is
                   ABOUT would differ in hue at the crossover. That reasoning
                   holds for LINES, which cross; for grouped bars, which never
                   overlap, it bought nothing and cost the alternation. */
                { key: 'direct', label: 'Direct', slot: 1, data: [19, 24, 33, 41] },
                { key: 'paid', label: 'Paid search', slot: 2, data: [38, 37, 29, 24] },
                { key: 'referral', label: 'Referral', slot: 3, data: [13, 16, 21, 26] },
                { key: 'social', label: 'Social', slot: 4, data: [9, 12, 13, 14] },
                { key: 'email', label: 'Email', slot: 5, data: [7, 8, 10, 11] },
                { key: 'partner', label: 'Partner', slot: 6, data: [4, 6, 7, 9] },
              ]}
            />,
            'categorical — the default, no attribute',
          )}

          {/* ── LINES — three series, and two channels besides colour ── */}
          {frame(
            <LineChart
              id="ciu-line"
              title="Direct passed paid search in 2023"
              description="Three channels, six years. Each line names itself at its own end and carries its own marker shape, so colour is one cue of three rather than the only one."
              categories={['2020', '2021', '2022', '2023', '2024', '2025']}
              valueFormatter={(v) => `${v}k`}
              curve="monotone"
              height={280}
              showGrid
              showMarkers
              /* endLabels REPLACES the legend — see Chart.types. A legend asks
                 the reader to hold a colour in memory, cross the chart and
                 match it, which is exactly the step that fails when two
                 colours are close and the step a crossing makes hardest. */
              endLabels
              /* THREE, because a line needs 4.5:1 and not the 3:1 a bar can
                 live at. At 3:1 ec's family fits four; the owner rejected that
                 set on sight, and both colours they named were the two riding
                 the floor (3.12 and 4.00). Dark is the binding mode — its
                 readable band is L 0.68-0.97 against light's 0.15-0.56, so
                 light would fit six at any of these floors and dark fits three.
                 A fourth series folds to --chart-muted on purpose. */
              series={[
                { key: 'direct', label: 'Direct', slot: 1, data: [22, 27, 34, 46, 58, 71] },
                { key: 'paid', label: 'Paid search', slot: 2, data: [52, 50, 47, 44, 41, 38] },
                { key: 'email', label: 'Email', slot: 3, data: [30, 31, 32, 33, 34, 35] },
              ]}
            />,
            'line — data-chart-palette="line" (every brand)',
            'line',
          )}

          {/* ── SEQUENTIAL — ordered bands, share of a whole ── */}
          {frame(
            <BarChart
              id="ciu-seq"
              title="Revenue rises with every year an account stays"
              description="Recurring revenue by account tenure. Accounts older than a year carry $37.3M of the $54.2M total — the colour ramp is the value, so the trend reads before any number does."
              categories={['0–3m', '3–6m', '6–12m', '1–2y', '2–3y', '3y+']}
              valueFormatter={money}
              colorScale="sequential"
              scaleSteps={7}
              height={260}
              showGrid
              series={[
                { key: 'arr', label: 'Recurring revenue', data: [4.1, 5.6, 7.2, 9.8, 12.4, 15.1] },
              ]}
            />,
            'sequential — one series, coloured by value',
            'sequential',
          )}

          {/* ── DIVERGING — signed variance against target ── */}
          {frame(
            <BarChart
              id="ciu-div"
              title="Four of six regions missed target this quarter"
              description="Variance against quarterly revenue target. Bars below the line are shortfalls; the two on the right carried the quarter."
              categories={['LATAM', 'EMEA', 'APAC', 'UK', 'US-East', 'US-West']}
              valueFormatter={delta}
              yDomain={[-24, 24]}
              colorScale="diverging"
              scaleCenter={0}
              scaleSteps={7}
              height={260}
              showGrid
              view="both"
              series={[
                { key: 'variance', label: 'Variance vs target', data: [-21, -14, -8, -2, 11, 19] },
              ]}
            />,
            'diverging — one series, each bar coloured by its own value',
            'diverging',
          )}
        </div>
      </>
    );
  },
};
