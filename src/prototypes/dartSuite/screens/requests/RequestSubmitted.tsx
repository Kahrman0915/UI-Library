/* R7.1 Request submitted (Dashboard, Banner, General) and R7.1a the feature
   request variant. No breadcrumb on a confirmation (③). */

import { ArrowRight, CircleCheck, FileQuestion, Info } from 'lucide-react';
import Alert from '../../../../components/Alert';
import Badge from '../../../../components/Badge';
import Button from '../../../../components/Button';
import Card from '../../../../components/Card';
import Empty, { EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '../../../../components/Empty';
import FeaturedIcon from '../../../../components/FeaturedIcon';
import PageContainer from '../../../../components/PageContainer';
import PageHeader from '../../../../components/PageHeader';
import { useNav } from '../../nav';
import { toneBadge, typeLabel, useSuite } from '../../store';
import type { Request } from '../../types';
import { statusFor } from './shared';

/** The row that names what was requested, per type. */
const subject = (r: Request): [string, string] => {
  if (r.type.startsWith('dashboard')) {
    const name = r.fields.find((f) => f.label === 'Dashboard' || f.label === 'Dashboard name')?.value;
    return ['Dashboard', name ?? r.title];
  }
  if (r.type === 'banner' || r.type === 'banner-edit') return ['Banner', r.title];
  if (r.type === 'feature') return ['Feature', r.title];
  return ['Topic', r.title];
};

export function RequestSubmitted({ id }: { id: string }) {
  const { state } = useSuite();
  const { go } = useNav();
  const r = state.requests.find((x) => x.id === id);

  if (!r) {
    return (
      <PageContainer width="form">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileQuestion />
            </EmptyMedia>
            <EmptyTitle>Request not found</EmptyTitle>
            <EmptyDescription>{id} could not be found.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button id="ds-reqs-missing" label="View my requests" onClick={() => go({ page: 'my-requests' })} />
          </EmptyContent>
        </Empty>
      </PageContainer>
    );
  }

  const feature = r.type === 'feature';
  const s = statusFor(r);
  const [subjectLabel, subjectValue] = subject(r);
  const time = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  return (
    <PageContainer width="form">
      <PageHeader
        id="ds-reqs-header"
        visual={<FeaturedIcon Icon={CircleCheck} color="success" />}
        title="Request submitted"
        description={`Reference ${r.id}`}
      />
      <Card id="ds-reqs-card">
        <div className="ds-requests-panel">
          <dl className="ds-fields">
            <dt>Request type</dt>
            <dd>{typeLabel[r.type]}</dd>
            <dt>{subjectLabel}</dt>
            <dd>{subjectValue}</dd>
            <dt>Submitted</dt>
            <dd>
              {r.submittedAt}, {time}
            </dd>
            <dt>Status</dt>
            <dd>
              <Badge id="ds-reqs-status" label={s.label} {...toneBadge(s.tone === 'neutral' ? 'warning' : s.tone)} />
            </dd>
          </dl>
          <Alert
            id="ds-reqs-where"
            variant="info"
            style="outline"
            Icon={Info}
            title={feature ? 'Reviewed first, then published if approved' : 'Everything about this request lives on My requests'}
            description={
              feature
                ? 'Track it on My requests like any other request. If it is approved it is published to the public feature backlog, where everyone can see it, upvote and follow progress, and the link appears in your thread. You won’t get an email; My requests is the only place updates appear.'
                : 'Track progress, answer questions from the admin team and see the decision there. You won’t get an email; this is the only place updates appear.'
            }
          />
        </div>
      </Card>
      <div className="ds-requests-form__footer ds-requests-form__footer--end">
        <Button id="ds-reqs-another" style="ghost" label="Submit another request" onClick={() => go({ page: 'new-request' })} />
        <Button id="ds-reqs-view" label="View my requests" IconRight={ArrowRight} onClick={() => go({ page: 'my-requests' })} />
      </div>
    </PageContainer>
  );
}
