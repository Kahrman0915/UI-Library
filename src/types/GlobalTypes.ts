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
// Derived from CATEGORY_COLORS rather than written out, for the same reason
// `Size` is derived from `SIZES`: a Storybook control list that drifts from the
// union is silently rejected and falls back to the default arg. The order is the
// palette's own, so a story that maps the list renders the ramp in hue order.
export const CATEGORY_COLORS = [
  'red',
  'orange',
  'amber',
  'green',
  'emerald',
  'teal',
  'cyan',
  'sky',
  'blue',
  'indigo',
  'violet',
  'purple',
  'fuchsia',
  'pink',
  'rose',
] as const;

export type CategoryColor = (typeof CATEGORY_COLORS)[number];
