import type { LucideIcon } from 'lucide-react';
import type { CategoryColor } from '../../types/GlobalTypes';

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
  /**
   * Makes tabs draggable and fires when one is dropped somewhere new in the bar.
   * The bar reorders nothing itself — apply the move to your list (or let
   * `useTabLayout` do it). Omit it and tabs are not draggable.
   */
  onTabMove?: (move: TabBarMove) => void;
  className?: string;
};

/**
 * Where a dragged tab was dropped. `before` is the tab it now sits in front of
 * (`null` = the end of the bar); `group` is the group it now belongs to (`null` =
 * ungrouped). Dropping on a group's chip puts the tab first in that group.
 */
export type TabBarMove = {
  value: string;
  before: string | null;
  group: string | null;
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
  /** Optional leading glyph — the document's or application's icon. Required when `iconOnly`. */
  Icon?: LucideIcon;
  /**
   * Shows only the `Icon`, in a 48px cell the size of the new-tab button — the
   * pinned-tab shape, for a permanent tab like Home. `label` becomes the tab's
   * accessible name and appears in a tooltip. An icon-only tab has no close button
   * (there is no room for one), whatever `closable` says; close it from its `menu`.
   */
  iconOnly?: boolean;
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
  /**
   * The tab's right-click menu: `ContextMenuItem`s and friends, rendered inside a
   * `ContextMenuContent`. Opens on right-click, Shift+F10 or the Menu key, which is
   * also the keyboard route to everything drag and drop does ("Move right",
   * "Add to group", "Open in split view"). The actions are yours; the bar adds none.
   */
  menu?: React.ReactNode;
  className?: string;
};

/**
 * A tab group: a colored chip followed by the tabs it holds. Collapsing hides the
 * group's tabs behind the chip, except any whose document is on screen (the open
 * tab, or both halves of a showing split), so what is on screen always has a tab.
 *
 * The chip is a `role="tab"` with `aria-expanded` rather than a button, because a
 * tablist may only own tabs. It never becomes the selected tab — Enter and Space
 * collapse or expand it.
 */
export type TabBarGroupProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'color'> & {
  /** Identifies the group. Reported as `group` in `onTabMove`. */
  value: string;
  /** The chip's text. */
  label: string;
  /** One of the 15 category hues. Defaults to `blue`. */
  color?: CategoryColor;
  /** Controlled collapsed state. Pair with `onCollapsedChange`. */
  collapsed?: boolean;
  /** Uncontrolled initial collapsed state. */
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  /** The chip's right-click menu (rename, recolour, ungroup, close group). */
  menu?: React.ReactNode;
  /** `TabBarTab`s and `TabBarSplit`s. */
  children?: React.ReactNode;
  className?: string;
};

/**
 * Two tabs shown side by side in the page, drawn as one joined tab. Both halves
 * are the page color while either is selected (there is no underline since
 * 2026-09-19); `SplitView` marks which pane has focus. Pass exactly two
 * `TabBarTab`s. The page layout is `SplitView`'s job, not the bar's.
 */
export type TabBarSplitProps = React.HTMLAttributes<HTMLDivElement> & {
  children?: React.ReactNode;
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
  /**
   * The tab group on screen, shown beside the stacked glyph (2026-09-19). With a
   * group, the bar shows one set of tabs at a time and this is how the user
   * knows which one. Leave it unset for the plain 48px icon cell.
   */
  groupLabel?: string;
  /**
   * The saved tab groups. Setting this adds a switcher to the top of the menu:
   * the window's ungrouped tabs, each group, and the group actions. Picking one
   * fires `onSelectGroup`; the bar changes nothing itself.
   */
  groups?: TabBarMenuGroup[];
  /** The group on screen, or `null` for the window's ungrouped tabs. */
  activeGroup?: string | null;
  /** Fires with a group's `value`, or `null` for the ungrouped tabs. */
  onSelectGroup?: (value: string | null) => void;
  /** How many tabs are ungrouped, for the "This window" row. */
  ungroupedCount?: number;
  /** Shows "New empty group" when set. */
  onNewGroup?: () => void;
  /** Shows "Group these tabs" when set — moves the tabs on screen into a new group. */
  onGroupTabs?: () => void;
  /** Section headings for the switcher. Default `This window` / `Tab groups`. */
  windowHeading?: string;
  groupsHeading?: string;
  className?: string;
};

/** One saved tab group in the {@link TabBarMenu} switcher. */
export type TabBarMenuGroup = {
  value: string;
  label: string;
  /** How many tabs the group holds, shown at the end of its row. */
  count?: number;
};
