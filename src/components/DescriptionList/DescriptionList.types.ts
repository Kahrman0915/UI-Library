export type DescriptionListOrientation = 'horizontal' | 'vertical';

export type DescriptionListProps = React.HTMLAttributes<HTMLDListElement> & {
  /**
   * Default `horizontal`: the terms form a column and every value lines up beside them —
   * request fields, dashboard info, record details. `vertical` stacks each term over its
   * value, for a narrow panel or values long enough to need the full width.
   */
  orientation?: DescriptionListOrientation;
  /** `DescriptionListItem`s. */
  children?: React.ReactNode;
  className?: string;
};

export type DescriptionListItemProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> & {
  /** The label — what this row describes. Renders the `dt`. Takes a node, so it can carry an icon or a tooltip. */
  term: React.ReactNode;
  /** The value — renders the `dd`. Any content: text, a Badge, a list of tags, a link. */
  children?: React.ReactNode;
  className?: string;
};
