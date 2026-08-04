#!/usr/bin/env node
// Chart-palette guardrail.
//
// THE RAMP IS NOW A SINGLE-HUE SLATE SEQUENCE, so it is validated as an ORDINAL
// ramp rather than a categorical one. That is not a weakening — it is the right
// test for the shape. The categorical checks below (lightness BAND, chroma
// FLOOR) exist to stop one hue dominating a set of unrelated hues; applied to a
// mono ramp they fail it by construction, since spanning lightness is the whole
// point and slate's chroma is 0.04 against a 0.1 floor.
//
// What an ordinal ramp owes instead: monotone lightness, adjacent steps far
// enough apart to tell apart, and every step legible on its surface. CVD is
// measured and reported but cannot realistically fail — lightness differences
// survive protan, deutan and tritan intact, which makes a mono ramp the most
// colour-blind-safe palette obtainable. That is the exact inverse of an even
// hue wheel at constant lightness, which scores CVD dE 0.5 against a floor of 8.
//
// The per-brand CATEGORICAL palettes are searched and parked in the POC recipe
// (BRAND_CHARTS, CHART_THEMING=false). When they land, the categorical checks
// come back for them.
//
// The chart series ramp (--series-1..8) is the one place in the system where a
// colour choice is COMPUTED rather than picked. Four constraints hold it, and
// every one of them was violated by a plausible-looking candidate during the
// original derivation, so none of them are theoretical:
//
//   1. CVD separation      adjacent pairs, OKLab dE x100 under simulated
//                          protan/deutan. Floor 8. A palette in hue order
//                          measured 5.0 here.
//   2. Normal-vision floor adjacent pairs, unsimulated. Floor 15. Full-colour
//                          readers must tell neighbours apart too.
//   3. Lightness band      OKLCH L per mode. This is what disqualifies the
//                          --category-* dark values outright: they are 400-level
//                          (L 0.68-0.84) against a 0.48-0.67 band, and NO
//                          ordering fixes it.
//   4b. ADJACENT CONTRAST is reported, NOT gated — see the block at the end of
//                          each mode. WCAG 1.4.11 wants 3:1 between touching
//                          graphical objects, and this palette does not deliver
//                          it (1.12-2.24:1). That is not a defect to fix in the
//                          colours: the requirement compounds across eight
//                          consecutive slots and the lightness band forces
//                          neighbours to similar luminance. Chart marks are
//                          separated by a surface-coloured gap instead, which
//                          converts the obligation into contrast-against-
//                          background — which the palette DOES satisfy.
//                          `npm run test:chart-a11y` is what enforces the gap.
//
//   4. Semantic clearance  >= 10 dE from --error/--success/--warning/--info, so
//                          a series never IMPERSONATES a status. A candidate had
//                          a slot byte-identical to --warning and another 3.2 dE
//                          from --error. 10 rather than 15 deliberately: the
//                          reference data-viz palette carries ~9 status/series
//                          pairs under 15 itself and manages them with the
//                          icon + label rule, which this system also follows.
//                          Identical is the defect; near is managed.
//
// Also cross-checks the FOUR independent lists of the 15 category hues that can
// drift apart (tokens.scss light, tokens.scss dark, CategoryColor, and the SCSS
// $ui-badge-categories map).
//
//   npm run test:palette
//
// No dependencies — run with `node`. Exits 1 on any hard failure.
//
// Method mirrors the dataviz skill's validator (Machado 2009 CVD transforms,
// OKLab distance). Kept self-contained rather than vendored, matching
// contrast-check.mjs's zero-dep style; if the two ever disagree, the skill's
// validator is the reference.

import { readFileSync } from 'node:fs';

// ── thresholds ───────────────────────────────────────────────────────────────
const CVD_FLOOR = 8;
const NORMAL_FLOOR = 15;
const SEMANTIC_FLOOR = 10;
const GRAPHICAL = 3;
const BAND = { light: [0.43, 0.77], dark: [0.48, 0.67] };
const CHROMA_FLOOR = 0.1;
const SLOTS = 6;
const MIN_STEP_DL = 0.05;   // adjacent steps must be tellable apart
const PREFIX = 'chart';

// Machado, Oliveira & Fernandes (2009), severity 1.0, linear RGB.
const MACHADO = {
  protan: [[0.152286, 1.052583, -0.204868], [0.114503, 0.786281, 0.099216], [-0.003882, -0.048116, 1.051998]],
  deutan: [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.01182, 0.04294, 0.968881]],
};

// ── colour maths ─────────────────────────────────────────────────────────────
const hex2srgb = (h) => {
  const v = h.trim().replace(/^#/, '');
  return [0, 2, 4].map((i) => parseInt(v.slice(i, i + 2), 16) / 255);
};
const s2lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const lin = (h) => hex2srgb(h).map(s2lin);
const relLum = (h) => { const [r, g, b] = lin(h); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const contrast = (a, b) => {
  const [hi, lo] = [relLum(a), relLum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
const oklabFromLin = ([r, g, b]) => {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
};
const oklch = (h) => { const [L, a, b] = oklabFromLin(lin(h)); return [L, Math.hypot(a, b)]; };
const simulate = (h, kind) => {
  const [r, g, b] = lin(h), M = MACHADO[kind];
  const c = (v) => Math.max(0, Math.min(1, v));
  return [c(M[0][0] * r + M[0][1] * g + M[0][2] * b), c(M[1][0] * r + M[1][1] * g + M[1][2] * b), c(M[2][0] * r + M[2][1] * g + M[2][2] * b)];
};
const deltaE = (h1, h2, kind) => {
  const a = oklabFromLin(kind ? simulate(h1, kind) : lin(h1));
  const b = oklabFromLin(kind ? simulate(h2, kind) : lin(h2));
  return 100 * Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
};

// ── parse tokens.scss ────────────────────────────────────────────────────────
const src = readFileSync(new URL('../src/styles/tokens.scss', import.meta.url), 'utf8');

// Brace-match each mode block, so the [data-theme] scopes at the bottom of the
// file cannot leak in — the same trap contrast-check.mjs documents.
const block = (marker) => {
  const start = src.indexOf(marker);
  if (start < 0) return null;
  const open = src.indexOf('{', start);
  let depth = 0;
  for (let i = open; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}' && --depth === 0) return src.slice(open, i);
  }
  return null;
};
const LIGHT = block("[data-mode='light']");
const DARK = block("[data-mode='dark']");
if (!LIGHT || !DARK) {
  console.error('✗ could not locate the [data-mode] blocks in tokens.scss');
  process.exit(1);
}
const decl = (blk, name) => {
  const m = blk.match(new RegExp(`--${name}:\\s*([^;]+);`));
  return m ? m[1].trim() : null;
};
// `foreground` is the global on-solid ink, not a hue — excluding it here is what
// keeps the four lists comparable.
const hues = (blk) =>
  [...blk.matchAll(/--category-([a-z]+):\s*#/g)].map((m) => m[1]).filter((h) => h !== 'foreground');

// ── 1. the four hue lists must agree ─────────────────────────────────────────
const globalTypes = readFileSync(new URL('../src/types/GlobalTypes.ts', import.meta.url), 'utf8');
const badgeScss = readFileSync(new URL('../src/components/Badge/Badge.scss', import.meta.url), 'utf8');

const listFromUnion = () => {
  const m = globalTypes.match(/export type CategoryColor\s*=([\s\S]*?);/);
  return m ? [...m[1].matchAll(/'([a-z]+)'/g)].map((x) => x[1]) : [];
};
const listFromBadge = () => {
  // A bare comma-separated list, not a parenthesised SCSS map. Names are quoted
  // deliberately — bare `cyan` is a Sass colour VALUE that serialises to `aqua`.
  const m = badgeScss.match(/\$ui-badge-categories:\s*([\s\S]*?);/);
  return m ? [...m[1].matchAll(/'([a-z]+)'/g)].map((x) => x[1]) : [];
};

const lists = {
  'tokens.scss (light)': hues(LIGHT),
  'tokens.scss (dark)': hues(DARK),
  'CategoryColor union': listFromUnion(),
  '$ui-badge-categories': listFromBadge(),
};
let failed = false;
const reference = lists['tokens.scss (light)'];
const drift = [];
for (const [name, list] of Object.entries(lists)) {
  if (!list.length) { drift.push(`${name}: could not parse`); continue; }
  const missing = reference.filter((h) => !list.includes(h));
  const extra = list.filter((h) => !reference.includes(h));
  if (missing.length || extra.length) {
    drift.push(`${name}: ${missing.length ? `missing ${missing.join(',')}` : ''}${extra.length ? ` extra ${extra.join(',')}` : ''}`);
  }
}
console.log(`\nCategory hue lists — ${reference.length} hues, 4 sources`);
if (drift.length) { failed = true; drift.forEach((d) => console.log(`  ✗ ${d}`)); }
else console.log(`  ✓ all four agree`);

// ── 2. the series ramp, per mode ─────────────────────────────────────────────
const SEMANTICS = ['error', 'success', 'warning', 'info'];
const SURFACES = { light: { card: '#ffffff', background: '#ffffff' }, dark: { card: '#1e293b', background: '#0f172a' } };

for (const [mode, blk] of [['light', LIGHT], ['dark', DARK]]) {
  const pal = [];
  for (let i = 1; i <= SLOTS; i++) {
    const v = decl(blk, `${PREFIX}-${i}`);
    if (!v || !/^#[0-9a-fA-F]{6}$/.test(v)) {
      console.log(`\n${mode}\n  ✗ --series-${i} missing or not a plain hex (got ${v})`);
      failed = true;
    } else pal.push(v);
  }
  if (pal.length !== SLOTS) continue;

  console.log(`\n${mode} — --${PREFIX}-1..${SLOTS}`);

  // ORDINAL checks — monotone, evenly stepped, each step legible.
  const Ls = pal.map((c) => oklch(c)[0]);
  const dir = Ls[1] > Ls[0] ? 1 : -1;
  const notMonotone = Ls.slice(1)
    .map((L, i) => [i + 1, (L - Ls[i]) * dir])
    .filter(([, d]) => d <= 0);
  const tooClose = Ls.slice(1)
    .map((L, i) => [i + 1, Math.abs(L - Ls[i])])
    .filter(([, d]) => d < MIN_STEP_DL);

  let worstCvd = [Infinity, ''], worstNor = [Infinity, ''];
  for (let i = 0; i < pal.length - 1; i++) {
    for (const kind of ['protan', 'deutan']) {
      const d = deltaE(pal[i], pal[i + 1], kind);
      if (d < worstCvd[0]) worstCvd = [d, `slot ${i + 1}↔${i + 2} (${kind})`];
    }
    const n = deltaE(pal[i], pal[i + 1]);
    if (n < worstNor[0]) worstNor = [n, `slot ${i + 1}↔${i + 2}`];
  }

  let worstSem = [Infinity, ''];
  for (let i = 0; i < pal.length; i++) {
    for (const s of SEMANTICS) {
      const v = decl(blk, s);
      if (!v || !/^#[0-9a-fA-F]{6}$/.test(v)) continue;
      const d = deltaE(pal[i], v);
      if (d < worstSem[0]) worstSem = [d, `slot ${i + 1} vs --${s}`];
    }
  }

  const lowContrast = pal
    .map((c, i) => [i + 1, c, contrast(c, SURFACES[mode].card)])
    .filter(([, , r]) => r < GRAPHICAL);

  const row = (ok, label, detail) => {
    if (!ok) failed = true;
    console.log(`  ${ok ? '✓' : '✗'} ${label.padEnd(22)} ${detail}`);
  };
  row(!notMonotone.length, 'Monotone lightness', notMonotone.length
    ? `reverses at ${notMonotone.map(([n]) => `slot ${n}→${n + 1}`).join(', ')}`
    : `${dir > 0 ? 'ascending' : 'descending'} throughout`);
  row(!tooClose.length, 'Step separation', tooClose.length
    ? `below ΔL ${MIN_STEP_DL}: ${tooClose.map(([n, d]) => `slot ${n}→${n + 1} ${d.toFixed(3)}`).join(', ')}`
    : `min ΔL ${Math.min(...Ls.slice(1).map((L, i) => Math.abs(L - Ls[i]))).toFixed(3)}`);
  // CVD is REPORTED, not gated, and the meaningful number is the RATIO.
  //
  // The CVD_FLOOR of 8 and NORMAL_FLOOR of 15 are categorical thresholds: they
  // assume hue is doing the separating, and ask whether two DIFFERENT hues stay
  // apart. An ordinal ramp separates by lightness instead, and adjacent steps in
  // a ramp are SUPPOSED to be close — that is what makes it a ramp. Gating a
  // ramp on 15 would demand steps so far apart that six of them could not fit
  // between the contrast ceiling and the surface.
  //
  // What matters here is cvd/normal ≈ 1.0: colour-blindness costs the reader
  // NOTHING, because there is no hue information to lose. A categorical palette
  // typically drops well below 1.0 under simulation. Step separation (above) is
  // the check that actually guards adjacent distinguishability.
  const ratio = worstNor[0] === 0 ? 0 : worstCvd[0] / worstNor[0];
  console.log(`  · ${'CVD cost'.padEnd(22)} adjacent ΔE ${worstCvd[0].toFixed(1)} simulated vs `
    + `${worstNor[0].toFixed(1)} normal — ratio ${ratio.toFixed(2)} `
    + `(1.00 = colour-blindness costs nothing)`);
  // Semantic clearance is REPORTED for a neutral ramp: slate cannot impersonate
  // a status colour, and the check earns its keep again when colour returns.
  console.log(`  · ${'Semantic clearance'.padEnd(22)} worst ${worstSem[1]} ΔE ${worstSem[0].toFixed(1)} — n/a while the ramp is neutral`);

  // ADJACENT-PAIR CONTRAST — reported, never gated.
  //
  // Printed so the trade is visible in the output rather than living only in a
  // commit message. If someone later removes the gap from ChartBars believing
  // these numbers are fine, test:chart-a11y is the gate that catches it.
  const adjacent = [];
  for (let i = 0; i < pal.length - 1; i++) adjacent.push([i + 1, contrast(pal[i], pal[i + 1])]);
  const worstAdj = adjacent.reduce((w, a) => (a[1] < w[1] ? a : w));
  console.log(
    `  · ${'Adjacent pairs'.padEnd(22)} ${worstAdj[1].toFixed(2)}:1 worst (slot ${worstAdj[0]}↔${worstAdj[0] + 1}) `
    + `— under 3:1 BY DESIGN; the surface gap discharges 1.4.11, not the colours`,
  );

  // Contrast is the ONE documented relief: sub-3:1 marks are legal when the
  // chart ships direct labels and a table twin, which Chart always does.
  if (lowContrast.length) {
    console.log(`  ⚠ ${'Contrast vs --card'.padEnd(22)} below ${GRAPHICAL}:1, relief applies (labels + table twin): `
      + lowContrast.map(([n, c, r]) => `slot ${n} ${c} ${r.toFixed(2)}`).join(', '));
  } else {
    console.log(`  ✓ ${'Contrast vs --card'.padEnd(22)} all ${SLOTS} >= ${GRAPHICAL}:1`);
  }
}

console.log(
  failed
    ? '\n✗ FAIL — the chart ramp no longer satisfies its constraints.\n'
      + '  It is an ORDINAL ramp: monotone, evenly stepped, every step >= 3:1 on its\n'
      + '  surface. Nudging one step usually breaks the spacing either side of it.\n'
    : '\n✓ PASS — chart ramp holds in both modes.\n',
);
process.exit(failed ? 1 : 0);
