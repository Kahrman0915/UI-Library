// The semantic spacing recipe — pure data, read by scripts/generate-spacing-tokens.mjs
// (which emits the CSS) and by the Foundations/Semantic Spacing story (which renders
// it). One source, so the docs cannot drift from the tokens.
//
// A ROLE names the job of a gap and points at a rung on the primitive ramp. Three
// families: inline (side by side), stack (one above another), inset (inside a
// container). Density retargets inset and inline one rung and never moves stack
// (rule 5). Six layout-level roles are FLUID: they slide between two rungs as the
// viewport (vw) or container (cqi) grows from FLUID.min to FLUID.max.
//
// Rules and rationale: docs/spacing.md.

export type Density = 'compact' | 'balanced' | 'spacious';
export const DENSITIES: Density[] = ['compact', 'balanced', 'spacious'];

/** The two widths every fluid role is solved against. Owner decision 2026-09-07. */
export const FLUID = { min: 1024, max: 1920 } as const;

/** A fixed value is a rung in px; a fluid value is [floor, ceiling] in px. */
export type RoleValue = number | readonly [number, number];

export type Role = {
  name: string;
  family: 'inline' | 'stack' | 'inset' | 'layout';
  /** What the space is between. Goes into the token comment and the Figma description. */
  job: string;
  /** Present only on fluid roles: vw follows the viewport, cqi the nearest container. */
  unit?: 'vw' | 'cqi';
} & ({ all: RoleValue } | { compact: RoleValue; balanced: RoleValue; spacious: RoleValue });

export const ROLES: readonly Role[] = [
  { name: 'inline-xs', family: 'inline', job: 'an icon and its label; keycap glyphs', all: 4 },
  { name: 'inline-sm', family: 'inline', job: 'items in a row: chips, badges, breadcrumb, button group', all: 8 },
  { name: 'inline', family: 'inline', job: 'controls in a toolbar or a form row', compact: 8, balanced: 12, spacious: 16 },
  { name: 'inline-lg', family: 'inline', job: 'siblings that are separate objects: cards in a grid, columns', unit: 'cqi', compact: [12, 16], balanced: [16, 24], spacious: [24, 32] },
  { name: 'stack-xs', family: 'stack', job: 'a label and its control; a title and its description', all: 4 },
  { name: 'stack-sm', family: 'stack', job: 'rows in a list or a menu; sections inside a screen', all: 8 },
  { name: 'stack', family: 'stack', job: 'fields in a form; paragraphs', all: 16 },
  { name: 'stack-lg', family: 'stack', job: 'blocks inside a card or a panel', unit: 'vw', all: [24, 32] },
  // 32→48, not 40→64: measured, not chosen. The 79 content columns on the Admin Flow and
  // Request Flow screens all stack their page blocks at 32, so 32 is this product's laptop
  // value and 48 its wide-monitor one. Owner decision 2026-09-07.
  { name: 'stack-xl', family: 'stack', job: 'sections of a page', unit: 'vw', all: [32, 48] },
  { name: 'inset-sm', family: 'inset', job: 'tight surfaces: menu items, toasts, tooltips, chips', compact: 8, balanced: 12, spacious: 16 },
  { name: 'inset', family: 'inset', job: 'the default surface: card, dialog body, popover', compact: 12, balanced: 16, spacious: 20 },
  { name: 'inset-lg', family: 'inset', job: 'roomy surfaces: page containers, feature cards, empty states', unit: 'vw', compact: [16, 24], balanced: [24, 32], spacious: [32, 40] },
  { name: 'page-x', family: 'layout', job: 'the page edge', unit: 'vw', all: [24, 48] },
  { name: 'gutter', family: 'layout', job: 'the grid gutter', unit: 'cqi', all: [16, 24] },
];

export const valueOf = (role: Role, density: Density): RoleValue =>
  'all' in role ? role.all : role[density];
