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
// markDeep = decorative-deep. The `primary` override — a brand pinning its functional
// colour apart from its mark's middle stop — is GONE as of 2026-08-07 (owner: use
// primary, drop the extra token), so the triple's middle is now both. Keep the
// `a.primary ? … : a[key][1]` read below anyway: it costs nothing and is the only thing
// that would keep working if a brand ever needs to split again.
const ANCHORS = {
  indigo:  { l: ['8cdafd','466af4','0d3bbf'], d: ['8cdafd','689cfe','046de9'], mdL: '3419ba', mdD: '3b27ed' },
  fern:    { l: ['c9db29','306602','183a00'], d: ['c9db29','8bca2f','649807'], mdL: '105b3e', mdD: '249d6e' },
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

// A gradient stop's colour BINDS to a variable now, which makes the literal
// `stop.color` a stale fallback that the renderer never paints. The previous version
// of this block compared that literal AND keyed on `Aiden/Light/*` names that no
// longer exist — so every lookup missed, every style hit `continue`, and 22 gradient
// checks were counted in the total while zero of them ran. Both faults are fixed
// here: names match the file, stops resolve through the variable, and an unmatched
// name is now a finding instead of a silent skip.
//
// Aiden is ONE mode-aware style per role, not a Light and a Dark copy. Where the
// code's dark gradient has fewer stops than the light one, the extra stop is carried
// as 'MID' — it must be the linear midpoint of its neighbours, which is what lets a
// 3-stop style stand in for a 2-stop gradient without a second style.
// tokens.scss 721-727 (light) / 1009-1015 (dark).
//
// `Aiden/*/Outline-hover` is deliberately absent: --aiden-outline-hover was removed when
// aiden secondary moved to the shared --opacity-50 overlay, so a style still named that
// has no counterpart in the code. It lives under Aiden/_deprecated/ rather than deleted.
const GRADIENTS = {
  'Aiden/Primary':   { l: [['8455f0',1,0], ['5a37e6',1,.5], ['2c6dea',1,1]],
                       d: [['9076f9',1,0], ['MID',1,.5],    ['93c5fd',1,1]] },
  'Aiden/Hover':     { l: [['6d28d9',1,0], ['4a29c9',1,.5], ['1d4ed8',1,1]],
                       d: [['b3a2fa',1,0], ['MID',1,.5],    ['bae6fd',1,1]] },
  'Aiden/Secondary': { l: [['5a37e6',.08,0], ['2c6dea',.08,1]],
                       d: [['9076f9',.10,0], ['93c5fd',.10,1]] },
  'Aiden/Border':    { l: [['5a37e6',.80,0], ['2c6dea',.80,1]],
                       d: [['9076f9',.80,0], ['93c5fd',.80,1]] },
  'Aiden/Ring':      { l: [['5a37e6',.50,0], ['2c6dea',.50,1]],
                       d: [['9076f9',.50,0], ['93c5fd',.50,1]] },
};

// The Mark tile styles are DERIVED from ANCHORS rather than restated, so there is no
// second copy of the brand colours to drift.
//
// THE SHIPPED GRADIENT IS FOUR STOPS, and mis-reading it as three is a trap worth
// spelling out. deeperThemingRecipeV2.ts emits:
//     --decorative-hi 9.7%, --primary s2, --primary s3, --decorative-deep 90.3%
// with s2/s3 = 51.6/51.6 for the six brands and 44/62 for aiden. The DUPLICATED pair is
// `--primary` twice, which is a PLATEAU — "a stop is a point: naming the colour twice is
// the only way to give it a band". It is NOT a hard edge between primary and deep.
// decorative-deep sits at 90.3% in every brand.
//
// Because s2 === s3 for the six brands the pair collapses to a point, so three stops
// render identically and that is what the tiles carry. Only aiden needs the fourth stop,
// and it is the one style declared with all four below.
const MARK_POS = [0.097, 0.516, 0.903];
for (const [slug, a] of Object.entries(ANCHORS)) {
  GRADIENTS[`Mark/${slug[0].toUpperCase()}${slug.slice(1)}`] = {
    l: [[a.l[0],1,MARK_POS[0]], [a.l[1],1,MARK_POS[1]], [a.mdL,1,MARK_POS[2]]],
    d: [[a.d[0],1,MARK_POS[0]], [a.d[1],1,MARK_POS[1]], [a.mdD,1,MARK_POS[2]]],
  };
}
// Slate is the neutral main brand and is not in ANCHORS — all three stops collapse
// onto the one primary, which is why the slate mark reads flat rather than as a ramp.
GRADIENTS['Mark/Slate'] = {
  l: [['334155',1,MARK_POS[0]], ['334155',1,MARK_POS[1]], ['334155',1,MARK_POS[2]]],
  d: [['cbd5e1',1,MARK_POS[0]], ['cbd5e1',1,MARK_POS[1]], ['cbd5e1',1,MARK_POS[2]]],
};

// Aiden is a SURFACE, not a Brand mode, so it is absent from ANCHORS — and it is the one
// case where the plateau is real: --primary is named at BOTH 44% and 62%, giving the
// blurple a band instead of a point. Hence four stops here where the brands need three.
// Its decorative-hi also moves across the mode flip (#b65ffd -> #b75ef2); no other
// brand's does, which is why this is stated rather than derived. Values: recipe line 369.
const MPA = [0.097, 0.44, 0.62, 0.903];
GRADIENTS['Mark/Aiden'] = {
  l: [['b65ffd',1,MPA[0]], ['5a37e6',1,MPA[1]], ['5a37e6',1,MPA[2]], ['2c6dea',1,MPA[3]]],
  d: [['b75ef2',1,MPA[0]], ['9076f9',1,MPA[1]], ['9076f9',1,MPA[2]], ['4f99ec',1,MPA[3]]],
};

// Resolve a stop to what it actually PAINTS in a given Mode, chasing aliases. An
// unbound stop is reported as such: a hardcoded stop is exactly the drift this exists
// to catch, even when its current literal happens to be right.
const resolveStop = (stop, modeId) => {
  const bid = stop.boundVariables && stop.boundVariables.color && stop.boundVariables.color.id;
  if (!bid) return { unbound: true, hex: hx(stop.color), alpha: stop.color.a ?? 1 };
  let v = all.find((x) => x.id === bid);
  if (!v) return { dangling: true };
  let val = v.valuesByMode[modeId];
  for (let hop = 0; val && val.type === 'VARIABLE_ALIAS' && hop < 4; hop++) {
    const t = all.find((x) => x.id === val.id);
    if (!t) return { dangling: true, via: v.name };
    v = t; val = t.valuesByMode[modeId];
  }
  // A Brand-collection variable has no Light/Dark mode, so it cannot be resolved here.
  if (!val) return { unresolvable: true, via: v.name };
  if (val.type === 'VARIABLE_ALIAS') return { unresolvable: true, via: v.name };
  return { hex: hx(val), alpha: val.a ?? 1, via: v.name };
};

const gradBad = [];
let gradientChecks = 0;
const seenStyles = new Set();

for (const s of await figma.getLocalPaintStylesAsync()) {
  const want = GRADIENTS[s.name];
  if (!want) {
    // Silence here is what hid the last bug. Anything in a namespace we audit but
    // have no expectation for is a finding, not a skip.
    if (/^(Aiden|Mark)\//.test(s.name) && !s.name.includes('/_deprecated/'))
      gradBad.push({ style: s.name, issue: 'no expectation in this script' });
    continue;
  }
  seenStyles.add(s.name);
  const p = (s.paints || [])[0];
  if (!p || !p.gradientStops) { gradBad.push({ style: s.name, issue: 'not a gradient' }); continue; }

  for (const [key, modeId] of [['l', L], ['d', D]]) {
    const tag = key === 'l' ? 'Light' : 'Dark';
    const exp = want[key];
    if (p.gradientStops.length !== exp.length) {
      gradBad.push({ style: s.name, mode: tag, issue: 'stop count', figma: p.gradientStops.length, code: exp.length });
      continue;
    }
    const got = p.gradientStops.map((g) => resolveStop(g, modeId));

    p.gradientStops.forEach((g, i) => {
      const [wh, wa, wp] = exp[i];
      const r = got[i];
      gradientChecks++;

      if (r.unbound)      return gradBad.push({ style: s.name, mode: tag, stop: i, issue: 'stop is not bound to a variable', figma: r.hex });
      if (r.dangling)     return gradBad.push({ style: s.name, mode: tag, stop: i, issue: 'bound to a deleted variable', via: r.via });
      if (r.unresolvable) return gradBad.push({ style: s.name, mode: tag, stop: i, issue: 'bound variable has no Light/Dark value', via: r.via });

      if (wh === 'MID') {
        // Stands in for a shorter code gradient: must be the midpoint of its neighbours.
        const a2 = got[i - 1], b2 = got[i + 1];
        if (!a2 || !b2 || !a2.hex || !b2.hex) return;
        const want2 = hx(mix(rgb(a2.hex), rgb(b2.hex), 0.5));
        // A midpoint of two bytes lands on a .5 boundary half the time, and the float
        // that carries it (0.7156862745 * 255 = 182.49999999999997) rounds DOWN where
        // the arithmetic says up. Both aiden mids sit on exactly that edge, so an exact
        // match is the wrong test — same 8-bit-grid hazard as `q()` above. One byte per
        // channel is still far tighter than any real drift.
        const off = ['r','g','b'].map((k) => Math.abs(rgb(r.hex)[k]*255 - rgb(want2)[k]*255));
        if (Math.max(...off) > 1)
          gradBad.push({ style: s.name, mode: tag, stop: i, issue: 'interpolated mid', figma: r.hex, code: want2, via: r.via });
      } else if (r.hex !== wh) {
        gradBad.push({ style: s.name, mode: tag, stop: i, issue: 'colour', figma: r.hex, code: wh, via: r.via });
      } else if (Math.abs(r.alpha - wa) > 0.002) {
        gradBad.push({ style: s.name, mode: tag, stop: i, issue: 'alpha', figma: Math.round(r.alpha*100)+'%', code: Math.round(wa*100)+'%', via: r.via });
      }

      if (Math.abs(g.position - wp) > 0.005)
        gradBad.push({ style: s.name, mode: tag, stop: i, issue: 'position', figma: g.position, code: wp });
    });
  }
}

// An expectation with no style is the same class of miss, seen from the other side.
for (const name of Object.keys(GRADIENTS))
  if (!seenStyles.has(name)) gradBad.push({ style: name, issue: 'expected style not found in file' });

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
// gradientChecks is COUNTED AS IT RUNS, not computed from the expectation table. The
// old version derived it from GRADIENTS, so the total kept reporting 22 gradient checks
// during the whole period none of them executed. A count you can inflate by skipping
// work is worse than no count.

return {
  checked: variableChecks + gradientChecks,
  mismatches: bad.length,
  gradientMismatches: gradBad.length,
  dangling,
  detail: bad.slice(0, 40),
  gradientDetail: gradBad.slice(0, 20),
  note: bad.length || gradBad.length || dangling.length ? 'FAIL — Figma disagrees with the code' : 'PASS',
};
