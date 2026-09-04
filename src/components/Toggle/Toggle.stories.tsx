import { Bold, Italic, Underline } from 'lucide-react';
import type { Meta, StoryObj } from '@storybook/react';
import Toggle from './Toggle';
import type { UiDocsParameters } from '../../types/DocsTypes';

const meta: Meta<typeof Toggle> = {
  title: 'Components/Toggle',
  component: Toggle,
  parameters: {
    layout: 'centered',
    ui: {
      description:
        'A single two-state button — bold, mute, show archived. Many-on is `Chip`; ' +
        'one-of-N is `ToggleGroup`.',
      tags: ['aria-pressed'],
      changelog: [
        {
          date: '2026-09-04',
          summary: 'Documented (not fixed): the pressed `plain` toggle is hard to pick out in dark. --primary-text is NOT the answer.',
          detail:
            'No code change — recording a measured dead end so it is not retried. `plain` marks its pressed item ' +
            'with --foreground against --muted-foreground plus a 500->600 weight step. That pairing is 2.36:1 in ' +
            'light but 1.18:1 in dark (#f8fafc vs #e2e8f0), so in dark the weight step at 14px is carrying the ' +
            'entire state and the bar reads as having no selection. The obvious fix — move the pressed label to ' +
            '--primary-text — was implemented and measured, and it is WORSE in the untethered theme: 1.49:1 light ' +
            'and 1.14:1 dark, because base --primary is slate (#cbd5e1 dark) and offers no hue. It only helps under ' +
            'the six brand themes that remap --primary to a real hue, and in Figma not even those, where the ' +
            'variable resolves the same under all seven brands. test:contrast did not catch it because it gates ' +
            'text against SURFACES, and both labels clear AA against the background — the failure is between two ' +
            'foregrounds, which nothing currently gates. Root cause is --muted-foreground in dark sitting one step ' +
            'from --foreground, which is a token decision affecting every muted/normal text pair in the library ' +
            '(same origin as the Tabs indicator finding). Options on the table: retheme dark --muted-foreground, ' +
            'or use the `line` variant in filter bars so a --primary bar carries the state instead of colour.',
        },
        {
          date: '2026-08-27',
          summary: 'Gained a trailing icon.',
          detail:
            'Adds `IconRight`, rendered after the label. Toggle was the only pill in the library without a trailing icon — Chip, Badge and Button all had one. Purely additive.',
        },
        {
          date: '2026-08-27',
          summary: 'Two quiet variants, `line` and `plain`, for filter bars where a segmented control shouts.',
          detail:
            'ToggleVariant goes from default|outline to default|outline|line|plain. Both new rungs are ' +
            'transparent with no border: `line` marks the pressed item with a --primary bar on its bottom ' +
            'edge, reusing the Tabs indicator geometry (--border-w-300 on --rounded-full); `plain` uses ' +
            '--foreground at --font-semibold against --muted-foreground. Presentation only — identical ' +
            'semantics, keyboard behaviour and aria. `plain` steps weight 500->600 rather than 400->600 ' +
            'because bold text is wider and a filter bar reflows on every selection change.',
        },
        {
          date: '2026-07-29',
          summary: 'Initial build complete.',
          detail:
            'Component shipped: tokenised styles, full prop surface, stories, and documented API.',
        },
      ],
    } satisfies UiDocsParameters,
  },
  argTypes: {
    variant: { control: 'select', options: ['default', 'outline', 'line', 'plain'] },
    size: { control: 'select', options: ['sm', 'default', 'lg'] },
    disabled: { control: 'boolean' },
    defaultPressed: { control: 'boolean' },
    IconLeft: { table: { disable: true } },
    IconCenter: { table: { disable: true } },
  },
  args: {
    id: 'story-toggle',
    label: 'Bold',
    variant: 'default',
    size: 'default',
    disabled: false,
    defaultPressed: false,
  },
};

export default meta;

type Story = StoryObj<typeof Toggle>;

export const Playground: Story = {};

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12 }}>
      <Toggle id="v-default" variant="default" label="Default" defaultPressed />
      <Toggle id="v-outline" variant="outline" label="Outline" defaultPressed />
      <Toggle id="v-line" variant="line" label="Line" defaultPressed />
      <Toggle id="v-plain" variant="plain" label="Plain" defaultPressed />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Toggle id="s-sm" size="sm" label="Small" />
      <Toggle id="s-md" size="default" label="Default" />
      <Toggle id="s-lg" size="lg" label="Large" />
    </div>
  ),
};

export const IconOnly: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8 }}>
      <Toggle id="i-bold" variant="outline" IconCenter={Bold} aria-label="Bold" defaultPressed />
      <Toggle id="i-italic" variant="outline" IconCenter={Italic} aria-label="Italic" />
      <Toggle id="i-underline" variant="outline" IconCenter={Underline} aria-label="Underline" />
    </div>
  ),
};

export const WithIconAndLabel: Story = {
  render: () => (
    <Toggle id="il" IconLeft={Bold} label="Bold" defaultPressed />
  ),
};

export const Disabled: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12 }}>
      <Toggle id="d-off" label="Off" disabled />
      <Toggle id="d-on" label="On" disabled defaultPressed />
    </div>
  ),
};
