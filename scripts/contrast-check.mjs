#!/usr/bin/env node
// Contrast guardrail for the design tokens.
//
// Parses src/styles/tokens.scss, resolves every token in each THEMING CONTEXT,
// and checks the WCAG contrast of every text-on-surface pairing the components
// actually use. Fails (exit 1) if any pairing drops below AA (4.5:1) in ANY
// context; warns for pairings that pass AA but not AAA (7:1). No dependencies.
//
//   npm run test:contrast
//
// Add a pairing here whenever a component puts a `-foreground`/text token on a
// new surface. Tint surfaces (e.g. `error-light`) are composited over `--background`
// before the text is measured, matching how Alerts render.
//
// ── WHY THIS IS A MATRIX AND NOT TWO MODES ───────────────────────────────────
// Deeper theming makes a token's value depend on four axes, not one:
//
//   mode   light | dark              (as before)
//   theme  none | db dc ec nb ph rm  (a brand re-anchors --primary AND, once the
//                                     brand blocks land, the surfaces under it)
//   tint   page on/off, rail on/off  (surfaces mix --tint-stock in by a multiplier)
//
// The old version read ONLY the two [data-mode] blocks, so it measured the
// un-themed, un-tinted neutrals and nothing else. Under deeper theming that is
// the one combination least likely to break: it would report PASS while a brand's
// muted-foreground sat on its own tinted --muted below AA. Every context is
// enumerated and every pairing measured in all of them; the report shows the
// WORST context per pairing, because that is the one that decides the verdict.
//
// The resolver had to grow with it. It now follows var() chains, evaluates
// color-mix(in srgb, …) numerically, and evaluates the calc(N% * var(--tint-x, 0))
// multiplier form — without those, every tinted surface resolves to null and is
// SKIPPED, which is indistinguishable from passing. That silent-skip is exactly
// how the gradient checks in figma-variable-audit.js sat dead for weeks.

import { readFileSync } from 'node:fs';

const AA = 4.5;
const AAA = 7;

const src = readFileSync(new URL('../src/styles/tokens.scss', import.meta.url), 'utf8');

// ── Block scanner ─────────────────────────────────────────────────────────────
// Walk the top level of the file collecting { selector, decls, order }. At-rules
// (@media) are skipped wholesale — the reduced-motion block carries no colour.
const scanBlocks = (css) => {
  const blocks = [];
  let i = 0;
  let order = 0;
  while (i < css.length) {
    const open = css.indexOf('{', i);
    if (open < 0) break;
    let selector = css.slice(i, open);
    // Strip comments out of the selector text
    selector = selector.replace(/\/\*[\s\S]*?\*\//g, '').trim();
    // Brace-match to the close
    let depth = 0;
    let j = open;
    for (; j < css.length; j++) {
      if (css[j] === '{') depth++;
      else if (css[j] === '}' && --depth === 0) break;
    }
    const body = css.slice(open + 1, j);
    if (!selector.startsWith('@')) {
      blocks.push({ selector, body, order: order++ });
    }
    i = j + 1;
  }
  return blocks;
};

const parseDecls = (block) => {
  const map = {};
  // Strip comments first so a commented-out declaration is not read as live.
  const clean = block.replace(/\/\*[\s\S]*?\*\//g, '');
  const re = /--([a-z0-9-]+)\s*:\s*([^;]+);/g;
  let m;
  while ((m = re.exec(clean))) map[m[1]] = m[2].trim();
  return map;
};

// ── Selector → conditions ─────────────────────────────────────────────────────
// Every selector in this file is a chain of attribute/pseudo conditions on <html>
// or an ancestor. Descendant vs compound changes SPECIFICITY but not whether the
// rule applies to a given context, so conditions are collected as a flat set.
const parseSelector = (sel) =>
  sel.split(',').map((oneRaw) => {
    const one = oneRaw.trim();
    const cond = { mode: null, theme: null, themeAny: false, surface: null, tint: [] };
    let specificity = 0;

    for (const m of one.matchAll(/\[data-mode=['"]([a-z]+)['"]\]/g)) { cond.mode = m[1]; specificity++; }
    for (const m of one.matchAll(/\[data-theme=['"]([a-z0-9-]+)['"]\]/g)) { cond.theme = m[1]; specificity++; }
    for (const m of one.matchAll(/\[data-surface=['"]([a-z0-9-]+)['"]\]/g)) { cond.surface = m[1]; specificity++; }
    for (const m of one.matchAll(/\[data-tint~=['"]([a-z]+)['"]\]/g)) { cond.tint.push(m[1]); specificity++; }
    // Bare [data-theme] (no value) — matches any theme
    if (/\[data-theme\]/.test(one)) { cond.themeAny = true; specificity++; }
    if (/:root/.test(one)) specificity++;

    return { cond, specificity, raw: one };
  });

// Does one parsed selector apply in this context?
const applies = ({ cond }, ctx) => {
  if (cond.mode && cond.mode !== ctx.mode) return false;
  if (cond.theme && cond.theme !== ctx.theme) return false;
  if (cond.themeAny && !ctx.theme) return false;
  if (cond.surface && cond.surface !== ctx.surface) return false;
  for (const t of cond.tint) {
    if (t === 'page' && !ctx.tintPage) return false;
    if (t === 'rail' && !ctx.tintRail) return false;
  }
  return true;
};

const BLOCKS = scanBlocks(src).map((b) => ({ ...b, sels: parseSelector(b.selector), decls: parseDecls(b.body) }));

// Discover which brands actually ship, so retiring one needs no edit here.
const BRANDS = [...new Set(
  BLOCKS.flatMap((b) => b.sels.map((s) => s.cond.theme).filter(Boolean)),
)].sort();

// ── Cascade ───────────────────────────────────────────────────────────────────
// Layer every applying block by (specificity, source order) — CSS's own rule for
// custom properties on the same element chain.
const buildMap = (ctx) => {
  const applying = [];
  for (const b of BLOCKS) {
    const matched = b.sels.filter((s) => applies(s, ctx));
    if (!matched.length) continue;
    applying.push({ spec: Math.max(...matched.map((s) => s.specificity)), order: b.order, decls: b.decls });
  }
  applying.sort((a, z) => (a.spec - z.spec) || (a.order - z.order));
  const map = {};
  for (const a of applying) Object.assign(map, a.decls);
  return map;
};

// ── Colour maths ──────────────────────────────────────────────────────────────
const parseHexOrRgb = (v) => {
  if (v.startsWith('#')) {
    const h = v.slice(1);
    const hh = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
    const n = parseInt(hh, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255, a: 1 };
  }
  const m = v.match(/^rgba?\(([^)]+)\)$/);
  if (m) {
    const p = m[1].split(/[,/]/).map((s) => parseFloat(s));
    return { r: p[0], g: p[1], b: p[2], a: p[3] === undefined ? 1 : p[3] };
  }
  return null;
};

// Split a comma list at top level only — color-mix nests commas inside parens.
const splitTop = (s) => {
  const out = [];
  let depth = 0;
  let cur = '';
  for (const ch of s) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === ',' && depth === 0) { out.push(cur.trim()); cur = ''; continue; }
    cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
};

// Split `var(--x, fallback)` respecting nesting.
const parseVar = (v) => {
  const m = v.match(/^var\(\s*(--[a-z0-9-]+)\s*(?:,([\s\S]*))?\)$/);
  if (!m) return null;
  return { name: m[1].slice(2), fallback: m[2] === undefined ? null : m[2].trim() };
};

// Evaluate a percentage that may be a literal or calc(N% * var(--tint-x, 0)).
const evalPercent = (p, map, ctx) => {
  p = p.trim();
  let m = p.match(/^([\d.]+)%$/);
  if (m) return parseFloat(m[1]);
  m = p.match(/^calc\(\s*([\d.]+)%\s*\*\s*(.+?)\s*\)$/);
  if (m) {
    const base = parseFloat(m[1]);
    const mult = evalNumber(m[2], map, ctx);
    return mult == null ? null : base * mult;
  }
  return null;
};

// Evaluate a bare number, possibly behind a var() with a fallback (the tint
// multipliers are exactly this shape).
const evalNumber = (v, map, ctx, depth = 0) => {
  if (depth > 8) return null;
  v = v.trim();
  if (/^[\d.]+$/.test(v)) return parseFloat(v);
  const pv = parseVar(v);
  if (pv) {
    const raw = map[pv.name];
    if (raw !== undefined && raw !== '') return evalNumber(raw, map, ctx, depth + 1);
    if (pv.fallback != null) return evalNumber(pv.fallback, map, ctx, depth + 1);
    return null;
  }
  return null;
};

const mixSrgb = (a, b, p) => {
  // CSS color-mix(in srgb, A p%, B) interpolates the gamma-encoded components,
  // so a plain component lerp is correct here — no linearisation.
  const w = p / 100;
  return {
    r: a.r * w + b.r * (1 - w),
    g: a.g * w + b.g * (1 - w),
    b: a.b * w + b.b * (1 - w),
    a: a.a * w + b.a * (1 - w),
  };
};

// Resolve any token value to RGBA, following var() chains and evaluating
// color-mix(). Returns null for gradients and anything genuinely non-colour.
const resolveValue = (raw, map, ctx, depth = 0) => {
  if (raw == null || depth > 12) return null;
  const v = String(raw).trim();
  if (!v) return null;

  const direct = parseHexOrRgb(v);
  if (direct) return direct;

  const pv = parseVar(v);
  if (pv) {
    const next = map[pv.name];
    if (next !== undefined && next !== '') return resolveValue(next, map, ctx, depth + 1);
    if (pv.fallback != null) return resolveValue(pv.fallback, map, ctx, depth + 1);
    return null;
  }

  const cm = v.match(/^color-mix\(\s*in\s+srgb\s*,([\s\S]+)\)$/);
  if (cm) {
    const parts = splitTop(cm[1]);
    if (parts.length !== 2) return null;
    // First part is "<color> <pct>", second is "<color>" (optionally with a pct).
    // Split at the LAST DEPTH-0 SPACE. A regex for a trailing calc(...) looks
    // right and is not: on the sidebar's nested double mix it swallowed the
    // inner color-mix as the percentage, and the whole token then resolved to
    // null and was silently SKIPPED. A fully-parenthesised value has no depth-0
    // space at all, which is exactly the signal that it carries no percentage.
    const splitColorPct = (s) => {
      let depth = 0;
      let cut = -1;
      for (let i = 0; i < s.length; i++) {
        const ch = s[i];
        if (ch === '(') depth++;
        else if (ch === ')') depth--;
        else if (depth === 0 && /\s/.test(ch)) cut = i;
      }
      if (cut < 0) return { color: s.trim(), pct: null };
      const pct = s.slice(cut + 1).trim();
      if (!/^(calc\(|[\d.]+%$)/.test(pct)) return { color: s.trim(), pct: null };
      return { color: s.slice(0, cut).trim(), pct };
    };
    const A = splitColorPct(parts[0]);
    const B = splitColorPct(parts[1]);
    const ca = resolveValue(A.color, map, ctx, depth + 1);
    const cb = resolveValue(B.color, map, ctx, depth + 1);
    if (!ca || !cb) return null;
    let pa = A.pct != null ? evalPercent(A.pct, map, ctx) : null;
    if (pa == null && B.pct != null) {
      const pb = evalPercent(B.pct, map, ctx);
      pa = pb == null ? null : 100 - pb;
    }
    if (pa == null) pa = 50;
    return mixSrgb(ca, cb, Math.max(0, Math.min(100, pa)));
  }

  return null; // gradient / unsupported
};

const composite = (fg, bg) =>
  fg.a >= 1
    ? { r: fg.r, g: fg.g, b: fg.b }
    : {
        r: fg.r * fg.a + bg.r * (1 - fg.a),
        g: fg.g * fg.a + bg.g * (1 - fg.a),
        b: fg.b * fg.a + bg.b * (1 - fg.a),
      };
const lin = (c) => {
  c /= 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
};
const lum = ({ r, g, b }) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const contrast = (fg, bg) => {
  const l1 = lum(fg);
  const l2 = lum(bg);
  const hi = Math.max(l1, l2);
  const lo = Math.min(l1, l2);
  return (hi + 0.05) / (lo + 0.05);
};

const resolveToken = (map, ctx, token, over) => {
  const raw = resolveValue(map[token], map, ctx);
  if (!raw) return { color: null, unresolved: token };
  if (raw.a >= 1) return { color: raw };
  const base = over ? resolveValue(map[over], map, ctx) : null;
  if (!base) return { color: null, unresolved: `${token} (translucent, no base)` };
  return { color: composite(raw, base) };
};

// ── The pairings the components use ───────────────────────────────────────────
// { text, surface, over? }  — `over` composites a tint over a base surface first.
const PAIRINGS = [
  // Text on the neutral surfaces
  ['foreground', 'background'],
  ['muted-foreground', 'background'],
  ['foreground', 'card'],
  ['muted-foreground', 'card'],
  ['foreground', 'muted'],
  // Guard only — no component puts muted text on --muted now (fills/tiles carry
  // no small text). That claim was NOT true when it was written: Tabs' tablist
  // was --muted with --muted-foreground triggers on it, at 5.1:1, and was simply
  // missed by the 2026-07-21 sweep. Fixed 2026-08-26 by moving the list to
  // --accent. Keep the guard so the next such surface trips it.
  ['muted-foreground', 'muted'],
  ['secondary-foreground', 'secondary'],
  ['muted-foreground', 'secondary'], // Alert desc, Banner desc, Item muted, Avatar initials, Kbd — moved here off --muted for headroom
  ['popover-foreground', 'popover'],
  ['muted-foreground', 'popover'],
  ['accent-foreground', 'accent'],
  ['muted-foreground', 'accent'], // Tabs tablist triggers (default variant) — moved here off --muted 2026-08-26
  ['sidebar-foreground', 'sidebar'],
  ['muted-foreground', 'sidebar'],
  ['tooltip-foreground', 'tooltip-background'],
  // Avatar fallback initials on their own disc. Added 2026-08-05 with the token:
  // the disc used to be --secondary, which is 1.23:1 against --card in light and
  // 1.00:1 in dark — invisible on a Card or a HoverCard. Its VISIBILITY against
  // the surfaces around it is not checkable here (this file measures text on a
  // surface, not surface on surface); the derivation is recorded in tokens.scss.
  ['avatar-foreground', 'avatar-background'],
  // Text on solid brand / semantic fills
  ['primary-foreground', 'primary'],
  ['error-foreground', 'error'],
  ['success-foreground', 'success'],
  ['warning-foreground', 'warning'],
  ['info-foreground', 'info'],
  // Coloured text on the -light tint (Alert informational variants), tint over --background
  ['error', 'error-light', 'background'],
  ['success', 'success-light', 'background'],
  ['warning', 'warning-light', 'background'],
  ['info', 'info-light', 'background'],
  // Category `-text` on its own `-bg` tint (tags / labels / table cells), tint over --background
  ...['amber','blue','cyan','emerald','fuchsia','green','indigo','orange','pink','purple','red','rose','sky','teal','violet'].map(
    (c) => [`category-${c}-text`, `category-${c}-bg`, 'background'],
  ),
  // NOTE: solid category badges (vivid --category-{c} fill + inverted --category-foreground,
  // white in light / dark in dark) are intentionally NOT gated here — white on the lighter
  // hues dips under AA in light mode, an owner-accepted tradeoff. The soft `-text`-on-`-bg`
  // tags above ARE the strictly-AA-safe path.
  // Syntax-highlighting palette on the code-block surface. Nothing renders these yet —
  // the library ships no tokenizer — but they are gated so the palette is usable the day
  // one is added, rather than discovered to be unreadable at that point.
  ...['keyword','string','comment','function','number','variable','type','built-in','attr','selector','tag'].map(
    (t) => [`code-${t}`, 'code-block'],
  ),
  // Themed text on themed surfaces. --primary-text is the on-surface primary; it is
  // what outline/link buttons, Badge outline and brand Alert titles render, and it is
  // the pairing the whole --primary-text token was introduced to make pass.
  ['primary-text', 'background'],
  ['primary-text', 'card'],
  // Aiden's on-surface text — the analogue of --primary-text for the standalone
  // `variant="aiden"` (outline / secondary / link text). Before this token those
  // read raw --aiden-outline-border, which measured ~3.84:1 in light — under AA
  // and recorded as an open gap since 2026-07-21. Gated across EVERY context, not
  // just the aiden surface, because a standalone aiden button can sit on any page,
  // including a brand-tinted one.
  ['aiden-text', 'background'],
  ['aiden-text', 'card'],
  ['aiden-text', 'secondary'],
];

// ── Contexts ──────────────────────────────────────────────────────────────────
// Untinted contexts are enumerated for every brand; the tint axes are only worth
// crossing when there IS a brand, because --tint-stock derives from --primary-deep.
const CONTEXTS = [];
for (const mode of ['light', 'dark']) {
  CONTEXTS.push({ mode, theme: null, surface: null, tintPage: 0, tintRail: 0, label: `${mode} / no theme` });
  for (const theme of BRANDS) {
    for (const tintPage of [0, 1]) {
      for (const tintRail of [0, 1]) {
        const tintLabel = tintPage || tintRail
          ? ` / tint ${[tintPage && 'page', tintRail && 'rail'].filter(Boolean).join('+')}`
          : '';
        CONTEXTS.push({ mode, theme, surface: null, tintPage, tintRail, label: `${mode} / ${theme}${tintLabel}` });
      }
    }
  }
  CONTEXTS.push({ mode, theme: null, surface: 'aiden', tintPage: 0, tintRail: 0, label: `${mode} / aiden surface` });
}
const MAPS = new Map(CONTEXTS.map((c) => [c.label, buildMap(c)]));

// ── Run ───────────────────────────────────────────────────────────────────────
const rows = [];
const failures = [];
const unresolved = new Set();

for (const [text, surface, over] of PAIRINGS) {
  const label = `${text} on ${surface}${over ? ` (over ${over})` : ''}`;
  let worst = null;
  let worstCtx = null;
  let measured = 0;

  for (const ctx of CONTEXTS) {
    const map = MAPS.get(ctx.label);
    const t = resolveToken(map, ctx, text, over);
    const s = over ? resolveToken(map, ctx, surface, over) : resolveToken(map, ctx, surface);
    if (!t.color || !s.color) {
      unresolved.add(`${label} [${ctx.label}]: ${t.unresolved || s.unresolved}`);
      continue;
    }
    measured++;
    const c = Math.round(contrast(t.color, s.color) * 100) / 100;
    if (worst == null || c < worst) { worst = c; worstCtx = ctx.label; }
  }

  rows.push({ label, worst, worstCtx, measured });
  if (worst != null && worst < AA) failures.push({ label, worst, worstCtx });
  // A pairing that resolves in SOME contexts may legitimately skip the rest
  // (e.g. brand-scoped tokens outside a brand). A pairing that resolves in NO
  // context is a missing or misspelled token, and skipping it is
  // indistinguishable from passing — the exact failure mode the deeper-theming
  // merge recorded. Fail loudly instead.
  if (measured === 0) failures.push({ label, worst: 'unresolvable in every context', worstCtx: 'token missing or misspelled?' });
}

// ── Report ────────────────────────────────────────────────────────────────────
const pad = (s, n) => String(s).padEnd(n);
const pads = (s, n) => String(s).padStart(n);
console.log(`\nDesign-token contrast check  (AA ≥ ${AA}, AAA ≥ ${AAA})`);
console.log(`${CONTEXTS.length} contexts · brands: ${BRANDS.join(' ') || '(none)'}\n`);
console.log(pad('pairing (text on surface)', 46) + pads('ctx', 5) + pads('worst', 7) + '  verdict   worst context');
console.log('─'.repeat(46 + 5 + 7 + 10 + 24));
for (const r of rows) {
  const verdict =
    r.worst == null ? '— unresolved' : r.worst < AA ? 'FAIL AA' : r.worst < AAA ? 'AA     ' : 'AAA    ';
  console.log(
    pad(r.label, 46) + pads(r.measured, 5) + pads(r.worst ?? '—', 7) + '  ' + verdict + '  ' + (r.worstCtx ?? ''),
  );
}

const warns = rows.filter((r) => r.worst != null && r.worst >= AA && r.worst < AAA);
console.log(
  `\n${rows.length} pairings × ${CONTEXTS.length} contexts · ${failures.length} below AA · ${warns.length} AA-but-not-AAA`,
);
if (unresolved.size) {
  console.log(`\nNote: ${unresolved.size} pairing/context combination(s) not statically resolvable and skipped.`);
  if (process.env.CONTRAST_VERBOSE) for (const u of unresolved) console.log(`   · ${u}`);
  else console.log('   (set CONTRAST_VERBOSE=1 to list them)');
}

if (failures.length) {
  console.error('\n✗ FAIL — the following pairings drop below WCAG AA (4.5:1):');
  for (const f of failures) console.error(`   • ${f.label}: ${f.worst}:1  [${f.worstCtx}]`);
  process.exit(1);
}
console.log('\n✓ PASS — every checked pairing clears WCAG AA in every context.');
