export type ToolbarJustify = 'start' | 'between' | 'end';

export type ToolbarProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> & {
  id: string;
  /** The toolbar's accessible name — `role="toolbar"` requires one. "Filters", "Table actions". */
  label: string;
  /** How the groups spread. Default `between`: filters on the left, search on the right. */
  justify?: ToolbarJustify;
  children?: React.ReactNode;
  className?: string;
};

export type ToolbarGroupProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> & {
  children?: React.ReactNode;
  className?: string;
};
