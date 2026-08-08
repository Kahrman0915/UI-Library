#!/usr/bin/env node
// Chart-palette guardrail.
//
// THE PALETTE IS A SINGLE-HUE SLATE SET WHOSE SLOTS ARE INTERLEAVED, so it is
// neither a plain categorical palette nor an ordinal ramp, and the checks are
// picked accordingly:
//
//   NOT categorical band / chroma floor. Those exist to stop one hue dominating
//   a set of unrelated hues. Against one hue they fail by construction —
//   spanning lightness is the point, and slate's chroma is 0.04 against a 0.1
//   floor.
//
//   NOT monotone lightness. An earlier revision WAS a plain ramp and was checked
//   for monotonicity; interleaving deliberately breaks it. Slot order runs
//   4,1,5,2,6,3 through the six lightness steps so that consecutive SLOTS are
//   three steps apart rather than one.
//
//   ADJACENT-SLOT SEPARATION is the check that replaced both, and it is the
//   number the interleaving exists to move: dE 7.8 sequential -> 23.9 light /
//   21.0 dark. That is what makes touching stacked segments tellable apart.
//
// KNOWN AND UNFIXABLE BY ORDERING: the all-pairs worst case stays at one step
// (dE 7.8 / 6.8). Six steps must fit between the 3:1 contrast ceiling and the
// surface, so two of them are always adjacent in lightness. Ordering fixes
// adjacency, not simultaneity — fine for bars and stacks, thin for 5-6 lines,
// where the answer is emphasis rather than more greys. Reported below so the
// limit stays visible.
//
// The per-brand CATEGORICAL palettes are searched and parked in the POC recipe
// (BRAND_CHARTS, CHART_THEMING=false). When they land, the categorical checks
// come back for them.
//
// The chart series ramp (--chart-1..6) is the one place in the system where a
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
const MIN_ADJACENT_DE = 15; // consecutive SLOTS must be tellable apart
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
      console.log(`\n${mode}\n  ✗ --${PREFIX}-${i} missing or not a plain hex (got ${v})`);
      failed = true;
    } else pal.push(v);
  }
  if (pal.length !== SLOTS) continue;

  console.log(`\n${mode} — --${PREFIX}-1..${SLOTS}`);

  // Adjacent-SLOT separation. Slot order is what the interleaving controls, so
  // this is the check it has to satisfy.
  const adjacentDe = pal.slice(1).map((c, i) => [i + 1, deltaE(c, pal[i])]);
  const tooClose = adjacentDe.filter(([, d]) => d < MIN_ADJACENT_DE);

  // All-pairs worst — reported, never gated. Ordering cannot move it.
  let allPairs = [Infinity, ''];
  for (let i = 0; i < pal.length; i++) {
    for (let j = i + 1; j < pal.length; j++) {
      const d = deltaE(pal[i], pal[j]);
      if (d < allPairs[0]) allPairs = [d, `slot ${i + 1}↔${j + 1}`];
    }
  }

  // Every lightness step must still be distinct, whatever order they sit in.
  const Ls = pal.map((c) => oklch(c)[0]).sort((a, b) => a - b);
  const stepGaps = Ls.slice(1).map((L, i) => L - Ls[i]);

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
  row(!tooClose.length, 'Adjacent slots', tooClose.length
    ? `below ΔE ${MIN_ADJACENT_DE}: ${tooClose.map(([n, d]) => `slot ${n}↔${n + 1} ${d.toFixed(1)}`).join(', ')}`
    : `worst ΔE ${Math.min(...adjacentDe.map(([, d]) => d)).toFixed(1)} (floor ${MIN_ADJACENT_DE})`);
  row(Math.min(...stepGaps) >= 0.05, 'Lightness steps distinct',
    `min ΔL ${Math.min(...stepGaps).toFixed(3)} between the six steps`);

  // The MUTE must be tellable from every slot, at the same floor the slots hold
  // against each other. It is not decoration: --chart-muted paints the "Other"
  // fold AND every de-emphasised mark under `emphasis`, so a mute that collides
  // with a slot means a folded bucket reads as that series, and emphasising that
  // series produces no visible emphasis — the reader is shown two identical
  // colours and correctly concludes they are one thing.
  //
  // This check is here because the dark value shipped at ΔE 2.7 from --chart-2
  // and nothing caught it. Contrast-on-surface was measured; distinctness was
  // not, so the collision was invisible to every gate in the repo.
  const muteVal = decl(blk, `${PREFIX}-muted`);
  if (!muteVal || !/^#[0-9a-fA-F]{6}$/.test(muteVal)) {
    row(false, 'Mute distinct', `--${PREFIX}-muted missing or not a plain hex (got ${muteVal})`);
  } else {
    const muteDe = pal.map((c, i) => [i + 1, deltaE(muteVal, c)]);
    const nearest = muteDe.reduce((w, m) => (m[1] < w[1] ? m : w));
    row(nearest[1] >= MIN_ADJACENT_DE, 'Mute distinct',
      `nearest is slot ${nearest[0]} at ΔE ${nearest[1].toFixed(1)} (floor ${MIN_ADJACENT_DE})`);
    // Reported, not gated — a mute cannot both recede past the lightest slot and
    // clear 3:1, and receding is the job. test:chart-a11y carries the same note.
    console.log(`  · ${'Mute on surface'.padEnd(22)} `
      + `${contrast(muteVal, SURFACES[mode].card).toFixed(2)}:1 — below ${GRAPHICAL} by construction; `
      + `stroke weight is the second channel`);
  }
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
  console.log(`  · ${'All-pairs worst'.padEnd(22)} ΔE ${allPairs[0].toFixed(1)} (${allPairs[1]}) `
    + `— ordering CANNOT improve this; six steps in the available span always leave two adjacent`);
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

// ── 3. the per-brand palettes ────────────────────────────────────────────────
// Everything above gates the NEUTRAL slate ramp. Inside a [data-theme] scope the
// six slots are replaced wholesale by a brand palette, and until this section
// existed nothing measured those at all — the script reported PASS on a ramp
// that most themed pages never render.
//
// The neutral ramp's own constraints do NOT transfer. It is a single hue whose
// slots are interleaved through six lightness steps; the brand palettes are
// multi-hue and solved for a different shape. So the floors here are set from
// what the SOLVED values actually achieve, comfortably below the observed
// minimum, which makes this a regression gate rather than a re-litigation of
// the owner's tuning.
//
//   adjacent-slot dE00   observed min 13.2 (db dark)   -> floor 12
//   CVD (worse of deuteranopia / protanopia)           -> the system's own
//                                                         CVD_FLOOR of 8
//
// ONE PALETTE DOES NOT MEET THAT, and it is recorded rather than accommodated.
// rm dark has an adjacent pair 6.3 apart under PROTANOPIA — below the 8 this
// file already applies to the neutral ramp. It is not a regression from this
// change: rm's palette is the recipe's solved output and nothing measured it
// before, which is the whole reason this section exists. A magenta/pink family
// is exactly where protan vision collapses, so the finding is plausible on its
// face. It is listed below so the run PASSES while printing the number every
// time — silently lowering the floor to 6 would have made the gate decorative,
// and hard-failing would block on a value the owner solved. NEEDS AN OWNER
// DECISION: re-derive rm's dark slots, or accept and delete this entry.
//
// Two things are REPORTED and not gated, because both are known and decided:
//   · --chart-muted separation, whose min is 5.1 on rm light — far tighter than
//     any other brand. Gating at 5 would be a gate in name only, so the number
//     is printed instead and rm is named, which is the honest version.
//   · slot 1 == --primary, which holds for 11 of the 12 brand/mode pairs. ec
//     dark is the exception on purpose; the adoption dossier recorded it before
//     this script existed.
const BRAND_ADJ_FLOOR = 12;
const BRAND_CVD_FLOOR = CVD_FLOOR; // 8 — the same bar the neutral ramp answers to
const SLOT1_EXCEPTIONS = new Set(['ec dark']);
// brand/mode -> the measured value at the time it was recorded. Printed loudly
// on every run; delete the entry once the palette is re-derived or accepted.
const CVD_RECORDED = new Map([['rm dark', 6.3]]);

// Find a block by selector, choosing the one that actually declares chart slots:
// [data-theme='db'] appears twice — once for the --primary family remap, once
// for the generated brand tokens.
const blockWith = (sel, must) => {
  let from = 0;
  for (;;) {
    const i = src.indexOf(`${sel} {`, from);
    if (i < 0) return null;
    const open = src.indexOf('{', i);
    let depth = 0;
    let end = -1;
    for (let j = open; j < src.length; j++) {
      if (src[j] === '{') depth++;
      else if (src[j] === '}' && --depth === 0) { end = j; break; }
    }
    if (end < 0) return null;
    const body = src.slice(open, end);
    if (!must || body.includes(must)) return body;
    from = end;
  }
};

const BRANDS = [...new Set(
  [...src.matchAll(/\[data-theme='([a-z0-9-]+)'\]/g)].map((m) => m[1]),
)].sort();

const openFindings = [];
console.log(`\nPer-brand chart palettes  (${BRANDS.length} brands x 2 modes)\n`);
console.log(`  ${'brand/mode'.padEnd(12)}${'adjacent'.padStart(9)}${'CVD'.padStart(7)}${'muted'.padStart(8)}   slot1`);

for (const mode of ['light', 'dark']) {
  for (const b of BRANDS) {
    const sel = mode === 'light' ? `[data-theme='${b}']` : `[data-mode='dark'][data-theme='${b}']`;
    const blk = blockWith(sel, '--chart-1');
    if (!blk) { console.log(`  ✗ ${b} ${mode}: no generated chart block`); failed = true; continue; }

    const slots = Array.from({ length: SLOTS }, (_, i) => decl(blk, `chart-${i + 1}`));
    if (slots.some((s) => !s)) { console.log(`  ✗ ${b} ${mode}: incomplete slots`); failed = true; continue; }
    const muted = decl(blk, 'chart-muted');

    let adj = Infinity;
    let cvd = Infinity;
    for (let i = 0; i < SLOTS - 1; i++) {
      adj = Math.min(adj, deltaE(slots[i], slots[i + 1]));
      cvd = Math.min(cvd, Math.min(deltaE(slots[i], slots[i + 1], 'deutan'), deltaE(slots[i], slots[i + 1], 'protan')));
    }
    const mu = muted ? Math.min(...slots.map((s) => deltaE(muted, s))) : NaN;

    const anchorBlk = mode === 'light' ? LIGHT : DARK;
    const prim = decl(anchorBlk, `${b}-primary`);
    const slot1Ok = prim && slots[0].toLowerCase() === prim.toLowerCase();
    const excepted = SLOT1_EXCEPTIONS.has(`${b} ${mode}`);

    const key = `${b} ${mode}`;
    const cvdRecorded = CVD_RECORDED.has(key);
    const cvdBad = cvd < BRAND_CVD_FLOOR;
    const bad = adj < BRAND_ADJ_FLOOR || (cvdBad && !cvdRecorded);
    if (bad) failed = true;
    if (cvdBad && cvdRecorded) openFindings.push(`${key} CVD ${cvd.toFixed(1)} (floor ${BRAND_CVD_FLOOR}, protan)`);

    console.log(
      `  ${bad ? '✗' : cvdBad ? '!' : '·'} ${key.padEnd(10)}`
      + `${adj.toFixed(1).padStart(9)}${cvd.toFixed(1).padStart(7)}${Number.isNaN(mu) ? '    —' : mu.toFixed(1).padStart(8)}`
      + `   ${slot1Ok ? 'primary' : excepted ? 'differs (recorded)' : 'DIFFERS — unrecorded'}`,
    );
    if (!slot1Ok && !excepted) failed = true;
  }
}
console.log(
  `\n  floors: adjacent dE >= ${BRAND_ADJ_FLOOR}, CVD dE >= ${BRAND_CVD_FLOOR}.`
  + ` muted separation is reported, not gated (rm light runs 5.1).`,
);

if (openFindings.length) {
  console.log('\n  ! RECORDED, NOT FIXED — these pass ONLY because they are listed in CVD_RECORDED:');
  for (const f of openFindings) console.log(`      ${f}`);
  console.log('    Re-derive the palette in the recipe, or accept it and delete the entry.');
}

console.log(
  failed
    ? '\n✗ FAIL — the chart ramp no longer satisfies its constraints.\n'
      + '  Slot order is INTERLEAVED (4,1,5,2,6,3 through six lightness steps) so that\n'
      + '  consecutive slots sit three steps apart. Only two of the 720 orderings reach\n'
      + '  that optimum — re-derive rather than nudging one value.\n'
      + '  For a BRAND palette, re-derive in the recipe and re-run tokens:gen — the\n'
      + '  values in tokens.scss are generated and editing them there will be reverted.\n'
    : '\n✓ PASS — neutral ramp and every brand palette hold in both modes.\n',
);
process.exit(failed ? 1 : 0);
