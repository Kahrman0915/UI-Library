// The spacing LADDER — pure data, read by scripts/generate-spacing-tokens.mjs (which
// emits the CSS) and by the Foundations/Spacing Ladder story (which renders it). One
// source, so the docs cannot drift from the tokens.
//
// Five LEVELS, assigned by hierarchy: a container's gap or padding is a level, and the
// level's number comes from the ladder. Each level down is one step down. The WHOLE
// ladder slides with width (FLUID.min → FLUID.max, interpolated by the browser) and
// reshapes per density (compact · balanced · spacious). A level never moves alone,
// which is what keeps every gap in proportion to its neighbours at every width.
//
// Owner's tables, 2026-09-07; small end moved to 1440 on 2026-09-08. Rules and rationale: docs/spacing.md.

export type Density = 'compact' | 'balanced' | 'spacious';
export const DENSITIES: Density[] = ['compact', 'balanced', 'spacious'];

/**
 * The two viewports the ladder is solved against. Below min the small ladder holds, above
 * max the large. min is 1440 — the DESIGN viewport every flow screen is drawn at — so the
 * small end of the ladder is exactly what a 1440 browser shows and what a 1440 Figma frame
 * shows (owner, 2026-09-08; it was 1024, a viewport nobody designs at, which put 1440 in
 * the middle of the range and made the Figma frames overstate the small end).
 */
export const FLUID = { min: 1440, max: 1920 } as const;

export type LevelN = 1 | 2 | 3 | 4 | 5;
export type Level = { n: LevelN; name: 'page' | 'section' | 'block' | 'element' | 'micro'; job: string };

export const LEVELS: readonly Level[] = [
  { n: 1, name: 'page', job: 'page margin; between the page header and the content' },
  { n: 2, name: 'section', job: 'between sections; between a section heading and its grid' },
  { n: 3, name: 'block', job: 'grid gap; card padding' },
  { n: 4, name: 'element', job: 'inside a card: header → item, row → row; toolbar gaps' },
  { n: 5, name: 'micro', job: 'icon → label; title → subtitle' },
];

/**
 * [value at FLUID.min, value at FLUID.max] per level, per density. Every number is a rung.
 *
 * THE WIDTH RULE IS ONE MULTIPLIER: the 1920 ladder is the 1440 ladder × 1.5, so the
 * hierarchy keeps exactly the same shape at every width (owner decision 2026-09-07, after
 * a hand-tuned 1920 column was caught changing the ladder's shape). Balanced is exact.
 * Compact and spacious snap to the nearest rung where × 1.5 lands off the ramp:
 * compact 36 / 18→20 / 12 / 9→8 / 3→4, spacious 60→64 / 48 / 36 / 18→20 / 9→8.
 */
export const LADDER: Record<Density, Record<LevelN, readonly [number, number]>> = {
  balanced: { 1: [32, 48], 2: [24, 36], 3: [16, 24], 4: [8, 12],  5: [4, 6] },
  compact:  { 1: [24, 36], 2: [12, 20], 3: [8, 12],  4: [6, 8],   5: [2, 4] },
  spacious: { 1: [40, 64], 2: [32, 48], 3: [24, 36], 4: [12, 20], 5: [6, 8] },
};

/**
 * Container caps — how wide a page may be, per PageContainer width. [at FLUID.min, at
 * FLUID.max], the SAME width rule as the ladder: × 1.5 at 1920, fluid in between. A fixed
 * cap plus a growing level-1 margin made a narrow page NARROWER on a big monitor (832 →
 * 800), which is the opposite of what the width is for (owner, 2026-09-07). `full` has no cap.
 */
export type ContainerWidth = 'narrow' | 'default' | 'wide';
export const CONTAINERS: Record<ContainerWidth, readonly [number, number]> = {
  narrow:  [896, 1344],
  default: [1152, 1728],
  wide:    [1280, 1920],
};
