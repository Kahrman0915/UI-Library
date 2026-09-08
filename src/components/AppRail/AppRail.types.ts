import type { LucideIcon } from 'lucide-react';

/** The vertical application switcher on the inline-start edge of the shell. */
export type AppRailProps = Omit<React.HTMLAttributes<HTMLElement>, 'children'> & {
  /** Accessible name of the `<nav>`. Default `Applications`. */
  label?: string;
  /** Above the applications: the sidebar trigger. */
  header?: React.ReactNode;
  /** Below the applications: account, notifications, mode, settings. */
  footer?: React.ReactNode;
  /** `AppRailItem`s. */
  children?: React.ReactNode;
  className?: string;
};

/**
 * One application on the rail: an icon-only link. The rail is an application switcher,
 * so an item is a place to go — an `<a>` by default — and it reads as an icon, not a
 * brand tile; the destination application paints its own colour once you are in it.
 */
export type AppRailItemProps = Omit<React.HTMLAttributes<HTMLElement>, 'children'> & {
  /** Seeds `${id}-count`. */
  id: string;
  /** The application's name — the item's accessible name (there is no visible text). */
  label: string;
  /** The application's glyph, drawn at 20px. */
  Icon: LucideIcon;
  /** The application the user is in. Sets `aria-current="page"` and the accent fill. */
  active?: boolean;
  /**
   * Unread or pending count. Shown as a small dot on the tile's corner (a numbered pill
   * swamps a 36px tile); the number is announced to screen readers as `${count} unread`.
   */
  count?: number;
  /** The application's URL. Omit to render a `<button>` for a router-driven switch. */
  href?: string;
  className?: string;
};
