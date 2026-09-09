import { forwardRef } from 'react';
import Dialog, {
  DialogHeader,
  DialogBody,
  DialogMedia,
  DialogFooter,
} from '#components/Dialog/Dialog';
import type { AnnouncementProps } from './Announcement.types';
import './Announcement.scss';

/**
 * The "what's new" card. A thin preset of `Dialog` — no new portal, focus trap,
 * scroll lock, exit machine or ARIA wiring, and no keyframes of its own. What it
 * adds is a settled arrangement (title · media · sentence · actions), a wider
 * panel than a plain dialog so a 16:9 clip has room, and outside-click
 * dismissal, which an informational card should have and a dialog holding work
 * should not.
 *
 * The clip is the consumer's: pass a muted, looping, autoplaying `<video>` as
 * `media`. The component does not own playback — that keeps it free of a
 * `prefers-reduced-motion` policy it cannot enforce on arbitrary media, which
 * the caller sets on the element it owns.
 */
const Announcement = forwardRef<HTMLDivElement, AnnouncementProps>(
  (
    {
      id,
      title,
      media,
      mediaRatio = 16 / 9,
      description,
      children,
      secondaryAction,
      primaryAction,
      // The carve-out vs a plain Dialog: an announcement holds nothing a stray
      // click can destroy, so the backdrop dismisses it. Still overridable.
      closeOnOutsideClick = true,
      onClose,
      className,
      ...rest
    },
    ref,
  ) => {
    return (
      <Dialog
        {...rest}
        ref={ref}
        id={id}
        onClose={onClose}
        closeOnOutsideClick={closeOnOutsideClick}
        className={`ui-announcement${className ? ' ' + className : ''}`}
      >
        <DialogHeader id={id} title={title} onClose={onClose} />
        {media && <DialogMedia ratio={mediaRatio}>{media}</DialogMedia>}
        {(description || children) && (
          <DialogBody>
            {/* Seeds `{id}-description`, which Dialog detects and points
                aria-describedby at. Rendering it here rather than in the header
                is deliberate: in this arrangement the sentence belongs UNDER
                the media, and a header description would sit above it. */}
            {description && <p id={`${id}-description`}>{description}</p>}
            {children}
          </DialogBody>
        )}
        {(secondaryAction || primaryAction) && (
          <DialogFooter>
            {secondaryAction}
            {primaryAction}
          </DialogFooter>
        )}
      </Dialog>
    );
  },
);

Announcement.displayName = 'Announcement';

export default Announcement;
