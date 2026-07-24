export type Direction = 'ltr' | 'rtl';

export type DirectionProviderProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Text/layout direction applied to the subtree. */
  dir: Direction;
  className?: string;
};
