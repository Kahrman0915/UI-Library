import type { Meta, StoryObj } from '@storybook/react';
import { Journeys } from './Journeys';
import '../DartSuite.scss';

const meta: Meta = {
  title: 'Prototypes/Persona journeys',
  globals: { theme: 'db' },
  parameters: {
    layout: 'fullscreen',
    ui: {
      description:
        'Every persona’s path through DART Central, IRM and DartBoards — the script for walking someone through the prototype.\n\n' +
        '**Journey map** puts all of them on one page. **Walk through** is the presenter: the script on the left and the live ' +
        'prototype on the right. Choosing a step signs in as that step’s person and opens its page, and **Do this step for me** ' +
        'performs the action, so nobody fills a form live. Use ← and → to step.\n\n' +
        '**One fix, end to end** is the full example: a reader reports a problem, a dev manager assigns it, a developer builds it, ' +
        'production support ships it, and the reader hears it’s fixed — one request moving between five people in one store. ' +
        '“Start over with fresh data” resets it.',
      tags: ['prototype', 'walkthrough', 'personas'],
    },
  },
};

export default meta;
type Story = StoryObj;

/** All seven journeys on one page. Click any step to walk through from there. */
export const JourneyMap: Story = { name: 'Journey map', render: () => <Journeys /> };

/** The presenter, starting at the full example: one fix, end to end. */
export const WalkThrough: Story = { name: 'Walk through', render: () => <Journeys initialView="present" /> };
