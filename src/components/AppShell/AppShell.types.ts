import type { LucideIcon } from 'lucide-react';

/** The root. Fills the height it is given — put it in a `100dvh` box. */
export type AppShellProps = React.HTMLAttributes<HTMLDivElement> & {
  id: string;
  children?: React.ReactNode;
  className?: string;
};

/**
 * The strip across the top: a logo cell the width of the rail, the `TabBar` (children),
 * and a trailing actions group — the one place the Aiden entry point sits in the chrome.
 */
export type AppShellTabStripProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> & {
  /** The application mark, in the square cell above the rail. */
  logo?: React.ReactNode;
  /** Trailing controls: all-apps, "Ask Aiden". */
  actions?: React.ReactNode;
  /** The `TabBar`. */
  children?: React.ReactNode;
  className?: string;
};

/** `AppShellBody` (the row under the strip) and `AppShellWorkspace` (sidebar + main). */
export type AppShellRegionProps = React.HTMLAttributes<HTMLDivElement> & {
  children?: React.ReactNode;
  className?: string;
};

/** The scrolling content column — the Main Content region a page's `PageContainer` fills. */
export type AppShellMainProps = React.HTMLAttributes<HTMLElement> & {
  children?: React.ReactNode;
  className?: string;
};

/** The vertical application switcher on the inline-start edge. */
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
  /** A count badge on the tile's corner — unread, pending. */
  count?: number;
  /** The application's URL. Omit to render a `<button>` for a router-driven switch. */
  href?: string;
  className?: string;
};
