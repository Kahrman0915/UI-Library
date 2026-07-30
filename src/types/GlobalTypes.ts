import type { JSX } from 'react';

export type ChildrenAsPropsType = {
  children: JSX.Element[] | JSX.Element;
};

/**
 * The library's one size scale.
 *
 * Derived from `SIZES` rather than written out, so the type and the Storybook
 * control list cannot drift — a control option missing from the union is the
 * specific failure that makes Storybook silently fall back to the default arg.
 *
 * `default` rather than `md` is deliberate: it is the library-wide word for the
 * unmarked rung, matching `variant="default"` and `style="default"`.
 */
export const SIZES = ['xs', 'sm', 'default', 'lg'] as const;

export type Size = (typeof SIZES)[number];

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
