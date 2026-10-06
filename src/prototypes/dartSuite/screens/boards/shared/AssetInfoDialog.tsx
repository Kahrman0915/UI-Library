/* Metric information — what "View metric details" opens from Marketplace ›
   Metrics, the same dialog shape as Dashboard Information so the two read as one
   system: what it measures and where its numbers come from, then Share and View. */

import { useRef } from 'react';
import { ArrowRight, Share2 } from 'lucide-react';
import Badge from '../../../../../components/Badge';
import Button from '../../../../../components/Button';
import Dialog, { DialogBody, DialogFooter, DialogHeader } from '../../../../../components/Dialog';
import { toast } from '../../../../../components/Toast';
import Text from '../../../../../components/Text';
import DescriptionList, { DescriptionListItem } from '../../../../../components/DescriptionList';
import { useNav } from '../../../nav';
import { useSuite } from '../../../store';

const GRAIN = { day: 'Daily', week: 'Weekly', month: 'Monthly' } as const;
const BY = { org: 'Org', region: 'Region', product: 'Product' } as const;

export function AssetInfoDialog({ open, assetId, onClose }: { open: boolean; assetId: string | null; onClose: () => void }) {
  // Keep the last metric through the exit animation, after the overlay clears its id.
  const last = useRef(assetId);
  if (assetId) last.current = assetId;
  const { state } = useSuite();
  const { go } = useNav();
  const a = state.assets.find((x) => x.id === (assetId ?? last.current)) ?? null;
  const inSpaces = a ? state.spaces.filter((s) => !s.shared && s.items.some((i) => i.assetId === a.id)) : [];

  const share = () => {
    if (!a) return;
    try {
      void navigator.clipboard?.writeText(`https://dartcentral.example.com/boards/metrics/${a.id}`);
    } catch {
      /* clipboard blocked */
    }
    toast.success('Link copied', { description: `Anyone with access can open ${a.name}.` });
  };

  return (
    <Dialog id="ds-asset-info" open={open && !!a} onClose={onClose} closeOnOutsideClick>
      <DialogHeader id="ds-asset-info-header" title="Metric Information" description="What this metric measures, and where its numbers come from." onClose={onClose} />
      {a && (
        <DialogBody>
          <div className="ds-boards-info-head">
            <div>
              <Text size="base" weight="semibold" className="ds-boards-info-name">{a.name}</Text>
              <Text tone="muted">{a.description}</Text>
            </div>
          </div>
          <DescriptionList>
            <DescriptionListItem term="Latest">{a.glance}</DescriptionListItem>
            <DescriptionListItem term="Owner">{a.owner}</DescriptionListItem>
            <DescriptionListItem term="Data source">{a.source}</DescriptionListItem>
            <DescriptionListItem term="Subject">{a.subject}</DescriptionListItem>
            {a.metric && (
              <>
                <DescriptionListItem term="Grain">{a.metric.grains.map((g) => GRAIN[g]).join(', ')}</DescriptionListItem>
                <DescriptionListItem term="Break down by">{a.metric.breakdowns.map((b) => BY[b]).join(', ')}</DescriptionListItem>
                <DescriptionListItem term="Certification">
                  <Badge
                    id="ds-asset-info-cert"
                    label={a.metric.certified ? 'Certified' : 'Not certified'}
                    color={a.metric.certified ? 'success' : 'default'}
                    appearance="soft"
                  />
                </DescriptionListItem>
              </>
            )}
            <DescriptionListItem term="Refreshed">Last updated {a.updatedAt}</DescriptionListItem>
            <DescriptionListItem term="In your spaces">{inSpaces.length ? inSpaces.map((s) => s.name).join(', ') : 'Not in any of your spaces yet'}</DescriptionListItem>
          </DescriptionList>
        </DialogBody>
      )}
      <DialogFooter>
        <Button id="ds-asset-info-share" style="outline" label="Share" IconLeft={Share2} onClick={share} />
        <Button
          id="ds-asset-info-open"
          label="View metric"
          IconRight={ArrowRight}
          onClick={() => {
            if (!a) return;
            onClose();
            go({ page: 'metric', id: a.id });
          }}
        />
      </DialogFooter>
    </Dialog>
  );
}
