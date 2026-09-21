import { useState } from 'react';
import type { ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { SpacesDemo } from './SpacesDemo';
import { LibraryDemo } from './LibraryDemo';
import { EditModeDemo } from './EditModeDemo';
import { GetStartedDemo } from './GetStartedDemo';
import { PlayToggle, Walkthrough } from './Walkthrough';
import './ProductDemos.scss';

const meta: Meta = {
  title: 'Prototypes/Product Demos',
  parameters: {
    layout: 'fullscreen',
    ui: {
      description:
        'Animated UI mockups for the Dartboards release article, rebuilt in code from the Figma Motion frames. ' +
        'They are drawn scenery, not the real components — a change to a real screen never breaks a demo — and every color is a token, ' +
        'so they follow light and dark mode.\n\n' +
        'Each demo runs on a small keyframe timeline (`productDemos/timeline.tsx`) that ports the Figma keyframes as `[seconds, value, easing]`. ' +
        'One animation loop writes styles straight onto the elements, so React renders the scenery once. Under `prefers-reduced-motion` ' +
        'nothing moves and each demo rests on a representative frame.',
      tags: ['prototype', 'motion', 'dartboards'],
    },
  },
};
export default meta;
type Story = StoryObj;

function Single({ id, children }: { id: string; children: (playing: boolean) => ReactNode }) {
  const [playing, setPlaying] = useState(true);
  return (
    <div className="pd-single">
      <div className="pd-single__frame">{children(playing)}</div>
      <PlayToggle id={id} playing={playing} onToggle={() => setPlaying((p) => !p)} />
    </div>
  );
}

/** Clicking between spaces in the sidebar; each lands on its own space page. 10.4s loop. */
export const Spaces: Story = {
  render: () => <Single id="pd-spaces-toggle">{(playing) => <SpacesDemo playing={playing} />}</Single>,
};

/** Search, filter, and add a dashboard to a space. 10.4s loop. */
export const DashboardLibrary: Story = {
  name: 'Dashboard Library',
  render: () => <Single id="pd-library-toggle">{(playing) => <LibraryDemo playing={playing} />}</Single>,
};

/** Edit, rename, drag a card, switch a card to Thumbnail from its ••• menu, Done. 11s loop. */
export const EditMode: Story = {
  name: 'Edit Mode',
  render: () => <Single id="pd-edit-toggle">{(playing) => <EditModeDemo playing={playing} />}</Single>,
};

/**
 * The "How to get started" card: three steps over one 24-second walkthrough, starting on the Dashboard Library.
 * The progress bars, step text and tips follow the animation. Click a step to jump to it; pause stops everything.
 */
export const GetStartedWalkthrough: Story = {
  name: 'Get Started walkthrough',
  render: () => <Walkthrough />,
};

/** All four side by side. */
export const AllDemos: Story = {
  name: 'All demos',
  render: () => (
    <div className="pd-gallery">
      <div className="pd-gallery__item"><SpacesDemo /></div>
      <div className="pd-gallery__item"><LibraryDemo /></div>
      <div className="pd-gallery__item"><EditModeDemo /></div>
      <div className="pd-gallery__item"><GetStartedDemo /></div>
    </div>
  ),
};
