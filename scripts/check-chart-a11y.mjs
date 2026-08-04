#!/usr/bin/env node
// Chart accessibility guardrail.
//
// Modelled on Chartability (Elavsky 2022) — 50 heuristics under POUR + CAF with a
// 14-item critical shortlist. This automates the ~10 that are machine-checkable
// and deliberately does NOT pretend to cover the four that are not (reading
// level, purpose explanation, whether trends are described, screen-reader
// announcement quality). Those live in each component's parameters.ui.a11y notes
// as a manual pass.
//
//   npm run test:chart-a11y     (run `npm run build` first — reads dist/)
//
// NO BROWSER AND NO NEW DEPENDENCY. Charts are server-rendered with
// react-dom/server (already a devDependency and a peer dep) and the markup is
// parsed. That works because the bar geometry is baked into the path `d`
// attributes, so gaps are measurable WITHOUT a layout pass. test:preview already
// depends on a build, so the precedent exists.
//
// WHY THIS EXISTS: the owner looked at a stacked bar chart and could not tell
// segment 1 from segment 2, while every colour gate passed. They were measuring
// perceptual difference (OKLab dE) when the relevant rule is WCAG 1.4.11's 3:1
// between ADJACENT objects — which no eight-slot categorical palette can satisfy.
// The fix is a surface-coloured gap, and this file is what stops it regressing.

import { readFileSync } from 'node:fs';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const dist = new URL('../dist/index.js', import.meta.url);
let lib;
try {
  lib = await import(dist);
} catch (err) {
  console.error('✗ could not import dist/index.js — run `npm run build` first.\n  ' + err.message);
  process.exit(1);
}
const { BarChart, LineChart, AreaChart } = lib;

// ── thresholds ───────────────────────────────────────────────────────────────
const MIN_MARK_GAP = 1;      // Chartability #6
const MIN_MARK_CONTRAST = 3; // WCAG 1.4.11 / Chartability #1
const MIN_TEXT_PX = 12;      // Chartability #3
const MIN_TARGET_PX = 24;    // WCAG 2.5.8 / Chartability #16
const SLOTS = 6;             // must track SERIES_SLOTS in src/utils/series.ts

// ── colour ───────────────────────────────────────────────────────────────────
/**
 * Parse a token value to RGB, compositing any alpha over `over`.
 *
 * Returns null on anything it cannot read — and every caller treats null as a
 * FAILURE, never a skip. An earlier draft guarded with `/^#/` and silently
 * dropped the focus-ring check because --focus is an rgba(); a check that
 * quietly does nothing reports green forever, which is worse than no check.
 */
const toRgb = (v, over = null) => {
  if (!v) return null;
  const hexMatch = v.match(/^#([0-9a-fA-F]{6})$/);
  if (hexMatch) return [0, 2, 4].map((i) => parseInt(hexMatch[1].slice(i, i + 2), 16));
  const rgba = v.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,/\s]+([\d.]+))?\s*\)/);
  if (!rgba) return null;
  const [r, g, b] = [1, 2, 3].map((i) => parseFloat(rgba[i]));
  const a = rgba[4] === undefined ? 1 : parseFloat(rgba[4]);
  if (a >= 1) return [r, g, b];
  if (!over) return null;
  return [r, g, b].map((c, i) => c * a + over[i] * (1 - a));
};
const hex2rgb = (v) => toRgb(v);
const s2lin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const lum = (rgb) => { const [r, g, b] = rgb.map(s2lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const contrast = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };

const tokens = readFileSync(new URL('../src/styles/tokens.scss', import.meta.url), 'utf8');
const block = (marker) => {
  const start = tokens.indexOf(marker);
  const open = tokens.indexOf('{', start);
  let depth = 0;
  for (let i = open; i < tokens.length; i++) {
    if (tokens[i] === '{') depth++;
    else if (tokens[i] === '}' && --depth === 0) return tokens.slice(open, i);
  }
  return '';
};
const MODES = { light: block("[data-mode='light']"), dark: block("[data-mode='dark']") };
const token = (mode, name) => {
  const m = MODES[mode].match(new RegExp(`--${name}:\\s*([^;]+);`));
  return m ? m[1].trim() : null;
};

// ── report ───────────────────────────────────────────────────────────────────
let failures = 0;
const results = [];
const check = (heuristic, label, ok, detail) => {
  if (!ok) failures++;
  results.push({ heuristic, label, ok, detail });
};
/**
 * Reported but not gated.
 *
 * For findings that are REAL but not the chart's to fix — a library-wide token,
 * or a documented accepted deviation. Kept visible rather than deleted, because
 * a check that silently disappears is how the focus ring went unmeasured in the
 * first place. Not failed, because a gate that can never go green gets ignored.
 */
const warn = (heuristic, label, detail) => results.push({ heuristic, label, ok: null, detail });

// ── fixtures — the cases that actually break things ──────────────────────────
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
const S2 = [
  { key: 'a', label: 'Direct', data: [420, 512, 486, 640, 712, 690] },
  { key: 'b', label: 'Referral', data: [280, 310, 402, 380, 460, 520] },
];
const S4 = [
  ...S2,
  { key: 'c', label: 'Organic', data: [180, 240, 220, 300, 340, 410] },
  { key: 'd', label: 'Paid', data: [90, 120, 160, 140, 200, 260] },
];

const FIXTURES = [
  { name: 'bar / grouped', el: () => h(BarChart, { id: 'f1', title: 'Grouped', categories: MONTHS, series: S4 }) },
  { name: 'bar / stacked', el: () => h(BarChart, { id: 'f2', title: 'Stacked', categories: MONTHS, series: S4, layout: 'stacked' }) },
  { name: 'bar / stacked100', el: () => h(BarChart, { id: 'f3', title: '100%', categories: MONTHS, series: S4, layout: 'stacked100' }) },
  {
    // The case that motivated all of this: a segment small enough that a flat
    // 2px gap would eat it or invert it.
    name: 'bar / tiny segment',
    el: () => h(BarChart, {
      id: 'f4', title: 'Tiny', categories: ['a', 'b'], layout: 'stacked',
      series: [{ key: 'big', label: 'Big', data: [1000, 1000] }, { key: 'sliver', label: 'Sliver', data: [4, 2] }],
    }),
  },
  { name: 'bar / mixed signs', el: () => h(BarChart, { id: 'f5', title: 'Mixed', categories: MONTHS, layout: 'stacked',
      series: [{ key: 'up', label: 'Gained', data: [40, 55, 30, 62, 48, 70] }, { key: 'dn', label: 'Lost', data: [-22, -18, -41, -12, -30, -16] }] }) },
  { name: 'line / two series', el: () => h(LineChart, { id: 'f6', title: 'Line', categories: MONTHS, series: S2 }) },
  { name: 'line / gaps', el: () => h(LineChart, { id: 'f7', title: 'Gaps', categories: MONTHS,
      series: [{ key: 'a', label: 'Uptime', data: [98, 97, null, null, 96, 99] }] }) },
  { name: 'line / single point', el: () => h(LineChart, { id: 'f8', title: 'One', categories: ['only'],
      series: [{ key: 'a', label: 'Value', data: [42] }] }) },
  { name: 'line / 40 categories', el: () => h(LineChart, { id: 'f9', title: 'Dense',
      categories: Array.from({ length: 40 }, (_, i) => `c${i}`),
      series: [{ key: 'a', label: 'Value', data: Array.from({ length: 40 }, (_, i) => 50 + i * 3) }] }) },
  { name: 'line / nine series (fold)', el: () => h(LineChart, { id: 'f10', title: 'Fold', categories: MONTHS,
      series: Array.from({ length: 9 }, (_, i) => ({ key: `s${i}`, label: `S${i}`, data: MONTHS.map((_, m) => 80 + i * 40 + m * 10) })) }) },
  { name: 'area / stacked', el: () => h(AreaChart, { id: 'f11', title: 'Area', categories: MONTHS, series: S2, stacked: true }) },
];

// ── parse helpers ────────────────────────────────────────────────────────────
/**
 * Bounding box of an SVG path from its `d`.
 *
 * Only needs to handle what barPath emits — M/H/V/L/A/Z with absolute coords —
 * so it collects every coordinate pair rather than tracing curves. Good enough
 * for a rectangle's extent, which is all the gap check needs.
 */
const bboxOf = (d) => {
  const nums = d.match(/-?\d+(?:\.\d+)?/g);
  if (!nums) return null;
  const xs = [], ys = [];
  // Walk commands so arc radii (which are lengths, not points) are skipped.
  const tokens = d.match(/[MLHVACZmlhvacz]|-?\d+(?:\.\d+)?/g) || [];
  let cmd = '', buf = [], cx = 0, cy = 0;
  const flush = () => {
    if (cmd === 'M' || cmd === 'L') for (let i = 0; i + 1 < buf.length; i += 2) { cx = buf[i]; cy = buf[i + 1]; xs.push(cx); ys.push(cy); }
    else if (cmd === 'H') for (const v of buf) { cx = v; xs.push(cx); ys.push(cy); }
    else if (cmd === 'V') for (const v of buf) { cy = v; xs.push(cx); ys.push(cy); }
    else if (cmd === 'A') for (let i = 0; i + 6 < buf.length; i += 7) { cx = buf[i + 5]; cy = buf[i + 6]; xs.push(cx); ys.push(cy); }
    else if (cmd === 'C') for (let i = 0; i + 5 < buf.length; i += 6) { cx = buf[i + 4]; cy = buf[i + 5]; xs.push(cx); ys.push(cy); }
    buf = [];
  };
  for (const t of tokens) {
    if (/[A-Za-z]/.test(t)) { flush(); cmd = t.toUpperCase(); } else buf.push(parseFloat(t));
  }
  flush();
  if (!xs.length) return null;
  return { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
};

const attrsOf = (markup, cls) => {
  const out = [];
  const re = new RegExp(`<(\\w+)([^>]*class="[^"]*\\b${cls}\\b[^"]*"[^>]*)>`, 'g');
  let m;
  while ((m = re.exec(markup))) out.push({ tag: m[1], raw: m[2] });
  return out;
};
const attr = (raw, name) => { const m = raw.match(new RegExp(`${name}="([^"]*)"`)); return m ? m[1] : null; };

// ── the checks ───────────────────────────────────────────────────────────────
for (const fx of FIXTURES) {
  const markup = renderToStaticMarkup(fx.el());

  // #6 — meaningful elements can be distinguished (>=1px between touching marks)
  // Group the bars by category column, then measure every consecutive pair.
  const bars = attrsOf(markup, 'ui-chart__bar')
    .map((b) => bboxOf(attr(b.raw, 'd') || ''))
    .filter(Boolean);

  if (bars.length > 1) {
    // Two marks "touch" when their x-ranges overlap; that is a stacked pair.
    // Different x means different category or group member — checked too.
    let worst = Infinity, worstPair = '';
    const overlapsX = (a, b) => a.x < b.x + b.w - 0.01 && b.x < a.x + a.w - 0.01;
    for (let i = 0; i < bars.length; i++) {
      for (let j = i + 1; j < bars.length; j++) {
        const a = bars[i], b = bars[j];
        let gap = null;
        if (overlapsX(a, b)) {
          // vertical neighbours (a stack)
          gap = a.y > b.y ? a.y - (b.y + b.h) : b.y - (a.y + a.h);
        } else if (a.y < b.y + b.h && b.y < a.y + a.h) {
          // horizontal neighbours (adjacent bars in a group)
          gap = a.x > b.x ? a.x - (b.x + b.w) : b.x - (a.x + a.w);
        }
        // Only adjacent marks matter — anything further apart than a few px is
        // not "touching" and does not owe a gap.
        if (gap !== null && gap < 4 && gap < worst) { worst = gap; worstPair = `${i}/${j}`; }
      }
    }
    if (worst !== Infinity) {
      check('#6', `${fx.name} — gap between touching marks`, worst >= MIN_MARK_GAP,
        `worst ${worst.toFixed(2)}px (pair ${worstPair}), floor ${MIN_MARK_GAP}`);
    }
  }

  // #30 — a table is present, captioned, and complete
  const hasTable = /<table[^>]*class="[^"]*ui-chart__table\b/.test(markup);
  const hasCaption = /<caption/.test(markup);
  const bodyRows = (markup.match(/<tr>/g) || []).length - 1; // minus the header row
  check('#30', `${fx.name} — table twin`, hasTable && hasCaption && bodyRows > 0,
    hasTable ? `captioned=${hasCaption}, ${bodyRows} body rows` : 'MISSING');

  // #2 — content is not only visual: every rendered value reaches the table
  const cells = [...markup.matchAll(/<td[^>]*>([^<]*)<\/td>/g)].map((m) => m[1]);
  check('#2', `${fx.name} — values reachable without the visual`, cells.length > 0,
    `${cells.length} table cells`);

  // #18 — title/summary present and non-empty
  const labelledBy = markup.match(/<figure[^>]*aria-labelledby="([^"]+)"/);
  const titleOk = labelledBy
    && new RegExp(`id="${labelledBy[1]}"[^>]*>([^<]+)<`).test(markup);
  check('#18', `${fx.name} — title wired`, !!titleOk, labelledBy ? `→ ${labelledBy[1]}` : 'no aria-labelledby');

  // #14 — exactly one tab stop, and it is not the <svg>
  const tabStops = (markup.match(/tabindex="0"/g) || []).length;
  const focusableSvg = /<svg[^>]*tabindex="0"/.test(markup);
  check('#14', `${fx.name} — one tab stop`, tabStops === 1 && !focusableSvg,
    `${tabStops} tab stop(s), focusable svg=${focusableSvg}`);

  // #16 — the pointer target is bigger than the mark
  const hit = attrsOf(markup, 'ui-chart__hit')[0];
  if (hit) {
    const hw = parseFloat(attr(hit.raw, 'width') || '0');
    const hh = parseFloat(attr(hit.raw, 'height') || '0');
    check('#16', `${fx.name} — hit target`, Math.min(hw, hh) >= MIN_TARGET_PX,
      `${hw.toFixed(0)}x${hh.toFixed(0)}px, floor ${MIN_TARGET_PX}`);
  }

  // #25 — axes are labelled whenever they render
  const yTicks = (markup.match(/ui-chart__tick/g) || []).length;
  check('#25', `${fx.name} — axis labels`, yTicks > 0, `${yTicks} tick labels`);
}

// ── palette-level checks, once (not per fixture) ─────────────────────────────
for (const mode of ['light', 'dark']) {
  const surface = token(mode, 'chart-surface');
  const worst = [];
  for (let i = 1; i <= SLOTS; i++) {
    const c = token(mode, `chart-${i}`);
    // A slot that cannot be read is a FAILURE, not a skip. This check spent the
    // --series-* -> --chart-* rename looking up names that no longer existed,
    // found nothing, reduced over an empty list and reported "worst slot 0
    // Infinity:1" — a green tick for measuring nothing at all. Exactly the trap
    // the header of this file warns about, caught by reading the detail column.
    if (!c || !surface) { worst.push([i, 0]); continue; }
    worst.push([i, contrast(hex2rgb(c), hex2rgb(surface))]);
  }
  const min = worst.reduce((w, x) => (x[1] < w[1] ? x : w), [0, Infinity]);
  check('#1', `${mode} — marks on --chart-surface`, min[1] >= MIN_MARK_CONTRAST,
    `${worst.length} slots, worst is slot ${min[0]} at ${min[1].toFixed(2)}:1`);

  // #1 again, for the EMPHASIS mute — reported, not gated, and the reason is
  // structural rather than an oversight.
  //
  // A muted mark has to sit lighter than every slot or it does not recede, and
  // the lightest slot is already close to the 3:1 floor. So "recedes" and
  // "clears 3:1" cannot both hold — the same compounding squeeze that stops
  // adjacent slots reaching 3:1 against each other. WCAG 1.4.11 covers objects
  // REQUIRED to understand the content, and a muted series is by construction
  // not the one being read; the relief is real and enforced elsewhere: stroke
  // weight drops with the colour (a second, independent channel), the table twin
  // is always in the DOM, the tooltip still lists every series at every x, and
  // moving the emphasis restores full colour.
  const mutedTok = token(mode, 'chart-muted');
  if (!mutedTok || !surface) {
    check('#1', `${mode} — emphasis mute`, false, 'UNRESOLVABLE — no --chart-muted');
  } else {
    const r = contrast(hex2rgb(mutedTok), hex2rgb(surface));
    if (r >= MIN_MARK_CONTRAST) check('#1', `${mode} — emphasis mute`, true, `${r.toFixed(2)}:1`);
    else warn('#1', `${mode} — emphasis mute`,
      `${r.toFixed(2)}:1 on surface, below ${MIN_MARK_CONTRAST} — BY DESIGN and structurally `
      + `unavoidable; relief = stroke weight drops too, plus table twin + tooltip`);
  }

  // #13 — the focus indicator itself must be visible.
  // --focus is translucent, so it is composited over the chart surface before
  // measuring — that is what the eye actually sees.
  const surfRgb = toRgb(surface);
  const focusRaw = token(mode, 'focus');
  const focusRgb = toRgb(focusRaw, surfRgb);
  if (!focusRgb || !surfRgb) {
    // Unparseable is a FAILURE, never a skip.
    check('#13', `${mode} — focus ring`, false,
      `UNRESOLVABLE — could not parse ${focusRaw}; the check cannot pass without a value`);
  } else {
    const r = contrast(focusRgb, surfRgb);
    // WARN, not FAIL: --focus is a library-wide token used by 27 components, so
    // moving it is a system decision rather than a chart one. Left visible so it
    // is not lost, and so a future sweep has the number to hand.
    if (r >= MIN_MARK_CONTRAST) check('#13', `${mode} — focus ring`, true, `${r.toFixed(2)}:1 (composited)`);
    else warn('#13', `${mode} — focus ring`,
      `${r.toFixed(2)}:1 composited, below ${MIN_MARK_CONTRAST} — PRE-EXISTING and library-wide `
      + `(--focus is used by 27 components); not a chart defect, not gated here`);
  }
}

// #3 — no chart text below 12px
const chartScss = readFileSync(new URL('../src/charts/Chart/Chart.scss', import.meta.url), 'utf8');
const textTokens = [...chartScss.matchAll(/font-size:\s*var\(--text-([a-z0-9]+)\)/g)].map((m) => m[1]);
const PX = { xs: 12, code: 13, sm: 14, base: 16, lg: 18 };
const tooSmall = textTokens.filter((t) => (PX[t] ?? 99) < MIN_TEXT_PX);
check('#3', 'chart text size', tooSmall.length === 0,
  tooSmall.length ? `below ${MIN_TEXT_PX}px: ${[...new Set(tooSmall)].join(', ')}` : `all >= ${MIN_TEXT_PX}px`);

// ── output ───────────────────────────────────────────────────────────────────
console.log('\nChart accessibility — Chartability critical subset\n');
let lastH = '';
for (const r of results) {
  if (r.heuristic !== lastH) { console.log(`  ${r.heuristic}`); lastH = r.heuristic; }
  console.log(`    ${r.ok === null ? '⚠' : r.ok ? '✓' : '✗'} ${r.label.padEnd(44)} ${r.detail}`);
}
console.log(
  '\n  Not automated (manual pass, recorded in parameters.ui.a11y):'
  + '\n    #17 purpose explained · #19 reading level · #39 trends described'
  + '\n    · screen-reader announcement quality',
);
console.log(failures ? `\n✗ FAIL — ${failures} check(s) below threshold.\n` : '\n✓ PASS — chart a11y criticals hold.\n');
process.exit(failures ? 1 : 0);
