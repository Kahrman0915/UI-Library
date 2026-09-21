/* Pattern/SpaceCard (compact, `layout: 'card'`) and Pattern/SpaceThumbnailCard
   (`layout: 'thumbnail'`). The Builder renders these same cards on its canvas —
   "the canvas IS the space" (Builder ① START HERE) — so they live here once. */

import { ArrowRight, ImageIcon, LayoutDashboard, Lock } from 'lucide-react';
import type { ReactNode } from 'react';
import Button from '../../../../../components/Button';
import Card, { CardActions, CardBody, CardHeader } from '../../../../../components/Card';
import FeaturedIcon from '../../../../../components/FeaturedIcon';
import Skeleton from '../../../../../components/Skeleton';
import type { Dashboard, SpaceCardLayout } from '../../../types';
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
