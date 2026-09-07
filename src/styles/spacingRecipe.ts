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
// Owner's tables, 2026-09-07. Rules and rationale: docs/spacing.md.

export type Density = 'compact' | 'balanced' | 'spacious';
export const DENSITIES: Density[] = ['compact', 'balanced', 'spacious'];

/** The two widths the ladder is solved against. Below min the small ladder, above max the large. */
export const FLUID = { min: 1024, max: 1920 } as const;

export type LevelN = 1 | 2 | 3 | 4 | 5;
export type Level = { n: LevelN; name: 'page' | 'section' | 'block' | 'element' | 'micro'; job: string };

export const LEVELS: readonly Level[] = [
  { n: 1, name: 'page', job: 'page margin; between the page header and the content' },
  { n: 2, name: 'section', job: 'between sections; between a section heading and its grid' },
  { n: 3, name: 'block', job: 'grid gap; card padding' },
  { n: 4, name: 'element', job: 'inside a card: header → item, row → row; toolbar gaps' },
  { n: 5, name: 'micro', job: 'icon → label; title → subtitle' },
];

/** [value at FLUID.min, value at FLUID.max] per level, per density. Every number is a rung. */
export const LADDER: Record<Density, Record<LevelN, readonly [number, number]>> = {
  balanced: { 1: [32, 64], 2: [24, 32], 3: [16, 24], 4: [8, 12], 5: [4, 4] },
  compact:  { 1: [24, 32], 2: [12, 24], 3: [8, 12],  4: [6, 8],  5: [2, 2] },
  spacious: { 1: [40, 64], 2: [32, 40], 3: [24, 32], 4: [12, 16], 5: [6, 6] },
};
