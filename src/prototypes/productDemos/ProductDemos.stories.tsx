import { useCallback, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Check, Pause, Play } from 'lucide-react';
import Button from '../../components/Button';
import Card, { CardDescription, CardOverline, CardTitle } from '../../components/Card';
import Item, { ItemContent, ItemMedia, ItemTitle } from '../../components/Item';
import Progress from '../../components/Progress';
import { SpacesDemo } from './SpacesDemo';
import { LibraryDemo } from './LibraryDemo';
import { EditModeDemo } from './EditModeDemo';
import { GET_STARTED_DURATION, GET_STARTED_STEPS, GetStartedDemo } from './GetStartedDemo';
import type { StageHandle } from './timeline';
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

function PlayToggle({ id, playing, onToggle }: { id: string; playing: boolean; onToggle: () => void }) {
  return (
    <Button
      id={id}
      style="ghost"
      size="sm"
      iconOnly
      IconCenter={() => (playing ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />)}
      aria-label={playing ? 'Pause animation' : 'Play animation'}
      aria-pressed={!playing}
      onClick={onToggle}
    />
  );
}

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

const STEPS = [
  {
    bar: '1 · Browse the Dashboard Library',
    title: 'Browse the Dashboard Library',
    description: (
      <>
        Select <span className="pd-walkthrough__emph">Dashboards</span> in the sidebar to see every dashboard DART offers. Filter, sort, or search by name,
        description, or keyword — then choose Add to space on any dashboard you want close at hand.
      </>
    ),
    tips: ['Search matches names, descriptions, and keywords.', 'Sort by most used to find what your team relies on.', 'A lock means you can see the dashboard’s name but can’t open it yet.'],
  },
  {
    bar: '2 · Create a space and pin dashboards',
    title: 'Create a space and pin your dashboards',
    description:
      'Spaces are new. Create as many as you like, pin the dashboards you use, and arrange them your way. Choose Add to space and pick a space, or open the builder to create one and add several dashboards at once.',
    tips: ['Open a dashboard and it opens in a tab, one click from your space.', 'Right-click a space and choose Make default space to land there next time.', 'In the Add to Space window, choose Add to New Space to open the builder.'],
  },
  {
    bar: '3 · Make changes in Edit mode',
    title: 'Make changes in Edit mode',
    description:
      'Choose Edit on your space to open the builder again. Drag and drop to rearrange, switch dashboards between thumbnail and compact view, and add or remove dashboards.',
    tips: ['Rename your space or edit its description at the top.', 'Every space setting lives in Edit mode.', 'Choose Done when you’re finished, or Undo to reverse your last change.'],
  },
];

const STEP_LENGTH = GET_STARTED_DURATION / GET_STARTED_STEPS.length;

function Walkthrough() {
  const stage = useRef<StageHandle>(null);
  const [playing, setPlaying] = useState(true);
  const [time, setTime] = useState(0);
  const bucket = useRef(-1);
  // The stage ticks every frame; the card only needs ~10 updates a second.
  const onTick = useCallback((t: number) => {
    const b = Math.floor(t * 10);
    if (b !== bucket.current) {
      bucket.current = b;
      setTime(t);
    }
  }, []);
  const current = Math.min(2, Math.floor(time / STEP_LENGTH));
  const step = STEPS[current];

  return (
    <div className="pd-single" style={{ maxWidth: 'var(--max-w-7xl)' }}>
      <Card id="pd-walkthrough">
        <div className="pd-walkthrough">
          <div className="pd-walkthrough__bar">
            {STEPS.map((s, i) => {
              const done = i < current;
              const now = i === current;
              const value = done ? 100 : now ? ((time - GET_STARTED_STEPS[i]) / STEP_LENGTH) * 100 : 0;
              return (
                <button
                  key={s.bar}
                  type="button"
                  className="pd-walkthrough__step"
                  aria-current={now ? 'step' : undefined}
                  onClick={() => stage.current?.seek(GET_STARTED_STEPS[i] + 0.01)}
                >
                  <Progress size="sm" value={value} label={s.bar} showValue valueFormatter={() => (done ? 'Done' : now ? 'Now' : '')} />
                </button>
              );
            })}
            <PlayToggle id="pd-walkthrough-toggle" playing={playing} onToggle={() => setPlaying((p) => !p)} />
          </div>
          <div className="pd-walkthrough__content">
            <div className="pd-walkthrough__text" aria-live="polite">
              <div className="pd-walkthrough__heading">
                <CardOverline>Step {current + 1} of 3</CardOverline>
                <CardTitle scale="lg">{step.title}</CardTitle>
                <CardDescription>{step.description}</CardDescription>
              </div>
              <div className="pd-walkthrough__tips">
                <CardOverline>Tips</CardOverline>
                {step.tips.map((tip) => (
                  <Item key={tip} size="xs">
                    <ItemMedia>
                      <Check size={16} aria-hidden="true" />
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle>{tip}</ItemTitle>
                    </ItemContent>
                  </Item>
                ))}
              </div>
            </div>
            <div className="pd-walkthrough__video">
              <GetStartedDemo ref={stage} playing={playing} onTick={onTick} />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

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
