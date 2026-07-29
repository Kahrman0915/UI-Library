import type { JSX } from 'react';

export type ChildrenAsPropsType = {
  children: JSX.Element[] | JSX.Element;
};

/**
 * The spelling the SCSS is written against — what actually reaches the
 * `--sz-*` class name.
 */
export type CanonicalSize = 'xsmall' | 'small' | 'default' | 'large';

/**
 * Button's size scale, accepting **both** spellings in the library.
 *
 * 23 components use the abbreviated vocabulary (`sm` / `default` / `lg`, some
 * with `xs`); Button and Chip were written with the spelled-out one. Rather
 * than freeze that split or break consumers with a rename, both are accepted
 * and `normalizeSize` (src/utils/size.ts) maps the aliases onto the canonical
 * form before the class is built.
 *
 * **Prefer the abbreviations in new code** — they match the rest of the system.
 * The spelled-out forms stay for back-compat and can go at a major version.
 */
export type Size = CanonicalSize | 'xs' | 'sm' | 'lg';

// The 15-hue category / data-viz palette (--category-*). Consumers pick a hue for
// tags, labels, table cells, and chart legends. Components render the accessible
// tint pattern: --category-{c}-bg surface + --category-{c}-text (AA on that tint).
export type CategoryColor =
  | 'red'
  | 'orange'
  | 'amber'
  | 'green'
  | 'emerald'
  | 'teal'
  | 'cyan'
  | 'sky'
  | 'blue'
  | 'indigo'
  | 'violet'
  | 'purple'
  | 'fuchsia'
  | 'pink'
  | 'rose';
