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
import TabBar, { TabBarList, TabBarNewTab, TabBarTab } from './TabBar';
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
          date: '2026-08-11',
          summary: 'Initial build complete.',
          detail:
            'Built from the Figma `TabBar` frame. Two fills were corrected on ' +
            'the way in: the open tab was bound to `--muted-foreground` while ' +
            'painting `--accent`, and the inactive label read the raw ' +
            '`slate/500` ramp rather than the semantic `--muted-foreground`. ' +
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
  { value: 'home', label: 'Dartboards Home', Icon: Home, closable: false },
  { value: 'ccb', label: 'CCB Health Check', Icon: Box },
  { value: 'adherence', label: 'Adherence Dashboard', Icon: BarChart3 },
];

/** The bar as drawn — a permanent Home tab, two open dashboards, and `+`. */
export const Playground: Story = {
  args: { id: 'tab-bar-playground', activationMode: 'manual' },
  render: (args) => {
    const [open, setOpen] = useState('home');
    return (
      <TabBar {...args} value={open} onValueChange={setOpen}>
        <TabBarList aria-label="Open dashboards">
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
 * Opening and closing for real. The bar reports both and changes nothing —
 * this story owns the list, which is why closing the open tab can decide to
 * fall back to its neighbour.
 */
export const Closable: Story = {
  render: () => {
    const [tabs, setTabs] = useState<Doc[]>(DOCS);
    const [open, setOpen] = useState('home');
    const [next, setNext] = useState(1);

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
        <TabBarList aria-label="Open dashboards">
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
            const value = `new-${next}`;
            setTabs([...tabs, { value, label: `Untitled ${next}`, Icon: FileText }]);
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
      { value: 'home', label: 'Dartboards Home', Icon: Home, closable: false },
      { value: 'ccb', label: 'CCB Health Check', Icon: Box },
      { value: 'adherence', label: 'Adherence Dashboard', Icon: BarChart3 },
      { value: 'calls', label: 'Call Center', Icon: Phone },
      { value: 'irm', label: 'IRM Metrics', Icon: Layers },
      { value: 'tableau', label: 'Tableau Internal', Icon: ChartColumn },
      { value: 'notes', label: 'Release Notes', Icon: FileText },
    ];
    const [open, setOpen] = useState('adherence');
    return (
      <div style={{ maxWidth: 720 }}>
        <TabBar id="tab-bar-overflow" value={open} onValueChange={setOpen}>
          <TabBarList aria-label="Open dashboards">
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
          <TabBar id={`tab-bar-${code}`} defaultValue="home">
            <TabBarList aria-label={`${code} dashboards`}>
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

/** Every state at once: open, resting, hovered (middle), and disabled. */
export const AllStates: Story = {
  render: () => (
    <TabBar id="tab-bar-states" defaultValue="home">
      <TabBarList aria-label="States">
        <TabBarTab value="home" label="Open + permanent" Icon={Home} closable={false} />
        <TabBarTab value="resting" label="Resting" Icon={Box} />
        <TabBarTab value="long" label="A dashboard name far too long to fit" Icon={BarChart3} />
        <TabBarTab value="disabled" label="Disabled" Icon={Layers} disabled />
      </TabBarList>
      <TabBarNewTab />
    </TabBar>
  ),
};
