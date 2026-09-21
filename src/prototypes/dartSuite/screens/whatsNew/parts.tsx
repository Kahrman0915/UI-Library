/* What's New · shared parts: the clip, an entry's meta line and badges, and
   the four-step tour (Figma W3.1–W3.5). */

import { useState } from 'react';
import { ChevronLeft, ChevronRight, LayoutGrid, Library, Megaphone, Move, Rocket, Sparkles, Wrench } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Badge from '../../../../components/Badge';
import Button from '../../../../components/Button';
import CloseButton from '../../../../components/CloseButton';
import Dialog, { DialogMedia } from '../../../../components/Dialog';
import FeaturedIcon from '../../../../components/FeaturedIcon';
import { EditModeDemo } from '../../../productDemos/EditModeDemo';
import { LibraryDemo } from '../../../productDemos/LibraryDemo';
import { SpacesDemo } from '../../../productDemos/SpacesDemo';
import { useNav } from '../../nav';
import { TOPIC_LABEL } from './entries';
import type { WnEntry, WnTopic } from './entries';
import './WhatsNew.scss';

/* ── The clip ───────────────────────────────────────────────────────────────
   The Figma Motion clips are already rebuilt in code as the product demos
   (Prototypes / Product Demos), so the page plays those rather than a video.
   They are drawn scenery: tokens only, and they rest on a still frame under
   prefers-reduced-motion. */

export function Clip({ clip, playing = true }: { clip?: WnEntry['clip']; playing?: boolean }) {
  if (clip === 'library') return <LibraryDemo playing={playing} />;
  if (clip === 'spaces') return <SpacesDemo playing={playing} />;
  if (clip === 'edit') return <EditModeDemo playing={playing} />;
  return (
    <div className="ds-wn-still" aria-hidden="true">
      <Megaphone />
    </div>
  );
}

/* ── Meta line and badges ─────────────────────────────────────────────────── */

const TOPIC_ICON: Record<WnTopic, LucideIcon> = { launch: Rocket, feature: Sparkles, resource: Library, 'coming-soon': Wrench };
const TOPIC_COLOR = { launch: 'violet', feature: 'blue', resource: 'emerald', 'coming-soon': 'amber' } as const;

export function EntryMeta({ entry }: { entry: WnEntry }) {
  return (
    <div className="ds-wn-meta">
      <span>{entry.date}</span>
      <span aria-hidden="true">·</span>
      <span>{entry.product}</span>
      {entry.version && <code className="ds-wn-version">{entry.version}</code>}
    </div>
  );
}

export function EntryBadges({ entry, idPrefix }: { entry: WnEntry; idPrefix: string }) {
  const TopicIcon = TOPIC_ICON[entry.topic];
  return (
    <div className="ds-wn-badges">
      <Badge
        id={`${idPrefix}-topic`}
        label={TOPIC_LABEL[entry.topic]}
        color={TOPIC_COLOR[entry.topic]}
        appearance="soft"
        IconLeft={() => <TopicIcon aria-hidden="true" />}
      />
      <Badge id={`${idPrefix}-product`} label={entry.product} color="blue" appearance="soft" IconLeft={() => <LayoutGrid aria-hidden="true" />} />
    </div>
  );
}

/* ── The tour (W3.1–W3.4, dismissed = W3.5) ──────────────────────────────────
   Opens over the What's New page the first time it is visited in a session.
   Built on Dialog + DialogMedia (the Announcement technique) rather than the
   Announcement preset, because the preset has one clip and an action row,
   and the tour pages through four steps with arrows. */

const STEPS: { clip?: WnEntry['clip']; Icon: LucideIcon; title: string; text: string }[] = [
  {
    clip: 'library',
    Icon: Library,
    title: 'Dashboard Library',
    text: 'Every DART dashboard in one place. Filter, sort, or search by name, description, or keyword. Dashboards you can’t access yet still show in the library, with a lock.',
  },
  {
    clip: 'spaces',
    Icon: LayoutGrid,
    title: 'Spaces',
    text: 'Create as many personal spaces as you like and pin the dashboards you use most. Come back to them exactly the way you left them.',
  },
  {
    clip: 'edit',
    Icon: Move,
    title: 'Edit Mode',
    text: 'Drag and drop to rearrange, switch dashboards between thumbnail and compact view, and rename your space. Undo reverses your last change.',
  },
];

let tourSeen = false;
/** True only the first time it is asked for in this session. */
export const takeTourOnce = () => {
  if (tourSeen) return false;
  tourSeen = true;
  return true;
};

export function Tour({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { go } = useNav();
  const [step, setStep] = useState(0);
  const last = STEPS.length; // the Explore more step
  const close = () => {
    onClose();
    setStep(0);
  };
  const s = STEPS[step];

  return (
    <Dialog id="ds-wn-tour" open={open} onClose={close} closeOnOutsideClick className="ds-wn-tour" aria-label="What’s new in Dartboards">
      <div className="ds-wn-tour__close">
        <CloseButton id="ds-wn-tour-close" variant="chip" ariaLabel="Close" onClick={close} />
      </div>
      <DialogMedia ratio={16 / 9}>
        {step < last ? (
          <Clip clip={s.clip} />
        ) : (
          <div className="ds-wn-tour__hero">
            <span className="ds-wn-tour__hero-overline">Explore more</span>
            <span className="ds-wn-tour__hero-title">Get more out of Dartboards with guides and release notes.</span>
          </div>
        )}
      </DialogMedia>
      <div className="ds-wn-tour__body">
        <Button
          id="ds-wn-tour-prev"
          style="ghost"
          size="sm"
          iconOnly
          IconCenter={() => <ChevronLeft aria-hidden="true" />}
          aria-label="Previous"
          disabled={step === 0}
          onClick={() => setStep((n) => n - 1)}
        />
        {step < last ? (
          <div className="ds-wn-tour__text" aria-live="polite">
            <FeaturedIcon Icon={s.Icon} size="sm" />
            <p className="ds-wn-tour__overline">What’s New · {step + 1} of {last}</p>
            <h2 className="ds-wn-tour__title">{s.title}</h2>
            <p className="ds-wn-tour__desc">{s.text}</p>
          </div>
        ) : (
          <div className="ds-wn-tour__tiles" aria-live="polite">
            <button type="button" className="ds-wn-tour__tile" onClick={close}>
              <span className="ds-wn-tour__tile-media">
                <Megaphone aria-hidden="true" />
              </span>
              <span className="ds-wn-tour__tile-title">What’s New</span>
              <span className="ds-wn-tour__tile-sub">All the updates</span>
            </button>
            <button
              type="button"
              className="ds-wn-tour__tile"
              onClick={() => {
                close();
                go({ page: 'whats-new-story', id: 'introducing-dartboards' });
              }}
            >
              <span className="ds-wn-tour__tile-media">
                <Rocket aria-hidden="true" />
              </span>
              <span className="ds-wn-tour__tile-title">Release story</span>
              <span className="ds-wn-tour__tile-sub">How to get started</span>
            </button>
          </div>
        )}
        {step < last ? (
          <Button
            id="ds-wn-tour-next"
            style="ghost"
            size="sm"
            iconOnly
            IconCenter={() => <ChevronRight aria-hidden="true" />}
            aria-label="Next"
            onClick={() => setStep((n) => n + 1)}
          />
        ) : (
          <Button id="ds-wn-tour-done" size="sm" label="Done" onClick={close} />
        )}
      </div>
    </Dialog>
  );
}
