import type { Meta, StoryObj } from '@storybook/react';
import { useEffect } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  Box,
  ChartColumn,
  FileText,
  Home,
  Layers,
  Phone,
  LayoutGrid,
  Plus,
  Sparkles,
} from 'lucide-react';
import TabBar, { TabBarList, TabBarMenu, TabBarNewGroupItem, TabBarNewTabMenu, TabBarSplit, TabBarTab } from './TabBar';
import type { TabBarNewTabCategory, TabBarNewTabItem } from './TabBar.types';
import Swatch from '../Swatch';
import { WINDOW, isNewTab, newTabValue, useTabSets } from '../../prototypes/tabSets';
import type { TabSets } from '../../prototypes/tabSets';
import SplitView, { SplitViewPane } from '../SplitView';
import {
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from '../ContextMenu';
import { useTabLayout } from '../../hooks/useTabLayout';
import type { TabLayoutItem } from '../../hooks/useTabLayout';
import type { UiDocsParameters } from '../../types/DocsTypes';

const meta: Meta<typeof TabBar> = {
  title: 'Components/TabBar',
  component: TabBar,
  argTypes: {
    activationMode: { options: ['manual', 'automatic'], control: 'inline-radio' },
  },
  parameters: {
    layout: 'fullscreen',
    ui: {
      description:
        'The browser-style strip of open documents — one tab per dashboard, ' +
        'application or workspace the user has open, plus a new-tab button.\n\n' +
        'It is the app-shell counterpart to `Tabs`, and the two are easy to ' +
        'confuse because they look alike. The tell is what a tab OWNS: a `Tabs` ' +
        'trigger reveals a `TabsContent` shipped beside it, while a `TabBar` tab ' +
        'stands for something the user opened and can close.\n\n' +
        '**Tab groups are sets, not stripes (Notion’s model).** A group is a named set of tabs and ' +
        'the bar shows ONE set at a time — the ungrouped tabs, or one group. The button at the far ' +
        'end (`TabBarMenu`) names the set on screen and switches between them, creates groups ' +
        '("New group…": a name, a color and which tabs to move) and manages them. A tab joins a ' +
        'group from its right-click menu. The "+" is a menu too: search every page, filter by type, reopen ' +
        'something recent. See the Default story.',
      tags: ['chrome', 'app shell', 'tab groups'],
      usage: {
        when: [
          'An application shell where the user opens several documents at once ' +
            'and moves between them — the pattern a browser, an IDE or a BI tool ' +
            'uses.',
          'Above the content area and below any global header, spanning the full ' +
            'width.',
        ],
        avoid: [
          'Switching between sections of a single page. That is {@link Tabs} — ' +
            'its sections are not openable or closable, and it ships its own ' +
            'panels.',
          'A row of application menus. That is {@link Menubar}.',
          'More than roughly a dozen tabs at once. The list scrolls rather than ' +
            'shrinking past 140px, so beyond that the labels stop being findable ' +
            'and a switcher serves better.',
        ],
        notes:
          'The bar reports intent and changes nothing itself. `onValueChange` ' +
          'says which tab was opened and `onClose` says which was dismissed — ' +
          'the consumer owns the list, so closing the open tab is the ' +
          "consumer's call about what to open next.\n\n" +
          '**Activation is manual by default, unlike `Tabs`.** Arrow keys move ' +
          'focus and Enter or Space commits, because arrowing across five tabs ' +
          'would otherwise mount and tear down five dashboards. Pass ' +
          '`activationMode="automatic"` for the `Tabs` behavior.',
      },
      composition: [
        {
          name: 'TabBarList',
          description:
            'The scrolling `role="tablist"`. Separate from the root so the ' +
            "new-tab button can sit outside it — a tablist's children should " +
            'be tabs, and `+` is not one. Give it an `aria-label`.',
        },
        {
          name: 'TabBarTab',
          description:
            'One open document: `value`, `label`, an optional leading `Icon`, ' +
            'and a close button unless `closable={false}`. `iconOnly` gives the 48px pinned-tab shape: icon, tooltip, no close button.',
        },
        {
          name: 'TabBarGroup',
          description:
            '**Deprecated (2026-09-21).** The old in-bar group: a colored chip, then its tabs with a line in the ' +
            'same color. Groups are no longer drawn in the bar — the bar shows one set at a time and `TabBarMenu` ' +
            'switches between them. Still exported so existing code keeps working; do not use it in new work.',
        },
        {
          name: 'TabBarSplit',
          description:
            'Two `TabBarTab`s drawn as one joined tab, for documents open side by side. Both halves keep ' +
            'the open-tab surface while the split is on screen. The page half is `SplitView`.',
        },
        {
          name: 'TabBarMenu',
          description:
            'The button at the far end of the bar. With `groups` it is the tab-group switcher: while a group is on screen it ' +
            'shows the group’s name (on the ungrouped tabs it is the plain icon), and the menu lists the ungrouped tabs and every group (color, tab count, a check on the current one). ' +
            '`onCreateGroup` adds "New group…" (name, color, tabs to move); the rename / recolor / ungroup / delete callbacks ' +
            'add "Manage groups…". Search covers every set’s tabs, and recently closed tabs can be reopened.',
        },
        {
          name: 'TabBarNewGroupItem',
          description:
            '"New group…" for a tab’s right-click menu (`TabBarTab.menu`): opens the `TabBarMenu` form with that tab checked. ' +
            'Put it inside an "Add to group" submenu listing the existing groups.',
        },
        {
          name: 'TabBarNewTabMenu',
          description:
            'The `+` as Notion’s new-tab menu, opened as a palette centered on the page: a search field, one filter chip per category, then Create actions, ' +
            'Recently opened and every page grouped by category. Chips narrow to their categories (several at once, ' +
            'or none for everything); search matches label, description and keywords. The app supplies `items`, ' +
            '`categories`, `recent` and `actions`; picking anything fires `onOpen`.',
        },
        {
          name: 'TabBarNewTab',
          description: 'The trailing `+` as a plain button, for a bar that only ever opens a blank tab. It opens a tab, it is not one.',
        },
      ],
      a11y: {
        keyboard: [
          { keys: ['ArrowRight', 'ArrowLeft'], description: 'Move focus to the next or previous tab, wrapping at both ends.' },
          { keys: ['Home', 'End'], description: 'Move focus to the first or last tab.' },
          { keys: ['Enter', 'Space'], description: 'Open the focused tab. Under `activationMode="automatic"` the arrow keys already did it.' },
          { keys: ['Tab'], description: 'Enters the bar at the open tab, then reaches that tab\'s close button.' },
          { keys: ['Shift', 'F10'], description: 'Opens the tab\'s menu (the Menu key does too): move left or right, open in split view, add to a group or start a new one, remove from a group. Every drag has a menu equivalent.' },
        ],
        notes:
          'A tab is a `div[role="tab"]`, not a `<button>`, and that is ' +
          'deliberate: a closable tab has to contain the close button, and a ' +
          'button inside a button is invalid HTML that browsers silently ' +
          'un-nest. Keeping the tab a div makes the nesting legal and lets the ' +
          'close control stay a real button with its own name and focus.\n\n' +
          'The close button is hidden with `opacity`, never `display: none`, so ' +
          'it stays in the tab order for keyboard users — focusing it reveals ' +
          'it. Its 20px box carries a negative hit-target inset so the pointer ' +
          'target still clears 24×24.',
      },
      changelog: [
        {
          date: '2026-09-21',
          summary: 'The new-tab palette can be opened from elsewhere on the page, such as a search card on a home screen.',
          detail: '`TabBarNewTabMenu` takes an optional controlled `open` + `onOpenChange`; omit them and the "+" owns its open state as before. First consumer: the Suite prototype, whose Home search card opens the same palette as the "+".',
        },
        {
          date: '2026-09-21',
          summary: 'Every example on this page now uses the same "+" and the same group button: the "+" opens the new-tab palette and the button at the far end switches tab groups.',
          detail:
            'The stories used to mix a plain `TabBarNewTab` (inert, or adding a numbered tab), a bar with no group button, and the full workspace. They now all render one story-only `StoryBar` (`TabBarNewTabMenu` + `TabBarMenu` wired to `useTabSets`, with the same catalog and the same Reporting group); each story changes only the tabs it opens with. No component change.',
        },
        {
          date: '2026-09-21',
          summary: 'The "+" can now open a Notion-style palette, centered on the page, to search and open any page, filter by type, reopen something recent, or start a blank tab or an Aiden chat. The full version of the bar is now the Default story.',
          detail:
            'New `TabBarNewTabMenu` (`items`, `categories`, `recent`, `actions`, `onOpen`), a `CommandDialog` with `placement="center"` rather than a dropdown under the button — it has room for every section and cannot run off a narrow window — with real `Chip` toggles for the filters. Escape, a click outside or a pick closes it and returns focus to the `+`. Nothing is highlighted on open; typing highlights the first match. Recently opened lists the five newest and hides while you search. The scroll fade is now a shared `useMoreBelow` used by both menus. `TabBarNewTab` stays for a plain `+`. The TabBar page opens on "Default" — groups, the switcher, split view and the new `+` menu — and the old Playground is "Basic".',
        },
        {
          date: '2026-09-21',
          summary: 'Tab groups follow one model: the bar shows one set of tabs at a time, and the button at the far end switches between groups. The old colored groups drawn in the bar are deprecated.',
          detail:
            '`TabBarGroup` is deprecated (still exported, so nothing breaks) and no story draws it. The workspace story is rebuilt as "Tab groups and split view" on the Notion model — the switcher, "New group…", and Add to group / New group… / Remove from group on each tab — sharing its state model with the AppShell story (`prototypes/tabSets.tsx`).',
        },
        {
          date: '2026-09-21',
          summary: 'Tab groups can now be created properly: "New group…" asks for a name, a color and which tabs to move, and a tab’s right-click menu can add it to a group, start a new one with it, or remove it. The menu also shows each group’s color, can rename, recolor, ungroup or delete groups, and its search finds tabs in every group.',
          detail:
            '`TabBarMenu`: **fixed** — "Group these tabs" is hidden while a group is on screen (it made a duplicate group); the current set and tab are disabled so the first highlight lands on something useful, with a check and a screen-reader "current" instead of a mono "Current"; counts are muted body text, not `CommandShortcut` keycaps; the "This window" row is matched on its own label, not its heading; the list fades at the foot while more is below; Recently closed lists the five newest. **Creating a group** — `onCreateGroup({ label, color, tabs })` shows one "New group…" action (replacing "Group these tabs" and "New empty group", which remain only for apps that do not pass it). It opens a form in the menu: Name (focused, required, no duplicate names), a color (radio swatches, defaulting to the first color no group uses; `groupColors` sets the palette), and a checklist of the tabs on screen with the current tab checked — checking none makes an empty group. `TabBarNewGroupItem` puts "New group…" in a tab’s right-click menu and opens the same form with that tab checked (the keyboard route: Shift+F10). `TabBarMenuItem.groupable: false` keeps a fixed tab such as Home out of the form. `onRecolorGroup` adds a color row to Manage groups. **Added (all optional)** — `TabBarMenuGroup.color` (a `Swatch` on the row) and `.tabs`; `ungroupedTabs` + `onOpenTab` (search reaches every set, each result labeled with where it lives); `onRenameGroup` / `onUngroup` / `onDeleteGroup` (a "Manage groups" view — real inputs and buttons, since a Command option cannot hold them — with a confirm before delete); `windowLabel`; `switcherLabel`. With `groups` the trigger shows the group’s name while a group is on screen and is the plain icon on the ungrouped tabs (no chevron); its accessible name always leads with the set ("Q3 Review, switch tab group or search tabs"). The menu opens with nothing highlighted (`Command.highlightOnOpen={false}`) — the first selectable row is a different group, and highlighting it read as "you are here" — and the current set and tab show their name in medium weight beside the check. The ungrouped tabs are now the first row under "Tab groups" — the separate "This window" heading read as "the view you are in" even while a group was on screen, so `windowHeading` is deprecated and ignored. Manage groups uses text buttons (Ungroup, Delete) instead of an unlabeled ungroup glyph and a trash can. Also picks up the shared popover alignment fix (`measureFloating`).',
        },
        {
          date: '2026-09-19',
          summary: 'The open tab is now part of the page: the page color, no tint, no underline. The tab menu can switch between tab groups and name the one on screen.',
          detail:
            'Open tab: `--background` only (the `--primary-soft` layer and the `::after` underline are gone), including inside a group and both halves of a split. The bar hairline is an inset `box-shadow` instead of `border-block-end`, so the opaque open tab covers it without overlapping (the list scrolls, so a 1px overhang would be clipped); painted tabs, the chip, "+" and the menu re-draw it on hover. `TabBarMenu` gains `groupLabel` (the group on screen, beside the glyph; the cell hugs it) and a switcher — `groups`, `activeGroup`, `onSelectGroup`, `ungroupedCount`, `onNewGroup`, `onGroupTabs`, `windowHeading`, `groupsHeading` — plus the `TabBarMenuGroup` type.',
        },
        {
          date: '2026-09-18',
          summary: 'The tab menu at the end of the bar lost its divider line, so it reads as part of the tabs like the "+".',
          detail: '`.ui-tab-bar__menu` no longer sets `border-inline-start`. In the AppShell the only line left in the corner is the actions divider in front of Ask Aiden.',
        },
        {
          date: '2026-09-18',
          summary: 'Grouped tabs are tinted with the group color, and the open tab inside a group takes the group\'s color instead of the app\'s.',
          detail:
            'Every tab in a `TabBarGroup` paints the group\'s `-bg` tint as a background-image layer, so hover still replaces it. The open tab inside a group paints the tint twice over `--background` (a step stronger than its siblings) and its underline reads `--category-{c}-text` rather than `--primary` — an indigo underline under an orange group read as a mistake. `-text`, not the vivid hue, because the vivid hue on its own tint measured under the 3:1 non-text floor in light (orange 2.3–2.5); the `-text` step measures 4.1–4.6 and equals the base hue in dark. The top line across the group is unchanged. Tabs outside a group keep the app-color underline.',
        },
        {
          date: '2026-09-15',
          summary: 'A line always separates the tabs from the "+", including when the tabs scroll.',
          detail: 'The rule used to belong to the last tab alone, so once the list overflowed and cut a tab off mid-way nothing marked the edge. `.ui-tab-bar__new` now carries `border-inline-start`, and `.ui-tab-bar__list` sits 1px under it (`margin-inline-end: -1px`) so the two lines coincide when the tabs fit.',
        },
        {
          date: '2026-09-15',
          summary: 'The tab menu button shows a stack of pages instead of a chevron.',
          detail: '`TabBarMenu` renders `GalleryVerticalEnd` (your tabs) rather than `ChevronDown`, which read as "more of this", and rather than an app window, which is the rail\'s job.',
        },
        {
          date: '2026-09-15',
          summary: 'Icon-only tabs, for a permanent tab like Home.',
          detail:
            '`iconOnly` on `TabBarTab` shows the `Icon` alone in a 48px cell the size of the "+" (`.ui-tab-bar__tab--icon-only` drops the 140px floor and the label padding). `label` becomes the accessible name and appears in a `Tooltip`. There is no close button on an icon-only tab, whatever `closable` says; close it from its `menu`.',
        },
        {
          date: '2026-09-15',
          summary: 'Tab groups, split tabs, drag and drop, and a right-click menu on every tab.',
          detail:
            '`TabBarGroup` (`value`, `label`, `color`, `collapsed`, `menu`) draws a category-colored chip and a matching top line on its tabs; collapsing hides every tab but the open one. `TabBarSplit` joins two tabs into one for a side-by-side view, with `SplitView` as the page half.\n\n' +
            '`onTabMove` on the root makes tabs draggable (native drag and drop, no library) and reports `{ value, before, group }`; the bar reorders nothing. Tabs carry `TAB_BAR_DRAG_TYPE`, so a drop target outside the bar can accept them. `menu` on `TabBarTab` and `TabBarGroup` wraps them in a `ContextMenu`, which is also the keyboard route to everything dragging does.\n\n' +
            '`useTabLayout` holds the order, groups, open tab and split in one object and saves it to localStorage.',
        },
        {
          date: '2026-09-15',
          summary: 'The bar moves onto the sidebar surface, and the open tab now paints the page with a soft brand tint.',
          detail:
            'The bar paints `--sidebar` with a `--sidebar-border` rule, tab edges and the tab menu divider use `--sidebar-border`, and hover (tabs, "+" and the tab menu) is `--sidebar-accent` — so the strip reads as the same frame as the rail and sidebar.\n\n' +
            'The open tab paints `--background` with a `--primary-soft` tint over it (8% light, 10% dark). It used to paint `--accent`, which is lighter than the bar in dark and darker in light, so the selected tab read raised in one mode and recessed in the other. Hovering the open tab no longer repaints it.',
        },
        {
          date: '2026-09-07',
          summary: 'A tab menu at the far end of the bar: search the open tabs, reopen recently closed ones.',
          detail: '`TabBarMenu` (`tabs`, `recentlyClosed`, `onReopen`) on `Popover` + `Command`; pinned with `margin-inline-start: auto` outside the tablist like the "+". Figma: `TabBar/Tab menu` behind `Show tab menu`.',
        },
        {
          date: '2026-08-11',
          summary: 'Initial build complete.',
          detail:
            'Built from a supplied Figma `TabBar` frame, whose fills turned out ' +
            'to be bound to a FOREIGN variable library rather than this ' +
            "system's tokens — they reported under names like " +
            '`--muted-foreground` but resolved to another palette entirely, and ' +
            'rendered correctly the whole time. Rebound here: the open tab ' +
            'surface to `--accent`, the resting label to `--muted-foreground`. ' +
            'The active underline moved from the fixed `--category-indigo` to ' +
            '`--primary`, so the bar themes with its application, and the ' +
            'hairlines moved from `--sidebar-border` to the system `--border`.',
        },
      ],
    } satisfies UiDocsParameters,
  },
};

export default meta;

type Story = StoryObj<typeof TabBar>;

type Doc = { value: string; label: string; Icon: LucideIcon; closable?: boolean; disabled?: boolean; iconOnly?: boolean };

const DOCS: Doc[] = [
  { value: 'tab-1', label: 'Tab 1', Icon: Home, closable: false },
  { value: 'tab-2', label: 'Tab 2', Icon: Box },
  { value: 'tab-3', label: 'Tab 3', Icon: BarChart3 },
];

// ─────────────────────────────────────────────────────────────────────────────
// One bar behind every story. The "+" is always the new-tab palette and the
// button at the far end is always the tab-group switcher, so the two controls
// do the same thing on every example; each story only changes the tabs.
// ─────────────────────────────────────────────────────────────────────────────

const WORKSPACE_DOCS: Record<string, Doc> = {
  home: { value: 'home', label: 'Home', Icon: Home, closable: false, iconOnly: true },
  volume: { value: 'volume', label: 'Originations volume', Icon: BarChart3 },
  pipeline: { value: 'pipeline', label: 'Pipeline health', Icon: ChartColumn },
  servicing: { value: 'servicing', label: 'Servicing queue', Icon: Layers },
  calls: { value: 'calls', label: 'Call center', Icon: Phone },
  notes: { value: 'notes', label: 'Release notes', Icon: FileText },
  collateral: { value: 'collateral', label: 'Collateral', Icon: Box },
};
/* What the "+" menu can open — the app's pages, by category. */
const NEW_TAB_CATEGORIES: TabBarNewTabCategory[] = [
  { value: 'dashboards', label: 'Dashboards' },
  { value: 'spaces', label: 'Spaces' },
  { value: 'reports', label: 'Reports' },
  { value: 'aiden', label: 'Aiden chats' },
];
const CATALOG: TabBarNewTabItem[] = [
  { value: 'volume', label: 'Originations volume', Icon: BarChart3, category: 'dashboards', description: 'Dartboards' },
  { value: 'pipeline', label: 'Pipeline health', Icon: ChartColumn, category: 'dashboards', description: 'Dartboards' },
  { value: 'collateral', label: 'Collateral', Icon: Box, category: 'dashboards', description: 'Dartboards' },
  { value: 'calls', label: 'Call center', Icon: Phone, category: 'dashboards', description: 'Dartboards' },
  { value: 'weekly-ops', label: 'Weekly Ops Review', Icon: LayoutGrid, category: 'spaces', description: '7 dashboards' },
  { value: 'servicing-space', label: 'Servicing operations', Icon: LayoutGrid, category: 'spaces', description: '4 dashboards' },
  { value: 'servicing', label: 'Servicing queue', Icon: Layers, category: 'reports', description: 'Updated hourly' },
  { value: 'notes', label: 'Release notes', Icon: FileText, category: 'reports', description: 'September' },
  { value: 'chat-collections', label: 'Which dashboards cover collections?', Icon: Sparkles, category: 'aiden', description: 'Yesterday' },
];
const RECENT: TabBarNewTabItem[] = [
  { value: 'weekly-ops', label: 'Weekly Ops Review', Icon: LayoutGrid, description: 'Opened today' },
  { value: 'collateral', label: 'Collateral', Icon: Box, description: 'Opened yesterday' },
  { value: 'chat-collections', label: 'Which dashboards cover collections?', Icon: Sparkles, description: '2 days ago' },
];
const CREATE: TabBarNewTabItem[] = [
  { value: 'blank', label: 'New blank tab', Icon: Plus },
  { value: 'aiden', label: 'New chat with Aiden', Icon: Sparkles },
];

type StoryBarProps = {
  id: string;
  /** The ungrouped tabs the bar opens on. The first permanent one is kept in every group. */
  docs: Doc[];
  active: string;
  /** Two tabs to open side by side. */
  split?: [string, string];
  /** Tabs already in the menu's Recently closed. */
  closed?: Doc[];
  /** Draw the open document under the bar. Off for the stories about the bar itself. */
  page?: boolean;
  activationMode?: 'manual' | 'automatic';
};

function StoryBar({ docs, active, closed = [], ...props }: StoryBarProps) {
  const known: Record<string, Doc> = { ...WORKSPACE_DOCS };
  [...docs, ...closed].forEach((d) => (known[d.value] = d));
  const doc = (v: string): Doc =>
    known[v] ??
    (() => {
      const c = CATALOG.find((i) => i.value === v);
      if (c) return { value: v, label: c.label, Icon: c.Icon ?? FileText };
      if (isNewTab(v)) return { value: v, label: 'New tab', Icon: Plus };
      if (v.startsWith('aiden-')) return { value: v, label: 'New chat', Icon: Sparkles };
      return { value: v, label: v, Icon: FileText };
    })();
  const pinned = docs.find((d) => d.closable === false)?.value;
  const sets = useTabSets({
    groups: [{ value: 'reporting', label: 'Reporting', color: 'blue' }],
    sets: {
      [WINDOW]: { tabs: docs.map((d) => d.value), active },
      reporting: { tabs: [...(pinned ? [pinned] : []), 'volume', 'pipeline'], active: 'volume' },
    },
    pinned,
    closed: closed.map((d) => d.value),
    item: (v) => ({ value: v, label: doc(v).label, Icon: doc(v).Icon }),
  });
  // Keyed on the set: switching groups remounts the bar with that set's tabs.
  return <StoryBarFrame key={sets.key} sets={sets} doc={doc} pinned={pinned} {...props} />;
}

function StoryBarFrame({
  id,
  sets,
  doc,
  pinned,
  split,
  page = true,
  activationMode,
}: Omit<StoryBarProps, 'docs' | 'active' | 'closed'> & { sets: TabSets; doc: (v: string) => Doc; pinned?: string }) {
  const layout = useTabLayout({
    initial: {
      tabs: sets.set.tabs,
      active: sets.set.active,
      groups: [],
      groupOf: {},
      split: sets.key === WINDOW && split && split.every((v) => sets.set.tabs.includes(v)) ? split : undefined,
    },
  });
  const { state } = layout;

  // Report this set's tabs back, so the menu can search them from any other set.
  const tabsKey = state.tabs.join('|');
  useEffect(() => {
    sets.reportSet({ tabs: state.tabs, active: state.active ?? state.tabs[0] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabsKey, state.active]);

  const close = (value: string) => {
    layout.close(value);
    sets.onClosed(value);
  };
  const move = (value: string, target: string | null) => {
    layout.close(value);
    sets.moveTab(value, target);
  };
  const reopen = (value: string) => {
    layout.open(value);
    sets.onReopened(value);
  };

  const tabMenu = (value: string) => {
    const inSplit = state.split?.includes(value);
    const others = state.tabs.filter((t) => t !== value);
    const targets = sets.groups.filter((g) => g.value !== sets.activeGroup);
    return (
      <>
        <ContextMenuItem onClick={() => layout.shift(value, -1)}>Move left</ContextMenuItem>
        <ContextMenuItem onClick={() => layout.shift(value, 1)}>Move right</ContextMenuItem>
        <ContextMenuSeparator />
        {inSplit ? (
          <ContextMenuItem onClick={layout.unsplit}>Close split view</ContextMenuItem>
        ) : (
          <ContextMenuSub>
            <ContextMenuSubTrigger>Open in split view</ContextMenuSubTrigger>
            <ContextMenuSubContent>
              {others.map((o) => (
                <ContextMenuItem key={o} onClick={() => layout.split(value, 'start', o)}>
                  Beside {doc(o).label}
                </ContextMenuItem>
              ))}
            </ContextMenuSubContent>
          </ContextMenuSub>
        )}
        {value !== pinned && (
          <>
            <ContextMenuSub>
              <ContextMenuSubTrigger>Add to group</ContextMenuSubTrigger>
              <ContextMenuSubContent>
                {targets.map((g) => (
                  <ContextMenuItem key={g.value} onClick={() => move(value, g.value)}>
                    <Swatch color={g.color} size="sm" />
                    {g.label}
                  </ContextMenuItem>
                ))}
                {targets.length > 0 && <ContextMenuSeparator />}
                <TabBarNewGroupItem tabs={[value]} />
              </ContextMenuSubContent>
            </ContextMenuSub>
            {sets.activeGroup !== null && <ContextMenuItem onClick={() => move(value, null)}>Remove from group</ContextMenuItem>}
          </>
        )}
        <ContextMenuSeparator />
        {doc(value).closable !== false && <ContextMenuItem onClick={() => close(value)}>Close tab</ContextMenuItem>}
        <ContextMenuItem onClick={() => layout.closeOthers(value)}>Close other tabs</ContextMenuItem>
      </>
    );
  };

  const renderTab = (value: string) => {
    const d = doc(value);
    return (
      <TabBarTab
        key={value}
        value={value}
        label={d.label}
        Icon={d.Icon}
        closable={d.closable !== false}
        iconOnly={d.iconOnly}
        disabled={d.disabled}
        onClose={() => close(value)}
        menu={tabMenu(value)}
      />
    );
  };

  const renderItem = (item: TabLayoutItem) =>
    item.type === 'tab' ? (
      renderTab(item.value)
    ) : (
      <TabBarSplit key={item.values.join('+')}>
        {renderTab(item.values[0])}
        {renderTab(item.values[1])}
      </TabBarSplit>
    );

  const closed = sets.closed.filter((v) => !state.tabs.includes(v));
  const panes = state.split && state.active && state.split.includes(state.active) ? state.split : state.active ? [state.active] : [];

  const bar = (
    <TabBar
      id={id}
      value={state.active ?? undefined}
      onValueChange={layout.select}
      onTabMove={layout.move}
      activationMode={activationMode}
    >
      <TabBarList aria-label="Open documents">
        {/* One set at a time: groups are switched from the tab menu, never drawn in the bar. */}
        {layout.segments.map((seg) => (seg.type === 'group' ? seg.items.map(renderItem) : renderItem(seg)))}
      </TabBarList>
      <TabBarNewTabMenu
        items={CATALOG}
        categories={NEW_TAB_CATEGORIES}
        recent={RECENT}
        actions={CREATE}
        onOpen={(item) => {
          if (item.value === 'blank') layout.open(newTabValue());
          else if (item.value === 'aiden') layout.open(`aiden-${newTabValue()}`);
          else layout.open(item.value);
        }}
      />
      <TabBarMenu
        {...sets.menuProps}
        tabs={state.tabs.map(sets.menuItem)}
        recentlyClosed={closed.map(sets.menuItem)}
        onReopen={(item) => reopen(item.value)}
      />
    </TabBar>
  );

  if (!page) return bar;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '640px', background: 'var(--background)' }}>
      {bar}
      <div style={{ flex: 1, minHeight: 0 }}>
        <SplitView id={`${id}-split`} onTabDrop={({ value, side }) => layout.split(value, side)}>
          {panes.map((v) => (
            <SplitViewPane
              key={v}
              aria-label={doc(v).label}
              active={v === state.active}
              onPointerDown={() => v !== state.active && layout.select(v)}
            >
              <div style={{ padding: 'var(--p-8)', display: 'flex', flexDirection: 'column', gap: 'var(--p-3)' }}>
                <h2 style={{ margin: 0, fontSize: 'var(--text-2xl)', lineHeight: 'var(--leading-8)', fontWeight: 'var(--font-semibold)', color: 'var(--foreground)' }}>
                  {doc(v).label}
                </h2>
                <p style={{ margin: 0, fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-5)', color: 'var(--muted-foreground)', maxWidth: 'var(--max-w-md)' }}>
                  The "+" opens the new-tab palette. The button at the right end of the bar names the tab group on screen and switches between groups. Right-click a tab to add it to a group or start a new one. Drag a tab onto this page to open it beside this one.
                </p>
              </div>
            </SplitViewPane>
          ))}
        </SplitView>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Stories. Every one renders StoryBar, so the "+" and the group button behave
// identically everywhere; what changes is the tabs each story opens with.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The TabBar as it ships. **"+"** opens the new-tab palette (Notion's), centered on the page: search, filter chips
 * by type, Create actions, Recently opened and every page by category. **The button at
 * the far end** is the tab-group switcher — a group is a named set of tabs and the bar
 * shows ONE set at a time; "New group…" there, or a tab's right-click → Add to group,
 * asks for a name, a color and which tabs to move. Split view and drag-to-reorder work
 * inside a set.
 */
export const Default: Story = {
  render: () => (
    <StoryBar
      id="workspace-tabs"
      docs={[WORKSPACE_DOCS.home, WORKSPACE_DOCS.servicing, WORKSPACE_DOCS.calls, WORKSPACE_DOCS.notes]}
      active="servicing"
      split={['servicing', 'calls']}
    />
  ),
};

/** The bar with a permanent first tab and two closable ones. Try `activationMode` in the controls. */
export const Playground: Story = {
  name: 'Basic',
  args: { activationMode: 'manual' },
  render: (args) => (
    <StoryBar id="tab-bar-playground" docs={DOCS} active="tab-1" page={false} activationMode={args.activationMode} />
  ),
};

/**
 * The tab menu at the far end: search the open tabs and every group, reopen a
 * recently closed tab, switch groups. This one opens with two tabs already in
 * Recently closed.
 */
export const WithMenu: Story = {
  render: () => (
    <StoryBar
      id="tab-bar-menu"
      docs={DOCS}
      active="tab-1"
      page={false}
      closed={[
        { value: 'tab-4', label: 'Phone Analytics', Icon: Phone },
        { value: 'tab-5', label: 'Call Center', Icon: ChartColumn },
      ]}
    />
  ),
};

/**
 * Opening and closing for real. The bar reports both and changes nothing —
 * the app owns the list, which is why closing the open tab can decide to fall
 * back to its neighbour. Open more from the "+".
 */
export const Closable: Story = {
  render: () => <StoryBar id="tab-bar-closable" docs={DOCS} active="tab-1" />,
};

/**
 * Past the available width the list scrolls rather than letting tabs collapse
 * — 140px is the floor, and the `+` never gets pushed off the end.
 */
export const Overflow: Story = {
  render: () => (
    <div style={{ maxWidth: 720 }}>
      <StoryBar
        id="tab-bar-overflow"
        active="tab-3"
        page={false}
        docs={[
          { value: 'tab-1', label: 'Tab 1', Icon: Home, closable: false },
          { value: 'tab-2', label: 'Tab 2', Icon: Box },
          { value: 'tab-3', label: 'Tab 3', Icon: BarChart3 },
          { value: 'tab-4', label: 'Tab 4', Icon: Phone },
          { value: 'tab-5', label: 'Tab 5', Icon: Layers },
          { value: 'tab-6', label: 'Tab 6', Icon: ChartColumn },
          { value: 'tab-7', label: 'Tab 7', Icon: FileText },
        ]}
      />
    </div>
  ),
};

/**
 * The bar is neutral chrome in every theme (2026-09-19): the open tab is the page color
 * with no underline, so no brand color sits on it. The only things that read `--primary`
 * are the drag-and-drop insertion marker and the focus ring — standing in a different
 * `data-theme` subtree changes those and nothing else.
 */
export const Themed: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--p-6)' }}>
      {(['db', 'dc', 'ph', 'rm'] as const).map((code) => (
        <div key={code} data-theme={code}>
          <span
            style={{
              display: 'block',
              marginBottom: 'var(--p-2)',
              fontFamily: 'var(--font-family-mono)',
              fontSize: 'var(--text-xs)',
              color: 'var(--muted-foreground)',
            }}
          >
            data-theme=&quot;{code}&quot;
          </span>
          <StoryBar id={`tab-bar-${code}`} docs={DOCS} active="tab-1" page={false} />
        </div>
      ))}
    </div>
  ),
};

/**
 * Every state at once. The third tab shows what a label too long for the 200px
 * cap does — it truncates rather than widening the tab, and it does so even
 * though no close button is visible, because the button holds its space at
 * rest.
 */
export const AllStates: Story = {
  render: () => (
    <StoryBar
      id="tab-bar-states"
      active="tab-1"
      page={false}
      docs={[
        { value: 'home', label: 'Home — icon only', Icon: Home, closable: false, iconOnly: true },
        { value: 'tab-1', label: 'Tab 1 — open, permanent', Icon: Home, closable: false },
        { value: 'tab-2', label: 'Tab 2 — resting', Icon: Box },
        { value: 'tab-3', label: 'Tab 3 — a label far too long to fit', Icon: BarChart3 },
        { value: 'tab-4', label: 'Tab 4 — disabled', Icon: Layers, disabled: true },
      ]}
    />
  ),
};
