/*
 * ══════════════════════════════════════════════════════════════════════════
 * V2 — THE SOLVER-DERIVED PALETTE. Parallel to v1, not a replacement (yet).
 *
 * Scope: [data-theme-poc22] / .poc2-* — coexists with v1 in one document so the
 * two render side by side. Machinery is v1's verbatim; only VALUES differ, and
 * every value below was derived by scratchpad/solve-brand-palette.mjs against
 * lettered gates (identity/CVD, ramp legibility, accent duty, semantic
 * clearance, deeps, per-brand charts, the db/aiden/slate triangle, mark
 * tiles). Hand-edit an anchor -> re-run the solver, that is what it is for.
 *
 * THE MODEL: wheel order ph(78) nb(136) dc(185) ec(206) db(277) aiden(283)
 * rm(348). True red/orange ceded to error/warning; gold + magenta carry the
 * warmth (owner's call). dc<->ec and db<->aiden separate by LIGHTNESS, not hue.
 * Cross-brand CVD is discharged by the icon+label rule (hard floor 4, target
 * 8); IN-CHART series keep the full floors, and charts are single-brand
 * (primary + deep/companion + neutrals) so the strict case never crosses
 * brands. Aesthetic gate, owner-stated: professional, expensive, important —
 * jewel tones, not candy.
 *
 * DARK CHART SLOT 2 IS THE COMPANION (chart2Dark), NOT THE DEEP. At blue hues,
 * "3:1 on the dark card" plus "dE 15 BELOW the dark primary" is geometrically
 * unsolvable (chroma drags luminance). The shipped slate ramp already answers
 * this: in dark, deeper-relative-to-the-page means FURTHER FROM IT. The true
 * deep keeps tint/mark/hero duty, where no card contrast is owed.
 * ══════════════════════════════════════════════════════════════════════════
 */
/**
 * The deeper-theming recipe — THREE ANCHORS PER BRAND.
 *
 * Lives outside the .stories.tsx file deliberately: every named export from a
 * CSF file is indexed as a story, so exporting POC_CSS from there would have
 * Storybook try to render a string as a component.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THE NORTH STAR IS THE MARK.
 *
 * The Figma app marks (🧪 POC — App marks) are not decoration; they turned out
 * to be the brand definition. Each one is a three-stop gradient, and each stop
 * has a distinct job:
 *
 *     HIGHLIGHT   the upper corner. Reaches OUT of the brand's hue family —
 *                 db's indigo opens on teal, ph's orange opens on yellow. It is
 *                 the lightest, airiest colour the brand owns.
 *     PRIMARY     the body. What a person means when they name the brand — and
 *                 literally --primary, the same value the CTA is painted with.
 *     DEEP        the shadow end. Where the mark grounds itself, and the source
 *                 every tinted surface is built from.
 *
 * Every earlier round of this file tried to theme from ONE number and kept
 * running out of room — the wheel is only 360 degrees and eight brands plus the
 * semantics do not fit. Three anchors is not three times the colour, it is three
 * times the STRUCTURE: each anchor has a natural home, so the brand reaches
 * further without any of them fighting.
 *
 *     highlight  ->  --primary-highlight. Gradients, marketing bubbles, and
 *                    small non-text accents (a status dot). NEVER behind text.
 *     primary    ->  --primary itself, which feeds the whole existing family in
 *                    tokens.scss: -hover, -light, -soft, -border, -ring, -focus,
 *                    -text. Those are color-mix over var(--primary), so setting
 *                    the one value re-derives all seven for free.
 *     deep       ->  --primary-deep. The slate surfaces (background, card,
 *                    popover, secondary, accent, muted, input, the rail, bands)
 *                    plus shadow.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * --primary IS THE MARK'S MIDDLE STOP — UNLESS A BRAND SAYS OTHERWISE.
 *
 * Six of the seven take the middle anchor directly. aiden authors its own
 * (`primary: { light, dark }` on its entry), and that is a supported shape
 * rather than a special case: the mark is display art with no contrast
 * constraint, --primary is a UI colour, and once in a while a brand wants them
 * to be genuinely different colours.
 *
 * This is NOT the two-value model removed below. That one had --primary sitting
 * a few percent off the middle for no reason a consumer could see — a
 * derivation artifact. aiden's is a gap someone chose: the mark carries the
 * gradient because that is the AI identity, and the accent is a calmer flat
 * indigo (#5a56d3) because a gradient cannot be a 1px line or a legible label.
 *
 * RESOLVED IN V2: aiden's accent separates from db by LIGHTNESS+CHROMA, the
 * shipped-blurple construction — light L0.44/C0.26 vs db L0.58/C0.21 measures
 * dE 15.3 (was 5.9). In dark, aiden lifts to L0.79 against db's 0.70: 11.8
 * normal / 6.8 CVD — above the hard floors, under target, reported honestly.
 *
 * The test for adding another: can you SEE the difference, and can you say why
 * in one sentence? If not, it is drift, and the brand should just use its
 * middle stop.
 *
 * ONE COLOUR, ONE LABEL. This is the change that shaped the file.
 *
 * The middle anchor USED to be "main", with --primary a second, slightly darker
 * value derived from it — because a mark's mid stop is a display colour and did
 * not clear AA under a label. Two colours a few percent apart is a smell, so it
 * is gone: --primary IS the middle anchor.
 *
 * An intermediate pass paid for the contrast on the label side instead, giving
 * six brands a DARK --primary-foreground and db a light one. It measured fine and
 * it was a worse system: the CTA's label flipped colour depending on which
 * sub-app you were in, for reasons no consumer could see.
 *
 * So the marks moved instead. Each light middle came down its own hue — chroma
 * and hue untouched — to the lightest value where PURE WHITE clears 4.5, and
 * every brand now carries #ffffff. Measured on the shipped anchors:
 *
 *     db 4.57   nb 4.53   dc 4.53   rm 4.52   ec 4.51   ph 4.50   aiden 4.50
 *
 * SOLVE AGAINST #ffffff, NOT #f8fafc. Every theme scope in tokens.scss sets
 * --{code}-primary-foreground to pure white; #f8fafc is only the un-themed base,
 * which no branded button ever renders. An earlier solve used the base and came
 * out over-darkened. Check the scope, not the default.
 *
 * SOLVE AGAINST THE ROUNDED HEX. Stepping L* down until the float clears 4.5
 * produced #00867a (4.48) and #dc01b0 (4.49) — both fail once written as 8-bit.
 * Round inside the search loop.
 *
 * db needed no move at all; nb and dc gave up ~10 L*. The owner then re-cut the
 * DEEP stops by hand so the marks kept their depth, and those hand values are
 * what ships below — they are not derived from anything and should not be
 * "recomputed". Verified harmless to the rest of the system: because deep only
 * reaches the surfaces through a 60%-slate stock applied at single digits, the
 * re-cut moves every tinted surface by 0.0-0.6 dE00 and muted-text contrast by
 * at most 0.05.
 *
 * Dark mode is untouched and still takes the DARK label: its middles are light
 * by construction (#5688fa and friends), white on them reads 2.66-3.34, and
 * #0f172a clears at 5.1-6.4. Light carries white, dark carries ink — which is
 * what every other token in the system already does.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * SURFACES COME FROM DEEP, AND THEY MOVE ONLY SLIGHTLY. An earlier pass built the
 * light surfaces from the HIGHLIGHT anchor, on the reasoning that a light surface
 * wants a light source colour. It measured well and looked wrong: a highlight is
 * the brightest, most saturated colour the brand owns, so a panel built from it
 * announces itself. Sub-apps are supposed to feel like one suite — the surface
 * should COMPLEMENT the accent, not compete with it.
 *
 * So the tint source is the deep anchor, desaturated toward slate first (the
 * --surface-tint stock) and then applied at single digits. The target is a
 * surface that shifts ~4-8 dE00 off the neutral: you can see it when a brand
 * sits next to another brand, and you never read it as "a coloured page". Deep
 * also has the property that makes this cheap — it is high-chroma, so a few
 * percent buys real hue, and the luminance cost stays small.
 *
 * The same rule runs in BOTH modes, which the earlier pass did not manage (it was
 * highlight in light and main in dark, an inconsistency nobody had decided on).
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Two color-mix facts that shaped the rest:
 *
 * A custom property CANNOT reference itself — `--background: color-mix(…,
 * var(--background))` is a cycle and resolves to `unset`. The bases below are
 * literals copied from tokens.scss. That is the single biggest ADOPTION cost:
 * real adoption needs a raw neutral layer with the semantics derived from it.
 *
 * `color-mix` AVERAGES alpha, so a translucent token must be rebuilt against
 * `transparent` rather than mixed into.
 *
 * STRUCTURAL WARNING, learned four times: everything below is one template
 * literal, and prose accidentally left OUTSIDE a comment is silently valid-ish
 * CSS that makes the parser discard the declarations after it. Every time, the
 * contrast sweep still reported PASS, because an override that never applied is
 * indistinguishable from one that agrees with the baseline. If you edit this
 * block, re-run the structural check in the commit message.
 */

/**
 * The three anchors, straight off the Figma marks: [highlight, PRIMARY, deep].
 * `on` is --primary-foreground: pure white in light for every brand, ink in dark.
 *
 * Read from the POC page's "08 · Marks — white-safe primary" bottom row, which is
 * where the middles were solved and the deeps re-cut by hand. The mark MASTERS on
 * that page still hold the pre-solve values — this file is ahead of them.
 *
 * Do not regenerate these. The middles are a contrast solve and the deeps are a
 * design judgement. Two highlights also moved by hand: nb pulled greener to sit
 * with its new middle, db opened to a brighter cyan.
 *
 * ADJACENCY IS A DECISION HERE, NOT A DEFECT. Three of the seven deeps sit in
 * the same blue family, and that is deliberate:
 *
 *   db and aiden once shared a deep so their surfaces would be byte-identical.
 *   That rule is now MOOT rather than broken: aiden takes the main neutrals, so
 *   it never derives a surface from its deep at all, and the two match by
 *   construction whatever the deeps do. Aiden's deep is mark artwork only.
 *
 *   ec was then pulled away from both (#014c93 -> #01416b, -6 L*, -13 hue) to
 *   keep the blues from collapsing into one. That took ec closer to dc
 *   (surfaces 1.7 -> 1.2 dE00) — accepted, because dc and ec do not embed in
 *   each other the way db and aiden do.
 *
 * So do NOT "fix" a small surface distance by measurement alone. Which pairs
 * are allowed to look alike is a product question about which apps sit side by
 * side, and only the owner can answer it.
 *
 * RESOLVED IN V2: aiden's mark now travels #b5cffd -> #4f06d7 -> #2e0186 —
 * real lightness falloff (OKLCH L 0.85 -> 0.44 -> 0.30), in family with every
 * other mark, and db no longer shares the deep so it moved freely.
 */
export const BRAND_ANCHORS = {
  db:    { light: ['#8cdafd', '#6264f4', '#3e31bf'], dark: ['#8cdafd', '#689cfe', '#2769ed'], markDeep: { light: '#5e19ba', dark: '#843ff4' }, accent: { light: '#2892ba', dark: '#357b97' }, chart2Dark: '#2769ed', on: { light: '#ffffff', dark: '#0f172a' }, icon: 'chart-column' },
  nb:    { light: ['#c9db29', '#306602', '#183a00'], dark: ['#c9db29', '#8bca2f', '#649807'], markDeep: { light: '#063a26', dark: '#249d6e' }, accent: { light: '#919a61', dark: '#a1a784' }, chart2Dark: '#649807', on: { light: '#ffffff', dark: '#0f172a' }, icon: 'file-text' },
  dc:    { light: ['#4eeeaf', '#025750', '#002b27'], dark: ['#4eeeaf', '#0db09d', '#057d70'], markDeep: { light: '#032930', dark: '#1a7888' }, accent: { light: '#789d8b', dark: '#89af9c' }, chart2Dark: '#457b72', on: { light: '#ffffff', dark: '#0f172a' }, icon: 'globe' },
  ec:    { light: ['#2febdb', '#06838f', '#01545c'], dark: ['#2febdb', '#10c1db', '#088fa2'], markDeep: { light: '#0e506f', dark: '#2089bc' }, accent: { light: '#6c9e98', dark: '#85b4ae' }, chart2Dark: '#088fa2', on: { light: '#ffffff', dark: '#0f172a' }, icon: 'leaf' },
  ph:    { light: ['#ebce29', '#9d6d05', '#674601'], dark: ['#ebce29', '#c98909', '#906104'], markDeep: { light: '#773a0c', dark: '#a35316' }, accent: { light: '#a59548', dark: '#a99f70' }, chart2Dark: '#876d4a', on: { light: '#ffffff', dark: '#0f172a' }, icon: 'zap' },
  rm:    { light: ['#f7b1fd', '#d62496', '#960366'], dark: ['#f7b1fd', '#fe68b8', '#d31a8d'], markDeep: { light: '#9a153b', dark: '#da2358' }, accent: { light: '#bf7bc5', dark: '#846986' }, chart2Dark: '#d21f8c', on: { light: '#ffffff', dark: '#0f172a' }, icon: 'heart' },
  aiden: { light: ['#aed1fd', '#4f06d7', '#2e0186'], dark: ['#aed1fd', '#c3b5fe', '#a07efe'], markDeep: { light: '#450967', dark: '#bc6ff7' }, accent: { light: '#5897e2', dark: '#3473bb' }, chart2Dark: '#8746fd', on: { light: '#ffffff', dark: '#0f172a' }, primary: { light: '#4f06d7', dark: '#c3b5fe' }, icon: 'sparkles' },
} as const;

/** --primary IS the middle anchor. No derivation, no second colour. */
export const PRIMARY_LIGHT: Record<string, string> = Object.fromEntries(
  Object.entries(BRAND_ANCHORS).map(([k, v]) => [k, ('primary' in v ? v.primary.light : v.light[1])]),
);
export const PRIMARY_DARK: Record<string, string> = Object.fromEntries(
  Object.entries(BRAND_ANCHORS).map(([k, v]) => [k, ('primary' in v ? v.primary.dark : v.dark[1])]),
);
/** True where the UI accent is authored apart from the mark's middle stop. */
export const PRIMARY_IS_AUTHORED: Record<string, boolean> = Object.fromEntries(
  Object.entries(BRAND_ANCHORS).map(([k, v]) => [k, 'primary' in v]),
);

/**
 * ALTERNATES (owner, 2026-08-06) — ADDITIVE. The seven above are untouched.
 *
 * Options to put in front of the team, solved by the SAME solver, the same
 * construction and the same floors as the incumbents, so a comparison is a
 * comparison of colour and not of two different systems. Each names the
 * incumbent it would replace; nothing selects one unless a story asks for it by
 * `data-brand`, so the ramp, the brand picker and every existing story are
 * unaffected by their presence.
 *
 * WHAT EACH ONE COSTS — the numbers, not adjectives:
 *
 *   nb-green   Greener and brighter than v2 (between v1 and v2: hue 143 splits
 *              them, and the AA target drops 6.9 -> 5.2 so it stops reading as
 *              forest). COMBINATION CONSTRAINT: nb and ph are the pair that
 *              collapses under deutan simulation, and the incumbent set solved
 *              that by keeping nb dark. Bright green vs the v2 gold measures
 *              CVD dE 0.6 — effectively identical to a red-green anomaly. It
 *              holds against ph-amber (10.7). Choosing this green means
 *              choosing a brighter gold with it.
 *
 *   ec-blue    v1's azure restored (hue 240 = --info's hue). It crowds --info
 *              by design: dE 6.0 light / 6.9 dark, under the 8.5 impersonation
 *              line. Safe exactly where the owner said — a product whose charts
 *              never carry an info series next to the brand. Its DARK anchor is
 *              pushed bright (L~0.78) so it clears db, the flagship, by
 *              lightness rather than hue.
 *
 *   ph-orange  Burnt orange, white text, hue 57 (v1's). Drops in with no system
 *              change. Crowds --warning at dE 6.5 in light. Bonus: it sits 27
 *              degrees off dark-warning's amber where the v2 gold sat only 6.
 *
 *   ph-amber   Bright orange, DARK text — the same construction the whole
 *              system already uses in dark mode, and the only way to reach a
 *              genuinely bright warm hue, since white-on-orange forces the
 *              primary down to L~0.58 where orange reads as brown. COST: it
 *              breaks --primary-text, which is a FIXED 85% blend toward the
 *              foreground; at L 0.708 that lands at 3.53 on the card. The
 *              colour is fine, the ratio is the limit — a 72% blend clears AA.
 *              Adopting it means making that ratio per-brand.
 */
export const ALT_ANCHORS = {
  'nb-green':  { light: ['#c4dd29', '#077e0e', '#014f04'], dark: ['#c4dd29', '#6dc759', '#3d9625'], markDeep: { light: '#0b4c39', dark: '#229472' }, accent: { light: '#90996f', dark: '#959d7a' }, chart2Dark: '#3d9625', on: { light: '#ffffff', dark: '#0f172a' }, swaps: 'nb', icon: 'file-text', label: 'greener, brighter — between v1 and v2' },
  'ec-blue':   { light: ['#57e3fd', '#067db8', '#01517a'], dark: ['#57e3fd', '#23c7fe', '#0995c1'], markDeep: { light: '#1e1cd3', dark: '#597df6' }, accent: { light: '#599fae', dark: '#8cb9c2' }, chart2Dark: '#0995c1', on: { light: '#ffffff', dark: '#0f172a' }, swaps: 'ec', icon: 'leaf', label: "v1's azure — crowds --info by design" },
  'ph-orange': { light: ['#fdc450', '#b56005', '#793e01'], dark: ['#fdc450', '#ee7d0a', '#ae5904'], markDeep: { light: '#91200d', dark: '#cc3218' }, accent: { light: '#bc8d29', dark: '#a99879' }, chart2Dark: '#ab5e1d', on: { light: '#ffffff', dark: '#0f172a' }, swaps: 'ph', icon: 'zap', label: 'burnt orange, white text' },
  'ph-amber':  { light: ['#fdc530', '#e6860a', '#a96004'], dark: ['#fdc530', '#e9800a', '#aa5c04'], markDeep: { light: '#ca3a18', dark: '#c83918' }, accent: { light: '#5d5034', dark: '#a79979' }, chart2Dark: '#a7601d', on: { light: '#0f172a', dark: '#0f172a' }, swaps: 'ph', icon: 'zap', label: 'bright orange, DARK text' },
} as const;

export type AltKey = keyof typeof ALT_ANCHORS;
export const ALT_KEYS = Object.keys(ALT_ANCHORS) as AltKey[];

/** Solver-chosen slate order for each alternate, same rule as the incumbents. */
const ALT_CHART_NEUTRALS: Record<string, { light: string[]; dark: string[] }> = {
  'nb-green':  { light: ['#354358', '#77879e', '#212e42'], dark: ['#c7d2e1', '#6b7c93', '#afbccd'] },
  'ec-blue':   { light: ['#354358', '#77879e', '#212e42'], dark: ['#6b7c93', '#c7d2e1', '#8190a6'] },
  'ph-orange': { light: ['#354358', '#77879e', '#212e42'], dark: ['#c7d2e1', '#6b7c93', '#afbccd'] },
  'ph-amber':  { light: ['#77879e', '#354358', '#607087'], dark: ['#c7d2e1', '#6b7c93', '#afbccd'] },
};

export type BrandKey = keyof typeof BRAND_ANCHORS;
export const BRAND_KEYS = Object.keys(BRAND_ANCHORS) as BrandKey[];
/** aiden is a SURFACE, not one of the sub-apps. */
export const SUB_BRANDS = BRAND_KEYS.filter((k) => k !== 'aiden');

/**
 * ON in v2 — the owner's chart model, verbatim: "celebrate the primary and
 * deep of the brand and use our neutrals to fill." Slot 1 is the primary,
 * slot 2 the deep (light) / the companion (dark — see the header), slots 3-6
 * are the shipped slate steps in a solver-chosen order. The searched 6-hue
 * palettes v1 parked here are gone; the owner rejected them.
 */
const CHART_THEMING = true;

/**
 * Slots 3-6 per brand and mode: four of the six shipped slate steps, ordered by
 * the solver to maximise the minimum adjacent dE given slot 2. Aiden is absent
 * on purpose — it is a surface, not a brand, and keeps the neutral ramp.
 */
const CHART_NEUTRALS: Record<string, { light: string[]; dark: string[] }> = {
  ph: { light: ['#354358', '#77879e', '#212e42'], dark: ['#6b7c93', '#c7d2e1', '#8190a6'] },
  nb: { light: ['#354358', '#77879e', '#212e42'], dark: ['#6b7c93', '#c7d2e1', '#8190a6'] },
  dc: { light: ['#354358', '#77879e', '#212e42'], dark: ['#6b7c93', '#c7d2e1', '#8190a6'] },
  ec: { light: ['#354358', '#77879e', '#212e42'], dark: ['#6b7c93', '#c7d2e1', '#8190a6'] },
  db: { light: ['#354358', '#77879e', '#212e42'], dark: ['#afbccd', '#6b7c93', '#c7d2e1'] },
  rm: { light: ['#354358', '#77879e', '#212e42'], dark: ['#afbccd', '#6b7c93', '#c7d2e1'] },
};

/**
 * Emit a brand's chart slots.
 *
 * --chart-1..6, which is what <Chart> reads directly — no aliases, and none
 * needed. This block used to emit --series-1..8 as well, back when the shipped
 * component still read the old names; that rename has since landed everywhere,
 * so the aliases were removed. A seventh series is not given a hue: it folds to
 * --chart-muted, which is what makes the six-slot cap visible rather than silent.
 */
type AnchorSet = { light: readonly string[]; dark: readonly string[]; accent: { light: string; dark: string }; chart2Dark: string };
function chartVars(
  k: string,
  mode: 'light' | 'dark',
  anchors: Record<string, AnchorSet> = BRAND_ANCHORS as unknown as Record<string, AnchorSet>,
  neutralMap: Record<string, { light: string[]; dark: string[] }> = CHART_NEUTRALS,
): string {
  if (!CHART_THEMING) return '';
  const neutrals = neutralMap[k]?.[mode];
  if (!neutrals) return ''; // aiden is a surface, not a brand — it keeps the default ramp
  const a = anchors[k];
  const slot1 = mode === 'light' ? a.light[1] : a.dark[1];
  // dark slot 2 is the COMPANION, not the deep — see the header for why.
  // Slot 3 is the ACCENT: the artwork hue tamed to chart duty (3:1 on card,
  // capped chroma, chain-dE from slot 2, semantics hard-cleared) — so a
  // 3-series chart carries colour and branding without leaving the family.
  const slot2 = mode === 'light' ? a.light[2] : a.chart2Dark;
  const slot3 = a.accent[mode];
  return [slot1, slot2, slot3, ...neutrals].map((hex, i) => `  --chart-${i + 1}: ${hex};`).join('\n') + '\n';
}

/** Per-brand anchor + primary declarations, emitted for every brand and mode. */
function anchorBlocks(
  keys: readonly string[] = BRAND_KEYS,
  anchorMap: Record<string, AnchorSet & { markDeep: { light: string; dark: string }; on: { light: string; dark: string } }> =
    BRAND_ANCHORS as never,
  neutralMap: Record<string, { light: string[]; dark: string[] }> = CHART_NEUTRALS,
): string {
  return keys.map((k) => {
    const a = anchorMap[k];
    // aiden is a SURFACE, not a brand — it answers "what is speaking", not
    // "which app am I in", so it is selected by data-surface and never appears
    // in the brand picker. Same anchor shape, different attribute.
    const sel = k === 'aiden' ? "[data-theme-poc2][data-surface='aiden']" : `[data-theme-poc2][data-brand='${k}']`;
    // --mark-* is the SAME in both modes: a mark is artwork, not a themed
    // component. --primary-* stays mode-aware because it paints UI.
    //
    // THE ARTWORK SPLIT (owner, 2026-08-06): the mark's third stop is the
    // ROTATED markDeep, not the functional --primary-deep. The functional deep
    // keeps charts/tint/hero (same hue = "the brand, quieter"); the mark deep
    // exists so the tile sweeps through HUE — highlight rotates one way off
    // the primary, markDeep the other. Artwork only; nothing functional may
    // read --mark-deep.
    return `${sel}[data-mode='light'] {
  --mark-a:             ${a.light[0]};
  --mark-b:             ${a.light[1]};
  --mark-c:             ${a.markDeep.light};
  --mark-deep:          ${a.markDeep.light};
  --primary-highlight:  ${a.light[0]};
  --mark-mid:           ${a.light[1]};
  --primary:            ${PRIMARY_LIGHT[k] ?? a.light[1]};
  --primary-deep:       ${a.light[2]};
  --primary-foreground: ${a.on.light};
${chartVars(k, 'light', anchorMap, neutralMap)}}
${sel}[data-mode='dark'] {
  --mark-a:             ${a.light[0]};
  --mark-b:             ${a.light[1]};
  --mark-c:             ${a.markDeep.light};
  --mark-deep:          ${a.markDeep.dark};
  --primary-highlight:  ${a.dark[0]};
  --mark-mid:           ${a.dark[1]};
  --primary:            ${PRIMARY_DARK[k] ?? a.dark[1]};
  --primary-deep:       ${a.dark[2]};
  --primary-foreground: ${a.on.dark};
${chartVars(k, 'dark', anchorMap, neutralMap)}}`;
  }).join('\n');
}

export const POC_CSS = `
/* ── THE ANCHORS ────────────────────────────────────────────────────────────
   Three literals per brand per mode, and one derived --primary. Everything
   below this point is expressed in terms of these four and nothing else — no
   brand name appears again in the whole stylesheet. That is the test of whether
   the model actually holds: adding an eighth brand is four more lines here and
   zero changes anywhere else. */
${anchorBlocks()}

/* ── THE ALTERNATES ─────────────────────────────────────────────────────────
   Additive. Nothing above changes because these exist: they are extra
   data-brand values, selected only where a story asks for one by name, so the
   ramp, the picker and every existing story are untouched. Same emitter, same
   solver, same floors — see ALT_ANCHORS for what each one costs. */
${anchorBlocks(ALT_KEYS, ALT_ANCHORS as never, ALT_CHART_NEUTRALS)}

/* ── LIGHT ──────────────────────────────────────────────────────────────────
   THE PAGE STAYS WHITE. Stated as a declaration rather than an omission so it
   reads as a decision. It also keeps every semantic -light tint composited over
   the surface the system was designed against, which is what makes the whole
   alert family safe without re-derivation. */
[data-theme-poc2][data-mode='light'] {
  --background: #ffffff;
  --card:       #ffffff;
  --popover:    #ffffff;

  /* THE TINT STOCK — the deep anchor, greyed. Deep alone is high-chroma AND
     uneven across brands (db sits at C96, dc at C28), so mixing it raw makes
     some brands read tinted while others do not. Pre-mixing 40% slate-600
     compresses both chroma and lightness toward a common point, so one
     percentage below produces a comparable shift for every brand.
     Deep, not highlight: the surface must sit UNDER the accent, not beside it. */
  --surface-tint: color-mix(in srgb, var(--primary-deep) 25%, #475569);

  /* SLIGHT, ON PURPOSE. Each surface lands 4-8 dE00 off its neutral base — the
     range where a brand is legible against another brand but never legible as
     "a coloured panel". Percentages differ per token only because the bases do:
     --accent is the near-white row-hover surface and can take the most; --muted
     is the darkest and carries the system's tightest muted-text pairing, so it
     takes the least. Worst muted-foreground reading across all seven brands:
     accent 5.61, secondary/input 5.19, muted 4.56 — all above AA, against
     baselines of 6.92 / 6.15 / 5.10. */
  --accent:    color-mix(in srgb, var(--surface-tint) calc(12% * var(--poc2-str)), #f1f5f9);
  --secondary: color-mix(in srgb, var(--surface-tint) calc(10% * var(--poc2-str)), #e2e8f0);
  --input:     color-mix(in srgb, var(--surface-tint) calc(10% * var(--poc2-str)), #e2e8f0);
  --muted:     color-mix(in srgb, var(--surface-tint) calc(7%  * var(--poc2-str)), #cbd5e1);

  /* LINES ARE MOSTLY SLATE. They carry no contrast budget, so an earlier pass
     spent freely here — 20-26% of --primary — and the result was a page whose
     every hairline announced the brand. Halved: a border should read as the
     system's slate with the brand only just visible in it. Measured chroma
     across the seven brands drops 6-27 to 1-16, and dE00 off plain #cbd5e1
     drops 8.8-19.7 to 4.7-13.4.

     --ring is DELIBERATELY LEFT ALONE. It is the focus indicator, not chrome:
     WCAG 1.4.11 wants it to stand out from its surroundings, and it is the one
     line on the page whose whole job is to be noticed. Dulling it toward slate
     would make it agree with the border it sits next to. */
  --border:       color-mix(in srgb, var(--primary) calc(5% * var(--poc2-str)), #cbd5e1);
  --border-hover: color-mix(in srgb, var(--primary) calc(8% * var(--poc2-str)), #64748b);
  --ring:         color-mix(in srgb, var(--primary) calc(30% * var(--poc2-str)), #94a3b8);

  /* CHROME. The rail is a surface, so it takes the same stock at the same order
     of magnitude — no second recipe. A rail that shouts is the loudest tell of a
     cheap theme, and the mark carries identity now so the rail does not have to. */
  /* TWO mixes, and the order is the point. The inner one is --surface-tint (the
     greyed deep) and supplies the rail's VALUE — it is what holds the rail apart
     from the content area. The outer one is a little raw --primary and supplies
     HUE, so the rail reads as the brand rather than as generic grey. Swapping
     primary IN FOR the tint instead of layering on top of it lightens the rail
     and hands the separation straight back.
     Both percentages are gated on --poc2-chrome, so "Tint the rail" off still
     resolves to the exact slate literal.
     Note: in dark this LOWERS measured chroma for nb and ph — their green and
     orange drag the slate-blue base through a less saturated point on the way to
     their own hue. The hue still moves toward the brand, which is the goal here;
     chroma is not the target. */
  --sidebar:         color-mix(in srgb, var(--primary) calc(4% * var(--poc2-chrome, 0)),
                     color-mix(in srgb, var(--surface-tint) calc(8%  * var(--poc2-chrome, 0)), #f8fafc));
  --sidebar-border:  color-mix(in srgb, var(--primary) calc(4% * var(--poc2-chrome, 0)),
                     color-mix(in srgb, var(--surface-tint) calc(11% * var(--poc2-chrome, 0)), #e2e8f0));
  --sidebar-accent:  color-mix(in srgb, var(--primary) calc(4% * var(--poc2-chrome, 0)),
                     color-mix(in srgb, var(--surface-tint) calc(10% * var(--poc2-chrome, 0)), #f1f5f9));

  /* BAND — the alternating marketing strip. Same stock, same restraint: a band
     is still a surface people read on. It is allowed to be the loudest of them
     because it is a deliberate strip rather than page chrome, and even then
     band-strong only reaches ~9 dE00 off white. */
  --poc2-band:        color-mix(in srgb, var(--surface-tint) calc(7%  * var(--poc2-str)), #ffffff);
  --poc2-band-strong: color-mix(in srgb, var(--surface-tint) calc(13% * var(--poc2-str)), #ffffff);
  --poc2-band-deep:   color-mix(in srgb, var(--poc2-band) 88%, var(--primary));
}

/* ── DARK ───────────────────────────────────────────────────────────────────
   Same rule, same anchor, same order of magnitude. Dark DOES tint its page —
   there is no white-page carve-out here — but the shift is the same 3-8 dE00
   the light surfaces take, so the two modes read as one system rather than two
   recipes. Dark has far more headroom (muted text on --muted is 8.4 against
   light's 5.1) and deliberately does not spend it. */
[data-theme-poc2][data-mode='dark'] {
  /* Greyed toward slate-500 rather than slate-600: the dark deep anchors are
     lighter than their light counterparts, and a mid-slate keeps the stock from
     collapsing into the page it is about to tint. */
  --surface-tint: color-mix(in srgb, var(--primary-deep) 25%, #64748b);

  --background: color-mix(in srgb, var(--surface-tint) calc(12% * var(--poc2-str)), #0f172a);
  --card:       color-mix(in srgb, var(--surface-tint) calc(12% * var(--poc2-str)), #1e293b);
  --popover:    color-mix(in srgb, var(--surface-tint) calc(12% * var(--poc2-str)), #475569);
  --secondary:  color-mix(in srgb, var(--surface-tint) calc(12% * var(--poc2-str)), #1e293b);
  --accent:     color-mix(in srgb, var(--surface-tint) calc(12% * var(--poc2-str)), #334155);
  --muted:      color-mix(in srgb, var(--surface-tint) calc(10% * var(--poc2-str)), #334155);
  --input:      color-mix(in srgb, var(--surface-tint) calc(12% * var(--poc2-str)), #475569);

  /* Same step as light; --ring again left at full strength. */
  --border:       color-mix(in srgb, var(--primary) calc(6% * var(--poc2-str)), #64748b);
  --border-hover: color-mix(in srgb, var(--primary) calc(8% * var(--poc2-str)), #cbd5e1);
  --ring:         color-mix(in srgb, var(--primary) calc(30% * var(--poc2-str)), #94a3b8);

  --sidebar:        color-mix(in srgb, var(--primary) calc(4% * var(--poc2-chrome, 0)),
                    color-mix(in srgb, var(--surface-tint) calc(9%  * var(--poc2-chrome, 0)), #1e293b));
  --sidebar-border: color-mix(in srgb, var(--primary) calc(4% * var(--poc2-chrome, 0)),
                    color-mix(in srgb, var(--surface-tint) calc(12% * var(--poc2-chrome, 0)), #334155));
  --sidebar-accent: color-mix(in srgb, var(--primary) calc(4% * var(--poc2-chrome, 0)),
                    color-mix(in srgb, var(--surface-tint) calc(9%  * var(--poc2-chrome, 0)), #334155));

  --poc2-band:        color-mix(in srgb, var(--surface-tint) calc(16% * var(--poc2-str)), #1e293b);
  --poc2-band-strong: color-mix(in srgb, var(--surface-tint) calc(26% * var(--poc2-str)), #1e293b);
  --poc2-band-deep:   color-mix(in srgb, var(--poc2-band) 88%, var(--primary));
}


/* ── THE AIDEN SURFACE — THE FINAL SHAPE OF THIS POC ────────────────────────
   Aiden is NOT a seventh brand. The six sub-apps are siblings and a theme says
   which room you are in; Aiden is the assistant that walks into whichever room
   you are already in. It is selected by data-surface, it never appears in the
   brand picker, and it composes INSIDE any theme.

   TWO CONSEQUENCES, both decided rather than derived:

   1 · IT TAKES THE MAIN BRAND'S NEUTRALS. Every surface here is re-declared to
       the stock literal, so an Aiden panel inside db keeps db's page and an
       Aiden app of its own sits on plain white. That is not a gap, it is the
       right answer twice over: a panel that repainted its host's surfaces would
       tear a hole in the page, and Aiden's own product is a CHAT — a reading
       surface, where a tint is a liability rather than an asset. Claude and
       ChatGPT are both near-neutral for the same reason.

   2 · THE GRADIENT CARRIES THE IDENTITY, and it is the mark's own ramp — same
       three anchors, same 135deg axis, same 9.7/51.6/90.3 stops. A gradient FAB
       floating in a db page does not read as another brand's button, it reads
       as not being part of the page at all. That is a CATEGORICAL difference,
       where a surface tint is only ever a matter of degree.

   THE RULE THAT PROTECTS IT: gradient fill = Aiden, flat fill = a sub-app.
   Every mark in this system is a three-stop gradient, so it is tempting to push
   that into the six brands' buttons too. Don't. The second gradient in the
   system is the one that kills the first. */
[data-theme-poc2][data-surface='aiden'][data-mode='light'] {
  --background: #ffffff;
  --card:       #ffffff;
  --popover:    #ffffff;
  --secondary:  #e2e8f0;
  --accent:     #f1f5f9;
  --muted:      #cbd5e1;
  --input:      #e2e8f0;
  --border:       #cbd5e1;
  --border-hover: #64748b;
  --sidebar:        #f8fafc;
  --sidebar-border: #e2e8f0;
  --sidebar-accent: #f1f5f9;
}
[data-theme-poc2][data-surface='aiden'][data-mode='dark'] {
  --background: #0f172a;
  --card:       #1e293b;
  --popover:    #475569;
  --secondary:  #1e293b;
  --accent:     #334155;
  --muted:      #334155;
  --input:      #475569;
  --border:       #64748b;
  --border-hover: #cbd5e1;
  --sidebar:        #1e293b;
  --sidebar-border: #334155;
  --sidebar-accent: #334155;
}
/* THE BUTTON FILL IS TWO STOPS. THE MARK STAYS THREE.
   They are not the same object and should not be the same gradient. A mark is
   48px of artwork with nothing on it, so a three-stop ramp reads as depth; a
   button is a wide flat shape with a label across it, and the third stop only
   ever shows up as a band the eye has to cross. Two stops, one sweep.

   The stops are AUTHORED, not derived from the anchors, because both ends have
   to clear the label and the mark's do not. Solved and measured:

     light   #2456e4 -> #5410db   white,  worst across the ramp 5.96
             hover deepens 5 L*   #1a46c2 -> #4605bd, worst 7.78
     dark    #7fb1fe -> #a07efe   ink,    worst 5.87 (violet end = the mark's
             dark deep, so button and mark stay one family)
             hover LIGHTENS 5 L*  #9cc3ff -> #b598ff, worst 7.57

   The hovers move in opposite directions on purpose: light carries a white
   label so darker is more contrast, dark carries ink so lighter is. That is the
   same rule the rest of the system already follows.

   Violet holds across modes (308/308). The BLUE END DOES NOT: 282 in light
   against 271 in dark, 11 degrees apart, which is past the point where two
   colours read as one. Dark's blue is a true sky where light's is an indigo-
   leaning azure. Owner's call, taken with eyes open — dark needs the extra
   lightness to carry ink and the hue moved with it. If the two ever need to be
   the same colour, the fix is light's blue rotating toward 276, not dark's
   toward 282, because dark has no lightness to spare. The shipped
   tokens.scss pair does NOT do this (its dark runs violet to blue, the reverse
   of its light), which is worth fixing at adoption. */
[data-theme-poc2][data-surface='aiden'][data-mode='light'] {
  --aiden-fill:       linear-gradient(135deg, #2456e4 0%, #5410db 100%);
  --aiden-fill-hover: linear-gradient(135deg, #1a46c2 0%, #4605bd 100%);
}
[data-theme-poc2][data-surface='aiden'][data-mode='dark'] {
  --aiden-fill:       linear-gradient(135deg, #7fb1fe 0%, #a07efe 100%);
  --aiden-fill-hover: linear-gradient(135deg, #9cc3ff 0%, #b598ff 100%);
}
/* Anywhere --primary would be a solid FILL, Aiden takes the gradient instead.
   Where it is text or a border it keeps the flat accent, because a gradient
   cannot be a 1px line or a legible label. */
[data-theme-poc2][data-surface='aiden'] .ui-button--default-default,
[data-theme-poc2][data-surface='aiden'] .ui-badge--default,
[data-theme-poc2][data-surface='aiden'] .poc2-aiden-fill,
/* The real <Fab> already paints the Aiden gradient under this surface — but it
   reads the SHIPPED --aiden-primary, and the POC's two-stop gradient lives in
   --aiden-fill. Without this the FAB renders the shipped three-stop violet while
   everything around it is on the new ramp, which is the exact mismatch this POC
   exists to remove. Fab.scss sets it with the background shorthand, so the
   override must use that same property to win, not background-image. */
[data-theme-poc2][data-surface='aiden'] .ui-fab {
  background: var(--aiden-fill);
}
[data-theme-poc2][data-surface='aiden'] .ui-chip--active:not(:disabled),
[data-theme-poc2][data-surface='aiden'] .ui-chip--active:hover:not(:disabled) {
  background-image: var(--aiden-fill);
  border-color: transparent;
}
/* the hover override has to match the base rule's specificity or Button's own
   :hover wins by being more specific than a plain class selector */
[data-theme-poc2][data-surface='aiden'] .ui-button--default-default:hover:not(:disabled),
[data-theme-poc2][data-surface='aiden'] .poc2-aiden-fill:hover {
  background-image: var(--aiden-fill-hover);
}
[data-theme-poc2][data-surface='aiden'] .ui-fab:hover:not(:disabled) {
  background: var(--aiden-fill-hover);
}

/* ── GRADIENTS + MARK ───────────────────────────────────────────────────────
   Just the three anchors, in order. The mark is the artwork; the hero is the
   same ramp stretched across a page band. Nothing is invented here — if the
   anchors change in Figma, both follow.

   THESE READ --mark-mid, NOT --primary. For six brands the two are the same
   value and it makes no difference. For aiden they are 9.2 dE00 apart, and
   using --primary here would drag the mark's violet toward the UI indigo — i.e.
   it would undo the entire reason the two were split. Caught exactly that way:
   the first cut of the split left var(--primary) in this block and the aiden
   mark silently turned indigo while every measurement still passed. */
[data-theme-poc2] {
  /* The scope declares its own text colour. Without this the subtree INHERITS
     whatever colour the surrounding page had — and since a POC scope carries its
     own data-mode, a dark demo sitting on a light Storybook page inherited light
     text and rendered #0f172a on a near-black shell. Only elements that set a
     colour of their own (the components) looked right, which is exactly the kind
     of half-correct that survives a screenshot. */
  color: var(--foreground);

  /* THE MARK RAMP, and the single definition of it. It used to live here at
     140deg/0/52/100 AND again inside .poc2-mark at the solved 135deg/9.7/51.6/
     90.3 — two gradients called the same thing, with the variable quietly
     unused by anything. That is how --aiden-fill came to "not match the mark"
     while looking identical: it matched the rendered mark and disagreed with a
     stale token. One value now, consumed by the mark, the hero and the Aiden
     fill, so they cannot drift apart. */
  --poc2-mark: linear-gradient(135deg,
    var(--mark-a) 9.7%,
    var(--mark-b) 51.6%,
    var(--mark-c) 90.3%);
  --poc2-hero: linear-gradient(135deg,
    var(--mark-mid) 0%,
    var(--primary-deep) 100%);
  /* Shadows carry the DEEP anchor, GREYED. A grey shadow under a saturated
     object reads as dirt, so the brand's own dark end is still in there — but
     the raw deep put a visibly coloured wash under every card. Pre-mixing into
     slate-700 keeps the direction and drops the saturation: chroma across the
     seven falls 25-107 to 5-38. Aiden is the one that stays high, because its
     deep starts at chroma 107 — four times anything else in the set.

     The WEIGHT is unchanged, which is the point of mixing into a slate of
     almost the same lightness rather than just lowering the alpha. Measured
     over a white card the key shadow reads 1.46-1.49 against the page, where
     the raw deep read 1.40-1.55 — same depth, and tighter across brands. */
  --poc2-shadow-stock: color-mix(in srgb, var(--primary-deep) 20%, #334155);
  --poc2-shadow-key: color-mix(in srgb, var(--poc2-shadow-stock) 22%, transparent);
  --poc2-shadow-far: color-mix(in srgb, var(--poc2-shadow-stock) 13%, transparent);
  --poc2-shadow-amb: color-mix(in srgb, var(--foreground) 6%, transparent);

  /* THE BUBBLE FIELD — where the highlight earns its own token. Two soft radial
     washes, highlight in one corner and primary in the other, over whatever
     surface is underneath. Nothing is read ON a bubble (they sit behind a
     centred column), so the highlight is free here in a way it never is on a
     panel: this is the one place the brand gets to be as bright as the mark.
     Alpha is what keeps it safe — the wash is 22%/16% of the anchor, so it
     tints the page rather than replacing it, and the same declaration works on
     a white light page and a tinted dark one. */
  --poc2-bubble:
    radial-gradient(80% 62% at 12% 0%,
      color-mix(in srgb, var(--primary-highlight) calc(22% * var(--poc2-str)), transparent) 0%,
      transparent 68%),
    radial-gradient(72% 58% at 92% 12%,
      color-mix(in srgb, var(--mark-mid) calc(16% * var(--poc2-str)), transparent) 0%,
      transparent 66%),
    radial-gradient(64% 52% at 50% 96%,
      color-mix(in srgb, var(--mark-deep) calc(10% * var(--poc2-str)), transparent) 0%,
      transparent 70%);
}

/* Small NON-TEXT accents may take the highlight raw — a status dot, a chart
   point, a 2px rule. The rule for reaching for --primary-highlight is simply
   whether anything is read on top of it; if something is, it is the wrong
   token and --primary (or --primary-text) is the right one. */
/* ── THE SUITE RAMP ─────────────────────────────────────────────────────────
   The parent brand is not a colour, it is the SET. These two are the only
   things in the file that use every brand at once, and they belong on the
   suite's own page — never inside a sub-app, where the point is that one brand
   is in charge.

   Ordered around the wheel (ph -> nb -> dc -> ec -> db -> aiden -> rm) rather
   than alphabetically, so the ramp reads as a spectrum instead of a list. The
   values are the light PRIMARIES: the deeps would go muddy where they meet and
   the highlights cannot carry text.

   Light and dark are separate blocks because dark needs the dark primaries —
   using the light set on a dark page gives a ramp that reads almost black at
   the ph end. */
[data-theme-poc2][data-mode='light'] .poc2-suite-ramp,
[data-theme-poc2][data-mode='light'] .poc2-suite-text {
  --poc2-ramp: linear-gradient(100deg,
    #9d6d05 0%, #306602 17%, #025750 33%, #06838f 50%, #6264f4 67%, #4f06d7 83%, #d62496 100%);
}
[data-theme-poc2][data-mode='dark'] .poc2-suite-ramp,
[data-theme-poc2][data-mode='dark'] .poc2-suite-text {
  --poc2-ramp: linear-gradient(100deg,
    #c98909 0%, #8bca2f 17%, #0db09d 33%, #10c1db 50%, #689cfe 67%, #c3b5fe 83%, #fe68b8 100%);
}
[data-theme-poc2] .poc2-suite-ramp { background-image: var(--poc2-ramp); }
[data-theme-poc2] .poc2-suite-text {
  background-image: var(--poc2-ramp);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  /* the clip leaves no painted background for a focus ring or selection to sit
     on, so keep this on display type only — never on a control */
}

/* The suite bubble field: one wash per brand instead of one brand's two. Same
   alpha budget as the single-brand field, spread across six corners, so the
   page reads as "all of them" without any one of them winning. */
[data-theme-poc2][data-mode='light'] .poc2-suite-bubbles {
  background-image:
    radial-gradient(46% 52% at 10% 4%,  color-mix(in srgb, #06838f 20%, transparent) 0%, transparent 70%),
    radial-gradient(42% 48% at 34% 0%,  color-mix(in srgb, #025750 17%, transparent) 0%, transparent 70%),
    radial-gradient(44% 50% at 62% 2%,  color-mix(in srgb, #4f06d7 18%, transparent) 0%, transparent 70%),
    radial-gradient(40% 46% at 88% 8%,  color-mix(in srgb, #d62496 15%, transparent) 0%, transparent 70%),
    radial-gradient(38% 44% at 76% 46%, color-mix(in srgb, #9d6d05 12%, transparent) 0%, transparent 72%),
    radial-gradient(38% 44% at 18% 52%, color-mix(in srgb, #306602 12%, transparent) 0%, transparent 72%);
}
[data-theme-poc2][data-mode='dark'] .poc2-suite-bubbles {
  background-image:
    radial-gradient(46% 52% at 10% 4%,  color-mix(in srgb, #10c1db 26%, transparent) 0%, transparent 70%),
    radial-gradient(42% 48% at 34% 0%,  color-mix(in srgb, #0db09d 22%, transparent) 0%, transparent 70%),
    radial-gradient(44% 50% at 62% 2%,  color-mix(in srgb, #a07efe 24%, transparent) 0%, transparent 70%),
    radial-gradient(40% 46% at 88% 8%,  color-mix(in srgb, #fe68b8 18%, transparent) 0%, transparent 70%),
    radial-gradient(38% 44% at 76% 46%, color-mix(in srgb, #c98909 15%, transparent) 0%, transparent 72%),
    radial-gradient(38% 44% at 18% 52%, color-mix(in srgb, #8bca2f 15%, transparent) 0%, transparent 72%);
}

[data-theme-poc2] .poc2-dot { background: var(--primary-highlight); }
/* The doctrine's own examples, made real: a chart point and a 2px rule.
   The ACTIVE line marker takes the highlight — a dot, nothing read on it. */
[data-theme-poc2] .ui-chart__marker--active {
  fill: var(--primary-highlight);
  stroke: var(--primary);
}
/* A 2px artwork rule for card/section tops: highlight -> markDeep, the full
   artwork sweep in a hairline. Decorative; sits on nothing readable. */
[data-theme-poc2] .poc2-card-rule {
  height: 2px;
  border-radius: var(--rounded-full);
  background: linear-gradient(90deg, var(--primary-highlight), var(--mark-deep));
}
[data-theme-poc2] .poc2-bubble-field { background-image: var(--poc2-bubble); }

/* THE MARK DOES NOT INVERT, AND ITS GLYPH IS ALWAYS WHITE.
   It reads --mark-a/b/c, which carry the LIGHT anchors in both modes. An app
   mark is brand artwork, not a themed component — an iOS icon is the same
   object whatever the system theme is doing, and treating it like a surface is
   what produced the problem this fixes.

   WHAT THE MODE-AWARE VERSION LOOKED LIKE: dark's anchors are lighter by
   construction (middles at L* 57-64 against light's 45-50), so in dark the
   marks came out 8-14 points BRIGHTER than in light, on a page 87 points
   darker. They stopped being objects and became lamps, and because the glyph
   tracked --primary-foreground it went ink — a light-mode sticker pasted onto a
   dark page. All the glass work assumes a mid-dark tile: the white sheen, the
   inner highlights and the bloom all do nothing on a pale one.

   Constant marks also retire a whole class of drift. The dark anchors have had
   none of the light-side work, and this removes the most visible place that
   showed.

   COST, MEASURED: the tile now sits 3.17-3.25 against the dark page rather than
   4.18-5.26. Still above the 3:1 that WCAG 1.4.11 wants for a UI boundary — but
   AIDEN IS 2.70 and does not clear it. Its ramp is the darkest in the set. On a
   dark page an Aiden FAB needs a ring or a shadow to hold its edge; the fill
   alone is not enough. Nothing else in the set has this problem. */
/* ── THE MARK, LAYER FOR LAYER ──────────────────────────────────────────────
   Read straight off the Figma component (128x128, radius 28.8 = 22.5%). The
   earlier version had the brand ramp and a flat white wash and stopped there,
   which is why it read as a coloured tile rather than as glass: it was missing
   four of the six layers. Bottom to top the real mark is

     1  brand ramp        linear, 3 stops
     2  radial highlight  a soft white lift above centre
     3  bloom             a pale blue glow hanging off the top-left corner
     4  sheen             a white band down the top half
     5  sparkle           a small blurred dot, upper left
     6  icon              centred at 46%

   plus one drop shadow and three inner shadows. Three further drop shadows
   exist in the component and are switched OFF — they are not reproduced here.

   GEOMETRY IS DERIVED, NOT EYEBALLED. Figma stores a gradientTransform, not an
   angle, so the ramp was solved back to CSS: its axis runs (0.5,-0.31) to
   (1.31,0.5) in unit space, which is 135deg, and projecting Figma's 0/0.52/1
   stops onto the CSS gradient line for a square box puts them at 9.7/51.6/90.3%.
   Using 0/52/100% instead — the obvious guess — compresses the whole ramp and
   loses the deep corner entirely.

   Everything is expressed in PERCENT so one rule serves 22px and 128px. The two
   exceptions take --poc2-mark-px, set inline by the component, because a blur
   radius and a shadow offset cannot be a percentage. */
[data-theme-poc2] .poc2-mark {
  --poc2-mark-px: 48px;
  position: relative;
  display: grid;
  place-items: center;
  flex: none;
  isolation: isolate;
  overflow: hidden;
  border-radius: 22.5%;
  color: #ffffff;
  background-image:
    /* 3 · bloom — Figma has this as a 129px ellipse hung at (-39,-37); as a
       background layer that is a 25%-radius glow centred at 20%/22%. */
    radial-gradient(25% 25% at 20% 22%,
      color-mix(in srgb, #bfe0ff 23%, transparent) 0%,
      color-mix(in srgb, #bfe0ff 9%, transparent) 50%,
      transparent 100%),
    /* 2 · radial highlight — alpha is the fill's 0.7/0.3/0 times the layer's
       0.4, folded in, because CSS has no layer opacity on a background. */
    radial-gradient(35% 35% at 45% 40%,
      color-mix(in srgb, #ffffff 28%, transparent) 0%,
      color-mix(in srgb, #b2d9ff 12%, transparent) 40%,
      transparent 100%),
    /* 1 · the brand ramp — from --poc2-mark, the one definition */
    var(--poc2-mark);
  box-shadow:
    0 calc(var(--poc2-mark-px) * 0.023) calc(var(--poc2-mark-px) * 0.047) rgba(35, 14, 75, 0.4),
    inset 0 calc(var(--poc2-mark-px) * -0.031) calc(var(--poc2-mark-px) * 0.063) rgba(35, 14, 75, 0.3),
    inset 0 calc(var(--poc2-mark-px) * 0.023) calc(var(--poc2-mark-px) * 0.047) calc(var(--poc2-mark-px) * -0.016) rgba(255, 255, 255, 0.35),
    inset calc(var(--poc2-mark-px) * -0.016) calc(var(--poc2-mark-px) * 0.016) calc(var(--poc2-mark-px) * 0.023) calc(var(--poc2-mark-px) * -0.008) rgba(204, 229, 255, 0.25);
}
/* 4 · sheen — a 128x67 rectangle at the top, so 52.3% of the height. */
[data-theme-poc2] .poc2-mark::before {
  content: '';
  position: absolute;
  /* overhangs the sides so no vertical edge is ever inside the clip; the tile's
     own overflow:hidden trims it. No border-radius — a percentage radius here
     resolves against the BAND's box, not the tile's, giving it elliptical
     corners of its own that read as curved highlights. */
  inset: 0 -10% auto -10%;
  height: 52.3%;
  background-image: linear-gradient(180deg,
    rgba(255, 255, 255, 0.245) 0%,
    rgba(229, 242, 255, 0.074) 35%,
    rgba(255, 255, 255, 0) 70%);
  pointer-events: none;
}
/* 5 · sparkle — a 12px dot at (20,20) on a 128 box, blurred 4.
   Figma's version is a flat white circle at alpha 0.32 under a 4px layer blur,
   which at small sizes disappears into the sheen. Made more legible WITHOUT
   making it bigger or busier: a radial with a bright core and a soft falloff,
   and a tighter blur. A blurred flat disc reads as a smudge; a core with
   falloff reads as a point of light, and it survives being scaled down.
   Still static — see the MOTION block for why. */
[data-theme-poc2] .poc2-mark::after {
  content: '';
  position: absolute;
  left: 14.4%;
  top: 14.4%;
  width: 12%;
  height: 12%;
  border-radius: 50%;
  background: radial-gradient(circle at 50% 50%,
    rgba(255, 255, 255, 0.92) 0%,
    rgba(255, 255, 255, 0.5) 42%,
    rgba(255, 255, 255, 0.12) 72%,
    transparent 100%);
  filter: blur(calc(var(--poc2-mark-px) * 0.016));
  pointer-events: none;
}
/* The glyph has to sit ABOVE the sheen, and a grid child with no z-index would
   not — ::before is painted after it in the same stacking context. */
[data-theme-poc2] .poc2-mark > * {
  position: relative;
  z-index: 1;
}

/* ── MOTION ─────────────────────────────────────────────────────────────────
   Opt-in, via .poc2-mark--live.

   TWO AMBIENT LAYERS, AND THE SPARKLE IS NOT ONE OF THEM.

     BLOOM  drifts — a slow orbit and swell, 11s
     SHEEN  tilts  — the band swells and slides, 7.3s

   Both run long and share no common factor, so the pair never lines up and the
   composite has no visible loop.

   The SPARKLE keeps Figma's position and size and gets a specular's behaviour:
   it swells and dims IN PHASE with the sheen, and slides across the tile when
   the tile tilts on hover. Two earlier passes made it louder than that — a
   pulse, then three four-point stars — and both times it stopped being a
   highlight and became the thing you looked at. A mark's job is to show its
   glyph; the sparkle is a detail on the glass.

   The streak went the same way: solved faithfully from the owner's frame,
   genuinely pretty, and one more moving thing on a 26px tile. Removed.

   Everything that remains is either very slow (bloom, sheen) or only happens
   because you pointed at it (hover). Durations are literals — longer than
   anything in the token scale and tuned against each other; the reduced-motion
   block stops them rather than shortening them. */
@keyframes poc2-bloom-drift {
  0%   { transform: translate3d(0, 0, 0) scale(1);       opacity: 0.85; }
  30%  { transform: translate3d(6%, 4%, 0) scale(1.14);  opacity: 1; }
  62%  { transform: translate3d(-3%, 7%, 0) scale(0.96); opacity: 0.7; }
  100% { transform: translate3d(0, 0, 0) scale(1);       opacity: 0.85; }
}
/* SCALE AND FADE ONLY — no translate, no rotate.
   The earlier version moved the sheen down 2% and rotated it 1.5deg. The sheen
   is a band pinned to the top of the tile whose BRIGHTEST point is its top edge
   (alpha 0.243), so any move that lifts that edge off y=0 exposes it: a bright
   line running the full width, sliding up and down every 7 seconds. The rotate
   did the same thing to one top corner at a time.
   transform-origin is 50% 0%, so scaleY only ever grows DOWNWARD, into the
   gradient's own falloff, and the top edge cannot move. */
@keyframes poc2-sheen-tilt {
  0%   { transform: scaleY(1);    opacity: 0.72; }
  40%  { transform: scaleY(1.16); opacity: 1; }
  70%  { transform: scaleY(0.92); opacity: 0.58; }
  100% { transform: scaleY(1);    opacity: 0.72; }
}
/* THE SPARKLE IS A LENS FLARE, so it stays put. A highlight is caused by one
   fixed light and one fixed surface; it does not tour the tile. An earlier pass
   had it hopping between three corners, which read as three different sparkles
   rather than one piece of glass catching the light.

   It holds Figma's corner and WANDERS — a slow lopsided drift of at most 4% of
   the tile, with the intensity swelling and falling underneath it. The drift is
   biased up and left (no keyframe moves it right of its resting x) so it can
   never approach the glyph, which starts at 27.1%.

   Back on the sheen's 7.3s clock, in phase: one light, one surface.

   SEPARATE TRANSFORM PROPERTIES ARE WHY THIS WORKS. The loop owns translate and
   opacity; hover owns scale. Those are individual properties in modern CSS, not
   one composited transform, so a transition and an animation can hold one each
   without fighting. The version that put both on transform had to swap the
   animation-name on hover — and an animation ending has no exit easing at all,
   which is exactly the snap-back that felt harsh. */
@keyframes poc2-spark-flare {
  0%   { opacity: 0.72; translate: 0 0; }
  26%  { opacity: 0.96; translate: -30% 18%; }
  52%  { opacity: 0.60; translate: -8% -26%; }
  76%  { opacity: 0.88; translate: -22% 6%; }
  100% { opacity: 0.72; translate: 0 0; }
}
@keyframes poc2-mark-sweep {
  0%   { transform: translate3d(-140%, 0, 0) rotate(8deg); opacity: 0; }
  12%  { opacity: 1; }
  88%  { opacity: 1; }
  100% { transform: translate3d(140%, 0, 0) rotate(8deg);  opacity: 0; }
}

/* THE EXIT IS SLOWER AND SOFTER THAN THE ENTRY. The base rule is what plays
   when the pointer LEAVES, so it gets the long ease-out; the :hover rule below
   gets the shorter spring. Using one transition for both directions means
   either the entry is dull or the exit snaps — and a spring easing on the way
   out overshoots back toward rest, which reads as a flinch. */
[data-theme-poc2] .poc2-mark--live {
  transition:
    transform 460ms var(--ease-out),
    box-shadow 460ms var(--ease-out);
}
/* The live mark drops only the STATIC bloom, which becomes a real element so it
   can be transformed. The sparkle stays on ::after exactly as the static mark
   has it. Re-declared in full rather than unset piecemeal — a background-image
   is one property, not a list you can reach into. */
[data-theme-poc2] .poc2-mark--live {
  background-image:
    radial-gradient(35% 35% at 45% 40%,
      color-mix(in srgb, #ffffff 28%, transparent) 0%,
      color-mix(in srgb, #b2d9ff 12%, transparent) 40%,
      transparent 100%),
    linear-gradient(135deg,
      var(--primary-highlight) 9.7%,
      var(--mark-mid) 51.6%,
      var(--mark-deep) 90.3%);
}
[data-theme-poc2] .poc2-mark--live::before {
  animation: poc2-sheen-tilt 7300ms var(--ease-in-out) infinite;
  transform-origin: 50% 0%;
}
/* the live mark's sparkle is a real element so it can migrate; ::after stays
   as the static mark's single fixed highlight */
[data-theme-poc2] .poc2-mark--live::after { content: none; }
/* The flare is TWO elements. The loop owns the inner one's translate; the
   pointer owns the wrapper's. Same reason as before — one property, one owner —
   but this time the two owners are an animation and a live input rather than an
   animation and a transition. */
[data-theme-poc2] .poc2-mark__flare {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}
[data-theme-poc2] .poc2-mark__spark {
  position: absolute;
  /* Figma rests this at 14.4%. Moved inward to 17% so the ambient drift and the
     pointer offset together can never reach an edge — worst case now leaves
     about 6% of the tile between the flare and the corner, against a version
     that could push it past the boundary entirely and clip it in half. */
  left: 17%;
  top: 17%;
  width: 12%;
  height: 12%;
  z-index: 0;
  pointer-events: none;
  border-radius: 50%;
  background: radial-gradient(circle at 50% 50%,
    rgba(255, 255, 255, 0.92) 0%,
    rgba(255, 255, 255, 0.5) 42%,
    rgba(255, 255, 255, 0.12) 72%,
    transparent 100%);
  filter: blur(calc(var(--poc2-mark-px) * 0.016));
  animation: poc2-spark-flare 7300ms var(--ease-in-out) infinite;
  /* grows from its lower-left, so gaining size also shifts it up and right —
     which is the direction the tile turns */
  transform-origin: 20% 80%;
  scale: 1;
  transition: scale 460ms var(--ease-out);
}

[data-theme-poc2] .poc2-mark__bloom {
  position: absolute;
  left: -30%;
  top: -29%;
  width: 101%;
  height: 101%;
  z-index: 0;
  pointer-events: none;
  border-radius: 50%;
  background-image: radial-gradient(circle at 50% 50%,
    color-mix(in srgb, #bfe0ff 23%, transparent) 0%,
    color-mix(in srgb, #bfe0ff 9%, transparent) 50%,
    transparent 100%);
  animation: poc2-bloom-drift 11000ms var(--ease-in-out) infinite;
  transition: opacity var(--duration-slow) var(--ease-out);
}

[data-theme-poc2] .poc2-mark__sweep {
  position: absolute;
  inset: -20% -60%;
  z-index: 0;
  opacity: 0;
  pointer-events: none;
  /* Halved, and widened. At 0.30/0.50/0.30 over a 10% band this was a hard
     bright bar crossing the tile; at 0.13/0.22/0.13 over 24% it is a shift in
     the light. The falloff matters as much as the peak — a narrow band reads as
     an edge however faint you make it. */
  background-image: linear-gradient(100deg,
    transparent 0%,
    rgba(255, 255, 255, 0.13) 38%,
    rgba(255, 255, 255, 0.22) 50%,
    rgba(255, 255, 255, 0.13) 62%,
    transparent 100%);
  transform: translate3d(-140%, 0, 0) rotate(8deg);
}

/* the glyph rides above everything and moves against the tilt */
[data-theme-poc2] .poc2-mark--live > svg {
  transition:
    transform 460ms var(--ease-out),
    filter 460ms var(--ease-out);
}

/* ── HOVER ── lift, tilt, and the shadow that has to follow it ── */
[data-theme-poc2] .poc2-mark--live:hover {
  transition:
    transform var(--duration-normal) var(--ease-spring),
    box-shadow var(--duration-normal) var(--ease-out);
  transform:
    perspective(520px)
    rotateX(7deg)
    rotateY(-9deg)
    translateY(-5%)
    scale(1.05);
  box-shadow:
    /* the drop grows and swings right/down, because that is where the light
       now is — a lift with an unchanged shadow reads as a sticker */
    calc(var(--poc2-mark-px) * 0.05) calc(var(--poc2-mark-px) * 0.11) calc(var(--poc2-mark-px) * 0.19) calc(var(--poc2-mark-px) * -0.03) rgba(35, 14, 75, 0.45),
    inset 0 calc(var(--poc2-mark-px) * -0.031) calc(var(--poc2-mark-px) * 0.063) rgba(35, 14, 75, 0.3),
    inset 0 calc(var(--poc2-mark-px) * 0.031) calc(var(--poc2-mark-px) * 0.055) calc(var(--poc2-mark-px) * -0.016) rgba(255, 255, 255, 0.5),
    inset calc(var(--poc2-mark-px) * -0.016) calc(var(--poc2-mark-px) * 0.016) calc(var(--poc2-mark-px) * 0.023) calc(var(--poc2-mark-px) * -0.008) rgba(204, 229, 255, 0.25);
}
/* parallax: the glyph goes the OTHER way and casts its own shadow, which is
   what actually sells the depth — the glass turns, the icon floats over it */
[data-theme-poc2] .poc2-mark--live:hover > svg {
  transition:
    transform var(--duration-normal) var(--ease-spring),
    filter var(--duration-normal) var(--ease-out);
  transform: translate3d(4%, -4%, 0) scale(1.06);
  filter: drop-shadow(0 calc(var(--poc2-mark-px) * 0.02) calc(var(--poc2-mark-px) * 0.035) rgba(35, 14, 75, 0.45));
}
[data-theme-poc2] .poc2-mark--live:hover .poc2-mark__sweep { animation: poc2-mark-sweep 1100ms var(--ease-out); }
[data-theme-poc2] .poc2-mark--live:hover .poc2-mark__bloom { opacity: 1.3; }
/* only SCALE on hover — translate belongs to the migration loop, and the two
   are separate properties precisely so neither has to yield */
[data-theme-poc2] .poc2-mark--live:hover .poc2-mark__spark {
  transition: scale var(--duration-normal) var(--ease-spring);
  scale: 1.55;
}

@media (prefers-reduced-motion: reduce) {
  /* the global block in tokens.scss zeroes DURATIONS; an infinite animation at
     0.01ms still churns frames, so these stop outright. */
  [data-theme-poc2] .poc2-mark__bloom,
  [data-theme-poc2] .poc2-mark--live::before,
  [data-theme-poc2] .poc2-mark__spark,
  [data-theme-poc2] .poc2-mark--live:hover .poc2-mark__sweep { animation: none; }
  [data-theme-poc2] .poc2-mark__spark { opacity: 0.85; translate: 0 0; }
  [data-theme-poc2] .poc2-mark--live:hover,
  [data-theme-poc2] .poc2-mark--live:hover > svg { transform: none; }
  [data-theme-poc2] .poc2-mark--live:hover .poc2-mark__spark { scale: 1; }
}

/* ── POINTER TILT ───────────────────────────────────────────────────────────
   The tvOS parallax: the tile turns to follow the pointer and its layers
   separate in depth, so it reads as a physical object under glass rather than a
   picture that scales.

   Opt-in via .poc2-mark--tilt, and DRIVEN ENTIRELY BY TWO NUMBERS. A tiny
   pointer handler writes --mx and --my (both -1 to 1, origin at the tile's
   centre) and --on (0 at rest, 1 while tracking); every rule below is a calc
   off those three. No per-frame style writing beyond the variables, no layout
   reads in the loop, and the whole thing falls back to nothing if the handler
   never runs.

   WHAT MOVES, AND HOW FAR, IS THE WHOLE DESIGN:

     tile    rotates up to 11 degrees, lifts and scales — the object turning
     bloom   drifts WITH the tilt, and least: it is furthest back
     sheen   shifts with it, a little more
     flare   sweeps AGAINST it, hardest of all — a specular does not sit still
             on a turning surface, and this is the detail that sells the glass
     icon    moves against the tilt too — parallax, so it floats above the face
     shadow  swings opposite the tilt and deepens, because the light did not move

   The tracking transition is deliberately SHORT (110ms) so the tile feels
   attached to the pointer, and the RETURN is the long 460ms ease-out from the
   base rule. One duration for both would either lag under the finger or snap on
   release. */
[data-theme-poc2] .poc2-mark--tilt {
  --mx: 0;
  --my: 0;
  --on: 0;
  transform:
    perspective(560px)
    rotateX(calc(var(--my) * -11deg))
    rotateY(calc(var(--mx) * 11deg))
    translateY(calc(var(--on) * -4%))
    scale(calc(1 + var(--on) * 0.06));
  box-shadow:
    calc(var(--mx) * var(--poc2-mark-px) * -0.07)
      calc(var(--poc2-mark-px) * (0.023 + var(--on) * 0.07))
      calc(var(--poc2-mark-px) * (0.047 + var(--on) * 0.1))
      calc(var(--poc2-mark-px) * var(--on) * -0.02)
      rgba(35, 14, 75, 0.42),
    inset 0 calc(var(--poc2-mark-px) * -0.031) calc(var(--poc2-mark-px) * 0.063) rgba(35, 14, 75, 0.3),
    inset 0 calc(var(--poc2-mark-px) * 0.023) calc(var(--poc2-mark-px) * 0.047) calc(var(--poc2-mark-px) * -0.016) rgba(255, 255, 255, 0.35),
    inset calc(var(--poc2-mark-px) * -0.016) calc(var(--poc2-mark-px) * 0.016) calc(var(--poc2-mark-px) * 0.023) calc(var(--poc2-mark-px) * -0.008) rgba(204, 229, 255, 0.25);
}
[data-theme-poc2] .poc2-mark--tilt:hover {
  transition-duration: 110ms;
  transition-timing-function: var(--ease-out);
}
[data-theme-poc2] .poc2-mark--tilt .poc2-mark__bloom,
[data-theme-poc2] .poc2-mark--tilt .poc2-mark__flare,
[data-theme-poc2] .poc2-mark--tilt > svg {
  transition: translate 460ms var(--ease-out);
}
[data-theme-poc2] .poc2-mark--tilt:hover .poc2-mark__bloom,
[data-theme-poc2] .poc2-mark--tilt:hover .poc2-mark__flare,
[data-theme-poc2] .poc2-mark--tilt:hover > svg {
  transition-duration: 110ms;
}
[data-theme-poc2] .poc2-mark--tilt .poc2-mark__bloom { translate: calc(var(--mx) * 4%) calc(var(--my) * 4%); }
/* THE SHEEN MAY ONLY EVER MOVE UP. Its brightest point is its top edge, pinned
   at y=0; any downward move lifts that edge into view as a bright line the full
   width of the tile. The (--my - 1) bias makes the vertical term 0 at the very
   bottom of the tile and -5% at the top, so it is negative or zero and never
   positive. Same bug the sheen KEYFRAMES had — it came back the moment a second
   thing was allowed to move this layer.
   Horizontally it travels at most 5% of its own width, which is 5.6% of the
   tile, inside the 10% overhang each side, so no vertical edge can appear
   either. */
[data-theme-poc2] .poc2-mark--tilt::before        { translate: calc(var(--mx) * 5%) calc((var(--my) - 1) * 2.5%); }
/* -22%/-18% put the flare past the tile edge at full deflection. The travel
   budget has to be spent against the RESTING position and the ambient drift,
   not in isolation: base 17, ambient reaches -3.6, pointer reaches -7, leaves
   6.4% clear of the left edge at worst. */
[data-theme-poc2] .poc2-mark--tilt .poc2-mark__flare { translate: calc(var(--mx) * -7%) calc(var(--my) * -6%); }
[data-theme-poc2] .poc2-mark--tilt > svg {
  translate: calc(var(--mx) * -7%) calc(var(--my) * -7%);
  filter: drop-shadow(
    calc(var(--mx) * var(--poc2-mark-px) * -0.012)
    calc(var(--poc2-mark-px) * var(--on) * 0.022)
    calc(var(--poc2-mark-px) * var(--on) * 0.035)
    rgba(35, 14, 75, 0.4));
}
/* the tilt supersedes the plain hover lift — both write transform, and the
   later rule would otherwise win by source order rather than by intent */
[data-theme-poc2] .poc2-mark--tilt:hover { transform: none; }
[data-theme-poc2] .poc2-mark--tilt:hover > svg { transform: none; }
@media (prefers-reduced-motion: reduce) {
  [data-theme-poc2] .poc2-mark--tilt,
  [data-theme-poc2] .poc2-mark--tilt > svg { transform: none; }
  [data-theme-poc2] .poc2-mark--tilt .poc2-mark__bloom,
  [data-theme-poc2] .poc2-mark--tilt .poc2-mark__flare,
  [data-theme-poc2] .poc2-mark--tilt::before,
  [data-theme-poc2] .poc2-mark--tilt > svg { translate: none; }
}

[data-theme-poc2] .poc2-hero { background-image: var(--poc2-hero); }
[data-theme-poc2] .poc2-hero-cta > .ui-button { background-image: var(--poc2-hero); }
[data-theme-poc2] .poc2-band { background: var(--poc2-band); }
[data-theme-poc2] .poc2-band-strong { background: var(--poc2-band-strong); }
/* The rail gradient. This used to target a hand-drawn .poc2-rail; the dashboards
   now render the real <Sidebar>, so it targets .ui-sidebar — the element that
   actually carries --sidebar. Worth the swap: the sidebar surface is a separate
   six-token palette that a data-theme deliberately does NOT reach, so hand-
   drawing the rail meant the one piece of chrome most people call "the theme"
   was never being exercised at all. */
[data-theme-poc2] .ui-sidebar__inner {
  background-image: linear-gradient(180deg,
    var(--sidebar) 0%,
    color-mix(in srgb, var(--sidebar) 82%, var(--background)) 100%);
  box-shadow: inset -1px 0 0 color-mix(in srgb, var(--foreground) 8%, transparent);
}

/* The provider is built for a full page (min-height: 100svh); inside a 560px
   demo frame that is wrong. Not a component bug — the frame adapts, scoped to
   the POC dashboards so nothing else is caught by it.
   collapsible="none" is deliberate here and does more than pick a variant: it
   returns BEFORE both the position: fixed container and the sub-768px Drawer
   swap, so six sidebars in a column cannot escape their frames or silently
   vanish into drawers when the window is narrow. */
[data-theme-poc2] .poc2-dash .ui-sidebar-provider {
  min-height: 0;
  height: 100%;
}
/* Width, flex-shrink and the border already come from .ui-sidebar__inner--static;
   only the height needs help. .ui-sidebar__inner sets height: 100%, which resolves
   against an auto-height flex parent and collapses to content — and an explicit
   height also cancels the align-self: stretch that would have filled the row. The
   rail rendered 229px tall in a 936px frame. Hand it back to stretch. */
[data-theme-poc2] .poc2-dash .ui-sidebar__inner--static {
  height: auto;
  align-self: stretch;
}
/* The card carries NO brand fill. It used to take a 4% highlight sheen down its
   top edge; that is a surface people read on, so under the deep-only rule it
   goes. Depth comes from the shadows instead — which are the deep anchor, so the
   card is still lit by the brand without being coloured by it. */
[data-theme-poc2] .ui-card {
  box-shadow:
    0 1px 1px var(--poc2-shadow-amb),
    0 4px 12px var(--poc2-shadow-far),
    0 20px 48px var(--poc2-shadow-far);
  transition: box-shadow var(--duration-normal) var(--ease-out),
              transform var(--duration-normal) var(--ease-out);
}
[data-theme-poc2] .ui-card--interactive:hover {
  transform: translateY(calc(-1 * var(--motion-slide-sm)));
  box-shadow:
    0 1px 1px var(--poc2-shadow-amb),
    0 8px 20px var(--poc2-shadow-far),
    0 32px 64px var(--poc2-shadow-key);
}
@media (prefers-reduced-motion: reduce) {
  /* the global block in tokens.scss collapses DURATIONS only, so a transform
     would still teleport */
  [data-theme-poc2] .ui-card--interactive:hover { transform: none; }
}
[data-theme-poc2] .poc2-display { letter-spacing: var(--tracking-tight); }
[data-theme-poc2] .poc2-stat {
  letter-spacing: var(--tracking-tight);
  font-variant-numeric: tabular-nums;
  background-image: var(--poc2-hero);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
`.trim();
