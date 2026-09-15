import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Announcement from './Announcement';
import Button from '../Button/Button';
import type { UiDocsParameters } from '../../types/DocsTypes';

const meta: Meta<typeof Announcement> = {
  title: 'Components/Announcement',
  component: Announcement,
  parameters: {
    layout: 'centered',
    ui: {
      description:
        'The "what\'s new" card — a title, a clip showing the feature, one sentence, ' +
        'and an action row. A thin preset of `Dialog`: same portal, focus trap, scroll ' +
        'lock, Escape and focus restore, with the arrangement settled, a wider panel so ' +
        'a 16:9 clip has room, and outside-click dismissal on. Motion, ARIA and exit ' +
        'behaviour are `Dialog`\'s — see that page.',
      tags: ['modal', 'preset', 'portal'],
      usage: {
        when: [
          'Announcing **one** shipped feature, the first time a user lands on the page it changed.',
          'Pass a muted, looping, autoplaying `<video>` as `media` and let it show the task end to end in under ten seconds — the clip is the explanation, the sentence is the caption.',
          'Point `secondaryAction` at the docs and make `primaryAction` an acknowledgement ("Got it") wired to the same setter as `onClose`.',
        ],
        avoid: [
          'Release notes, a changelog, or several features at once. That is a page, and this card should link to it.',
          'Anything the user must answer. An announcement is dismissible by the X, Escape, the backdrop and the button — if a response is required, reach for `AlertDialog`.',
          'Blocking the task the user came to do. Show it once, and never on top of a form mid-edit.',
        ],
        notes:
          'The component does not own playback. Set `muted`, `loop`, `autoPlay` and `playsInline` on the `<video>` you pass, and gate it on `prefers-reduced-motion` there — a still frame is the correct fallback, and only the caller can supply one.\n\n' +
          '`description` is rendered as `{id}-description`, which is what `aria-describedby` points at, so it should say what changed rather than introduce the clip.',
      },
      composition: [
        {
          name: 'Dialog',
          description:
            'Supplies the portal, focus trap, scroll lock, Escape, focus restore and the enter/exit motion. `Announcement` adds no machinery of its own.',
        },
        {
          name: 'DialogMedia',
          description:
            'The full-bleed media region, wired in automatically when `media` is set. Reserves its height before the clip loads so the footer does not move under the pointer.',
        },
        {
          name: 'Button',
          description:
            'Both actions are yours to pass — `style="outline"` for the quiet one, the default variant for the acknowledgement.',
        },
      ],
      a11y: {
        keyboard: [
          {
            keys: ['Esc'],
            description: 'Dismisses the announcement, like the X and the backdrop.',
          },
          {
            keys: ['Tab'],
            description:
              'Cycles within the panel while it is open; focus returns to whatever opened it on close.',
          },
        ],
        notes:
          'The panel is named by `title` and described by `description`. A clip carries no accessible name of its own — if it shows something the sentence does not say, say it in the sentence.',
      },
      changelog: [
        {
          date: '2026-09-09',
          summary:
            'Initial build. The "what\'s new" card, as a preset of `Dialog`.',
          detail:
            'Adds `Announcement` (title, media, description, secondaryAction, primaryAction) and the `DialogMedia` part it composes. Outside-click dismissal defaults ON here, inverting `Dialog`; the panel caps at `--max-w-xl` so a 16:9 clip renders 324px tall.',
        },
      ],
    } satisfies UiDocsParameters,
  },
  argTypes: {
    open: { control: 'boolean' },
    closeOnOutsideClick: { control: 'boolean' },
    onClose: { action: 'closed' },
    media: { control: false, table: { disable: true } },
    children: { control: false, table: { disable: true } },
    secondaryAction: { control: false, table: { disable: true } },
    primaryAction: { control: false, table: { disable: true } },
  },
};

export default meta;

type Story = StoryObj<typeof Announcement>;

/**
 * Stands in for the `<video>` a real announcement passes. Built from tokens so
 * the story works offline and in both modes; in production this slot holds a
 * muted, looping clip of the actual task.
 */
const ClipStandIn = ({ label }: { label: string }) => (
  <div
    style={{
      width: '100%',
      height: '100%',
      display: 'grid',
      placeItems: 'center',
      gap: 'var(--p-2)',
      background: 'var(--background)',
      color: 'var(--muted-foreground)',
      fontFamily: 'var(--font-family)',
      fontSize: 'var(--text-xs)',
    }}
  >
    <span>{label}</span>
  </div>
);

export const Basic: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button
          id="open-announcement"
          label="Show what's new"
          onClick={() => setOpen(true)}
        />
        <Announcement
          id="feature-requests"
          open={open}
          onClose={() => setOpen(false)}
          title="Submit feature requests"
          media={<ClipStandIn label="clip · picking Feature Request and submitting it" />}
          description="Feature requests are now a request type. Pick Feature Request from New request, describe the feature and its impact, and submit. The admin team reviews it like any other request."
          secondaryAction={
            <Button
              id="feature-requests-learn"
              label="Learn more"
              style="outline"
            />
          }
          primaryAction={
            <Button
              id="feature-requests-ack"
              label="Got it"
              onClick={() => setOpen(false)}
            />
          }
        />
      </>
    );
  },
};

/**
 * `media` is optional. Without it the media region is not rendered at all rather
 * than left as an empty box, and the card is a plain text announcement.
 */
export const WithoutMedia: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button
          id="open-textonly"
          label="Show text announcement"
          onClick={() => setOpen(true)}
        />
        <Announcement
          id="density-setting"
          open={open}
          onClose={() => setOpen(false)}
          title="Choose your density"
          description="Settings now has a density control. Compact fits more rows on screen; spacious gives everything more room. It applies everywhere you work."
          primaryAction={
            <Button
              id="density-ack"
              label="Got it"
              onClick={() => setOpen(false)}
            />
          }
        />
      </>
    );
  },
};

/**
 * A taller clip for a feature that is not widescreen, and an announcement that
 * must be acknowledged rather than waved away — `closeOnOutsideClick={false}`
 * puts the dialog default back. Use that sparingly: the X and Escape still
 * dismiss, so it only removes the most forgiving exit.
 *
 * **Keep `mediaRatio` at `4 / 3` or wider.** The panel is capped at `85vh` and
 * the media never shrinks (it must not, or the ratio it exists to guarantee is
 * a lie), so a taller box pushes the sentence into the body's scroll — measured:
 * a square clip on an 800px-high viewport cuts the copy off entirely.
 */
export const MustBeAcknowledged: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button
          id="open-square"
          label="Show 4:3 clip"
          onClick={() => setOpen(true)}
        />
        <Announcement
          id="keyboard-shortcuts"
          open={open}
          onClose={() => setOpen(false)}
          closeOnOutsideClick={false}
          title="Keyboard shortcuts"
          mediaRatio={4 / 3}
          media={<ClipStandIn label="clip · the shortcut sheet, 4:3" />}
          description="Press the slash key anywhere to open the shortcut sheet. Every list, queue and form now has one."
          secondaryAction={
            <Button id="shortcuts-learn" label="See all" style="outline" />
          }
          primaryAction={
            <Button
              id="shortcuts-ack"
              label="Got it"
              onClick={() => setOpen(false)}
            />
          }
        />
      </>
    );
  },
};
