/* Dashboard information — Browse B2.1/B2.2, Pattern/DashboardInfo.
   Opened from a Browse card or row ("View dashboard details") and from a
   space. Share lives HERE, not on the card or row: it copies the link and
   confirms with a toast. */

import { useRef } from 'react';
import { ExternalLink, Share2 } from 'lucide-react';
import Badge from '../../../../../components/Badge';
import Button from '../../../../../components/Button';
import Dialog, { DialogBody, DialogFooter, DialogHeader } from '../../../../../components/Dialog';
import { useNav } from '../../../nav';
import { useSuite } from '../../../store';
import { DashboardThumb, copyDashboardLink, spacesWith, updatedLabel } from './boardsShared';

export function DashboardInfoDialog({ open, dashboardId, onClose }: { open: boolean; dashboardId: string | null; onClose: () => void }) {
  // Keep the last dashboard through the exit animation, after the overlay clears its id.
  const last = useRef(dashboardId);
  if (dashboardId) last.current = dashboardId;
  const shownId = dashboardId ?? last.current;
  const { state } = useSuite();
  const { go } = useNav();
  const d = state.dashboards.find((x) => x.id === shownId) ?? null;
  const inSpaces = d ? spacesWith(state, d.id) : [];

  return (
    <Dialog id="ds-dashboard-info" open={open && !!d} onClose={onClose} closeOnOutsideClick>
      <DialogHeader
        id="ds-dashboard-info-header"
        title="Dashboard Information"
        description="What this dashboard covers, and where its numbers come from."
        onClose={onClose}
      />
      {d && (
        <DialogBody>
          <div className="ds-boards-info-head">
            <DashboardThumb dashboard={d} size="row" />
            <div>
              <p className="ds-boards-info-name">{d.name}</p>
              <p className="ds-muted">{d.description}</p>
            </div>
          </div>
          <dl className="ds-fields">
            <dt>Owner</dt>
            <dd>{d.owner}</dd>
            <dt>Data source</dt>
            <dd>
              {d.source} · {d.category.toUpperCase()}_MART
            </dd>
            <dt>Category</dt>
            <dd>{d.category}</dd>
            <dt>Refreshed</dt>
            <dd>Last updated {updatedLabel(d)}</dd>
            <dt>Access</dt>
            <dd>{d.hasAccess ? 'Anyone in DART Central' : `Restricted — request it from ${d.owner}`}</dd>
            <dt>In your spaces</dt>
            <dd>{inSpaces.length ? inSpaces.map((s) => s.name).join(', ') : 'Not in any of your spaces yet'}</dd>
            {d.tags.length > 0 && (
              <>
                <dt>Tags</dt>
                <dd>
                  {d.tags.map((t) => (
                    <Badge key={t} id={`ds-dashboard-info-tag-${t}`} label={t} color="info" appearance="soft" />
                  ))}
                </dd>
              </>
            )}
          </dl>
        </DialogBody>
      )}
      <DialogFooter>
        <Button id="ds-dashboard-info-share" style="outline" label="Share" IconLeft={Share2} onClick={() => d && copyDashboardLink(d)} />
        <Button
          id="ds-dashboard-info-open"
          label="View dashboard"
          IconLeft={ExternalLink}
          onClick={() => {
            if (!d) return;
            onClose();
            go({ page: 'dashboard', id: d.id });
          }}
        />
      </DialogFooter>
    </Dialog>
  );
}
