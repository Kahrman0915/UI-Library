/* The "How to get started" card (What's New W2.1, Figma section 4 · W4.1):
   three steps over one 24-second walkthrough, starting on the Dashboard
   Library. Shared by the Product Demos stories and the DART Suite prototype's
   release story page, so there is one copy. */

import { useCallback, useRef, useState } from 'react';
import { Check, Pause, Play } from 'lucide-react';
import Button from '../../components/Button';
import Card, { CardDescription, CardOverline, CardTitle } from '../../components/Card';
import Item, { ItemContent, ItemMedia, ItemTitle } from '../../components/Item';
import Progress from '../../components/Progress';
import { GET_STARTED_DURATION, GET_STARTED_STEPS, GetStartedDemo } from './GetStartedDemo';
import type { StageHandle } from './timeline';
import './ProductDemos.scss';

export function PlayToggle({ id, playing, onToggle }: { id: string; playing: boolean; onToggle: () => void }) {
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

export function Walkthrough({ id = 'pd-walkthrough' }: { id?: string }) {
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
      <Card id={id}>
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
            <PlayToggle id={`${id}-toggle`} playing={playing} onToggle={() => setPlaying((p) => !p)} />
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
