/**
 * figma-variable-audit.js — does the Figma file still agree with the code?
 *
 * Paste the body of this file into the `use_figma` tool (Plugin API). It returns
 * ONLY disagreements, so a clean run is a short run.
 *
 * WHY THIS EXISTS
 * Three separate wrong-value bugs shipped into the Figma file and none of them
 * threw, rendered oddly, or looked wrong in the variables table:
 *
 *   1. `_brand/magenta/primary` held #7c3aed — a VIOLET. Six of seven primaries
 *      were stale; they came in through a tombstone restore that recovered what
 *      Figma had rather than what the code says.
 *   2. Every dark tint percentage carried the LIGHT value (card 0% instead of
 *      12%, band 7% instead of 16%). Dark surfaces were uniformly under-tinted.
 *   3. `tint/sidebar` mixed the tint-stock at 8%; the real rule is `--primary`
 *      at 4%. Wrong source AND wrong percentage.
 *
 * All three resolve without error and look plausible. The only thing that
 * catches them is comparing against the source of truth on purpose.
 *
 * SOURCE OF TRUTH
 * `src/prototypes/deeperThemingRecipeV2.ts` for the anchors, and `tokens.scss`
 * for the derivation formulas. The tint table below was measured out of a
 * running Storybook with getComputedStyle — the recipe expresses those as
 * `color-mix(... calc(N% * var(--tint-page)))`, so reading the percentages off
 * the rendered CSS is more reliable than re-parsing the SCSS.
 *
 * SCOPE
 * Covers the primary family, the decorative pair, the whole tint layer, and the
 * gradient PAINT STYLES.
 *
 * Gradients are checked here and not as variables because a Figma COLOR variable
 * holds one colour — a gradient can only be a paint style. That puts them outside
 * every variable-level check, which is how the Aiden family sat on the pre-blurple
 * #5f61ef mid stop long after the code moved to #5a37e6. That stop exists to keep
 * Aiden from colliding with db's indigo (they measured dE 0.8 apart), so a stale
 * copy silently reintroduces the exact defect the change was made to fix.
 *
 * Chart tokens are NOT covered — 336 values would have to be inlined here and
 * would then be a second copy that can drift. Extend by exporting them from the
 * recipe at build time rather than by pasting them in.
 */

// ---------------------------------------------------------------- source of truth

// deeperThemingRecipeV2.ts BRAND_ANCHORS. triple = [decorative-hi, primary, primary-deep];
// markDeep = decorative-deep. `primary` overrides the triple where a brand pins its
// functional colour apart from its mark (nb does — its mark is lighter than its primary).
const ANCHORS = {
  indigo:  { l: ['8cdafd','466af4','0d3bbf'], d: ['8cdafd','689cfe','046de9'], mdL: '3419ba', mdD: '3b27ed' },
  fern:    { l: ['c9db29','418605','183a00'], d: ['c9db29','8bca2f','649807'], mdL: '105b3e', mdD: '249d6e',
             primary: { l: '306602', d: '8bca2f' } },
  teal:    { l: ['4eeeaf','127f76','002b27'], d: ['4eeeaf','0db09d','057d70'], mdL: '0c4b55', mdD: '075e6f' },
  cobalt:  { l: ['57e3fd','067db8','01517a'], d: ['57e3fd','23c7fe','0995c1'], mdL: '1850d1', mdD: '067cbc' },
  amber:   { l: ['fdc450','b56005','793e01'], d: ['fdc450','ee7d0a','ae5904'], mdL: '91200d', mdD: 'cc3218' },
  magenta: { l: ['f7b1fd','d62496','960366'], d: ['f7b1fd','fe68b8','d31a8d'], mdL: '9a153b', mdD: 'da2358' },
};

// tokens.scss lines 387-393 / 753-759. The -transparent mixes are the primary carried
// at an alpha; -soft is the only one that differs by mode (8% light / 10% dark).
const DERIVED = {
  'primary-hover':  { mixFg: 0.85 },
  'primary-text':   { mixFg: 0.85 },
  'primary-light':  { alpha: [0.06, 0.06] },
  'primary-soft':   { alpha: [0.08, 0.10] },
  'primary-border': { alpha: [0.40, 0.40] },
  'primary-ring':   { alpha: [0.50, 0.50] },
  'primary-focus':  { alpha: [0.40, 0.40] },
};

// [lightPct, darkPct, source]. `stock` = color-mix(--primary-deep 25%, <mode base border>).
// Measured in Storybook; see the header note on why not parsed from SCSS.
const TINT = {
  background: [0, 12, 'stock'], card: [0, 12, 'stock'], popover: [0, 12, 'stock'],
  secondary: [10, 12, 'stock'], accent: [12, 12, 'stock'], muted: [7, 10, 'stock'],
  input: [10, 12, 'stock'], band: [7, 16, 'stock'], border: [5, 6, 'primary'],
  sidebar: [4, 4, 'primary'], 'sidebar-border': [4, 4, 'primary'], 'sidebar-accent': [4, 4, 'primary'],
};
const STOCK_BASE = { l: '475569', d: '64748b' };

// ---------------------------------------------------------------- helpers

const rgb = (h) => ({ r: parseInt(h.slice(0,2),16)/255, g: parseInt(h.slice(2,4),16)/255, b: parseInt(h.slice(4,6),16)/255 });
const hx = (c) => [c.r,c.g,c.b].map((n) => Math.round(n*255).toString(16).padStart(2,'0')).join('');
// snap to the 8-bit grid — a renderer always rounds to a byte, so a stored float
// between two bytes can never equal what it paints, and silently fails every
// exact-hex comparison with no error. Amber's hover hit exactly this (.5 boundary).
const q = (n) => Math.round(n*255)/255;
const mix = (a, b, p) => ({ r: q(a.r*p + b.r*(1-p)), g: q(a.g*p + b.g*(1-p)), b: q(a.b*p + b.b*(1-p)) });

// ---------------------------------------------------------------- the audit

const C = {};
for (const c of await figma.variables.getLocalVariableCollectionsAsync()) C[c.name] = c;
const all = await figma.variables.getLocalVariablesAsync();
const MID = (col, n) => { const m = C[col] && C[col].modes.find((x) => x.name === n); return m && m.modeId; };
const L = MID('Mode', 'Light'), D = MID('Mode', 'Dark');
const MV = (n) => all.find((v) => v.name === n && v.variableCollectionId === C['Mode'].id);

const bad = [];
const cmp = (name, mode, got, want) => {
  if (!got) return bad.push({ name, mode, issue: 'MISSING' });
  const g = got.r !== undefined ? hx(got) : String(got);
  if (g !== want.hex) bad.push({ name, mode, issue: 'value', figma: g, code: want.hex });
  else if (want.alpha !== undefined && Math.abs((got.a ?? 1) - want.alpha) > 0.002)
    bad.push({ name, mode, issue: 'alpha', figma: Math.round((got.a ?? 1)*100) + '%', code: Math.round(want.alpha*100) + '%' });
};

const fg = MV('text/foreground');
for (const [slug, a] of Object.entries(ANCHORS)) {
  for (const [key, mid] of [['l', L], ['d', D]]) {
    const tag = key === 'l' ? 'Light' : 'Dark';
    const prim = (a.primary ? a.primary[key] : a[key][1]);

    cmp(`_brand/${slug}/primary`,         tag, MV(`_brand/${slug}/primary`)?.valuesByMode[mid],         { hex: prim });
    cmp(`_brand/${slug}/primary-deep`,    tag, MV(`_brand/${slug}/primary-deep`)?.valuesByMode[mid],    { hex: a[key][2] });
    cmp(`_brand/${slug}/decorative-hi`,   tag, MV(`_brand/${slug}/decorative-hi`)?.valuesByMode[mid],   { hex: a[key][0] });
    cmp(`_brand/${slug}/decorative-deep`, tag, MV(`_brand/${slug}/decorative-deep`)?.valuesByMode[mid], { hex: key === 'l' ? a.mdL : a.mdD });

    const p = rgb(prim);
    for (const [tok, rule] of Object.entries(DERIVED)) {
      const want = rule.mixFg
        ? { hex: hx(mix(p, fg.valuesByMode[mid], rule.mixFg)) }
        : { hex: prim, alpha: rule.alpha[key === 'l' ? 0 : 1] };
      cmp(`_brand/${slug}/${tok}`, tag, MV(`_brand/${slug}/${tok}`)?.valuesByMode[mid], want);
    }

    const stock = mix(rgb(a[key][2]), rgb(STOCK_BASE[key]), 0.25);
    for (const [tok, [lp, dp, src]] of Object.entries(TINT)) {
      cmp(`_brand/${slug}/tint/${tok}`, tag, MV(`_brand/${slug}/tint/${tok}`)?.valuesByMode[mid],
        { hex: src === 'stock' ? hx(stock) : prim, alpha: (key === 'l' ? lp : dp) / 100 });
    }
  }
}

// ---------------------------------------------------------------- gradient paint styles

// tokens.scss lines 716-723 (light) / 1004-1011 (dark). Stops as [hex, alpha, position].
// `Aiden/*/Outline-hover` is deliberately absent: --aiden-outline-hover was removed when
// aiden secondary moved to the shared --opacity-50 overlay, so a style still named that
// has no counterpart in the code. It lives under Aiden/_deprecated/ rather than deleted.
const GRADIENTS = {
  'Aiden/Light/Primary':   [['8455f0',1,0], ['5a37e6',1,.5], ['2c6dea',1,1]],
  'Aiden/Light/Hover':     [['6d28d9',1,0], ['4a29c9',1,.5], ['1d4ed8',1,1]],
  'Aiden/Light/Secondary': [['5a37e6',.08,0], ['2c6dea',.08,1]],
  'Aiden/Light/Border':    [['5a37e6',.80,0], ['2c6dea',.80,1]],
  'Aiden/Light/Ring':      [['5a37e6',.50,0], ['2c6dea',.50,1]],
  'Aiden/Dark/Primary':    [['9076f9',1,0], ['93c5fd',1,1]],
  'Aiden/Dark/Hover':      [['b3a2fa',1,0], ['bae6fd',1,1]],
  'Aiden/Dark/Secondary':  [['9076f9',.10,0], ['93c5fd',.10,1]],
  'Aiden/Dark/Border':     [['9076f9',.80,0], ['93c5fd',.80,1]],
  'Aiden/Dark/Ring':       [['9076f9',.50,0], ['93c5fd',.50,1]],
};

const gradBad = [];
for (const s of await figma.getLocalPaintStylesAsync()) {
  const want = GRADIENTS[s.name];
  if (!want) continue;
  const p = (s.paints || [])[0];
  if (!p || !p.gradientStops) { gradBad.push({ style: s.name, issue: 'not a gradient' }); continue; }
  if (p.gradientStops.length !== want.length) {
    gradBad.push({ style: s.name, issue: 'stop count', figma: p.gradientStops.length, code: want.length });
    continue;
  }
  p.gradientStops.forEach((g, i) => {
    const [wh, wa, wp] = want[i];
    if (hx(g.color) !== wh) gradBad.push({ style: s.name, stop: i, issue: 'colour', figma: hx(g.color), code: wh });
    else if (Math.abs((g.color.a ?? 1) - wa) > 0.002)
      gradBad.push({ style: s.name, stop: i, issue: 'alpha', figma: Math.round((g.color.a ?? 1)*100)+'%', code: Math.round(wa*100)+'%' });
    else if (Math.abs(g.position - wp) > 0.005)
      gradBad.push({ style: s.name, stop: i, issue: 'position', figma: g.position, code: wp });
  });
}

// a dangling alias resolves to nothing and paints the collection default — silent
const dangling = [];
for (const colName of ['Brand', 'Tint page', 'Tint rail']) {
  const col = C[colName]; if (!col) continue;
  for (const id of col.variableIds) {
    const v = await figma.variables.getVariableByIdAsync(id);
    for (const m of col.modes) {
      const val = v.valuesByMode[m.modeId];
      if (!val) { dangling.push(`${colName}/${v.name}@${m.name} unset`); continue; }
      if (val.type === 'VARIABLE_ALIAS' && !all.find((x) => x.id === val.id))
        dangling.push(`${colName}/${v.name}@${m.name} -> deleted target`);
    }
  }
}

const variableChecks = Object.keys(ANCHORS).length * 2 * (4 + Object.keys(DERIVED).length + Object.keys(TINT).length);
const gradientChecks = Object.values(GRADIENTS).reduce((n, s) => n + s.length, 0);

return {
  checked: variableChecks + gradientChecks,
  mismatches: bad.length,
  gradientMismatches: gradBad.length,
  dangling,
  detail: bad.slice(0, 40),
  gradientDetail: gradBad.slice(0, 20),
  note: bad.length || gradBad.length || dangling.length ? 'FAIL — Figma disagrees with the code' : 'PASS',
};
