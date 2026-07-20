import type { Meta, StoryObj } from '@storybook/react';
import Blockquote from './Blockquote';

const meta: Meta<typeof Blockquote> = {
  title: 'Components/Blockquote',
  component: Blockquote,
  parameters: { layout: 'padded' },
};

export default meta;

type Story = StoryObj<typeof Blockquote>;

export const Playground: Story = {
  render: () => (
    <div style={{ maxWidth: 560 }}>
      <Blockquote cite="Antoine de Saint-Exupéry">
        Perfection is achieved, not when there is nothing more to add, but when
        there is nothing left to take away.
      </Blockquote>
    </div>
  ),
};

export const WithoutCitation: Story = {
  render: () => (
    <div style={{ maxWidth: 560 }}>
      <Blockquote>
        The best way to predict the future is to invent it.
      </Blockquote>
    </div>
  ),
};

export const MultipleParagraphs: Story = {
  render: () => (
    <div style={{ maxWidth: 560 }}>
      <Blockquote cite="A thoughtful engineer">
        <p>Ship the smallest thing that could possibly be useful.</p>
        <p>Then listen to what breaks, and fix that next.</p>
      </Blockquote>
    </div>
  ),
};
