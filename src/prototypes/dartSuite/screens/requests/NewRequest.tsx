/* R2.1 New Request · chooser — four option cards, each into its branch. */

import { Bell, ChevronRight, ExternalLink, LayoutGrid, Lightbulb, MessageSquare } from 'lucide-react';
import Alert from '../../../../components/Alert';
import { toast } from '../../../../components/Toast';
import type { LucideIcon } from 'lucide-react';
import Button from '../../../../components/Button';
import Card, { CardDescription, CardTitle } from '../../../../components/Card';
import FeaturedIcon from '../../../../components/FeaturedIcon';
import type { FeaturedIconColor } from '../../../../components/FeaturedIcon/FeaturedIcon.types';
import PageContainer from '../../../../components/PageContainer';
import PageHeader from '../../../../components/PageHeader';
import Grid from '../../../../components/Grid';
import { useNav } from '../../nav';
import type { RequestKind } from '../../types';
import { Crumbs, MY_REQUESTS } from './shared';

const OPTIONS: { kind: RequestKind; title: string; description: string; Icon: LucideIcon; color: FeaturedIconColor }[] = [
  {
    kind: 'banner',
    title: 'Banner / Notice',
    description: 'Post an alert or informational notice on a dashboard, an application, or across the whole platform.',
    Icon: Bell,
    color: 'warning',
  },
  {
    kind: 'dashboard',
    title: 'Dashboard in DartBoards',
    description: 'Publish a finished dashboard to DartBoards, change its title or description in Browse, promote it, or unpublish it.',
    Icon: LayoutGrid,
    color: 'info',
  },
  {
    kind: 'general',
    title: 'General Request',
    description: 'Ask a question or submit a general request to the DART Central admin team.',
    Icon: MessageSquare,
    color: 'default',
  },
  {
    kind: 'feature',
    title: 'Feature Request',
    description: 'Suggest a new feature or improvement. Reviewed by the admin team, then published to the public feature backlog.',
    Icon: Lightbulb,
    color: 'violet',
  },
];

export function NewRequest() {
  const { go } = useNav();
  return (
    <PageContainer width="form">
      <PageHeader
        id="ds-newreq-header"
        overline={<Crumbs trail={[MY_REQUESTS, { label: 'New request' }]} />}
        title="New Request"
        description="Requests about DART Central and about how dashboards appear in DartBoards."
      />
      <Grid level={3} minItemWidth="var(--w-64)" stretch>
        {OPTIONS.map((o) => {
          const pick = () => go(o.kind === 'dashboard' ? { page: 'request-form', kind: 'dashboard', mode: 'add' } : { page: 'request-form', kind: o.kind });
          return (
            <Card
              id={`ds-newreq-${o.kind}`}
              key={o.kind}
              interactive
              role="link"
              tabIndex={0}
              aria-label={o.title}
              onClick={pick}
              onKeyDown={(e) => e.key === 'Enter' && pick()}
            >
              <div className="ds-requests-option">
                <FeaturedIcon Icon={o.Icon} color={o.color} />
                <div>
                  <CardTitle>{o.title}</CardTitle>
                  <CardDescription>{o.description}</CardDescription>
                </div>
                <div className="ds-requests-option__action" onClick={(e) => e.stopPropagation()}>
                  <Button id={`ds-newreq-${o.kind}-select`} style="link" size="sm" label="Select" IconRight={ChevronRight} tabIndex={-1} onClick={pick} />
                </div>
              </div>
            </Card>
          );
        })}
      </Grid>
      {/* Not a fifth option — a way out for the most common wrong turn. Reports are built and controlled in IRM. */}
      <Alert
        id="ds-newreq-irm"
        variant="info"
        title="Need a new report, or a change to its data, visuals, access or controls?"
        description="Reports are built and controlled in IRM. Come back here once yours is finished, to publish it to DartBoards."
        action={
          <Button
            id="ds-newreq-irm-go"
            size="sm"
            style="outline"
            label="Open IRM"
            IconRight={ExternalLink}
            aria-label="Open IRM (opens in a new tab)"
            onClick={() => toast('Opening IRM', { description: 'IRM opens in a new tab.' })}
          />
        }
      />
    </PageContainer>
  );
}
