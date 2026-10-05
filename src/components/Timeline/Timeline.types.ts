export type TimelineProps = React.OlHTMLAttributes<HTMLOListElement> & {
  /**
   * Join the markers with a vertical line, so the list reads as one sequence of events — an
   * activity log, a status history. Off for a conversation thread, where each entry stands on
   * its own and a line through the avatars is noise.
   */
  connector?: boolean;
  /** `TimelineItem`s, oldest first unless the screen says otherwise. */
  children?: React.ReactNode;
  className?: string;
};

export type TimelineItemProps = Omit<React.LiHTMLAttributes<HTMLLIElement>, 'title'> & {
  /**
   * What leads the entry: an `Avatar` (size `sm`) for a person, a `FeaturedIcon` or a glyph for
   * a system event. Leave it out and a small dot marks the entry — the right default for a
   * plain log.
   */
  marker?: React.ReactNode;
  /** Who did it. The first half of the meta line. */
  author?: React.ReactNode;
  /** When — the visible text, e.g. "08/30/2026" or "2 hours ago". The second half of the meta line. */
  time?: React.ReactNode;
  /**
   * The machine-readable moment, ISO 8601 (`2026-08-30T09:41`). When set, `time` renders in a
   * `<time dateTime>` so assistive tech and copy-paste get an unambiguous date.
   */
  dateTime?: string;
  /** The entry itself — a message, a status change. Text or richer content. */
  children?: React.ReactNode;
  /** Controls that belong to this entry (a link out, "Edit"), on a row under the body. */
  actions?: React.ReactNode;
  className?: string;
};
