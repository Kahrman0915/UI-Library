/* Browse · one dashboard as a card (grid, Pattern/BrowseCard) or a row (rows,
   Pattern/BrowseRow), plus their loading skeletons.

   B1.4 card states:
   - resting / hover — the card lifts (Card `interactive`)
   - Add to space unavailable — ONLY when every one of your spaces already
     holds it (the dialog would have nothing left to tick)
   - already in a space — an "In N spaces" badge, informational only

   The whole card opens the dashboard; the title is the keyboard route. The
   two actions stop the click so they do not also open it. */

import { Clock, ExternalLink, Eye, Layers } from 'lucide-react';
import type { MouseEvent } from 'react';
import Badge from '../../../../../components/Badge';
import Button from '../../../../../components/Button';
import Card, { CardBody, CardDescription, CardMedia, CardTitle } from '../../../../../components/Card';
import Item, { ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '../../../../../components/Item';
import Skeleton from '../../../../../components/Skeleton';
import { useNav } from '../../../nav';
import { useSuite } from '../../../store';
import type { Dashboard } from '../../../types';
import { useUi } from '../../../ui';
import { DashboardThumb, KindLabel, addUnavailable, spacesWith, updatedLabel } from '../shared/boardsShared';
import { suitesWith } from '../suite/suiteShared';
import { ExternalTag, openAriaLabel, openLabel, useOpenExternal } from '../external/externalShared';

const stop = (fn: () => void) => (e?: MouseEvent) => {
  e?.stopPropagation();
  fn();
};

function useCardModel(d: Dashboard) {
  const { state } = useSuite();
  const { go } = useNav();
  const ui = useUi();
  const inSpaces = spacesWith(state, d.id).length;
  const unavailable = addUnavailable(state, d.id);
  const openExternal = useOpenExternal();
  return {
    inSpaces,
    unavailable,
    // An external chart: the card goes to its DartBoards details page (open, below);
    // only the explicit "Open in Tableau" button leaves.
    external: !!d.external,
    leave: () => openExternal(d),
    open: () => go({ page: 'dashboard', id: d.id }),
    add: () => ui.openAddToSpace(d.id),
    info: () => ui.openDashboardInfo(d.id),
  };
}

function Meta({ d }: { d: Dashboard }) {
  return (
    <span className="ds-browse-meta">
      <span className="ds-browse-meta__item">
        <Clock aria-hidden="true" />
        {updatedLabel(d)}
      </span>
      <span className="ds-browse-meta__item">
        <Eye aria-hidden="true" />
        {d.views.toLocaleString('en-US')} views
      </span>
    </span>
  );
}

function Flags({ d, inSpaces }: { d: Dashboard; inSpaces: number }) {
  return (
    <>
      {d.external ? (
        <ExternalTag d={d} className="ds-browse-flag ds-browse-flag--start ds-ext-tag" />
      ) : d.tags.includes('New') && (
        <Badge id={`ds-browse-new-${d.id}`} className="ds-browse-flag ds-browse-flag--start" label="New" color="info" appearance="solid" />
      )}
      {inSpaces > 0 && (
        <Badge
          id={`ds-browse-in-${d.id}`}
          className="ds-browse-flag ds-browse-flag--end"
          label={`In ${inSpaces} ${inSpaces === 1 ? 'space' : 'spaces'}`}
          color="info"
          appearance="soft"
        />
      )}
    </>
  );
}

/** The suite a dashboard is curated into — a way from the open library into its team's view. */
function SuiteTag({ d }: { d: Dashboard }) {
  const { state } = useSuite();
  const { go } = useNav();
  const [suite] = suitesWith(state, d.id);
  if (!suite) return null;
  return (
    <span onClick={(e) => e.stopPropagation()}>
      <Button
        id={`ds-browse-suite-${d.id}`}
        style="link"
        size="xs"
        className="ds-suite-tag"
        IconLeft={Layers}
        label={suite.name}
        aria-label={`Open the ${suite.name} suite`}
        onClick={() => go({ page: 'browse', suite: suite.id })}
      />
    </span>
  );
}

/** `inSuite` — already inside a suite's view, so the card does not name the suite again. */
/** `showKind` — on a list that mixes kinds (Marketplace › All), say this is a dashboard. */
export function BrowseCard({ d, inSuite = false, showKind = false }: { d: Dashboard; inSuite?: boolean; showKind?: boolean }) {
  const m = useCardModel(d);
  return (
    <Card id={`ds-browse-card-${d.id}`} interactive className="ds-browse-card" onClick={m.open}>
      <CardMedia ratio={8 / 3} overlay={<Flags d={d} inSpaces={m.inSpaces} />}>
        <DashboardThumb dashboard={d} />
      </CardMedia>
      <CardBody>
        <div className="ds-browse-card__text">
          {showKind && <KindLabel kind="dashboard" />}
          {!inSuite && <SuiteTag d={d} />}
          <CardTitle>
            <Button id={`ds-browse-title-${d.id}`} style="link" className="ds-browse-title-link" label={d.name} onClick={stop(m.open)} />
          </CardTitle>
          <CardDescription>{d.description}</CardDescription>
        </div>
        <Meta d={d} />
        <div className="ds-browse-card__actions" onClick={(e) => e.stopPropagation()}>
          {m.external ? (
            <>
              <Button
                id={`ds-browse-leave-${d.id}`}
                style="outline"
                label={openLabel(d)}
                IconRight={ExternalLink}
                aria-label={openAriaLabel(d)}
                disabled={!d.hasAccess}
                onClick={m.leave}
              />
              <Button id={`ds-browse-info-${d.id}`} style="link" size="sm" label="View details" onClick={m.open} />
            </>
          ) : (
            <>
              <Button
                id={`ds-browse-add-${d.id}`}
                label="Add to space"
                disabled={m.unavailable}
                title={m.unavailable ? 'Already in every one of your spaces' : undefined}
                onClick={() => m.add()}
              />
              <Button
                id={`ds-browse-info-${d.id}`}
                style="link"
                size="sm"
                label="View dashboard details"
                onClick={() => m.info()}
              />
            </>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

export function BrowseRow({ d }: { d: Dashboard }) {
  const m = useCardModel(d);
  return (
    <div className="ds-browse-row" onClick={m.open}>
      <Item variant="outline">
        <ItemMedia>
          <div className="ds-browse-row__thumb">
            <DashboardThumb dashboard={d} size="row" />
            <Flags d={d} inSpaces={0} />
          </div>
        </ItemMedia>
        <ItemContent>
          <ItemTitle>
            <Button id={`ds-browse-row-title-${d.id}`} style="link" className="ds-browse-title-link" label={d.name} onClick={stop(m.open)} />
            {m.inSpaces > 0 && (
              <Badge
                id={`ds-browse-row-in-${d.id}`}
                label={`In ${m.inSpaces} ${m.inSpaces === 1 ? 'space' : 'spaces'}`}
                color="info"
                appearance="soft"
              />
            )}
          </ItemTitle>
          <ItemDescription>{d.description}</ItemDescription>
          <Meta d={d} />
        </ItemContent>
        <ItemActions className="ds-browse-row__actions" onClick={(e) => e.stopPropagation()}>
          {m.external ? (
            <>
              <Button
                id={`ds-browse-row-leave-${d.id}`}
                size="sm"
                style="outline"
                label={openLabel(d)}
                IconRight={ExternalLink}
                aria-label={openAriaLabel(d)}
                disabled={!d.hasAccess}
                onClick={m.leave}
              />
              <Button id={`ds-browse-row-info-${d.id}`} style="link" size="sm" label="View details" onClick={m.open} />
            </>
          ) : (
            <>
              <Button
                id={`ds-browse-row-add-${d.id}`}
                size="sm"
                label="Add to space"
                disabled={m.unavailable}
                title={m.unavailable ? 'Already in every one of your spaces' : undefined}
                onClick={() => m.add()}
              />
              <Button
                id={`ds-browse-row-info-${d.id}`}
                style="link"
                size="sm"
                label="View dashboard details"
                onClick={() => m.info()}
              />
            </>
          )}
        </ItemActions>
      </Item>
    </div>
  );
}

export function BrowseCardSkeleton({ index }: { index: number }) {
  return (
    <Card id={`ds-browse-skeleton-${index}`} className="ds-browse-skeleton-card" aria-hidden="true">
      <CardMedia ratio={8 / 3}>
        <Skeleton className="ds-browse-skeleton-card__cover" />
      </CardMedia>
      <CardBody>
        <Skeleton shape="text" width="60%" />
        <Skeleton shape="text" />
        <Skeleton shape="text" width="80%" />
        <Skeleton height="var(--h-9)" />
      </CardBody>
    </Card>
  );
}

export function BrowseRowSkeleton() {
  return (
    <Item variant="outline" className="ds-browse-skeleton-row" aria-hidden="true">
      <ItemMedia>
        <Skeleton className="ds-browse-skeleton-row__thumb" />
      </ItemMedia>
      <ItemContent>
        <Skeleton shape="text" width="30%" />
        <Skeleton shape="text" width="70%" />
      </ItemContent>
      <ItemActions>
        <Skeleton width="var(--w-28)" height="var(--h-8)" />
      </ItemActions>
    </Item>
  );
}
