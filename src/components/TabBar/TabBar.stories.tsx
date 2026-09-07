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
import TabBar, { TabBarList, TabBarMenu, TabBarNewTab, TabBarTab } from './TabBar';
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
            'and a close button unless `closable={false}`.',
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
        <TabBarTab value="tab-1" label="Tab 1 — open, permanent" Icon={Home} closable={false} />
        <TabBarTab value="tab-2" label="Tab 2 — resting" Icon={Box} />
        <TabBarTab value="tab-3" label="Tab 3 — a label far too long to fit" Icon={BarChart3} />
        <TabBarTab value="tab-4" label="Tab 4 — disabled" Icon={Layers} disabled />
      </TabBarList>
      <TabBarNewTab />
    </TabBar>
  ),
};
