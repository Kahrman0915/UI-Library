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
 * One application on the rail: a themed `Mark`. The item carries its own `data-theme`,
 * which is why the rail reads as a set of applications rather than a menu — every tile
 * is its brand's, whatever the page around it is themed.
 */
export type AppRailItemProps = Omit<React.HTMLAttributes<HTMLElement>, 'children'> & {
  /** Seeds `${id}-mark` and `${id}-count`. */
  id: string;
  /** The application's name — the item's accessible name. */
  label: string;
  /** The application's glyph, rendered by the `Mark`. */
  Icon: LucideIcon;
  /** The application's brand code (`db`, `dc`, …). Omit for the main brand. */
  theme?: string;
  /** The application the user is in. Sets `aria-current="page"`. */
  active?: boolean;
  /** A count badge on the tile's corner — unread, pending. */
  count?: number;
  /** Renders an `<a>` instead of a `<button>`. */
  href?: string;
  className?: string;
};
