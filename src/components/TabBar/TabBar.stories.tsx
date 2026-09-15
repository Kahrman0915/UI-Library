import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  Box,
  ChartColumn,
  FileText,
  Home,
  Layers,
  Phone,
} from 'lucide-react';
import TabBar, { TabBarGroup, TabBarList, TabBarMenu, TabBarNewTab, TabBarSplit, TabBarTab } from './TabBar';
import SplitView, { SplitViewPane } from '../SplitView';
import Button from '../Button';
import {
  ContextMenuItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from '../ContextMenu';
import { useTabLayout } from '../../hooks/useTabLayout';
import type { TabLayoutItem } from '../../hooks/useTabLayout';
import type { CategoryColor } from '../../types/GlobalTypes';
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
        'stands for something the user opened and can close.',
      tags: ['chrome', 'app shell', 'themed'],
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
          '`activationMode="automatic"` for the `Tabs` behaviour.',
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
            'A tab group: a chip in one of the 15 category colours, then its tabs, each with a line in the ' +
            'same colour along the top. `collapsed` folds the tabs behind the chip (the open tab stays). ' +
            'The chip is a `role="tab"` with `aria-expanded`, so the arrow keys reach it; Enter collapses it.',
        },
        {
          name: 'TabBarSplit',
          description:
            'Two `TabBarTab`s drawn as one joined tab, for documents open side by side. Both halves keep ' +
            'the open-tab surface while the split is on screen. The page half is `SplitView`.',
        },
        {
          name: 'TabBarNewTab',
          description: 'The trailing `+`. A plain button — it opens a tab, it is not one.',
        },
      ],
      a11y: {
        keyboard: [
          { keys: ['ArrowRight', 'ArrowLeft'], description: 'Move focus to the next or previous tab, wrapping at both ends.' },
          { keys: ['Home', 'End'], description: 'Move focus to the first or last tab.' },
          { keys: ['Enter', 'Space'], description: 'Open the focused tab. Under `activationMode="automatic"` the arrow keys already did it.' },
          { keys: ['Tab'], description: 'Enters the bar at the open tab, then reaches that tab\'s close button.' },
          { keys: ['Shift', 'F10'], description: 'Opens the tab\'s or group chip\'s menu (the Menu key does too). Every drag has a menu equivalent: move left or right, add to a group, open in split view.' },
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
            '`TabBarGroup` (`value`, `label`, `color`, `collapsed`, `menu`) draws a category-coloured chip and a matching top line on its tabs; collapsing hides every tab but the open one. `TabBarSplit` joins two tabs into one for a side-by-side view, with `SplitView` as the page half.\n\n' +
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

type Doc = { value: string; label: string; Icon: LucideIcon; closable?: boolean };

const DOCS: Doc[] = [
  { value: 'tab-1', label: 'Tab 1', Icon: Home, closable: false },
  { value: 'tab-2', label: 'Tab 2', Icon: Box },
  { value: 'tab-3', label: 'Tab 3', Icon: BarChart3 },
];

/** The bar as drawn — a permanent first tab, two closable ones, and `+`. */
export const Playground: Story = {
  args: { id: 'tab-bar-playground', activationMode: 'manual' },
  render: (args) => {
    const [open, setOpen] = useState('tab-1');
    return (
      <TabBar {...args} value={open} onValueChange={setOpen}>
        <TabBarList aria-label="Open documents">
          {DOCS.map(({ value, label, Icon, closable }) => (
            <TabBarTab key={value} value={value} label={label} Icon={Icon} closable={closable} />
          ))}
        </TabBarList>
        <TabBarNewTab />
      </TabBar>
    );
  },
};

/**
 * The tab menu at the far end: search the open tabs, reopen a recently closed
 * one. Selecting an open tab switches the bar; selecting a closed one reports
 * it through `onReopen`, and this story puts it back in the list.
 */
export const WithMenu: Story = {
  render: () => {
    const [tabs, setTabs] = useState<Doc[]>(DOCS);
    const [closed, setClosed] = useState<Doc[]>([
      { value: 'tab-4', label: 'Phone Analytics', Icon: Phone },
      { value: 'tab-5', label: 'Call Center', Icon: ChartColumn },
    ]);
    const [open, setOpen] = useState('tab-1');
    return (
      <TabBar id="tab-bar-menu" value={open} onValueChange={setOpen}>
        <TabBarList aria-label="Open documents">
          {tabs.map(({ value, label, Icon, closable }) => (
            <TabBarTab
              key={value}
              value={value}
              label={label}
              Icon={Icon}
              closable={closable}
              onClose={() => {
                setTabs((t) => t.filter((d) => d.value !== value));
                setClosed((c) => [tabs.find((d) => d.value === value)!, ...c]);
                if (open === value) setOpen('tab-1');
              }}
            />
          ))}
        </TabBarList>
        <TabBarNewTab />
        <TabBarMenu
          tabs={tabs}
          recentlyClosed={closed}
          onReopen={(item) => {
            setClosed((c) => c.filter((d) => d.value !== item.value));
            setTabs((t) => [...t, { value: item.value, label: item.label, Icon: item.Icon ?? Home }]);
            setOpen(item.value);
          }}
        />
      </TabBar>
    );
  },
};

/**
 * Opening and closing for real. The bar reports both and changes nothing —
 * this story owns the list, which is why closing the open tab can decide to
 * fall back to its neighbour.
 */
export const Closable: Story = {
  render: () => {
    const [tabs, setTabs] = useState<Doc[]>(DOCS);
    const [open, setOpen] = useState('tab-1');
    const [next, setNext] = useState(4);

    const close = (value: string) => {
      const index = tabs.findIndex((t) => t.value === value);
      const remaining = tabs.filter((t) => t.value !== value);
      setTabs(remaining);
      if (open === value && remaining.length) {
        setOpen(remaining[Math.max(0, index - 1)].value);
      }
    };

    return (
      <TabBar id="tab-bar-closable" value={open} onValueChange={setOpen}>
        <TabBarList aria-label="Open documents">
          {tabs.map(({ value, label, Icon, closable }) => (
            <TabBarTab
              key={value}
              value={value}
              label={label}
              Icon={Icon}
              closable={closable}
              onClose={() => close(value)}
            />
          ))}
        </TabBarList>
        <TabBarNewTab
          onClick={() => {
            const value = `tab-${next}`;
            setTabs([...tabs, { value, label: `Tab ${next}`, Icon: FileText }]);
            setOpen(value);
            setNext(next + 1);
          }}
        />
      </TabBar>
    );
  },
};

/**
 * Past the available width the list scrolls rather than letting tabs collapse
 * — 140px is the floor, and the `+` never gets pushed off the end.
 */
export const Overflow: Story = {
  render: () => {
    const many: Doc[] = [
      { value: 'tab-1', label: 'Tab 1', Icon: Home, closable: false },
      { value: 'tab-2', label: 'Tab 2', Icon: Box },
      { value: 'tab-3', label: 'Tab 3', Icon: BarChart3 },
      { value: 'tab-4', label: 'Tab 4', Icon: Phone },
      { value: 'tab-5', label: 'Tab 5', Icon: Layers },
      { value: 'tab-6', label: 'Tab 6', Icon: ChartColumn },
      { value: 'tab-7', label: 'Tab 7', Icon: FileText },
    ];
    const [open, setOpen] = useState('tab-3');
    return (
      <div style={{ maxWidth: 720 }}>
        <TabBar id="tab-bar-overflow" value={open} onValueChange={setOpen}>
          <TabBarList aria-label="Open documents">
            {many.map(({ value, label, Icon, closable }) => (
              <TabBarTab key={value} value={value} label={label} Icon={Icon} closable={closable} />
            ))}
          </TabBarList>
          <TabBarNewTab />
        </TabBar>
      </div>
    );
  },
};

/**
 * The underline reads `--primary`, so the bar carries whichever application it
 * belongs to. Nothing about the component changes between these — each is
 * simply standing in a different `data-theme` subtree.
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
          <TabBar id={`tab-bar-${code}`} defaultValue="tab-1">
            <TabBarList aria-label={`${code} open documents`}>
              {DOCS.map(({ value, label, Icon, closable }) => (
                <TabBarTab
                  key={value}
                  value={`${value}`}
                  label={label}
                  Icon={Icon}
                  closable={closable}
                />
              ))}
            </TabBarList>
            <TabBarNewTab />
          </TabBar>
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
    <TabBar id="tab-bar-states" defaultValue="tab-1">
      <TabBarList aria-label="States">
        <TabBarTab value="home" label="Home — icon only" Icon={Home} iconOnly />
        <TabBarTab value="tab-1" label="Tab 1 — open, permanent" Icon={Home} closable={false} />
        <TabBarTab value="tab-2" label="Tab 2 — resting" Icon={Box} />
        <TabBarTab value="tab-3" label="Tab 3 — a label far too long to fit" Icon={BarChart3} />
        <TabBarTab value="tab-4" label="Tab 4 — disabled" Icon={Layers} disabled />
      </TabBarList>
      <TabBarNewTab />
    </TabBar>
  ),
};

// ─────────────────────────────────────────────────────────────────────────────
// Groups, split view, drag and drop — the whole workspace, saved.
// ─────────────────────────────────────────────────────────────────────────────

const WORKSPACE_DOCS: Record<string, Doc> = {
  home: { value: 'home', label: 'Home', Icon: Home, closable: false },
  volume: { value: 'volume', label: 'Originations volume', Icon: BarChart3 },
  pipeline: { value: 'pipeline', label: 'Pipeline health', Icon: ChartColumn },
  servicing: { value: 'servicing', label: 'Servicing queue', Icon: Layers },
  calls: { value: 'calls', label: 'Call centre', Icon: Phone },
  notes: { value: 'notes', label: 'Release notes', Icon: FileText },
  collateral: { value: 'collateral', label: 'Collateral', Icon: Box },
};

const GROUP_COLORS: CategoryColor[] = ['blue', 'emerald', 'amber', 'rose', 'violet', 'cyan'];

function Workspace() {
  const layout = useTabLayout({
    storageKey: 'ui-lib-stories-tab-layout',
    initial: {
      tabs: ['home', 'volume', 'pipeline', 'servicing', 'calls', 'notes'],
      active: 'volume',
      groups: [{ id: 'reporting', label: 'Reporting', color: 'blue', collapsed: false }],
      groupOf: { volume: 'reporting', pipeline: 'reporting' },
      split: ['servicing', 'calls'],
    },
  });
  const { state } = layout;
  const doc = (v: string) => WORKSPACE_DOCS[v] ?? { value: v, label: v, Icon: FileText };

  const tabMenu = (value: string) => {
    const inGroup = state.groupOf[value];
    const inSplit = state.split?.includes(value);
    const others = state.tabs.filter((t) => t !== value);
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
        <ContextMenuItem
          onClick={() =>
            layout.createGroup([value], {
              label: 'New group',
              color: GROUP_COLORS[state.groups.length % GROUP_COLORS.length],
            })
          }
        >
          Add to new group
        </ContextMenuItem>
        {state.groups.some((g) => g.id !== inGroup) && (
          <ContextMenuSub>
            <ContextMenuSubTrigger>Add to group</ContextMenuSubTrigger>
            <ContextMenuSubContent>
              {state.groups
                .filter((g) => g.id !== inGroup)
                .map((g) => (
                  <ContextMenuItem key={g.id} onClick={() => layout.addToGroup(value, g.id)}>
                    {g.label}
                  </ContextMenuItem>
                ))}
            </ContextMenuSubContent>
          </ContextMenuSub>
        )}
        {inGroup && <ContextMenuItem onClick={() => layout.removeFromGroup(value)}>Remove from group</ContextMenuItem>}
        <ContextMenuSeparator />
        {doc(value).closable !== false && (
          <ContextMenuItem onClick={() => layout.close(value)}>Close tab</ContextMenuItem>
        )}
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
        iconOnly={value === 'home'}
        onClose={() => layout.close(value)}
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

  const closed = Object.keys(WORKSPACE_DOCS).filter((v) => !state.tabs.includes(v));
  const panes = state.split && state.active && state.split.includes(state.active) ? state.split : state.active ? [state.active] : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '640px', background: 'var(--background)' }}>
      <TabBar id="workspace-tabs" value={state.active ?? undefined} onValueChange={layout.select} onTabMove={layout.move}>
        <TabBarList aria-label="Open dashboards">
          {layout.segments.map((seg) =>
            seg.type === 'group' ? (
              <TabBarGroup
                key={seg.group.id}
                value={seg.group.id}
                label={seg.group.label}
                color={seg.group.color}
                collapsed={seg.group.collapsed}
                onCollapsedChange={(collapsed) => layout.updateGroup(seg.group.id, { collapsed })}
                menu={
                  <>
                    <ContextMenuItem onClick={() => layout.updateGroup(seg.group.id, { collapsed: !seg.group.collapsed })}>
                      {seg.group.collapsed ? 'Expand group' : 'Collapse group'}
                    </ContextMenuItem>
                    <ContextMenuSub>
                      <ContextMenuSubTrigger>Colour</ContextMenuSubTrigger>
                      <ContextMenuSubContent>
                        <ContextMenuRadioGroup
                          value={seg.group.color}
                          onValueChange={(c) => layout.updateGroup(seg.group.id, { color: c as CategoryColor })}
                        >
                          {GROUP_COLORS.map((c) => (
                            <ContextMenuRadioItem key={c} value={c}>
                              {c[0].toUpperCase() + c.slice(1)}
                            </ContextMenuRadioItem>
                          ))}
                        </ContextMenuRadioGroup>
                      </ContextMenuSubContent>
                    </ContextMenuSub>
                    <ContextMenuItem onClick={() => layout.ungroup(seg.group.id)}>Ungroup</ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem variant="destructive" onClick={() => layout.closeGroup(seg.group.id)}>
                      Close group
                    </ContextMenuItem>
                  </>
                }
              >
                {seg.items.map(renderItem)}
              </TabBarGroup>
            ) : (
              renderItem(seg)
            ),
          )}
        </TabBarList>
        <TabBarNewTab onClick={() => closed[0] && layout.open(closed[0])} disabled={closed.length === 0} />
        <TabBarMenu
          tabs={state.tabs.map((v) => ({ value: v, label: doc(v).label, Icon: doc(v).Icon }))}
          recentlyClosed={closed.map((v) => ({ value: v, label: doc(v).label, Icon: doc(v).Icon }))}
          onReopen={(item) => layout.open(item.value)}
        />
      </TabBar>

      <div style={{ flex: 1, minHeight: 0 }}>
        <SplitView id="workspace-split" onTabDrop={({ value, side }) => layout.split(value, side)}>
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
                  Drag a tab onto this page to open it beside this one. Right-click a tab for the same actions from the keyboard.
                </p>
                <div>
                  <Button id={`reset-${v}`} style="outline" size="sm" label="Reset layout" onClick={layout.reset} />
                </div>
              </div>
            </SplitViewPane>
          ))}
        </SplitView>
      </div>
    </div>
  );
}

/**
 * The full workspace: a group, a split pair, and a page that splits when a tab is
 * dropped on it. Drag tabs to reorder them, drop one on a group chip to add it,
 * right-click for everything else. The layout is saved — reload and it comes back.
 */
export const GroupsAndSplitView: Story = {
  render: () => <Workspace />,
};
