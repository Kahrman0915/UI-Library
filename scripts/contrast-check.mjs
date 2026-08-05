#!/usr/bin/env node
// Contrast guardrail for the design tokens.
//
// Parses src/styles/tokens.scss, resolves the light + dark values, and checks
// the WCAG contrast of every text-on-surface pairing the components actually
// use. Fails (exit 1) if any pairing drops below AA (4.5:1); warns for pairings
// that pass AA but not AAA (7:1). No dependencies — run with `node`.
//
//   npm run test:contrast
//
// Add a pairing here whenever a component puts a `-foreground`/text token on a
// new surface. Tint surfaces (e.g. `error-light`) are composited over `--background`
// before the text is measured, matching how Alerts render.

import { readFileSync } from 'node:fs';

const AA = 4.5;
const AAA = 7;

const src = readFileSync(new URL('../src/styles/tokens.scss', import.meta.url), 'utf8');

// ── Parse the light + dark blocks into { token: rawValue } maps ───────────────
// Brace-match each mode block so we read ONLY its core declarations. Slicing to
// end-of-file would swallow the `[data-theme]` scopes at the bottom, whose
// `--primary: var(--dr-primary)` would overwrite the real dark value.
const extractBlock = (marker) => {
  const start = src.indexOf(marker);
  if (start < 0) return null;
  const open = src.indexOf('{', start);
  let depth = 0;
  let i = open;
  for (; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}' && --depth === 0) break;
  }
  return src.slice(open + 1, i);
};
const parseBlock = (block) => {
  const map = {};
  const re = /--([a-z0-9-]+):\s*([^;]+);/g;
  let m;
  while ((m = re.exec(block))) map[m[1]] = m[2].trim();
  return map;
};
const lightBlock = extractBlock("[data-mode='light']");
const darkBlock = extractBlock("[data-mode='dark']");
if (!lightBlock || !darkBlock) {
  console.error('Could not find [data-mode] blocks in tokens.scss');
  process.exit(2);
}
const MODES = { light: parseBlock(lightBlock), dark: parseBlock(darkBlock) };

// ── Colour helpers ────────────────────────────────────────────────────────────
const toRGBA = (v) => {
  if (!v) return null;
  v = v.trim();
  if (v.startsWith('#')) {
    const h = v.slice(1);
    const hh = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
    const n = parseInt(hh, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255, a: 1 };
  }
  const m = v.match(/rgba?\(([^)]+)\)/);
  if (m) {
    const p = m[1].split(',').map((s) => parseFloat(s));
    return { r: p[0], g: p[1], b: p[2], a: p[3] === undefined ? 1 : p[3] };
  }
  return null; // color-mix() / gradient / var() — not statically resolvable
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

// Resolve a token to an opaque colour in a mode, optionally compositing a
// translucent tint over a base surface first.
const resolve = (mode, token, over) => {
  const raw = toRGBA(MODES[mode][token]);
  if (!raw) return { color: null, unresolved: token };
  if (raw.a >= 1) return { color: raw };
  const base = over ? toRGBA(MODES[mode][over]) : null;
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
  ['muted-foreground', 'muted'], // guard only — no component puts muted text on --muted now (fills/tiles have no small text)
  ['secondary-foreground', 'secondary'],
  ['muted-foreground', 'secondary'], // Alert desc, Banner desc, Item muted, Avatar initials, Kbd — moved here off --muted for headroom
  ['popover-foreground', 'popover'],
  ['muted-foreground', 'popover'],
  ['accent-foreground', 'accent'],
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
];

// ── Run ───────────────────────────────────────────────────────────────────────
const rows = [];
const failures = [];
const unresolved = [];

for (const [text, surface, over] of PAIRINGS) {
  const perMode = {};
  for (const mode of ['light', 'dark']) {
    const t = resolve(mode, text, over);
    const s = over ? resolve(mode, surface, over) : resolve(mode, surface);
    if (!t.color || !s.color) {
      unresolved.push(`${text} on ${surface} (${mode}): ${t.unresolved || s.unresolved}`);
      perMode[mode] = null;
      continue;
    }
    perMode[mode] = Math.round(contrast(t.color, s.color) * 100) / 100;
  }
  const measured = Object.values(perMode).filter((v) => v != null);
  const worst = measured.length ? Math.min(...measured) : null;
  const label = `${text} on ${surface}${over ? ` (over ${over})` : ''}`;
  rows.push({ label, light: perMode.light, dark: perMode.dark, worst });
  if (worst != null && worst < AA) failures.push({ label, worst });
}

// ── Report ────────────────────────────────────────────────────────────────────
const pad = (s, n) => String(s).padEnd(n);
const pads = (s, n) => String(s).padStart(n);
console.log(`\nDesign-token contrast check  (AA ≥ ${AA}, AAA ≥ ${AAA})\n`);
console.log(pad('pairing (text on surface)', 46) + pads('light', 7) + pads('dark', 7) + '  verdict');
console.log('─'.repeat(46 + 7 + 7 + 10));
for (const r of rows) {
  const verdict =
    r.worst == null ? '— unresolved' : r.worst < AA ? 'FAIL AA' : r.worst < AAA ? 'AA' : 'AAA';
  console.log(pad(r.label, 46) + pads(r.light ?? '—', 7) + pads(r.dark ?? '—', 7) + '  ' + verdict);
}

const warns = rows.filter((r) => r.worst != null && r.worst >= AA && r.worst < AAA);
console.log(`\n${rows.length} pairings checked · ${failures.length} below AA · ${warns.length} AA-but-not-AAA`);
if (unresolved.length) {
  console.log(`\nNote: ${unresolved.length} value(s) not statically resolvable (color-mix/gradient) and skipped.`);
}

if (failures.length) {
  console.error('\n✗ FAIL — the following pairings drop below WCAG AA (4.5:1):');
  for (const f of failures) console.error(`   • ${f.label}: ${f.worst}:1`);
  process.exit(1);
}
console.log('\n✓ PASS — every checked pairing clears WCAG AA.');
