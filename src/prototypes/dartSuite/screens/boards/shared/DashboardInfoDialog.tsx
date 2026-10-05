/* Dashboard information — Browse B2.1/B2.2, Pattern/DashboardInfo.
   Opened from a Browse card or row ("View dashboard details") and from a
   space. Share lives HERE, not on the card or row: it copies the link and
   confirms with a toast. */

import { useRef } from 'react';
import { ExternalLink, Pencil, Share2 } from 'lucide-react';
import { toast } from '../../../../../components/Toast';
import { CONTROLS, irmFor } from '../../../irm';
import Badge from '../../../../../components/Badge';
import Button from '../../../../../components/Button';
import Dialog, { DialogBody, DialogFooter, DialogHeader } from '../../../../../components/Dialog';
import Text from '../../../../../components/Text';
import DescriptionList, { DescriptionListItem } from '../../../../../components/DescriptionList';
import { useNav } from '../../../nav';
import { useSuite } from '../../../store';
import { DashboardThumb, copyDashboardLink, spacesWith, updatedLabel } from './boardsShared';

export function DashboardInfoDialog({ open, dashboardId, onClose }: { open: boolean; dashboardId: string | null; onClose: () => void }) {
  // Keep the last dashboard through the exit animation, after the overlay clears its id.
  const last = useRef(dashboardId);
  if (dashboardId) last.current = dashboardId;
  const shownId = dashboardId ?? last.current;
  const { state } = useSuite();
  const { go, open: openTab } = useNav();
  const d = state.dashboards.find((x) => x.id === shownId) ?? null;
  const inSpaces = d ? spacesWith(state, d.id) : [];
  const irm = d ? irmFor(d) : null;

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
              <Text size="base" weight="semibold" className="ds-boards-info-name">{d.name}</Text>
              <Text tone="muted">{d.description}</Text>
            </div>
          </div>
          {/* Two halves, two owners. The listing is DartBoards' — changed by a request in
              DART Central. The report is IRM's — changed only in IRM. One button each,
              so the split is learned by using it rather than by reading about it. */}
          <section className="ds-boards-info-part" aria-labelledby="ds-dashboard-info-listing">
            <div className="ds-boards-info-part__head">
              <h3 id="ds-dashboard-info-listing" className="ds-boards-info-part__title">
                Listing in DartBoards
              </h3>
              <Button
                id="ds-dashboard-info-edit-listing"
                style="link"
                size="sm"
                label="Edit listing"
                IconLeft={Pencil}
                onClick={() => {
                  if (!d) return;
                  onClose();
                  openTab({ page: 'request-form', kind: 'dashboard', mode: 'edit', dashboardId: d.id });
                }}
              />
            </div>
            <DescriptionList>
              <DescriptionListItem term="Category">{d.category}</DescriptionListItem>
              <DescriptionListItem term="Refreshed">Last updated {updatedLabel(d)}</DescriptionListItem>
              <DescriptionListItem term="In your spaces">{inSpaces.length ? inSpaces.map((s) => s.name).join(', ') : 'Not in any of your spaces yet'}</DescriptionListItem>
              {d.tags.length > 0 && (
                <>
                  <DescriptionListItem term="Tags">
                    {d.tags.map((t) => (
                      <Badge key={t} id={`ds-dashboard-info-tag-${t}`} label={t} color="info" appearance="soft" />
                    ))}
                  </DescriptionListItem>
                </>
              )}
            </DescriptionList>
          </section>

          {irm && (
            <section className="ds-boards-info-part" aria-labelledby="ds-dashboard-info-report">
              <div className="ds-boards-info-part__head">
                <h3 id="ds-dashboard-info-report" className="ds-boards-info-part__title">
                  Report · managed in IRM
                </h3>
                <Button
                  id="ds-dashboard-info-open-irm"
                  style="link"
                  size="sm"
                  label="Open IRM record"
                  IconRight={ExternalLink}
                  aria-label={`Open ${irm.number} in IRM (opens in a new tab)`}
                  onClick={() => toast(`Opening ${irm.number} in IRM`, { description: 'IRM opens in a new tab. Data, access and controls are changed there.' })}
                />
              </div>
              <DescriptionList>
                <DescriptionListItem term="IRM record">{irm.number}</DescriptionListItem>
                <DescriptionListItem term="Business owner">{irm.businessOwner}</DescriptionListItem>
                <DescriptionListItem term="Developer">{irm.developer}</DescriptionListItem>
                <DescriptionListItem term="Data source">
                  {d.source} · {d.category.toUpperCase()}_MART
                </DescriptionListItem>
                <DescriptionListItem term="Access">{d.hasAccess ? `Open · ${irm.accessGroup}` : `Restricted · granted in IRM (${irm.accessGroup})`}</DescriptionListItem>
                <DescriptionListItem term="Controls">
                  <Badge id="ds-dashboard-info-controls" label={CONTROLS[irm.controls].label} color={CONTROLS[irm.controls].color} appearance="soft" />
                </DescriptionListItem>
              </DescriptionList>
            </section>
          )}
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
