import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Slider from './Slider';

const meta: Meta<typeof Slider> = {
  title: 'Components/Slider',
  component: Slider,
  parameters: { layout: 'padded' },
  argTypes: {
    size: { control: 'select', options: ['sm', 'default', 'lg'] },
    min: { control: 'number' },
    max: { control: 'number' },
    step: { control: 'number' },
    disabled: { control: 'boolean' },
    showValue: { control: 'boolean' },
    range: { control: 'boolean' },
  },
  args: {
    id: 'story-slider',
    min: 0,
    max: 100,
    step: 1,
    size: 'default',
    disabled: false,
    showValue: true,
    label: 'Volume',
  },
};

export default meta;

type Story = StoryObj<typeof Slider>;

const Frame = ({ children }: { children: React.ReactNode }) => (
  <div style={{ maxWidth: 420, display: 'grid', gap: 32 }}>{children}</div>
);

export const Playground: Story = {
  args: { defaultValue: 40 },
  render: (args) => (
    <Frame>
      <Slider {...args} />
    </Frame>
  ),
};

// Not spreading `args` here on purpose: the meta args are typed against the
// single-value branch of the union, so `{...args} range` puts a `value?: number`
// next to `range: true` and the discriminant rejects it — which is the union
// working as intended.
export const Range: Story = {
  render: () => (
    <Frame>
      <Slider
        id="range-basic"
        label="Price range"
        range
        defaultValue={[20, 70]}
        showValue
        formatValue={(v) => `$${v}`}
      />
    </Frame>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Frame>
      <Slider id="sz-sm" size="sm" label="Small" defaultValue={30} showValue />
      <Slider id="sz-md" size="default" label="Default" defaultValue={50} showValue />
      <Slider id="sz-lg" size="lg" label="Large" defaultValue={70} showValue />
    </Frame>
  ),
};

export const Steps: Story = {
  render: () => (
    <Frame>
      <Slider id="step-1" label="step = 1" min={0} max={10} step={1} defaultValue={4} showValue />
      <Slider id="step-25" label="step = 25" min={0} max={100} step={25} defaultValue={50} showValue />
      <Slider
        id="step-frac"
        label="step = 0.1"
        min={0}
        max={1}
        step={0.1}
        defaultValue={0.4}
        showValue
      />
    </Frame>
  ),
};

export const WithDescription: Story = {
  render: () => (
    <Frame>
      <Slider
        id="desc"
        label="Compression quality"
        description="Higher values keep more detail but produce larger files."
        defaultValue={65}
        showValue
        formatValue={(v) => `${v}%`}
      />
    </Frame>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Frame>
      <Slider id="dis-single" label="Single" defaultValue={40} disabled showValue />
      <Slider id="dis-range" label="Range" range defaultValue={[25, 75]} disabled showValue />
    </Frame>
  ),
};

export const Controlled: Story = {
  render: () => {
    const [single, setSingle] = useState(30);
    const [range, setRange] = useState<[number, number]>([20, 60]);
    return (
      <Frame>
        <div style={{ display: 'grid', gap: 8 }}>
          <Slider
            id="ctl-single"
            label="Controlled single"
            value={single}
            onValueChange={setSingle}
            showValue
          />
          <button
            type="button"
            onClick={() => setSingle(50)}
            className="ui-button ui-button--default ui-button--default-outline ui-button--sz-small"
          >
            Reset to 50
          </button>
        </div>
        <div style={{ display: 'grid', gap: 8 }}>
          <Slider
            id="ctl-range"
            label="Controlled range"
            range
            value={range}
            onValueChange={setRange}
            showValue
          />
          <button
            type="button"
            onClick={() => setRange([20, 60])}
            className="ui-button ui-button--default ui-button--default-outline ui-button--sz-small"
          >
            Reset to 20 – 60
          </button>
        </div>
      </Frame>
    );
  },
};

export const AllStates: Story = {
  render: () => (
    <Frame>
      <Slider id="st-min" label="At minimum" defaultValue={0} showValue />
      <Slider id="st-max" label="At maximum" defaultValue={100} showValue />
      <Slider id="st-range-touch" label="Thumbs meeting" range defaultValue={[50, 50]} showValue />
      <Slider id="st-negative" label="Negative scale" min={-50} max={50} defaultValue={-10} showValue />
    </Frame>
  ),
};

// Inside `data-surface="aiden"` the filled range takes Aiden's gradient.
// See Foundations/Themes → Aiden Surface.
export const AidenSurface: Story = {
  render: () => (
    <div data-surface="aiden" style={{ maxWidth: 'var(--max-w-sm)' }}>
      <Slider id="aiden-slider" label="Temperature" defaultValue={65} showValue />
    </div>
  ),
};
