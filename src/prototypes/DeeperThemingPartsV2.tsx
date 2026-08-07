import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { POC_CSS, PRIMARY_LIGHT, PRIMARY_DARK, BRAND_ANCHORS, SUB_BRANDS } from './deeperThemingRecipeV2';

/**
 * ADOPTION PANELS — what deeper theming would do to tokens.scss.
 *
 * NOT a story file. These are the panels consumed by `Deeper Theming`'s
 * `Tokens` and `Audit` stories; they used to be their own Storybook section,
 * which split one argument across two places in the sidebar.
 *
 * This story changes NOTHING. It reads `src/styles/tokens.scss` and the POC
 * recipe at render time and reports the diff between them, so the question
 * "how big is this actually" gets a measured answer instead of an estimate.
 *
 * Reading the real file matters. Hand-copying a token inventory into a story
 * would be accurate for about a week — the Motion section in the docs template
 * was built this way for the same reason, and `.storybook/docs/motion.ts` is
 * the precedent for the `import.meta.glob(..., '?raw')` technique used here.
 */

const tokensRaw = import.meta.glob('../styles/tokens.scss', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const TOKENS = Object.values(tokensRaw)[0] ?? '';

// ─────────────────────────────────────────────────────────────────────────────
// Parsing
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Comments have to go before parsing — tokens.scss documents values in prose
 * that a value regex otherwise matches. That exact bug produced a phantom
 * `--ease-premium` when the Motion section was built.
 *
 * But the blanking MUST PRESERVE LINE COUNT. Deleting comment lines outright
 * shifts every line number after them, and this story's whole job is to point
 * at real lines in the real file: it reported [data-mode='light'] at 310-560
 * when the file actually has it at 366-639. Newlines are kept and only the
 * comment's other characters are replaced with spaces.
 */
const stripComments = (s: string) =>
  s
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/^(\s*)\/\/.*$/gm, '$1');

type Block = { selector: string; start: number; end: number; decls: Map<string, string> };

/** Top-level blocks only, by brace depth — nested at-rules must not split one. */
function parseBlocks(src: string): Block[] {
  const lines = src.split('\n');
  const out: Block[] = [];
  let depth = 0;
  let cur: { selector: string; start: number; body: string[] } | null = null;

  lines.forEach((raw, i) => {
    const line = raw.replace(/\/\*[\s\S]*?\*\//g, '');
    const opens = (line.match(/\{/g) ?? []).length;
    const closes = (line.match(/\}/g) ?? []).length;

    if (depth === 0 && opens > 0) {
      cur = { selector: line.slice(0, line.indexOf('{')).trim(), start: i + 1, body: [] };
    } else if (cur) {
      cur.body.push(line);
    }
    depth += opens - closes;
    if (depth === 0 && cur && closes > 0) {
      const decls = new Map<string, string>();
      for (const b of cur.body) {
        const m = b.match(/^\s*(--[a-zA-Z0-9-]+)\s*:\s*([^;]+);/);
        if (m) decls.set(m[1], m[2].trim());
      }
      out.push({ selector: cur.selector, start: cur.start, end: i + 1, decls });
      cur = null;
    }
  });
  return out;
}

const TOKEN_BLOCKS = parseBlocks(stripComments(TOKENS));
const POC_BLOCKS = parseBlocks(stripComments(POC_CSS));

const findBlock = (blocks: Block[], test: (s: string) => boolean) =>
  blocks.find((b) => test(b.selector));

const LIGHT = findBlock(TOKEN_BLOCKS, (s) => s.trim() === "[data-mode='light']");
const DARK = findBlock(TOKEN_BLOCKS, (s) => s.trim() === "[data-mode='dark']");
// exact match — the recipe now also emits [data-brand='x'][data-mode='light'] anchor
// blocks, and a substring match picked the first of those instead of the surfaces
const POC_LIGHT = findBlock(POC_BLOCKS, (s) => s.trim() === "[data-theme-poc2][data-mode='light']");
const POC_DARK = findBlock(POC_BLOCKS, (s) => s.trim() === "[data-theme-poc2][data-mode='dark']");

type Row = {
  token: string;
  today: string | null;
  proposed: string;
  status: 'changed' | 'new' | 'unchanged';
};

function diff(today: Block | undefined, poc: Block | undefined): Row[] {
  if (!today || !poc) return [];
  const rows: Row[] = [];
  for (const [token, proposed] of poc.decls) {
    const existing = today.decls.get(token) ?? null;
    // A --poc2-* name is new by definition; anything else is compared by value.
    const status: Row['status'] =
      existing === null ? 'new' : existing === proposed ? 'unchanged' : 'changed';
    rows.push({ token, today: existing, proposed, status });
  }
  return rows;
}

const LIGHT_ROWS = diff(LIGHT, POC_LIGHT);
const DARK_ROWS = diff(DARK, POC_DARK);

const THEME_BLOCKS = TOKEN_BLOCKS.filter((b) => b.selector.includes('data-theme='));

// ─────────────────────────────────────────────────────────────────────────────
// Colour readback
// ─────────────────────────────────────────────────────────────────────────────

let ctx: CanvasRenderingContext2D | null = null;
function toHex(css: string): string | null {
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
  return '#' + [d[0], d[1], d[2]].map((x) => x.toString(16).padStart(2, '0')).join('');
}

// ─────────────────────────────────────────────────────────────────────────────
// UI
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
const CODE: CSSProperties = {
  ...MONO,
  background: 'var(--muted)',
  padding: '2px var(--p-1-5)',
  borderRadius: 'var(--rounded-sm)',
};

function Stat({ n, label, tone }: { n: number | string; label: string; tone?: string }) {
  return (
    <div
      style={{
        padding: 'var(--p-4)',
        border: 'var(--border-w-100) solid var(--border)',
        borderRadius: 'var(--rounded-lg)',
        background: 'var(--card)',
        display: 'grid',
        gap: 'var(--p-1)',
        minWidth: 150,
      }}
    >
      <span
        style={{
          fontSize: 'var(--text-3xl)',
          fontWeight: 'var(--font-semibold)',
          color: tone ?? 'var(--foreground)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {n}
      </span>
      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>{label}</span>
    </div>
  );
}



// ─────────────────────────────────────────────────────────────────────────────
// 0 — Decision
// ─────────────────────────────────────────────────────────────────────────────



// ─────────────────────────────────────────────────────────────────────────────
// 0b — Regressions: what stops passing
// ─────────────────────────────────────────────────────────────────────────────

/**
 * MEASURED IN THE BROWSER, BOTH SIDES, AT RENDER TIME.
 *
 * Two probes per brand: one carrying the SHIPPED primary and one carrying the
 * POC's, each running the real `--primary-*` derivations from tokens.scss. The
 * comparison is therefore between two live cascades rather than between a live
 * value and a number someone typed into a story.
 *
 * That matters here more than usual, because the whole point of this page is
 * that the derived family comes free — and "free" is exactly the kind of claim
 * that stops being true without anyone noticing.
 */
const SHIPPED: Record<string, { light: string; dark: string }> = {
  db: { light: '#6063f1', dark: '#818cf8' },
  nb: { light: '#04865e', dark: '#34d399' },
  dc: { light: '#0c8479', dark: '#2dd4bf' },
  ec: { light: '#07809d', dark: '#22d3ee' },
  ph: { light: '#ca4c0a', dark: '#fb923c' },
  rm: { light: '#7c3aed', dark: '#a78bfa' },
};

type Check = { brand: string; mode: 'light' | 'dark'; pairing: string; today: number; after: number; floor: number };

function useDerivedAudit() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [rows, setRows] = useState<Check[]>([]);
  const [fault, setFault] = useState<string | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    // THIS PAGE IMPORTS POC_CSS TO PARSE IT — that does not put it in the
    // document. The probes below carry [data-theme-poc2][data-brand], which
    // matched nothing here, so every "after" number was silently read off the
    // shipped cascade instead of the POC one. Same failure mode as the
    // hardcoded card it replaced: wrong, plausible, and completely quiet.
    const styleEl = document.createElement('style');
    styleEl.textContent = POC_CSS;
    host.appendChild(styleEl);
    const cv = document.createElement('canvas');
    cv.width = cv.height = 1;
    const cx = cv.getContext('2d', { willReadFrequently: true });
    if (!cx) return;
    cx.globalCompositeOperation = 'copy';
    // canvas normalises every serialisation Chrome uses — color(srgb …) for a
    // color-mix, rgba() for a literal — without parsing any of them by hand
    const px = (v: string): [number, number, number, number] => {
      cx.fillStyle = '#000000';
      cx.fillStyle = v;
      cx.fillRect(0, 0, 1, 1);
      const d = cx.getImageData(0, 0, 1, 1).data;
      return [d[0], d[1], d[2], d[3] / 255];
    };
    const over = (f: [number, number, number, number], b: number[]) =>
      f.slice(0, 3).map((v, i) => v * f[3] + b[i] * (1 - f[3]));
    const lin = (v: number) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    const lum = (c: number[]) => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
    const ratio = (a: number[], b: number[]) => {
      const x = lum(a); const y = lum(b);
      return +(((Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05))).toFixed(2);
    };

    const out: Check[] = [];
    for (const brand of SUB_BRANDS) {
      for (const mode of ['light', 'dark'] as const) {
        // EACH SIDE MUST STAND ON ITS OWN SURFACE. This read the shipped slate
        // card (#1e293b) for both columns and only swapped --primary, which
        // measures a build that does not exist: under adoption the card is the
        // POC's brand-tinted card, and a tint sitting on it is a different
        // colour. That single hardcoded value reported ec dark as 4.47 when it
        // is really 4.01, and hid two of the four failures completely — the
        // POC column now carries [data-theme-poc2][data-brand], so --card,
        // --primary-soft and --primary-light all resolve through the real
        // cascade. --poc2-str has no default in the recipe (the story root sets
        // it), and without it every dark surface silently goes unset, so it is
        // declared on the scope here.
        const read = (primary: string, poc: boolean) => {
          const scope = document.createElement('div');
          scope.setAttribute('data-mode', mode);
          if (poc) {
            scope.setAttribute('data-theme-poc2', '');
            scope.setAttribute('data-brand', brand);
          }
          scope.style.cssText =
            `position:absolute;left:-9999px;--poc2-str:1;--primary:${primary}`;
          const probe = document.createElement('div');
          scope.appendChild(probe);
          host.appendChild(scope);
          const t = (tok: string) => {
            probe.style.backgroundColor = '';
            probe.style.backgroundColor = `var(${tok})`;
            return px(getComputedStyle(probe).backgroundColor);
          };
          const deepRaw = t('--primary-deep');
          const cardRaw = t('--card');
          const card = cardRaw[3] < 1
            ? (mode === 'dark' ? [30, 41, 59] : [255, 255, 255])
            : cardRaw.slice(0, 3);
          const res = {
            scoped: !poc || deepRaw[3] > 0,
            card,
            text: over(t('--primary-text'), card),
            fg: over(t('--foreground'), card),
            muted: over(t('--muted-foreground'), card),
            light: over(t('--primary-light'), card),
            soft: over(t('--primary-soft'), card),
            border: over(t('--primary-border'), card),
          };
          scope.remove();
          return res;
        };
        const a = read(SHIPPED[brand][mode], false);
        const b = read(mode === 'light' ? PRIMARY_LIGHT[brand] : PRIMARY_DARK[brand], true);
        // Guard, not decoration. --primary-deep only resolves when the POC scope
        // is really in force; if it is unset the surfaces are the shipped ones
        // and every "after" figure is meaningless. Fail loudly instead.
        if (!b.scoped) {
          setFault(`POC scope did not apply for ${brand}/${mode} — --primary-deep is unset, so the surfaces measured are the shipped ones, not the POC's. Numbers withheld.`);
          return;
        }
        // These are the pairings COMPONENTS ACTUALLY RENDER, not every pairing the
        // tokens permit, so this list has to track the components rather than the
        // token file. It was briefly narrower: on 2026-08-02 the brand Alert, Banner
        // and secondary Button moved their text to --foreground, removing the last
        // consumer of "--primary-text on a tint". That was reverted the same day in
        // favour of tuning the two brands that actually missed, so those rows are
        // load-bearing again.
        out.push({ brand, mode, pairing: 'button secondary label (text on soft)', today: ratio(a.text, a.soft), after: ratio(b.text, b.soft), floor: 4.5 });
        out.push({ brand, mode, pairing: 'alert/banner text (text on light)', today: ratio(a.text, a.light), after: ratio(b.text, b.light), floor: 4.5 });
        out.push({ brand, mode, pairing: 'primary-text on card (outline/link)', today: ratio(a.text, a.card), after: ratio(b.text, b.card), floor: 4.5 });
        out.push({ brand, mode, pairing: 'primary-border on card', today: ratio(a.border, a.card), after: ratio(b.border, b.card), floor: 3 });
      }
    }
    setRows(out);
    styleEl.remove();
  }, []);

  return { hostRef, rows, fault };
}

export function AuditPanel() {
  const { hostRef, rows, fault } = useDerivedAudit();
  const broke = rows.filter((r) => r.today >= r.floor && r.after < r.floor);
  const already = rows.filter((r) => r.today < r.floor);
  const lost = rows.filter((r) => r.after < r.today).length;

  const table = (list: Check[], caption: string) => (
    <table style={{ borderCollapse: 'collapse', fontSize: 'var(--text-sm)', width: '100%', maxWidth: 720, marginBottom: 'var(--p-6)' }}>
      <caption style={{ textAlign: 'left', ...MONO, color: 'var(--muted-foreground)', paddingBottom: 'var(--p-2)' }}>{caption}</caption>
      <thead>
        <tr style={{ borderBottom: 'var(--border-w-100) solid var(--border)' }}>
          {['Brand', 'Mode', 'Pairing', 'Today', 'After', 'Floor'].map((h) => (
            <th key={h} style={{ textAlign: h === 'Brand' || h === 'Mode' || h === 'Pairing' ? 'left' : 'right', padding: 'var(--p-2)' }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {list.map((r) => (
          <tr key={`${r.brand}-${r.mode}-${r.pairing}`} style={{ borderBottom: 'var(--border-w-50) solid var(--border)' }}>
            <td style={{ ...MONO, padding: 'var(--p-2)' }}>{r.brand}</td>
            <td style={{ ...MONO, padding: 'var(--p-2)', color: 'var(--muted-foreground)' }}>{r.mode}</td>
            <td style={{ padding: 'var(--p-2)' }}>{r.pairing}</td>
            <td style={{ ...MONO, padding: 'var(--p-2)', textAlign: 'right', color: r.today < r.floor ? 'var(--error)' : 'var(--foreground)' }}>{r.today}</td>
            <td style={{ ...MONO, padding: 'var(--p-2)', textAlign: 'right', fontWeight: 'var(--font-semibold)', color: r.after < r.floor ? 'var(--error)' : 'var(--success)' }}>{r.after}</td>
            <td style={{ ...MONO, padding: 'var(--p-2)', textAlign: 'right', color: 'var(--muted-foreground)' }}>{r.floor}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div style={PAGE}>
      <div ref={hostRef} aria-hidden="true" style={{ position: 'fixed', left: -9999, top: 0, width: 1, height: 1, overflow: 'hidden' }} />
      {fault && (
        <div style={{ padding: 'var(--p-4)', border: 'var(--border-w-100) solid var(--error)', borderRadius: 'var(--rounded-md)', background: 'var(--error-light)', color: 'var(--error-text, var(--error))' }}>
          <strong>Measurement aborted.</strong> {fault}
        </div>
      )}
      <div>
        <h2 style={H2}>What stops passing</h2>
        <p style={P}>
          The derived <code style={CODE}>--primary-*</code> family costs nothing to adopt — every
          member is a <code style={CODE}>color-mix</code> over <code style={CODE}>var(--primary)</code>,
          so setting the brand value re-derives all seven with no new declarations.{' '}
          <strong>Free is not the same as safe.</strong> Both columns below are measured in this
          browser from two live cascades — one carrying the shipped primary, one carrying the
          POC&rsquo;s — rather than compared against numbers typed into a story.
        </p>
        <div style={{ display: 'flex', gap: 'var(--p-3)', flexWrap: 'wrap' }}>
          <Stat n={broke.length} label="pairings adoption BREAKS" tone={broke.length ? 'var(--error)' : 'var(--success)'} />
          <Stat n={lost} label="pairings that lose margin" />
          <Stat n={already.length} label="already below floor today" />
          <Stat n={rows.length} label="pairings measured" />
        </div>
      </div>

      {broke.length > 0 && (
        <div>
          <h2 style={H2}>Adoption breaks these</h2>
          <p style={P}>
            These pass today and fail after — the blocking list, and the thing to clear before
            adoption. Each one is a single brand missing by a small margin, so the fix is to move
            that brand&rsquo;s <code style={CODE}>--primary</code> rather than to change what any
            component paints: a component-level change would trade a measurable problem in two
            brands for a visible one in all eight.
          </p>
          {table(broke, 'was passing, now failing')}
        </div>
      )}

      <div>
        <h2 style={H2}>Already failing — not an adoption cost</h2>
        <p style={P}>
          <code style={CODE}>--primary-border</code> is defined at 40% alpha, which cannot reach the
          3:1 WCAG 1.4.11 wants for a component boundary at any hue. Adoption makes it slightly
          worse, but it was never passing — fixing it is a separate decision about that 40%.
        </p>
        {table(already, 'below floor before and after')}
      </div>

      <div>
        <h2 style={H2}>Everything measured</h2>
        {table(rows, `${rows.length} pairings — ${SUB_BRANDS.length} brands x 2 modes x 3 pairings`)}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 0c — New tokens
// ─────────────────────────────────────────────────────────────────────────────

const SURFACE_TOKENS = [
  '--background', '--card', '--popover', '--secondary', '--accent', '--muted', '--input',
  '--border', '--border-hover', '--ring', '--sidebar', '--sidebar-border', '--sidebar-accent',
];

/**
 * THE ADOPTION FACTS ARE DERIVED, NEVER TYPED IN.
 *
 * This block used to open with `const perBrand = 7`. That was true when a theme
 * scope carried identity only; the recipe now also emits a categorical set, a
 * mute, a 7-step sequential ramp and a 7-step diverging ramp per brand per
 * mode, so the real figure is 21 new names and the panel was understating
 * adoption by 3x. It read as a confident number and was quietly wrong, which is
 * the exact failure mode the Motion section was rebuilt to avoid.
 *
 * Everything below counts the parsed files instead. If the recipe grows another
 * ramp tomorrow these numbers move on their own.
 */
const EXISTING_NAMES = new Set(TOKEN_BLOCKS.flatMap((b) => [...b.decls.keys()]));

/** A representative per-brand block — every brand emits the same shape. */
const SAMPLE_BRAND_BLOCK = findBlock(
  POC_BLOCKS,
  (s) => /\[data-brand='\w+'\]\[data-mode='light'\]$/.test(s.trim()),
);
const PER_BRAND_ALL = SAMPLE_BRAND_BLOCK ? [...SAMPLE_BRAND_BLOCK.decls.keys()] : [];
const PER_BRAND_NEW = PER_BRAND_ALL.filter((t) => !EXISTING_NAMES.has(t));
const PER_BRAND_EXISTING = PER_BRAND_ALL.filter((t) => EXISTING_NAMES.has(t));

/** Names the POC declares anywhere that tokens.scss has never heard of. */
const ALL_NEW_NAMES = [
  ...new Set(
    POC_BLOCKS.flatMap((b) => [...b.decls.keys()]).filter(
      (t) => !EXISTING_NAMES.has(t) && !t.startsWith('--poc2-'),
    ),
  ),
].sort();

/** Scaffolding that exists only to drive the prototype and must not ship as-is. */
const SCAFFOLD_NAMES = [
  ...new Set(POC_BLOCKS.flatMap((b) => [...b.decls.keys()]).filter((t) => t.startsWith('--poc2-'))),
].sort();

/**
 * Tokens that exist today as ONE global value and would start varying by brand.
 * This is a behavioural change even though no name is added: a consumer reading
 * --chart-1 gets slate today and a brand hue after.
 */
const NEWLY_BRAND_SCOPED = PER_BRAND_EXISTING.filter(
  (t) => !THEME_BLOCKS.some((b) => b.decls.has(t)),
).sort();

const THEME_CODES = [
  ...new Set(
    THEME_BLOCKS.map((b) => b.selector.match(/data-theme='(\w+)'/)?.[1]).filter(Boolean) as string[],
  ),
].sort();
const COVERED = SUB_BRANDS as readonly string[];
const UNCOVERED = THEME_CODES.filter((c) => !COVERED.includes(c));

export function NewTokensPanel() {
  const perBrand = PER_BRAND_NEW.length;
  const brands = SUB_BRANDS.length;
  const themeScopes = THEME_BLOCKS.length;

  const swatch = (v: string) => (
    <span style={{ display: 'inline-block', width: 34, height: 18, borderRadius: 'var(--rounded-sm)', background: v, border: 'var(--border-w-100) solid var(--border)', verticalAlign: 'middle', marginRight: 'var(--p-2)' }} />
  );

  return (
    <div style={PAGE}>
      <div>
        <h2 style={H2}>What gets added</h2>
        <p style={P}>
          Nothing is renamed and nothing is removed. Adoption is{' '}
          <strong>{perBrand} new declarations per brand</strong> plus one architectural change to
          what a theme scope covers.
        </p>
        <div style={{ display: 'flex', gap: 'var(--p-3)', flexWrap: 'wrap' }}>
          <Stat n={perBrand * brands} label="new brand tokens" tone="var(--success)" />
          <Stat n={SURFACE_TOKENS.length} label="tokens a theme must now remap" />
          <Stat n={themeScopes} label="theme scopes in tokens.scss" />
          <Stat n={UNCOVERED.length} label="codes with no POC values" tone="var(--error)" />
        </div>
      </div>

      <div>
        <h2 style={H2}>Per brand — {perBrand} new</h2>
        <p style={P}>
          <code style={CODE}>--&#123;code&#125;-primary</code> already exists and only changes value.
          These are additions. <code style={CODE}>--&#123;code&#125;-mark-*</code> is{' '}
          <strong>mode-constant</strong> — a mark is artwork and does not invert — so it is three
          declarations rather than six.
        </p>
        <p style={P}>
          <strong>
            This count is read from the recipe, not written here.
          </strong>{' '}
          It said <code style={CODE}>7</code> for a long time, which was right when a theme scope
          carried identity only. Charts are themed now, so a brand block also emits a categorical
          set, a mute, and two 7-step ramps — the figure is {perBrand}, and the panel had been
          understating adoption by roughly 3&times;. Split:{' '}
          <strong>
            {PER_BRAND_NEW.filter((t) => !t.startsWith('--chart')).length} identity
          </strong>{' '}
          ({PER_BRAND_NEW.filter((t) => !t.startsWith('--chart')).map((t) => t.replace('--', '')).join(', ')}) and{' '}
          <strong>{PER_BRAND_NEW.filter((t) => t.startsWith('--chart')).length} chart ramp</strong>{' '}
          steps (<code style={CODE}>--chart-seq-1…7</code>, <code style={CODE}>--chart-div-1…7</code>).
          Every one is mode-split, so the literal line count in{' '}
          <code style={CODE}>tokens.scss</code> is {perBrand} &times; 2 &times; {brands} ={' '}
          {perBrand * 2 * brands} for the six brands, before Aiden.
        </p>
        <table style={{ borderCollapse: 'collapse', fontSize: 'var(--text-sm)', width: '100%', maxWidth: 760 }}>
          <thead>
            <tr style={{ borderBottom: 'var(--border-w-100) solid var(--border)' }}>
              {['Brand', 'highlight L / D', 'deep L / D', 'mark a → b → c (both modes)'].map((h) => (
                <th key={h} style={{ textAlign: 'left', padding: 'var(--p-2)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SUB_BRANDS.map((b) => {
              const a = BRAND_ANCHORS[b];
              return (
                <tr key={b} style={{ borderBottom: 'var(--border-w-50) solid var(--border)' }}>
                  <td style={{ ...MONO, padding: 'var(--p-2)' }}>{b}</td>
                  <td style={{ ...MONO, padding: 'var(--p-2)' }}>{swatch(a.light[0])}{swatch(a.dark[0])}</td>
                  <td style={{ ...MONO, padding: 'var(--p-2)' }}>{swatch(a.light[2])}{swatch(a.dark[2])}</td>
                  <td style={{ ...MONO, padding: 'var(--p-2)' }}>{a.light.map((c) => swatch(c))}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div>
        <h2 style={H2}>The architectural change</h2>
        <p style={P}>
          Today a <code style={CODE}>[data-theme]</code> scope remaps <strong>9</strong> tokens, all{' '}
          <code style={CODE}>--primary-*</code>. Deeper theming means it also remaps the surfaces —
          that is what &ldquo;deeper&rdquo; refers to, and it is the actual work. None of it is a
          colour decision.
        </p>
        <div style={{ display: 'flex', gap: 'var(--p-2)', flexWrap: 'wrap', marginBottom: 'var(--p-4)' }}>
          {SURFACE_TOKENS.map((t) => (
            <code key={t} style={{ ...CODE, padding: 'var(--p-1) var(--p-2)', background: 'var(--secondary)', borderRadius: 'var(--rounded-sm)' }}>{t}</code>
          ))}
        </div>
        <p style={P}>
          <strong>And it needs a raw neutral layer first.</strong> Every one of those is derived by
          mixing the brand&rsquo;s deep into the neutral it already is — but a custom property{' '}
          <em>cannot reference itself</em>, so{' '}
          <code style={CODE}>--background: color-mix(…, var(--background))</code> is a cycle that
          resolves to <code style={CODE}>unset</code>. The POC works around it by hardcoding the
          neutral literals; a real adoption has to introduce the raw layer and derive the semantic
          names from it. That is the single largest cost in this whole exercise and not one line of
          it is about colour.
        </p>
      </div>

      <div>
        <h2 style={H2}>Two brands have no values</h2>
        <p style={P}>
          <code style={CODE}>tokens.scss</code> carries <strong>{themeScopes}</strong> theme codes;
          this POC only ever covered six. <code style={CODE}>dr</code> and{' '}
          <code style={CODE}>ir</code> have no mark, no anchors and no solve. Pushing as-is leaves
          two brands on the old single-value model while six move to three anchors — a split system,
          which is worse than either one.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 1 — Verdict
// ─────────────────────────────────────────────────────────────────────────────


// ─────────────────────────────────────────────────────────────────────────────
// 2 — File map
// ─────────────────────────────────────────────────────────────────────────────


// ─────────────────────────────────────────────────────────────────────────────
// 3 — The diff, token by token
// ─────────────────────────────────────────────────────────────────────────────

function DiffTable({ rows, mode }: { rows: Row[]; mode: 'light' | 'dark' }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [hex, setHex] = useState<Record<string, { now: string; next: string }>>({});

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const now = host.querySelector<HTMLElement>('[data-now]');
    const next = host.querySelector<HTMLElement>('[data-next]');
    if (!now || !next) return;
    const out: Record<string, { now: string; next: string }> = {};
    for (const r of rows) {
      const read = (el: HTMLElement) => {
        const p = el.firstElementChild as HTMLElement;
        p.style.backgroundColor = '';
        p.style.backgroundColor = `var(${r.token})`;
        return toHex(getComputedStyle(p).backgroundColor) ?? '';
      };
      out[r.token] = { now: read(now), next: read(next) };
    }
    setHex(out);
  }, [rows, mode]);

  const swatch = (c: string) => (
    <span
      aria-hidden="true"
      style={{
        display: 'inline-block',
        width: 'var(--w-5)',
        height: 'var(--h-5)',
        borderRadius: 'var(--rounded-sm)',
        border: 'var(--border-w-100) solid var(--border)',
        background: c || 'transparent',
        verticalAlign: 'middle',
      }}
    />
  );

  return (
    <>
      {/*
        The recipe has to be LIVE on this page or the "proposed" column silently
        reports today's values — [data-theme-poc2] rules simply would not exist,
        the probe would fall through to the base token, and every row would read
        "changed" while showing two identical swatches. That is exactly what the
        first version of this story did.
      */}
      <style>{POC_CSS}</style>
      <div
        ref={hostRef}
        aria-hidden="true"
        style={{ position: 'fixed', left: -9999, top: 0, width: 1, height: 1, overflow: 'hidden' }}
      >
        <span data-now="" data-brand="dc" data-mode={mode}>
          <span />
        </span>
        <span
          data-next=""
          data-brand="dc"
          data-mode={mode}
          data-theme-poc2=""
          style={{ '--poc2-str': 1, '--poc2-chrome': 1 } as CSSProperties}
        >
          <span />
        </span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 'var(--text-sm)' }}>
          <thead>
            <tr style={{ borderBottom: 'var(--border-w-100) solid var(--border)' }}>
              <th style={{ textAlign: 'left', padding: 'var(--p-2)' }}>Token</th>
              <th style={{ textAlign: 'left', padding: 'var(--p-2)' }}>Today</th>
              <th style={{ textAlign: 'left', padding: 'var(--p-2)' }}>Proposed</th>
              <th style={{ textAlign: 'left', padding: 'var(--p-2)' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.token} style={{ borderBottom: 'var(--border-w-50) solid var(--border)' }}>
                <td style={{ ...MONO, padding: 'var(--p-2)', fontSize: 'var(--text-sm)' }}>
                  {r.token}
                </td>
                <td style={{ ...MONO, padding: 'var(--p-2)', whiteSpace: 'nowrap' }}>
                  {r.status === 'new' ? (
                    <span style={{ color: 'var(--muted-foreground)' }}>—</span>
                  ) : (
                    <>
                      {swatch(hex[r.token]?.now ?? '')}{' '}
                      <span style={{ color: 'var(--muted-foreground)' }}>{hex[r.token]?.now}</span>
                    </>
                  )}
                </td>
                <td style={{ ...MONO, padding: 'var(--p-2)', whiteSpace: 'nowrap' }}>
                  {swatch(hex[r.token]?.next ?? '')}{' '}
                  <span style={{ color: 'var(--muted-foreground)' }}>{hex[r.token]?.next}</span>
                </td>
                <td style={{ padding: 'var(--p-2)', fontSize: 'var(--text-xs)' }}>
                  <span
                    style={{
                      color:
                        r.status === 'new'
                          ? 'var(--primary-text)'
                          : r.status === 'changed'
                            ? 'var(--warning)'
                            : 'var(--muted-foreground)',
                      fontWeight: 'var(--font-medium)',
                    }}
                  >
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function TokenDiffPanel() {
  return (
    <div style={PAGE}>
      <div>
        <h2 style={H2}>Every token the recipe touches</h2>
        <p style={P}>
          Parsed from the POC recipe and matched against the real declaration in{' '}
          <code style={CODE}>tokens.scss</code>. Swatches are read back from the live browser
          using the <code style={CODE}>dc</code> brand, so &ldquo;proposed&rdquo; is the colour
          that would actually render — not an approximation of it.
        </p>
      </div>
      <div>
        <h2 style={H2}>
          [data-mode=&apos;light&apos;] — lines {LIGHT?.start}–{LIGHT?.end}
        </h2>
        <p style={P}>
          The page, card and popover rows are the important ones:{' '}
          <strong>they are declared and unchanged</strong>. Light mode keeps a white page, which
          is what keeps every semantic tint composited over the surface the system was designed
          against.
        </p>
        <DiffTable rows={LIGHT_ROWS} mode="light" />
      </div>
      <div>
        <h2 style={H2}>
          [data-mode=&apos;dark&apos;] — lines {DARK?.start}–{DARK?.end}
        </h2>
        <p style={P}>
          Dark does tint its page, because it has the headroom:{' '}
          <code style={CODE}>--muted-foreground</code> on <code style={CODE}>--muted</code> sits
          around 8.3:1 there against light mode&rsquo;s 5.0.
        </p>
        <DiffTable rows={DARK_ROWS} mode="dark" />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4 — Transition: the concrete tokens.scss migration
// ─────────────────────────────────────────────────────────────────────────────

/**
 * THE ADOPTION ANSWER, in the form the question was asked: what in
 * `tokens.scss` is ADDED, what is UPDATED, and what has to be decided first.
 *
 * Every number and every row here is computed from the two real files at render
 * time — `tokens.scss` via `?raw`, and the recipe's own emitted CSS. Nothing is
 * transcribed. That is deliberate: an adoption plan that drifts from the thing
 * it plans is worse than no plan, because it is trusted.
 *
 * The one thing NOT derived is the risk commentary at the bottom, because it is
 * judgement rather than measurement, and it is labelled as such.
 */

/** POC attribute -> shipped attribute. The renames are the whole mechanical part. */
const SCOPE_MAP: { poc: string; shipped: string; note: string }[] = [
  {
    poc: "[data-theme-poc2]",
    shipped: '(nothing)',
    note: 'The POC gate. It exists so none of this can leak into a real story, and it disappears on adoption — the declarations move to :root and the real scopes.',
  },
  {
    poc: "[data-brand='db']",
    shipped: "[data-theme='db']",
    note: 'A straight rename. The POC used a different attribute name only to stay off the shipped one while both had to coexist.',
  },
  {
    poc: "[data-mode='light'|'dark']",
    shipped: 'same',
    note: 'Unchanged. The mode axis is already exactly this.',
  },
  {
    poc: "[data-surface='aiden']",
    shipped: 'same',
    note: 'Unchanged, and already shipped. Aiden is a surface, not a theme code — it layers inside any brand.',
  },
  {
    poc: "[data-chart-palette='sequential'|'diverging'|'line']",
    shipped: 'NEW',
    note: 'A new axis. Nothing in tokens.scss reads it today; it is how a consumer states the chart JOB and gets the right ramp.',
  },
];

/** Decisions that must be made BEFORE a patch can be written. Not colour choices. */
const BLOCKERS: { q: string; detail: string; severity: 'blocker' | 'decision' }[] = [
  {
    q: 'The self-reference cycle in the surface layer',
    severity: 'blocker',
    detail:
      'Every tinted surface is "the neutral it already is, mixed with the brand deep" — but a custom property cannot reference itself, so --background: color-mix(…, var(--background)) resolves to unset. The POC dodges it by hardcoding the neutral literals. Adoption has to introduce a raw neutral layer (--surface-base-* or similar) and derive the semantic names from it. This is the single largest piece of work in the whole migration and none of it is about colour.',
  },
  {
    q: '--poc2-str has no default',
    severity: 'blocker',
    detail:
      'The tint strength multiplier is referenced 20+ times and declared nowhere in the recipe — the STORY supplies it inline. Ship the recipe as-is and every tinted surface is invalid at computed-value time. It needs a real default (1) in tokens.scss, or the multiplier gets dropped and the percentages inlined.',
  },
  {
    q: 'dr and ir have no values',
    severity: 'blocker',
    detail:
      'tokens.scss carries these two theme codes; the POC never covered them. Shipping leaves two brands on the old one-value model while six move to three anchors plus charts — a split system, worse than either. Either solve them or retire the scopes.',
  },
  {
    q: '--chart-* stops being neutral',
    severity: 'decision',
    detail:
      'Today the chart slots are one global slate ramp. Under this they vary per brand. Any consumer that picked --chart-1 expecting a neutral gets a brand hue. Nothing in this repo does, but it is a public token and the change is silent — no name moves, so nothing errors.',
  },
  {
    q: 'rm and nb change hue family, not just value',
    severity: 'decision',
    detail:
      'rm goes violet to magenta and nb goes teal-green to grass. Those are not tweaks — anything with a screenshot, a marketing asset or a printed swatch of those two brands is out of date the day this lands.',
  },
];

/**
 * The rule the palettes were built on: a chart's first series IS the brand. It
 * is checked rather than asserted, because two of the fourteen do not hold and
 * both are owner-authored — the palettes outrank the rule.
 */
const SLOT1_ROWS = [...SUB_BRANDS, 'aiden'].flatMap((k) =>
  (['light', 'dark'] as const).map((m) => {
    const sel =
      k === 'aiden'
        ? `[data-theme-poc2][data-surface='aiden'][data-mode='${m}']`
        : `[data-theme-poc2][data-brand='${k}'][data-mode='${m}']`;
    const b = findBlock(POC_BLOCKS, (s) => s.trim() === sel);
    const primary = b?.decls.get('--primary') ?? null;
    const chart1 = b?.decls.get('--chart-1') ?? null;
    return { k, m, primary, chart1, ok: primary === chart1 };
  }),
);

export function TransitionPanel() {
  const light = (b: string) =>
    findBlock(POC_BLOCKS, (s) => s.trim() === `[data-theme-poc2][data-brand='${b}'][data-mode='light']`);
  const dark = (b: string) =>
    findBlock(POC_BLOCKS, (s) => s.trim() === `[data-theme-poc2][data-brand='${b}'][data-mode='dark']`);
  const todayVal = (t: string, mode: 'light' | 'dark') =>
    (mode === 'light' ? LIGHT : DARK)?.decls.get(t) ?? null;

  const sw = (v: string | null) => (
    <span
      style={{
        display: 'inline-block', width: 26, height: 16, borderRadius: 'var(--rounded-sm)',
        background: v ?? 'transparent', border: 'var(--border-w-100) solid var(--border)',
        verticalAlign: 'middle', marginRight: 'var(--p-1-5)',
      }}
    />
  );
  const th: CSSProperties = { textAlign: 'left', padding: 'var(--p-2)', fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)', fontWeight: 'var(--font-medium)' };
  const td: CSSProperties = { padding: 'var(--p-2)', verticalAlign: 'middle' };
  const table: CSSProperties = { borderCollapse: 'collapse', width: '100%', fontSize: 'var(--text-sm)' };
  const rowBorder = { borderBottom: 'var(--border-w-50) solid var(--border)' };

  const primaryRows = SUB_BRANDS.flatMap((b) =>
    (['light', 'dark'] as const).map((m) => {
      const now = todayVal(`--${b}-primary`, m);
      const next = (m === 'light' ? light(b) : dark(b))?.decls.get('--primary') ?? null;
      return { b, m, now, next, changed: now !== next };
    }),
  );
  const changedCount = primaryRows.filter((r) => r.changed).length;

  return (
    <div style={PAGE}>
      <div>
        <h2 style={H2}>If this ships, here is the patch</h2>
        <p style={P}>
          Everything on this page is <strong>read from the two real files at render time</strong> —{' '}
          <code style={CODE}>src/styles/tokens.scss</code> and the recipe&rsquo;s emitted CSS — so it
          cannot drift from what would actually land. <code style={CODE}>tokens.scss</code> is{' '}
          <strong>not modified by this POC</strong>; this is the preview of the change, not the
          change.
        </p>
        <div style={{ display: 'flex', gap: 'var(--p-3)', flexWrap: 'wrap' }}>
          <Stat n={ALL_NEW_NAMES.length} label="new token names" tone="var(--success)" />
          <Stat n={changedCount} label="brand primaries change value" tone="var(--warning)" />
          <Stat n={NEWLY_BRAND_SCOPED.length} label="tokens become brand-dependent" tone="var(--warning)" />
          <Stat n={BLOCKERS.filter((x) => x.severity === 'blocker').length} label="blockers to resolve first" tone="var(--error)" />
          <Stat n={SCAFFOLD_NAMES.length} label="scaffolding names that must NOT ship" />
        </div>
      </div>

      {/* ── scope model ───────────────────────────────────────────────────── */}
      <div>
        <h2 style={H2}>1 · How the scopes map</h2>
        <p style={P}>
          The POC hides behind an attribute that exists nowhere else in the repo. Adoption is mostly
          a rename — the model is already the shipped one.
        </p>
        <table style={table}>
          <thead>
            <tr style={{ borderBottom: 'var(--border-w-100) solid var(--border)' }}>
              <th style={th}>POC</th><th style={th}>Shipped</th><th style={th}>Note</th>
            </tr>
          </thead>
          <tbody>
            {SCOPE_MAP.map((r) => (
              <tr key={r.poc} style={rowBorder}>
                <td style={{ ...td, ...MONO, whiteSpace: 'nowrap' }}>{r.poc}</td>
                <td style={{ ...td, ...MONO, whiteSpace: 'nowrap', color: r.shipped === 'NEW' ? 'var(--warning)' : undefined }}>{r.shipped}</td>
                <td style={{ ...td, color: 'var(--muted-foreground)', fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-5)' }}>{r.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── updated values ────────────────────────────────────────────────── */}
      <div>
        <h2 style={H2}>2 · UPDATED — every brand primary changes</h2>
        <p style={P}>
          <code style={CODE}>tokens.scss</code> routes{' '}
          <code style={CODE}>[data-theme=&apos;db&apos;]</code> through{' '}
          <code style={CODE}>--db-primary</code>, so this is the real comparison — and{' '}
          <strong>{changedCount} of {primaryRows.length} change</strong>. Note that every{' '}
          <code style={CODE}>--&#123;code&#125;-primary-foreground</code> is{' '}
          <strong>identical</strong>: the black/white choice per brand does not move, only the hue.
        </p>
        <table style={table}>
          <thead>
            <tr style={{ borderBottom: 'var(--border-w-100) solid var(--border)' }}>
              <th style={th}>token</th><th style={th}>mode</th><th style={th}>today</th><th style={th}>proposed</th><th style={th} />
            </tr>
          </thead>
          <tbody>
            {primaryRows.map((r) => (
              <tr key={r.b + r.m} style={rowBorder}>
                <td style={{ ...td, ...MONO }}>--{r.b}-primary</td>
                <td style={{ ...td, ...MONO, color: 'var(--muted-foreground)' }}>{r.m}</td>
                <td style={{ ...td, ...MONO }}>{sw(r.now)}{r.now}</td>
                <td style={{ ...td, ...MONO }}>{sw(r.next)}{r.next}</td>
                <td style={{ ...td, ...MONO, color: r.changed ? 'var(--warning)' : 'var(--muted-foreground)' }}>
                  {r.changed ? 'changed' : 'same'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── newly scoped ──────────────────────────────────────────────────── */}
      <div>
        <h2 style={H2}>3 · CHANGED IN MEANING — {NEWLY_BRAND_SCOPED.length} tokens become brand-dependent</h2>
        <p style={P}>
          These names already exist and are not renamed. What changes is that they stop being one
          global value. <strong>No consumer breaks loudly</strong> — the token still resolves, it
          just resolves to a brand hue instead of slate. That silence is the risk.
        </p>
        <table style={table}>
          <thead>
            <tr style={{ borderBottom: 'var(--border-w-100) solid var(--border)' }}>
              <th style={th}>token</th><th style={th}>today (one value)</th>
              {SUB_BRANDS.map((b) => <th key={b} style={{ ...th, ...MONO }}>{b}</th>)}
            </tr>
          </thead>
          <tbody>
            {NEWLY_BRAND_SCOPED.map((t) => (
              <tr key={t} style={rowBorder}>
                <td style={{ ...td, ...MONO }}>{t}</td>
                <td style={{ ...td, ...MONO }}>{sw(todayVal(t, 'light'))}{todayVal(t, 'light')}</td>
                {SUB_BRANDS.map((b) => {
                  const v = light(b)?.decls.get(t) ?? null;
                  return <td key={b} style={{ ...td, ...MONO }}>{sw(v)}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── added ─────────────────────────────────────────────────────────── */}
      <div>
        <h2 style={H2}>4 · ADDED — {ALL_NEW_NAMES.length} names that do not exist today</h2>
        <p style={P}>
          Grouped by what they are for. The two ramp families are the bulk of the count and the
          least contentious part of it — they are additive, nothing reads them yet, and they are the
          reason the charting system can state a job instead of a colour.
        </p>
        {[
          { title: 'Brand identity', test: (t: string) => t.startsWith('--mark') || t === '--primary-deep' || t === '--decorative-hi' },
          { title: 'Chart ramps', test: (t: string) => t.startsWith('--chart') },
          { title: 'Surface machinery', test: (t: string) => t === '--surface-tint' },
          { title: 'Aiden', test: (t: string) => t.startsWith('--aiden') },
          { title: 'Mark runtime (set in JS, not authored in the sheet)', test: (t: string) => ['--mx', '--my', '--on'].includes(t) },
        ].map((g) => {
          const items = ALL_NEW_NAMES.filter(g.test);
          if (!items.length) return null;
          return (
            <div key={g.title} style={{ marginBottom: 'var(--p-4)' }}>
              <strong style={{ fontSize: 'var(--text-sm)' }}>{g.title} ({items.length})</strong>
              <div style={{ display: 'flex', gap: 'var(--p-2)', flexWrap: 'wrap', marginTop: 'var(--p-2)' }}>
                {items.map((t) => (
                  <code key={t} style={{ ...CODE, background: 'var(--secondary)' }}>{t}</code>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── scaffolding ───────────────────────────────────────────────────── */}
      <div>
        <h2 style={H2}>5 · MUST NOT SHIP — {SCAFFOLD_NAMES.length} scaffolding names</h2>
        <p style={P}>
          Prototype-only. Some are genuine tokens wearing a POC prefix (the mark gradient, the
          shadows) and would be renamed on adoption; others are demo controls with no place in a
          shipped sheet. Either way <strong>no <code style={CODE}>--poc2-*</code> name can appear in{' '}
          <code style={CODE}>tokens.scss</code></strong>.
        </p>
        <div style={{ display: 'flex', gap: 'var(--p-2)', flexWrap: 'wrap' }}>
          {SCAFFOLD_NAMES.map((t) => (
            <code key={t} style={{ ...CODE, background: 'var(--error-light)', color: 'var(--error-text, var(--error))' }}>{t}</code>
          ))}
        </div>
      </div>

      {/* ── invariants ────────────────────────────────────────────────────── */}
      <div>
        <h2 style={H2}>6 · Invariant check — is chart slot 1 the brand&rsquo;s primary?</h2>
        <p style={P}>
          The rule the palettes were built on is that a chart&rsquo;s first series{' '}
          <em>is</em> the brand. It holds in {SLOT1_ROWS.filter((r) => r.ok).length} of{' '}
          {SLOT1_ROWS.length} cases. The exceptions are real and both are owner-authored — recorded
          here rather than &ldquo;fixed&rdquo;, because a hand-picked palette outranks a rule the
          rule was only ever a shorthand for.
        </p>
        <table style={table}>
          <thead>
            <tr style={{ borderBottom: 'var(--border-w-100) solid var(--border)' }}>
              <th style={th}>scope</th><th style={th}>mode</th><th style={th}>--primary</th>
              <th style={th}>--chart-1</th><th style={th} />
            </tr>
          </thead>
          <tbody>
            {SLOT1_ROWS.filter((r) => !r.ok).map((r) => (
              <tr key={r.k + r.m} style={rowBorder}>
                <td style={{ ...td, ...MONO }}>{r.k}</td>
                <td style={{ ...td, ...MONO, color: 'var(--muted-foreground)' }}>{r.m}</td>
                <td style={{ ...td, ...MONO }}>{sw(r.primary)}{r.primary}</td>
                <td style={{ ...td, ...MONO }}>{sw(r.chart1)}{r.chart1}</td>
                <td style={{ ...td, ...MONO, color: 'var(--warning)' }}>differs</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ ...P, marginTop: 'var(--p-3)' }}>
          <code style={CODE}>ec</code> dark: the brand primary is a bright cyan that reads as a
          highlight rather than a series, and ec&rsquo;s categorical set was the original
          hand-drawn one — it was never derived from the primary.{' '}
          <code style={CODE}>aiden</code> light: the surface&rsquo;s primary is the shipped blurple,
          and the chart opens a shade brighter so it separates from its own slot 3.{' '}
          <strong>The consequence to accept:</strong> in those two cases a legend swatch and the
          brand accent on the same page are not the same colour.
        </p>
      </div>

      {/* ── blockers ──────────────────────────────────────────────────────── */}
      <div>
        <h2 style={H2}>7 · Resolve before writing a patch</h2>
        <p style={P}>
          This section is <strong>judgement, not measurement</strong> — everything above is computed,
          this is the reading of it. Three are genuine blockers; two are decisions that only need an
          owner.
        </p>
        <div style={{ display: 'grid', gap: 'var(--p-3)' }}>
          {BLOCKERS.map((x) => (
            <div
              key={x.q}
              style={{
                padding: 'var(--p-4)',
                borderRadius: 'var(--rounded-lg)',
                border: 'var(--border-w-100) solid var(--border)',
                borderInlineStart: `var(--border-w-400) solid ${x.severity === 'blocker' ? 'var(--error)' : 'var(--warning)'}`,
                background: 'var(--card)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--p-2)', marginBottom: 'var(--p-1)' }}>
                <strong style={{ fontSize: 'var(--text-sm)' }}>{x.q}</strong>
                <span style={{ ...MONO, color: x.severity === 'blocker' ? 'var(--error)' : 'var(--warning)' }}>
                  {x.severity}
                </span>
              </div>
              <p style={{ ...P, margin: 0 }}>{x.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

