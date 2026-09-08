/**
 * A level on the spacing ladder — the ONLY spacing input a Stack takes.
 *
 * 1 page · 2 section · 3 block · 4 element · 5 micro. A container's gap is the level it
 * sits at in the hierarchy; each level down is one step down. The number behind a level
 * comes from `--space-N`, which slides with viewport width and reshapes per
 * `data-density`, so a Stack never has to know about either. See docs/spacing.md.
 */
export type StackLevel = 1 | 2 | 3 | 4 | 5;

export type StackDirection = 'vertical' | 'horizontal';
export type StackAlign = 'start' | 'center' | 'end' | 'stretch';
export type StackJustify = 'start' | 'center' | 'end' | 'between';

export type StackProps = Omit<React.HTMLAttributes<HTMLElement>, 'children'> & {
  /** Which level of the ladder the gap between children sits at. Required: a Stack with no level is a frame with a magic number. */
  level: StackLevel;
  /** Default `vertical`. `horizontal` lays children in a row. */
  direction?: StackDirection;
  /** Let a horizontal run wrap onto new lines — a Grid is a Stack that wraps. The row gap is the same level. */
  wrap?: boolean;
  /** Cross-axis alignment. Default `stretch`, so children fill the width of a vertical Stack. */
  align?: StackAlign;
  /** Main-axis distribution. Default `start`; `between` pushes the first and last children to the edges. */
  justify?: StackJustify;
  /** The element to render. Default `div`; use `section`, `nav`, `ul` or `ol` when the content has that meaning. */
  as?: 'div' | 'section' | 'nav' | 'ul' | 'ol';
  children?: React.ReactNode;
  className?: string;
};
