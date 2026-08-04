import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { POC_CSS, PRIMARY_LIGHT, PRIMARY_DARK, BRAND_ANCHORS, SUB_BRANDS } from './deeperThemingRecipe';

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
    // document. The probes below carry [data-theme-poc][data-brand], which
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
        // POC column now carries [data-theme-poc][data-brand], so --card,
        // --primary-soft and --primary-light all resolve through the real
        // cascade. --poc-str has no default in the recipe (the story root sets
        // it), and without it every dark surface silently goes unset, so it is
        // declared on the scope here.
        const read = (primary: string, poc: boolean) => {
          const scope = document.createElement('div');
          scope.setAttribute('data-mode', mode);
          if (poc) {
            scope.setAttribute('data-theme-poc', '');
            scope.setAttribute('data-brand', brand);
          }
          scope.style.cssText =
            `position:absolute;left:-9999px;--poc-str:1;--primary:${primary}`;
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

export function NewTokensPanel() {
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
// 4 — Cascade proof
// ─────────────────────────────────────────────────────────────────────────────



// ─────────────────────────────────────────────────────────────────────────────
// 5 — Risks
// ─────────────────────────────────────────────────────────────────────────────

