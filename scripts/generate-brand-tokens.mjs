#!/usr/bin/env node
// Generates the per-brand token blocks in src/styles/tokens.scss from the POC
// recipe, so ~250 colour literals are never hand-transcribed.
//
//   node --experimental-strip-types scripts/generate-brand-tokens.mjs          # write
//   node --experimental-strip-types scripts/generate-brand-tokens.mjs --check  # diff only, exit 1 on drift
//
// ── WHY A GENERATOR AND NOT A ONE-OFF PASTE ──────────────────────────────────
// The values are solved, not chosen: every brand's anchors came out of the
// recipe's own derivation and were then hand-tuned against contrast gates over
// many sessions. Transcribing them once is a few hours of careful work; keeping
// a transcription correct as the recipe moves is unbounded, and the failure mode
// is silent — a stale hex looks exactly like a fresh one. `--check` makes drift
// a build error instead of something you notice in a screenshot months later.
//
// It reads the recipe's EMITTED `POC_CSS`, not its data tables, so the emitter
// stays the single definition of how an anchor becomes a token. If the recipe
// changes shape, this script fails loudly rather than quietly emitting nonsense.
//
// ── WHAT IT DOES NOT SHIP ────────────────────────────────────────────────────
// Phase A takes the identity tokens and the six categorical chart slots. The
// ordered ramps (--chart-seq-*, --chart-div-*) need a seventh slot and a
// [data-chart-palette] axis in the chart components, so they are Phase B and are
// filtered out here rather than shipped as tokens nothing reads.

import { readFileSync, writeFileSync } from 'node:fs';

const TOKENS_PATH = new URL('../src/styles/tokens.scss', import.meta.url);
// Resolved against this file, not the cwd, so the script runs from anywhere.
const RECIPE_PATH = new URL('../src/prototypes/deeperThemingRecipeV2.ts', import.meta.url).href;

const BEGIN = '/* @generated deeper-theming-v2 — do not hand-edit; run scripts/generate-brand-tokens.mjs */';
const END = '/* @endgenerated */';

// The Phase A token surface. Anything the recipe emits that is not on this list
// is deliberately left in the POC.
const KEEP = new Set([
  'primary-deep',
  'decorative-hi',
  'decorative-deep',
  'decorative-gradient',
  'chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5', 'chart-6',
  'chart-muted',
]);
// --primary / --primary-foreground are NOT in KEEP: they ship as the per-brand
// --{code}-primary anchors in the mode blocks, which the existing [data-theme]
// scopes already read via var(). Emitting them here too would be a second
// declaration of the same value racing the first on source order.
const ANCHOR_KEYS = new Set(['primary', 'primary-foreground']);

const { POC_CSS } = await import(RECIPE_PATH);
if (typeof POC_CSS !== 'string' || POC_CSS.length < 1000) {
  console.error('✗ Could not read POC_CSS from the recipe — has its shape changed?');
  process.exit(2);
}

// ── Pull the per-brand anchor blocks out of POC_CSS ───────────────────────────
// Shape (recipe anchorBlocks()): `[data-theme-poc2][data-brand='X'][data-mode='M'] { … }`
// and the aiden surface variant with [data-surface='aiden'] instead of the brand.
const blockRe =
  /\[data-theme-poc2\](\[data-brand='([a-z0-9-]+)'\]|\[data-surface='aiden'\])\[data-mode='(light|dark)'\]\s*\{([\s\S]*?)\n\}/g;

const found = new Map(); // key -> { light: decls, dark: decls, isSurface }
let m;
while ((m = blockRe.exec(POC_CSS))) {
  const key = m[2] ?? 'aiden';
  const mode = m[3];
  const body = m[4];
  // The selector alone is NOT enough to identify the anchor block. The recipe
  // also emits component overrides under the same
  // `[data-surface='aiden'][data-mode='…']` selector further down, and taking
  // the last match let one of those overwrite aiden's anchors with an empty
  // block — which shipped an aiden scope containing nothing at all. Identify
  // the block by what it DECLARES, and keep the first one that qualifies.
  if (!/--decorative-hi\s*:/.test(body)) continue;
  if (!found.has(key)) found.set(key, { light: null, dark: null, isSurface: key === 'aiden' });
  const rec = found.get(key);
  if (rec[mode] == null) rec[mode] = body;
}
if (!found.size) {
  console.error('✗ No per-brand blocks matched in POC_CSS — the emitter shape changed.');
  process.exit(2);
}

// Parse `--name: value;` allowing multi-line values (the gradient spans lines).
const parseDecls = (body) => {
  const out = [];
  const re = /--([a-z0-9-]+)\s*:\s*([\s\S]*?);/g;
  let d;
  while ((d = re.exec(body))) out.push({ name: d[1], value: d[2].trim().replace(/\s*\n\s*/g, '\n    ') });
  return out;
};

// ── Emit ──────────────────────────────────────────────────────────────────────
// An empty block is the failure mode this generator is most likely to hit and
// least likely to show: it emits valid CSS that declares nothing, so the scope
// silently falls through to the neutral defaults and looks merely "unthemed".
// It already happened once — a component override matched the aiden selector and
// overwrote the anchors — so the emitter refuses to produce one.
const indentBlock = (decls, who) => {
  const kept = decls.filter((d) => KEEP.has(d.name));
  if (!kept.length) {
    console.error(`✗ ${who} produced an EMPTY block — the recipe's shape changed, or the wrong source block matched.`);
    process.exit(2);
  }
  return kept.map((d) => `  --${d.name}: ${d.value};`).join('\n');
};

const anchorsFor = (decls) => {
  const out = {};
  for (const d of decls) if (ANCHOR_KEYS.has(d.name)) out[d.name] = d.value;
  return out;
};

const BRANDS = [...found.keys()].filter((k) => k !== 'aiden').sort();
const anchors = { light: [], dark: [] };
const parts = [BEGIN, ''];

parts.push(
  `/* Per-brand identity + categorical chart slots, generated from`,
  `   src/prototypes/deeperThemingRecipeV2.ts. ${BRANDS.length} brands + the aiden surface.`,
  `   `,
  `   THE LIGHT/DARK SHAPE MIRRORS THE MODE BLOCKS ABOVE. Light rides the bare`,
  `   scope, which is the ':root' equivalent — it is what a page with a theme but`,
  `   no explicit data-mode gets. Dark overrides it from a 2-attribute compound.`,
  `   Light is then re-asserted from its own compound, AFTER dark, so a light`,
  `   subtree nested inside a dark page wins the specificity tie on source order.`,
  `   Both the descendant and same-element forms are emitted because the theme`,
  `   and mode attributes may sit on one element or on two.`,
  `   `,
  `   FIGMA NAMES THESE BY HUE, code names them by product:`,
  `     Slate=main  Indigo=db  Teal=dc  Cobalt=ec  Fern=nb  Amber=ph  Magenta=rm`,
  `   scripts/figma-variable-audit.js cross-checks the two. */`,
  '',
);

for (const key of [...BRANDS, 'aiden']) {
  const rec = found.get(key);
  if (!rec.light || !rec.dark) {
    console.error(`✗ ${key} is missing a ${rec.light ? 'dark' : 'light'} block.`);
    process.exit(2);
  }
  const lightDecls = parseDecls(rec.light);
  const darkDecls = parseDecls(rec.dark);

  if (!rec.isSurface) {
    const la = anchorsFor(lightDecls);
    const da = anchorsFor(darkDecls);
    anchors.light.push(`  --${key}-primary: ${la['primary']};`, `  --${key}-primary-foreground: ${la['primary-foreground']};`);
    anchors.dark.push(`  --${key}-primary: ${da['primary']};`, `  --${key}-primary-foreground: ${da['primary-foreground']};`);
  }

  const sel = rec.isSurface ? `[data-surface='aiden']` : `[data-theme='${key}']`;
  const selDarkDesc = rec.isSurface ? `[data-mode='dark'] [data-surface='aiden']` : `[data-mode='dark'] [data-theme='${key}']`;
  const selDarkSame = rec.isSurface ? `[data-mode='dark'][data-surface='aiden']` : `[data-mode='dark'][data-theme='${key}']`;
  const selLightDesc = rec.isSurface ? `[data-mode='light'] [data-surface='aiden']` : `[data-mode='light'] [data-theme='${key}']`;
  const selLightSame = rec.isSurface ? `[data-mode='light'][data-surface='aiden']` : `[data-mode='light'][data-theme='${key}']`;

  parts.push(
    `${sel} {`,
    indentBlock(lightDecls, ` light`),
    `}`,
    `${selDarkDesc},`,
    `${selDarkSame} {`,
    indentBlock(darkDecls, ` dark`),
    `}`,
    `${selLightDesc},`,
    `${selLightSame} {`,
    indentBlock(lightDecls, ` light`),
    `}`,
    '',
  );
}

parts.push(END);
const generated = parts.join('\n');

// ── Splice into tokens.scss ───────────────────────────────────────────────────
const src = readFileSync(TOKENS_PATH, 'utf8');

// Replace everything from `begin` through the first following `end`, inclusive.
const splice = (text, begin, end, body) => {
  const b = text.indexOf(begin);
  if (b < 0) {
    console.error(`✗ Could not find the marker in tokens.scss:\n    ${begin}`);
    process.exit(2);
  }
  const e = text.indexOf(end, b + begin.length);
  if (e < 0) {
    console.error(`✗ Found ${begin} but no closing ${end} after it.`);
    process.exit(2);
  }
  return text.slice(0, b) + body + text.slice(e + end.length);
};

let next = splice(src, BEGIN, END, generated);

// The mode-block anchors live in their own small regions, indented one level.
for (const [marker, lines] of [
  ['/* @generated brand-anchors:light */', anchors.light],
  ['/* @generated brand-anchors:dark */', anchors.dark],
]) {
  next = splice(next, marker, END, [marker, ...lines, `  ${END}`].join('\n'));
}

const isCheck = process.argv.includes('--check');
if (isCheck) {
  if (next === src) {
    console.log(`✓ tokens.scss matches the recipe (${BRANDS.length} brands + aiden).`);
    process.exit(0);
  }
  console.error('✗ DRIFT — tokens.scss does not match what the recipe emits.');
  console.error('  Run: node --experimental-strip-types scripts/generate-brand-tokens.mjs');
  // Show the first differing line for orientation.
  const a = src.split('\n');
  const z = next.split('\n');
  for (let i = 0; i < Math.max(a.length, z.length); i++) {
    if (a[i] !== z[i]) {
      console.error(`  first difference at line ${i + 1}:`);
      console.error(`    file:   ${a[i] ?? '(eof)'}`);
      console.error(`    recipe: ${z[i] ?? '(eof)'}`);
      break;
    }
  }
  process.exit(1);
}

writeFileSync(TOKENS_PATH, next);
console.log(`✓ Wrote ${BRANDS.length} brand blocks + aiden into tokens.scss.`);
console.log(`  brands: ${BRANDS.join(' ')}`);
