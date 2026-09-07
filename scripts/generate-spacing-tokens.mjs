#!/usr/bin/env node
// Generates the spacing-ladder block in src/styles/tokens.scss from the recipe in
// src/styles/spacingRecipe.ts, so the fluid clamp() arithmetic is never hand-transcribed.
//
//   node --experimental-strip-types scripts/generate-spacing-tokens.mjs          # write
//   node --experimental-strip-types scripts/generate-spacing-tokens.mjs --check  # diff only, exit 1 on drift
//
// Each level is clamp(small, A rem + B vw, large), solved so the middle term equals the
// small-ladder value at FLUID.min and the large-ladder value at FLUID.max. Every level
// slides on the same width, so the ladder stays in proportion at every size. A level
// whose two values are equal (micro) is emitted as a plain rung. The rem term is
// load-bearing: a pure vw expression ignores browser zoom and fails WCAG 1.4.4.

import { readFileSync, writeFileSync } from 'node:fs';
import { LEVELS, LADDER, FLUID } from '../src/styles/spacingRecipe.ts';

const TOKENS_PATH = new URL('../src/styles/tokens.scss', import.meta.url);
const BEGIN = '/* @generated spacing-semantic — do not hand-edit; run scripts/generate-spacing-tokens.mjs */';
const END = '/* @end spacing-semantic */';

// px → primitive rung. Every ladder value MUST be on this ramp.
const RUNG = { 2: '--p-0-5', 4: '--p-1', 6: '--p-1-5', 8: '--p-2', 12: '--p-3', 16: '--p-4', 20: '--p-5', 24: '--p-6', 32: '--p-8', 36: '--p-9', 40: '--p-10', 48: '--p-12', 64: '--p-16' };
const rung = (px) => { if (!(px in RUNG)) { console.error(`✖ ${px}px is not a primitive rung`); process.exit(2); } return `var(${RUNG[px]})`; };
const trim = (n) => Number(n.toFixed(4)).toString();

export const value = ([small, large]) => {
  if (small === large) return rung(small);
  const slope = (large - small) / (FLUID.max - FLUID.min);
  return `clamp(${rung(small)}, ${trim((small - slope * FLUID.min) / 16)}rem + ${trim(slope * 100)}vw, ${rung(large)})`;
};

function emit() {
  const block = (density, indent = '  ') => LEVELS.map((l) => `${indent}/* L${l.n} ${l.name}: ${l.job} */\n${indent}--space-${l.n}: ${value(LADDER[density][l.n])};`);
  return [
    BEGIN, '',
    '/* The spacing LADDER. Five levels assigned by hierarchy — a container\'s gap or padding',
    '   is a level, each level down is one step down. The whole ladder slides with viewport',
    `   width from ${FLUID.min}px to ${FLUID.max}px and reshapes per data-density; absence is`,
    '   balanced. In Figma: space/N-name with the Space (density) and Space · width modes.',
    '   Rules: docs/spacing.md. */',
    ':root {',
    `  --fluid-min-width: ${FLUID.min}px;`,
    `  --fluid-max-width: ${FLUID.max}px;`,
    ...block('balanced'),
    '}', '',
    '/* Density reshapes the whole ladder (owner\'s tables). */',
    `[data-density='compact'] {`, ...block('compact'), '}',
    `[data-density='spacious'] {`, ...block('spacious'), '}',
    '', END,
  ].join('\n');
}

const check = process.argv.includes('--check');
const src = readFileSync(TOKENS_PATH, 'utf8');
const b = src.indexOf(BEGIN), e = src.indexOf(END);
if (b === -1 || e === -1 || e < b) { console.error('✖ tokens.scss is missing the @generated spacing-semantic … @end markers'); process.exit(2); }
const next = src.slice(0, b) + emit() + src.slice(e + END.length);
if (next === src) { console.log('✓ spacing ladder block is up to date'); process.exit(0); }
if (check) { console.error('✖ spacing ladder block has drifted from the recipe; run `npm run tokens:gen`'); process.exit(1); }
writeFileSync(TOKENS_PATH, next);
console.log('✓ wrote spacing ladder block');
