export type ButtonGroupOrientation = 'horizontal' | 'vertical';

/**
 * Joins adjacent buttons into one unit, flattening the corners where they meet.
 *
 * Purely presentational: it's a `role="group"` with no selection state. For
 * one-of-N selection use `ToggleGroup`. Pass `aria-label` (via `...rest`) to
 * name the group — an unlabelled group is announced as bare structure.
 */
export type ButtonGroupProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children'
> & {
  id: string;
  children: React.ReactNode;
  /** Default **`horizontal`** — note the separator's default is the opposite. */
  orientation?: ButtonGroupOrientation;
  className?: string;
};

/**
 * Hairline between two buttons in the group.
 *
 * **Its `orientation` default is `vertical` — deliberately inverted relative to
 * the group's `horizontal`.** A horizontal row of buttons needs *vertical*
 * dividers, so the defaults already pair correctly; only override it if you
 * flip the group.
 */
export type ButtonGroupSeparatorProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children'
> & {
  id: string;
  /** Default **`vertical`** (see above). */
  orientation?: ButtonGroupOrientation;
  className?: string;
};

/** Static text segment sharing the group's border — a label, unit, or count. */
export type ButtonGroupTextProps = React.HTMLAttributes<HTMLDivElement> & {
  id: string;
  children: React.ReactNode;
  className?: string;
};
