/* The one-time message before a web report or an external chart opens in a new
   tab (owner, 2026-10-02). For web reports it says WHY, and that it is
   TEMPORARY: they are stored where DART Central cannot show them yet, and will
   open inside it later — not "a separate site". External charts really do live
   in their BI tool, so theirs says so.

   - A MESSAGE, not a countdown. An automatic redirect fails WCAG 2.2.1, reads
     like an ad redirect, and a tab opened by a timer is caught by pop-up
     blockers. The tab opens from the "Open" click, which browsers allow.
   - ONE message per KIND of destination — web reports once, each BI tool
     (Tableau, Power BI) once — not per report.
   - "Don't show this again" is CHECKED by default: the message is information,
     not consent, and a box most people never tick turns a one-time step into a
     step on every open. The account menu turns the messages back on.
   - Focus lands on Open, so Enter goes straight through; Escape and Cancel stay. */

import { useEffect, useRef, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import Button from '../../../../../components/Button';
import Checkbox from '../../../../../components/Checkbox';
import Dialog, { DialogBody, DialogFooter, DialogHeader } from '../../../../../components/Dialog';
import './External.scss';

export type LeaveTarget = {
  /** What kind of place it is — the key "don't show again" is remembered under. */
  dest: string;
  /** "Web reports" / "Tableau charts" — the plural the title uses. */
  kindLabel: string;
  name: string;
  url: string;
  /** Where it lives, in words: "the reports site", "Tableau". */
  site: string;
};

export function LeaveDialog({
  target,
  onCancel,
  onLeave,
}: {
  target: LeaveTarget | null;
  onCancel: () => void;
  onLeave: (t: LeaveTarget, remember: boolean) => void;
}) {
  // Keep the last target through the exit animation.
  const last = useRef(target);
  if (target) last.current = target;
  const t = target ?? last.current;
  const [remember, setRemember] = useState(true);
  useEffect(() => {
    if (target) setRemember(true);
  }, [target]);

  // Focus lands on the way through, so Enter opens it.
  const openRef = useRef<HTMLButtonElement>(null);

  const host = t ? new URL(t.url).host : '';

  return (
    <Dialog id="ds-leave" open={!!target} onClose={onCancel} closeOnOutsideClick initialFocusRef={openRef}>
      <DialogHeader id="ds-leave-header" title={t ? (t.dest === 'report' ? 'For now, web reports open in a new tab' : `${t.kindLabel} open in ${t.site}`) : ''} onClose={onCancel} />
      {t && (
        <DialogBody>
          <div className="ds-leave">
            {t.dest === 'report' ? (
              // Owner, 2026-10-02: NOT "a separate site". The reports are only stored
              // where DART Central can't show them yet — a temporary step, with a fix coming.
              <>
                <p>
                  Web reports are stored where DART Central can’t show them yet, so <strong>{t.name}</strong> opens in a new browser tab.
                </p>
                <ul className="ds-leave__list">
                  <li>DART Central stays open in this tab. Switch back to it any time.</li>
                  <li>This is temporary. Web reports will open right here in DART Central once that’s in place.</li>
                </ul>
              </>
            ) : (
              <>
                <p>
                  <strong>{t.name}</strong> lives in {t.site}, so it opens in a new browser tab.
                </p>
                <ul className="ds-leave__list">
                  <li>{t.site} may ask you to sign in.</li>
                  <li>DART Central stays open in this tab. Switch back to it any time.</li>
                </ul>
              </>
            )}
            {/* The address only for a BI tool — for a report it would read as "another site", which it isn't. */}
            {t.dest !== 'report' && (
              <p className="ds-leave__host">
                <ExternalLink aria-hidden="true" />
                {host}
              </p>
            )}
            <Checkbox
              id="ds-leave-remember"
              label={`Don’t show this again for ${t.dest === 'report' ? 'web reports' : t.kindLabel}`}
              checked={remember}
              onCheckedChange={(v) => setRemember(!!v)}
            />
          </div>
        </DialogBody>
      )}
      <DialogFooter>
        <Button id="ds-leave-cancel" style="ghost" label="Cancel" onClick={onCancel} />
        <Button
          id="ds-leave-open"
          ref={openRef}
          label={t?.dest === 'report' ? 'Open report' : `Open in ${t?.site ?? ''}`}
          IconRight={ExternalLink}
          onClick={() => t && onLeave(t, remember)}
        />
      </DialogFooter>
    </Dialog>
  );
}
