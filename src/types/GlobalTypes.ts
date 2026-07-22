import type { JSX } from 'react';

export type ChildrenAsPropsType = {
  children: JSX.Element[] | JSX.Element;
};

export type Size = 'xsmall' | 'small' | 'default' | 'large';

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
