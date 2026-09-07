#!/usr/bin/env node
// Generates the semantic spacing block in src/styles/tokens.scss from the recipe in
// src/styles/spacingRecipe.ts, so the fluid clamp() arithmetic is never hand-transcribed.
//
//   node --experimental-strip-types scripts/generate-spacing-tokens.mjs          # write
//   node --experimental-strip-types scripts/generate-spacing-tokens.mjs --check  # diff only, exit 1 on drift
//
// ── WHY A GENERATOR ──────────────────────────────────────────────────────
// A fluid token is clamp(min, A rem + B unit, max) with A and B solved so the middle
// term equals the floor at FLUID.min and the ceiling at FLUID.max. Solving that by hand
// for the density × role pairs is exactly the work that drifts silently; --check makes
// drift a build error. Same reasoning as generate-brand-tokens.mjs.
//
// The rem term is load-bearing: a pure vw expression ignores browser zoom and fails
// WCAG 1.4.4. Do not "simplify" it away.

import { readFileSync, writeFileSync } from 'node:fs';
import { ROLES, FLUID, valueOf } from '../src/styles/spacingRecipe.ts';

const TOKENS_PATH = new URL('../src/styles/tokens.scss', import.meta.url);
const BEGIN = '/* @generated spacing-semantic — do not hand-edit; run scripts/generate-spacing-tokens.mjs */';
const END = '/* @end spacing-semantic */';

// px → primitive rung. Every role endpoint MUST be on this ramp.
const RUNG = { 4: '--p-1', 8: '--p-2', 12: '--p-3', 16: '--p-4', 20: '--p-5', 24: '--p-6', 28: '--p-7', 32: '--p-8', 40: '--p-10', 48: '--p-12', 64: '--p-16' };

const rung = (px) => {
  if (!(px in RUNG)) { console.error(`✖ ${px}px is not a primitive rung; every role endpoint must be on the ramp`); process.exit(2); }
  return `var(${RUNG[px]})`;
};
const trim = (n) => Number(n.toFixed(4)).toString();

/** clamp(floor, A rem + B unit, ceiling), solved against FLUID.min/max. */
export const fluidValue = (min, max, unit) => {
  const slopePerPx = (max - min) / (FLUID.max - FLUID.min); // px of gap per px of width
  const B = slopePerPx * 100;                                 // per 1vw / 1cqi
  const A = (min - slopePerPx * FLUID.min) / 16;              // px → rem
  return `clamp(${rung(min)}, ${trim(A)}rem + ${trim(B)}${unit}, ${rung(max)})`;
};

const css = (role, density) => {
  const v = valueOf(role, density);
  return Array.isArray(v) ? fluidValue(v[0], v[1], role.unit) : rung(v);
};

function emit() {
  const line = (r, d) => `  --space-${r.name}: ${css(r, d)};`;
  const moved = ROLES.filter((r) => !('all' in r));
  const scope = (d) => [`[data-density='${d}'] {`, ...moved.map((r) => line(r, d)), '}'];
  return [
    BEGIN,
    '',
    '/* Semantic spacing: roles over the primitive ramp. Three families — inline (side by',
    '   side), stack (one above another), inset (inside a container). Absence of',
    '   data-density is balanced. Six layout-level roles are fluid: they slide between',
    `   two rungs from ${FLUID.min}px to ${FLUID.max}px of viewport (vw) or container (cqi)`,
    '   width; the rem term keeps zoom working. Rules: docs/spacing.md. */',
    ':root {',
    '  /* The widths every fluid role is solved against — for reading, not arithmetic. */',
    `  --fluid-min-width: ${FLUID.min}px;`,
    `  --fluid-max-width: ${FLUID.max}px;`,
    ...ROLES.map((r) => `  /* ${r.job} */\n${line(r, 'balanced')}`),
    '}',
    '',
    '/* Density retargets inset and inline one rung; stack never moves (rule 5). */',
    ...scope('compact'),
    ...scope('spacious'),
    '',
    END,
  ].join('\n');
}

const check = process.argv.includes('--check');
const src = readFileSync(TOKENS_PATH, 'utf8');
const b = src.indexOf(BEGIN), e = src.indexOf(END);
if (b === -1 || e === -1 || e < b) { console.error('✖ tokens.scss is missing the @generated spacing-semantic … @end markers'); process.exit(2); }
const next = src.slice(0, b) + emit() + src.slice(e + END.length);
if (next === src) { console.log('✓ spacing-semantic block is up to date'); process.exit(0); }
if (check) { console.error('✖ spacing-semantic block has drifted from the recipe; run `npm run tokens:gen`'); process.exit(1); }
writeFileSync(TOKENS_PATH, next);
console.log('✓ wrote spacing-semantic block');
