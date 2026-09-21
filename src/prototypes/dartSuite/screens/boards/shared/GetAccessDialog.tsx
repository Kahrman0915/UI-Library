/* How to get access — Dashboard D2.3 (also opened from a space, S2.3).
   Access is granted by the owning team's own request, not by DART Central, so
   the dialog explains that and offers to send the request. */

import { useEffect, useRef, useState } from 'react';
import Button from '../../../../../components/Button';
import Dialog, { DialogBody, DialogFooter, DialogHeader } from '../../../../../components/Dialog';
import { toast } from '../../../../../components/Toast';
import { useSuite } from '../../../store';

export function GetAccessDialog({ open, dashboardId, onClose }: { open: boolean; dashboardId: string | null; onClose: () => void }) {
  // Keep the last dashboard through the exit animation, after the overlay clears its id.
  const last = useRef(dashboardId);
  if (dashboardId) last.current = dashboardId;
  const shownId = dashboardId ?? last.current;
  const { state, logActivity } = useSuite();
  const d = state.dashboards.find((x) => x.id === shownId) ?? null;
  const [sent, setSent] = useState(false);
  useEffect(() => {
    if (open) setSent(false);
  }, [open, dashboardId]);

  return (
    <Dialog id="ds-get-access" open={open && !!d} onClose={onClose} closeOnOutsideClick>
      <DialogHeader id="ds-get-access-header" title="How to get access" onClose={onClose} />
      {d && (
        <DialogBody>
          <div className="ds-boards-dialog-stack">
            <p className="ds-text">
              {d.name} is owned by {d.owner}. Access is granted through their data governance request, not through DART
              Central. Approvals usually take two working days.
            </p>
            <p className="ds-muted">
              {d.hasAccess ? 'You already have access to this dashboard.' : 'You do not have access yet. Send a request and the owner will be notified.'}
            </p>
          </div>
        </DialogBody>
      )}
      <DialogFooter>
        <Button id="ds-get-access-close" style="ghost" label="Close" onClick={onClose} />
        <Button
          id="ds-get-access-request"
          label={sent ? 'Request sent' : 'Request access'}
          disabled={sent || !!d?.hasAccess}
          onClick={() => {
            if (!d) return;
            setSent(true);
            logActivity('requested access to', d.name);
            toast.success('Access requested', { description: `${d.owner} will be notified. Approvals usually take two working days.` });
            onClose();
          }}
        />
      </DialogFooter>
    </Dialog>
  );
}
