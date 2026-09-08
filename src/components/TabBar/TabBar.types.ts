import type { LucideIcon } from 'lucide-react';

/**
 * Whether moving focus with the arrow keys also switches the tab.
 *
 * Mirrors `Tabs`'s prop of the same name, but the DEFAULT IS INVERTED —
 * `manual` here, `automatic` there. A `Tabs` panel is a section of the page
 * already on screen; a `TabBar` tab is a whole open document, and arrowing
 * across five of them would mount and tear down five dashboards. Arrow to
 * look, Enter or Space to commit.
 */
export type TabBarActivationMode = 'automatic' | 'manual';

export type TabBarProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Seeds every child id — each tab renders as `${id}-tab-${value}`. */
  id: string;
  /** The open tab's `value`. Provide with `onValueChange` for a controlled bar. */
  value?: string;
  /** The initially open tab when the bar is uncontrolled. */
  defaultValue?: string;
  /** Fires with the newly opened tab's `value`. */
  onValueChange?: (value: string) => void;
  /** Arrow keys move focus only (`manual`, the default) or also switch tabs. */
  activationMode?: TabBarActivationMode;
  className?: string;
};

export type TabBarListProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
};

export type TabBarTabProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'onClick'
> & {
  /** Identifies the tab. Matched against the bar's `value`. */
  value: string;
  /** The tab's text. Truncates with an ellipsis rather than growing the tab. */
  label: string;
  /** Optional leading glyph — the document's or application's icon. */
  Icon?: LucideIcon;
  /**
   * Whether the tab renders a close button. Defaults to `true`; set `false`
   * for a permanent tab (a Home tab that cannot be closed).
   */
  closable?: boolean;
  /** Fires when the close button is pressed. The bar closes nothing itself. */
  onClose?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** Accessible name for the close button. Defaults to `Close ${label}`. */
  closeLabel?: string;
  /** Greys the tab and takes it out of the arrow-key order. */
  disabled?: boolean;
  className?: string;
};

export type TabBarNewTabProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'children'
> & {
  /** Accessible name for the icon-only button. Defaults to `New tab`. */
  label?: string;
  className?: string;
};

/** One entry in the tab menu — an open tab, or a recently closed one. */
export type TabBarMenuItem = {
  /** The tab's `value` (for open tabs, the same value the bar switches to). */
  value: string;
  label: string;
  Icon?: LucideIcon;
};

/**
 * The menu at the far end of the bar: tab search over the open tabs, and the
 * recently closed list for quick reopening — the control every browser puts at
 * the end of its tab strip. Selecting an open tab switches the bar; selecting a
 * closed one calls `onReopen`, and the consumer reopens it (the bar closes and
 * reopens nothing itself, as with `onClose`).
 */
export type TabBarMenuProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'children'
> & {
  /** The open tabs, in bar order. */
  tabs: TabBarMenuItem[];
  /** Tabs closed earlier in the session, newest first. */
  recentlyClosed?: TabBarMenuItem[];
  /** Fires with the closed tab to reopen. */
  onReopen?: (item: TabBarMenuItem) => void;
  /** Accessible name for the icon-only trigger. Defaults to `Search tabs`. */
  label?: string;
  /** Search field placeholder. Defaults to `Search tabs…`. */
  placeholder?: string;
  /** Shown when nothing matches. Defaults to `No tabs match`. */
  emptyText?: string;
  /** Group headings. Default `Open tabs` / `Recently closed`. */
  openHeading?: string;
  closedHeading?: string;
  className?: string;
};
