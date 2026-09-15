import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import SplitView, { SplitViewPane } from './SplitView';
import TabBar, { TabBarList, TabBarTab } from '../TabBar';
import type { UiDocsParameters } from '../../types/DocsTypes';

const meta: Meta<typeof SplitView> = {
  title: 'Components/SplitView',
  component: SplitView,
  subcomponents: { SplitViewPane },
  parameters: {
    layout: 'fullscreen',
    ui: {
      description:
        'Two documents side by side, split exactly 50/50 — the page half of a `TabBarSplit`. Each pane scrolls on its own. ' +
        'Drag a tab from a `TabBar` over the view and it shows which half the tab will open in.',
      tags: ['layout', 'app shell', 'drag and drop'],
      usage: {
        when: ['Inside `AppShellMain`, holding the open document — one pane normally, two while a split is open.'],
        avoid: [
          'A resizable split. The divider is fixed by design; there is nothing to drag.',
          'Two unrelated regions of one page. Lay those out with `Stack`; a split view is two documents.',
        ],
        notes:
          '`onTabDrop` reports `{ value, side }` and opens nothing itself — `useTabLayout`’s `split(value, side)` applies it. ' +
          'Drop zones are pointer-only; the keyboard route is the tab’s right-click menu ("Open in split view").',
      },
      composition: [
        { name: 'SplitViewPane', description: 'One half. `active` marks the half whose tab is selected, drawn only while there are two.' },
      ],
      changelog: [
        {
          date: '2026-09-15',
          summary: 'Initial build complete.',
          detail:
            'Built with the `TabBar` groups and split work. Grid with auto columns, so one pane fills and two split 50/50 with no modifier. Accepts tabs carrying `TAB_BAR_DRAG_TYPE`; drop zones clear on any `dragend`, since a drag that ends in the bar never leaves the view.',
        },
      ],
    } satisfies UiDocsParameters,
  },
};

export default meta;
type Story = StoryObj<typeof SplitView>;

const Page = ({ title }: { title: string }) => (
  <div style={{ padding: 'var(--p-8)', color: 'var(--foreground)' }}>
    <h2 style={{ margin: 0, fontSize: 'var(--text-xl)', lineHeight: 'var(--leading-7)', fontWeight: 'var(--font-semibold)' }}>{title}</h2>
  </div>
);

/** Two panes, the start one active. */
export const Playground: Story = {
  render: () => (
    <div style={{ height: '480px', background: 'var(--background)' }}>
      <SplitView id="split-playground">
        <SplitViewPane aria-label="Originations volume" active>
          <Page title="Originations volume" />
        </SplitViewPane>
        <SplitViewPane aria-label="Pipeline health">
          <Page title="Pipeline health" />
        </SplitViewPane>
      </SplitView>
    </div>
  ),
};

/** Drag a tab from the bar onto the page to split it. */
export const DropATab: Story = {
  render: function DropATabStory() {
    const labels: Record<string, string> = { a: 'Originations volume', b: 'Pipeline health', c: 'Servicing queue' };
    const [panes, setPanes] = useState<string[]>(['a']);
    const [active, setActive] = useState('a');
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '480px', background: 'var(--background)' }}>
        <TabBar id="split-drop-bar" value={active} onValueChange={setActive} onTabMove={() => {}}>
          <TabBarList aria-label="Open dashboards">
            {Object.entries(labels).map(([v, l]) => (
              <TabBarTab key={v} value={v} label={l} closable={false} />
            ))}
          </TabBarList>
        </TabBar>
        <div style={{ flex: 1, minHeight: 0 }}>
          <SplitView
            id="split-drop"
            onTabDrop={({ value, side }) => {
              const other = panes.find((p) => p !== value) ?? active;
              setPanes(other === value ? [value] : side === 'start' ? [value, other] : [other, value]);
              setActive(value);
            }}
          >
            {panes.map((p) => (
              <SplitViewPane key={p} aria-label={labels[p]} active={p === active}>
                <Page title={labels[p]} />
              </SplitViewPane>
            ))}
          </SplitView>
        </div>
      </div>
    );
  },
};
