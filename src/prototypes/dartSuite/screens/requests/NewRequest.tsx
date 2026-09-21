/* R2.1 New Request · chooser — four option cards, each into its branch. */

import { Bell, ChevronRight, LayoutGrid, Lightbulb, MessageSquare } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Button from '../../../../components/Button';
import Card, { CardDescription, CardTitle } from '../../../../components/Card';
import FeaturedIcon from '../../../../components/FeaturedIcon';
import type { FeaturedIconColor } from '../../../../components/FeaturedIcon/FeaturedIcon.types';
import PageContainer from '../../../../components/PageContainer';
import PageHeader from '../../../../components/PageHeader';
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
  { kind: 'dashboard', title: 'Dashboard', description: 'Add, edit, promote, or remove a dashboard in the Dartboards library.', Icon: LayoutGrid, color: 'info' },
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
        description="What would you like to submit to the DART Central admin team?"
      />
      <div className="ds-requests-chooser">
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
      </div>
    </PageContainer>
  );
}
