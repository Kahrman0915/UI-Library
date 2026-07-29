import type { Meta, StoryObj } from '@storybook/react';
import Blockquote from './Blockquote';
import type { UiDocsParameters } from '../../types/DocsTypes';

const meta: Meta<typeof Blockquote> = {
  title: 'Components/Blockquote',
  component: Blockquote,
  parameters: {
    layout: 'padded',
    ui: {
      description:
        'A quoted passage, set off with an accent rule and italic body text. Pass ' +
        '`cite` to render an attribution footer under it.',
      tags: ['typography'],
      changelog: [
        {
          date: '2026-07-29',
          summary: 'Initial build complete.',
          detail:
            'Component shipped: tokenised styles, full prop surface, stories, and documented API.',
        },
      ],
    } satisfies UiDocsParameters,
  },
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
