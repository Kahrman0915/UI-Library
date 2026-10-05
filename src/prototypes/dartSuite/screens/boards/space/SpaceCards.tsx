/* Pattern/SpaceCard (compact, `layout: 'card'`) and Pattern/SpaceThumbnailCard
   (`layout: 'thumbnail'`). The Builder renders these same cards on its canvas —
   "the canvas IS the space" (Builder ① START HERE) — so they live here once. */

import { ArrowRight, ChartLine, ExternalLink, FileText, ImageIcon, LayoutDashboard, Lock, Workflow } from 'lucide-react';
import type { ReactNode } from 'react';
import Button from '../../../../../components/Button';
import Card, { CardActions, CardBody, CardHeader } from '../../../../../components/Card';
import FeaturedIcon from '../../../../../components/FeaturedIcon';
import Skeleton from '../../../../../components/Skeleton';
import type { Asset, AssetKind, Dashboard, SpaceCardLayout } from '../../../types';
import { openAriaLabel, openLabel, useOpenExternal } from '../external/externalShared';
import './Space.scss';

export type SpaceCardProps = {
  id: string;
  dashboard: Dashboard;
  layout: SpaceCardLayout;
  /** The ••• (space page) — left empty on the Builder canvas, where CanvasItem owns the menu. */
  action?: ReactNode;
  onOpen: () => void;
};

/** A short description — the first clause, like the Figma cards. */
const shortDescription = (d: Dashboard) => d.description.split(/,| — /)[0].replace(/\.$/, '');

export function SpaceCard({ id, dashboard, layout, action, onOpen }: SpaceCardProps) {
  const openExternal = useOpenExternal();

  // An external chart in a space is a LINK card — never drawn as if it were live.
  if (dashboard.external) {
    return (
      <Card id={id} className="ds-space-card">
        <CardHeader
          id={`${id}-header`}
          title={dashboard.name}
          description={`Chart in ${dashboard.source} · opens in a new tab`}
          media={<FeaturedIcon Icon={ExternalLink} size="sm" />}
          action={action}
        />
        <CardBody>
          <CardActions>
            <Button
              id={`${id}-leave`}
              style="link"
              size="sm"
              label={openLabel(dashboard)}
              IconRight={ExternalLink}
              aria-label={openAriaLabel(dashboard)}
              disabled={!dashboard.hasAccess}
              onClick={() => openExternal(dashboard)}
            />
            <Button id={`${id}-details`} style="link" size="sm" label="Details" onClick={onOpen} />
          </CardActions>
        </CardBody>
      </Card>
    );
  }

  const go = (
    <CardActions>
      <Button
        id={`${id}-go`}
        style="link"
        size="sm"
        label="Go to dashboard"
        IconRight={ArrowRight}
        aria-label={`Go to dashboard: ${dashboard.name}`}
        onClick={onOpen}
      />
    </CardActions>
  );

  if (layout === 'thumbnail') {
    return (
      <Card id={id} className="ds-space-card ds-space-card--thumbnail">
        <CardHeader
          id={`${id}-header`}
          title={dashboard.name}
          description={shortDescription(dashboard)}
          action={action}
          showDivider={false}
        />
        <CardBody>
          <div className="ds-space-thumb" data-hue={dashboard.hue} aria-hidden="true">
            {dashboard.hasAccess ? <ImageIcon /> : <Lock />}
          </div>
          {go}
        </CardBody>
      </Card>
    );
  }

  return (
    <Card id={id} className="ds-space-card">
      <CardHeader
        id={`${id}-header`}
        title={dashboard.name}
        description={shortDescription(dashboard)}
        media={<FeaturedIcon Icon={dashboard.hasAccess ? LayoutDashboard : Lock} size="sm" appearance="solid" />}
        action={action}
      />
      <CardBody>{go}</CardBody>
    </Card>
  );
}

/** S1.4 / BL2.4 — a card on the real grid geometry, shimmering. */
export function SpaceCardSkeleton({ id, layout }: { id: string; layout: SpaceCardLayout }) {
  return (
    <Card id={id} className={`ds-space-card${layout === 'thumbnail' ? ' ds-space-card--thumbnail' : ''}`} aria-hidden="true">
      <CardBody>
        <Skeleton shape="text" width="60%" />
        <Skeleton shape="text" width="85%" />
        {layout === 'thumbnail' && <div className="ds-space-thumb ds-space-thumb--skeleton"><Skeleton width="100%" height="100%" /></div>}
        <Skeleton shape="text" width="35%" />
      </CardBody>
    </Card>
  );
}

/* ── A metric, workflow or report in a space ───────────────────────────────
   The same Card the dashboard tiles use, so a space reads as one surface: the
   kind's glyph, the name, and the one line worth seeing at a glance (a value,
   an open count, a cadence). */

export const ASSET_META: Record<AssetKind, { label: string; open: string; Icon: typeof LayoutDashboard; color: 'success' | 'teal' | 'error' }> = {
  metric: { label: 'Metric', open: 'Open metric', Icon: ChartLine, color: 'success' },
  workflow: { label: 'Workflow', open: 'Open workflow', Icon: Workflow, color: 'teal' },
  report: { label: 'Report', open: 'Open report', Icon: FileText, color: 'error' },
};

export function AssetCard({ id, asset, action, onOpen }: { id: string; asset: Asset; action?: ReactNode; onOpen: () => void }) {
  const m = ASSET_META[asset.kind];
  return (
    <Card id={id} className="ds-space-card ds-space-card--asset">
      <CardHeader
        id={`${id}-header`}
        title={asset.name}
        description={shortAsset(asset)}
        media={<FeaturedIcon Icon={m.Icon} size="sm" color={m.color} />}
        action={action}
      />
      <CardBody>
        <p className="ds-space-glance">{asset.glance}</p>
        <CardActions>
          <Button id={`${id}-go`} style="link" size="sm" label={m.open} IconRight={ArrowRight} aria-label={`${m.open}: ${asset.name}`} onClick={onOpen} />
        </CardActions>
      </CardBody>
    </Card>
  );
}

const shortAsset = (a: Asset) => `${ASSET_META[a.kind].label} · ${a.source}`;
