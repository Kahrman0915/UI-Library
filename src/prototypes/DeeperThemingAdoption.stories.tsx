import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { POC_CSS, PRIMARY_LIGHT, PRIMARY_DARK, BRAND_ANCHORS, SUB_BRANDS } from './deeperThemingRecipe';

/**
 * ADOPTION PREVIEW — what deeper theming would do to tokens.scss.
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
const POC_LIGHT = findBlock(POC_BLOCKS, (s) => s.trim() === "[data-theme-poc][data-mode='light']");
const POC_DARK = findBlock(POC_BLOCKS, (s) => s.trim() === "[data-theme-poc][data-mode='dark']");

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
    // A --poc-* name is new by definition; anything else is compared by value.
    const status: Row['status'] =
      existing === null ? 'new' : existing === proposed ? 'unchanged' : 'changed';
    rows.push({ token, today: existing, proposed, status });
  }
  return rows;
}

const LIGHT_ROWS = diff(LIGHT, POC_LIGHT);
const DARK_ROWS = diff(DARK, POC_DARK);
const ALL_ROWS = [...LIGHT_ROWS, ...DARK_ROWS];

const count = (s: Row['status']) => ALL_ROWS.filter((r) => r.status === s).length;
const THEME_BLOCKS = TOKEN_BLOCKS.filter((b) => b.selector.includes('data-theme='));
/** The POC never declares inside a [data-theme] scope — this proves it. */
const POC_THEME_BLOCKS = POC_BLOCKS.filter((b) => /data-theme=/.test(b.selector));

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

function Pre({ children }: { children: ReactNode }) {
  return (
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
      }}
    >
      {children}
    </pre>
  );
}

const meta: Meta = {
  title: 'Prototypes/Deeper Theming — Adoption',
  parameters: {
    layout: 'fullscreen',
    ui: {
      description:
        'What adopting deeper theming would actually do to `tokens.scss`. Reads the real token ' +
        'file and the real POC recipe at render time and reports the diff — nothing is changed, ' +
        'and nothing here is hand-copied. Start at **Decision** for the shape that was settled on; ' +
        'the rest is cost and risk.',
      tags: ['poc', 'theming', 'migration'],
    },
  },
};
export default meta;
type Story = StoryObj;

// ─────────────────────────────────────────────────────────────────────────────
// 0 — Decision
// ─────────────────────────────────────────────────────────────────────────────

const RULES: { t: string; b: string }[] = [
  { t: 'A brand is three anchors, not one colour',
    b: 'highlight / primary / deep, read off the Figma mark. One number could never carry a suite this wide — the wheel is 360 degrees and eight brands plus the semantics do not fit on it.' },
  { t: '--primary IS the mark’s middle stop',
    b: 'No derivation, no second value a few percent away. Where a brand genuinely wants its accent to differ from its artwork it authors one, and aiden is the only one that does — a 8.6 ΔE gap someone chose, not an artifact.' },
  { t: 'Every brand carries the same white label',
    b: 'The marks moved to earn it rather than the label changing colour per sub-app. Measured 4.50–5.67 across the six. Solve against #ffffff, not #f8fafc — every theme scope overrides the label to pure white.' },
  { t: 'Surfaces come from DEEP, and move only slightly',
    b: '4–8 ΔE off the neutral: enough to read as this brand beside another, never enough to read as a coloured page. Never the highlight — a surface should sit under the accent, not beside it.' },
  { t: 'Lines and shadows stay near slate',
    b: 'They carry no contrast budget, which is exactly why an early pass overspent there. A hairline that announces the brand is the loudest tell of a cheap theme.' },
  { t: 'The highlight is artwork only',
    b: 'Mark, hero gradient, marketing bubbles, small non-text accents. The test is whether anything is read on top of it; if something is, it is the wrong token.' },
  { t: 'Aiden and its host always share a surface',
    b: 'Aiden takes the main brand’s neutrals, so its panel matches whatever page it lands on by construction. An earlier rule pinned db and aiden to the same deep to achieve this; that is now moot, because Aiden never derives a surface from its deep at all.' },
  { t: 'Aiden is a SURFACE, not a seventh brand',
    b: 'A theme says which room you are in; Aiden is the assistant that walks into whichever room you are already in. It takes the main brand’s neutrals — a panel that repainted its host would tear a hole in the page, and its own product is a chat, where a tint is a liability.' },
  { t: 'Gradient fill = Aiden. Flat fill = a sub-app',
    b: 'The gradient is a categorical difference where a surface tint is only ever a matter of degree. Every mark here is a three-stop gradient, so the temptation to push that into the six brands’ buttons is real. The second gradient in the system is the one that kills the first.' },
  { t: 'The suite ramp belongs to the parent only',
    b: 'All seven at once — the headline, the stat numerals, the bubble field — and only on the suite page. Inside a sub-app it would contradict the point, which is that one brand is in charge.' },
];

export const Decision: Story = {
  render: () => (
    <div style={PAGE}>
      <div>
        <h2 style={H2}>What this POC settled</h2>
        <p style={P}>
          Ten rules, in the order they were arrived at. Everything else in these two story sets is
          either the evidence for one of them or the cost of adopting it.
        </p>
      </div>
      <div style={{ display: 'grid', gap: 'var(--p-3)' }}>
        {RULES.map((r, i) => (
          <div
            key={r.t}
            style={{
              display: 'flex', gap: 'var(--p-4)', alignItems: 'flex-start',
              padding: 'var(--p-4)', borderRadius: 'var(--rounded-lg)',
              border: 'var(--border-w-100) solid var(--border)', background: 'var(--card)',
            }}
          >
            <span
              style={{
                ...CODE, flex: 'none', width: 26, height: 26, borderRadius: 'var(--rounded-full)',
                display: 'grid', placeItems: 'center', background: 'var(--secondary)',
                color: 'var(--muted-foreground)',
              }}
            >
              {i + 1}
            </span>
            <div style={{ display: 'grid', gap: 'var(--p-1)' }}>
              <strong style={{ fontSize: 'var(--text-sm)' }}>{r.t}</strong>
              <span style={{ fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-6)', color: 'var(--muted-foreground)' }}>
                {r.b}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div>
        <h2 style={H2}>What is still open</h2>
        <p style={P}>
          <strong>Dark mode has had none of this.</strong> No white-label solve, no deep re-cuts, no
          shared db/aiden deep. Five of seven deeps sit more than 8° of hue from their light
          counterpart, and aiden&rsquo;s two modes are not the same colour at all — violet at hue 309
          in light, blue at 289 in dark. Contrast tests run per-mode, so nothing in the tooling can
          see it. The light set is the reference and it is a mechanical pass.
          <br />
          <strong>The Figma masters are behind the code</strong> on every light stop.
          <br />
          <strong>Semantic tints over a tinted band</strong> remain the one measured hazard — error on
          its own tint reads 4.19–4.27 there against 4.72 on the white page.
          <br />
          <strong>db and aiden are 5.9 ΔE apart on their flat accent</strong> (#6063f1 vs #5a56d3) —
          the tightest pair in the set, between the two apps that overlap most, and it appeared when db
          moved to the shipped indigo. Aiden&rsquo;s gradient does not fix it: the accent is what paints
          its text, borders and chips. This is the one open colour decision.
        </p>
      </div>
    </div>
  ),
};

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

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
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
        const card = mode === 'dark' ? [30, 41, 59] : [255, 255, 255];
        const read = (primary: string) => {
          const scope = document.createElement('div');
          scope.setAttribute('data-mode', mode);
          scope.style.cssText = `position:absolute;left:-9999px;--primary:${primary}`;
          const probe = document.createElement('div');
          scope.appendChild(probe);
          host.appendChild(scope);
          const t = (tok: string) => {
            probe.style.backgroundColor = '';
            probe.style.backgroundColor = `var(${tok})`;
            return px(getComputedStyle(probe).backgroundColor);
          };
          const res = {
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
        const a = read(SHIPPED[brand][mode]);
        const b = read(mode === 'light' ? PRIMARY_LIGHT[brand] : PRIMARY_DARK[brand]);
        // These are the pairings COMPONENTS ACTUALLY RENDER, not every pairing the
        // tokens permit. The distinction started mattering on 2026-08-02: the brand
        // Alert, Banner and secondary Button moved their text to --foreground, so
        // "--primary-text on a tint" stopped having a consumer. Auditing it anyway
        // would have kept reporting an adoption cost that no longer exists.
        out.push({ brand, mode, pairing: 'button secondary label (fg on soft)', today: ratio(a.fg, a.soft), after: ratio(b.fg, b.soft), floor: 4.5 });
        out.push({ brand, mode, pairing: 'alert/banner title (fg on light)', today: ratio(a.fg, a.light), after: ratio(b.fg, b.light), floor: 4.5 });
        out.push({ brand, mode, pairing: 'alert description (muted on light)', today: ratio(a.muted, a.light), after: ratio(b.muted, b.light), floor: 4.5 });
        out.push({ brand, mode, pairing: 'brand icon on light — non-text', today: ratio(a.text, a.light), after: ratio(b.text, b.light), floor: 3 });
        out.push({ brand, mode, pairing: 'primary-text on card (outline/link)', today: ratio(a.text, card), after: ratio(b.text, card), floor: 4.5 });
        out.push({ brand, mode, pairing: 'primary-border on card', today: ratio(a.border, card), after: ratio(b.border, card), floor: 3 });
      }
    }
    setRows(out);
  }, []);

  return { hostRef, rows };
}

export const Regressions: Story = {
  render: function RegressionsStory() {
    const { hostRef, rows } = useDerivedAudit();
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
              These pass today and fail after — the blocking list. This section is empty as of
              2026-08-02, when the brand <code style={CODE}>Alert</code>,{' '}
              <code style={CODE}>Banner</code> and secondary <code style={CODE}>Button</code> moved
              their text to <code style={CODE}>--foreground</code> and kept the brand in the tint,
              icon and border. A themed surface no longer carries themed text anywhere, so these
              pairings became brand-independent and stopped tracking the primary at all. If it
              refills, the same move is the first thing to try.
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
          {table(rows, `${rows.length} pairings — ${SUB_BRANDS.length} brands x 2 modes x 6 pairings`)}
        </div>
      </div>
    );
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 0c — New tokens
// ─────────────────────────────────────────────────────────────────────────────

const SURFACE_TOKENS = [
  '--background', '--card', '--popover', '--secondary', '--accent', '--muted', '--input',
  '--border', '--border-hover', '--ring', '--sidebar', '--sidebar-border', '--sidebar-accent',
];

export const NewTokens: Story = {
  render: function NewTokensStory() {
    const perBrand = 7;
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
            <Stat n={2} label="codes with no POC values" tone="var(--error)" />
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
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 1 — Verdict
// ─────────────────────────────────────────────────────────────────────────────

export const Verdict: Story = {
  render: () => (
    <div style={PAGE}>
      <div>
        <h2 style={H2}>How big is this, really?</h2>
        <p style={P}>
          Every number on this page is computed at render time from{' '}
          <code style={CODE}>src/styles/tokens.scss</code> and the POC recipe. Nothing is
          hand-copied, so nothing here can quietly go stale.
        </p>
        <div style={{ display: 'flex', gap: 'var(--p-3)', flexWrap: 'wrap' }}>
          <Stat n={count('changed')} label="existing tokens change value" />
          <Stat n={count('new')} label="new tokens introduced" />
          <Stat n={POC_THEME_BLOCKS.length} label="theme scopes edited" tone="var(--success)" />
          <Stat n={`2 / ${TOKEN_BLOCKS.length}`} label="top-level blocks touched" />
          <Stat n={TOKENS.split('\n').length} label="lines in tokens.scss today" />
        </div>
      </div>

      <div>
        <h2 style={H2}>The finding that makes it small</h2>
        <p style={P}>
          <strong>The eight theme scopes need no edits at all.</strong> That is not an
          optimisation, it is how the cascade already works, and it is the single fact that decides
          whether this is a weekend or a month.
        </p>
        <p style={P}>
          A custom property is resolved at <em>computed-value time</em> against the element&rsquo;s
          final cascaded value — not at the point it was declared. So a recipe written once in{' '}
          <code style={CODE}>[data-mode=&apos;light&apos;]</code> that references{' '}
          <code style={CODE}>var(--primary)</code> picks up whatever{' '}
          <code style={CODE}>[data-theme=&apos;dc&apos;]</code> set, even though the theme block
          appears <strong>{THEME_BLOCKS[0] ? THEME_BLOCKS[0].start - (LIGHT?.start ?? 0) : 0} lines
          later</strong> in the file. One declaration covers all{' '}
          {THEME_BLOCKS.length} brands plus the un-themed main brand.
        </p>
        <p style={P}>
          The Cascade Proof story measures exactly that, live, so it is not taken on trust. It also
          means the pattern is <em>already in the file</em>: every theme scope derives{' '}
          <code style={CODE}>--primary-hover</code>, <code style={CODE}>--primary-soft</code> and
          six siblings with <code style={CODE}>color-mix</code> from{' '}
          <code style={CODE}>var(--primary)</code>. Deeper theming applies the same move to
          surfaces. It is not a new architecture — it is the existing one, used on more tokens.
        </p>
      </div>

      <div>
        <h2 style={H2}>Answering the question directly</h2>
        <p style={P}>
          <strong>No, it would not be difficult to implement</strong> — the mechanical change is
          about {count('changed')} declarations swapped from a literal to a{' '}
          <code style={CODE}>color-mix</code> expression, plus {count('new')} additions, inside{' '}
          <strong>two</strong> of the file&rsquo;s {TOKEN_BLOCKS.length} top-level blocks. Nothing
          is renamed, nothing moves, and no component changes.
        </p>
        <p style={P}>
          The difficulty is not in the edit. It is in the three things listed under Risks, none of
          which are about SCSS.
        </p>
      </div>
    </div>
  ),
};

// ─────────────────────────────────────────────────────────────────────────────
// 2 — File map
// ─────────────────────────────────────────────────────────────────────────────

export const FileMap: Story = {
  render: () => {
    const touched = (sel: string) =>
      sel.trim() === "[data-mode='light']" || sel.trim() === "[data-mode='dark']";
    return (
      <div style={PAGE}>
        <div>
          <h2 style={H2}>tokens.scss as it stands</h2>
          <p style={P}>
            Every top-level block in the file, with its real line range and declaration count. The
            two highlighted rows are the only ones deeper theming would open.
          </p>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 'var(--text-sm)' }}>
            <thead>
              <tr style={{ borderBottom: 'var(--border-w-100) solid var(--border)' }}>
                <th style={{ textAlign: 'left', padding: 'var(--p-2)' }}>Block</th>
                <th style={{ textAlign: 'right', padding: 'var(--p-2)' }}>Lines</th>
                <th style={{ textAlign: 'right', padding: 'var(--p-2)' }}>Declarations</th>
                <th style={{ textAlign: 'left', padding: 'var(--p-2)' }}>Deeper theming</th>
              </tr>
            </thead>
            <tbody>
              {TOKEN_BLOCKS.filter((b) => b.decls.size > 0).map((b) => {
                const hit = touched(b.selector);
                return (
                  <tr
                    key={b.selector + b.start}
                    style={{
                      borderBottom: 'var(--border-w-50) solid var(--border)',
                      background: hit ? 'var(--primary-light)' : undefined,
                    }}
                  >
                    <td style={{ ...MONO, padding: 'var(--p-2)', fontSize: 'var(--text-sm)' }}>
                      {b.selector}
                    </td>
                    <td style={{ ...MONO, padding: 'var(--p-2)', textAlign: 'right' }}>
                      {b.start}–{b.end}
                    </td>
                    <td style={{ ...MONO, padding: 'var(--p-2)', textAlign: 'right' }}>
                      {b.decls.size}
                    </td>
                    <td
                      style={{
                        padding: 'var(--p-2)',
                        fontSize: 'var(--text-xs)',
                        color: hit ? 'var(--primary-text)' : 'var(--muted-foreground)',
                        fontWeight: hit ? 'var(--font-semibold)' : 'var(--font-normal)',
                      }}
                    >
                      {hit ? 'edited in place' : 'untouched'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div>
          <h2 style={H2}>What an edit looks like</h2>
          <p style={P}>
            One line per token, same place in the file, same name. The literal becomes an expression
            whose base <em>is</em> the literal that was there — so at{' '}
            <code style={CODE}>--theme-depth: 0</code> it resolves byte-for-byte to today.
          </p>
          <Pre>{`  /* today */
  --secondary: #e2e8f0;
  --sidebar:   #f8fafc;

  /* proposed — the base is the old literal, so depth 0 == today */
  --tint-stock:  color-mix(in srgb, var(--primary) 45%, #ffffff);
  --secondary:   color-mix(in srgb, var(--tint-stock) calc(28% * var(--theme-depth)), #e2e8f0);

  --rail-stock:  color-mix(in srgb, var(--primary) 28%, #64748b);
  --sidebar:     color-mix(in srgb, var(--rail-stock)  calc(20% * var(--theme-depth)), #f8fafc);`}</Pre>
          <p style={{ ...P, marginTop: 'var(--p-4)' }}>
            <code style={CODE}>--theme-depth</code> would be a single global switch defaulting to{' '}
            <code style={CODE}>1</code>, settable to <code style={CODE}>0</code> per subtree. That
            is the whole rollback plan, and it is why this is low-risk to try: an entire product can
            opt out with one attribute.
          </p>
        </div>
      </div>
    );
  },
};

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
        reports today's values — [data-theme-poc] rules simply would not exist,
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
          data-theme-poc=""
          style={{ '--poc-str': 1, '--poc-chrome': 1 } as CSSProperties}
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

export const TokenDiff: Story = {
  render: function TokenDiffStory() {
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
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 4 — Cascade proof
// ─────────────────────────────────────────────────────────────────────────────

const ALL_BRANDS = ['', 'db', 'dc', 'dr', 'ec', 'ir', 'nb', 'ph', 'rm'];

export const CascadeProof: Story = {
  render: function CascadeProofStory() {
    const hostRef = useRef<HTMLDivElement>(null);
    const [rows, setRows] = useState<{ brand: string; primary: string; derived: string }[]>([]);

    useEffect(() => {
      const host = hostRef.current;
      if (!host) return;
      const out: { brand: string; primary: string; derived: string }[] = [];
      for (const b of ALL_BRANDS) {
        const scope = host.querySelector<HTMLElement>(`[data-b="${b || 'main'}"]`);
        const probe = scope?.firstElementChild as HTMLElement | undefined;
        if (!probe) continue;
        const read = (v: string) => {
          probe.style.backgroundColor = '';
          probe.style.backgroundColor = v;
          return toHex(getComputedStyle(probe).backgroundColor) ?? '';
        };
        out.push({
          brand: b || '(main brand)',
          primary: read('var(--primary)'),
          derived: read('var(--adopt-probe)'),
        });
      }
      setRows(out);
    }, []);

    const distinct = new Set(rows.map((r) => r.derived)).size;

    return (
      <>
        {/*
          Written EXACTLY as adoption would write it: the recipe lives in the
          [data-mode] block and never mentions a brand. If the cascade did not
          reach far enough, every row below would show the same colour.
        */}
        <style>{`
          [data-mode='light'] { --adopt-probe: color-mix(in srgb, var(--primary) 28%, #e2e8f0); }
          [data-mode='dark']  { --adopt-probe: color-mix(in srgb, var(--primary) 35%, #1e293b); }
        `}</style>
        <div
          ref={hostRef}
          aria-hidden="true"
          style={{ position: 'fixed', left: -9999, top: 0, width: 1, height: 1, overflow: 'hidden' }}
        >
          {ALL_BRANDS.map((b) => (
            <span key={b || 'main'} data-b={b || 'main'} data-theme={b || undefined} data-mode="light">
              <span />
            </span>
          ))}
        </div>

        <div style={PAGE}>
          <div>
            <h2 style={H2}>Why the theme scopes need no edits</h2>
            <p style={P}>
              The rule below is declared <strong>once</strong>, in the mode block, and mentions no
              brand:
            </p>
            <Pre>{`[data-mode='light'] { --adopt-probe: color-mix(in srgb, var(--primary) 28%, #e2e8f0); }`}</Pre>
            <p style={{ ...P, marginTop: 'var(--p-4)' }}>
              Each <code style={CODE}>[data-theme]</code> block sets{' '}
              <code style={CODE}>--primary</code> hundreds of lines further down the file. Because a
              custom property resolves against the element&rsquo;s <em>final</em> cascaded value
              rather than at its declaration site, that one rule produces a different result per
              brand — with no per-brand authoring at all.
            </p>
            <p style={P}>
              <strong>
                {distinct} distinct results from one declaration, across {rows.length} scopes.
              </strong>{' '}
              If this had failed, adoption would mean writing 8 themes × 2 modes = 16 blocks by
              hand, and the answer to &ldquo;is it difficult&rdquo; would be a different one.
            </p>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ borderCollapse: 'collapse', fontSize: 'var(--text-sm)', maxWidth: 620 }}>
              <thead>
                <tr style={{ borderBottom: 'var(--border-w-100) solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: 'var(--p-2)' }}>Scope</th>
                  <th style={{ textAlign: 'left', padding: 'var(--p-2)' }}>--primary</th>
                  <th style={{ textAlign: 'left', padding: 'var(--p-2)' }}>derived surface</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.brand} style={{ borderBottom: 'var(--border-w-50) solid var(--border)' }}>
                    <td style={{ ...MONO, padding: 'var(--p-2)', fontSize: 'var(--text-sm)' }}>
                      {r.brand}
                    </td>
                    {[r.primary, r.derived].map((c, i) => (
                      <td key={i} style={{ ...MONO, padding: 'var(--p-2)', whiteSpace: 'nowrap' }}>
                        <span
                          aria-hidden="true"
                          style={{
                            display: 'inline-block',
                            width: 'var(--w-5)',
                            height: 'var(--h-5)',
                            borderRadius: 'var(--rounded-sm)',
                            border: 'var(--border-w-100) solid var(--border)',
                            background: c,
                            verticalAlign: 'middle',
                          }}
                        />{' '}
                        <span style={{ color: 'var(--muted-foreground)' }}>{c}</span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <h2 style={H2}>The pattern is already in the file</h2>
            <p style={P}>
              This is not a technique being introduced. Every theme scope already derives eight
              siblings from <code style={CODE}>var(--primary)</code> exactly this way:
            </p>
            <Pre>{`[data-theme='dc'] {
  --primary: var(--dc-primary);
  --primary-hover: color-mix(in srgb, var(--primary) 85%, var(--foreground));
  --primary-soft:  color-mix(in srgb, var(--primary) 10%, transparent);
  --primary-text:  color-mix(in srgb, var(--primary) 85%, var(--foreground));
  /* …and four more */
}`}</Pre>
            <p style={{ ...P, marginTop: 'var(--p-4)' }}>
              Deeper theming applies the same move to surface tokens instead of primary siblings. It
              is the existing architecture used on more tokens, not a new one.
            </p>
          </div>
        </div>
      </>
    );
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 5 — Risks
// ─────────────────────────────────────────────────────────────────────────────

export const Risks: Story = {
  render: () => (
    <div style={PAGE}>
      <div>
        <h2 style={H2}>Where the actual difficulty is</h2>
        <p style={P}>
          The SCSS edit is small. These are not, and none of them are about SCSS. In rough order of
          how much work they represent:
        </p>
      </div>

      <div>
        <h2 style={H2}>1 — The contrast gate is blind to all of it</h2>
        <p style={P}>
          <code style={CODE}>scripts/contrast-check.mjs</code> brace-matches the two{' '}
          <code style={CODE}>[data-mode]</code> blocks, returns <code style={CODE}>null</code> for
          any <code style={CODE}>color-mix</code>, and treats unresolved as{' '}
          <strong>not a failure</strong> while still exiting 0. The moment these tokens become
          expressions, the gate silently stops checking them and keeps printing a green pass.
        </p>
        <p style={P}>
          It would need a <code style={CODE}>var()</code> resolver, a{' '}
          <code style={CODE}>color-mix</code> evaluator, and theme awareness — going from{' '}
          {49} pairings to roughly 8 brands × 2 modes × the pairing list. That is the real
          engineering cost of this change, and it should land <em>before</em> the tokens, not after.
          Everything the POC found was found by measuring in a browser precisely because the gate
          could not.
        </p>
      </div>

      <div>
        <h2 style={H2}>2 — Ten components render outside the scope</h2>
        <p style={P}>
          Dialog, Drawer, Popover, Tooltip, DropdownMenu, ContextMenu, Select, Combobox, HoverCard
          and Toaster all portal to <code style={CODE}>document.body</code>. A{' '}
          <code style={CODE}>data-theme</code> on a subtree does not reach them today either — this
          is pre-existing, and deeper theming only makes it more visible, because a tinted panel
          whose menu is untinted looks broken in a way a neutral one does not.
        </p>
      </div>

      <div>
        <h2 style={H2}>3 — --background is doing two jobs</h2>
        <p style={P}>
          It is the page surface <em>and</em> the knockout colour punched through the Switch thumb,
          the Slider thumb, the Avatar ring and the Tabs indicator. Keeping light mode white hides
          this — the knockouts stay correct for free. Dark mode tints its page, so the knockouts
          there are already living on the assumption that a tinted background is close enough to the
          card behind it. Doing this properly needs a separate{' '}
          <code style={CODE}>--surface-knockout</code> token, which is a rename-free addition but
          touches four components.
        </p>
      </div>

      <div>
        <h2 style={H2}>Two smaller ones, for completeness</h2>
        <p style={P}>
          <strong>A custom property cannot reference itself.</strong>{' '}
          <code style={CODE}>--background: color-mix(…, var(--background))</code> is a cycle and
          resolves to <code style={CODE}>unset</code>. Every base above is therefore the literal
          that is already there, which works but means the old value lives on inside the new
          expression. A cleaner adoption introduces raw{' '}
          <code style={CODE}>--surface-*</code> neutrals and derives the semantic tokens from them —
          more correct, more churn.
          <br />
          <strong>Figma is a separate push.</strong> The token set there is bound variable-by-variable;
          expressions do not exist. Each new surface would have to be resolved per brand per mode
          and pasted in as flat values — see <code style={CODE}>docs/figma-playbook.md</code>.
        </p>
      </div>

      <div>
        <h2 style={H2}>What makes it safe to attempt</h2>
        <p style={P}>
          A single <code style={CODE}>--theme-depth</code> switch defaulting to{' '}
          <code style={CODE}>1</code> and settable to <code style={CODE}>0</code> on any subtree.
          Because every expression is <code style={CODE}>calc(N% * var(--theme-depth))</code> over
          the original literal, depth 0 resolves byte-for-byte to today — which the POC verifies on
          every render. Any product that dislikes it opts out with one attribute, and the rollback
          is a one-line default change rather than a revert.
        </p>
      </div>
    </div>
  ),
};
