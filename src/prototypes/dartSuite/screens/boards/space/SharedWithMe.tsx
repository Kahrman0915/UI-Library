/* DartBoards · Shared with me — spaces other people shared with you. No Figma
   frame; built from the same cards as the space landing (S1.1) so it reads as
   the same product. Opening one goes to that space. */

import { ArrowRight, LayoutGrid, UsersRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import Button from '../../../../../components/Button';
import Card, { CardActions, CardBody, CardHeader } from '../../../../../components/Card';
import Empty, { EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '../../../../../components/Empty';
import FeaturedIcon from '../../../../../components/FeaturedIcon';
import PageContainer from '../../../../../components/PageContainer';
import PageHeader from '../../../../../components/PageHeader';
import { useNav } from '../../../nav';
import { useSuite } from '../../../store';
import { SpaceCardSkeleton } from './SpaceCards';
import './Space.scss';

export function SharedWithMe() {
  const { state } = useSuite();
  const { go } = useNav();
  const shared = state.spaces.filter((s) => s.shared);

  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 600);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <PageContainer>
      <PageHeader
        id="ds-shared-header"
        title="Shared with me"
        description="Spaces your teammates shared with you. They stay up to date as the owner changes them."
        showDivider
      />
      {loading ? (
        <div className="ds-space-grid ds-space-grid--auto" aria-busy="true" aria-label="Loading spaces">
          {[0, 1, 2].map((i) => (
            <SpaceCardSkeleton key={i} id={`ds-shared-skeleton-${i}`} layout="card" />
          ))}
        </div>
      ) : shared.length ? (
        <div className="ds-space-grid ds-space-grid--auto">
          {shared.map((s) => {
            const n = s.items.length;
            return (
              <Card key={s.id} id={`ds-shared-${s.id}`} className="ds-space-card">
                <CardHeader
                  id={`ds-shared-${s.id}-header`}
                  title={s.name}
                  description={s.description}
                  media={<FeaturedIcon Icon={LayoutGrid} size="sm" color={s.hue} />}
                />
                <CardBody>
                  <p className="ds-muted">
                    {n} {n === 1 ? 'dashboard' : 'dashboards'} · shared with you
                  </p>
                  <CardActions>
                    <Button
                      id={`ds-shared-${s.id}-open`}
                      style="link"
                      size="sm"
                      label="Open space"
                      IconRight={ArrowRight}
                      aria-label={`Open space: ${s.name}`}
                      onClick={() => go({ page: 'space', id: s.id })}
                    />
                  </CardActions>
                </CardBody>
              </Card>
            );
          })}
        </div>
      ) : (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <UsersRound />
            </EmptyMedia>
            <EmptyTitle>Nothing shared with you yet</EmptyTitle>
            <EmptyDescription>When a teammate shares a space with you, it appears here.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button id="ds-shared-empty-new" style="outline" label="Create your own space" onClick={() => go({ page: 'builder' })} />
          </EmptyContent>
        </Empty>
      )}
    </PageContainer>
  );
}
