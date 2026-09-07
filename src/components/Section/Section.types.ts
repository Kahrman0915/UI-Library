/**
 * `default` — a section of a page: base-size heading, content level 2 below it.
 * `group` — a labelled group inside a section (the status groups on My Requests): a small
 * uppercase overline, content level 4 below it. Same component, one rung tighter.
 */
export type SectionVariant = 'default' | 'group';

export type SectionProps = Omit<React.HTMLAttributes<HTMLElement>, 'children'> & {
  /** Seeds `${id}-heading`, which the section's `aria-labelledby` points at. */
  id: string;
  /** The heading text. Omit for an unlabelled region. */
  heading?: string;
  /** Trailing controls on the heading row — a "View all", a count, a menu. */
  actions?: React.ReactNode;
  /** Default `default`. See {@link SectionVariant}. */
  variant?: SectionVariant;
  /** Default `h2`. */
  headingLevel?: 'h2' | 'h3' | 'h4';
  children?: React.ReactNode;
  className?: string;
};
