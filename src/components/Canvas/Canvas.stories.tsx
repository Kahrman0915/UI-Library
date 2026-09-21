import { useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import type { Meta, StoryObj } from '@storybook/react';
import Canvas, { CanvasItem } from './Canvas';
import Button from '../Button';
import Card, { CardBody, CardHeader } from '../Card';
import type { UiDocsParameters } from '../../types/DocsTypes';

const meta: Meta<typeof Canvas> = {
  title: 'Components/Canvas',
  component: Canvas,
  parameters: {
    layout: 'padded',
    ui: {
      description:
        'The Builder’s edit surface — a 32px grid the placed widgets sit on, and ' +
        'the handles that make one draggable.\n\n' +
        '**The grid is a background, not elements.** Figma has no repeating ' +
        'fill, so `Canvas/Ground` there is 51 vertical and 35 horizontal ' +
        'rectangles; here it is two tiling gradients — same output, no DOM, and ' +
        'it resizes for free.\n\n' +
        '**It paints no ground of its own.** The grid sits on whatever surface ' +
        'the page already has, so dropping a canvas into `AppShellMain` does not ' +
        'stack a second background under the first.\n\n' +
        '**There is no drag behaviour here.** Placement, collision and ' +
        'persistence belong to the application; the library ships the surface ' +
        'and the affordances, not a layout engine.',
      tags: ['builder', 'surface', '2 parts'],
      usage: {
        when: [
          'A direct-manipulation editing surface — the Builder, a dashboard layout editor.',
          'Anywhere the user arranges things spatially and needs to see the alignment lattice.',
        ],
        avoid: [
          'A page that merely holds cards in a grid. That is a `Stack` that wraps — a canvas implies the user can move things.',
          'Read-only views. Turn `grid` off for preview, or do not render a canvas at all.',
        ],
        notes:
          'The grid is `--canvas-line` at `--o-20`, mirroring the Figma model — a ' +
          'solid colour variable with the layer placed at 20%, rather than an alpha ' +
          'baked into the hex.',
      },
      a11y: {
        keyboard: [
          { keys: ['Tab'], description: 'Reaches each item’s grip and menu. The canvas itself is not focusable — it is a surface, not a control.' },
        ],
        notes:
          'The grip is a real `<button>` with an accessible name (`gripLabel`), so ' +
          'it is reachable and announceable even though pointer dragging is the ' +
          'primary interaction. **If you wire dragging, give it a keyboard route ' +
          'too** — arrow-key nudging from the focused grip — because a mouse-only ' +
          'canvas is unusable without one.\n\n' +
          'Selection is a visual ring plus whatever the application announces; the ' +
          'item carries no ARIA role, because what a widget *is* is the app’s to say.',
      },
      changelog: [
        {
          date: '2026-09-21',
          summary: 'Initial build — Canvas ships in code.',
          detail:
            'The second and last component the product screens used that code did not have (`Table` was the other). Built from the Figma `Canvas/Ground` and `Canvas/Item` masters, which had 22 uses across the Builder screens and no counterpart to import.\n\n' +
            '**New token `--canvas-line`** — `#94a3b8` light / `#475569` dark, mirroring the owner’s `surface/canvas-line` variable. No existing token paired those two values: its light twin is `--ring`/`--sidebar-ring`/`--switch-track` and its dark twin is `--popover`/`--input`/`--chart-axis`, so reusing either would have tied the grid to an unrelated role in one mode.\n\n' +
            '**Dark is slate-600, not a lightened slate.** The grid sits ON the page surface, so in dark it has to read as a recess in the ground rather than as glowing wires over it.\n\n' +
            'The item’s handles overhang the corners at `-8` (Figma’s placement) so they never eat into the widget’s content box, and selection is a `box-shadow` ring rather than a border — a border would move the content box by 1px on select and nudge every widget on the canvas.',
        },
      ],
    } satisfies UiDocsParameters,
  },
};

export default meta;

const Widget = ({ id, title, body }: { id: string; title: string; body: string }) => (
  <Card id={id} style={{ width: 240 }}>
    <CardHeader id={`${id}-h`} title={title} />
    <CardBody>
      <p style={{ margin: 0, font: 'var(--text-sm)/var(--leading-5) var(--font-family)', color: 'var(--muted-foreground)' }}>
        {body}
      </p>
    </CardBody>
  </Card>
);

/** Edit mode: the grid on, handles showing, one widget selected. */
export const Default: StoryObj = {
  render: function DefaultStory() {
    const [picked, setPicked] = useState('w1');
    return (
      <Canvas style={{ height: 420, padding: 'var(--p-6)' }}>
        <div style={{ display: 'flex', gap: 'var(--p-8)', flexWrap: 'wrap' }}>
          {[
            { id: 'w1', title: 'Revenue by Region', body: 'Bookings and win rate by segment.' },
            { id: 'w2', title: 'Collections', body: 'Promise-to-pay and roll forward.' },
          ].map((w) => (
            <CanvasItem
              key={w.id}
              grip
              selected={picked === w.id}
              onClick={() => setPicked(w.id)}
              menu={
                <Button
                  id={`${w.id}-menu`}
                  style="ghost"
                  size="sm"
                  iconOnly
                  IconCenter={MoreHorizontal}
                  aria-label={`Options for ${w.title}`}
                />
              }
            >
              <Widget id={w.id} title={w.title} body={w.body} />
            </CanvasItem>
          ))}
        </div>
      </Canvas>
    );
  },
};

/**
 * Preview is the same surface with `grid={false}` — nothing is swapped out, so
 * the widgets cannot shift between editing and previewing.
 */
export const EditVsPreview: StoryObj = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--p-6)' }}>
      {[true, false].map((on) => (
        <div key={String(on)} style={{ display: 'grid', gap: 'var(--p-2)' }}>
          <p style={{ margin: 0, font: 'var(--text-xs)/var(--leading-4) var(--font-family)', color: 'var(--muted-foreground)' }}>
            {on ? 'edit — grid on, handles showing' : 'preview — grid off, no handles'}
          </p>
          <Canvas grid={on} style={{ height: 200, padding: 'var(--p-6)' }}>
            <CanvasItem grip={on}>
              <Widget id={`p-${on}`} title="Revenue by Region" body="Bookings and win rate by segment." />
            </CanvasItem>
          </Canvas>
        </div>
      ))}
    </div>
  ),
};
