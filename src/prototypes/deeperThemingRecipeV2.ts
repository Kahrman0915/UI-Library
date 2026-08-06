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
 * THE MODEL: wheel order ph(57) nb(136) dc(185) ec(240) db(277) aiden(283)
 * rm(348) — ph and ec updated 2026-08-06 when the owner chose the burnt orange
 * and the azure over the gold and the teal. True RED stays ceded to --error;
 * orange and magenta carry the warmth, and ph now shares a sector with
 * --warning under a written waiver rather than dodging it. ec<->db and
 * db<->aiden separate by LIGHTNESS, not hue.
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
 * ADJACENCY IS A DECISION HERE, NOT A DEFECT. Four of the seven deeps now sit
 * in the same blue family — ec joined them when it left the teal — and that is
 * deliberate:
 *
 *   db and aiden once shared a deep so their surfaces would be byte-identical.
 *   That rule is now MOOT rather than broken: aiden takes the main neutrals, so
 *   it never derives a surface from its deep at all, and the two match by
 *   construction whatever the deeps do. Aiden's deep is mark artwork only.
 *
 *   ec is the live case now that it is blue: it sits beside db on the wheel at
 *   ΔE 13.4 light / 11.6 dark — over the 8.5 hard floor, under the 15 target.
 *   It holds by LIGHTNESS (ec dark runs L 0.78 against db's 0.70), the same
 *   construction that separates db from aiden. Do not "tidy" ec darker.
 *
 * So do NOT "fix" a small surface distance by measurement alone. Which pairs
 * are allowed to look alike is a product question about which apps sit side by
 * side, and only the owner can answer it.
 *
 * AIDEN IS NO LONGER DERIVED HERE (2026-08-06). Its anchors are the shipped
 * --aiden-gradient-start/-mid/-end, copied from tokens.scss, because Aiden is
 * the one identity in this file that already exists in the product. The v2
 * round did solve its own (#b5cffd -> #4f06d7 -> #2e0186, a cleaner lightness
 * falloff), and that is precisely the problem: a POC showing a different Aiden
 * than the app renders teaches the wrong thing.
 */
export const BRAND_ANCHORS = {
  // db's LIGHT primary and deep rotated 277 -> 268 (owner, 2026-08-06: "light
  // mode goes slightly too purple"). The eye was reading a real defect: db's
  // primary drifted 15 degrees between modes, the largest in the set and past
  // the 12-degree limit this file set itself — every other brand runs 2-12.
  // The hand-tuned mark deep had just made it MORE visible, not less: at 276/273
  // the mark became consistent across modes while the UI stayed 15 apart, so the
  // logo said "one brand" and the buttons did not.
  //
  // Rotating LIGHT toward dark's 262 (rather than dark toward light) is what the
  // owner asked for and is also the cheaper direction: it costs nothing and pays
  // twice. db<->aiden — the tightest identity pair in the whole set — improves
  // 9.2 -> 10.2 because db moves AWAY from aiden's violet, and the light mark's
  // hue sweep becomes monotonic (228 -> 268 -> 276) where before it overshot the
  // mark deep and came back (228 -> 277 -> 276).
  //
  // Stopped at 268, not the full 262: the ask was "just slightly", and 6 degrees
  // of drift is inside the house limit and in line with nb (6) and aiden (7).
  // The whole move is dE 3.4. All db gates re-checked: white 4.54, --primary-text
  // 5.56, deep dE 15.0, chart chain 15/24/25, ec 11.5, aiden 10.2, info 13.7.
  db:    { light: ['#8cdafd', '#466af4', '#0d3bbf'], dark: ['#8cdafd', '#689cfe', '#046de9'], markDeep: { light: '#3419ba', dark: '#3b27ed' }, accent: { light: '#2892ba', dark: '#33b3e3' }, chart2Dark: '#c7dbff', on: { light: '#ffffff', dark: '#0f172a' }, icon: 'chart-column' },
  // nb SEPARATES ITS MARK FROM ITS PRIMARY (owner, 2026-08-06 — "the only thing
  // I don't like about current nb is the light mode mark"). The cause was
  // measurable: every other brand's light mark has its middle stop at L 0.56-0.59
  // with the white glyph at ~4.5, but nb's sat at L 0.45 / 6.94 — a much darker,
  // muddier tile that fell 0.40 in lightness from the first stop. That darkness
  // is not a style choice, it is nb's CVD budget: its primary was solved to a 6.9
  // AA target rather than 4.5 precisely so it could not be confused with the gold
  // under a red-green anomaly. THAT CONSTRAINT IS FUNCTIONAL — it exists because
  // charts and brand chips put the two side by side. A logo pays no such debt.
  // So the mark's middle is now the green nb would have had at the ordinary 4.5
  // floor (#418605, L 0.553, glyph 4.53 — the family's own shape), while
  // `primary` pins the functional colour to today's #306602 exactly. Buttons,
  // chart slot 1, tints and every gate are untouched; only the artwork moves.
  // markDeep rises with it, from a near-black #063a26 to a real emerald.
  nb:    { light: ['#c9db29', '#418605', '#183a00'], dark: ['#c9db29', '#8bca2f', '#649807'], markDeep: { light: '#105b3e', dark: '#249d6e' }, accent: { light: '#919a61', dark: '#a3a985' }, chart2Dark: '#8fa37c', on: { light: '#ffffff', dark: '#0f172a' }, primary: { light: '#306602', dark: '#8bca2f' }, icon: 'file-text' },
  // dc's LIGHT MARK DEEP was raised #032930 -> #0c4b55 (owner, 2026-08-06:
  // "light mode just seems really deep"). It was, measurably: at L 0.259 it was
  // the darkest third stop in the set by a distance — the rest of the family
  // sits 0.39-0.48 — and the step down from the middle stop was 0.280 against a
  // family norm of 0.13-0.19, so dc's light mark fell off a cliff where every
  // other mark eases down.
  //
  // The cause was the primary edit one step removed: this value was derived
  // from dc's OLD deep, so when the primary rose from L 0.411 to 0.539 the
  // middle stop moved and the third did not, doubling the gap between them.
  // Anything derived from an anchor has to be re-derived when that anchor moves.
  //
  // Stopped at L 0.38: the step lands at 0.158, between db (0.185) and nb
  // (0.133), and it keeps dE 6.6 from the DARK mark deep. Going further ran the
  // two modes together — at L 0.44 they measure dE 1.0, which would erase the
  // light/dark distinction on that stop entirely. --primary-deep is untouched at
  // #002b27; the surface tint and hero still want the dark end.
  //
  // dc's LIGHT PRIMARY was brightened by hand (owner, 2026-08-06: #025750 ->
  // #127f76, L 0.411 -> 0.539). Everything it owns still passes — white 4.86,
  // --primary-text 5.98, deep dE 28.2, chart chain 28/40/29, neighbours nb 13.2
  // and ec 10.8 — with ONE cost, and it is not small: clearance from --success
  // falls 10.7 -> 4.8, well under the 8.5 impersonation line.
  //
  // THIS IS NOT FIXABLE BY TUNING, which is worth knowing before anyone tries.
  // Sweeping lightness at this hue: dc clears success up to L 0.425 and then
  // crowds it for the entire band from 0.44 to 0.56 (bottoming at 3.8), because
  // --success sits at L 0.508 on a neighbouring hue. Chroma cannot rescue it —
  // the gamut at teal caps near 0.09 there, BELOW success's own 0.105 — and
  // rotating toward cyan only trades the collision for --info (hue 204 gives
  // success 7.2 but info 8.3). A bright teal and a muted pine at the same
  // lightness are the same colour to the eye; there is no third option.
  //
  // So this is a WAIVER like ec/--info and ph/--warning, and it should be
  // recorded in semWaiver if it is adopted — but it is the tightest of the
  // three (4.8 against their 6.0 and 6.5), and success-beside-teal is a far
  // more common chart pairing than info-beside-blue. The honest alternative is
  // #035b54 (L 0.425), which is most of the brightness and still clears 9.5.
  dc:    { light: ['#4eeeaf', '#127f76', '#002b27'], dark: ['#4eeeaf', '#0db09d', '#057d70'], markDeep: { light: '#0c4b55', dark: '#075e6f' }, accent: { light: '#789d8b', dark: '#89af9c' }, chart2Dark: '#6be1cf', on: { light: '#ffffff', dark: '#0f172a' }, icon: 'globe' },
  // ec = THE BLUE (owner, 2026-08-06; was teal 206/212). v1's azure restored at
  // hue 240 — which IS --info's hue, so it crowds that semantic by design:
  // dE 6.0 light / 6.9 dark against an 8.5 impersonation line. The owner waived
  // it knowingly ("not all of these brands are going to be using charts that
  // need both a warning and an error"); the condition is the icon+label rule.
  // Its DARK anchor is pushed bright (L 0.78) so it clears db — the flagship,
  // and now its wheel neighbour — by LIGHTNESS rather than hue, the same
  // construction that separates db from aiden.
  ec:    { light: ['#57e3fd', '#067db8', '#01517a'], dark: ['#57e3fd', '#23c7fe', '#0995c1'], markDeep: { light: '#1850d1', dark: '#067cbc' }, accent: { light: '#599fae', dark: '#83b755' }, chart2Dark: '#6c97aa', on: { light: '#ffffff', dark: '#0f172a' }, icon: 'leaf' },
  // ph = THE BURNT ORANGE (owner, 2026-08-06; was gold 78/75). Hue 57, v1's.
  // Crowds --warning at dE 6.5 in light, waived on the same terms as ec. It
  // does BUY something back: the retired gold sat only 6 degrees off
  // dark-warning's amber, where this sits 27 off it.
  ph:    { light: ['#fdc450', '#b56005', '#793e01'], dark: ['#fdc450', '#ee7d0a', '#ae5904'], markDeep: { light: '#91200d', dark: '#cc3218' }, accent: { light: '#bc8d29', dark: '#ca9d42' }, chart2Dark: '#9d7a63', on: { light: '#ffffff', dark: '#0f172a' }, icon: 'zap' },
  rm:    { light: ['#f7b1fd', '#d62496', '#960366'], dark: ['#f7b1fd', '#fe68b8', '#d31a8d'], markDeep: { light: '#9a153b', dark: '#da2358' }, accent: { light: '#bf7bc5', dark: '#cf84d6' }, chart2Dark: '#b3879b', on: { light: '#ffffff', dark: '#0f172a' }, icon: 'heart' },
  // THE SAME WRONG-CARD BUG HIT THREE FAMILIES, not one. Accents, chart
  // neutrals AND the dark COMPANION (chart2Dark, slot 2) were every one of them
  // gated against the base dark card #1e293b while this POC tints it. Measured
  // against the card a reader sees, slot 2 failed on four of six brands — db
  // 2.69, dc 2.68, ph 2.70, rm 2.71. I fixed the accents, then repeated the
  // mistake on the neutrals, then found it a third time here. The lesson is
  // cheap to state and was expensive to learn: SOLVE AGAINST THE RENDERED
  // SURFACE, not the token the surface is derived from.
  //
  // db and dc have NO deeper companion available now. The window between the
  // card's 3:1 floor and 15 dE below the primary closes once the floor rises,
  // so both take a LIGHTER companion instead — the search prefers down and
  // goes up only when the window is shut, taking the nearest passing value so
  // slot 2 keeps its weight rather than washing out.
  //
  // DARK ACCENTS RE-SOLVED 2026-08-06 AGAINST THE CARD THAT ACTUALLY RENDERS.
  // They had been gated against the BASE dark card #1e293b while this POC tints
  // it — --card is color-mix(surface-tint 12%, #1e293b), and the tint carries
  // the brand's own deep — so the real surface is lighter and ate the margin:
  // db measured 3.05 against the base and 2.70 against the card a reader sees,
  // rm 3.03 and 2.73. Both under the 3:1 the chart subsystem requires of a mark.
  // Every dark accent is now solved against the LIGHTEST card in the set
  // (#243346, ec's) so none can fail on any brand.
  //
  // ec's accent had to LEAVE ITS OWN HUE FAMILY to do it. A full 360-degree
  // sweep shows the binding constraint is 15 dE from slot 2: ec's primary and
  // deep are both mid-cyan, so nothing in the blue-cyan band that also clears
  // the card can sit far enough from them. Its accent is now green (#83b755).
  // That abandons the "accent = the artwork hue, tamed" idea for ec alone, and
  // the trade was taken deliberately — a third series that cannot be seen is
  // worth less than one that is not in the family.
  //
  // AIDEN IS NOT SOLVED — IT IS COPIED (owner, 2026-08-06: "update aiden to be
  // as closely matching to what is in the current tokens.scss").
  //
  // Every other brand here is a proposal. Aiden already SHIPPED, so the POC has
  // no business re-deriving it: a prototype that shows a different Aiden than
  // the product renders is teaching the wrong thing. Every value below is
  // lifted verbatim from src/styles/tokens.scss:
  //
  //   light  #8455f0 / #5a37e6 / #2c6dea  = --aiden-gradient-start/-mid/-end
  //   dark   #9076f9 -> #93c5fd           = the dark --aiden-primary, 2 stops
  //   primary #5a37e6 / #9076f9           = --aiden-outline-border, both modes
  //
  // The dark MARK takes #b3a2fa as its lead-in (the shipped dark --aiden-hover
  // start) because a mark is a three-stop gradient and the shipped dark fill is
  // only two — so the extra stop is still a real shipped Aiden value rather
  // than an invented one. The FILL token itself stays a faithful two stops.
  //
  // WHAT THIS COSTS, stated rather than buried: db<->aiden falls to dE 9.2
  // light / 9.9 dark, from 15.3 / 13.9 under the POC's own deeper violet. The
  // shipped blurple simply sits nearer db's indigo. It stays over the 8.5 hard
  // floor and separates by LIGHTNESS (aiden L 0.44 vs db 0.58) — the recorded
  // construction — but it is the tightest identity pair in the set now, and
  // matching the product is the reason it is accepted.
  aiden: { light: ['#8455f0', '#5a37e6', '#2c6dea'], dark: ['#b3a2fa', '#9076f9', '#93c5fd'], markDeep: { light: '#2c6dea', dark: '#4f99ec' }, accent: { light: '#5897e2', dark: '#3473bb' }, chart2Dark: '#93c5fd', on: { light: '#ffffff', dark: '#0f172a' }, primary: { light: '#5a37e6', dark: '#9076f9' }, icon: 'sparkles' },
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

/*
 * THE ALTERNATES ARE GONE, and that is the decision landing rather than work
 * being lost. Five options were solved and shown side by side (nb-green,
 * ec-blue, ph-gold, ph-orange, ph-amber); the owner chose ec-blue and
 * ph-orange, which are now simply `ec` and `ph` above, and kept nb. Carrying
 * the losers as live scopes would leave four brand values in the stylesheet
 * that nothing may render — the exact drift this POC exists to avoid.
 *
 * The rejected three are recoverable in full: git history holds the anchors and
 * the comparison story, and scratchpad/solve-brand-palette.mjs still carries
 * their CONFIG entries, so `node solve-brand-palette.mjs` re-derives them
 * against the current gates at any time.
 */

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
  db: { light: ['#364560', '#586985', '#17253d'], dark: ['#9badc5', '#768aa5', '#c2d1e5'] },
  nb: { light: ['#364556', '#6b7c8e', '#172534'], dark: ['#a0afb9', '#7b8c9a', '#c7d3d9'] },
  dc: { light: ['#6a7b90', '#253447', '#46566b'], dark: ['#9baebe', '#768b9f', '#c2d2de'] },
  ec: { light: ['#6a7d94', '#25364b', '#46586f'], dark: ['#9bafc3', '#778ca3', '#c3d3e3'] },
  ph: { light: ['#3b4556', '#707c8e', '#1c2534'], dark: ['#a4acb9', '#7f899a', '#cbd0d9'] },
  rm: { light: ['#717993', '#1d2339', '#4d546e'], dark: ['#a6a9c0', '#8186a1', '#cdcde0'] },
};

/*
 * THE NEUTRALS ARE NOW GATED ON ALL PAIRS, NOT JUST ADJACENT ONES — and the
 * ceiling that exposed is worth more than the fix.
 *
 * The chain gate only ever compared slot N with slot N+1, which is sufficient
 * while the emphasis pattern is on, because every de-emphasised series resolves
 * to a single --chart-muted grey and only two or three colours ever paint. Turn
 * emphasis off, as any chart showing all six categories does, and the ungated
 * pairs appear: slots 4 and 6 measured dE 5.3 on every brand — 5.2 under
 * colour-blind simulation — because both are dark slates and nothing had ever
 * asked them to differ.
 *
 * Re-solved against every pair among the six, AND against the card that
 * actually renders — the dark pass first repeated the very bug it had just
 * fixed for the accents, gating against the base #1e293b while the POC tints
 * the card, which put the dark swatches at 2.68-2.98:1. Both solves now use
 * the lightest tinted card in the set. Worst against the real card: 3.58.
 *
 * But the honest headline is the CEILING, not the improvement: the best all-pairs minimum reachable is 7.9
 * with NO tint at all, and 6.4 at the 20% used here. Six colours cannot all sit
 * 15 apart inside a space bounded by 3:1-against-the-card at BOTH ends and by
 * distinctness from the mute. This is the same compounding the chart component
 * already documents for contrast — "no categorical palette can deliver 3:1
 * between eight consecutive slots" — and it applies to hue separation too.
 *
 * WHAT THAT MEANS FOR CONSUMERS, and it is a charting truth rather than a
 * palette shortfall: six simultaneous categorical series is at the limit of
 * what any palette can carry. That is precisely why the emphasis pattern
 * exists. A six-series chart wants emphasis, or fewer series, or marks that do
 * not overlap — the tint dropped 28% -> 20% to buy separation, and going
 * further would buy very little.
 */

/**
 * SEQUENTIAL — one hue, seven steps, even in OKLCH lightness. For MAGNITUDE:
 * heatmaps, choropleths, density. Ordered ramps do not need the categorical
 * 15-dE separation because position carries the meaning; they need EVEN steps,
 * and these hold a minimum of 10.7 per step.
 *
 * BOTH RAMPS LIVE INSIDE THE 3:1 BAND, and the first cut did not. I let the
 * pale end fall to 1.1-1.2:1 against the card on the reasoning that a
 * sequential ramp's low end is "supposed to recede into the surface". That is
 * true of a HEATMAP CELL, which tiles and gets structure from its grid. It is
 * false of a BAR sitting alone on a card, which is what these charts draw — and
 * the chart subsystem already has a rule for exactly this, the surface-gap
 * doctrine that converts "3:1 against your neighbour" into "3:1 against the
 * background". My ramps broke the component's own rule.
 *
 * Worse, it only showed in DARK: the light ramp fails at its pale end and the
 * dark ramp at its deep end, so testing one mode passes and the other collapses
 * (measured 1.07-1.51:1 across three of seven dark steps).
 *
 * So the usable band is bounded on BOTH sides, per mode: light L 0.10-0.675,
 * dark L 0.585-0.975. The ramps are re-solved inside it. The cost is real and
 * worth naming — compressing the range drops the per-step separation from
 * ~10.7 to 5.3, which is near the floor an ordered ramp needs. Seven steps is
 * the most this band supports; asking for more would be asking for steps a
 * reader cannot tell apart.
 */
const CHART_SEQ: Record<string, { light: string[]; dark: string[] }> = {
  db: { light: ['#5c81f6', '#4b6ee9', '#3c5cd5', '#2e4ac2', '#2238af', '#17249d', '#0f0e88'], dark: ['#567bf6', '#6d90f7', '#84a3f8', '#9cb6fa', '#b5c8fb', '#cddbfc', '#e6edfe'] },
  nb: { light: ['#55a121', '#4a8e1b', '#3f7b16', '#356911', '#2b580c', '#214707', '#183704'], dark: ['#529c1f', '#5cae25', '#6bc036', '#7cd24a', '#8de45d', '#9ff770', '#cdfeb7'] },
  dc: { light: ['#259f94', '#208c82', '#1a7971', '#156860', '#0f5650', '#0a4641', '#053631'], dark: ['#24998f', '#2aaca0', '#2fbfb2', '#35d2c4', '#3be6d6', '#41f9e9', '#b4fef4'] },
  ec: { light: ['#2494d3', '#1e82bb', '#1971a3', '#13608c', '#0e5075', '#09405f', '#05314b'], dark: ['#228fcc', '#28a0e4', '#3cb2f8', '#6fc2fa', '#97d1fb', '#bbe1fc', '#ddf0fe'] },
  ph: { light: ['#c9711f', '#b2631a', '#9b5515', '#854810', '#6f3c0b', '#5b2f07', '#472303'], dark: ['#c36d1e', '#da7b23', '#f18828', '#faa059', '#fbb989', '#fcd1b3', '#fee8d9'] },
  rm: { light: ['#d84f9f', '#c53c8d', '#b1287d', '#9c176c', '#83115a', '#6b0b48', '#540638'], dark: ['#d34a9a', '#e65cab', '#f96dbc', '#fa90c8', '#fbafd5', '#fccbe2', '#fee5f0'] },
  aiden: { light: ['#7c76f6', '#6d63e5', '#5e52d2', '#5040bf', '#432dac', '#36169a', '#2a0b7c'], dark: ['#7870f3', '#8986f7', '#9a9cf8', '#adb0fa', '#c1c4fb', '#d5d8fc', '#eaebfe'] },
};

/**
 * DIVERGING — seven steps, two opposing arms through a brand-tinted middle.
 * For SIGNED data: change against a baseline, above/below target, gain/loss.
 *
 * THE HIGH ARM IS THE BRAND'S OWN PRIMARY HUE. The first build of this used a
 * red/green pair on the reasoning that a diverging scale needs 120-180 degrees
 * of hue separation and a brand's two EXISTING poles sit only 20-39 apart. That
 * measurement was true but answered the wrong question — the owner was not
 * proposing the brand's existing poles, but the primary against a COMPUTED
 * OPPOSITE, which is 180 by construction and keeps one arm on-brand.
 *
 * AND THE RED/GREEN BUILD WAS ACTIVELY WRONG, which matters more. Red against
 * green is the textbook deuteranopia failure: those arms measured CVD dE
 * 5.9-8.5, so under a red-green anomaly the scale collapses and the reader
 * loses the SIGN — the one thing a diverging ramp exists to carry. Every other
 * decision in this palette was CVD-gated and then the most famous CVD trap in
 * data visualisation went in unchecked.
 *
 * THE OPPOSING ARM IS CHOSEN BY CVD, NOT BY 180 DEGREES. A naive complement
 * works for four brands and fails two: dc's true opposite is teal-vs-red and
 * rm's is magenta-vs-green, which are red-green axes again (CVD 5.1 and 3.8).
 * So the arm is searched across 100-260 degrees for the hue that MAXIMISES
 * colour-blind separation while clearing every semantic by 10. Results:
 *
 *   db  268 -> 102   CVD 23.8      ec  240 ->  60   CVD 18.2
 *   nb  136 -> 270   CVD 22.4      ph   57 -> 273   CVD 27.7
 *   dc  186 -> 286   CVD 15.1      rm  348 ->  90   CVD  8.1
 *
 * rm is the weakest and is the one to watch: its primary is magenta, so every
 * opposition available to it leans green-ish, and 8.1 is the best on offer once
 * --success is cleared. Still comfortably above the red/green build it replaces.
 *
 * The MIDPOINT stays the brand-tinted neutral. Min step is ~16 throughout.
 */
const CHART_DIV: Record<string, { light: string[]; dark: string[] }> = {
  db: { light: ['#3f3906', '#645b11', '#8b7f1c', '#777c83', '#4e71ec', '#2e49c1', '#151e98'], dark: ['#f6e13a', '#c9b82e', '#9f9122', '#80858c', '#6387f6', '#99b3f9', '#d1defc'] },
  nb: { light: ['#1b1c97', '#3448c1', '#5370ec', '#777c83', '#4c921d', '#356811', '#1f4206'], dark: ['#d2ddfc', '#9cb3f9', '#6785f6', '#80858c', '#58a622', '#7ad047', '#a2fa73'] },
  dc: { light: ['#390f8f', '#573cbc', '#7864e7', '#777c83', '#218f86', '#146760', '#08413c'], dark: ['#dbdafc', '#b0abf9', '#8979f6', '#80858c', '#27a499', '#34cfc2', '#43fdec'] },
  ec: { light: ['#532d06', '#824a10', '#b3681b', '#777c83', '#1f85bf', '#135f8b', '#073c59'], dark: ['#fdd6b7', '#fa9d47', '#cc7721', '#80858c', '#2598da', '#69bff9', '#c1e3fc'] },
  ph: { light: ['#221997', '#3c46c1', '#5b6dec', '#777c83', '#b6661b', '#844810', '#552c06'], dark: ['#d4ddfc', '#9fb1f9', '#6e83f6', '#80858c', '#d07421', '#fa9c51', '#fdd5ba'] },
  rm: { light: ['#453606', '#6d5710', '#97791c', '#777c83', '#c84091', '#9b166b', '#640a44'], dark: ['#fcdb7e', '#dab12d', '#ac8b21', '#80858c', '#dd54a3', '#fa8cc6', '#fdcfe5'] },
  aiden: { light: ['#423706', '#685910', '#917c1c', '#777c83', '#7067e9', '#4f3fbe', '#331093'], dark: ['#fcdd57', '#d2b42d', '#a68e21', '#80858c', '#817cf6', '#abadf9', '#d8dbfc'] },
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
/**
 * HAND-AUTHORED CHART SLOTS — ec only, from the owner's reference (2026-08-06).
 *
 * The owner drew the six bars they want rather than describing them, so this is
 * the reference read off left to right, not a solve. It overrides the derived
 * slots entirely for this brand and touches nothing else.
 *
 * WHY IT LOOKS BETTER THAN ANYTHING I SOLVED, which is the useful part: two of
 * its bars sit BELOW the 3:1-against-the-card floor every solve in this file
 * was gated on — #79b2d4 at 2.30 and #4ec8dc at 1.98. That floor is the chart
 * subsystem's surface-gap doctrine, and holding it is exactly what forced my
 * palettes dark and heavy. Light tints are what make a chart look airy. The
 * owner's reference simply spends that budget differently, and on BARS — which
 * are large, adjacent, and labelled — it reads fine. It would not on a
 * one-pixel line or a scatter dot.
 *
 * DARK IS DERIVED BY ROLE, NOT BY FORMULA. Each slot keeps the JOB it does in
 * the reference — brand blue, pale blue, the deep, the cyan, the slate, the
 * near-black — and only the two that are dark BY DEFINITION invert, because on
 * a dark ground "deepest" means furthest from the page rather than nearest to
 * black. So slot 3 stays a saturated deep blue and slot 6, the near-black,
 * becomes the near-white. A literal lightness mirror was tried first and
 * measured worse (4.7 all-pairs vs 9.6): mirroring compresses the set, since
 * the reference gets its separation from a 0.47 lightness spread that the dark
 * card's readable band cannot hold.
 *
 * SLOTS 1 AND 3 ARE SNAPPED TO THE REAL TOKENS. The owner drew #0b79ba and
 * #024f79 by eye; ec's --primary is #067db8 and its --primary-deep is #01517a,
 * dE 1.3 and 0.6 away. Invisible as a change, and it makes two of the six slots
 * LITERALLY brand tokens, so a chart bar and a primary button are provably the
 * same colour rather than nearly.
 *
 * DARK SLOT 3 LIFTED #0c6fa7 -> #2088bb, 2.35 -> 3.24 on the card. The
 * asymmetry with light is the point: the owner's light slot 4 sits at 1.98 and
 * is fine, because a PALE bar on white still reads as a shape. A DARK bar on a
 * dark card sinks INTO it. Same ratio, opposite outcome — so the 3:1 floor is
 * worth holding downward and worth spending in the other direction.
 *
 * DARK SLOT 2 vs --info STAYS AT dE 3.7, AND THAT IS A DECISION. Two escapes
 * were solved and both cost more than the collision: moving slot 2 off info by
 * 8.5 drops CVD to 1.7, by 12 it collapses all-pairs to 2.0 — because the dark
 * set already lives in a narrow blue band with dark --info (#7cd4fd) sitting in
 * the MIDDLE of it, so every route out runs into slot 6's near-white or slot 1.
 * ec already carries the documented info waiver; the operational condition is
 * the icon+label rule, which this inherits.
 *
 * Measured: light all-pairs dE 9.4, CVD 8.0, worst neighbour 14.2, min card
 * contrast 1.98. Dark 8.6 / 4.9 / 15.0 / 3.24.
 *
 * SLOT 2 PULLED DOWN A RUNG (owner, 2026-08-06). #79b2d4 -> #70a3d4 in light:
 * same soft pale blue, L 0.74 -> 0.70. It fixes three things at once — the
 * colour-blind pair 2/4 goes 3.5 -> 8.0, all-pairs 6.3 -> 9.4, and clearance
 * from --chart-muted 6.2 -> 9.6, so a slot-2 series no longer reads as
 * de-emphasised when `emphasis` is on. Costs 16.9 -> 14.2 on the worst
 * neighbouring pair, which is well clear of the 8.5 hard floor. The cyan is
 * untouched, by owner decision.
 *
 * The SOFTNESS was the problem, which is worth knowing before softening
 * anything else here: a low-chroma colour at high lightness carries almost no
 * signal on EITHER channel, so it crowds both the cyan and the mute at once. No
 * value under chroma 0.08 clears both. #70a3d4 buys its way out with a little
 * chroma (0.077 -> 0.091), not with a hue change.
 *
 * DARK DID NOT TAKE THE SAME MOVE — IT TOOK THE ORDER. My dark derivation had
 * flipped the lightness ORDER of slots 2 and 4 (light has 2 below 4, dark had 2
 * above), so "pull the pale blue down" walks it TOWARD the cyan there and the
 * best available version trades neighbour separation 16.7 -> 9.9. Restoring the
 * light set's order instead — slot 2 to L 0.79, slot 4 to 0.86 — keeps every
 * neighbour at 15.0+ (worst neighbouring pair under CVD: 12.7) and lifts CVD
 * 3.2 -> 4.9. That is still under the 8 the light set reaches, and the reason
 * is structural rather than fixable: dark's readable band is 0.59-0.93 against
 * light's 0.30-0.77, so the same six rungs have a third less room.
 *
 * THE RULE THIS LEAVES: a mode's lightness ORDER is part of the palette, not an
 * artefact of how it was derived. Derive dark by role AND by rung order, or a
 * fix that is correct in one mode inverts in the other.
 *
 * THE LIGHTNESS LADDER IS THE ACCESSIBILITY STORY, not the hue placement.
 * Within one hue family a colour-blind reader has almost no hue channel left,
 * so LIGHTNESS is the only thing carrying the distinction. Both modes had
 * exactly one pair standing too close on it — slots 2 and 4, a ~0.03 rung apart
 * — and that single gap WAS the entire colour-blind weakness. Spreading it is
 * the fix above. The rule generalises: inside one hue family, no two slots may
 * share a lightness rung, and the ladder is worth checking before the hexes.
 *
 * The line chart will test this hardest: a bar leans on area, a shared edge and
 * a fixed position in its group, so colour is one cue of four. A one-pixel
 * stroke has none of them, and lines CROSS — the two series a reader is
 * comparing end up on the same pixels exactly where they must be told apart.
 * The two sub-3:1 tints also stop reading as shapes at 1px.
 */
const CHART_HAND: Record<string, { light: string[]; dark: string[] }> = {
  ec: {
    light: ['#067db8', '#70a3d4', '#01517a', '#4ec8dc', '#6d8b9c', '#232f42'],
    dark:  ['#1da0f3', '#96c2de', '#2088bb', '#95e2e2', '#7995a6', '#e1eaf9'],
  },
};

type AnchorSet = { light: readonly string[]; dark: readonly string[]; accent: { light: string; dark: string }; chart2Dark: string };
function chartVars(
  k: string,
  mode: 'light' | 'dark',
  anchors: Record<string, AnchorSet> = BRAND_ANCHORS as unknown as Record<string, AnchorSet>,
  neutralMap: Record<string, { light: string[]; dark: string[] }> = CHART_NEUTRALS,
): string {
  if (!CHART_THEMING) return '';
  // A hand-authored set wins outright — it is the owner's drawing, not an input
  // to a derivation, so nothing downstream may re-solve or "improve" it.
  const hand = CHART_HAND[k]?.[mode];
  if (hand) return hand.map((hex, i) => `  --chart-${i + 1}: ${hex};`).join('\n') + '\n';
  const neutrals = neutralMap[k]?.[mode];
  if (!neutrals) return ''; // aiden is a surface, not a brand — it keeps the default ramp
  const a = anchors[k];
  // The AUTHORED primary, not the mark's middle stop. Identical for every brand
  // that does not separate them, so this changes no existing output — but nb
  // now does separate them (see its anchors), and a chart must plot the colour
  // the buttons use, not the one the logo is drawn with.
  const slot1 = (mode === 'light' ? PRIMARY_LIGHT[k] : PRIMARY_DARK[k]) ?? (mode === 'light' ? a.light[1] : a.dark[1]);
  // dark slot 2 is the COMPANION, not the deep — see the header for why.
  // Slot 3 is the ACCENT: the artwork hue tamed to chart duty (3:1 on card,
  // capped chroma, chain-dE from slot 2, semantics hard-cleared) — so a
  // 3-series chart carries colour and branding without leaving the family.
  const slot2 = mode === 'light' ? a.light[2] : a.chart2Dark;
  const slot3 = a.accent[mode];
  return [slot1, slot2, slot3, ...neutrals].map((hex, i) => `  --chart-${i + 1}: ${hex};`).join('\n') + '\n';
}

/**
 * The two ORDERED palettes, emitted alongside the categorical one so a brand
 * scope carries all three and the consumer picks by intent rather than by
 * copying hexes. Aiden gets these even though it has no categorical set — it is
 * a surface with no chart identity of its own, but a chart INSIDE it still has
 * to plot magnitude and sign.
 */
function rampVars(k: string, mode: 'light' | 'dark'): string {
  const seq = CHART_SEQ[k]?.[mode];
  const div = CHART_DIV[k]?.[mode];
  if (!seq || !div) return '';
  return seq.map((hex, i) => `  --chart-seq-${i + 1}: ${hex};`).join('\n') + '\n'
       + div.map((hex, i) => `  --chart-div-${i + 1}: ${hex};`).join('\n') + '\n';
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
${chartVars(k, 'light', anchorMap, neutralMap)}${rampVars(k, 'light')}}
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
${chartVars(k, 'dark', anchorMap, neutralMap)}${rampVars(k, 'dark')}}`;
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


/* ── LIGHT ──────────────────────────────────────────────────────────────────
   THE PAGE STAYS WHITE. Stated as a declaration rather than an omission so it
   reads as a decision. It also keeps every semantic -light tint composited over
   the surface the system was designed against, which is what makes the whole
   alert family safe without re-derivation. */
[data-theme-poc2][data-mode='light'] {
  /* Bubble alphas: light needs MORE, because a wash over white barely moves it
     (the old 22% highlight measured 4.0 dE). These land 5.4-13.4. */
  --poc2-bubble-hl:   30%;
  --poc2-bubble-deep: 20%;
  --poc2-bubble-mid:  24%;

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
  /* Bubble alphas: dark needs LESS. Every anchor is lighter than the page here,
     so the same percentage reads far stronger — the old 22% highlight already
     measured 15.8 dE. These land 9.1-15.6, evened out across the three. */
  --poc2-bubble-hl:   20%;
  --poc2-bubble-deep: 22%;
  --poc2-bubble-mid:  18%;

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
/* THE BUTTON GRADIENT IS THE SHIPPED ONE, VERBATIM. What follows is what
   the POC learned while it still authored its own, kept because it explains
   what the shipped values are doing and what adopting them cost.

   A mark and a button are not the same object. A mark is 48px of artwork with
   nothing on it, so a three-stop ramp reads as depth; a button is a wide flat
   shape with a label across it, where a third stop shows up as a band the eye
   has to cross. The shipped tokens split exactly that way by mode — three
   stops in light, two in dark.

   WHAT WAS GIVEN UP: the POC's own light fill (#2456e4 -> #5410db) held its
   worst white label at 5.96. The shipped three-stop measures 4.63 at the
   violet end — over AA, with far less room. That margin is what made it a
   different Aiden, so it is the right thing to lose.

   WHAT THE SHIPPED VALUES GET RIGHT, confirmed by measurement rather than
   assumed: the two hovers move in OPPOSITE directions, and correctly. Light
   deepens (#8455f0 -> #6d28d9) because a white label gains contrast as the
   fill darkens; dark lightens (#9076f9 -> #b3a2fa) because that fill carries
   ink. That is the same rule the rest of the system follows, and it means the
   shipped Aiden needs no correction on this axis at adoption.

   The remaining open question is the one the POC could not fix by copying:
   whether Aiden's blue end should be the same hue in both modes. It is not
   (light lands on an indigo-leaning azure, dark on a true sky), which is
   defensible — dark has no lightness to spare and the hue moved with it — but
   it is a decision, not an accident, and worth confirming at adoption. */
[data-theme-poc2][data-surface='aiden'][data-mode='light'] {
  /* VERBATIM from tokens.scss --aiden-primary / --aiden-hover. Worst white
     label across the light fill measures 4.63 — the shipped number, inherited
     rather than re-solved. The POC's own two-stop reached 5.96, and that extra
     margin is exactly what made it a different Aiden. */
  --aiden-fill:       linear-gradient(135deg, #8455f0 0%, #5a37e6 50%, #2c6dea 100%);
  --aiden-fill-hover: linear-gradient(135deg, #6d28d9 0%, #4a29c9 50%, #1d4ed8 100%);
}
[data-theme-poc2][data-surface='aiden'][data-mode='dark'] {
  /* Two stops, like the shipped dark --aiden-primary. Ink label worst 5.22. */
  --aiden-fill:       linear-gradient(135deg, #9076f9 0%, #93c5fd 100%);
  --aiden-fill-hover: linear-gradient(135deg, #b3a2fa 0%, #bae6fd 100%);
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

  /* THE BUBBLE FIELD — the hero's artwork layer, rebuilt 2026-08-06 because the
     owner read it as flat. It was, and measuring said why — in two ways that
     pull in opposite directions, which is why one set of numbers could not fix
     both modes.

       LIGHT was genuinely too faint: the highlight wash moved the page only
       4.0 dE. Under about 5 that is a tint you have to look for.

       DARK was not faint at all (15.8 dE) — it was SHAPELESS. All three
       radials were 64-80% wide and stacked over the same area, so instead of
       three blooms you got one smooth haze. And in dark every anchor is
       LIGHTER than the page, so all three push the same way and the hue
       differences cancel into grey-blue.

     So: alphas are now MODE-AWARE (light gets more, dark less), the radials
     are tightened to 40-52% and pulled apart so each one has its own
     territory, and the ORDER changed — --mark-deep is promoted to the
     prominent right-hand position. That is the point of the artwork split:
     the highlight and the mark deep are the two HUE-ROTATED anchors, so
     leading with them is what puts a second hue on the page. --mark-mid is
     the primary and shares its hue with everything else, so it drops to the
     supporting corner.

     SAFE BY MEASUREMENT, not by assumption: the hero copy DOES sit on this
     field (the old comment claiming nothing is read on a bubble was wrong).
     Worst text contrast over the brightest point of any wash is 12.15 in
     light and 10.16 in dark, against a 4.5 floor — so there was headroom to
     spend and this spends only part of it. */
  --poc2-bubble:
    radial-gradient(52% 46% at 8% 2%,
      color-mix(in srgb, var(--primary-highlight) calc(var(--poc2-bubble-hl) * var(--poc2-str)), transparent) 0%,
      transparent 72%),
    radial-gradient(48% 44% at 94% 16%,
      color-mix(in srgb, var(--mark-deep) calc(var(--poc2-bubble-deep) * var(--poc2-str)), transparent) 0%,
      transparent 70%),
    radial-gradient(44% 40% at 34% 98%,
      color-mix(in srgb, var(--mark-mid) calc(var(--poc2-bubble-mid) * var(--poc2-str)), transparent) 0%,
      transparent 72%);
}

/* ── DECLARING CHART INTENT ─────────────────────────────────────────────────
   Three palettes now live in every brand scope, and the consumer says WHICH by
   naming the job rather than by choosing colours:

     <div data-chart-palette="sequential"> … </div>
     <div data-chart-palette="diverging">  … </div>
     (omitted)                             categorical, the default

   The chart component keeps reading --chart-1..N exactly as it does today; the
   attribute only re-points those slots at a different family. That is the whole
   mechanism — no colour logic in JS, no second component, and a chart nested in
   a brand scope still picks up that brand automatically.

   It is deliberately an ATTRIBUTE and not a prop-driven class, so it composes
   the same way data-mode / data-brand / data-surface already do: set it on one
   panel and every chart inside inherits the intent.

   ADOPTION COST, stated plainly: the ordered ramps are SEVEN steps and the
   shipped <Chart> reads six. Categorical stays at six; sequential and diverging
   want the seventh, so adopting them means --chart-7 exists. That is one slot,
   not a redesign. */
[data-theme-poc2] [data-chart-palette='sequential'] {
  --chart-1: var(--chart-seq-1);
  --chart-2: var(--chart-seq-2);
  --chart-3: var(--chart-seq-3);
  --chart-4: var(--chart-seq-4);
  --chart-5: var(--chart-seq-5);
  --chart-6: var(--chart-seq-6);
  --chart-7: var(--chart-seq-7);
}
[data-theme-poc2] [data-chart-palette='diverging'] {
  --chart-1: var(--chart-div-1);
  --chart-2: var(--chart-div-2);
  --chart-3: var(--chart-div-3);
  --chart-4: var(--chart-div-4);
  --chart-5: var(--chart-div-5);
  --chart-6: var(--chart-div-6);
  --chart-7: var(--chart-div-7);
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

   This brand ramp still serves the closing BAND, the wordmark and the stat
   numerals; only the hero HEADLINE takes the shipped --gradient-full-ramp
   (see below). The band could not take it in any case: it is a FILL with
   white text on it, and every one of the shipped ramp's 14 light stops sits
   under 4.5:1 against white, worst 1.98. The brand primaries were solved to
   clear exactly that, which is why the two consumers now differ.

   Light and dark are separate blocks because dark needs the dark primaries —
   using the light set on a dark page gives a ramp that reads almost black at
   the ph end. */
[data-theme-poc2][data-mode='light'] .poc2-suite-ramp {
  --poc2-ramp: linear-gradient(100deg,
    #b56005 0%, #306602 17%, #025750 33%, #067db8 50%, #6264f4 67%, #5a37e6 83%, #d62496 100%);
}
[data-theme-poc2][data-mode='dark'] .poc2-suite-ramp {
  --poc2-ramp: linear-gradient(100deg,
    #ee7d0a 0%, #8bca2f 17%, #0db09d 33%, #23c7fe 50%, #689cfe 67%, #9076f9 83%, #fe68b8 100%);
}
[data-theme-poc2] .poc2-suite-ramp { background-image: var(--poc2-ramp); }

/* THE HEADLINE TAKES THE SHIPPED RAMP, not the brand-derived one (owner,
   2026-08-06). --gradient-full-ramp is the parent app's own gradient and it
   already exists in tokens.scss, so a POC inventing a second one for the same
   job is the Aiden mistake again. It needs no mode branch: the token is
   redeclared under [data-mode='dark'] in tokens.scss, and the POC scopes carry
   data-mode themselves, so it resolves per mode on its own.

   MEASURED, because the two ramps are not interchangeable and the difference
   matters here: as TEXT on the white page, 8 of the shipped light ramp's 14
   stops fall under the 3:1 large-text floor (worst 1.98 at lime, then amber
   2.15, green 2.28, cyan 2.43, teal 2.49). The brand ramp held 4.52 at its
   worst. Dark is untroubled — the 400s measure 5.98 at worst on the dark page.
   So the light headline now has a genuinely faint stretch through its
   green-to-cyan half. That is what the shipped token IS; correcting it is a
   tokens.scss decision, not something to paper over here. */
[data-theme-poc2] .poc2-suite-text {
  background-image: var(--poc2-ramp);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  /* the clip leaves no painted background for a focus ring or selection to sit
     on, so keep this on display type only — never on a control */
}
/* ONLY the hero headline takes it. The class is shared by the 16px "dart"
   wordmark and the 36px stat numerals, and the shipped ramp cannot carry
   either: at 16px/700 the wordmark is REGULAR text needing 4.5:1, and the
   ramp's worst stop is 1.98. (Note the compression — background-size defaults
   to the box, so a 30px wordmark renders all 14 stops, faint ones included.)
   The headline is 60px/600, comfortably large text, where the floor is 3:1. */
[data-theme-poc2] .poc2-suite-text--full { background-image: var(--gradient-full-ramp); }

/* The suite bubble field: one wash per brand instead of one brand's two. Same
   alpha budget as the single-brand field, spread across six corners, so the
   page reads as "all of them" without any one of them winning. */
[data-theme-poc2][data-mode='light'] .poc2-suite-bubbles {
  background-image:
    radial-gradient(46% 52% at 10% 4%,  color-mix(in srgb, #067db8 20%, transparent) 0%, transparent 70%),
    radial-gradient(42% 48% at 34% 0%,  color-mix(in srgb, #025750 17%, transparent) 0%, transparent 70%),
    radial-gradient(44% 50% at 62% 2%,  color-mix(in srgb, #5a37e6 18%, transparent) 0%, transparent 70%),
    radial-gradient(40% 46% at 88% 8%,  color-mix(in srgb, #d62496 15%, transparent) 0%, transparent 70%),
    radial-gradient(38% 44% at 76% 46%, color-mix(in srgb, #b56005 12%, transparent) 0%, transparent 72%),
    radial-gradient(38% 44% at 18% 52%, color-mix(in srgb, #306602 12%, transparent) 0%, transparent 72%);
}
[data-theme-poc2][data-mode='dark'] .poc2-suite-bubbles {
  background-image:
    radial-gradient(46% 52% at 10% 4%,  color-mix(in srgb, #23c7fe 26%, transparent) 0%, transparent 70%),
    radial-gradient(42% 48% at 34% 0%,  color-mix(in srgb, #0db09d 22%, transparent) 0%, transparent 70%),
    radial-gradient(44% 50% at 62% 2%,  color-mix(in srgb, #9076f9 24%, transparent) 0%, transparent 70%),
    radial-gradient(40% 46% at 88% 8%,  color-mix(in srgb, #fe68b8 18%, transparent) 0%, transparent 70%),
    radial-gradient(38% 44% at 76% 46%, color-mix(in srgb, #ee7d0a 15%, transparent) 0%, transparent 72%),
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
  /* THE GLYPH FOLLOWS THE TILE, and only the LIVE mark needs this.
     The live mark IS mode-aware, so in dark its tile is the pale dark-mode
     anchor and a white glyph measured 1.74-2.66:1 across the seven — every one
     under the 3:1 graphical floor, nb and ec effectively illegible. The brand's
     own "on" colour is already the right answer and already mode-split
     (#ffffff light / #0f172a dark), so the glyph simply reads it: 6.7-10.2 in
     dark, 3.3-4.7 in light.
     The STATIC mark keeps #ffffff, because its tile does NOT change between
     modes — it stays the mid-dark light-anchor tile in both, where white is
     correct and ink would be wrong. Same reason the two need different glass
     below. */
  color: var(--primary-foreground);
}

/* ── THE GLASS, INVERTED FOR DARK ───────────────────────────────────────────
   Owner asked whether there is a dark version of the lens flare. There is not,
   and the reason is worth stating rather than worked around: a specular
   highlight is BY DEFINITION brighter than the surface it sits on. That is what
   makes it read as light. A dark spot on a glossy object is not a flare, it is
   a shadow. So the white stack — the radial lift, the pale-blue bloom, the
   sheen band — cannot be "darkened"; on a pale tile it simply stops existing.

   What replaces it is the OTHER HALF OF THE SAME LIGHTING MODEL. The light is
   still coming from the top left. On a dark tile you read the highlight it
   makes; on a pale tile you read the SHADE it leaves on the opposite side. So
   the top-left bloom becomes a bottom-right occlusion, the downward sheen
   becomes an upward one, and the object still reads as a lit solid rather than
   a flat chip.

   The sparkle is the single white layer that SURVIVES, and it survives because
   it is small and near-opaque: a pinpoint specular is a hard edge, and a hard
   edge reads on any surface where a soft 24%-alpha wash does not. It is
   tightened rather than removed.

   Scoped to --live only, because the static mark's tile never goes pale. */
[data-theme-poc2][data-mode='dark'] .poc2-mark--live {
  background-image:
    /* form: occlusion pushed into the far corner, deliberately AWAY from the
       glyph. The first cut put a soft dark radial at 46%/74% — behind the icon —
       and that is what read as a drop shadow under it. Worse than cosmetic: a
       dark halo behind a dark glyph on a pale tile eats the contrast the ink
       glyph was introduced to gain. */
    radial-gradient(40% 40% at 86% 90%,
      rgba(15, 23, 42, 0.30) 0%,
      rgba(15, 23, 42, 0) 100%),
    /* the glyph is seated by a LIFT, not a shadow — owner's instinct, and the
       right physics: on a pale tile the icon is the dark object, so the surface
       catches light AROUND it. It also raises glyph contrast instead of
       spending it. */
    radial-gradient(40% 40% at 50% 47%,
      rgba(255, 255, 255, 0.24) 0%,
      rgba(255, 255, 255, 0) 100%),
    linear-gradient(135deg,
      var(--primary-highlight) 9.7%,
      var(--mark-mid) 51.6%,
      var(--mark-deep) 90.3%);
}
[data-theme-poc2][data-mode='dark'] .poc2-mark--live::before {
  /* the sheen turns over: shade rising from the base instead of light falling
     from the top. Same lamp, opposite readout. */
  inset: auto -10% 0 -10%;
  height: 48%;
  /* THE HARSH LINE AT THE BOTTOM CAME FROM HERE. The live sheen animates
     scaleY(1 -> 1.16 -> 0.92) about transform-origin 50% 0% — its TOP edge.
     That is correct while the band hangs FROM the top, because the edge it
     moves is the one already faded to transparent. Anchored at the bottom
     instead, the same origin swings the band's DARKEST edge: at scaleY(0.92) it
     lifts clear of the tile floor and terminates mid-tile against undarkened
     fill, which is a hard horizontal boundary. Pivot on the anchored edge and
     the dark end never leaves the bottom. Specificity (0,3,1) beats the shared
     animation rule below, so this wins regardless of source order. */
  transform-origin: 50% 100%;
  background-image: linear-gradient(180deg,
    rgba(15, 23, 42, 0) 0%,
    rgba(15, 23, 42, 0.07) 45%,
    rgba(15, 23, 42, 0.17) 100%);
}
[data-theme-poc2][data-mode='dark'] .poc2-mark--live::after {
  /* tightened, not dropped — see above */
  width: 8%;
  height: 8%;
  left: 15.5%;
  top: 15.5%;
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
/* ── DARK: THE GLYPH'S CAST SHADOW, AND THE THIRD SHEEN-EDGE BUG ────────────
   Both glyph shadows above are rgba(35,14,75,0.45) — a near-black purple, which
   is exactly right for a WHITE glyph on a mid-dark tile: the shadow separates
   the icon from the surface. Under the dark-mode ink glyph on a pale tile it is
   the SAME VALUE as the glyph, so it stops separating and starts smearing —
   the icon gains a muddy fringe instead of lifting off. Neutral ink at less
   than half the alpha and half again the blur keeps the float and loses the
   smear: it reads as the tile in shade, which is what a shadow on a pale
   surface actually is.

   AND THE SHEEN EDGE, for the third time. The file already carries the warning
   twice — once for the keyframes, once for the tilt translate — that the sheen
   "MAY ONLY EVER MOVE UP", because its brightest edge is pinned at y=0 and any
   downward move lifts that edge into view as a line across the tile. The dark
   band inverts the geometry: it is anchored at the BOTTOM and its DARKEST edge
   is the pinned one, so the rule inverts with it — this band may only ever move
   DOWN. The light rule's (--my - 1) term is always <= 0; the dark one needs
   (--my + 1), which is always >= 0. Getting this wrong is what produced the
   harsh line on hover, and it would have come back on tilt even after the
   keyframe fix. */
[data-theme-poc2][data-mode='dark'] .poc2-mark--live:hover > svg {
  filter: drop-shadow(0 calc(var(--poc2-mark-px) * 0.016) calc(var(--poc2-mark-px) * 0.052) rgba(15, 23, 42, 0.20));
}
[data-theme-poc2][data-mode='dark'] .poc2-mark--tilt > svg {
  filter: drop-shadow(
    calc(var(--mx) * var(--poc2-mark-px) * -0.010)
    calc(var(--poc2-mark-px) * var(--on) * 0.016)
    calc(var(--poc2-mark-px) * var(--on) * 0.052)
    rgba(15, 23, 42, 0.18));
}
[data-theme-poc2][data-mode='dark'] .poc2-mark--tilt::before {
  translate: calc(var(--mx) * 5%) calc((var(--my) + 1) * 2.5%);
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
