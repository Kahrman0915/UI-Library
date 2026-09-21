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
 *
 * @deprecated 2026-09-21 — tab groups are no longer drawn in the bar. The bar shows
 * one set of tabs at a time and `TabBarMenu` switches between groups (Notion's
 * model). Kept exported so existing code builds; do not use it in new work.
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
  /**
   * `false` for a tab that cannot move into a group — a fixed tab every set
   * keeps, like Home. It is left out of the "New group…" form. Default `true`.
   */
  groupable?: boolean;
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
  /** Tabs closed earlier in the session, newest first. The menu lists the five newest. */
  recentlyClosed?: TabBarMenuItem[];
  /** Fires with the closed tab to reopen. */
  onReopen?: (item: TabBarMenuItem) => void;
  /** Accessible name for the icon-only trigger. Defaults to `Search tabs`. */
  label?: string;
  /**
   * With `groups`, the trigger's accessible name after the set on screen —
   * "Q3 Review, switch tab group or search tabs". Default
   * `switch tab group or search tabs`: switching is now the button's main job,
   * so the name leads with the set, not with search.
   */
  switcherLabel?: string;
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
  /** How many tabs are ungrouped, for the "This window" row. Derived from `ungroupedTabs` when that is set. */
  ungroupedCount?: number;
  /**
   * The window's ungrouped tabs. While a group is on screen they are not in
   * `tabs`, so passing them lets the search find them (with `onOpenTab`).
   */
  ungroupedTabs?: TabBarMenuItem[];
  /**
   * Opens a tab that belongs to ANOTHER set — the ungrouped tabs (`group`
   * `null`) or another group. Setting it makes the search reach every set's
   * tabs, each labeled with where it lives; the bar changes nothing itself.
   */
  onOpenTab?: (tab: string, group: string | null) => void;
  /**
   * Creates a group from the "New group…" form: the name, color and tabs the
   * person chose. Setting it replaces "Group these tabs" and "New empty group"
   * with that one action, which is also what `TabBarNewGroupItem` opens.
   */
  onCreateGroup?: (group: TabBarNewGroup) => void;
  /** Colors offered for a group, in order. Default: eight category hues. */
  groupColors?: CategoryColor[];
  /** Recolors a group from "Manage groups". */
  onRecolorGroup?: (value: string, color: CategoryColor) => void;
  /** Renames a group. Setting any of the group callbacks adds "Manage groups". */
  onRenameGroup?: (value: string, label: string) => void;
  /** Moves a group's tabs back to the ungrouped tabs and removes the group. */
  onUngroup?: (value: string) => void;
  /** Deletes a group AND closes its tabs. Asks to confirm first. */
  onDeleteGroup?: (value: string) => void;
  /**
   * The name of the ungrouped set: its row in the menu and the trigger's
   * accessible name. Default `Ungrouped tabs`. The trigger SHOWS a name only
   * while a group is on screen; on the ungrouped tabs it is the plain icon.
   */
  windowLabel?: string;
  /**
   * Shows "New empty group" when set.
   * @deprecated 2026-09-21 — use `onCreateGroup`, which names the group. Ignored when `onCreateGroup` is set.
   */
  onNewGroup?: () => void;
  /**
   * Shows "Group these tabs" when set — moves the ungrouped tabs on screen into a
   * new group. Hidden while a group is on screen: those tabs are already grouped,
   * and offering it there made a duplicate group.
   * @deprecated 2026-09-21 — use `onCreateGroup`, which names the group and lets you pick the tabs. Ignored when `onCreateGroup` is set.
   */
  onGroupTabs?: () => void;
  /**
   * @deprecated 2026-09-21 — ignored. The ungrouped tabs are now the first row
   * under `groupsHeading`; a separate "This window" heading read as "the view you
   * are in" even while a group was on screen.
   */
  windowHeading?: string;
  /** The switcher's heading. Default `Tab groups`. */
  groupsHeading?: string;
  className?: string;
};

/** What the "New group…" form hands to `onCreateGroup`. */
export type TabBarNewGroup = {
  label: string;
  color: CategoryColor;
  /** The tabs to move into the group — values from `tabs`. May be empty. */
  tabs: string[];
};

/**
 * "New group…" for a tab's right-click menu (`TabBarTab.menu`): opens the tab
 * menu's form with `tabs` checked. Renders a `ContextMenuItem`, so it must sit in
 * a context menu inside a `TabBar` that has a `TabBarMenu` with `onCreateGroup`.
 */
export type TabBarNewGroupItemProps = {
  /** The tabs to check in the form — usually the tab that was right-clicked. */
  tabs?: string[];
  /** Item text. Default `New group…`. */
  label?: string;
  className?: string;
};

/** One saved tab group in the {@link TabBarMenu} switcher. */
export type TabBarMenuGroup = {
  value: string;
  label: string;
  /** How many tabs the group holds, shown at the end of its row. Derived from `tabs` when that is set. */
  count?: number;
  /** The group's color in the bar (`TabBarGroup.color`), shown as a swatch on its row. */
  color?: CategoryColor;
  /** The group's tabs, so the search can find them from another set (see `onOpenTab`). */
  tabs?: TabBarMenuItem[];
};

/** One thing the new-tab menu can open: a page, a dashboard, an action. */
export type TabBarNewTabItem = {
  value: string;
  label: string;
  /** Short muted text at the end of the row — "Opened yesterday", an owner, a space. */
  description?: string;
  Icon?: LucideIcon;
  /** A `TabBarNewTabCategory.value`. Items with no category show under "Other". */
  category?: string;
  /** Extra words the search matches besides the label and description. */
  keywords?: string[];
};

/** A filter chip, and the heading its items list under. */
export type TabBarNewTabCategory = {
  value: string;
  label: string;
};

/**
 * The "+" as a menu — Notion's new-tab search. Opens on a search field, one filter
 * chip per category, then Create actions, Recently opened, and every page grouped
 * by category. Chips narrow to their categories (several at once, or none for
 * everything); search matches label, description and keywords. Picking anything
 * fires `onOpen` — the bar opens nothing itself, as with `onClose`.
 */
export type TabBarNewTabMenuProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'children' | 'onSelect'
> & {
  /** Everything that can be opened, in the order to list it. */
  items: TabBarNewTabItem[];
  /** The filter chips, in order. Omit for no chips. */
  categories?: TabBarNewTabCategory[];
  /** Recently opened, newest first. Listed while nothing is typed or filtered; the five newest show. */
  recent?: TabBarNewTabItem[];
  /** Create actions — "New blank page", "New chat with Aiden". Listed first, and hidden while a chip is on. */
  actions?: TabBarNewTabItem[];
  /** Fires with whatever was picked, from any section. */
  onOpen: (item: TabBarNewTabItem) => void;
  /**
   * Controlled open state — for opening the palette from somewhere other than the
   * "+", such as a search card on a home page. Omit to let the "+" own it.
   */
  open?: boolean;
  /** Fires when the palette opens or closes, from the "+", a pick, Escape or an outside click. */
  onOpenChange?: (open: boolean) => void;
  /** Accessible name for the "+". Default `New tab`. */
  label?: string;
  /** Search placeholder. Default `Search pages…`. */
  placeholder?: string;
  /** Shown when nothing matches. Default `No pages match`. */
  emptyText?: string;
  /** Section headings. Default `Create` / `Recently opened` / `Other`. */
  actionsHeading?: string;
  recentHeading?: string;
  otherHeading?: string;
  className?: string;
};
